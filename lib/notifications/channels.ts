import { Platform } from 'react-native';

import { loadNotificationsModule } from './notifications-module';

export const CATALOG_NOTIFICATION_CHANNEL_ID = 'catalog';

let handlerInit: Promise<void> | null = null;

function canUseNotificationHandler(
  n: Awaited<ReturnType<typeof loadNotificationsModule>>
): n is NonNullable<typeof n> {
  return n != null && typeof n.setNotificationHandler === 'function';
}

function canConfigureAndroidChannel(
  n: Awaited<ReturnType<typeof loadNotificationsModule>>
): n is NonNullable<typeof n> {
  return (
    n != null &&
    typeof n.setNotificationChannelAsync === 'function' &&
    n.AndroidImportance != null &&
    n.AndroidNotificationVisibility != null
  );
}

function canRequestPermissions(
  n: Awaited<ReturnType<typeof loadNotificationsModule>>
): n is NonNullable<typeof n> {
  return (
    n != null &&
    typeof n.getPermissionsAsync === 'function' &&
    typeof n.requestPermissionsAsync === 'function'
  );
}

/** Required for local notifications to present while the app is foregrounded. */
export function ensureNotificationPresentationHandler(): Promise<void> {
  if (!handlerInit) {
    handlerInit = (async () => {
      const Notifications = await loadNotificationsModule();
      if (!canUseNotificationHandler(Notifications)) return;
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    })();
  }
  return handlerInit;
}

export async function ensureCatalogNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const Notifications = await loadNotificationsModule();
  if (!canConfigureAndroidChannel(Notifications)) return;
  await Notifications.setNotificationChannelAsync(CATALOG_NOTIFICATION_CHANNEL_ID, {
    name: 'Каталог курсов',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 100, 200],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = await loadNotificationsModule();
  if (!canRequestPermissions(Notifications)) return false;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.status === 'granted';
}
