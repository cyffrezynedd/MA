# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

**Правила Firestore (ЛР4):** чтение коллекции `courses` разрешено только **вошедшим** пользователям (`request.auth != null`). После изменения `firestore.rules` выполните **`npm run deploy:firestore-rules`**. Сид каталога (`npm run seed:firestore`) по-прежнему выполняется **записью без входа** (`allow create, update: if true`). Удаление тестового документа `courses/99999` сохранено.

### Лабораторная работа 4 — проверка

1. В [Firebase Console](https://console.firebase.google.com) → **Authentication** → **Sign-in method** включите **Email/Password**.
2. Заполните `.env` (`EXPO_PUBLIC_FIREBASE_*`), **`npm run firebase:check`**, задеплойте правила (**`npm run deploy:firestore-rules`**).
3. Запустите приложение: при настроенном Firebase появится экран **Вход / Регистрация**. После входа каталог подписан на **`courses`** через **`onSnapshot`** (обновления без ручного refresh).
4. Вкладка **«Устройство»**: геолокация, акселерометр, камера (на устройстве или эмуляторе; на вебе часть функций недоступна).
5. Экран курса: кнопка **«Поделиться»** (`Share`) с заголовком и ссылкой вида `gocourseslab://…`.
6. Выход: **Настройки** → **Выйти из аккаунта** (если Firebase включён).

**Эмулятор Firestore без Auth Emulator:** приложение не прочитает `courses` без входа в реальный Firebase Auth; для чисто локального эмулятора временно ослабьте правило `read` или поднимите Auth Emulator.

## Firebase — только облако (Google Firestore)

1. [Firebase Console](https://console.firebase.google.com): проект → **Firestore** → создать БД.
2. **Настройки проекта** → **Ваши приложения** → добавить **Веб** → скопируй `firebaseConfig`.
3. В папке проекта: **`npm run firebase:wizard`** — вставь поля из консоли.
4. **`npx firebase login`**
5. В консоли: **Build → Storage** — включи хранилище (если ещё не).
6. **`npm run deploy:firestore-rules`** и **`npm run deploy:storage-rules`**
7. **`npm run seed:firestore`** — каталог. Поле `previewImageUrl` можно оставить пустым: для id 101/102/103 подставятся те же файлы, что в моках (`preview1.png` / `preview2.png`). Любой непустой URL — картинка из интернета / Storage.
8. **`npm run firebase:check`** и **`npm start --clear`**

**Уведомления о новом курсе:** локальное (expo-notifications), не FCM. Срабатывает, когда при загрузке каталога появляется **новый** `id`, которого не было в сохранённом снапшоте. Первый успешный запуск только запоминает id — без спама. Нужны разрешения на уведомления. Обнови каталог: **потяни список вниз** на вкладке «Каталог» или перезапусти приложение.

Проверка: после **`npm run deploy:firestore-rules`** (правило `delete` для `courses/99999`) выполни **`npm run test:new-course-add`**, в приложении обнови каталог → должно прийти уведомление. Удаление теста: **`npm run test:new-course-remove`**.

**Свои превью в Firebase Storage:** загрузи файлы в папку `courses/` (например `courses/101.jpg`), скопируй **Download URL** и впиши в документ Firestore поле `previewImageUrl`. Правила: чтение публичное для `courses/**`.

Строки вида `demo-api-key` в проекте — только для старого локального эмулятора; для Google их **не** используй.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
