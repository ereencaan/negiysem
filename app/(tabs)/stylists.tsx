import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { stylistService, type StylistListItem } from '../../src/services/stylist.service';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { colors, spacing, fontSize, fontWeight } from '../../src/constants/theme';

export default function StylistsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [stylists, setStylists] = useState<StylistListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    stylistService.getStylistList().then(data => {
      setStylists(data);
      setIsLoading(false);
    });
  }, []);

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
});
