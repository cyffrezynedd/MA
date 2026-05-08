import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';

function trimEnv(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t || undefined;
}

/** Локальный Firestore Emulator — без реального Firebase-проекта и секретов. */
export function isUsingFirestoreEmulator(): boolean {
  const v = trimEnv(process.env.EXPO_PUBLIC_USE_FIRESTORE_EMULATOR);
  return v === '1' || v === 'true';
}

function firebaseProductionOptions(): FirebaseOptions | null {
  const apiKey = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY);
  const authDomain = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN);
  const projectId = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
  const storageBucket = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET);
  const messagingSenderId = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
  const appId = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID);
  const measurementId = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID);

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    ...(measurementId ? { measurementId } : {}),
  };
}

function emulatorFirebaseOptions(): FirebaseOptions {
  return {
    apiKey: trimEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY) || 'demo-api-key',
    authDomain: trimEnv(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN) || 'demo-gocourses-lab.firebaseapp.com',
    projectId: trimEnv(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) || 'demo-gocourses-lab',
    storageBucket: trimEnv(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET) || 'demo-gocourses-lab.appspot.com',
    messagingSenderId: trimEnv(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || '123456789012',
    appId: trimEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID) || '1:123456789012:web:demogo',
  };
}

export function getFirebaseOptions(): FirebaseOptions | null {
  if (isUsingFirestoreEmulator()) {
    return emulatorFirebaseOptions();
  }
  return firebaseProductionOptions();
}

/** Облако: все ключи заданы. Эмулятор: всегда true. */
export function isFirebaseConfigured(): boolean {
  return isUsingFirestoreEmulator() || firebaseProductionOptions() !== null;
}

let firebaseAppSingleton: FirebaseApp | null | undefined;

/**
 * Lazily initializes the default Firebase app when configured.
 * Returns `null` if env is incomplete (never throws).
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    firebaseAppSingleton = undefined;
    return null;
  }
  if (firebaseAppSingleton !== undefined) {
    return firebaseAppSingleton;
  }
  const options = getFirebaseOptions();
  if (!options) {
    firebaseAppSingleton = undefined;
    return null;
  }
  firebaseAppSingleton = getApps().length === 0 ? initializeApp(options) : getApps()[0]!;
  return firebaseAppSingleton;
}
