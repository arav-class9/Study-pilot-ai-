interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export function getCachedAIResponse(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCachedAIResponse(key: string, data: any): void {
  // Cap cache size to 200 entries to prevent memory leaks
  if (cache.size > 200) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function generateCacheKey(service: string, payload: any): string {
  const str = JSON.stringify(payload);
  return `${service}:${Buffer.from(str).toString('base64').substring(0, 80)}`;
}
