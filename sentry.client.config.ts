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
    } catch {
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
    } catch {
      // If filtering fails, just continue
    }

    // Call original method
    return originalWarn.apply(console, args)
  }
}

const rawClientDsn = process.env.SENTRY_DSN?.trim()
const clientIsPlaceholder =
  rawClientDsn && (rawClientDsn.includes('your-dsn') || rawClientDsn.includes('your-project-id'))

export default (sentry: any) => {
  if (!rawClientDsn || clientIsPlaceholder) {
    return // Skip initialization if DSN is not provided or is a placeholder
  }

  try {
    sentry.init({
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
      sentry.replayIntegration({
        // Privacy Configuration
        maskAllText: true,
        blockAllMedia: true,
        maskAllInputs: true,

        // Network Details - Capture API requests for debugging
        networkDetailAllowUrls: [
          typeof window !== 'undefined' ? window.location.origin : '', // Allow capturing network details for same-origin requests
          /^https:\/\/api\./, // Allow API endpoints
        ],
        networkCaptureBodies: true,
        networkRequestHeaders: ['Content-Type', 'Authorization'],
        networkResponseHeaders: ['Content-Type', 'X-RateLimit-Remaining'],

        // Performance Configuration
        mutationLimit: 10000,
        mutationBreadcrumbLimit: 750,
        minReplayDuration: 5000,
        maxReplayDuration: 3600000, // 1 hour

        // Filtering - simplified to avoid type issues
        beforeAddRecordingEvent: (_event: unknown) => {
          // Return null to filter out specific events, or return _event to keep
          // For now, keeping all events but this can be customized based on needs
          return _event
        },

        // Error sampling filter
        beforeErrorSampling: (_event: unknown) => {
          // Always sample errors for important user flows
          return true
        },

        // Ignore slow clicks on certain elements
        slowClickIgnoreSelectors: ['.loading', '[disabled]', '.sentry-ignore-click'],
      }),
      sentry.browserTracingIntegration(),
      // Enable console integration for capturing console logs as breadcrumbs
      sentry.consoleIntegration(),
    ],
    debug: process.env.SENTRY_DEBUG === 'true',
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

    // Error filtering for client-side
    beforeSend(event: any) {
      // Filter out common development errors
      if (process.env.NODE_ENV === 'development') {
        const errorMessage = event.exception?.values?.[0]?.value || '';
        if (errorMessage.includes('ResizeObserver loop limit exceeded') ||
            errorMessage.includes('Non-Error promise rejection captured')) {
          return null; // Don't send these errors
        }
      }
      return event;
    },
  })
  } catch (error) {
    console.warn('[sentry] Failed to initialize Sentry client:', error)
  }
}
