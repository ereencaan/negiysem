import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  SafeAreaView,
  TextInput as RNTextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/hooks/useAuth';
import { feedService } from '../../src/services/feed.service';
import { Button } from '../../src/components/ui/Button';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

const CATEGORIES = [
  { id: 'gunluk', label: 'Günlük' },
  { id: 'ofis', label: 'Ofis' },
  { id: 'davet', label: 'Davet' },
  { id: 'spor', label: 'Spor' },
  { id: 'sokak', label: 'Sokak Tarzı' },
];

export default function CreatePostScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [category, setCategory] = useState('gunluk');
  const [isPosting, setIsPosting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '').toLowerCase();
    if (tag && !hashtags.includes(tag)) {
      setHashtags(prev => [...prev, tag]);
    }
    setHashtagInput('');
  };

  const removeHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
  };

  const handlePost = async () => {
    if (!user || !imageUri) return;
    setIsPosting(true);
    const result = await feedService.createFeedPost(
      user.id,
      imageUri,
      caption.trim() || undefined,
      hashtags.length > 0 ? hashtags : undefined,
      category,
    );
    setIsPosting(false);
    if (result.data) {
      Alert.alert(t('feed.post_shared'));
      router.back();
    } else {
      Alert.alert(t('errors.generic'));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>{t('feed.new_post')}</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Image picker */}
        <Pressable onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={48} color={colors.textLight} />
              <Text style={styles.imagePickerText}>{t('feed.select_photo')}</Text>
            </View>
          )}
        </Pressable>

        {/* Caption */}
        <RNTextInput
          style={styles.captionInput}
          value={caption}
          onChangeText={setCaption}
          placeholder={t('feed.caption_placeholder')}
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={3}
        />

        {/* Category */}
        <Text style={styles.sectionLabel}>{t('feed.select_category')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[styles.catChip, category === cat.id && styles.catChipActive]}
              >
                <Text style={[styles.catText, category === cat.id && styles.catTextActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Hashtags */}
        <Text style={styles.sectionLabel}>{t('feed.add_hashtags')}</Text>
        <View style={styles.hashtagInputRow}>
          <Text style={styles.hashSign}>#</Text>
          <RNTextInput
            style={styles.hashtagInput}
            value={hashtagInput}
            onChangeText={setHashtagInput}
            placeholder="kombinönerisi"
            placeholderTextColor={colors.textLight}
            autoCapitalize="none"
            onSubmitEditing={addHashtag}
          />
          <Pressable onPress={addHashtag} style={styles.addHashBtn}>
            <Ionicons name="add" size={20} color={colors.white} />
          </Pressable>
        </View>
        {hashtags.length > 0 && (
          <View style={styles.hashtagList}>
            {hashtags.map(tag => (
              <Pressable key={tag} onPress={() => removeHashtag(tag)} style={styles.hashtagChip}>
                <Text style={styles.hashtagText}>#{tag}</Text>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xl }} />
        <Button
          title={t('feed.share')}
          onPress={handlePost}
          isLoading={isPosting}
          disabled={!imageUri}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  imagePicker: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
  },
  imagePickerText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.card,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoryScroll: { marginBottom: spacing.lg },
  categoryRow: { flexDirection: 'row', gap: spacing.sm },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { fontSize: fontSize.sm, color: colors.textSecondary },
  catTextActive: { color: colors.white, fontWeight: fontWeight.semibold },
  hashtagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  hashSign: { fontSize: fontSize.xl, color: colors.primary, fontWeight: fontWeight.bold },
  hashtagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.card,
  },
  addHashBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hashtagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  hashtagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySoft,
  },
  hashtagText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.medium },
});
