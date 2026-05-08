/**
 * Слой доступа к данным (MVVM Model): сеть + локальный кэш.
 */

import { readGoHubCache, writeGoHubCache } from '@/lib/db/go-hub-cache';

import { fetchTopGoRepositories } from './github-api';
import type { GoHubRepository } from './types';

export type GoHubLoadResult = {
  repos: GoHubRepository[];
  fromCache: boolean;
};

/**
 * При онлайне — запрос к GitHub API и обновление кэша.
 * При офлайне или ошибке сети — последний сохранённый снимок из SQLite / localStorage.
 */
export async function loadGoHubRepositories(isOnline: boolean): Promise<GoHubLoadResult> {
  if (isOnline) {
    try {
      const repos = await fetchTopGoRepositories();
      await writeGoHubCache(repos);
      return { repos, fromCache: false };
    } catch {
      /* пробуем кэш */
    }
  }

  const cached = await readGoHubCache();
  if (cached && cached.repos.length > 0) {
    return { repos: cached.repos, fromCache: true };
  }

  return { repos: [], fromCache: false };
}
