import type { EdgeInsets } from 'react-native-safe-area-context';

/** Совпадает с `tabBarStyle.height`: видимая высота «капсулы». */
export const TAB_BAR_STYLE_HEIGHT = 66;

/** Отступ «капсулы» от нижнего края экрана (как у `tabBarStyle.bottom`). */
export const TAB_BAR_BOTTOM_GAP = 14;

/** Зазор между низом прокрутки и **верхом** капсулы таб-бара (как ты просил — около 5px). */
export const TAB_BAR_ABOVE_CAPSULE_GAP = 5;

/** Нижний `padding`: от низа экрана до верха таб-бара + `TAB_BAR_ABOVE_CAPSULE_GAP`. ≈14+66+5=85 (+ safe area). */
export function contentPaddingBottomWithTabBar(insets: EdgeInsets) {
  return TAB_BAR_BOTTOM_GAP + TAB_BAR_STYLE_HEIGHT + TAB_BAR_ABOVE_CAPSULE_GAP + insets.bottom;
}

/** Раньше отличался от `full`; сейчас та же геометрия, что у плавающего бара. */
export function contentPaddingBottomAboveFloatingTabCompact(insets: EdgeInsets) {
  return contentPaddingBottomWithTabBar(insets);
}

/** Небольшой отступ (экран курса без «второго поля» под таб-бар). */
export function contentPaddingBottomMinimal(insets: EdgeInsets, basePx = 16) {
  return basePx + insets.bottom;
}

/** `bottom` для `tabBarStyle` (над home indicator / системной полосой). */
export function tabBarBottomOffset(insets: EdgeInsets) {
  return TAB_BAR_BOTTOM_GAP + insets.bottom;
}
