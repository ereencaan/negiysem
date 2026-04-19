import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

type BadgeVariant = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'info';

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  pending: { bg: '#fff3cd', text: '#856404' },
  accepted: { bg: '#cce5ff', text: '#004085' },
  in_progress: { bg: '#d4edda', text: '#155724' },
  completed: { bg: colors.successLight, text: '#155724' },
  cancelled: { bg: colors.errorLight, text: colors.error },
  info: { bg: colors.surface, text: colors.textSecondary },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'info' }: BadgeProps) {
  const v = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});
