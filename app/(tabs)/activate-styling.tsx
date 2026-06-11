import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { eligibilityService } from '../../src/services/eligibility.service';
import { supabase } from '../../src/lib/supabase';
import { Button } from '../../src/components/ui/Button';
import { TextInput } from '../../src/components/ui/TextInput';
import { Card } from '../../src/components/ui/Card';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

export default function ActivateStylingScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [price, setPrice] = useState('');
  const [iban, setIban] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleActivate = async () => {
    if (!user) return;
    const priceNum = parseFloat(price);
    if (!priceNum || priceNum < 10) {
      Alert.alert(t('eligibility.min_price'));
      return;
    }
    if (!iban.trim()) {
      Alert.alert(t('eligibility.iban_required'));
      return;
    }

    setIsSaving(true);

    // Save IBAN
    await supabase.from('users').update({
      style_price: priceNum,
      can_style: true,
    }).eq('id', user.id);

    // Save bank info (create stylist_profiles row if needed for IBAN)
    const { data: existing } = await supabase
      .from('stylist_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('stylist_profiles').update({
        iban: iban.trim(),
        bank_name: bankName.trim() || null,
        account_holder: accountHolder.trim() || null,
        price_per_outfit: priceNum,
      }).eq('user_id', user.id);
    } else {
      await supabase.from('stylist_profiles').insert({
        user_id: user.id,
        bio: '',
        price_per_outfit: priceNum,
        iban: iban.trim(),
        bank_name: bankName.trim() || null,
        account_holder: accountHolder.trim() || null,
        is_verified: false,
      });
    }

    setIsSaving(false);
    Alert.alert(t('eligibility.activated'), t('eligibility.activated_desc'));
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={36} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('eligibility.activate_title')}</Text>
          <Text style={styles.subtitle}>{t('eligibility.activate_desc')}</Text>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('eligibility.set_price')}</Text>
          <Text style={styles.sectionHelp}>{t('payment.commission_note')}</Text>
          <TextInput
            label={t('auth.price_per_outfit')}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="50"
          />
          {price && parseFloat(price) > 0 && (
            <View style={styles.priceBreakdown}>
              <Text style={styles.breakdownText}>
                {t('eligibility.you_earn')}: {Math.round(parseFloat(price) * 0.9)}₺
              </Text>
              <Text style={styles.breakdownSubtext}>
                {t('eligibility.platform_gets')}: {Math.round(parseFloat(price) * 0.1)}₺
              </Text>
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet-outline" size={20} color={colors.success} />
            <Text style={styles.sectionTitle}>{t('payment.bank_info')}</Text>
          </View>
          <Text style={styles.sectionHelp}>{t('payment.bank_help')}</Text>
          <TextInput
            label={t('payment.account_holder')}
            value={accountHolder}
            onChangeText={setAccountHolder}
            placeholder="Ad Soyad"
          />
          <TextInput
            label={t('payment.iban')}
            value={iban}
            onChangeText={setIban}
            placeholder="TR00 0000 0000 0000 0000 0000 00"
            autoCapitalize="characters"
          />
          <TextInput
            label={t('payment.bank_name')}
            value={bankName}
            onChangeText={setBankName}
            placeholder="Banka adı"
          />
        </Card>

        <Button
          title={t('eligibility.activate')}
          onPress={handleActivate}
          isLoading={isSaving}
          disabled={!price || !iban.trim()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  backBtn: { marginBottom: spacing.lg, width: 32, height: 32, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  sectionHelp: { fontSize: fontSize.xs, color: colors.textLight, marginBottom: spacing.md, fontStyle: 'italic' },
  priceBreakdown: {
    backgroundColor: colors.successSoft,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: -spacing.sm,
  },
  breakdownText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.success },
  breakdownSubtext: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});
