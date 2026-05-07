import { useMemo } from 'react';

import { useThemeColor } from '@/hooks/use-theme-color';

/** Только для элементов, которые **держат выбранное состояние** (сегменты в настройках). Для навигационных плиток — `useNavigationTileAccent`. */
export function useActiveAccentSurface() {
  const brand3 = useThemeColor({}, 'brand3');
  return useMemo(
    () => ({
      borderColor: `${brand3}88`,
      backgroundColor: `${brand3}1F`,
    }),
    [brand3]
  );
}
