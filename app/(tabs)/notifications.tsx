import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import {
  notificationService,
  type AppNotification,
} from '../../src/services/notification.service';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../src/constants/theme';

const iconForType = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'new_request':
      return 'mail-outline';
    case 'request_sent':
      return 'paper-plane-outline';
    case 'new_message':
      return 'chatbubble-outline';
    case 'request_status_change':
      return 'checkmark-done-outline';
    default:
      return 'notifications-outline';
  }
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const data = await notificationService.getNotifications(user.id);
    setItems(data);
    setIsLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePress = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id);
      setItems(prev => prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n)));
    }

    const requestId = notification.data?.request_id as string | undefined;
    if (requestId && (notification.type === 'new_message' || notification.type === 'new_request' || notification.type === 'request_status_change')) {
      router.push(`/(tabs)/request-detail?id=${requestId}`);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'az önce';
    if (mins < 60) return `${mins}dk`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}sa`;
    const days = Math.floor(hours / 24);
    return `${days}g`;
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <Pressable
      onPress={() => handlePress(item)}
      style={[styles.item, !item.isRead && styles.itemUnread]}
    >
      <View style={[styles.iconCircle, !item.isRead && styles.iconCircleUnread]}>
        <Ionicons
          name={iconForType(item.type)}
          size={20}
          color={item.isRead ? colors.textSecondary : colors.primary}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {items.some(n => !n.isRead) && (
        <Pressable onPress={handleMarkAllRead} style={styles.markAllButton}>
          <Text style={styles.markAllText}>{t('notifications.mark_all_read')}</Text>
        </Pressable>
      )}
      {items.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title={t('notifications.empty_title')}
          description={t('notifications.empty_description')}
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.md },
  markAllButton: {
    alignSelf: 'flex-end',
    padding: spacing.md,
  },
  markAllText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemUnread: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.accent,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconCircleUnread: {
    backgroundColor: colors.white,
  },
  content: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  titleUnread: {
    fontWeight: fontWeight.bold,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  body: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
    marginTop: 6,
  },
});
