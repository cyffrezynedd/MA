import Constants from 'expo-constants';
import { Platform } from 'react-native';

function trimEnv(v: string | undefined): string | undefined {
  const t = v?.trim();
  return t || undefined;
}

/** IP ПК для эмуляторов Firebase: тот же хост, с которого устройство тянет Metro (Expo Go). */
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

/**
 * Хост для `connectFirestoreEmulator` / `connectAuthEmulator` (не URL).
 * AVD: 10.0.2.2; устройство в LAN: IP из Metro или EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST.
 */
export function resolveFirebaseEmulatorLanHost(): string {
  const isAndroidAvd = Platform.OS === 'android' && Constants.isDevice !== true;
  if (isAndroidAvd) {
    return '10.0.2.2';
  }
  const fromMetro = hostFromExpoDevUri();
  if (fromMetro) return fromMetro;
  const fromEnv = trimEnv(process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST);
  return fromEnv ?? (Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1');
}
