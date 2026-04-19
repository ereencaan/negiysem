import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { loginSchema, type LoginFormData } from '../../src/utils/validation';
import { Button } from '../../src/components/ui/Button';
import { TextInput } from '../../src/components/ui/TextInput';
import { FormError } from '../../src/components/ui/FormError';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setFormError(null);

    const result = await signIn(data);
    if (result.error) {
      setFormError(t(result.error));
      setIsSubmitting(false);
    } else {
      router.replace('/(tabs)');
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
        <View style={styles.header}>
          <View style={styles.logoIcon}>
            <Ionicons name="sparkles" size={28} color={colors.primary} />
          </View>
          <Text style={styles.logo}>Ne Giysem</Text>
          <Text style={styles.subtitle}>{t('auth.welcome_back')}</Text>
        </View>

        <FormError message={formError} />

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
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('auth.password')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message ? t(errors.password.message) : undefined}
              secureTextEntry
              autoComplete="password"
            />
          )}
        />

        <Button
          title={t('auth.login')}
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
        />

        <Button
          title={t('auth.forgot_password')}
          onPress={() => router.push('/(auth)/forgot-password')}
          variant="text"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.no_account')}</Text>
          <Button
            title={t('auth.register')}
            onPress={() => router.push('/(auth)/register-user')}
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
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
