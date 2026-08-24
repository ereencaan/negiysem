import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase, getStorageUrl } from '../../src/lib/supabase';
import { followService, type FollowStats } from '../../src/services/follow.service';
import { feedService, type FeedPost, type PostComment } from '../../src/services/feed.service';
import { TextInput as RNTextInput } from 'react-native';
import { Avatar } from '../../src/components/ui/Avatar';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 4;
const TILE_SIZE = (SCREEN_WIDTH - GRID_GAP * 4) / 3;

import { RequestModal } from '../../src/components/ui/RequestModal';

interface PublicUser {
  id: string;
  name: string | null;
  profilePhoto: string | null;
  instagramUrl: string | null;
  bio: string | null;
  isStylist: boolean;
  canStyle: boolean;
  stylePrice: number | null;
}

export default function UserProfileScreen() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [followStats, setFollowStats] = useState<FollowStats>({ followersCount: 0, followingCount: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [modalComments, setModalComments] = useState<PostComment[]>([]);
  const [modalCommentInput, setModalCommentInput] = useState('');
  const [modalCommentsLoading, setModalCommentsLoading] = useState(false);
  const [modalSending, setModalSending] = useState(false);

  const openPostDetail = async (post: FeedPost) => {
    setSelectedPost(post);
    setModalCommentsLoading(true);
    const data = await feedService.getComments(post.id);
    setModalComments(data);
    setModalCommentsLoading(false);
  };

  const sendModalComment = async () => {
    if (!currentUser || !selectedPost || !modalCommentInput.trim()) return;
    setModalSending(true);
    const result = await feedService.addComment(selectedPost.id, currentUser.id, modalCommentInput.trim());
    if (result.data) {
      setModalCommentInput('');
      const data = await feedService.getComments(selectedPost.id);
      setModalComments(data);
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, commentsCount: data.length } : p));
      setSelectedPost(prev => prev ? { ...prev, commentsCount: data.length } : null);
    }
    setModalSending(false);
  };

  const handleLike = async (post: FeedPost) => {
    if (!currentUser) return;
    const newLiked = await feedService.toggleLike(post.id, currentUser.id, post.isLiked);
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? { ...p, isLiked: newLiked, likesCount: p.likesCount + (newLiked ? 1 : -1) }
          : p,
      ),
    );
    if (selectedPost?.id === post.id) {
      setSelectedPost(prev => prev ? { ...prev, isLiked: newLiked, likesCount: prev.likesCount + (newLiked ? 1 : -1) } : null);
    }
  };

  useEffect(() => {
    if (!userId) { setIsLoading(false); return; }

    Promise.all([
      supabase.from('users').select('id, name, profile_photo, instagram_url, bio, can_style, style_price').eq('id', userId).single(),
      supabase.from('stylist_profiles').select('id').eq('user_id', userId).maybeSingle(),
      feedService.getFeedPosts(currentUser?.id),
      followService.getFollowStats(userId),
      currentUser ? followService.isFollowing(currentUser.id, userId) : Promise.resolve(false),
    ]).then(([userRes, stylistRes, allPosts, stats, following]) => {
      if (userRes.data) {
        const u = userRes.data as Record<string, unknown>;
        setProfile({
          id: u.id as string,
          name: u.name as string | null,
          profilePhoto: u.profile_photo as string | null,
          instagramUrl: u.instagram_url as string | null,
          bio: u.bio as string | null,
          isStylist: !!stylistRes.data,
          canStyle: !!(u.can_style),
          stylePrice: u.style_price as number | null,
        });
      }
      setPosts(allPosts.filter(p => p.userId === userId));
      setFollowStats(stats);
      setIsFollowing(following);
      setIsLoading(false);
    });
  }, [userId, currentUser]);

  const handleFollow = async () => {
    if (!currentUser || !userId) return;
    const newState = await followService.toggleFollow(currentUser.id, userId, isFollowing);
    setIsFollowing(newState);
    setFollowStats(prev => ({
      ...prev,
      followersCount: prev.followersCount + (newState ? 1 : -1),
    }));
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

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Kullanıcı bulunamadı</Text>
      </SafeAreaView>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  const renderTile = ({ item }: { item: FeedPost }) => (
    <Pressable onPress={() => openPostDetail(item)} style={styles.tile}>
      <Image source={{ uri: item.imageUrl }} style={styles.tileImage} />
      <View style={styles.tileStats}>
        <Pressable
          onPress={(e) => { e.stopPropagation?.(); handleLike(item); }}
          hitSlop={4}
          style={styles.tileStatItem}
        >
          <Ionicons
            name={item.isLiked ? 'heart' : 'heart-outline'}
            size={14}
            color={item.isLiked ? '#ff4757' : colors.white}
          />
          <Text style={styles.tileStatText}>{item.likesCount}</Text>
        </Pressable>
        <View style={styles.tileStatItem}>
          <Ionicons name="chatbubble" size={12} color={colors.white} />
          <Text style={styles.tileStatText}>{item.commentsCount}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={posts}
        renderItem={renderTile}
        keyExtractor={item => item.id}
        numColumns={3}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>

            <View style={styles.profileRow}>
              <Avatar name={profile.name} uri={profile.profilePhoto} size={80} />
              <View style={styles.statsCol}>
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNum}>{posts.length}</Text>
                    <Text style={styles.statLbl}>{t('profile.posts')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNum}>{followStats.followersCount}</Text>
                    <Text style={styles.statLbl}>{t('follow.followers')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNum}>{followStats.followingCount}</Text>
                    <Text style={styles.statLbl}>{t('follow.following_label')}</Text>
                  </View>
                </View>
                {!isOwnProfile && currentUser && (
                  <Pressable
                    onPress={handleFollow}
                    style={[styles.followBtn, isFollowing && styles.followBtnActive]}
                  >
                    <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
                      {isFollowing ? t('follow.following') : t('follow.follow')}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            <Text style={styles.userName}>{profile.name || 'Kullanıcı'}</Text>
            {profile.instagramUrl && (
              <Text style={styles.userInsta}>{profile.instagramUrl}</Text>
            )}
            {profile.bio && (
              <Text style={styles.userBio}>{profile.bio}</Text>
            )}
            {profile.isStylist && (
              <Pressable
                onPress={() => router.push(`/(tabs)/stylist-detail?id=${userId}`)}
                style={styles.stylistLink}
              >
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={styles.stylistLinkText}>{t('profile.view_stylist_profile')}</Text>
              </Pressable>
            )}
            {!isOwnProfile && (profile.canStyle || profile.isStylist) && (
              <Pressable
                onPress={() => setShowRequestModal(true)}
                style={styles.requestProfileBtn}
              >
                <Ionicons name="color-palette-outline" size={16} color={colors.white} />
                <Text style={styles.requestProfileText}>
                  {t('stylists.request_short')}
                  {profile.stylePrice ? ` · ${profile.stylePrice}₺` : ''}
                </Text>
              </Pressable>
            )}

            <View style={styles.gridHeader}>
              <Ionicons name="grid-outline" size={18} color={colors.text} />
              <Text style={styles.gridHeaderText}>{t('profile.posts')}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="images-outline"
            title={t('profile.no_posts')}
            description={t('profile.no_posts_desc')}
          />
        }
      />

      {/* Post Detail Modal */}
      <Modal
        visible={selectedPost !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPost(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedPost(null)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation?.()}>
            {selectedPost && (
              <ScrollView>
                <Image source={{ uri: selectedPost.imageUrl }} style={styles.modalImage} />
                <View style={styles.modalActions}>
                  <Pressable onPress={() => handleLike(selectedPost)} hitSlop={8} style={styles.modalActionBtn}>
                    <Ionicons
                      name={selectedPost.isLiked ? 'heart' : 'heart-outline'}
                      size={26}
                      color={selectedPost.isLiked ? '#ff4757' : colors.text}
                    />
                    <Text style={styles.modalActionCount}>{selectedPost.likesCount}</Text>
                  </Pressable>
                  <View style={styles.modalActionBtn}>
                    <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
                    <Text style={styles.modalActionCount}>{selectedPost.commentsCount}</Text>
                  </View>
                </View>
                {selectedPost.caption && (
                  <View style={styles.modalCaption}>
                    <Text style={styles.modalCaptionUser}>{selectedPost.userName}</Text>
                    <Text style={styles.modalCaptionText}> {selectedPost.caption}</Text>
                  </View>
                )}

                {/* Comments */}
                <View style={styles.commentsSection}>
                  <Text style={styles.commentsTitle}>{t('feed.comments')}</Text>
                  {modalCommentsLoading ? (
                    <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
                  ) : modalComments.length === 0 ? (
                    <Text style={styles.noComments}>{t('feed.no_comments')}</Text>
                  ) : (
                    modalComments.map(c => (
                      <View key={c.id} style={styles.commentItem}>
                        <Text style={styles.commentUser}>{c.userName || 'Kullanıcı'}</Text>
                        <Text style={styles.commentText}>{c.content}</Text>
                      </View>
                    ))
                  )}
                </View>

                {/* Comment input */}
                {currentUser && (
                  <View style={styles.commentInputRow}>
                    <RNTextInput
                      style={styles.commentInput}
                      value={modalCommentInput}
                      onChangeText={setModalCommentInput}
                      placeholder={t('feed.add_comment')}
                      placeholderTextColor={colors.textLight}
                    />
                    <Pressable
                      onPress={sendModalComment}
                      disabled={!modalCommentInput.trim() || modalSending}
                      style={[styles.sendCommentBtn, (!modalCommentInput.trim() || modalSending) && { opacity: 0.5 }]}
                    >
                      <Ionicons name="send" size={18} color={colors.white} />
                    </Pressable>
                  </View>
                )}

                <Pressable onPress={() => setSelectedPost(null)} style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseText}>{t('common.back')}</Text>
                </Pressable>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
      {profile && (profile.canStyle || profile.isStylist) && (
        <RequestModal
          visible={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          stylistId={profile.id}
          stylistName={profile.name || 'Kullanıcı'}
          openAddWardrobeItem={() => router.push('/(tabs)/add-wardrobe-item')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxxl },
  headerSection: { padding: spacing.lg },
  backBtn: { marginBottom: spacing.md, width: 32, height: 32, justifyContent: 'center' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  statsCol: { flex: 1 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.md },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  statLbl: { fontSize: fontSize.xs, color: colors.textSecondary },
  followBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  followBtnActive: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.white },
  followBtnTextActive: { color: colors.text },
  userName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.md },
  userInsta: { fontSize: fontSize.sm, color: colors.primary, marginTop: 2 },
  userBio: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 18 },
  requestProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  requestProfileText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.white },
  stylistLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: borderRadius.full,
  },
  stylistLinkText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.semibold },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  gridHeaderText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text },
  gridRow: { gap: GRID_GAP, paddingHorizontal: GRID_GAP },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    marginBottom: GRID_GAP,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: borderRadius.sm,
  },
  tileImage: { width: '100%', height: '100%', backgroundColor: colors.surface },
  tileStats: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  tileStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tileStatText: { fontSize: 11, color: colors.white, fontWeight: fontWeight.semibold },
  commentsSection: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    maxHeight: 200,
  },
  commentsTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm },
  noComments: { fontSize: fontSize.xs, color: colors.textLight, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.md },
  commentItem: { marginBottom: spacing.sm },
  commentUser: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.text },
  commentText: { fontSize: fontSize.sm, color: colors.text, marginTop: 2 },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  sendCommentBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
  },
  modalImage: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: colors.surface,
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.xl,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  modalActionCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  modalCaption: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  modalCaptionUser: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  modalCaptionText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  modalCloseBtn: {
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  modalCloseText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});
