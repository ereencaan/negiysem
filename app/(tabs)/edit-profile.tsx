import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { profileService } from '../../src/services/profile.service';
import { authService } from '../../src/services/auth.service';
import { Button } from '../../src/components/ui/Button';
import { TextInput } from '../../src/components/ui/TextInput';
import { Card } from '../../src/components/ui/Card';
import { colors, spacing, fontSize, fontWeight } from '../../src/constants/theme';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { user, isStylist } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [instagramUrl, setInstagramUrl] = useState(user?.instagramUrl || '');

  const [bio, setBio] = useState(user?.stylistProfile?.bio || '');
  const [cvText, setCvText] = useState(user?.stylistProfile?.cvText || '');
  const [stylistInsta, setStylistInsta] = useState(user?.stylistProfile?.instagramUrl || '');
  const [price, setPrice] = useState(
    user?.stylistProfile?.pricePerOutfit
      ? String(user.stylistProfile.pricePerOutfit)
      : '',
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const userResult = await profileService.updateUserProfile(user.id, {
      name,
      phone,
      instagramUrl,
    });

    let stylistResult = { data: true, error: null } as { data: boolean | null; error: string | null };
    if (isStylist) {
      stylistResult = await profileService.updateStylistProfile(user.id, {
        bio,
        cvText,
        instagramUrl: stylistInsta,
        pricePerOutfit: price ? Number(price) : undefined,
      });
    }

    setIsSaving(false);

    if (userResult.error || stylistResult.error) {
      Alert.alert(t('errors.generic'));
      return;
    }

    // Re-fetch user so context has latest
    await authService.getCurrentUser();
    Alert.alert(t('profile.save_success'));
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <Text style={styles.title}>{t('profile.edit_profile')}</Text>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.account_info')}</Text>
            <TextInput label={t('auth.name')} value={name} onChangeText={setName} />
            <TextInput
              label={t('auth.phone')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              label={t('auth.instagram_url')}
              value={instagramUrl}
              onChangeText={setInstagramUrl}
              placeholder="@kullaniciadi"
              autoCapitalize="none"
            />
          </Card>

          {isStylist && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.stylist_profile')}</Text>
              <TextInput
                label={t('auth.bio')}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
              />
              <TextInput
                label={t('auth.cv_text')}
                value={cvText}
                onChangeText={setCvText}
                multiline
                numberOfLines={6}
              />
              <TextInput
                label={t('auth.instagram_url')}
                value={stylistInsta}
                onChangeText={setStylistInsta}
                placeholder="@stilisthesap"
                autoCapitalize="none"
              />
              <TextInput
                label={t('auth.price_per_outfit')}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </Card>
          )}

          <Button
            title={t('common.save')}
            onPress={handleSave}
            isLoading={isSaving}
          />
          <View style={{ height: spacing.sm }} />
          <Button
            title={t('common.cancel')}
            onPress={() => router.back()}
            variant="text"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { padding: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxxl },
  backButton: {
    marginBottom: spacing.lg,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
});
