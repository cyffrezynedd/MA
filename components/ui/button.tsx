import React from 'react';
import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useNavigationTileAccent } from '@/hooks/use-navigation-tile-accent';
import { useThemeColor } from '@/hooks/use-theme-color';

/** Основная кнопка — рамка и заливка как у Sort / плиток навигации (`useNavigationTileAccent`). */
export function PrimaryButton({
  title,
  titleNumberOfLines,
  style,
  ...rest
}: PressableProps & { title: string; titleNumberOfLines?: number; style?: ViewStyle }) {
  const accent = useNavigationTileAccent();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.accentBtn,
        { borderColor: accent.borderColor, backgroundColor: accent.backgroundColor, opacity: pressed ? 0.88 : 1 },
        style,
      ]}
      {...rest}>
      <ThemedText type="defaultSemiBold" numberOfLines={titleNumberOfLines} style={styles.primaryBtnText}>
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
    <Pressable style={[styles.accentBtn, { backgroundColor: bg, borderColor: border }, style]} {...rest}>
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
    <Pressable style={[styles.accentBtn, { backgroundColor: `${danger}22`, borderColor: `${danger}55` }, style]} {...rest}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryBtnText: {
    textAlign: 'center',
  },
  /** Как `sortBtnInline` в каталоге — одна линия с плитками «История» / Add note. */
  accentBtn: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
