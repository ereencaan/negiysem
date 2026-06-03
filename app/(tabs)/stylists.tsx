import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { stylistService, type StylistListItem } from '../../src/services/stylist.service';
import { followService } from '../../src/services/follow.service';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { RequestModal } from '../../src/components/ui/RequestModal';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

export default function StylistsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [stylists, setStylists] = useState<StylistListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestTarget, setRequestTarget] = useState<StylistListItem | null>(null);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    stylistService.getStylistList()
      .then(data => setStylists(data))
      .finally(() => setIsLoading(false));
    if (user) {
      followService.getFollowingIds(user.id).then(ids => setFollowingSet(new Set(ids)));
    }
  }, [user]);

  const handleFollow = async (stylistId: string) => {
    if (!user) return;
    const isFollowing = followingSet.has(stylistId);
    const newState = await followService.toggleFollow(user.id, stylistId, isFollowing);
    setFollowingSet(prev => {
      const next = new Set(prev);
      if (newState) next.add(stylistId);
      else next.delete(stylistId);
      return next;
    });
  };

  const renderStylist = ({ item }: { item: StylistListItem }) => (
    <Card
      style={styles.card}
      onPress={() => router.push(`/(tabs)/stylist-detail?id=${item.id}`)}
    >
      <View style={styles.cardRow}>
        <Avatar name={item.name} uri={item.profilePhoto} size={56} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.stylistName}>{item.name || 'Stilist'}</Text>
            {item.isVerified && <Badge label={t('stylists.verified')} variant="completed" />}
          </View>
          {item.bio && (
            <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
          )}
          {item.instagramUrl && (
            <View style={styles.instagramRow}>
              <Ionicons name="logo-instagram" size={12} color={colors.secondary} />
              <Text style={styles.instagram}>{item.instagramUrl}</Text>
            </View>
          )}
          <View style={styles.cardFooter}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#f5a623" />
              <Text style={styles.rating}>
                {item.rating > 0 ? item.rating.toFixed(1) : '-'}
              </Text>
              <Text style={styles.reviews}>
                ({item.totalReviews} {t('stylists.reviews')})
              </Text>
            </View>
            {item.pricePerOutfit && (
              <Text style={styles.price}>
                {item.pricePerOutfit}₺ {t('stylists.per_outfit')}
              </Text>
            )}
          </View>
          <View style={styles.actionBtnRow}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                handleFollow(item.id);
              }}
              style={[styles.followBtn, followingSet.has(item.id) && styles.followBtnActive]}
            >
              <Ionicons
                name={followingSet.has(item.id) ? 'checkmark' : 'person-add-outline'}
                size={14}
                color={followingSet.has(item.id) ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.followBtnText, followingSet.has(item.id) && styles.followBtnTextActive]}>
                {followingSet.has(item.id) ? t('follow.following') : t('follow.follow')}
              </Text>
            </Pressable>
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                setRequestTarget(item);
              }}
              style={styles.requestBtn}
            >
              <Ionicons name="send" size={14} color={colors.white} />
              <Text style={styles.requestBtnText}>{t('stylists.request_short')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Card>
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
      {stylists.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={t('stylists.empty_title')}
          description={t('stylists.empty_description')}
        />
      ) : (
        <FlatList
          data={stylists}
          renderItem={renderStylist}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {requestTarget && (
        <RequestModal
          visible={!!requestTarget}
          onClose={() => setRequestTarget(null)}
          stylistId={requestTarget.id}
          stylistName={requestTarget.name || 'Stilist'}
          openAddWardrobeItem={() => router.push('/(tabs)/add-wardrobe-item')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.lg },
  card: { marginBottom: spacing.md },
  cardRow: { flexDirection: 'row' },
  cardContent: { flex: 1, marginLeft: spacing.md },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  stylistName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  bio: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  reviews: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  price: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.secondary,
  },
  instagramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  instagram: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    fontWeight: fontWeight.medium,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  followBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  followBtnText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  followBtnTextActive: {
    color: colors.primary,
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  requestBtnText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
