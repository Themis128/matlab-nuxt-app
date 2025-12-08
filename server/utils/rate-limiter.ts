/**
 * Rate limiting utility
 * Uses Redis if available, falls back to in-memory storage
 */

import { getCache, setCache } from './cache';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (event: any) => string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

class MemoryRateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();

  async check(key: string, maxRequests: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      // Create new record
      const resetTime = now + windowMs;
      this.store.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime,
      };
    }

    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    // Increment count
    record.count++;
    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const memoryLimiter = new MemoryRateLimiter();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      memoryLimiter.cleanup();
    },
    5 * 60 * 1000
  );
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  event: any,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { windowMs, maxRequests, keyGenerator } = options;

  // Generate key (IP address by default)
  const key =
    keyGenerator?.(event) ||
    `ratelimit:${event.node?.req?.headers?.['x-forwarded-for'] || event.node?.req?.socket?.remoteAddress || 'unknown'}`;

  // Try Redis first
  const redisKey = `ratelimit:${key}`;
  const cached = await getCache<{ count: number; resetTime: number }>(redisKey);

  if (cached) {
    const now = Date.now();
    if (now > cached.resetTime) {
      // Window expired, reset
      await setCache(redisKey, { count: 1, resetTime: now + windowMs }, Math.ceil(windowMs / 1000));
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    if (cached.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: cached.resetTime,
      };
    }

    // Increment count
    const updated = { ...cached, count: cached.count + 1 };
    await setCache(redisKey, updated, Math.ceil(windowMs / 1000));
    return {
      allowed: true,
      remaining: maxRequests - updated.count,
      resetTime: cached.resetTime,
    };
  }

  // Fallback to memory limiter
  return memoryLimiter.check(key, maxRequests, windowMs);
}

/**
 * Rate limit middleware factory
 */
export function createRateLimit(options: RateLimitOptions) {
  return async (event: any) => {
    const result = await checkRateLimit(event, options);

    if (!result.allowed) {
      setHeader(event, 'X-RateLimit-Limit', options.maxRequests.toString());
      setHeader(event, 'X-RateLimit-Remaining', result.remaining.toString());
      setHeader(event, 'X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      setHeader(event, 'Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000));

      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        data: {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded. Please try again later.',
            resetTime: new Date(result.resetTime).toISOString(),
          },
        },
      });
    }

    // Set rate limit headers
    setHeader(event, 'X-RateLimit-Limit', options.maxRequests.toString());
    setHeader(event, 'X-RateLimit-Remaining', result.remaining.toString());
    setHeader(event, 'X-RateLimit-Reset', new Date(result.resetTime).toISOString());
  };
}
