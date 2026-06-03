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
const GRID_GAP = 2;
const TILE_SIZE = (SCREEN_WIDTH - GRID_GAP * 2) / 3;

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
    <Pressable style={styles.tile}>
      <Image source={{ uri: item.imageUrl }} style={styles.tileImage} />
      {item.likesCount > 0 && (
        <View style={styles.tileOverlay}>
          <Ionicons name="heart" size={12} color={colors.white} />
          <Text style={styles.tileCount}>{item.likesCount}</Text>
        </View>
      )}
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
  gridRow: { gap: GRID_GAP },
  tile: { width: TILE_SIZE, height: TILE_SIZE, position: 'relative' },
  tileImage: { width: '100%', height: '100%', backgroundColor: colors.surface },
  tileOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tileCount: { fontSize: 10, color: colors.white, fontWeight: fontWeight.semibold },
});
