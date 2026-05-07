import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { AppLanguage } from '@/lib/storage/keys';

const resources = {
  ru: {
    translation: {
      appName: 'Go Courses',
      boot: {
        title: 'Go Courses',
        subtitle: 'Гофер разогревает платформу…',
      },
      tabs: {
        home: 'Главная',
        catalog: 'Каталог',
        settings: 'Настройки',
      },
      role: {
        title: 'Роль',
        student: 'Студент',
        creator: 'Создатель курсов',
      },
      settings: {
        title: 'Настройки',
        theme: 'Тема',
        language: 'Язык',
        languageRu: 'Русский',
        languageEn: 'English',
        themeValues: {
          system: 'Системная',
          light: 'Светлая',
          dark: 'Тёмная',
        },
      },
      catalog: {
        title: 'Каталог курсов',
        add: 'Добавить курс',
        empty: 'Курсов пока нет. Создайте первый.',
        a11yLike: 'Лайк',
        a11yDislike: 'Дизлайк',
      },
      status: {
        planned: 'План',
        in_progress: 'В процессе',
        done: 'Готово',
      },
      course: {
        details: 'Курс',
        notes: 'Заметки по курсу',
        addNote: 'Добавить заметку',
        noNotesForCourse: 'Нет заметок',
        lastVisitedRequired: 'Откройте любой курс, чтобы добавить заметку',
        edit: 'Редактировать',
        delete: 'Удалить',
        confirmDeleteTitle: 'Удалить?',
        confirmDeleteText: 'Действие необратимо.',
        cancel: 'Отмена',
      },
      home: {
        titleStudent: 'Мой прогресс',
        titleCreator: 'Панель автора',
        lastCourse: 'Последний курс',
        progress: 'Прогресс',
        history: 'История пройденных',
        myNotes: 'Мои заметки',
        stats: 'Статистика',
        statsHint: 'Пример: сколько людей проходит/прошло/оценило ваш курс',
      },
      /** Экран курса — плоские ключи (надёжнее nested при сборке web) */
      courseScreen_tests: 'Тесты курса',
      courseScreen_testTake: 'Пройти',
      courseScreen_testPassed: 'Пройдено',
      courseScreen_notePlaceholder: 'Заметка по курсу…',
      courseScreen_notFound: 'Курс не найден',
      notesScreen_emptyList: 'Заметок пока нет',
      noteDetail: {
        title: 'Заметка',
        notFound: 'Заметка не найдена',
        courseLabel: 'Курс',
        noLinkedCourse: 'Заметка не из курса',
        updatedAt: 'Изменено',
        body: 'Содержимое',
        bodyEmpty: 'Нет текста',
      },
      historyScreen_emptyList: 'Нет пройденных курсов',
      editor: {
        required: 'Заполните поля',
        save: 'Сохранить',
        create: 'Создать',
        noteTitle: 'Заголовок',
        noteBody: 'Содержимое',
        noteStatus: 'Статус',
        creatorOnlyTitle: 'Недоступно',
        creatorOnlyMessage: 'Только создатель курсов может менять каталог.',
      },
    },
  },
  en: {
    translation: {
      appName: 'Go Courses',
      boot: {
        title: 'Go Courses',
        subtitle: 'Gopher is warming up the platform…',
      },
      tabs: {
        home: 'Home',
        catalog: 'Catalog',
        settings: 'Settings',
      },
      role: {
        title: 'Role',
        student: 'Student',
        creator: 'Course creator',
      },
      settings: {
        title: 'Settings',
        theme: 'Theme',
        language: 'Language',
        languageRu: 'Russian',
        languageEn: 'English',
        themeValues: {
          system: 'System',
          light: 'Light',
          dark: 'Dark',
        },
      },
      catalog: {
        title: 'Courses catalog',
        add: 'Add course',
        empty: 'No courses yet. Create the first one.',
        a11yLike: 'Like',
        a11yDislike: 'Dislike',
      },
      status: {
        planned: 'Planned',
        in_progress: 'In progress',
        done: 'Done',
      },
      course: {
        details: 'Course',
        notes: 'Course notes',
        addNote: 'Add note',
        noNotesForCourse: 'No notes',
        lastVisitedRequired: 'Open any course to add a note',
        edit: 'Edit',
        delete: 'Delete',
        confirmDeleteTitle: 'Delete?',
        confirmDeleteText: 'This cannot be undone.',
        cancel: 'Cancel',
      },
      home: {
        titleStudent: 'My progress',
        titleCreator: 'Creator dashboard',
        lastCourse: 'Last course',
        progress: 'Progress',
        history: 'Completed history',
        myNotes: 'My notes',
        stats: 'Stats',
        statsHint: 'Example: how many users started/finished/rated your course',
      },
      courseScreen_tests: 'Course tests',
      courseScreen_testTake: 'Take',
      courseScreen_testPassed: 'Completed',
      courseScreen_notePlaceholder: 'Course note…',
      courseScreen_notFound: 'Course not found',
      notesScreen_emptyList: 'No notes yet',
      noteDetail: {
        title: 'Note',
        notFound: 'Note not found',
        courseLabel: 'Course',
        noLinkedCourse: 'No course note',
        updatedAt: 'Updated',
        body: 'Context',
        bodyEmpty: 'No body text',
      },
      historyScreen_emptyList: 'No completed courses',
      editor: {
        required: 'Please fill all fields',
        save: 'Save',
        create: 'Create',
        noteTitle: 'Title',
        noteBody: 'Context',
        noteStatus: 'Status',
        creatorOnlyTitle: 'Unavailable',
        creatorOnlyMessage: 'Only course creators can change the catalog.',
      },
    },
  },
} as const;

export function detectDeviceLanguage(): AppLanguage {
  const tag = Localization.getLocales?.()?.[0]?.languageTag ?? 'en';
  const lang = tag.split('-')[0]?.toLowerCase();
  return lang === 'ru' ? 'ru' : 'en';
}

const bundledResources = JSON.parse(JSON.stringify(resources)) as typeof resources;

/** One-shot init so the first React frame can call `t()` (boot screen) before AppProvider’s effect runs. */
let initPromise: Promise<void> | null = null;

function ensureI18nBootstrapped(): Promise<void> {
  if (i18n.isInitialized) {
    return Promise.resolve();
  }
  if (!initPromise) {
    initPromise = i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v4',
        resources: bundledResources,
        lng: detectDeviceLanguage(),
        fallbackLng: 'en',
        supportedLngs: ['en', 'ru'],
        ns: ['translation'],
        defaultNS: 'translation',
        keySeparator: '.',
        interpolation: { escapeValue: false },
      })
      .then(() => undefined);
  }
  return initPromise;
}

void ensureI18nBootstrapped();

export async function initI18n(initialLanguage: AppLanguage) {
  await ensureI18nBootstrapped();
  if (i18n.language !== initialLanguage) {
    await i18n.changeLanguage(initialLanguage);
  }
  return i18n;
}

export async function changeLanguage(language: AppLanguage) {
  await ensureI18nBootstrapped();
  await i18n.changeLanguage(language);
}

export { i18n };

