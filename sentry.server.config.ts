import * as Sentry from '@sentry/nuxt'

// Only initialize Sentry if a DSN is set and it is not the default placeholder
const rawDsn = process.env.SENTRY_DSN?.trim()
const isPlaceholder = rawDsn && (rawDsn.includes('your-dsn') || rawDsn.includes('your-project-id'))
if (!rawDsn || isPlaceholder) {
  // Do not initialize Sentry without a valid DSN in non-production environments
  if (process.env.NODE_ENV === 'production') {
    console.warn('[sentry] No valid SENTRY_DSN provided; Sentry disabled in production')
  } else {
    console.warn(
      '[sentry] SENTRY_DSN not provided or placeholder; skipping Sentry initialization (dev/test)'
    )
  }
} else {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0, // Enable tracing in all environments
    // Note: Nitro does not support full server-side tracing in dev; warning may still appear
    environment: process.env.NODE_ENV,
    // Sentry tracing does not work on Nitro server-side in dev
    // Suppressed warning: tracing disabled in development
  })
}
