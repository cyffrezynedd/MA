import * as SQLite from 'expo-sqlite';

import type { GoHubRepository } from '@/lib/go-hub/types';

const CACHE_KEY = 'github_top_go_repos';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('gocourses.db');
  return dbPromise;
}

export async function initGoHubCacheDb() {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS go_hub_api_cache (
      cache_key TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );
  `);
}

export async function readGoHubCache(): Promise<{ repos: GoHubRepository[]; fetchedAt: number } | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ payload: string; fetched_at: number }>(
    `SELECT payload, fetched_at FROM go_hub_api_cache WHERE cache_key = ?;`,
    [CACHE_KEY]
  );
  if (!row) return null;
  try {
    const repos = JSON.parse(row.payload) as GoHubRepository[];
    if (!Array.isArray(repos)) return null;
    return { repos, fetchedAt: row.fetched_at };
  } catch {
    return null;
  }
}

export async function writeGoHubCache(repos: GoHubRepository[]): Promise<void> {
  const db = await getDb();
  const payload = JSON.stringify(repos);
  const fetchedAt = Date.now();
  await db.runAsync(
    `INSERT OR REPLACE INTO go_hub_api_cache (cache_key, payload, fetched_at) VALUES (?, ?, ?);`,
    [CACHE_KEY, payload, fetchedAt]
  );
}
