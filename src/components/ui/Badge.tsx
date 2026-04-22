import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

type BadgeVariant = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'info';

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  pending: { bg: '#fff8e1', text: '#f57f17' },
  accepted: { bg: '#e3f2fd', text: '#1565c0' },
  in_progress: { bg: '#e8f5e9', text: '#2e7d32' },
  completed: { bg: colors.successLight, text: '#1b5e20' },
  cancelled: { bg: '#fce4ec', text: '#c62828' },
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
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
});
