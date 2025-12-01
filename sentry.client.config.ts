import * as Sentry from '@sentry/nuxt'

const rawClientDsn = process.env.SENTRY_DSN?.trim()
const clientIsPlaceholder =
  rawClientDsn && (rawClientDsn.includes('your-dsn') || rawClientDsn.includes('your-project-id'))
if (!rawClientDsn || clientIsPlaceholder) {
  console.info(
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
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    debug: process.env.NODE_ENV === 'development',
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  })
}
