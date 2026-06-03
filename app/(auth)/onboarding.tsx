import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  type ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

const ONBOARDING_KEY = 'negiysem_onboarding_seen';

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  highlight?: string;
}

const slides: Slide[] = [
  {
    id: '1',
    icon: 'shirt-outline',
    iconBg: colors.primarySoft,
    iconColor: colors.primary,
    title: 'Gardırobunu Dijitalleştir',
    description: 'Dolabındaki kıyafetleri fotoğrafla, kategorize et. Tüm gardırobun cebinde.',
    highlight: 'Fotoğrafla, kategorize et',
  },
  {
    id: '2',
    icon: 'people-outline',
    iconBg: '#e3f2fd',
    iconColor: '#1565c0',
    title: 'Profesyonel Stilist Bul',
    description: 'Onlarca onaylı stilist arasından tarzına uygun olanı seç. Fiyatları, puanları ve portfolyolarını incele.',
    highlight: 'Tarzına uygun stilist',
  },
  {
    id: '3',
    icon: 'sparkles-outline',
    iconBg: '#fff8e1',
    iconColor: '#f5a623',
    title: 'Kişisel Kombin Al',
    description: 'Stilistin senin kıyafetlerinden kombin önerir. Eksik parça varsa alışveriş linki ekler.',
    highlight: 'Senin kıyafetlerinden',
  },
  {
    id: '4',
    icon: 'wallet-outline',
    iconBg: '#e8f5e9',
    iconColor: '#2e7d32',
    title: 'Kombin Yap, Para Kazan',
    description: 'Sen de stilist ol! Diğer kullanıcılara kombin öner ve her kombinden kazanç elde et.',
    highlight: 'Stilist ol, kazan',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(auth)/welcome');
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <View style={styles.illustrationArea}>
        <View style={[styles.iconOuter, { backgroundColor: item.iconBg }]}>
          <View style={[styles.iconInner, { backgroundColor: colors.white }]}>
            <Ionicons name={item.icon} size={56} color={item.iconColor} />
          </View>
        </View>

        {/* Decorative dots */}
        <View style={[styles.dot, styles.dot1, { backgroundColor: item.iconBg }]} />
        <View style={[styles.dot, styles.dot2, { backgroundColor: item.iconColor + '30' }]} />
        <View style={[styles.dot, styles.dot3, { backgroundColor: item.iconBg }]} />
      </View>

      <View style={styles.textArea}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    </View>
  );

  const isLast = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.skipRow}>
        {!isLast && (
          <Pressable onPress={completeOnboarding} hitSlop={12}>
            <Text style={styles.skipText}>Atla</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.pageDot,
              i === currentIndex ? styles.pageDotActive : styles.pageDotInactive,
            ]}
          />
        ))}
      </View>

      {/* Action button */}
      <View style={styles.bottomArea}>
        <Pressable
          onPress={goNext}
          style={({ pressed }) => [
            styles.mainButton,
            pressed && styles.mainButtonPressed,
          ]}
        >
          <Text style={styles.mainButtonText}>
            {isLast ? 'Hadi Başlayalım!' : 'Devam'}
          </Text>
          <Ionicons
            name={isLast ? 'sparkles' : 'arrow-forward'}
            size={20}
            color={colors.white}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export { ONBOARDING_KEY };

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    minHeight: 40,
  },
  skipText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  illustrationArea: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    position: 'relative',
    height: 200,
    justifyContent: 'center',
  },
  iconOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  dot: {
    position: 'absolute',
    borderRadius: 999,
  },
  dot1: {
    width: 16,
    height: 16,
    top: 20,
    right: width * 0.15,
  },
  dot2: {
    width: 24,
    height: 24,
    bottom: 10,
    left: width * 0.12,
  },
  dot3: {
    width: 10,
    height: 10,
    top: 60,
    left: width * 0.18,
  },
  textArea: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  slideTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 36,
  },
  slideDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  pageDot: {
    height: 8,
    borderRadius: 4,
  },
  pageDotActive: {
    width: 28,
    backgroundColor: colors.primary,
  },
  pageDotInactive: {
    width: 8,
    backgroundColor: colors.border,
  },
  bottomArea: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.primaryLight,
  },
  mainButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
