import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  Pressable,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius, fontWeight } from '../../constants/theme';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label: string;
  error?: string;
}

export function TextInput({ label, error, secureTextEntry, ...props }: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = !!secureTextEntry;
  const showPlain = isPassword && isVisible;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        <RNTextInput
          style={styles.input}
          placeholderTextColor={colors.textLight}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPlain}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setIsVisible(v => !v)}
            style={styles.visibilityToggle}
            hitSlop={8}
          >
            <Ionicons
              name={showPlain ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    minHeight: 52,
    paddingRight: spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: colors.error,
  },
  visibilityToggle: {
    padding: spacing.xs,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
