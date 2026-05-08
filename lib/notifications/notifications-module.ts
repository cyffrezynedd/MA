import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * В Expo Go (Store Client) асинхронный require к `expo-notifications` даёт Metro-ошибку
 * «unknown module» и неполный модуль (`setNotificationHandler` и т.д. undefined).
 * Локальные уведомления на устройстве — в development build: `npx expo run:android` / EAS Build.
 */
function isExpoGoStoreClient(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

let warnedExpoGo = false;

let loadPromise: Promise<typeof import('expo-notifications') | null> | null = null;

export function loadNotificationsModule(): Promise<typeof import('expo-notifications') | null> {
  if (isExpoGoStoreClient()) {
    if (__DEV__ && !warnedExpoGo) {
      warnedExpoGo = true;
      console.warn(
        '[GoCoursesLab] Уведомления в Expo Go не поддерживаются (ограничение Metro/клиента). Соберите dev build: npx expo run:android'
      );
    }
    return Promise.resolve(null);
  }
  if (!loadPromise) {
    loadPromise = import('expo-notifications').catch(() => null);
  }
  return loadPromise;
}
