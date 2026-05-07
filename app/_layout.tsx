import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { I18nextProvider, useTranslation } from 'react-i18next';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProvider, useApp } from '@/providers/app-provider';
import { i18n } from '@/lib/i18n/i18n';
import { Image } from 'expo-image';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppProvider>
        <RootLayoutInner />
      </AppProvider>
    </I18nextProvider>
  );
}

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const { ready } = useApp();
  const muted = useThemeColor({}, 'muted');
  const { t } = useTranslation();

  if (ready) {
    SplashScreen.hideAsync().catch(() => {});
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {!ready ? (
        <Screen>
          <ThemedText type="title">{t('boot.title')}</ThemedText>
          <ThemedText style={{ color: muted }}>{t('boot.subtitle')}</ThemedText>
          <Image
            source={require('@/assets/gifs/dancing-gopher.gif')}
            style={{ width: 160, height: 160, alignSelf: 'center', marginTop: 24 }}
            contentFit="contain"
          />
        </Screen>
      ) : (
        <Stack>
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
