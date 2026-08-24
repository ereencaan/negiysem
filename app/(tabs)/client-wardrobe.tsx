import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  TextInput as RNTextInput,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { wardrobeService, type WardrobeItem } from '../../src/services/wardrobe.service';
import {
  proposalService,
  type ExternalProduct,
} from '../../src/services/proposal.service';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { TextInput } from '../../src/components/ui/TextInput';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

const categories = [
  { slug: null, label: 'Tümü' },
  { slug: 'ust_giyim', label: 'Üst Giyim' },
  { slug: 'alt_giyim', label: 'Alt Giyim' },
  { slug: 'dis_giyim', label: 'Dış Giyim' },
  { slug: 'ayakkabi', label: 'Ayakkabı' },
  { slug: 'aksesuar', label: 'Aksesuar' },
  { slug: 'elbise', label: 'Elbise' },
];

export default function ClientWardrobeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const {
    userId,
    name,
    requestId,
  } = useLocalSearchParams<{ userId: string; name?: string; requestId?: string }>();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [externalProducts, setExternalProducts] = useState<ExternalProduct[]>([]);
  const [extName, setExtName] = useState('');
  const [extUrl, setExtUrl] = useState('');
  const [extStore, setExtStore] = useState('');
  const [showProposal, setShowProposal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    wardrobeService.getWardrobeItems(userId)
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, [userId]);

  const filtered = selectedCategory
    ? items.filter(i => i.category === selectedCategory)
    : items;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addExternalProduct = () => {
    if (!extName.trim() || !extUrl.trim()) return;
    setExternalProducts(prev => [
      ...prev,
      { name: extName.trim(), url: extUrl.trim(), store: extStore.trim() || undefined },
    ]);
    setExtName('');
    setExtUrl('');
    setExtStore('');
  };

  const removeExternalProduct = (idx: number) => {
    setExternalProducts(prev => prev.filter((_, i) => i !== idx));
  };

  const saveProposal = async () => {
    if (!user || !requestId) {
      Alert.alert(t('errors.generic'));
      return;
    }
    if (!title.trim()) {
      Alert.alert(t('proposal.title_required'));
      return;
    }
    if (selectedIds.size === 0 && externalProducts.length === 0) {
      Alert.alert(t('proposal.items_required'));
      return;
    }
    setIsSaving(true);
    const result = await proposalService.createProposal({
      requestId,
      stylistId: user.id,
      title: title.trim(),
      notes: notes.trim() || undefined,
      wardrobeItemIds: Array.from(selectedIds),
      externalProducts,
    });
    setIsSaving(false);
    if (result.error) {
      Alert.alert(t('errors.generic'));
      return;
    }
    Alert.alert(t('proposal.created'), t('proposal.created_body'));
    router.back();
  };

  const renderItem = ({ item }: { item: WardrobeItem }) => {
    const isSelected = selectedIds.has(item.id);
    return (
      <Pressable
        onPress={() => toggleSelect(item.id)}
        style={[styles.itemCard, isSelected && styles.itemCardSelected]}
      >
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.itemPlaceholder]}>
            <Ionicons name="shirt-outline" size={32} color={colors.textLight} />
          </View>
        )}
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
          </View>
        )}
        <View style={styles.itemInfo}>
          <Badge label={item.category.replace('_', ' ')} variant="info" />
          {item.brand && <Text style={styles.itemBrand}>{item.brand}</Text>}
          {item.color && <Text style={styles.itemColor}>{item.color}</Text>}
        </View>
      </Pressable>
    );
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

  const canPropose = !!requestId;

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
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterBar}
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

          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            removeClippedSubviews
            ListFooterComponent={
              canPropose && showProposal ? (
                <Card style={styles.proposalCard}>
                  <Text style={styles.proposalTitle}>{t('proposal.create')}</Text>
                  <Text style={styles.proposalHelp}>{t('proposal.selected', { count: selectedIds.size })}</Text>

                  <TextInput
                    label={t('proposal.title')}
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t('proposal.title_placeholder')}
                  />
                  <TextInput
                    label={t('proposal.notes')}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    placeholder={t('proposal.notes_placeholder')}
                  />

                  <Text style={styles.sectionLabel}>{t('proposal.external_links')}</Text>
                  <Text style={styles.sectionHelp}>{t('proposal.external_help')}</Text>

                  {externalProducts.map((p, idx) => (
                    <View key={idx} style={styles.extRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.extName}>{p.name}</Text>
                        <Text style={styles.extUrl} numberOfLines={1}>{p.url}</Text>
                        {p.store && <Text style={styles.extStore}>{p.store}</Text>}
                      </View>
                      <Pressable onPress={() => removeExternalProduct(idx)} hitSlop={8}>
                        <Ionicons name="close-circle" size={22} color={colors.error} />
                      </Pressable>
                    </View>
                  ))}

                  <View style={styles.extInputGroup}>
                    <RNTextInput
                      style={styles.extInput}
                      value={extName}
                      onChangeText={setExtName}
                      placeholder={t('proposal.product_name')}
                      placeholderTextColor={colors.textLight}
                    />
                    <RNTextInput
                      style={styles.extInput}
                      value={extUrl}
                      onChangeText={setExtUrl}
                      placeholder="https://..."
                      placeholderTextColor={colors.textLight}
                      autoCapitalize="none"
                    />
                    <RNTextInput
                      style={styles.extInput}
                      value={extStore}
                      onChangeText={setExtStore}
                      placeholder="Trendyol, Zara, ..."
                      placeholderTextColor={colors.textLight}
                    />
                    <Pressable onPress={addExternalProduct} style={styles.extAddBtn}>
                      <Ionicons name="add" size={20} color={colors.white} />
                      <Text style={styles.extAddText}>{t('proposal.add_link')}</Text>
                    </Pressable>
                  </View>

                  <View style={{ height: spacing.md }} />
                  <Button title={t('proposal.send')} onPress={saveProposal} isLoading={isSaving} />
                  <View style={{ height: spacing.sm }} />
                  <Button title={t('common.cancel')} onPress={() => setShowProposal(false)} variant="text" />
                </Card>
              ) : null
            }
          />

          {canPropose && !showProposal && (
            <Pressable
              style={[styles.fab, selectedIds.size === 0 && styles.fabDisabled]}
              onPress={() => setShowProposal(true)}
              disabled={selectedIds.size === 0 && externalProducts.length === 0}
            >
              <Ionicons name="sparkles" size={18} color={colors.white} />
              <Text style={styles.fabText}>
                {t('proposal.create')} ({selectedIds.size})
              </Text>
            </Pressable>
          )}
        </>
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
  filterBar: {
    padding: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  list: { padding: spacing.md, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  itemCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  itemImage: { width: '100%', height: 160, backgroundColor: colors.surface },
  itemPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  selectedOverlay: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: 14,
  },
  itemInfo: { padding: spacing.sm },
  itemBrand: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginTop: spacing.xs,
  },
  itemColor: { fontSize: fontSize.xs, color: colors.textSecondary },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabDisabled: { opacity: 0.5 },
  fabText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  proposalCard: { marginTop: spacing.md },
  proposalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  proposalHelp: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  sectionHelp: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  extRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  extName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  extUrl: { fontSize: fontSize.xs, color: colors.secondary },
  extStore: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  extInputGroup: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  extInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.white,
  },
  extAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  extAddText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
