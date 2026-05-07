import React from 'react';
import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useNavigationTileAccent } from '@/hooks/use-navigation-tile-accent';
import { useThemeColor } from '@/hooks/use-theme-color';

/** Основная кнопка — тот же визуальный язык, что у навигационных плиток на главной (рамка + лёгкая заливка). */
export function PrimaryButton({
  title,
  style,
  ...rest
}: PressableProps & { title: string; style?: ViewStyle }) {
  const accent = useNavigationTileAccent();

  return (
    <Pressable
      style={[styles.btn, { borderColor: accent.borderColor, backgroundColor: accent.backgroundColor }, style]}
      {...rest}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
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
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
