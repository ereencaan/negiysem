import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import type { ActiveRole } from '../../types/auth.types';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

export function RoleSwitcher() {
  const { t } = useTranslation();
  const { activeRole, setActiveRole, isStylist } = useAuth();

  if (!isStylist) return null;

  const options: { role: ActiveRole; label: string }[] = [
    { role: 'user', label: t('stylist.switch_to_user') },
    { role: 'stylist', label: t('stylist.switch_to_stylist') },
  ];

  return (
    <View style={styles.container}>
      {options.map(({ role, label }) => {
        const isActive = activeRole === role;
        return (
          <Pressable
            key={role}
            onPress={() => setActiveRole(role)}
            style={[styles.option, isActive && styles.optionActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 3,
  },
  option: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  optionActive: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.white,
  },
});
