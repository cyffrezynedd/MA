import type { CatalogCourseItem } from '@/lib/catalog/catalog-session';

import type { CatalogListItem } from './catalog-query';

/** Категории для демо ЛР3 (в Firestore поле `category` может переопределить). */
const CATEGORY_BY_ID: Record<number, string> = {
  101: 'basics',
  102: 'concurrency',
  103: 'http',
};

/**
 * Превращает элемент каталога UI в запись для `applyCatalogQuery` (поиск/фильтр/сорт).
 */
export function catalogCourseToListItem(c: CatalogCourseItem): CatalogListItem {
  const category = CATEGORY_BY_ID[c.id] ?? 'general';
  const titleWords = c.title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);
  const descWords = c.description
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 12);
  const keywords = [...new Set([...titleWords, ...descWords, 'go', category])];
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category,
    keywords,
    updatedAt: c.updatedAt ?? Math.abs(c.id) * 86400000,
    likes: c.likes,
    dislikes: c.dislikes,
  };
}

/** Восстанавливает порядок и объекты `CatalogCourseItem` после `applyCatalogQuery`. */
export function orderCoursesByListItems(
  ordered: CatalogListItem[],
  source: CatalogCourseItem[],
): CatalogCourseItem[] {
  const byId = new Map(source.map((c) => [c.id, c] as const));
  return ordered.map((row) => byId.get(row.id)).filter(Boolean) as CatalogCourseItem[];
}
