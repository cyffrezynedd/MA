import { isUsingFirestoreEmulator } from '@/lib/firebase/app';

/** Подсказки для типичных ошибок Firebase Auth (код приходит как `auth/...`). */
export function rethrowFirebaseAuthWithHints(err: unknown): never {
  const code =
    err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
  if (code === 'auth/configuration-not-found') {
    const emu = isUsingFirestoreEmulator();
    const hint = emu
      ? 'Сейчас включён режим ЭМУЛЯТОРА (.env). Запустите вместе Firestore+Auth: npm run lab ИЛИ npm run emulator:firestore (порты 28765 и 9099). Либо поставьте EXPO_PUBLIC_USE_FIRESTORE_EMULATOR=0 и используйте облако.'
      : [
          'Firestore (БД) и Authentication (вход) — РАЗНЫЕ части Firebase. БД уже есть — это не включает вход автоматически.',
          'Сделайте в Firebase Console (проект должен совпадать с projectId в .env):',
          '1) Build → Authentication → нажмите «Get started» (если ещё не нажимали).',
          '2) Sign-in method → Email/Password → Включить → Сохранить.',
          '3) Проверьте .env: EXPO_PUBLIC_USE_FIRESTORE_EMULATOR=0 и все EXPO_PUBLIC_FIREBASE_* из того же проекта (Project settings → Your apps → веб-приложение).',
          'Перезапуск: npx expo start --clear',
        ].join(' ');
    throw new Error(`Firebase Auth (configuration-not-found). ${hint}`);
  }
  if (code === 'auth/operation-not-allowed') {
    throw new Error(
      'Firebase Auth: вход этим способом выключен. Console → Authentication → Sign-in method → включите Email/Password (или тот провайдер, которым пользуетесь).'
    );
  }
  if (err instanceof Error) throw err;
  throw new Error(String(err));
}
