import * as Sentry from '@sentry/nuxt'

// Suppress browser extension and development warnings
if (typeof window !== 'undefined') {
  // Store original methods
  const originalError = console.error.bind(console)
  const originalWarn = console.warn.bind(console)

  // Override console.error to filter unwanted messages
  console.error = function (...args) {
    try {
      // Convert all args to strings and check for filtered content
      const message = args.map(arg => (typeof arg === 'string' ? arg : String(arg))).join(' ')

      // Filter out specific error messages
      if (
        message.includes('Immersive Translate') ||
        message.includes('Model not available') ||
        message.includes('deferred DOM Node') ||
        message.includes('onMounted is called when there is no active component instance')
      ) {
        return // Suppress this error
      }
    } catch (e) {
      // If filtering fails, just continue
    }

    // Call original method
    return originalError.apply(console, args)
  }

  // Override console.warn to filter unwanted warnings
  console.warn = function (...args) {
    try {
      // Convert all args to strings and check for filtered content
      const message = args.map(arg => (typeof arg === 'string' ? arg : String(arg))).join(' ')

      // Filter out Sentry DSN warnings
      if (message.includes('[sentry] Client SENTRY_DSN not provided')) {
        return // Suppress this warning
      }
    } catch (e) {
      // If filtering fails, just continue
    }

    // Call original method
    return originalWarn.apply(console, args)
  }
}

const rawClientDsn = process.env.SENTRY_DSN?.trim()
const clientIsPlaceholder =
  rawClientDsn && (rawClientDsn.includes('your-dsn') || rawClientDsn.includes('your-project-id'))
if (!rawClientDsn || clientIsPlaceholder) {
  console.warn(
    '[sentry] Client SENTRY_DSN not provided or placeholder; skipping Sentry initialization (dev/test)'
  )
} else {
  Sentry.init({
    dsn: rawClientDsn,
    tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
      ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
      : 1.0,
    replaysSessionSampleRate: process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE
      ? parseFloat(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE)
      : 0.1,
    replaysOnErrorSampleRate: process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE
      ? parseFloat(process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE)
      : 1.0,
    sendDefaultPii: true, // Enable MCP monitoring
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.browserTracingIntegration(),
    ],
    debug: process.env.NODE_ENV === 'development',
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  })
}
