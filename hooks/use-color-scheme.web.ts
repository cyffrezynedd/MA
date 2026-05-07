import { useEffect, useState } from 'react';

import { useApp } from '@/providers/app-provider';

/**
 * On web we keep the "hydration guard", but the actual scheme comes from our AppProvider
 * (themePreference persisted in AsyncStorage).
 */
export function useColorScheme(): 'light' | 'dark' {
  const { resolvedColorScheme } = useApp();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated ? resolvedColorScheme : 'light';
}
