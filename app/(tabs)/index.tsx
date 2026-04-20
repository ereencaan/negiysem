import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  TextInput as RNTextInput,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { feedService, type FeedPost, type PostComment } from '../../src/services/feed.service';
import { Avatar } from '../../src/components/ui/Avatar';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

export default function FeedScreen() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Comment modal state
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadPosts = useCallback(async () => {
    if (authLoading) return;
    const data = await feedService.getFeedPosts(user?.id);
    setPosts(data);
    setIsLoading(false);
    setRefreshing(false);
  }, [user?.id, authLoading]);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleLike = async (post: FeedPost) => {
    if (!user) return;
    const newLiked = await feedService.toggleLike(post.id, user.id, post.isLiked);
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? { ...p, isLiked: newLiked, likesCount: p.likesCount + (newLiked ? 1 : -1) }
          : p,
      ),
    );
  };

  const openComments = async (postId: string) => {
    setCommentPostId(postId);
    setCommentsLoading(true);
    const data = await feedService.getComments(postId);
    setComments(data);
    setCommentsLoading(false);
  };

  const sendComment = async () => {
    if (!user || !commentPostId || !commentInput.trim()) return;
    setSending(true);
    const result = await feedService.addComment(commentPostId, user.id, commentInput.trim());
    if (result.data) {
      setCommentInput('');
      const data = await feedService.getComments(commentPostId);
      setComments(data);
      setPosts(prev =>
        prev.map(p =>
          p.id === commentPostId ? { ...p, commentsCount: data.length } : p,
        ),
      );
    }
    setSending(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'az önce';
    if (mins < 60) return `${mins}dk`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}sa`;
    const days = Math.floor(hours / 24);
    return `${days}g`;
  };

  const renderPost = ({ item }: { item: FeedPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Avatar name={item.userName} size={40} />
        <View style={styles.postHeaderText}>
          <Text style={styles.postUserName}>{item.userName || 'Kullanıcı'}</Text>
          <Text style={styles.postTime}>{timeAgo(item.createdAt)}</Text>
        </View>
      </View>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />

      {/* Action row */}
      <View style={styles.actionsRow}>
        <Pressable onPress={() => handleLike(item)} hitSlop={8} style={styles.actionBtn}>
          <Ionicons
            name={item.isLiked ? 'heart' : 'heart-outline'}
            size={26}
            color={item.isLiked ? colors.error : colors.text}
          />
        </Pressable>
        <Pressable onPress={() => openComments(item.id)} hitSlop={8} style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* Likes count */}
      {item.likesCount > 0 && (
        <Text style={styles.likesCount}>
          {item.likesCount} {t('feed.likes')}
        </Text>
      )}

      {/* Caption */}
      {item.caption && (
        <View style={styles.postCaption}>
          <Text style={styles.captionUser}>{item.userName}</Text>
          <Text style={styles.captionText}> {item.caption}</Text>
        </View>
      )}

      {/* Comments preview */}
      {item.commentsCount > 0 && (
        <Pressable onPress={() => openComments(item.id)}>
          <Text style={styles.viewComments}>
            {item.commentsCount} {t('feed.comments_count')}
          </Text>
        </Pressable>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {posts.length === 0 ? (
        <EmptyState
          icon="images-outline"
          title={t('feed.empty_title')}
          description={t('feed.empty_description')}
        />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Comments Modal */}
      <Modal
        visible={commentPostId !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentPostId(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.modalBackdropPress} onPress={() => setCommentPostId(null)} />
          <View style={styles.commentSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.commentsTitle}>{t('feed.comments')}</Text>

            {commentsLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
            ) : (
              <FlatList
                data={comments}
                keyExtractor={c => c.id}
                style={styles.commentsList}
                ListEmptyComponent={
                  <Text style={styles.noComments}>{t('feed.no_comments')}</Text>
                }
                renderItem={({ item: c }) => (
                  <View style={styles.commentRow}>
                    <Text style={styles.commentUser}>{c.userName || 'Kullanıcı'}</Text>
                    <Text style={styles.commentText}>{c.content}</Text>
                    <Text style={styles.commentTime}>{timeAgo(c.createdAt)}</Text>
                  </View>
                )}
              />
            )}

            <View style={styles.commentInputRow}>
              <RNTextInput
                style={styles.commentInput}
                value={commentInput}
                onChangeText={setCommentInput}
                placeholder={t('feed.add_comment')}
                placeholderTextColor={colors.textLight}
              />
              <Pressable
                onPress={sendComment}
                disabled={!commentInput.trim() || sending}
                style={[styles.sendBtn, (!commentInput.trim() || sending) && styles.sendBtnDisabled]}
              >
                <Ionicons name="send" size={18} color={colors.white} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: spacing.xxxl },
  postCard: {
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  postHeaderText: {
    marginLeft: spacing.md,
  },
  postUserName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  postTime: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 1,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  actionBtn: {
    padding: 2,
  },
  likesCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  postCaption: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    flexWrap: 'wrap',
  },
  captionUser: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  captionText: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  viewComments: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  // Comments modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdropPress: { flex: 1 },
  commentSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  commentsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  commentsList: {
    paddingHorizontal: spacing.xl,
  },
  noComments: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xl,
  },
  commentRow: {
    marginBottom: spacing.md,
  },
  commentUser: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  commentText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    marginTop: 2,
  },
  commentTime: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
