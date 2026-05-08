import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  type TextInputProps,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Поле ввода с триколорной палитрой Go: бирюза, мята и фиолет на фоне и рамке.
 */
export function ThemedTextInput({ style, onFocus, onBlur, ...rest }: TextInputProps) {
  const [focused, setFocused] = useState(false);
  const scheme = useColorScheme();
  const muted = useThemeColor({}, 'muted');
  const brand = useThemeColor({}, 'brand');
  const brand2 = useThemeColor({}, 'brand2');
  const brand3 = useThemeColor({}, 'brand3');

  const isLight = scheme === 'light';

  const borderColor = focused
    ? brand
    : isLight
      ? `${brand3}AA`
      : `${brand2}CC`;

  const backgroundColor = focused
    ? isLight
      ? `${brand}22`
      : `${brand3}28`
    : isLight
      ? `${brand}0E`
      : `${brand2}18`;

  const webShadow = (() => {
    if (focused) {
      return isLight
        ? `0 0 0 3px ${brand}55, 0 6px 22px ${brand3}40, 0 2px 8px ${brand}28`
        : `0 0 0 3px ${brand2}55, 0 6px 26px ${brand3}50, 0 2px 10px rgba(0,0,0,0.45)`;
    }
    return isLight
      ? `0 3px 14px ${brand3}35, 0 1px 4px ${brand}20`
      : `0 3px 16px rgba(0,0,0,0.5), 0 0 24px ${brand2}22`;
  })();

  return (
    <TextInput
      placeholderTextColor={rest.placeholderTextColor ?? muted}
      selectionColor={brand3}
      cursorColor={brand}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        styles.base,
        {
          borderColor,
          borderWidth: focused ? 2.5 : 2,
          backgroundColor,
          color: textColor,
          ...(Platform.OS === 'web'
            ? { boxShadow: webShadow }
            : {
                shadowColor: focused ? brand2 : brand3,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: focused ? 0.45 : 0.35,
                shadowRadius: focused ? 10 : 6,
                elevation: focused ? 6 : 3,
              }),
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'Inter_400Regular',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    lineHeight: 24,
    minHeight: 50,
  },
});
