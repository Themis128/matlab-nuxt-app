// Only initialize Sentry if a DSN is set and it is not the default placeholder
const rawDsn = process.env.SENTRY_DSN?.trim()
const isPlaceholder = rawDsn && (rawDsn.includes('your-dsn') || rawDsn.includes('your-project-id'))

export default (sentry: any) => {
  // Skip initialization if no DSN or placeholder DSN
  if (!rawDsn || isPlaceholder) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[sentry] No valid SENTRY_DSN provided; Sentry disabled in production')
    }
    return // Skip initialization
  }

  try {
    sentry.init({
      dsn: rawDsn, // Use the trimmed DSN
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // Lower sample rate in production
      sendDefaultPii: true, // Enable MCP monitoring
      environment: process.env.NODE_ENV || 'development',

      // Error filtering
      beforeSend(event: any) {
        // Filter out development-only errors
        if (process.env.NODE_ENV === 'development') {
          // Skip certain development errors
          if (event.exception?.values?.[0]?.value?.includes('UNKNOWN: unknown error, open')) {
            return null; // Don't send this error
          }
        }
        return event;
      },

      // Integrations configuration
      integrations: [
        // Only enable tracing in production or when explicitly enabled
        ...(process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLE_TRACING === 'true'
          ? [sentry.httpIntegration()]
          : [])
      ],
    })
  } catch (error) {
    console.warn('[sentry] Failed to initialize Sentry:', error)
  }
}
