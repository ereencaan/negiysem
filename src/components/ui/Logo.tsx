import React, { useState } from 'react';
import { View, Text, Pressable, Modal, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
  showInfo?: boolean;
}

const sizeMap = {
  small: { mark: 44, wordmark: { w: 150, h: 64 }, info: 20, subtitle: 11 },
  medium: { mark: 72, wordmark: { w: 230, h: 96 }, info: 24, subtitle: 13 },
  large: { mark: 104, wordmark: { w: 320, h: 136 }, info: 30, subtitle: 14 },
};

export function Logo({
  size = 'medium',
  showText = true,
  showSubtitle = false,
  subtitle,
  showInfo = true,
}: LogoProps) {
  const [infoVisible, setInfoVisible] = useState(false);
  const s = sizeMap[size];

  return (
    <View style={styles.wrapper}>
      <View style={styles.lockupRow}>
        {showText ? (
          <Image
            source={require('../../../assets/images/logo-mark.png')}
            style={{ width: s.wordmark.w, height: s.wordmark.h }}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require('../../../assets/images/icon.png')}
            style={{ width: s.mark, height: s.mark }}
            resizeMode="contain"
          />
        )}
        {showInfo && (
          <Pressable
            onPress={() => setInfoVisible(true)}
            hitSlop={10}
            style={styles.infoBtn}
          >
            <Ionicons name="help-circle-outline" size={s.info} color={colors.primary} />
          </Pressable>
        )}
      </View>

      {showSubtitle && subtitle && (
        <Text style={[styles.subtitle, { fontSize: s.subtitle }]}>{subtitle}</Text>
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
  lockupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoBtn: {
    padding: 2,
  },
  subtitle: {
    color: colors.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: fontWeight.medium,
    marginTop: spacing.sm,
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
