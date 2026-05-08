import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  type Firestore,
} from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import { Platform } from 'react-native';

import { isUsingFirestoreEmulator } from '@/lib/firebase/app';
import { resolveFirebaseEmulatorLanHost } from '@/lib/firebase/emulator-host';

let dbSingleton: Firestore | undefined;
let emulatorLinked = false;

function createFirestore(app: FirebaseApp): Firestore {
  if (Platform.OS === 'web') {
    return getFirestore(app);
  }
  if (isUsingFirestoreEmulator()) {
    // Long polling стабильнее к локальному эмулятору на RN.
    try {
      return initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch {
      return getFirestore(app);
    }
  }
  return getFirestore(app);
}

function emulatorPort(): number {
  const p = Number(process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT ?? '28765');
  return Number.isFinite(p) ? p : 28765;
}

export function getFirestoreDb(app: FirebaseApp): Firestore {
  if (!dbSingleton) {
    dbSingleton = createFirestore(app);
    if (isUsingFirestoreEmulator() && !emulatorLinked) {
      connectFirestoreEmulator(dbSingleton, resolveFirebaseEmulatorLanHost(), emulatorPort());
      emulatorLinked = true;
    }
  }
  return dbSingleton;
}
