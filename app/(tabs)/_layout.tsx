import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Image, StyleSheet } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { RoleSwitcher } from '../../src/components/ui/RoleSwitcher';
import { NotificationBell } from '../../src/components/ui/NotificationBell';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../../src/constants/theme';

function HeaderLogo() {
  return (
    <View style={headerStyles.row}>
      <Image
        source={require('../../assets/images/logo-mark.png')}
        style={headerStyles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  logo: {
    width: 150,
    height: 48,
  },
});

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
        headerTitle: () => <HeaderLogo />,
        headerTitleAlign: 'left',
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <NotificationBell />
            <RoleSwitcher />
          </View>
        ),
        headerRightContainerStyle: { paddingRight: 12 },
        headerLeftContainerStyle: { paddingLeft: 12 },
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
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: t('notifications.title'),
        }}
      />
      <Tabs.Screen
        name="user-profile"
        options={{
          href: null,
          title: '',
        }}
      />
      <Tabs.Screen
        name="create-post"
        options={{
          href: null,
          title: t('feed.new_post'),
        }}
      />
      <Tabs.Screen
        name="request-detail"
        options={{
          href: null,
          title: t('requests.detail_title'),
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
          title: t('profile.edit_profile'),
        }}
      />
      <Tabs.Screen
        name="client-wardrobe"
        options={{
          href: null,
          title: t('wardrobe.client_title'),
        }}
      />
    </Tabs>
  );
}
