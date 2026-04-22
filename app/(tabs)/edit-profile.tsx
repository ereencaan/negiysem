import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/hooks/useAuth';
import { profileService } from '../../src/services/profile.service';
import { authService } from '../../src/services/auth.service';
import { supabase } from '../../src/lib/supabase';
import { Avatar } from '../../src/components/ui/Avatar';
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
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Card info (display only - for regular users)
  const [cardHolder, setCardHolder] = useState('');
  const [cardLastFour, setCardLastFour] = useState('');

  // Stylist fields
  const [bio, setBio] = useState(user?.stylistProfile?.bio || '');
  const [cvText, setCvText] = useState(user?.stylistProfile?.cvText || '');
  const [stylistInsta, setStylistInsta] = useState(user?.stylistProfile?.instagramUrl || '');
  const [price, setPrice] = useState(
    user?.stylistProfile?.pricePerOutfit
      ? String(user.stylistProfile.pricePerOutfit)
      : '',
  );
  const [iban, setIban] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // Load existing card/IBAN on mount
  React.useEffect(() => {
    if (!user) return;
    supabase.from('users').select('card_last_four, card_holder_name').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          const d = data as { card_last_four: string | null; card_holder_name: string | null };
          if (d.card_last_four) setCardLastFour(d.card_last_four);
          if (d.card_holder_name) setCardHolder(d.card_holder_name);
        }
      });
    if (isStylist) {
      supabase.from('stylist_profiles').select('iban, bank_name, account_holder').eq('user_id', user.id).single()
        .then(({ data }) => {
          if (data) {
            const d = data as { iban: string | null; bank_name: string | null; account_holder: string | null };
            if (d.iban) setIban(d.iban);
            if (d.bank_name) setBankName(d.bank_name);
            if (d.account_holder) setAccountHolder(d.account_holder);
          }
        });
    }
  }, [user, isStylist]);

  const pickPhoto = async () => {
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

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    // Upload profile photo if changed
    let profilePhotoPath: string | undefined;
    if (photoUri) {
      try {
        const fileName = `${user.id}/profile_${Date.now()}.jpg`;
        const response = await fetch(photoUri);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const { error: uploadError } = await supabase.storage
          .from('feed')
          .upload(fileName, file, { contentType: 'image/jpeg', upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('feed').getPublicUrl(fileName);
          profilePhotoPath = urlData.publicUrl;
        }
      } catch {}
    }

    const updateData: Record<string, unknown> = {
      name: name || null,
      phone: phone || null,
      instagram_url: instagramUrl || null,
      card_holder_name: !isStylist ? (cardHolder || null) : undefined,
      card_last_four: !isStylist ? (cardLastFour || null) : undefined,
    };
    if (profilePhotoPath) updateData.profile_photo = profilePhotoPath;

    const { error: userError } = await supabase.from('users').update(updateData).eq('id', user.id);

    let stylistError = false;
    if (isStylist) {
      const stylistResult = await profileService.updateStylistProfile(user.id, {
        bio,
        cvText,
        instagramUrl: stylistInsta,
        pricePerOutfit: price ? Number(price) : undefined,
      });

      // Save IBAN
      await supabase.from('stylist_profiles').update({
        iban: iban || null,
        bank_name: bankName || null,
        account_holder: accountHolder || null,
      }).eq('user_id', user.id);
      if (stylistResult.error) stylistError = true;
    }

    setIsSaving(false);

    if (userError || stylistError) {
      Alert.alert(t('errors.generic'));
      return;
    }

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

          {/* Profile Photo */}
          <Pressable onPress={pickPhoto} style={styles.photoSection}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <Avatar name={user?.name} size={96} />
            )}
            <View style={styles.photoOverlay}>
              <Ionicons name="camera" size={20} color={colors.white} />
            </View>
            <Text style={styles.changePhotoText}>{t('profile.change_photo')}</Text>
          </Pressable>

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

          {/* Payment Card - only for regular users */}
          {!isStylist && (
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>{t('payment.card_info')}</Text>
              </View>
              <Text style={styles.sectionHelp}>{t('payment.card_help')}</Text>
              <TextInput
                label={t('payment.card_holder')}
                value={cardHolder}
                onChangeText={setCardHolder}
                placeholder="Ad Soyad"
                autoCapitalize="words"
              />
              <TextInput
                label={t('payment.card_last_four')}
                value={cardLastFour}
                onChangeText={(text) => setCardLastFour(text.replace(/\D/g, '').slice(0, 4))}
                placeholder="Son 4 hane"
                keyboardType="numeric"
                maxLength={4}
              />
            </Card>
          )}

          {isStylist && (
            <>
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
                <Text style={styles.commissionNote}>{t('payment.commission_note')}</Text>
              </Card>

              <Card style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="wallet-outline" size={20} color={colors.success} />
                  <Text style={styles.sectionTitle}>{t('payment.bank_info')}</Text>
                </View>
                <Text style={styles.sectionHelp}>{t('payment.bank_help')}</Text>
                <TextInput
                  label={t('payment.account_holder')}
                  value={accountHolder}
                  onChangeText={setAccountHolder}
                  placeholder="Ad Soyad"
                  autoCapitalize="words"
                />
                <TextInput
                  label={t('payment.iban')}
                  value={iban}
                  onChangeText={setIban}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  autoCapitalize="characters"
                />
                <TextInput
                  label={t('payment.bank_name')}
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="Banka adı"
                />
              </Card>
            </>
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
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  photoPreview: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 20,
    right: '50%',
    marginRight: -48,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  changePhotoText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
    marginTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  sectionHelp: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  commissionNote: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
});
