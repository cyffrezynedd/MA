import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { SoftButton } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { useApp } from '@/providers/app-provider';
import type { AppLanguage, ThemePreference } from '@/lib/storage/keys';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isFirebaseConfigured } from '@/lib/firebase/app';
import { useAuth } from '@/providers/auth-provider';
import {
  clearSavedLoginCredentials,
  hasSavedCredentials,
  isBiometricLoginPlatformSupported,
} from '@/lib/auth/biometric-login';

/**
 * Сегменты с сохраняемым выбором — активное состояние как у лайка в каталоге / чипа статуса (brand3).
 */
function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');
  const brand3 = useThemeColor({}, 'brand3');
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[
              styles.segment,
              active
                ? { borderColor: `${brand3}AA`, backgroundColor: `${brand3}38` }
                : { borderColor: border, backgroundColor: card },
            ]}>
            <ThemedText type="defaultSemiBold">{o.label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { themePreference, language, setThemePreference, setLanguage } = useApp();
  const { user, signOut } = useAuth();

  const [hasBiometricCreds, setHasBiometricCreds] = useState(false);

  const reloadBiometricFlag = useCallback(() => {
    if (!isFirebaseConfigured() || !user || !isBiometricLoginPlatformSupported()) {
      setHasBiometricCreds(false);
      return;
    }
    void hasSavedCredentials().then(setHasBiometricCreds);
  }, [user]);

  useEffect(() => {
    reloadBiometricFlag();
  }, [reloadBiometricFlag]);

  useFocusEffect(
    useCallback(() => {
      reloadBiometricFlag();
    }, [reloadBiometricFlag])
  );

  const onClearBiometric = useCallback(() => {
    void (async () => {
      await clearSavedLoginCredentials();
      setHasBiometricCreds(false);
    })();
  }, []);

  return (
    <Screen>
      <ThemedText type="title">{t('settings.title')}</ThemedText>

      {isFirebaseConfigured() && user ? (
        <Card>
          <ThemedText type="subtitle">{t('settings.accountSection')}</ThemedText>
          <ThemedText style={{ marginTop: 6 }}>{user.email ?? '—'}</ThemedText>
          {hasBiometricCreds ? (
            <>
              <SoftButton
                title={t('settings.biometricClearCta')}
                onPress={() =>
                  Alert.alert(t('settings.biometricClearCta'), t('settings.biometricClearHint'), [
                    { text: String(t('course.cancel')), style: 'cancel' },
                    { text: t('settings.biometricClearConfirm'), style: 'destructive', onPress: onClearBiometric },
                  ])
                }
                style={{ marginTop: 12 }}
              />
            </>
          ) : null}
          <SoftButton title={t('auth.signOut')} onPress={() => void signOut()} style={{ marginTop: 12 }} />
        </Card>
      ) : null}

      <Card>
        <ThemedText type="subtitle">{t('settings.theme')}</ThemedText>
        <Segmented<ThemePreference>
          value={themePreference}
          onChange={(v) => void setThemePreference(v)}
          options={[
            { value: 'light', label: t('settings.themeValues.light') },
            { value: 'dark', label: t('settings.themeValues.dark') },
            { value: 'system', label: t('settings.themeValues.system') },
          ]}
        />
      </Card>

      <Card>
        <ThemedText type="subtitle">{t('settings.language')}</ThemedText>
        <Segmented<AppLanguage>
          value={language}
          onChange={(v) => void setLanguage(v)}
          options={[
            /** Автонимы языков — не через i18n, чтобы на вебе не показывались сырые ключи. */
            { value: 'ru', label: 'Русский' },
            { value: 'en', label: 'English' },
          ]}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segmented: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  segment: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

