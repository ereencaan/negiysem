import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/hooks/useAuth';
import { wardrobeService } from '../../src/services/wardrobe.service';
import { Button } from '../../src/components/ui/Button';
import { TextInput } from '../../src/components/ui/TextInput';
import { FormError } from '../../src/components/ui/FormError';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

const CATEGORIES = [
  { value: 'ust_giyim', label: 'Üst Giyim' },
  { value: 'alt_giyim', label: 'Alt Giyim' },
  { value: 'dis_giyim', label: 'Dış Giyim' },
  { value: 'ayakkabi', label: 'Ayakkabı' },
  { value: 'aksesuar', label: 'Aksesuar' },
  { value: 'elbise', label: 'Elbise' },
];

const SEASONS = [
  { value: 'ilkbahar_yaz', label: 'İlkbahar/Yaz' },
  { value: 'sonbahar_kis', label: 'Sonbahar/Kış' },
  { value: 'tum_sezonlar', label: 'Tüm Sezonlar' },
];

export default function AddWardrobeItemScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [season, setSeason] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Kamera izni gerekli');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const onSubmit = async () => {
    if (!user) return;
    if (!category) {
      setFormError('Kategori seçiniz');
      return;
    }
    if (!photoUri) {
      setFormError('Fotoğraf ekleyiniz');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const result = await wardrobeService.addWardrobeItem({
      userId: user.id,
      photoUri,
      category,
      color: color || undefined,
      brand: brand || undefined,
      season: season || undefined,
      description: description || undefined,
    });

    if (result.error) {
      setFormError(t(result.error));
      setIsSubmitting(false);
    } else {
      // Reset form
      setPhotoUri(null);
      setCategory('');
      setSeason('');
      setColor('');
      setBrand('');
      setDescription('');
      setIsSubmitting(false);
      Alert.alert(t('wardrobe.item_added'));
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>{t('wardrobe.add_item')}</Text>

        <FormError message={formError} />

        {/* Photo Section */}
        {photoUri ? (
          <Pressable onPress={pickImage} style={styles.photoPreviewContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <View style={styles.photoOverlay}>
              <Ionicons name="camera-outline" size={24} color={colors.white} />
              <Text style={styles.photoOverlayText}>Değiştir</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.photoButtons}>
            <Pressable style={styles.photoBtn} onPress={pickImage}>
              <View style={styles.photoBtnIcon}>
                <Ionicons name="images-outline" size={28} color={colors.primary} />
              </View>
              <Text style={styles.photoBtnText}>{t('wardrobe.choose_from_gallery')}</Text>
            </Pressable>
            <Pressable style={styles.photoBtn} onPress={takePhoto}>
              <View style={styles.photoBtnIcon}>
                <Ionicons name="camera-outline" size={28} color={colors.primary} />
              </View>
              <Text style={styles.photoBtnText}>{t('wardrobe.take_photo')}</Text>
            </Pressable>
          </View>
        )}

        {/* Category Selection */}
        <Text style={styles.label}>{t('wardrobe.category')} *</Text>
        <View style={styles.chipContainer}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.value}
              onPress={() => setCategory(cat.value)}
              style={[styles.chip, category === cat.value && styles.chipActive]}
            >
              <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Season */}
        <Text style={styles.label}>{t('wardrobe.season')}</Text>
        <View style={styles.chipContainer}>
          {SEASONS.map(s => (
            <Pressable
              key={s.value}
              onPress={() => setSeason(prev => prev === s.value ? '' : s.value)}
              style={[styles.chip, season === s.value && styles.chipActive]}
            >
              <Text style={[styles.chipText, season === s.value && styles.chipTextActive]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput label={t('wardrobe.color')} value={color} onChangeText={setColor} placeholder="Örn: Siyah, Mavi..." />
        <TextInput label={t('wardrobe.brand')} value={brand} onChangeText={setBrand} placeholder="Örn: Zara, H&M..." />
        <TextInput label={t('wardrobe.description')} value={description} onChangeText={setDescription} placeholder="Kıyafet hakkında not..." multiline numberOfLines={3} />

        <Button title={t('wardrobe.add_item')} onPress={onSubmit} isLoading={isSubmitting} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.xl, paddingTop: spacing.xxxl },
  backButton: { marginBottom: spacing.lg, width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xxl },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text, marginBottom: spacing.sm },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  photoButtons: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  photoBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.primarySoft,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  photoBtnIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  photoBtnText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.medium, textAlign: 'center' },
  photoPreviewContainer: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    alignSelf: 'center',
    width: 240,
    height: 240,
    backgroundColor: colors.surface,
  },
  photoPreview: { width: '100%', height: '100%', borderRadius: borderRadius.lg, resizeMode: 'cover' },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  photoOverlayText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
