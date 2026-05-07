import React from 'react';
import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export function PrimaryButton({
  title,
  style,
  ...rest
}: PressableProps & { title: string; style?: ViewStyle }) {
  const scheme = useColorScheme() ?? 'light';
  const brand = useThemeColor({}, 'brand');
  const brand2 = useThemeColor({}, 'brand2');
  const brand3 = useThemeColor({}, 'brand3');
  const isLight = scheme === 'light';

  return (
    <Pressable
      style={[
        styles.btn,
        isLight ? { backgroundColor: '#D8B4FE', borderColor: '#A78BFA' } : undefined,
        style,
      ]}
      {...rest}>
      {!isLight ? (
        <LinearGradient
          colors={[brand, brand3, brand2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      ) : null}
      <ThemedText type="defaultSemiBold" style={isLight ? styles.textLight : styles.text}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

export function SoftButton({
  title,
  style,
  ...rest
}: PressableProps & { title: string; style?: ViewStyle }) {
  const border = useThemeColor({}, 'border');
  const bg = useThemeColor({}, 'card');

  return (
    <Pressable style={[styles.btn, { backgroundColor: bg, borderColor: border }, style]} {...rest}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
    </Pressable>
  );
}

export function DangerButton({
  title,
  style,
  ...rest
}: PressableProps & { title: string; style?: ViewStyle }) {
  const danger = useThemeColor({}, 'danger');
  return (
    <Pressable style={[styles.btn, { backgroundColor: `${danger}22`, borderColor: `${danger}55` }, style]} {...rest}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  text: {
    color: '#001018',
  },
  textLight: {
    color: '#3B0764',
  },
});

