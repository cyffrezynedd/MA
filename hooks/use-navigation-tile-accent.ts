import { useMemo } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Подсветка навигационных «плиток» как у активного таба:
 * светлая тема — `brand3`, тёмная — салатовый `tint` (как во `(tabs)/_layout`).
 */
export function useNavigationTileAccent() {
  const scheme = useColorScheme() ?? 'light';
  return useMemo(() => {
    const accent = scheme === 'light' ? Colors.light.brand3 : Colors.dark.tint;
    return {
      borderColor: `${accent}88`,
      backgroundColor: `${accent}1F`,
    };
  }, [scheme]);
}
