export const StorageKeys = {
  theme: 'settings.themePreference',
  language: 'settings.language',
  role: 'settings.role',
} as const;

export type ThemePreference = 'system' | 'light' | 'dark';
export type AppLanguage = 'ru' | 'en';
export type AppRole = 'student' | 'creator';

