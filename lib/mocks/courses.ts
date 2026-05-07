/**
 * Учебный каталог курсов: тексты зафиксированы в данных (как в источнике контента),
 * без переключения через i18n — при смене языка интерфейса названия курсов остаются как в моке.
 */
export type MockTest = {
  id: string;
  title: string;
};

export type MockCourse = {
  id: number;
  title: string;
  description: string;
  preview: any;
  likes: number;
  dislikes: number;
  tests: MockTest[];
};

export type MockCourseBase = {
  id: number;
  preview: any;
  likes: number;
  dislikes: number;
  tests: { id: string }[];
};

export const LIKE_GOPHER = require('@/assets/images/sticker_like.png');
export const DISLIKE_GOPHER = require('@/assets/images/sticker_dislike.png');

const preview1 = require('@/assets/images/preview1.png');
const preview2 = require('@/assets/images/preview2.png');
const fallbackPreview = require('@/assets/images/sticker_like.png');

export const MOCK_COURSES: MockCourse[] = [
  {
    id: 101,
    preview: preview1,
    likes: 328,
    dislikes: 17,
    title: 'Основы Go для начинающих',
    description:
      'Типы, переменные, функции и первые шаги в экосистеме Go. Короткий курс для уверенного старта.',
    tests: [
      { id: 't1', title: 'Синтаксис и типы' },
      { id: 't2', title: 'Функции и ошибки' },
      { id: 't3', title: 'Практика: мини-задача' },
    ],
  },
  {
    id: 102,
    preview: preview2,
    likes: 412,
    dislikes: 24,
    title: 'Конкурентность в Go',
    description:
      'Горутины, каналы, select и паттерны конкурентности. Меньше теории, больше практики на примерах.',
    tests: [
      { id: 't1', title: 'Горутины и планировщик' },
      { id: 't2', title: 'Каналы и select' },
      { id: 't3', title: 'Паттерны worker pool' },
    ],
  },
  {
    id: 103,
    preview: fallbackPreview,
    likes: 287,
    dislikes: 12,
    title: 'Go: HTTP и REST',
    description:
      'Поднимем API на net/http, разберём роутинг, middleware и структуру простого production-like сервиса.',
    tests: [
      { id: 't1', title: 'Основы HTTP handler' },
      { id: 't2', title: 'JSON и валидация' },
      { id: 't3', title: 'Middleware и ошибки' },
    ],
  },

];

export const MOCK_COURSES_BASE: MockCourseBase[] = MOCK_COURSES.map((c) => ({
  id: c.id,
  preview: c.preview,
  likes: c.likes,
  dislikes: c.dislikes,
  tests: c.tests.map((test) => ({ id: test.id })),
}));

export function getMockCourseById(id: number): MockCourse | null {
  return MOCK_COURSES.find((c) => c.id === id) ?? null;
}
