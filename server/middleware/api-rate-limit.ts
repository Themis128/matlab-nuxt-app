/**
 * API Rate Limiting Middleware
 * Applies rate limiting to API endpoints
 */
import { createRateLimit } from '../utils/rate-limiter';

// Rate limit configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  keyGenerator: (event: any) => {
    // Use IP address or user ID if available
    const ip =
      getHeader(event, 'x-forwarded-for')?.split(',')[0] ||
      event.node?.req?.socket?.remoteAddress ||
      'unknown';

    // Add proper error handling for invalid IP
    if (!ip || typeof ip !== 'string') {
      return 'unknown';
    }

    return ip;
  },
};

const rateLimiter = createRateLimit(rateLimitConfig);

export default defineEventHandler(async (event: any) => {
  const path = getRequestURL(event).pathname;

  // Skip rate limiting for health checks and static assets
  if (
    path.startsWith('/_nuxt') ||
    path === '/favicon.ico' ||
    path === '/health' ||
    path.startsWith('/api/health')
  ) {
    return;
  }

  // Apply rate limiting to API routes
  if (path.startsWith('/api/')) {
    await rateLimiter(event);
  }
});
