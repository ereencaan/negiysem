import React, { useEffect, useState } from 'react';
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
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    let cancelled = false;

    const refresh = async () => {
      const c = await notificationService.getUnreadCount(userId);
      if (!cancelled) setCount(c);
    };

    refresh();

    const channel = supabase.channel(`notifications-${userId}-${Date.now()}`);
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => refresh(),
      )
      .subscribe();

    // Poll fallback every 30s in case realtime is down
    const interval = setInterval(refresh, 30000);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [userId]);

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
