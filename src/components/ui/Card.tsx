import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadow } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, onPress, style }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 0,
    ...shadow.sm,
  },
  pressed: {
    backgroundColor: colors.surface,
    transform: [{ scale: 0.98 }],
  },
});
