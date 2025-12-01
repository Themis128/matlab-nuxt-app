# Sentry Quick Reference

## ✅ Sentry is Configured!

Your MATLAB Deep Learning & Mobile Dataset Analysis app is now tracking errors with Sentry.

## Quick Links

- **Sentry Dashboard**: https://sentry.io/organizations/baltzakisthemiscom/issues/
- **Project Issues**: https://sentry.io/organizations/baltzakisthemiscom/projects/matlab/
- **Test Page**: http://localhost:3000/sentry-example-page (when dev server is running)

## Configuration

- **Organization**: baltzakisthemiscom
- **Project**: matlab
- **DSN**: `https://bb27ea86bd4dd84e04b3cd93c8cef2f5@o4508632044281856.ingest.us.sentry.io/4508632045920256`

## Files

```
sentry.client.config.ts          # Client-side Sentry configuration
sentry.server.config.ts          # Server-side Sentry configuration
pages/sentry-example-page.vue    # Test page for error tracking
```

## Testing Sentry

1. Start dev server: `npm run dev`
2. Visit: http://localhost:3000/sentry-example-page
3. Click any error button to trigger a test error
4. Check your Sentry dashboard to see the error

## Manual Error Capture

### In Vue Components

```typescript
import * as Sentry from '@sentry/nuxt'

// Capture exception
try {
  // risky code
} catch (error) {
  Sentry.captureException(error)
}

// Capture message
Sentry.captureMessage('Something went wrong', 'warning')

// Add context
Sentry.setUser({ id: '123', email: 'user@example.com' })
Sentry.setTag('page', 'dashboard')
Sentry.setContext('device', { type: 'mobile', brand: 'Samsung' })
```

### In API Routes

```typescript
// server/api/example.ts
import * as Sentry from '@sentry/nuxt'

export default defineEventHandler(async event => {
  try {
    // Your API logic
  } catch (error) {
    Sentry.captureException(error, {
      tags: { api: 'example' },
      level: 'error',
    })
    throw error
  }
})
```

## Environment Variables

Override defaults in `.env`:

```env
SENTRY_DSN=your-dsn-here
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0
```

## Production Settings

For production, update `.env.production`:

```env
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1  # Sample 10% of transactions
SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.05  # 5% session replays
```

## Common Sentry Features

### Performance Monitoring

Traces are automatically captured. Sample rate: 100% (dev), 10% (prod recommended)

### Session Replay

Records user sessions when errors occur (100% on error, 10% normal sessions)

### Source Maps

Automatically uploaded in production builds for readable stack traces

### Breadcrumbs

Automatically captures:

- Network requests
- Console logs
- Navigation events
- User interactions

## Troubleshooting

**Issue**: Errors not appearing in Sentry
**Solution**: Check console for Sentry debug messages (enabled in development)

**Issue**: Too many events
**Solution**: Reduce `SENTRY_TRACES_SAMPLE_RATE` in production

**Issue**: Sensitive data in errors
**Solution**: Use `beforeSend` hook in sentry config to filter data

## Documentation

- [Sentry Nuxt Docs](https://docs.sentry.io/platforms/javascript/guides/nuxt/)
- [Error Tracking Setup Guide](./docs/ERROR_TRACKING_SETUP.md)

---

**Last Updated**: November 30, 2025
