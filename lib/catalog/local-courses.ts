import type { Course } from '@/lib/db/courses';

import type { CatalogCourseItem } from './catalog-session';

const FALLBACK_PREVIEW = require('@/assets/images/sticker_like.png');

/** Курсы из SQLite (ЛР1): в каталоге рядом с Firestore/моками, без тестов — только заметки. */
export function sqliteCourseToCatalogItem(row: Course): CatalogCourseItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    preview: FALLBACK_PREVIEW,
    likes: 0,
    dislikes: 0,
    tests: [],
    updatedAt: row.updatedAt,
    source: 'device',
  };
}
