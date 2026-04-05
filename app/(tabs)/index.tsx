import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { Button } from '../../src/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { colors, spacing, fontSize, fontWeight } from '../../src/constants/theme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.welcome}>Merhaba, {user?.name || 'Kullanıcı'}!</Text>
        <Text style={styles.info}>E-posta: {user?.email}</Text>
        <Text style={styles.info}>
          Hesap Türü: {user?.userType === 'stylist' ? 'Stilist' : 'Kullanıcı'}
        </Text>

        <View style={styles.logoutContainer}>
          <Button
            title={t('auth.logout')}
            onPress={signOut}
            variant="secondary"
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
    alignItems: 'center',
  },
  welcome: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  info: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  logoutContainer: {
    marginTop: spacing.xxxl,
    width: '100%',
  },
});
