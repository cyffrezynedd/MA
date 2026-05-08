import { useMemo } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** `#RRGGBB` → `rgba(r,g,b,a)` — 8-символьный hex (#RRGGBBAA) на части Android/RN даёт битый цвет. */
function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.trim().replace('#', '');
  if (raw.length !== 6) return hex;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Подсветка навигационных «плиток» как у активного таба:
 * светлая тема — `brand3`, тёмная — салатовый `tint` (как во `(tabs)/_layout`).
 */
export function useNavigationTileAccent() {
  const scheme = useColorScheme() ?? 'light';
  return useMemo(() => {
    const accent = scheme === 'light' ? Colors.light.brand3 : Colors.dark.tint;
    // Было: `${accent}88` / `${accent}1F` — на телефоне RN иногда не парсит #RRGGBBAA.
    return {
      borderColor: hexToRgba(accent, 136 / 255),
      backgroundColor: hexToRgba(accent, 31 / 255),
    };
  }, [scheme]);
}
