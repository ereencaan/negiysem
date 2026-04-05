import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { UserTypeCard } from '../../src/components/auth/UserTypeCard';
import { Button } from '../../src/components/ui/Button';
import { colors, spacing, fontSize, fontWeight } from '../../src/constants/theme';

export default function RegisterChoiceScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.logo}>Ne Giysem</Text>
        <Text style={styles.title}>{t('auth.register_choice_title')}</Text>

        <View style={styles.cards}>
          <UserTypeCard
            title={t('auth.register_as_user')}
            description={t('auth.user_card_description')}
            icon="shirt-outline"
            onPress={() => router.push('/(auth)/register-user')}
          />

          <UserTypeCard
            title={t('auth.register_as_stylist')}
            description={t('auth.stylist_card_description')}
            icon="color-palette-outline"
            onPress={() => router.push('/(auth)/register-stylist')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.have_account')}</Text>
          <Button
            title={t('auth.login')}
            onPress={() => router.back()}
            variant="text"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  logo: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  cards: {
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
