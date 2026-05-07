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

export const LIKE_GOPHER = require('@/assets/images/sticker_like.png');
export const DISLIKE_GOPHER = require('@/assets/images/sticker_dislike.png');

const preview1 = require('@/assets/images/preview1.png');
const preview2 = require('@/assets/images/preview2.png');
const fallbackPreview = require('@/assets/images/sticker_like.png');

export const MOCK_COURSES: MockCourse[] = [
  {
    id: 101,
    title: 'Go Basics for Beginners',
    description:
      'Типы, переменные, функции и первые шаги в экосистеме Go. Короткий курс для уверенного старта.',
    preview: preview1,
    likes: 328,
    dislikes: 17,
    tests: [
      { id: 't1', title: 'Синтаксис и типы' },
      { id: 't2', title: 'Функции и ошибки' },
      { id: 't3', title: 'Практика: мини-задача' },
    ],
  },
  {
    id: 102,
    title: 'Concurrency in Go',
    description:
      'Горутины, каналы, select и паттерны конкурентности. Меньше теории, больше практики на примерах.',
    preview: preview2,
    likes: 412,
    dislikes: 24,
    tests: [
      { id: 't1', title: 'Горутины и scheduler' },
      { id: 't2', title: 'Каналы и select' },
      { id: 't3', title: 'Паттерны worker pool' },
    ],
  },
  {
    id: 103,
    title: 'Go HTTP and REST',
    description:
      'Поднимем API на net/http, разберем роутинг, middleware и структуру простого production-like сервиса.',
    preview: fallbackPreview,
    likes: 287,
    dislikes: 12,
    tests: [
      { id: 't1', title: 'HTTP handler basics' },
      { id: 't2', title: 'JSON и валидация' },
      { id: 't3', title: 'Middleware и ошибки' },
    ],
  },
];

export function getMockCourseById(id: number) {
  return MOCK_COURSES.find((c) => c.id === id) ?? null;
}

