import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { wardrobeService, type WardrobeItem } from '../../src/services/wardrobe.service';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Badge } from '../../src/components/ui/Badge';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

export default function WardrobeScreen() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { slug: null, label: t('wardrobe.all_categories') },
    { slug: 'ust_giyim', label: 'Üst Giyim' },
    { slug: 'alt_giyim', label: 'Alt Giyim' },
    { slug: 'dis_giyim', label: 'Dış Giyim' },
    { slug: 'ayakkabi', label: 'Ayakkabı' },
    { slug: 'aksesuar', label: 'Aksesuar' },
    { slug: 'elbise', label: 'Elbise' },
  ];

  const loadItems = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    try {
      const data = await wardrobeService.getWardrobeItems(user.id);
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems]),
  );

  const filteredItems = selectedCategory
    ? items.filter(item => item.category === selectedCategory)
    : items;

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
      <View style={styles.container}>
        <View style={styles.filterBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterBarContent}
          >
            {categories.map(cat => (
              <Pressable
                key={cat.slug ?? 'all'}
                onPress={() => setSelectedCategory(cat.slug)}
                style={[
                  styles.filterChip,
                  selectedCategory === cat.slug && styles.filterChipActive,
                ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === cat.slug && styles.filterChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
          </ScrollView>
        </View>

        {filteredItems.length === 0 ? (
          <EmptyState
            icon="shirt-outline"
            title={t('wardrobe.empty_title')}
            description={t('wardrobe.empty_description')}
            actionLabel={t('wardrobe.add_item')}
            onAction={() => router.push('/(tabs)/add-wardrobe-item')}
          />
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
          />
        )}

        <Pressable
          style={styles.fab}
          onPress={() => router.push('/(tabs)/add-wardrobe-item')}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterBarWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.card,
  },
  filterBarContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    height: 36,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  filterChipTextActive: {
    color: colors.white,
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
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
