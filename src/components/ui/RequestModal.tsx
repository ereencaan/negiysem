import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { requestService } from '../../services/request.service';
import { wardrobeService } from '../../services/wardrobe.service';
import { Button } from './Button';
import { TextInput } from './TextInput';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';

interface RequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  stylistId: string;
  stylistName: string;
  openAddWardrobeItem?: () => void;
}

export function RequestModal({
  visible,
  onClose,
  onSuccess,
  stylistId,
  stylistName,
  openAddWardrobeItem,
}: RequestModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [occasion, setOccasion] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [wardrobeCount, setWardrobeCount] = useState<number | null>(null);

  useEffect(() => {
    if (!visible || !user) return;
    wardrobeService.getWardrobeItems(user.id).then(items => {
      setWardrobeCount(items.length);
    });
    setOccasion('');
    setEventDate('');
    setMessage('');
  }, [visible, user]);

  const canSubmit = wardrobeCount !== null && wardrobeCount > 0 && !isSending;

  const submit = async () => {
    if (!user || !canSubmit) return;
    setIsSending(true);
    const result = await requestService.createOutfitRequest({
      userId: user.id,
      stylistId,
      occasion: occasion || undefined,
      eventDate: eventDate || undefined,
      message: message || undefined,
    });
    setIsSending(false);
    if (result.data) {
      Alert.alert(t('stylists.request_sent'), t('stylists.request_sent_body'));
      onSuccess?.();
      onClose();
    } else {
      Alert.alert(t('errors.generic'));
    }
  };

  const handleWardrobeRedirect = () => {
    onClose();
    openAddWardrobeItem?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{t('stylists.send_request')}</Text>
            <Text style={styles.subtitle}>{stylistName}</Text>
          </View>

          {wardrobeCount === 0 ? (
            <View style={styles.emptyWardrobe}>
              <Ionicons name="shirt-outline" size={42} color={colors.primary} />
              <Text style={styles.emptyTitle}>{t('stylists.wardrobe_required_title')}</Text>
              <Text style={styles.emptyBody}>{t('stylists.wardrobe_required_body')}</Text>
              <Button title={t('wardrobe.add_item')} onPress={handleWardrobeRedirect} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.form}>
              <TextInput
                label={t('stylists.occasion')}
                value={occasion}
                onChangeText={setOccasion}
                placeholder={t('stylists.occasion_placeholder')}
              />
              <TextInput
                label={t('stylists.event_date')}
                value={eventDate}
                onChangeText={setEventDate}
                placeholder={t('stylists.event_date_placeholder')}
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
                onPress={submit}
                isLoading={isSending}
              />
              <View style={{ height: spacing.sm }} />
              <Button title={t('common.cancel')} onPress={onClose} variant="text" />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  form: {
    padding: spacing.xl,
  },
  emptyWardrobe: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: spacing.md,
  },
});
