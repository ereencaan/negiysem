import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { stylistService, type StylistListItem } from '../../src/services/stylist.service';
import { requestService } from '../../src/services/request.service';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { TextInput } from '../../src/components/ui/TextInput';
import { Card } from '../../src/components/ui/Card';
import { colors, spacing, fontSize, fontWeight } from '../../src/constants/theme';

export default function StylistDetailScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [stylist, setStylist] = useState<StylistListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (id) {
      stylistService.getStylistById(id).then(data => {
        setStylist(data);
        setIsLoading(false);
      });
    }
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
          {stylist.pricePerOutfit && (
            <Text style={styles.price}>
              {stylist.pricePerOutfit}₺ {t('stylists.per_outfit')}
            </Text>
          )}
        </Card>

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
  errorText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
