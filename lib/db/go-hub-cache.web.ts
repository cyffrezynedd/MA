import type { GoHubRepository } from '@/lib/go-hub/types';

const LS_KEY = 'gocourses.web.goHubCache.v1';

export async function initGoHubCacheDb() {}

export async function readGoHubCache(): Promise<{ repos: GoHubRepository[]; fetchedAt: number } | null> {
  try {
    const raw = globalThis.localStorage?.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { repos?: GoHubRepository[]; fetchedAt?: number };
    if (!Array.isArray(parsed.repos) || typeof parsed.fetchedAt !== 'number') return null;
    return { repos: parsed.repos, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

export async function writeGoHubCache(repos: GoHubRepository[]): Promise<void> {
  try {
    globalThis.localStorage?.setItem(LS_KEY, JSON.stringify({ repos, fetchedAt: Date.now() }));
  } catch {}
}
