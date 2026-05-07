import { useApp } from '@/providers/app-provider';

export function useColorScheme(): 'light' | 'dark' {
  return useApp().resolvedColorScheme;
}
