import AsyncStorage from '@react-native-async-storage/async-storage';

import { scheduleNewCourseNotification } from '@/lib/notifications/new-course';

const CATALOG_LAST_COURSE_IDS_KEY = 'catalog:lastCourseIds';

function parseIdSnapshot(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
  } catch {
    return [];
  }
}

/**
 * After a successful remote fetch, persist sorted ids and notify once per newly appeared id
 * (skips the first snapshot so a cold install does not spam — пока нет сохранённых id, уведомлений нет).
 */
export async function persistCatalogIdSnapshotAndNotifyNew(courses: { id: number; title: string }[]): Promise<void> {
  const nextIds = [...new Set(courses.map((c) => c.id))].sort((a, b) => a - b);
  const prevIds = parseIdSnapshot(await AsyncStorage.getItem(CATALOG_LAST_COURSE_IDS_KEY));
  const prevSet = new Set(prevIds);

  if (prevIds.length > 0) {
    for (const c of courses) {
      if (!prevSet.has(c.id)) {
        try {
          await scheduleNewCourseNotification(c.title);
        } catch (e) {
          if (__DEV__) {
            console.warn('[GoCoursesLab] scheduleNewCourseNotification:', e);
          }
        }
      }
    }
  }

  await AsyncStorage.setItem(CATALOG_LAST_COURSE_IDS_KEY, JSON.stringify(nextIds));
}
