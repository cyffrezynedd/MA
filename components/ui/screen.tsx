import React from 'react';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  contentPaddingBottomAboveFloatingTabCompact,
  contentPaddingBottomMinimal,
  contentPaddingBottomWithTabBar,
} from '@/lib/layout/tab-bar';

export function Screen({
  children,
  style,
  withGradient = true,
  /**
   * Резерв снизу под плавающий таб-бар: `full` — как на вкладках; `compact` — урезанный;
   * `minimal` — база 16px + safe area (экран курса / веб без лишней полосы ~96px).
   */
  tabBarClearance = 'full',
  ...rest
}: ViewProps & {
  withGradient?: boolean;
  tabBarClearance?: 'full' | 'compact' | 'minimal';
}) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const bg = useThemeColor({}, 'background');
  const brand = useThemeColor({}, 'brand');
  const brand2 = useThemeColor({}, 'brand2');
  const brand3 = useThemeColor({}, 'brand3');

  return (
    <View style={[styles.root, { backgroundColor: bg }, style]} {...rest}>
      {withGradient ? (
        <>
          {/* smooth diagonal base */}
          <LinearGradient
            colors={
              scheme === 'light'
                ? ['#FFFFFF', `${brand}2A`, `${brand}18`]
                : [`${brand}22`, `${brand3}1A`, `${brand2}14`, 'transparent']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : null}
      <View
        style={[
          styles.content,
          {
            paddingBottom:
              tabBarClearance === 'minimal'
                ? contentPaddingBottomMinimal(insets)
                : tabBarClearance === 'compact'
                  ? contentPaddingBottomAboveFloatingTabCompact(insets)
                  : contentPaddingBottomWithTabBar(insets),
          },
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 18, default: 16 }),
    gap: 12,
  },
});

