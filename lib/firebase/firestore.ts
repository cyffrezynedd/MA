import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  type Firestore,
} from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { isUsingFirestoreEmulator } from '@/lib/firebase/app';

let dbSingleton: Firestore | undefined;
let emulatorLinked = false;

/** IP ПК для Firestore emulator: тот же хост, с которого устройство уже тащит Metro (Expo Go). */
function hostFromExpoDevUri(): string | undefined {
  if (Platform.OS === 'web') return undefined;
  const m2 = Constants.manifest2 as { extra?: { expoClient?: { hostUri?: string } } } | null | undefined;
  const raw =
    (Constants.expoConfig as { hostUri?: string } | null | undefined)?.hostUri ??
    m2?.extra?.expoClient?.hostUri ??
    (Constants.manifest as { debuggerHost?: string } | null | undefined)?.debuggerHost;
  if (!raw || typeof raw !== 'string') return undefined;
  const lastColon = raw.lastIndexOf(':');
  const withPossibleBrackets = lastColon > -1 ? raw.slice(0, lastColon) : raw;
  const host = withPossibleBrackets.replace(/^\[|\]$/g, '').trim();
  if (
    !host ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    /\.ngrok-free\.app$/i.test(host) ||
    /\.ngrok\.io$/i.test(host) ||
    /\.exp\.direct$/i.test(host)
  ) {
    return undefined;
  }
  return host;
}

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

function emulatorHost(): string {
  const isAndroidAvd = Platform.OS === 'android' && Constants.isDevice !== true;
  // AVD: 127.0.0.1 на эмуляторе — не ПК; LAN из .env к AVD не подходит — только 10.0.2.2.
  if (isAndroidAvd) {
    return '10.0.2.2';
  }
  const fromMetro = hostFromExpoDevUri();
  if (fromMetro) return fromMetro;
  const fromEnv = trim(process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST);
  return fromEnv ?? (Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1');
}

function emulatorPort(): number {
  const p = Number(process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT ?? '28765');
  return Number.isFinite(p) ? p : 28765;
}

function trim(v: string | undefined): string | undefined {
  const t = v?.trim();
  return t || undefined;
}

export function getFirestoreDb(app: FirebaseApp): Firestore {
  if (!dbSingleton) {
    dbSingleton = createFirestore(app);
    if (isUsingFirestoreEmulator() && !emulatorLinked) {
      connectFirestoreEmulator(dbSingleton, emulatorHost(), emulatorPort());
      emulatorLinked = true;
    }
  }
  return dbSingleton;
}
