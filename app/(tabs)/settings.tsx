import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { useApp } from '@/providers/app-provider';
import type { AppLanguage, ThemePreference } from '@/lib/storage/keys';
import { useThemeColor } from '@/hooks/use-theme-color';

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

  return (
    <Screen>
      <ThemedText type="title">{t('settings.title')}</ThemedText>

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

