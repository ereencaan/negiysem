import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, Pressable, FlatList, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { requestService } from '../../src/services/request.service';
import { wardrobeService } from '../../src/services/wardrobe.service';
import { followService, type FollowStats } from '../../src/services/follow.service';
import { feedService, type FeedPost } from '../../src/services/feed.service';
import { eligibilityService, type EligibilityStatus } from '../../src/services/eligibility.service';
import { supabase } from '../../src/lib/supabase';

const { width: SCREEN_W } = Dimensions.get('window');
const TILE_GAP = 4;
const TILE_SZ = (SCREEN_W - TILE_GAP * 4) / 3;
import { Avatar } from '../../src/components/ui/Avatar';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, isStylist, activeRole, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, wardrobe: 0 });
  const [stylistStats, setStylistStats] = useState({
    totalClients: 0, completedJobs: 0, pendingJobs: 0,
    totalEarnings: 0, avgRating: 0, totalReviews: 0,
  });
  const [bankInfo, setBankInfo] = useState({ iban: '', bankName: '', accountHolder: '' });
  const [followStats, setFollowStats] = useState<FollowStats>({ followersCount: 0, followingCount: 0 });
  const [myPosts, setMyPosts] = useState<FeedPost[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null);
  const [canStyle, setCanStyle] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      followService.getFollowStats(user.id).then(setFollowStats);
      feedService.getFeedPosts(user.id).then(all => setMyPosts(all.filter(p => p.userId === user.id)));
      eligibilityService.checkEligibility(user.id).then(setEligibility);
      supabase.from('users').select('can_style').eq('id', user.id).single().then(({ data }) => {
        if (data) setCanStyle((data as { can_style: boolean }).can_style);
      });

      if (activeRole === 'stylist' && isStylist) {
        supabase.from('stylist_profiles').select('iban, bank_name, account_holder, price_per_outfit').eq('user_id', user.id).single()
          .then(({ data }) => {
            if (data) {
              const d = data as { iban: string | null; bank_name: string | null; account_holder: string | null; price_per_outfit: number | null };
              setBankInfo({
                iban: d.iban || '',
                bankName: d.bank_name || '',
                accountHolder: d.account_holder || '',
              });

              // Calculate earnings from completed requests * price * 0.9
              requestService.getStylistRequests(user.id).then(requests => {
                const completed = requests.filter(r => r.status === 'completed').length;
                const pricePerOutfit = d.price_per_outfit ?? 0;
                const totalEarnings = Math.round(completed * pricePerOutfit * 0.9 * 100) / 100;
                setStylistStats({
                  totalClients: requests.length,
                  completedJobs: completed,
                  pendingJobs: requests.filter(r => ['pending', 'accepted', 'in_progress'].includes(r.status)).length,
                  totalEarnings,
                  avgRating: user.stylistProfile?.rating ?? 0,
                  totalReviews: user.stylistProfile?.totalReviews ?? 0,
                });
              });
            }
          });
      } else {
        Promise.all([
          requestService.getUserRequests(user.id),
          wardrobeService.getWardrobeItems(user.id),
        ]).then(([requests, items]) => {
          setStats({
            total: requests.length,
            approved: requests.filter(r => r.status === 'completed').length,
            pending: requests.filter(r => ['pending', 'accepted', 'in_progress'].includes(r.status)).length,
            wardrobe: items.length,
          });
        });
      }
    }, [user, activeRole, isStylist]),
  );

  const memberDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
    : '';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Avatar name={user?.name} size={88} />
          <Text style={styles.name}>{user?.name || 'Kullanıcı'}</Text>
          {user?.instagramUrl && (
            <Text style={styles.instagram}>{user.instagramUrl}</Text>
          )}
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.followRow}>
            <View style={styles.followItem}>
              <Text style={styles.followNum}>{followStats.followersCount}</Text>
              <Text style={styles.followLbl}>{t('follow.followers')}</Text>
            </View>
            <View style={styles.followDivider} />
            <View style={styles.followItem}>
              <Text style={styles.followNum}>{followStats.followingCount}</Text>
              <Text style={styles.followLbl}>{t('follow.following_label')}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>{t('profile.stats')}</Text>
        {activeRole === 'stylist' && isStylist ? (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#fff8e1' }]}>
                  <Ionicons name="star" size={20} color="#f5a623" />
                </View>
                <Text style={styles.statNumber}>{stylistStats.avgRating > 0 ? stylistStats.avgRating.toFixed(1) : '-'}</Text>
                <Text style={styles.statLabel}>{t('profile.stylist_rating')}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#e3f2fd' }]}>
                  <Ionicons name="chatbubbles-outline" size={20} color="#1565c0" />
                </View>
                <Text style={styles.statNumber}>{stylistStats.totalReviews}</Text>
                <Text style={styles.statLabel}>{t('profile.reviews_count')}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#c8e6c9' }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                </View>
                <Text style={styles.statNumber}>{stylistStats.completedJobs}</Text>
                <Text style={styles.statLabel}>{t('profile.completed_jobs')}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#fce4ec' }]}>
                  <Ionicons name="people-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.statNumber}>{stylistStats.totalClients}</Text>
                <Text style={styles.statLabel}>{t('profile.total_clients')}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#fff3cd' }]}>
                  <Ionicons name="time-outline" size={20} color={colors.warning} />
                </View>
                <Text style={styles.statNumber}>{stylistStats.pendingJobs}</Text>
                <Text style={styles.statLabel}>{t('profile.pending_outfits')}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#e8f5e9' }]}>
                  <Ionicons name="wallet-outline" size={20} color={colors.success} />
                </View>
                <Text style={styles.statNumber}>{stylistStats.totalEarnings > 0 ? `${stylistStats.totalEarnings}₺` : '0₺'}</Text>
                <Text style={styles.statLabel}>{t('profile.total_earnings')}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: '#fce4ec' }]}>
                <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>{t('profile.total_outfits')}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: '#c8e6c9' }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
              </View>
              <Text style={styles.statNumber}>{stats.approved}</Text>
              <Text style={styles.statLabel}>{t('profile.approved_outfits')}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: '#fff3cd' }]}>
                <Ionicons name="time-outline" size={20} color={colors.warning} />
              </View>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>{t('profile.pending_outfits')}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: '#fce4ec' }]}>
                <Ionicons name="shirt-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.statNumber}>{stats.wardrobe}</Text>
              <Text style={styles.statLabel}>{t('profile.wardrobe_count')}</Text>
            </View>
          </View>
        )}

        {/* Edit profile button */}
        <Button
          title={t('profile.edit_profile')}
          onPress={() => router.push('/(tabs)/edit-profile')}
          variant="secondary"
          style={styles.editBtn}
        />

        {/* Account Info */}
        <Card style={styles.section}>
          <Text style={styles.cardTitle}>{t('profile.account_info')}</Text>
          <InfoRow label={t('auth.name')} value={user?.name || '-'} />
          <InfoRow label={t('auth.email')} value={user?.email || '-'} />
          <InfoRow label={t('auth.phone')} value={user?.phone || '-'} />
          <InfoRow label={t('profile.instagram')} value={user?.instagramUrl || '-'} />
          <InfoRow label={t('profile.member_since')} value={memberDate} last />
        </Card>

        {/* Stylist Profile */}
        {isStylist && user?.stylistProfile && (
          <>
            <Card style={styles.section}>
              <Text style={styles.cardTitle}>{t('profile.stylist_profile')}</Text>
              <InfoRow label={t('auth.bio')} value={user.stylistProfile.bio || '-'} />
              <InfoRow
                label={t('auth.price_per_outfit')}
                value={user.stylistProfile.pricePerOutfit ? `${user.stylistProfile.pricePerOutfit}₺` : '-'}
              />
              <InfoRow label={t('auth.instagram_url')} value={user.stylistProfile.instagramUrl || '-'} last />
            </Card>

            <Card style={styles.section}>
              <View style={styles.bankHeader}>
                <Ionicons name="wallet-outline" size={18} color={colors.success} />
                <Text style={styles.cardTitle}>{t('payment.bank_info')}</Text>
              </View>
              {bankInfo.iban ? (
                <>
                  <InfoRow label={t('payment.account_holder')} value={bankInfo.accountHolder || '-'} />
                  <InfoRow label={t('payment.iban')} value={bankInfo.iban} />
                  <InfoRow label={t('payment.bank_name')} value={bankInfo.bankName || '-'} last />
                </>
              ) : (
                <Text style={styles.bankEmpty}>{t('payment.no_bank_info')}</Text>
              )}
            </Card>
          </>
        )}

        {/* Community Stylist Eligibility */}
        {!canStyle && eligibility && (
          <Card style={styles.eligibilityCard}>
            <View style={styles.eligibilityHeader}>
              <Ionicons name="sparkles" size={22} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.eligibilityTitle}>{t('eligibility.title')}</Text>
                <Text style={styles.eligibilitySubtitle}>
                  {eligibility.metCount}/{eligibility.totalConditions} {t('eligibility.completed')}
                </Text>
              </View>
            </View>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(eligibility.metCount / eligibility.totalConditions) * 100}%` }]} />
            </View>

            <View style={styles.conditionsList}>
              <ConditionRow
                met={eligibility.wardrobeCount >= eligibility.wardrobeRequired}
                label={t('eligibility.wardrobe', { count: eligibility.wardrobeRequired })}
                progress={`${eligibility.wardrobeCount}/${eligibility.wardrobeRequired}`}
              />
              <ConditionRow
                met={eligibility.postsCount >= eligibility.postsRequired}
                label={t('eligibility.posts', { count: eligibility.postsRequired })}
                progress={`${eligibility.postsCount}/${eligibility.postsRequired}`}
              />
              <ConditionRow
                met={eligibility.totalLikes >= eligibility.likesRequired}
                label={t('eligibility.likes', { count: eligibility.likesRequired })}
                progress={`${eligibility.totalLikes}/${eligibility.likesRequired}`}
              />
              <ConditionRow
                met={eligibility.followingCount >= eligibility.followingRequired}
                label={t('eligibility.following', { count: eligibility.followingRequired })}
                progress={`${eligibility.followingCount}/${eligibility.followingRequired}`}
              />
              <ConditionRow
                met={eligibility.profileComplete}
                label={t('eligibility.profile')}
                progress={eligibility.profileComplete ? '✓' : `${eligibility.hasProfilePhoto ? '1' : '0'}/2`}
              />
            </View>

            {eligibility.allMet && (
              <Button
                title={t('eligibility.activate')}
                onPress={() => router.push('/(tabs)/activate-styling')}
              />
            )}
          </Card>
        )}

        {canStyle && !isStylist && (
          <Card style={styles.promoCard}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>{t('eligibility.active')}</Text>
              <Text style={styles.promoDesc}>{t('eligibility.active_desc')}</Text>
            </View>
          </Card>
        )}

        {!isStylist && !canStyle && (
          <Card style={styles.promoCard} onPress={() => router.push('/(tabs)/become-stylist')}>
            <Ionicons name="school-outline" size={22} color={colors.primary} />
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>{t('stylist.become_stylist')}</Text>
              <Text style={styles.promoDesc}>{t('stylist.become_stylist_description')}</Text>
            </View>
          </Card>
        )}

        {/* My Posts Grid */}
        {myPosts.length > 0 && (
          <>
            <View style={styles.myPostsHeader}>
              <Ionicons name="grid-outline" size={18} color={colors.text} />
              <Text style={styles.myPostsTitle}>{t('profile.my_posts')} ({myPosts.length})</Text>
            </View>
            <View style={styles.myPostsGrid}>
              {myPosts.map(post => (
                <View key={post.id} style={styles.myPostTile}>
                  <Image source={{ uri: post.imageUrl }} style={styles.myPostImage} />
                </View>
              ))}
            </View>
          </>
        )}

        <Button
          title={t('auth.logout')}
          onPress={() => {
            router.replace('/(auth)/welcome');
            signOut();
          }}
          variant="secondary"
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ConditionRow({ met, label, progress }: { met: boolean; label: string; progress: string }) {
  return (
    <View style={condStyles.row}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={20}
        color={met ? colors.success : colors.textLight}
      />
      <Text style={[condStyles.label, met && condStyles.labelMet]}>{label}</Text>
      <Text style={[condStyles.progress, met && condStyles.progressMet]}>{progress}</Text>
    </View>
  );
}

const condStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  label: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  labelMet: { color: colors.success },
  progress: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  progressMet: { color: colors.success },
});

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[infoStyles.row, !last && infoStyles.border]}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm + 2 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { fontSize: fontSize.sm, color: colors.textSecondary },
  value: { fontSize: fontSize.sm, color: colors.text, fontWeight: fontWeight.medium, flex: 1, textAlign: 'right', marginLeft: spacing.md },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.md },
  instagram: { fontSize: fontSize.sm, color: colors.primary, marginTop: spacing.xs },
  email: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  followItem: { alignItems: 'center' },
  followNum: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  followLbl: { fontSize: fontSize.xs, color: colors.textSecondary },
  followDivider: { width: 1, height: 24, backgroundColor: colors.border },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', marginBottom: spacing.xl, gap: spacing.sm },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statNumber: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  statLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  section: { marginBottom: spacing.lg },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.sm },
  eligibilityCard: { marginBottom: spacing.lg },
  eligibilityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  eligibilityTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  eligibilitySubtitle: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  conditionsList: { marginBottom: spacing.md },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.primarySoft,
    borderColor: colors.accent,
  },
  promoContent: { flex: 1, marginLeft: spacing.md },
  promoTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary },
  promoDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  logoutBtn: { marginTop: spacing.sm },
  editBtn: { marginBottom: spacing.lg },
  myPostsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  myPostsTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  myPostsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: TILE_GAP, marginBottom: spacing.lg },
  myPostTile: { width: TILE_SZ, height: TILE_SZ },
  myPostImage: { width: '100%', height: '100%', backgroundColor: colors.surface },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bankEmpty: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
