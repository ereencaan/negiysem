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
import { feedService, type FeedPost } from '../../src/services/feed.service';
import { Avatar } from '../../src/components/ui/Avatar';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 4;
const TILE_SIZE = (SCREEN_WIDTH - GRID_GAP * 4) / 3;

interface PublicUser {
  id: string;
  name: string | null;
  profilePhoto: string | null;
  instagramUrl: string | null;
  isStylist: boolean;
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

  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);

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
      supabase.from('users').select('id, name, profile_photo, instagram_url').eq('id', userId).single(),
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
          isStylist: !!stylistRes.data,
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
    <Pressable onPress={() => setSelectedPost(item)} style={styles.tile}>
      <Image source={{ uri: item.imageUrl }} style={styles.tileImage} />
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
            {profile.isStylist && (
              <Pressable
                onPress={() => router.push(`/(tabs)/stylist-detail?id=${userId}`)}
                style={styles.stylistLink}
              >
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={styles.stylistLinkText}>{t('profile.view_stylist_profile')}</Text>
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
                <Pressable onPress={() => setSelectedPost(null)} style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseText}>{t('common.back')}</Text>
                </Pressable>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  },
  tileImage: { width: '100%', height: '100%', backgroundColor: colors.surface },
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
