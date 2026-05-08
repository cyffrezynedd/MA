/**
 * ViewModel экрана «Экосистема Go»: мониторинг сети + репозиторий + состояние UI (MVVM).
 */

import { useCallback, useEffect, useState } from 'react';

import { loadGoHubRepositories } from '@/lib/go-hub/go-hub-repository';
import type { GoHubRepository } from '@/lib/go-hub/types';

import { useNetworkStatus } from './use-network-status';

export function useGoHubViewModel() {
  const { isOnline, isOffline } = useNetworkStatus();
  const [repos, setRepos] = useState<GoHubRepository[]>([]);
  const [fromCache, setFromCache] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runLoad = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadGoHubRepositories(isOnline);
      setRepos(result.repos);
      setFromCache(result.fromCache);
      if (result.repos.length === 0) {
        setError(isOffline ? 'offline_empty' : null);
      }
    } catch (e) {
      const fallback = await loadGoHubRepositories(false);
      setRepos(fallback.repos);
      setFromCache(fallback.fromCache);
      if (fallback.repos.length > 0) {
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : 'unknown');
      }
    } finally {
      setLoading(false);
    }
  }, [isOffline, isOnline]);

  useEffect(() => {
    void runLoad();
  }, [runLoad]);

  return {
    repos,
    fromCache,
    loading,
    error,
    isOnline,
    isOffline,
    refresh: runLoad,
  };
}
