/**
 * Catalog list query utilities: category filter, sort modes, and dependency-free fuzzy search.
 */

export type CatalogListItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  updatedAt: number;
  likes?: number;
  dislikes?: number;
};

export type CatalogSortMode = 'title_asc' | 'title_desc' | 'updated_desc' | 'updated_asc';

/**
 * Filters catalog items by category. When `category` is `null`, returns all items (no filter).
 */
export function filterByCategory(
  items: CatalogListItem[],
  category: string | null,
): CatalogListItem[] {
  if (category === null) {
    return items.slice();
  }
  const c = category.trim();
  if (c.length === 0) {
    return items.slice();
  }
  return items.filter((item) => item.category === c);
}

function compareTitle(a: CatalogListItem, b: CatalogListItem): number {
  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
}

/**
 * Sorts a copy of `items` according to `mode`. Does not mutate the input array.
 */
export function sortCatalog(
  items: CatalogListItem[],
  mode: CatalogSortMode,
): CatalogListItem[] {
  const copy = items.slice();
  switch (mode) {
    case 'title_asc':
      copy.sort((a, b) => compareTitle(a, b));
      break;
    case 'title_desc':
      copy.sort((a, b) => -compareTitle(a, b));
      break;
    case 'updated_desc':
      copy.sort((a, b) => b.updatedAt - a.updatedAt);
      break;
    case 'updated_asc':
      copy.sort((a, b) => a.updatedAt - b.updatedAt);
      break;
  }
  return copy;
}

/** Unicode NFKC + lowercase + trim + internal whitespace collapsed (for stable matching). */
function normalizeUnicode(s: string): string {
  return s
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Fuzzy match algorithm (dependency-free):
 *
 * 1) **Normalize** query and searchable text with NFKC + lowercase + collapsed whitespace so
 *    visually similar characters and casing do not break matching.
 *
 * 2) **Token overlap (primary)**: split the query on whitespace into tokens (non-empty). Build a
 *    haystack string from title, description, and keywords (joined with spaces). For each token,
 *    check if it appears as a substring of the haystack. The **token score** is
 *    `matchedTokens / tokenCount`. If `token score >= threshold`, the item matches.
 *
 * 3) **Cheap string similarity on title (fallback)**: if token overlap is below threshold, compute
 *    **normalized Levenshtein similarity** between the normalized title and the full normalized
 *    query string: `1 - lev(a,b) / max(|a|,|b|)` (0 if both empty). If that similarity `>= threshold`,
 *    the item matches (helps short queries / typos against the title).
 *
 * The single `threshold` parameter (default `0.35`) gates both paths: slightly noisy token sets or
 * approximate title matches can still pass. Pass a higher value (e.g. `0.6`) for stricter matching.
 */
export function matchesQueryFuzzy(
  item: CatalogListItem,
  query: string,
  threshold: number = 0.35,
): boolean {
  const t = Math.min(1, Math.max(0, threshold));
  const qNorm = normalizeUnicode(query);
  if (qNorm.length === 0) {
    return true;
  }

  const titleNorm = normalizeUnicode(item.title);
  const descNorm = normalizeUnicode(item.description);
  const kwNorm = item.keywords.map((k) => normalizeUnicode(k)).filter((k) => k.length > 0);
  const haystack = [titleNorm, descNorm, ...kwNorm].join(' ');

  const tokens = qNorm.split(' ').filter((x) => x.length > 0);
  if (tokens.length === 0) {
    return true;
  }

  let matched = 0;
  for (const tok of tokens) {
    if (haystack.includes(tok)) {
      matched += 1;
    }
  }
  const tokenScore = matched / tokens.length;
  if (tokenScore >= t) {
    return true;
  }

  const lev = levenshtein(titleNorm, qNorm);
  const maxLen = Math.max(titleNorm.length, qNorm.length, 1);
  const levSim = 1 - lev / maxLen;
  return levSim >= t;
}

/** Classic iterative Levenshtein distance (insert/delete/substitute), O(|a|·|b|). */
function levenshtein(a: string, b: string): number {
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }
  const m = a.length;
  const n = b.length;
  const row = new Array<number>(n + 1);
  for (let j = 0; j <= n; j += 1) {
    row[j] = j;
  }
  for (let i = 1; i <= m; i += 1) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j += 1) {
      const tmp = row[j];
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n];
}

export type ApplyCatalogQueryOptions = {
  search?: string;
  category?: string | null;
  sort?: CatalogSortMode;
};

const DEFAULT_SORT: CatalogSortMode = 'updated_desc';

/**
 * Applies optional category filter, optional fuzzy `search`, then optional sort.
 * - `category: null` or omitting `category`: no category filter.
 * - Empty/whitespace `search` is treated as no search filter.
 */
export function applyCatalogQuery(
  items: CatalogListItem[],
  options: ApplyCatalogQueryOptions,
): CatalogListItem[] {
  const { search, category, sort = DEFAULT_SORT } = options;

  let result = items.slice();

  if (category !== undefined && category !== null) {
    result = filterByCategory(result, category);
  }

  const q = search?.trim() ?? '';
  if (q.length > 0) {
    result = result.filter((item) => matchesQueryFuzzy(item, q));
  }

  return sortCatalog(result, sort);
}
