import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { registerStylistSchema, type RegisterStylistFormData } from '../../src/utils/validation';
import { Button } from '../../src/components/ui/Button';
import { TextInput } from '../../src/components/ui/TextInput';
import { FormError } from '../../src/components/ui/FormError';
import { colors, spacing, fontSize, fontWeight } from '../../src/constants/theme';

export default function RegisterStylistScreen() {
  const { t } = useTranslation();
  const { signUpStylist } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterStylistFormData>({
    resolver: zodResolver(registerStylistSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      passwordConfirm: '',
      bio: '',
      cvText: '',
      instagramUrl: '',
      pricePerOutfit: 0,
    },
  });

  const onSubmit = async (data: RegisterStylistFormData) => {
    setIsSubmitting(true);
    setFormError(null);

    const result = await signUpStylist(data);
    if (result.error) {
      setFormError(t(result.error));
    } else {
      Alert.alert('', t('auth.stylist_pending'), [
        { text: 'Tamam', onPress: () => {} },
      ]);
    }
    setIsSubmitting(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>{t('auth.register_stylist_title')}</Text>

        <FormError message={formError} />

        {/* Temel Bilgiler */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('auth.name')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message ? t(errors.name.message) : undefined}
              autoComplete="name"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('auth.email')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message ? t(errors.email.message) : undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('auth.phone')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('auth.password')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message ? t(errors.password.message) : undefined}
              secureTextEntry
            />
          )}
        />

        <Controller
          control={control}
          name="passwordConfirm"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('auth.password_confirm')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.passwordConfirm?.message ? t(errors.passwordConfirm.message) : undefined}
              secureTextEntry
            />
          )}
        />

        {/* Stilist Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stilist Bilgileri</Text>
        </View>

        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('auth.bio')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.bio?.message ? t(errors.bio.message) : undefined}
              placeholder={t('auth.bio_placeholder')}
              multiline
              numberOfLines={3}
            />
          )}
        />

        <Controller
          control={control}
          name="cvText"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('auth.cv_text')}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('auth.cv_text_placeholder')}
              multiline
              numberOfLines={3}
            />
          )}
        />

        <Controller
          control={control}
          name="instagramUrl"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('auth.instagram_url')}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('auth.instagram_placeholder')}
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="pricePerOutfit"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('auth.price_per_outfit')}
              value={value ? String(value) : ''}
              onChangeText={(text) => {
                const num = parseFloat(text);
                onChange(isNaN(num) ? undefined : num);
              }}
              onBlur={onBlur}
              error={errors.pricePerOutfit?.message ? t(errors.pricePerOutfit.message) : undefined}
              keyboardType="numeric"
            />
          )}
        />

        <Button
          title={t('auth.register')}
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.have_account')}</Text>
          <Button
            title={t('auth.login')}
            onPress={() => router.replace('/(auth)/login')}
            variant="text"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
  },
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
    marginBottom: spacing.xxl,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
