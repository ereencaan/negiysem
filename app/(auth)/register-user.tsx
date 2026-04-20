import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { registerUserSchema, type RegisterUserFormData } from '../../src/utils/validation';
import { Button } from '../../src/components/ui/Button';
import { TextInput } from '../../src/components/ui/TextInput';
import { FormError } from '../../src/components/ui/FormError';
import { colors, spacing, fontSize, fontWeight } from '../../src/constants/theme';

export default function RegisterUserScreen() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterUserFormData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', passwordConfirm: '' },
  });

  const onSubmit = async (data: RegisterUserFormData) => {
    setIsSubmitting(true);
    setFormError(null);

    const result = await signUp(data);
    if (result.error) {
      setFormError(t(result.error));
      setIsSubmitting(false);
    } else {
      router.replace('/(auth)/login?registered=true');
    }
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

        <Text style={styles.title}>{t('auth.register_title')}</Text>

        <FormError message={formError} />

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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
