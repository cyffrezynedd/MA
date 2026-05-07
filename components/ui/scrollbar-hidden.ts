import { Platform, type StyleProp, type ViewStyle } from 'react-native';

/** На web дополнительно гасим полосы прокрутки (глобально дублирует `app/+html.tsx`). */
export function webHiddenScrollbarStyle(): StyleProp<ViewStyle> {
  if (Platform.OS !== 'web') return undefined;
  return {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  } as unknown as ViewStyle;
}
