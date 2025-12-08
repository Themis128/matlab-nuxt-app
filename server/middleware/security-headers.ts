/**
 * Security Headers Middleware
 * Adds security headers to all HTTP responses
 * Enhanced with CORS configuration for production
 */
export default defineEventHandler((event: any) => {
  const _headers = event.node.res.headers || {};
  const isProduction = process.env.NODE_ENV === 'production';
  const origin = getHeader(event, 'origin') || '';

  // CORS configuration - always restrict origins for security
  const allowedOrigins = isProduction
    ? (process.env.ALLOWED_ORIGINS?.split(',') || [process.env.NUXT_PUBLIC_SITE_URL || '']).filter(
        Boolean
      )
    : ['http://localhost:3000', 'http://127.0.0.1:3000']; // Specific origins in development

  const corsOrigin = allowedOrigins.includes(origin) ? origin : 'null';

  setHeader(event, 'Access-Control-Allow-Origin', corsOrigin);
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  setHeader(event, 'Access-Control-Allow-Credentials', isProduction ? 'false' : 'true');
  setHeader(event, 'Access-Control-Max-Age', 86400); // 24 hours

  // X-Frame-Options: Prevent clickjacking (more permissive in development)
  setHeader(event, 'X-Frame-Options', isProduction ? 'DENY' : 'SAMEORIGIN');

  // X-Content-Type-Options: Prevent MIME type sniffing
  setHeader(event, 'X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection: Enable XSS filter (legacy, but still useful)
  setHeader(event, 'X-XSS-Protection', '1; mode=block');

  // Referrer-Policy: Control referrer information
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy: Restrict browser features
  setHeader(
    event,
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // Strict-Transport-Security: Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    setHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content-Security-Policy: Prevent XSS and data injection attacks
  const connectSrc = [
    "'self'",
    'https://api.algolia.com',
    'https://*.algolia.net',
    'https://*.algolianet.com',
    'https://*.sentry.io', // Sentry error tracking
    'https://o4509062593708032.ingest.us.sentry.io', // Sentry ingest endpoint
    'https://api.iconify.design', // Iconify API for icons
  ];

  // Allow Chrome DevTools connection in development only
  if (!isProduction) {
    connectSrc.push('http://127.0.0.1:9222', 'http://localhost:9222');
  }

  // Generate nonce for inline scripts (more secure than 'unsafe-inline')
  const nonce = Buffer.from(Math.random().toString()).toString('base64');

  // Frame sources - more permissive in development to handle browser extensions
  const frameSrc = isProduction
    ? "'self'"
    : "'self' https://*.vimeo.com https://*.youtube.com https://*.github.com https://*.codesandbox.io data: blob:"; // Allow common iframe sources in dev

  // Development-specific CSP to handle browser extensions and dev tools
  const cspDirectives = isProduction
    ? [
        // Production CSP - strict security
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net https://unpkg.com`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob:",
        `connect-src ${connectSrc.join(' ')}`,
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        `frame-src ${frameSrc}`,
        "object-src 'none'",
      ]
    : [
        // Development CSP - more permissive for browser extensions and dev tools
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com chrome-extension: moz-extension:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com chrome-extension: moz-extension:",
        "font-src 'self' https://fonts.gstatic.com data: chrome-extension: moz-extension:",
        "img-src 'self' data: https: blob: chrome-extension: moz-extension:",
        `connect-src ${connectSrc.join(' ')} chrome-extension: moz-extension: ws: wss:`,
        "frame-ancestors 'self'", // Allow framing in development
        "base-uri 'self'",
        "form-action 'self'",
        `frame-src ${frameSrc} chrome-extension: moz-extension:`,
        "object-src 'self' data: blob:",
        "worker-src 'self' blob: data:",
        "child-src 'self' blob: data: chrome-extension: moz-extension:",
      ];

  // Store nonce for use in templates
  event.context.cspNonce = nonce;

  // Only upgrade insecure requests in production
  if (isProduction) {
    cspDirectives.push('upgrade-insecure-requests');
  }

  // Add CSP header (can be disabled in development with DISABLE_CSP=true)
  const disableCSP = process.env.DISABLE_CSP === 'true' && !isProduction;

  if (!disableCSP) {
    setHeader(event, 'Content-Security-Policy', cspDirectives.join('; '));
  } else {
    // CSP disabled for development - add warning header
    setHeader(event, 'X-CSP-Status', 'disabled-for-development');
  }

  // Cross-Origin-Embedder-Policy: Isolate browsing context
  // Note: This can break some third-party integrations, enable carefully
  // setHeader(event, 'Cross-Origin-Embedder-Policy', 'require-corp');

  // Cross-Origin-Opener-Policy: Isolate browsing context
  setHeader(event, 'Cross-Origin-Opener-Policy', 'same-origin');

  // Cross-Origin-Resource-Policy: Control resource loading
  setHeader(event, 'Cross-Origin-Resource-Policy', 'same-origin');
});
