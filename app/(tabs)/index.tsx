import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
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
  Dimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { feedService, type FeedPost, type PostComment } from '../../src/services/feed.service';
import { Avatar } from '../../src/components/ui/Avatar';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = spacing.sm;
const GRID_PADDING = spacing.md;
const COLUMN_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - COLUMN_GAP) / 2;

const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: 'apps-outline' as const },
  { id: 'gunluk', label: 'Günlük', icon: 'sunny-outline' as const },
  { id: 'ofis', label: 'Ofis', icon: 'briefcase-outline' as const },
  { id: 'davet', label: 'Davet', icon: 'sparkles-outline' as const },
  { id: 'spor', label: 'Spor', icon: 'fitness-outline' as const },
  { id: 'sokak', label: 'Sokak Tarzı', icon: 'walk-outline' as const },
];

export default function FeedScreen() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  useFocusEffect(useCallback(() => { loadPosts(); }, [loadPosts]));

  const onRefresh = () => { setRefreshing(true); loadPosts(); };

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
        prev.map(p => p.id === commentPostId ? { ...p, commentsCount: data.length } : p),
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
    return `${Math.floor(hours / 24)}g`;
  };

  // Filter by category
  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  // Split posts into two columns for masonry effect
  const topPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const gridPosts = filteredPosts.slice(1);
  const leftCol: FeedPost[] = [];
  const rightCol: FeedPost[] = [];
  gridPosts.forEach((p, i) => {
    if (i % 2 === 0) leftCol.push(p);
    else rightCol.push(p);
  });

  const renderGridCard = (item: FeedPost, tall: boolean) => (
    <View key={item.id} style={styles.gridCard}>
      <Pressable onPress={() => openComments(item.id)}>
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.gridImage, { height: tall ? 220 : 180 }]}
        />
      </Pressable>
      <View style={styles.gridInfo}>
        <View style={styles.gridUserRow}>
          <Avatar name={item.userName} size={22} />
          <Text style={styles.gridUserName} numberOfLines={1}>{item.userName || 'Kullanıcı'}</Text>
        </View>
        {item.caption && (
          <Text style={styles.gridCaption} numberOfLines={2}>{item.caption}</Text>
        )}
        <View style={styles.gridBottomRow}>
          <Pressable onPress={() => handleLike(item)} hitSlop={6} style={styles.gridLikeBtn}>
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={item.isLiked ? '#ff4757' : colors.textSecondary}
            />
            {item.likesCount > 0 && (
              <Text style={styles.gridLikeCount}>{item.likesCount}</Text>
            )}
          </Pressable>
          <Pressable onPress={() => openComments(item.id)} hitSlop={6} style={styles.gridLikeBtn}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
            {item.commentsCount > 0 && (
              <Text style={styles.gridLikeCount}>{item.commentsCount}</Text>
            )}
          </Pressable>
        </View>
      </View>
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
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Category chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryBar}
          >
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={selectedCategory === cat.id ? colors.white : colors.textSecondary}
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === cat.id && styles.categoryTextActive,
                ]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Featured / Top Post */}
          {topPost && (
            <Pressable
              onPress={() => openComments(topPost.id)}
              style={styles.featuredCard}
            >
              <Image source={{ uri: topPost.imageUrl }} style={styles.featuredImage} />
              <View style={styles.featuredGradient}>
                <View style={styles.featuredBadge}>
                  <Ionicons name="trophy" size={12} color="#f5a623" />
                  <Text style={styles.featuredBadgeText}>{t('feed.top_outfit')}</Text>
                </View>
                <View style={styles.featuredBottom}>
                  <View style={styles.featuredUser}>
                    <Avatar name={topPost.userName} size={28} />
                    <Text style={styles.featuredUserName}>{topPost.userName}</Text>
                  </View>
                  <View style={styles.featuredStats}>
                    <Pressable onPress={() => handleLike(topPost)} style={styles.featuredAction}>
                      <Ionicons
                        name={topPost.isLiked ? 'heart' : 'heart-outline'}
                        size={20}
                        color={topPost.isLiked ? '#ff4757' : colors.white}
                      />
                      <Text style={styles.featuredActionText}>{topPost.likesCount}</Text>
                    </Pressable>
                  </View>
                </View>
                {topPost.caption && (
                  <Text style={styles.featuredCaption} numberOfLines={2}>{topPost.caption}</Text>
                )}
              </View>
            </Pressable>
          )}

          {/* Masonry Grid */}
          <View style={styles.gridContainer}>
            <View style={styles.gridColumn}>
              {leftCol.map((p, i) => renderGridCard(p, i % 3 === 0))}
            </View>
            <View style={styles.gridColumn}>
              {rightCol.map((p, i) => renderGridCard(p, i % 3 === 1))}
            </View>
          </View>
        </ScrollView>
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
                ListEmptyComponent={<Text style={styles.noComments}>{t('feed.no_comments')}</Text>}
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

  // Categories
  categoryBar: {
    paddingHorizontal: GRID_PADDING,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  categoryTextActive: {
    color: colors.white,
  },

  // Featured card
  featuredCard: {
    marginHorizontal: GRID_PADDING,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 260,
    backgroundColor: colors.surface,
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingTop: spacing.xxxl,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  featuredBadgeText: {
    fontSize: fontSize.xs,
    color: '#f5a623',
    fontWeight: fontWeight.semibold,
  },
  featuredBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featuredUserName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  featuredStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featuredAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  featuredActionText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  featuredCaption: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.xs,
    lineHeight: 18,
  },

  // Masonry grid
  gridContainer: {
    flexDirection: 'row',
    paddingHorizontal: GRID_PADDING,
    gap: COLUMN_GAP,
  },
  gridColumn: {
    flex: 1,
  },
  gridCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: COLUMN_GAP,
  },
  gridImage: {
    width: '100%',
    backgroundColor: colors.surface,
  },
  gridInfo: {
    padding: spacing.sm,
  },
  gridBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  gridLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  gridLikeCount: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  gridUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  gridUserName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  gridCaption: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },

  // Comments modal (unchanged)
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBackdropPress: { flex: 1 },
  commentSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.md,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center',
    marginTop: spacing.sm, marginBottom: spacing.md,
  },
  commentsTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  commentsList: { paddingHorizontal: spacing.xl },
  noComments: { textAlign: 'center', color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xl },
  commentRow: { marginBottom: spacing.md },
  commentUser: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  commentText: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20, marginTop: 2 },
  commentTime: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  commentInputRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
    paddingTop: spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  commentInput: {
    flex: 1, minHeight: 40, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: fontSize.sm, color: colors.text, backgroundColor: colors.white,
  },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
});
