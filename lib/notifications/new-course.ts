import { Platform } from 'react-native';

import { i18n } from '@/lib/i18n/i18n';

import { CATALOG_NOTIFICATION_CHANNEL_ID } from './channels';
import { loadNotificationsModule } from './notifications-module';

/**
 * Локальное уведомление о новом id в каталоге (после сравнения снапшота).
 * Разрешения должны быть запрошены до вызова (см. useCatalogCourses → requestNotificationPermissions).
 */
export async function scheduleNewCourseNotification(title: string): Promise<void> {
  const Notifications = await loadNotificationsModule();
  if (
    !Notifications ||
    typeof Notifications.getPermissionsAsync !== 'function' ||
    typeof Notifications.scheduleNotificationAsync !== 'function'
  ) {
    if (__DEV__) {
      console.warn('[GoCoursesLab] expo-notifications недоступен — уведомление не запланировано.');
    }
    return;
  }

  const perm = await Notifications.getPermissionsAsync();
  if (perm.status !== 'granted') {
    if (__DEV__) {
      console.warn(
        '[GoCoursesLab] Уведомления не разрешены (статус: %s). Разрешите в настройках приложения.',
        perm.status
      );
    }
    return;
  }

  const content = {
    title: i18n.t('notifications.newCourseTitle'),
    body: i18n.t('notifications.newCourseBody', { title }),
    sound: true as const,
  };

  // Android: TIME_INTERVAL 1s + channel надёжнее отображается на части прошивок, чем только channelId в trigger.
  if (Platform.OS === 'android') {
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        channelId: CATALOG_NOTIFICATION_CHANNEL_ID,
      },
    });
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content,
    trigger: null,
  });
}
