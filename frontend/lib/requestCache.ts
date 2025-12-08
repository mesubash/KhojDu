// Simple in-memory cache for GET responses (per session)
// Not persistent across reloads; use short TTL to avoid stale data.

type CacheEntry<T> = {
  data: T
  expiry: number
}

const cache = new Map<string, CacheEntry<any>>()

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCached<T>(key: string, data: T, ttlMs: number) {
  cache.set(key, { data, expiry: Date.now() + ttlMs })
}

export function invalidate(key: string) {
  cache.delete(key)
}

export function clearCache() {
  cache.clear()
}
