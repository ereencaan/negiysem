import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import {
  requestService,
  type OutfitRequestWithDetails,
} from '../../src/services/request.service';
import { messageService, type ChatMessage } from '../../src/services/message.service';
import { proposalService, type OutfitProposal } from '../../src/services/proposal.service';
import { reviewService } from '../../src/services/review.service';
import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { Image, Linking, Modal } from 'react-native';
import type { OutfitRequestStatus } from '../../src/types/database.types';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

function statusVariant(status: OutfitRequestStatus) {
  return status;
}

export default function RequestDetailScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [request, setRequest] = useState<OutfitRequestWithDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [proposals, setProposals] = useState<OutfitProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Rating state
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const isStylist = user?.id === request?.stylist_id;

  const loadAll = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    const [req, msgs, props] = await Promise.all([
      requestService.getRequestById(id),
      messageService.getMessages(id),
      proposalService.getProposalsForRequest(id),
    ]);
    setRequest(req);
    setMessages(msgs);
    setProposals(props);
    if (req && user && req.status === 'completed' && req.user_id === user.id) {
      const reviewed = await reviewService.hasUserReviewed(user.id, id);
      setHasReviewed(reviewed);
      if (!reviewed) setShowRating(true);
    }
    setIsLoading(false);
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  useEffect(() => {
    if (!id) return;

    const channel = supabase.channel(`messages-${id}-${Date.now()}`);
    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `request_id=eq.${id}` },
        () => {
          messageService.getMessages(id).then(setMessages);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const sendMessage = async () => {
    if (!user || !id || !input.trim()) return;
    setIsSending(true);
    const result = await messageService.sendMessage(id, user.id, input.trim());
    if (result.data) {
      setInput('');
      const msgs = await messageService.getMessages(id);
      setMessages(msgs);
    }
    setIsSending(false);
  };

  const submitReview = async () => {
    if (!user || !request || rating === 0) return;
    setIsSubmittingReview(true);
    const result = await reviewService.createReview({
      userId: user.id,
      stylistId: request.stylist_id,
      requestId: request.id,
      rating,
      comment: reviewComment.trim() || undefined,
    });
    setIsSubmittingReview(false);
    if (result.data) {
      setHasReviewed(true);
      setShowRating(false);
      Alert.alert(t('review.thank_you'));
    } else if (result.error === 'errors.already_reviewed') {
      setHasReviewed(true);
      setShowRating(false);
    } else {
      Alert.alert(t('errors.generic'));
    }
  };

  const isCompleted = request?.status === 'completed' || request?.status === 'cancelled';

  const updateStatus = async (newStatus: OutfitRequestStatus) => {
    if (!id) return;
    setIsUpdatingStatus(true);
    try {
      const result = await requestService.updateRequestStatus(id, newStatus);
      if (result.error) {
        Alert.alert(t('errors.generic'));
      } else {
        const updated = await requestService.getRequestById(id);
        if (updated) setRequest(updated);
      }
    } catch {
      Alert.alert(t('errors.generic'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>{t('requests.not_found')}</Text>
      </SafeAreaView>
    );
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderId === user?.id;
    return (
      <View style={[styles.messageRow, isMine ? styles.messageRowRight : styles.messageRowLeft]}>
        <View style={[styles.messageBubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.messageText, isMine && styles.messageTextMine]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  const partnerName = isStylist ? request.userName : request.stylistName;
  const partnerId = isStylist ? request.user_id : request.stylist_id;

  const goToPartner = () => {
    if (!isStylist && partnerId) {
      router.push(`/(tabs)/stylist-detail?id=${partnerId}`);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={goToPartner} disabled={isStylist}>
              <Text style={[styles.partnerName, !isStylist && styles.partnerLink]}>
                {partnerName || (isStylist ? 'Kullanıcı' : 'Stilist')}
              </Text>
            </Pressable>
            <Badge label={t(`outfits.status.${request.status}`)} variant={statusVariant(request.status)} />
          </View>
          {request.occasion && <Text style={styles.detailLine}>{t('stylists.occasion')}: {request.occasion}</Text>}
          {request.event_date && <Text style={styles.detailLine}>{t('stylists.event_date')}: {new Date(request.event_date).toLocaleDateString('tr-TR')}</Text>}
          {request.message && <Text style={styles.detailLine} numberOfLines={3}>{request.message}</Text>}

          {isStylist && request.status === 'pending' && (
            <View style={styles.actionsRow}>
              <Button
                title={t('requests.accept')}
                onPress={() => updateStatus('accepted')}
                isLoading={isUpdatingStatus}
              />
              <View style={{ height: spacing.xs }} />
              <Button
                title={t('requests.decline')}
                onPress={() => updateStatus('cancelled')}
                variant="secondary"
                isLoading={isUpdatingStatus}
              />
            </View>
          )}
          {isStylist && request.status === 'accepted' && (
            <View style={styles.actionsRow}>
              <Button
                title={t('requests.start_working')}
                onPress={() => updateStatus('in_progress')}
                isLoading={isUpdatingStatus}
              />
            </View>
          )}
          {isStylist && request.status === 'in_progress' && (
            <View style={styles.actionsRow}>
              <Button
                title={t('requests.mark_complete')}
                onPress={() => updateStatus('completed')}
                isLoading={isUpdatingStatus}
              />
            </View>
          )}

          {isStylist && (request.status === 'accepted' || request.status === 'in_progress') && (
            <Pressable
              onPress={() =>
                router.push(
                  `/(tabs)/client-wardrobe?userId=${request.user_id}&name=${encodeURIComponent(request.userName || '')}&requestId=${request.id}`,
                )
              }
              style={styles.wardrobeLink}
            >
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={styles.wardrobeLinkText}>{t('requests.build_outfit')}</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.messages}
          ListHeaderComponent={
            proposals.length > 0 ? (
              <View style={styles.proposalsSection}>
                <Text style={styles.proposalsHeader}>
                  {t('proposal.list_title')} ({proposals.length})
                </Text>
                {proposals.map(p => (
                  <Card key={p.id} style={styles.proposalCard}>
                    <Text style={styles.proposalTitle}>{p.title}</Text>
                    {p.notes && <Text style={styles.proposalNotes}>{p.notes}</Text>}

                    {p.items.length > 0 && (
                      <>
                        <Text style={styles.proposalSection}>{t('proposal.from_wardrobe')}</Text>
                        <FlatList
                          horizontal
                          data={p.items}
                          keyExtractor={i => i.id}
                          showsHorizontalScrollIndicator={false}
                          renderItem={({ item: wi }) => (
                            <View style={styles.propItem}>
                              <Image source={{ uri: wi.photoUrl }} style={styles.propItemImg} />
                              <Text style={styles.propItemText} numberOfLines={1}>
                                {wi.brand || wi.category.replace('_', ' ')}
                              </Text>
                            </View>
                          )}
                          contentContainerStyle={{ gap: 8 }}
                        />
                      </>
                    )}

                    {p.externalProducts.length > 0 && (
                      <>
                        <Text style={styles.proposalSection}>{t('proposal.shop_these')}</Text>
                        {p.externalProducts.map((ep, i) => (
                          <Pressable
                            key={i}
                            onPress={() => Linking.openURL(ep.url)}
                            style={styles.extLinkRow}
                          >
                            <Ionicons name="link-outline" size={16} color={colors.secondary} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.extLinkName}>{ep.name}</Text>
                              {ep.store && <Text style={styles.extLinkStore}>{ep.store}</Text>}
                            </View>
                            <Ionicons name="open-outline" size={16} color={colors.primary} />
                          </Pressable>
                        ))}
                      </>
                    )}

                    <Text style={styles.proposalDate}>
                      {new Date(p.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                  </Card>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyChat}>{t('chat.empty')}</Text>
          }
        />

        {isCompleted ? (
          <View style={styles.closedBar}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textLight} />
            <Text style={styles.closedText}>{t('chat.closed')}</Text>
            {!isStylist && !hasReviewed && request?.status === 'completed' && (
              <Pressable onPress={() => setShowRating(true)} style={styles.rateBtn}>
                <Ionicons name="star" size={14} color={colors.white} />
                <Text style={styles.rateBtnText}>{t('review.rate')}</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.inputRow}>
            <RNTextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={t('chat.placeholder')}
              placeholderTextColor={colors.textLight}
              multiline
            />
            <Pressable
              onPress={sendMessage}
              disabled={!input.trim() || isSending}
              style={[styles.sendBtn, (!input.trim() || isSending) && styles.sendBtnDisabled]}
            >
              <Ionicons name="send" size={20} color={colors.white} />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Rating Modal */}
      <Modal visible={showRating} transparent animationType="fade" onRequestClose={() => setShowRating(false)}>
        <Pressable style={styles.ratingOverlay} onPress={() => setShowRating(false)}>
          <Pressable style={styles.ratingCard} onPress={e => e.stopPropagation?.()}>
            <Text style={styles.ratingTitle}>{t('review.title')}</Text>
            <Text style={styles.ratingSubtitle}>{request?.stylistName || 'Stilist'}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <Pressable key={n} onPress={() => setRating(n)} hitSlop={8}>
                  <Ionicons
                    name={n <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={n <= rating ? '#f5a623' : colors.textLight}
                  />
                </Pressable>
              ))}
            </View>
            <RNTextInput
              style={styles.reviewInput}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder={t('review.comment_placeholder')}
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
            />
            <Button
              title={t('review.submit')}
              onPress={submitReview}
              isLoading={isSubmittingReview}
              disabled={rating === 0}
            />
            <View style={{ height: spacing.sm }} />
            <Button title={t('review.later')} onPress={() => setShowRating(false)} variant="text" />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  partnerName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  partnerLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  detailLine: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  actionsRow: {
    marginTop: spacing.md,
  },
  wardrobeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: borderRadius.full,
  },
  wardrobeLinkText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  proposalsSection: {
    marginBottom: spacing.md,
  },
  proposalsHeader: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  proposalCard: {
    marginBottom: spacing.md,
  },
  proposalTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  proposalNotes: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  proposalSection: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  propItem: {
    width: 80,
    alignItems: 'center',
  },
  propItemImg: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  propItemText: {
    fontSize: fontSize.xs,
    color: colors.text,
    marginTop: 4,
    textAlign: 'center',
  },
  extLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  extLinkName: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  extLinkStore: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    marginTop: 2,
  },
  proposalDate: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  messages: {
    padding: spacing.md,
    flexGrow: 1,
  },
  emptyChat: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xxxl,
  },
  messageRow: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
  },
  messageRowLeft: { justifyContent: 'flex-start' },
  messageRowRight: { justifyContent: 'flex-end' },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  messageTextMine: {
    color: colors.white,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.white,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  closedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  closedText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    flex: 1,
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  rateBtnText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  ratingOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  ratingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  ratingTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ratingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reviewInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
});
