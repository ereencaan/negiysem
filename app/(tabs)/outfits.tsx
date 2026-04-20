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
import { useAuth } from '../../src/hooks/useAuth';
import { requestService, type OutfitRequestWithDetails } from '../../src/services/request.service';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import type { OutfitRequestStatus } from '../../src/types/database.types';
import { colors, spacing, fontSize, fontWeight } from '../../src/constants/theme';

function statusVariant(status: OutfitRequestStatus) {
  const map: Record<OutfitRequestStatus, 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'> = {
    pending: 'pending',
    accepted: 'accepted',
    in_progress: 'in_progress',
    completed: 'completed',
    cancelled: 'cancelled',
  };
  return map[status];
}

export default function OutfitsScreen() {
  const { t } = useTranslation();
  const { user, activeRole } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<OutfitRequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const load = activeRole === 'stylist'
      ? requestService.getStylistRequests(user.id)
      : requestService.getUserRequests(user.id);

    load
      .then(data => setRequests(data))
      .finally(() => setIsLoading(false));
  }, [user, activeRole]);

  const statusLabel = (status: OutfitRequestStatus) => {
    const key = `outfits.status.${status}` as const;
    return t(key);
  };

  const renderRequest = ({ item }: { item: OutfitRequestWithDetails }) => (
    <Card
      style={styles.card}
      onPress={() => router.push(`/(tabs)/request-detail?id=${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.personName}>
          {activeRole === 'stylist'
            ? `${t('requests.from')}: ${item.userName || 'Kullanıcı'}`
            : item.stylistName || 'Stilist'}
        </Text>
        <Badge label={statusLabel(item.status)} variant={statusVariant(item.status)} />
      </View>
      {item.occasion && <Text style={styles.occasion}>{item.occasion}</Text>}
      {item.message && (
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      )}
      <Text style={styles.date}>
        {new Date(item.created_at).toLocaleDateString('tr-TR')}
      </Text>
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

  if (requests.length === 0) {
    const isUser = activeRole === 'user';
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          icon={isUser ? 'color-palette-outline' : 'mail-outline'}
          title={isUser ? t('outfits.empty_title') : t('requests.empty_title')}
          description={isUser ? t('outfits.empty_description') : t('requests.empty_description')}
          actionLabel={isUser ? t('outfits.find_stylist') : undefined}
          onAction={isUser ? () => router.push('/(tabs)/stylists') : undefined}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.lg },
  card: { marginBottom: spacing.md },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  personName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  occasion: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
});
