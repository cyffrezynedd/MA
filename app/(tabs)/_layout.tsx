import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { NavHouseIcon, NavPackageIcon, NavSettingsIcon } from '@/components/ui/nav-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TAB_BAR_STYLE_HEIGHT, tabBarBottomOffset } from '@/lib/layout/tab-bar';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const c = Colors[colorScheme ?? 'light'];
  const isLight = colorScheme !== 'dark';
  const insets = useSafeAreaInsets();
  const barBottom = tabBarBottomOffset(insets);

  const screenOptions = useMemo(
    () => ({
      tabBarActiveTintColor: isLight ? c.brand3 : c.tint,
      tabBarInactiveTintColor: isLight ? 'rgba(124, 58, 237, 0.42)' : c.tabIconDefault,
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarActiveBackgroundColor: 'transparent',
      tabBarInactiveBackgroundColor: 'transparent',
      tabBarShowLabel: true,
      tabBarStyle: {
        position: 'absolute' as const,
        left: 14,
        right: 14,
        bottom: barBottom,
        height: TAB_BAR_STYLE_HEIGHT,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: isLight ? 'rgba(124, 58, 237, 0.28)' : c.border,
        backgroundColor: isLight ? 'rgba(245, 243, 255, 0.94)' : 'rgba(11, 15, 20, 0.92)',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        paddingTop: 10,
        paddingBottom: Platform.select({ ios: 12, default: 10 }),
      },
      tabBarItemStyle: {
        borderRadius: 18,
        marginHorizontal: 6,
      },
      tabBarLabelStyle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        marginTop: 2,
      },
    }),
    [barBottom, c.border, c.brand3, c.tabIconDefault, c.tint, isLight]
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <NavHouseIcon size={24} color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: t('tabs.catalog'),
          tabBarIcon: ({ color }) => <NavPackageIcon size={24} color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <NavSettingsIcon size={24} color={String(color)} />,
        }}
      />
    </Tabs>
  );
}
