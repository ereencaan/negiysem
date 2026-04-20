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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import {
  requestService,
  type OutfitRequestWithDetails,
} from '../../src/services/request.service';
import { messageService, type ChatMessage } from '../../src/services/message.service';
import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
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
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const isStylist = user?.id === request?.stylist_id;

  const loadAll = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    const [req, msgs] = await Promise.all([
      requestService.getRequestById(id),
      messageService.getMessages(id),
    ]);
    setRequest(req);
    setMessages(msgs);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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
                  `/(tabs)/client-wardrobe?userId=${request.user_id}&name=${encodeURIComponent(request.userName || '')}`,
                )
              }
              style={styles.wardrobeLink}
            >
              <Ionicons name="shirt-outline" size={16} color={colors.primary} />
              <Text style={styles.wardrobeLinkText}>{t('requests.view_client_wardrobe')}</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.messages}
          ListEmptyComponent={
            <Text style={styles.emptyChat}>{t('chat.empty')}</Text>
          }
        />

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
      </KeyboardAvoidingView>
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
});
