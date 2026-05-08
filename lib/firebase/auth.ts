import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
/**
 * On React Native, Metro resolves `firebase/auth` to the RN build that exports `getReactNativePersistence`.
 * (There is no separate `firebase/auth/react-native` package path in Firebase JS SDK 12.)
 */
import {
  connectAuthEmulator,
  getAuth,
  initializeAuth,
  type Auth,
  // Firebase typings target the browser entry; Metro resolves `firebase/auth` to the RN build where this exists.
  // @ts-expect-error RN bundle exports getReactNativePersistence (see @firebase/auth dist/rn).
  getReactNativePersistence,
} from 'firebase/auth';

import { getFirebaseApp, isUsingFirestoreEmulator } from '@/lib/firebase/app';
import { resolveFirebaseEmulatorLanHost } from '@/lib/firebase/emulator-host';

let firebaseAuthSingleton: Auth | null | undefined;
let authEmulatorLinked = false;

function maybeConnectAuthEmulator(auth: Auth): void {
  if (!isUsingFirestoreEmulator() || authEmulatorLinked) return;
  const port = Number(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT ?? '9099');
  if (!Number.isFinite(port)) return;
  const host = resolveFirebaseEmulatorLanHost();
  connectAuthEmulator(auth, `http://${host}:${port}`, { disableWarnings: true });
  authEmulatorLinked = true;
}

/**
 * Lazily initializes Firebase Auth with AsyncStorage persistence on native (required for session survival).
 * On web uses `getAuth`. Returns `null` when Firebase app is not configured.
 */
export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) {
    firebaseAuthSingleton = undefined;
    authEmulatorLinked = false;
    return null;
  }
  if (firebaseAuthSingleton !== undefined) {
    return firebaseAuthSingleton;
  }
  try {
    if (Platform.OS === 'web') {
      firebaseAuthSingleton = getAuth(app);
    } else {
      firebaseAuthSingleton = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }
  } catch {
    firebaseAuthSingleton = getAuth(app);
  }
  maybeConnectAuthEmulator(firebaseAuthSingleton);
  return firebaseAuthSingleton;
}
