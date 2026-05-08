export const StorageKeys = {
  theme: 'settings.themePreference',
  language: 'settings.language',
} as const;

export type ThemePreference = 'system' | 'light' | 'dark';
export type AppLanguage = 'ru' | 'en';

