/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Go-ish palette: blue + green + purple + black
const goBlue = '#00ADD8';
const goGreen = '#2DD4BF';
const goPurple = '#7C3AED';
/** Чуть глубже brand3 — хорошо читается на лиловых карточках светлой темы */
const progressFillLight = '#6D28D9';

const tintColorLight = goBlue;
const tintColorDark = '#A7F3D0';

export const Colors = {
  light: {
    text: '#11181C',
    /** База под градиентом Screen — не «клинический» #fff, ближе к бирюзовому диагоналю */
    background: '#F5F9FF',
    // light theme cards: soft purple (fun, not acidic)
    card: '#E9D5FF',
    border: 'rgba(17, 24, 28, 0.10)',
    muted: 'rgba(17, 24, 28, 0.62)',
    brand: goBlue,
    brand2: goGreen,
    brand3: goPurple,
    /** Заливка прогресс-бара (светлая тема — насыщенный фиолетовый) */
    progressFill: progressFillLight,
    danger: '#EF4444',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0B0F14',
    // slightly green-tinted dark cards (soft, not "acid")
    card: '#0F2320',
    border: 'rgba(236, 237, 238, 0.18)',
    muted: 'rgba(236, 237, 238, 0.7)',
    brand: goBlue,
    brand2: goGreen,
    brand3: goPurple,
    /** Заливка прогресс-бара (тёмная тема — мятно-зелёный в тон карточкам и brand2) */
    progressFill: goGreen,
    danger: '#F87171',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
