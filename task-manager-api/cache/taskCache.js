import NodeCache from 'node-cache';

// ─── Cache Configuration ──────────────────────────────────────────────────────
// stdTTL  : lifetime of each cache entry in seconds (defaults to ~60s)
// checkperiod: how often node-cache scans for expired entries (120s)
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS) || 60;

const taskCache = new NodeCache({
  stdTTL: CACHE_TTL_SECONDS,
  checkperiod: 120
});

// Set CACHE_ENABLED=false to bypass the cache (used for before/after benchmarking)
const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false';

export const TASKS_ALL_KEY = 'tasks:all';
export const SEARCH_KEY_PREFIX = 'tasks:search:';

export { taskCache, CACHE_ENABLED, CACHE_TTL_SECONDS };

/**
 * Build a deterministic cache key for a search term so that
 * /tasks?search=Foo and /tasks?search=foo   share one entry.
 */
export const buildSearchKey = (term = '') => `${SEARCH_KEY_PREFIX}${String(term).trim().toLowerCase()}`;

/**
 * Escape user input so a search term is matched literally instead of being
 * interpreted as a regular expression (prevents ReDoS / invalid-pattern errors).
 */
export const escapeRegex = (text = '') => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getCachedTasks = (key) => {
  if (!CACHE_ENABLED) return undefined;
  return taskCache.get(key);
};

export const setCachedTasks = (key, value) => {
  if (!CACHE_ENABLED) return;
  taskCache.set(key, value);
};

/**
 * Drop every cached task-list entry: tasks:all plus all tasks:search:* keys.
 * Called after any successful write so a stale list is never served.
 */
export const invalidateTaskListCache = () => {
  if (!CACHE_ENABLED) return [];

  const searchKeys = taskCache.keys().filter((key) => key.startsWith(SEARCH_KEY_PREFIX));
  const keys = [TASKS_ALL_KEY, ...searchKeys];

  const deletedCount = taskCache.del(keys);

  console.log(
    `[CACHE] INVALIDATED: ${TASKS_ALL_KEY}` +
      (searchKeys.length ? ` (+${searchKeys.length} search key(s))` : '') +
      ` | ${deletedCount} entr${deletedCount === 1 ? 'y' : 'ies'} removed`
  );

  return keys;
};
