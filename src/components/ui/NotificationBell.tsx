import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notification.service';
import { supabase } from '../../lib/supabase';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setCount(0);
      return;
    }
    const c = await notificationService.getUnreadCount(user.id);
    setCount(c);
  }, [user]);

  useEffect(() => {
    refresh();

    if (!user) return;

    // Realtime subscription to notifications
    const channel = supabase
      .channel('notifications-' + user.id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => refresh(),
      )
      .subscribe();

    // Also poll every 30s as a fallback
    const interval = setInterval(refresh, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user, refresh]);

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/notifications')}
      style={styles.container}
      hitSlop={8}
    >
      <Ionicons name="notifications-outline" size={24} color={colors.text} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xs,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeight.bold,
    lineHeight: 12,
  },
});
