# План доработок GoCoursesLab до соответствия TZ-v2

Нормативный документ: `TZ-v2.md` (разд. 2 — требования п. 1–5; разд. 4 — AC-1…AC-14).  
Базис анализа: фактический код репозитория (Expo 54, expo-router, SQLite, i18n, тема).

---

## 1. Таблица соответствия

| Требование | Статус | Где в коде | Что не так / чего не хватает |
|------------|--------|------------|------------------------------|
| **П. 1** — три корневые вкладки; навигация; CRUD п. 5 как обязательный сценарий | **Частично** | `app/(tabs)/_layout.tsx`, `index.tsx`, `catalog.tsx`, `settings.tsx`; стек `app/_layout.tsx` | Вкладки и базовый сценарий «вкладки → курс → назад» есть. Сценарий п. 5 как **SQLite CRUD через UI** целиком **не воспроизводится** (см. п. 5, AC-10…14). |
| **П. 2** — нативный сплэш + boot до `ready` | **Есть** | `app.json`; `app/_layout.tsx`; `providers/app-provider.tsx` | Сплэш и разделение нативного/boot соблюдены. В boot — GIF вместо классического индикатора (по ТЗ допустима анимация). Ошибки инициализации БД/шрифтов глотаются в `catch` — риск «тихой» деградации. |
| **П. 3** — ru/en, сохранение, строки на ключевых экранах через i18n | **Частично** | `lib/i18n/i18n.ts`, `providers/app-provider.tsx`, `lib/settings/settings.ts`, `app/*` | Язык и персистентность ок. Хардкод и обходы i18n — см. разд. 3. Мок курсов на русском — при `en` контент каталога/курса остаётся русским. |
| **П. 4** — light / dark / system, персистентность | **Есть** | `app/(tabs)/settings.tsx`, `lib/settings/settings.ts`, `hooks/use-color-scheme.ts`, `providers/app-provider.tsx` | Соответствует ТЗ. |
| **П. 5** — одна линия: SQLite `notes`, поля, CRUD из UI, `updatedAt` виден | **Частично** | `lib/db/notes.ts`, `app/note-editor.tsx`, `providers/app-provider.tsx` | **`listNotes` / `deleteNote` не используются экранами.** Маршрут `/note-editor` **ниоткуда не открывается.** Список/детали завязаны на **AsyncStorage** (`course-progress`). На экране курса — вторая модель заметки. Web: `lib/db/notes.web.ts` не заменяет SQLite на Android. |
| **AC-1** | **Есть** | `app/(tabs)/_layout.tsx` | — |
| **AC-2** | **Есть** | `app/(tabs)/index.tsx`, `catalog.tsx`, `course/[id].tsx`, `settings.tsx` | — |
| **AC-3** | **Есть** | `app.json`, `app/_layout.tsx` | — |
| **AC-4** | **Есть** | `app/_layout.tsx`, `app-provider.tsx` | — |
| **AC-5** | **Частично** | см. разд. 3 | Хардкод, русский мок при `en`. |
| **AC-6** | **Есть** | `lib/settings/settings.ts` | — |
| **AC-7** | **Есть** | `settings.tsx`, провайдер | — |
| **AC-8** | **Есть** | `lib/settings/settings.ts` | — |
| **AC-9** | **Есть** | Провайдер + `useSystemColorScheme` | — |
| **AC-10** | **Нет** | `note-editor.tsx` без входа в навигации | Нет полного сценария CREATE из UI → список с `updatedAt`. |
| **AC-11** | **Нет** | `app/my-notes.tsx` + `filterCourseIdsWithNotes` | Нет списка записей `notes` из SQLite (заголовок, статус, время). |
| **AC-12** | **Частично** | `lib/db/notes.ts`, `note-editor.tsx` | API есть; UI редактирования недостижим из экранов. |
| **AC-13** | **Нет** | — | `deleteNote` не вызывается из UI. |
| **AC-14** | **Нет** | `app/note-detail/[id].tsx` | Один текст из AsyncStorage; нет title/body/status/`updatedAt` по модели SQLite. |

---

## 2. П. 5 — SQLite и UI

**Зарегистрированные маршруты** (`app/_layout.tsx`): `my-notes`, `note-detail/[id]`, `note-editor` (modal).

| Операция | Ожидание ТЗ | Факт |
|----------|-------------|------|
| **CREATE** | UI → `createNote` | Реализация в `note-editor.tsx`; **нет ссылок** на `/note-editor` из приложения. |
| **READ список** | `listNotes` в UI | **`listNotes` не импортируется.** `my-notes.tsx` использует `filterCourseIdsWithNotes` → `getCourseNote` (AsyncStorage). |
| **READ детали** | Карточка: title, body, status, `updatedAt` | `note-detail/[id].tsx`: `id` = **courseId**, данные **`getCourseNote`** — не модель `notes`. |
| **UPDATE** | из списка/детали | Только в `note-editor` при `noteId`, без навигации к экрану. |
| **DELETE** | `deleteNote` | Не подключено. |

**Использование `lib/db/notes.ts`:** `initNotesDb` в провайдере; CRUD из UI — только **`note-editor.tsx`**.

**AsyncStorage на экране курса (ТЗ разд. 3.4):** `app/course/[id].tsx` — `getCourseNote` / `setCourseNote` из `lib/mocks/course-progress.ts`. Это дублирующая модель «одна заметка на курс», конфликтует с единственной правдой **SQLite `notes`** для п. 5.

---

## 3. Локализация (риски хардкода, п. 2.3)

| Файл | Риск |
|------|------|
| `app/note-detail/[id].tsx` | Без `useTranslation`: «Заметка», «Курс не найден», «Текст заметки пуст». |
| `app/(tabs)/settings.tsx` | Подписи `'Русский'`, `'English'` не из ресурсов. |
| `app/(tabs)/catalog.tsx` | `accessibilityLabel="Лайк"` / `"Дизлайк"` — хардкод. |
| `app/my-notes.tsx`, `app/completed-history.tsx` | Ручные fallback-строки по `language` + `defaultValue` вместо единых ключей. |
| `components/ui/progress-gopher.tsx` | `label ?? 'Прогресс'`. |
| `lib/mocks/courses.ts` | Видимый контент курсов на русском при переключении на `en`. |

---

## 4. План задач

| ID | Приоритет | Цель | Предполагаемые файлы | Критерий готовности |
|----|-----------|------|----------------------|---------------------|
| **TASK-01** | **P0** | Убрать дублирование п. 5: сценарий заметки AsyncStorage на курсе не должен быть «официальной» правдой. | `app/course/[id].tsx`, при необходимости `lib/mocks/course-progress.ts` | Одна пользовательская линия заметок п. 5 — SQLite. **AC-10…14**, **разд. 3.4**. |
| **TASK-02** | **P0** | Список заметок из SQLite (по курсу или общий): заголовок, статус, `updatedAt`. | `app/my-notes.tsx` и/или новый маршрут; `lib/db/notes.ts` | **AC-11**, **разд. 3.2**. |
| **TASK-03** | **P0** | CREATE: переход на `note-editor` с `courseId`. | `app/course/[id].tsx`, `app/my-notes.tsx` | **AC-10**. |
| **TASK-04** | **P0** | Деталь заметки по **note id**: title, body, статус, `updatedAt`. | `app/note-detail/[id].tsx`; `getNoteById` | **AC-14**, **AC-11**. |
| **TASK-05** | **P0** | UPDATE: открытие `note-editor` с `noteId` из списка/детали. | `app/note-editor.tsx`, навигация с списка/детали | **AC-12**. |
| **TASK-06** | **P0** | DELETE с подтверждением; обновление списка. | Деталь/редактор; `deleteNote` | **AC-13**. |
| **TASK-07** | **P1** | Убрать хардкод на контрольных экранах. | `note-detail`, `settings`, `catalog`, `progress-gopher`, `my-notes`, `completed-history`; `lib/i18n/i18n.ts` | **AC-5** на перечисленных местах. |
| **TASK-08** | **P1** | Двуязычный (или i18n) контент мок-курсов. | `lib/mocks/courses.ts`, ресурсы i18n | **AC-5** на Каталоге и экране курса. |
| **TASK-09** | **P2** | При необходимости — явный индикатор загрузки на boot. | `app/_layout.tsx` | **П. 2.2 (б)** при строгой трактовке. |
| **TASK-10** | **P2** | Зафиксировать для сдачи: Web и `notes.web.ts` vs SQLite. | по договорённости с преподавателем | **Разд. 1.2** доп. окружение. |

**P0** — блокеры приёмки по п. 5 и разд. 3.4.

---

## 5. Риски и порядок выполнения

**Риски**

- Два канала хранения «заметок» (AsyncStorage на курсе + SQLite) — провал п. 5 при приёмке.
- Смена контракта `note-detail/[id]`: сейчас параметр = `courseId`; для SQLite нужен **id заметки** и обновление всех `href`.
- Русскоязычный мок ломает демонстрацию AC-5 при `en`.
- Молчаливый `catch` при ошибке `initNotesDb` на boot.

**Порядок**

1. **TASK-01** — устранить дублирование с AsyncStorage на экране курса.
2. **TASK-02…TASK-06** — сквозной UI: список → деталь (`noteId`) → создать / редактировать / удалить.
3. **TASK-07, TASK-08** — локализация после стабилизации навигации и данных.
4. **TASK-09, TASK-10** — по остаточному времени и требованиям к отчёту.

---

## Краткий итог

- Закрыты в основном: **П. 1** (структура), **П. 2**, **П. 4**, **AC-1…AC-4**, **AC-6…AC-9**.
- **Блокеры:** **П. 5** и **AC-10…AC-14** из-за отсутствия сквозного UI на SQLite и параллельного AsyncStorage; **AC-5** частично.

Файл сгенерирован для сопоставления репозитория с `TZ-v2.md`.
