import { Platform } from 'react-native';

import { i18n } from '@/lib/i18n/i18n';

import { CATALOG_NOTIFICATION_CHANNEL_ID } from './channels';
import { loadNotificationsModule } from './notifications-module';

const REMINDER_NOTIFICATION_ID = 'lab-catalog-check-reminder';

/**
 * Lab 3 example: repeating local reminder «Проверь каталог».
 * Schedules a **24h repeating** interval (iOS requires ≥60s when `repeats` is true).
 * Call from a button or dev flow — not wired by default to avoid surprising the user.
 */
export async function scheduleCatalogCheckReminder(): Promise<string> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return '';
  }
  return Notifications.scheduleNotificationAsync({
    identifier: REMINDER_NOTIFICATION_ID,
    content: {
      title: i18n.t('notifications.catalogReminderTitle'),
      body: i18n.t('notifications.catalogReminderBody'),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 24,
      repeats: true,
      ...(Platform.OS === 'android' ? { channelId: CATALOG_NOTIFICATION_CHANNEL_ID } : {}),
    },
  });
}

export async function cancelCatalogCheckReminder(): Promise<void> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(REMINDER_NOTIFICATION_ID);
}
