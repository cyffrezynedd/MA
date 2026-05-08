import type { ImageSourcePropType } from 'react-native';

import { getMockCourseById } from '@/lib/mocks/courses';

/** Unified list/detail row shape for каталог — `preview` matches expo-image `source`. */
export type CatalogCourseItem = {
  id: number;
  title: string;
  description: string;
  preview: ImageSourcePropType;
  likes: number;
  dislikes: number;
  tests: { id: string; title: string }[];
  /** Для сортировки / фильтров; моки без явного поля получают синтетическое в адаптере. */
  updatedAt?: number;
  /** Локальные записи из SQLite (ЛР1). */
  source?: 'device' | 'remote';
};

let sessionCatalog: CatalogCourseItem[] = [];

/** Replaces in-memory snapshot used by `getCatalogCourseById` (last successful hook load). */
export function setSessionCatalogCourses(courses: CatalogCourseItem[]) {
  sessionCatalog = courses;
}

export function getCatalogCourseById(id: number): CatalogCourseItem | null {
  const fromSession = sessionCatalog.find((c) => c.id === id);
  if (fromSession) return fromSession;
  const mock = getMockCourseById(id);
  if (!mock) return null;
  return {
    id: mock.id,
    title: mock.title,
    description: mock.description,
    preview: mock.preview,
    likes: mock.likes,
    dislikes: mock.dislikes,
    tests: mock.tests,
  };
}
