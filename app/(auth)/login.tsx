import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/ui/themed-text-input';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  canOfferBiometricLogin,
  isBiometricLoginPlatformSupported,
  revealCredentialsWithBiometric,
  saveCredentialsForBiometricLogin,
} from '@/lib/auth/biometric-login';
import { useAuth } from '@/providers/auth-provider';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn } = useAuth();
  const danger = useThemeColor({}, 'danger');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricOffered, setBiometricOffered] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void canOfferBiometricLogin().then(setBiometricOffered);
    }, [])
  );

  const goHome = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const promptSaveBiometricAfterLogin = useCallback(
    (loginEmail: string, loginPassword: string) => {
      if (!isBiometricLoginPlatformSupported()) {
        goHome();
        return;
      }
      Alert.alert(
        t('auth.biometricSaveTitle'),
        t('auth.biometricSaveMessage'),
        [
          { text: t('auth.biometricSaveNo'), style: 'cancel', onPress: goHome },
          {
            text: t('auth.biometricSaveYes'),
            onPress: () =>
              void saveCredentialsForBiometricLogin(loginEmail, loginPassword).finally(() => {
                setBiometricOffered(true);
                goHome();
              }),
          },
        ],
        { cancelable: true, onDismiss: goHome }
      );
    },
    [goHome, t]
  );

  const onSubmit = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      await signIn(email, password);
      promptSaveBiometricAfterLogin(email, password);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setBusy(false);
    }
  }, [email, password, promptSaveBiometricAfterLogin, signIn]);

  const onBiometricLogin = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const creds = await revealCredentialsWithBiometric({
        promptMessage: t('auth.biometricPrompt'),
        cancelLabel: t('course.cancel'),
      });
      if (!creds) {
        setError(t('auth.biometricUnavailable'));
        return;
      }
      setEmail(creds.email);
      setPassword(creds.password);
      await signIn(creds.email, creds.password);
      goHome();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setBusy(false);
    }
  }, [goHome, signIn, t]);

  return (
    <Screen tabBarClearance="minimal" withGradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <ThemedText type="title">{t('auth.loginTitle')}</ThemedText>

          <View style={styles.form}>
            <ThemedTextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
            />
            <ThemedTextInput
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {error ? (
              <ThemedText style={[styles.error, { color: danger }]} accessibilityLiveRegion="polite">
                {error}
              </ThemedText>
            ) : null}
            <PrimaryButton title={t('auth.signIn')} onPress={() => void onSubmit()} disabled={busy} />
            <PrimaryButton
              title={t('auth.createAccountCta')}
              onPress={() => router.push('/(auth)/register')}
            />
          </View>

          {biometricOffered ? (
            <PrimaryButton
              title={t('auth.biometricLogin')}
              onPress={() => void onBiometricLogin()}
              disabled={busy}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 16, paddingBottom: 24 },
  form: { gap: 12, marginTop: 8 },
  error: { fontSize: 14, lineHeight: 20 },
});
