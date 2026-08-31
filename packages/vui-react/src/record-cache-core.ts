/**
 * RecordView's page cache. **Module state, so it has its own module.**
 *
 * `toast-core` is here for the same reason and the note there is the general one: a second module
 * instance means a second cache, and a second cache means a table painting rows the other one already
 * invalidated. It is reached at `@viliha/vui-core/record-cache` rather than from the barrel, so the
 * import is deliberate.
 *
 * Lifted out of `record-field.tsx` unchanged on 2026-08-20.
 */

import type { ServerQuery } from "./record-field-core";

// Module-scoped response cache for RecordView's `fetcher` mode. Namespaced by
// `cacheKey` and living outside any component, so a cached page survives a
// remount / tab switch. LRU per namespace (insertion order = recency), with a
// TTL past which an entry isn't shown at all.
//
// A hit is only ever used to paint immediately: the server is asked every time
// regardless, and the answer replaces what was shown. Before 1.60 a hit
// returned early and no request was made, so a table could serve the same rows
// for the life of the page while another user changed them underneath.
export type RvCacheEntry = { rows: unknown[]; total: number; at: number };
const RV_CACHE = new Map<string, Map<string, RvCacheEntry>>();

/**
 * Drop cached pages: everything, or one `cacheKey`.
 *
 * RecordView clears the namespace itself after a mutation it performed. Call
 * this when something *else* changed the data: a websocket event, a bulk job,
 * an edit made on another screen.
 */
export function clearRecordViewCache(cacheKey?: string): void {
  if (cacheKey) RV_CACHE.delete(cacheKey);
  else RV_CACHE.clear();
}

/** Cache identity for a query: same key means same page of the same list.
 *  Exported for testing. */
export function rvQueryKey<T>(q: ServerQuery<T>): string {
  return JSON.stringify([q.page, q.pageSize, q.sort, q.search, q.filters, q.trash]);
}
/** A cached page, if one is there and still young enough to paint. Exported for
 *  testing. */
export function rvCacheGet(ns: string, key: string, ttlMs: number): RvCacheEntry | null {
  const bucket = RV_CACHE.get(ns);
  const hit = bucket?.get(key);
  if (!hit) return null;
  if (ttlMs > 0 && Date.now() - hit.at > ttlMs) {
    bucket!.delete(key);
    return null;
  }
  // Refresh recency.
  bucket!.delete(key);
  bucket!.set(key, hit);
  return hit;
}
/** Exported for testing. */
export function rvCacheSet(ns: string, key: string, entry: RvCacheEntry, max: number) {
  let bucket = RV_CACHE.get(ns);
  if (!bucket) {
    bucket = new Map();
    RV_CACHE.set(ns, bucket);
  }
  bucket.delete(key);
  bucket.set(key, entry);
  while (bucket.size > max) {
    const oldest = bucket.keys().next().value;
    if (oldest === undefined) break;
    bucket.delete(oldest);
  }
}
