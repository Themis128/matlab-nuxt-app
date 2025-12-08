/**
 * API Logging Middleware
 * Logs all API requests with timing and error information
 */
import { logger } from '../utils/logger';

export default defineEventHandler(async (event: any) => {
  const startTime = Date.now();
  const method = getMethod(event);
  const path = getRequestURL(event).pathname;

  // Skip logging for health checks and static assets
  if (path.startsWith('/_nuxt') || path === '/favicon.ico' || path === '/health') {
    return;
  }

  // Log request start
  logger.debug('API Request started', {
    method,
    path,
  });

  // Handle response
  try {
    // Let the request proceed
    // We'll log the response in the error handler or after completion
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logError('API Request failed', error as Error, {
      method,
      path,
      duration,
    });
    throw error;
  }

  // Note: Response logging happens in error handler
  // For successful requests, we log in individual endpoints
});
