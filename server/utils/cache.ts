/**
 * Caching utility with Redis support
 * Falls back to in-memory cache if Redis is not available
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string;
}

class MemoryCache {
  private cache = new Map<string, { value: unknown; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set(key: string, value: unknown, ttl: number): Promise<void> {
    const expires = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expires });

    // Clean up expired entries periodically
    if (this.cache.size > 1000) {
      this.cleanup();
    }
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Redis client (will be initialized if Redis is available)
let redisClient: any = null;
let memoryCache: MemoryCache | null = null;

/**
 * Initialize Redis client if available
 */
export async function initCache() {
  try {
    // Try to import and initialize Redis
    const redis = await import('ioredis').catch(() => null);
    if (redis && process.env.REDIS_URL) {
      redisClient = new redis.default(process.env.REDIS_URL, {
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      redisClient.on('error', (err: Error) => {
        console.warn('[Cache] Redis connection error, falling back to memory cache:', err.message);
        redisClient = null;
      });

      console.log('[Cache] Redis initialized');
      return;
    }
  } catch (error) {
    console.warn('[Cache] Redis not available, using memory cache:', error);
  }

  // Fallback to memory cache
  memoryCache = new MemoryCache();
  console.log('[Cache] Using in-memory cache');
}

/**
 * Get value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (redisClient) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('[Cache] Redis get error:', error);
      return null;
    }
  }

  if (memoryCache) {
    return memoryCache.get<T>(key);
  }

  return null;
}

/**
 * Set value in cache
 */
export async function setCache(key: string, value: unknown, ttl: number = 3600): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(value));
      return;
    } catch (error) {
      console.warn('[Cache] Redis set error:', error);
      // Fallback to memory cache
      if (!memoryCache) {
        memoryCache = new MemoryCache();
      }
    }
  }

  if (memoryCache) {
    await memoryCache.set(key, value, ttl);
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.del(key);
      return;
    } catch (error) {
      console.warn('[Cache] Redis delete error:', error);
    }
  }

  if (memoryCache) {
    await memoryCache.delete(key);
  }
}

/**
 * Generate cache key with prefix
 */
export function cacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = 3600, keyPrefix = 'cache' } = options;
  const fullKey = keyPrefix ? `${keyPrefix}:${key}` : key;

  // Try to get from cache
  const cached = await getCache<T>(fullKey);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  await setCache(fullKey, result, ttl).catch(() => {
    // Cache failure shouldn't break the request
  });
  return result;
}
