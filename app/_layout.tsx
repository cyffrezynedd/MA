import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { I18nextProvider } from 'react-i18next';
import { Image } from 'expo-image';

import { Colors } from '@/constants/theme';
import { AppProvider, useApp } from '@/providers/app-provider';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { i18n } from '@/lib/i18n/i18n';
import { isFirebaseConfigured } from '@/lib/firebase/app';
import { ensureNotificationPresentationHandler } from '@/lib/notifications/channels';

/** Минимум показа boot-экрана при холодном старте (мс). */
const BOOT_MIN_MS = 2000;

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </AppProvider>
    </I18nextProvider>
  );
}

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell() {
  const { ready, resolvedColorScheme } = useApp();
  const { user, loading: authLoading } = useAuth();
  const [minBootDone, setMinBootDone] = useState(false);

  useEffect(() => {
    void ensureNotificationPresentationHandler();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMinBootDone(true), BOOT_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  const waitingFirebaseAuth = isFirebaseConfigured() && authLoading;
  const showBoot = !ready || !minBootDone || waitingFirebaseAuth;
  const requireLogin = isFirebaseConfigured() && !authLoading && !user;

  if (!showBoot) {
    SplashScreen.hideAsync().catch(() => {});
  }

  const bg = Colors[resolvedColorScheme].background;

  return (
    <ThemeProvider value={resolvedColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {showBoot ? (
        <View style={[styles.bootRoot, { backgroundColor: bg }]} accessibilityLabel="Loading">
          <View style={styles.bootCenter}>
            <Image
              source={require('@/assets/gifs/dancing-gopher.gif')}
              style={styles.bootGopher}
              contentFit="contain"
            />
          </View>
        </View>
      ) : requireLogin ? (
        <Stack screenOptions={{ contentStyle: { backgroundColor: bg } }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      ) : (
        <Stack screenOptions={{ contentStyle: { backgroundColor: bg } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="course/[id]" options={{ title: '' }} />
          <Stack.Screen name="completed-history" options={{ title: '' }} />
          <Stack.Screen name="my-notes" options={{ title: '' }} />
          <Stack.Screen name="note-detail/[id]" options={{ title: '' }} />
          <Stack.Screen name="course-editor" options={{ presentation: 'modal', title: '' }} />
          <Stack.Screen name="note-editor" options={{ presentation: 'modal', title: '' }} />
        </Stack>
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  bootRoot: {
    flex: 1,
  },
  bootCenter: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bootGopher: {
    width: 220,
    height: 220,
  },
});
