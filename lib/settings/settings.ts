import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys, type AppLanguage, type AppRole, type ThemePreference } from '@/lib/storage/keys';

export async function getThemePreference(): Promise<ThemePreference> {
  const raw = await AsyncStorage.getItem(StorageKeys.theme);
  if (raw === 'system' || raw === 'light' || raw === 'dark') return raw;
  return 'system';
}

export async function setThemePreference(value: ThemePreference) {
  await AsyncStorage.setItem(StorageKeys.theme, value);
}

export async function getLanguage(): Promise<AppLanguage | null> {
  const raw = await AsyncStorage.getItem(StorageKeys.language);
  if (raw === 'ru' || raw === 'en') return raw;
  return null;
}

export async function setLanguage(value: AppLanguage) {
  await AsyncStorage.setItem(StorageKeys.language, value);
}

export async function getRole(): Promise<AppRole> {
  const raw = await AsyncStorage.getItem(StorageKeys.role);
  if (raw === 'creator' || raw === 'student') return raw;
  return 'student';
}

export async function setRole(value: AppRole) {
  await AsyncStorage.setItem(StorageKeys.role, value);
}

