import React, { useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { rgbaFromHexByte } from '@/lib/color/rgba-from-hex';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Поле ввода с триколорной палитрой Go.
 * Цвета через rgba(...), те же числа что и у веба — без #RRGGBBAA на нативе.
 */
export function ThemedTextInput({ style, onFocus, onBlur, ...rest }: TextInputProps) {
  const [focused, setFocused] = useState(false);
  const scheme = useColorScheme();
  const muted = useThemeColor({}, 'muted');
  const textColor = useThemeColor({}, 'text');
  const brand = useThemeColor({}, 'brand');
  const brand2 = useThemeColor({}, 'brand2');
  const brand3 = useThemeColor({}, 'brand3');

  const isLight = scheme === 'light';

  const { borderColor, backgroundColor, webShadow } = useMemo(() => {
    const borderColorCalc = focused
      ? brand
      : isLight
        ? rgbaFromHexByte(brand3, 0xaa)
        : rgbaFromHexByte(brand2, 0xcc);

    const backgroundColorCalc = focused
      ? isLight
        ? rgbaFromHexByte(brand, 0x22)
        : rgbaFromHexByte(brand3, 0x28)
      : isLight
        ? rgbaFromHexByte(brand, 0x0e)
        : rgbaFromHexByte(brand2, 0x18);

    let shadow: string;
    if (focused) {
      shadow = isLight
        ? `0 0 0 3px ${rgbaFromHexByte(brand, 0x55)}, 0 6px 22px ${rgbaFromHexByte(brand3, 0x40)}, 0 2px 8px ${rgbaFromHexByte(brand, 0x28)}`
        : `0 0 0 3px ${rgbaFromHexByte(brand2, 0x55)}, 0 6px 26px ${rgbaFromHexByte(brand3, 0x50)}, 0 2px 10px rgba(0,0,0,0.45)`;
    } else {
      shadow = isLight
        ? `0 3px 14px ${rgbaFromHexByte(brand3, 0x35)}, 0 1px 4px ${rgbaFromHexByte(brand, 0x20)}`
        : `0 3px 16px rgba(0,0,0,0.5), 0 0 24px ${rgbaFromHexByte(brand2, 0x22)}`;
    }

    return {
      borderColor: borderColorCalc,
      backgroundColor: backgroundColorCalc,
      webShadow: shadow,
    };
  }, [brand, brand2, brand3, focused, isLight]);

  const borderWidth = focused ? 2.5 : 2;

  const nativeElevation = focused ? 4 : 2;

  const nativeShadowStyle =
    Platform.OS === 'ios'
      ? {
          shadowColor: focused ? brand2 : brand3,
          shadowOffset: { width: 0, height: focused ? 2 : 1 } as const,
          shadowOpacity: focused ? 0.32 : 0.2,
          shadowRadius: focused ? 8 : 4,
        }
      : null;

  const shellNative = {
    borderColor,
    borderWidth,
    backgroundColor,
    borderRadius: 18,
    overflow: 'hidden' as const,
    alignSelf: 'stretch' as const,
    ...(Platform.OS === 'android'
      ? { elevation: nativeElevation }
      : nativeShadowStyle ?? undefined),
  };

  const inputShared = {
    ...rest,
    placeholderTextColor: rest.placeholderTextColor ?? muted,
    selectionColor: brand3,
    cursorColor: brand,
    onFocus: (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setFocused(true);
      onFocus?.(e);
    },
    onBlur: (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setFocused(false);
      onBlur?.(e);
    },
  };

  if (Platform.OS === 'web') {
    return (
      <TextInput
        {...inputShared}
        style={[
          styles.webInput,
          {
            borderColor,
            borderWidth,
            backgroundColor,
            color: textColor,
            boxShadow: webShadow,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View style={shellNative}>
      <TextInput
        {...inputShared}
        underlineColorAndroid="transparent"
        style={[
          styles.nativeInput,
          {
            color: textColor,
            ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
          },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webInput: {
    fontFamily: 'Inter_400Regular',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    lineHeight: 24,
    minHeight: 50,
  },
  nativeInput: {
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    lineHeight: 24,
    minHeight: 50,
    width: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
});
