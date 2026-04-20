import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
  showInfo?: boolean;
}

export function Logo({
  size = 'medium',
  showText = true,
  showSubtitle = false,
  subtitle,
  showInfo = true,
}: LogoProps) {
  const [infoVisible, setInfoVisible] = useState(false);
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
        <View style={styles.titleRow}>
          <Text style={[styles.logoText, { fontSize: s.font }]}>
            Ne <Text style={styles.logoAccent}>Giysem</Text>
          </Text>
          {showInfo && (
            <Pressable
              onPress={() => setInfoVisible(true)}
              hitSlop={10}
              style={styles.infoBtn}
            >
              <Ionicons name="help-circle-outline" size={s.font * 0.6} color={colors.primary} />
            </Pressable>
          )}
        </View>
      )}

      {showSubtitle && subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}

      <Modal
        visible={infoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setInfoVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation?.()}>
            <View style={styles.modalIcon}>
              <Ionicons name="sparkles" size={28} color={colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Ne Giysem Nedir?</Text>
            <Text style={styles.modalBody}>
              Kendi gardırobundaki kıyafetlerle profesyonel stilistlerden kişisel
              kombin önerileri al. Etkinliğe, ruh haline veya hava durumuna göre
              &ldquo;Ne giysem?&rdquo; sorusuna cevap bulmanın en kolay yolu.
            </Text>
            <View style={styles.modalFeatures}>
              <Feature icon="shirt-outline" text="Gardırobunu dijitalleştir" />
              <Feature icon="people-outline" text="Uzman stilistlerle eşleş" />
              <Feature icon="chatbubbles-outline" text="Anında mesajlaş" />
              <Feature icon="heart-outline" text="Kombinleri keşfet ve beğen" />
            </View>
            <Pressable onPress={() => setInfoVisible(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Anladım</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Feature({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.featureText}>{text}</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoBtn: {
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  modalFeatures: {
    alignSelf: 'stretch',
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  modalClose: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  modalCloseText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
});
