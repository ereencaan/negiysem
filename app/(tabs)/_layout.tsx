import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { RoleSwitcher } from '../../src/components/ui/RoleSwitcher';
import { useTranslation } from 'react-i18next';
import { colors } from '../../src/constants/theme';

export default function TabLayout() {
  const { isStylist, activeRole } = useAuth();
  const { t } = useTranslation();
  const isUserMode = activeRole === 'user';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.text,
        headerRight: () => <RoleSwitcher />,
        headerRightContainerStyle: { paddingRight: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: t('tabs.wardrobe'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shirt-outline" size={size} color={color} />
          ),
          href: isUserMode ? '/(tabs)/wardrobe' : null,
        }}
      />
      <Tabs.Screen
        name="stylists"
        options={{
          title: t('tabs.stylists'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          href: isUserMode ? '/(tabs)/stylists' : null,
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: isUserMode ? t('tabs.outfits') : t('tabs.requests'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="color-palette-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Hidden screens - accessible via navigation but not in tab bar */}
      <Tabs.Screen
        name="become-stylist"
        options={{
          href: null,
          title: t('stylist.become_stylist'),
        }}
      />
      <Tabs.Screen
        name="add-wardrobe-item"
        options={{
          href: null,
          title: t('wardrobe.add_item'),
        }}
      />
      <Tabs.Screen
        name="stylist-detail"
        options={{
          href: null,
          title: '',
        }}
      />
    </Tabs>
  );
}
