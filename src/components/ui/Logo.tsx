import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
}

export function Logo({
  size = 'medium',
  showText = true,
  showSubtitle = false,
  subtitle,
}: LogoProps) {
  const sizeMap = {
    small: { container: 48, icon: 22, mainIcon: 20, sparkle: 10, badge: 18, font: fontSize.xl },
    medium: { container: 72, icon: 32, mainIcon: 30, sparkle: 14, badge: 26, font: 36 },
    large: { container: 104, icon: 44, mainIcon: 42, sparkle: 20, badge: 36, font: 48 },
  };
  const s = sizeMap[size];

  return (
    <View style={styles.wrapper}>
      <View style={[styles.outerRing, { width: s.container, height: s.container, borderRadius: s.container / 2 }]}>
        <View style={[styles.innerCircle, { width: s.container - 12, height: s.container - 12, borderRadius: (s.container - 12) / 2 }]}>
          <Ionicons name="shirt" size={s.mainIcon} color={colors.primary} />
          <View
            style={[
              styles.sparkleBadge,
              {
                width: s.badge,
                height: s.badge,
                borderRadius: s.badge / 2,
                top: -2,
                right: -2,
              },
            ]}
          >
            <Ionicons name="sparkles" size={s.sparkle} color={colors.white} />
          </View>
        </View>
      </View>

      {showText && (
        <Text style={[styles.logoText, { fontSize: s.font }]}>
          Ne <Text style={styles.logoAccent}>Giysem</Text>
        </Text>
      )}

      {showSubtitle && subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  outerRing: {
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  innerCircle: {
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  sparkleBadge: {
    position: 'absolute',
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  logoText: {
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  logoAccent: {
    color: colors.primary,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: fontWeight.medium,
  },
});
