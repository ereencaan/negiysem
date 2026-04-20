import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import {
  stylistService,
  type StylistListItem,
  type StylistPortfolioItem,
} from '../../src/services/stylist.service';
import { requestService } from '../../src/services/request.service';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { TextInput } from '../../src/components/ui/TextInput';
import { Card } from '../../src/components/ui/Card';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

export default function StylistDetailScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [stylist, setStylist] = useState<StylistListItem | null>(null);
  const [portfolio, setPortfolio] = useState<StylistPortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    Promise.all([
      stylistService.getStylistById(id),
      stylistService.getStylistPortfolio(id),
    ])
      .then(([stylistData, portfolioData]) => {
        setStylist(stylistData);
        setPortfolio(portfolioData);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const sendRequest = async () => {
    if (!user || !stylist) return;
    setIsSending(true);
    const result = await requestService.createOutfitRequest({
      userId: user.id,
      stylistId: stylist.id,
      occasion: occasion || undefined,
      budgetRange: budget || undefined,
      message: message || undefined,
    });
    if (result.data) {
      Alert.alert(t('stylists.request_sent'));
      router.back();
    }
    setIsSending(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!stylist) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Stilist bulunamadı</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.header}>
          <Avatar name={stylist.name} uri={stylist.profilePhoto} size={96} />
          <Text style={styles.name}>{stylist.name || 'Stilist'}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#f5a623" />
            <Text style={styles.rating}>
              {stylist.rating > 0 ? stylist.rating.toFixed(1) : '-'}
            </Text>
            <Text style={styles.reviews}>
              ({stylist.totalReviews} {t('stylists.reviews')})
            </Text>
          </View>
          {stylist.isVerified && <Badge label={t('stylists.verified')} variant="completed" />}
        </View>

        <Card style={styles.section}>
          {stylist.bio && <Text style={styles.bio}>{stylist.bio}</Text>}
          {stylist.instagramUrl && (
            <View style={styles.instagramRow}>
              <Ionicons name="logo-instagram" size={16} color={colors.secondary} />
              <Text style={styles.instagram}>{stylist.instagramUrl}</Text>
            </View>
          )}
          {stylist.pricePerOutfit && (
            <Text style={styles.price}>
              {stylist.pricePerOutfit}₺ {t('stylists.per_outfit')}
            </Text>
          )}
        </Card>

        {stylist.cvText && (
          <Card style={styles.section}>
            <Text style={styles.cvTitle}>{t('stylists.cv_title')}</Text>
            <Text style={styles.cvText}>{stylist.cvText}</Text>
          </Card>
        )}

        {portfolio.length > 0 && (
          <View style={styles.portfolioSection}>
            <Text style={styles.portfolioTitle}>{t('stylists.portfolio')}</Text>
            <View style={styles.portfolioGrid}>
              {portfolio.map((item) => (
                <View key={item.id} style={styles.portfolioItem}>
                  <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} />
                </View>
              ))}
            </View>
          </View>
        )}

        {!showRequestForm ? (
          <Button
            title={t('stylists.send_request')}
            onPress={() => setShowRequestForm(true)}
          />
        ) : (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{t('stylists.send_request')}</Text>
            <TextInput
              label={t('stylists.occasion')}
              value={occasion}
              onChangeText={setOccasion}
              placeholder={t('stylists.occasion_placeholder')}
            />
            <TextInput
              label={t('stylists.budget')}
              value={budget}
              onChangeText={setBudget}
              placeholder={t('stylists.budget_placeholder')}
            />
            <TextInput
              label={t('stylists.message')}
              value={message}
              onChangeText={setMessage}
              placeholder={t('stylists.message_placeholder')}
              multiline
              numberOfLines={3}
            />
            <Button
              title={t('common.send')}
              onPress={sendRequest}
              isLoading={isSending}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: spacing.xl, paddingTop: spacing.xxxl },
  backButton: {
    marginBottom: spacing.lg,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: spacing.sm,
  },
  rating: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  reviews: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.secondary,
  },
  instagramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  instagram: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: fontWeight.medium,
  },
  cvTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cvText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
  portfolioSection: {
    marginBottom: spacing.xl,
  },
  portfolioTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  portfolioItem: {
    width: `${100 / 3}%`,
    padding: spacing.xs,
  },
  portfolioImage: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
});
