import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/hooks/useAuth';
import {
  createStylistProfileSchema,
  type CreateStylistProfileFormData,
} from '../../src/utils/validation';
import { Button } from '../../src/components/ui/Button';
import { TextInput } from '../../src/components/ui/TextInput';
import { FormError } from '../../src/components/ui/FormError';
import { colors, spacing, fontSize, fontWeight } from '../../src/constants/theme';

export default function BecomeStylistScreen() {
  const { t } = useTranslation();
  const { createStylistProfile } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<CreateStylistProfileFormData>({
    resolver: zodResolver(createStylistProfileSchema),
    defaultValues: { bio: '', cvText: '', instagramUrl: '', pricePerOutfit: undefined },
  });

  const onSubmit = async (data: CreateStylistProfileFormData) => {
    setIsSubmitting(true);
    setFormError(null);

    const result = await createStylistProfile(data);
    if (result.error) {
      setFormError(t(result.error));
    } else {
      Alert.alert(t('stylist.profile_created'));
      router.replace('/(tabs)');
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
        <Text style={styles.title}>{t('stylist.become_stylist')}</Text>
        <Text style={styles.description}>{t('stylist.become_stylist_description')}</Text>

        <FormError message={formError} />

        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('auth.bio')}
              placeholder={t('auth.bio_placeholder')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.bio?.message ? t(errors.bio.message) : undefined}
              multiline
              numberOfLines={4}
            />
          )}
        />

        <Controller
          control={control}
          name="cvText"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('auth.cv_text')}
              placeholder={t('auth.cv_text_placeholder')}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
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
              placeholder={t('auth.instagram_placeholder')}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
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
              value={value !== undefined ? String(value) : ''}
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
          title={t('stylist.become_stylist')}
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
        />
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
});
