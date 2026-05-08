import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** Учебный сценарий ЛР: хранение email/пароля для повторного входа после биометрии (не для продакшена). */
const CREDENTIALS_KEY = 'gocourseslab_lab4_firebase_ep';

export function isBiometricLoginPlatformSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export async function hasSavedCredentials(): Promise<boolean> {
  if (!isBiometricLoginPlatformSupported()) return false;
  const raw = await SecureStore.getItemAsync(CREDENTIALS_KEY);
  return raw != null && raw.length > 0;
}

/** Есть ли на устройстве хотя бы PIN/пароль/биометрия — иначе LocalAuthentication нечем подтвердить. */
async function deviceCanLocalAuthenticate(): Promise<boolean> {
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    return level !== LocalAuthentication.SecurityLevel.NONE;
  } catch {
    return false;
  }
}

export async function canOfferBiometricLogin(): Promise<boolean> {
  if (!isBiometricLoginPlatformSupported()) return false;
  if (!(await hasSavedCredentials())) return false;
  return deviceCanLocalAuthenticate();
}

/** Сохранить логин/пароль для кнопки «войти по биометрии» (только после явного согласия пользователя). */
export async function saveCredentialsForBiometricLogin(email: string, password: string): Promise<void> {
  if (!isBiometricLoginPlatformSupported()) return;
  const payload = JSON.stringify({ email: email.trim(), password });
  /** `keychainAccessible` только для iOS; на Android опция игнорируется модулем. */
  if (Platform.OS === 'ios') {
    await SecureStore.setItemAsync(CREDENTIALS_KEY, payload, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } else {
    await SecureStore.setItemAsync(CREDENTIALS_KEY, payload);
  }
}

export async function clearSavedLoginCredentials(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
  } catch {
    /* noop */
  }
}

export type BiometricPromptMessages = {
  promptMessage: string;
  cancelLabel: string;
};

/**
 * Запрашивает биометрию и возвращает сохранённые учётные данные при успехе.
 */
export async function revealCredentialsWithBiometric(
  messages: BiometricPromptMessages
): Promise<{ email: string; password: string } | null> {
  if (!isBiometricLoginPlatformSupported()) return null;
  const has = await hasSavedCredentials();
  if (!has) return null;
  if (!(await deviceCanLocalAuthenticate())) return null;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: messages.promptMessage,
    cancelLabel: messages.cancelLabel,
    disableDeviceFallback: false,
  });
  if (!result.success) return null;

  const raw = await SecureStore.getItemAsync(CREDENTIALS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { email?: string; password?: string };
    if (typeof parsed.email === 'string' && typeof parsed.password === 'string') {
      return { email: parsed.email, password: parsed.password };
    }
  } catch {
    /* noop */
  }
  return null;
}
