import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors, fontWeight } from '../../constants/theme';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
}

export function Avatar({ uri, name, size = 48 }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surface,
  },
  placeholder: {
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});
