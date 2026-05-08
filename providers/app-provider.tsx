import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import * as Font from 'expo-font';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';

import type { AppLanguage, AppRole, ThemePreference } from '@/lib/storage/keys';
import { changeLanguage, detectDeviceLanguage, initI18n } from '@/lib/i18n/i18n';
import { getLanguage, getThemePreference, setLanguage, setRole, setThemePreference } from '@/lib/settings/settings';
import { initCoursesDb } from '@/lib/db/courses';
import { initGoHubCacheDb } from '@/lib/db/go-hub-cache';
import { initNotesDb } from '@/lib/db/notes';

type AppContextValue = {
  ready: boolean;
  themePreference: ThemePreference;
  language: AppLanguage;
  role: AppRole;
  resolvedColorScheme: 'light' | 'dark';
  setThemePreference: (v: ThemePreference) => Promise<void>;
  setLanguage: (v: AppLanguage) => Promise<void>;
  setRole: (v: AppRole) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? 'light';
  const [ready, setReady] = useState(false);
  const [themePreferenceState, setThemePreferenceState] = useState<ThemePreference>('system');
  const [languageState, setLanguageState] = useState<AppLanguage>('en');
  const [roleState, setRoleState] = useState<AppRole>('student');

  const resolvedColorScheme: 'light' | 'dark' =
    themePreferenceState === 'system' ? systemScheme : themePreferenceState;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [themePreference, storedLang] = await Promise.all([getThemePreference(), getLanguage()]);
      const initialLang: AppLanguage = storedLang ?? detectDeviceLanguage();
      try {
        await Promise.all([
          initI18n(initialLang),
          initCoursesDb(),
          initNotesDb(),
          initGoHubCacheDb(),
          Font.loadAsync({
            Inter_400Regular,
            Inter_600SemiBold,
          }),
        ]);
      } catch {
        // fail open: if fonts/db fail, don't brick the app on boot
      }

      if (cancelled) return;
      setThemePreferenceState(themePreference);
      setLanguageState(initialLang);
      setRoleState('student');
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setThemePreferenceSafe = useCallback(async (v: ThemePreference) => {
    setThemePreferenceState(v);
    await setThemePreference(v);
  }, []);

  const setLanguageSafe = useCallback(async (v: AppLanguage) => {
    setLanguageState(v);
    await Promise.all([setLanguage(v), changeLanguage(v)]);
  }, []);

  const setRoleSafe = useCallback(async (v: AppRole) => {
    // student-only UX for current labs: ignore external role changes
    setRoleState('student');
    await setRole('student');
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      themePreference: themePreferenceState,
      language: languageState,
      role: roleState,
      resolvedColorScheme,
      setThemePreference: setThemePreferenceSafe,
      setLanguage: setLanguageSafe,
      setRole: setRoleSafe,
    }),
    [
      languageState,
      ready,
      resolvedColorScheme,
      roleState,
      setLanguageSafe,
      setRoleSafe,
      setThemePreferenceSafe,
      themePreferenceState,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

