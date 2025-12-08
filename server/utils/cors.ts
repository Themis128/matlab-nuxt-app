/**
 * CORS Helper Utility
 * Provides secure CORS configuration for API endpoints
 * Replaces insecure '*' origin with proper origin validation
 */

export function getCorsOrigin(event: any): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const origin = getHeader(event, 'origin') || '';

  // CORS configuration - always restrict origins for security
  const allowedOrigins = isProduction
    ? (process.env.ALLOWED_ORIGINS?.split(',') || [process.env.NUXT_PUBLIC_SITE_URL || '']).filter(
        Boolean
      )
    : ['http://localhost:3000', 'http://127.0.0.1:3000']; // Specific origins in development

  return allowedOrigins.includes(origin) ? origin : 'null';
}

export function setCorsHeaders(event: any): void {
  const corsOrigin = getCorsOrigin(event);
  const isProduction = process.env.NODE_ENV === 'production';

  setHeader(event, 'Access-Control-Allow-Origin', corsOrigin);
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  setHeader(event, 'Access-Control-Allow-Credentials', isProduction ? 'false' : 'true');
  setHeader(event, 'Access-Control-Max-Age', 86400);
}
