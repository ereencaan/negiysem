import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { Logo } from '../../src/components/ui/Logo';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <Logo size="large" showText showSubtitle subtitle={t('auth.welcome_subtitle')} />
        </View>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="shirt-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{t('auth.welcome_for_users')}</Text>
              <Text style={styles.featureDesc}>Gardırobunuzu dijitalleştirin</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="color-palette-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{t('auth.welcome_for_stylists')}</Text>
              <Text style={styles.featureDesc}>Profesyonel kombin hizmeti</Text>
            </View>
          </View>
        </View>

        <Text style={styles.description}>{t('auth.welcome_description')}</Text>

        <View style={styles.buttons}>
          <Button
            title={t('auth.login')}
            onPress={() => router.push('/(auth)/login')}
            variant="primary"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title={t('auth.register')}
            onPress={() => router.push('/(auth)/register-user')}
            variant="secondary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  features: {
    marginBottom: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  featureDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxxl,
  },
  buttons: {},
  buttonSpacer: {
    height: spacing.md,
  },
});
