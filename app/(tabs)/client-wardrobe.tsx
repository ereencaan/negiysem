import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { wardrobeService, type WardrobeItem } from '../../src/services/wardrobe.service';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

export default function ClientWardrobeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { userId, name } = useLocalSearchParams<{ userId: string; name?: string }>();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    wardrobeService.getWardrobeItems(userId)
      .then(data => setItems(data))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const renderItem = ({ item }: { item: WardrobeItem }) => (
    <View style={styles.itemCard}>
      {item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImage, styles.itemPlaceholder]}>
          <Ionicons name="shirt-outline" size={32} color={colors.textLight} />
        </View>
      )}
      <View style={styles.itemInfo}>
        <Badge label={item.category.replace('_', ' ')} variant="info" />
        {item.brand && <Text style={styles.itemBrand}>{item.brand}</Text>}
        {item.color && <Text style={styles.itemColor}>{item.color}</Text>}
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>
          {name ? `${name} — ${t('wardrobe.client_title')}` : t('wardrobe.client_title')}
        </Text>
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon="shirt-outline"
          title={t('wardrobe.client_empty_title')}
          description={t('wardrobe.client_empty_description')}
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.card,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  list: {
    padding: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surface,
  },
  itemPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    padding: spacing.sm,
  },
  itemBrand: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginTop: spacing.xs,
  },
  itemColor: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
