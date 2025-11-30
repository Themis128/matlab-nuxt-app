# Error Tracking & Monitoring Setup Guide

This guide will help you integrate error tracking and monitoring into the MATLAB Deep Learning & Mobile Dataset Analysis application.

## Table of Contents

- [Overview](#overview)
- [Recommended Services](#recommended-services)
- [Sentry Integration (Recommended)](#sentry-integration-recommended)
- [Alternative Solutions](#alternative-solutions)
- [Performance Monitoring](#performance-monitoring)
- [Best Practices](#best-practices)

---

## Overview

Error tracking helps you:
- 🐛 Catch and fix production bugs quickly
- 📊 Monitor application performance
- 🔍 Track user issues with context
- 📈 Analyze error trends and patterns
- 🚨 Get real-time alerts for critical issues

---

## Recommended Services

| Service | Best For | Free Tier | Pricing |
|---------|----------|-----------|---------|
| **[Sentry](https://sentry.io)** | Full-stack error tracking | 5K events/month | $26/month |
| **[LogRocket](https://logrocket.com)** | Session replay + errors | 1K sessions/month | $99/month |
| **[Rollbar](https://rollbar.com)** | Real-time error tracking | 5K events/month | $15/month |
| **[Bugsnag](https://bugsnag.com)** | Mobile-first tracking | 7.5K events/month | $59/month |
| **[Datadog](https://datadog.com)** | Enterprise monitoring | 14-day trial | Custom |

**Recommendation**: Start with **Sentry** (free tier is generous and easy to integrate)

---

## Sentry Integration (Recommended)

### Step 1: Create Sentry Account

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project for "Vue" (for Nuxt frontend)
3. Create a second project for "Python" (for FastAPI backend)
4. Save your DSN (Data Source Name) keys

### Step 2: Install Sentry SDK

#### For Nuxt.js Frontend

```bash
npm install @sentry/vue
```

#### For Python API

```bash
cd python_api
pip install sentry-sdk[fastapi]
echo "sentry-sdk[fastapi]>=1.40.0" >> requirements.txt
```

### Step 3: Configure Sentry for Nuxt

Create `plugins/sentry.client.ts`:

```typescript
import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      app: nuxtApp.vueApp,
      dsn: config.public.sentryDsn,
      environment: config.public.environment || 'production',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // Capture 10% of transactions for performance
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% when error occurs
      
      // Additional configuration
      beforeSend(event, hint) {
        // Filter out development errors
        if (event.request?.url?.includes('localhost')) {
          return null
        }
        return event
      },
    })
  }
})
```

Update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
      environment: process.env.NODE_ENV || 'development',
    },
  },
})
```

Add to `.env.example`:

```env
# Sentry Configuration
NUXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### Step 4: Configure Sentry for Python API

Update `python_api/api.py`:

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

# Initialize Sentry
SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN and os.getenv("NODE_ENV") == "production":
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            StarletteIntegration(transaction_style="endpoint"),
            FastApiIntegration(transaction_style="endpoint"),
        ],
        traces_sample_rate=0.1,  # 10% of transactions
        profiles_sample_rate=0.1,  # 10% for profiling
        environment=os.getenv("ENVIRONMENT", "production"),
        # Send PII (Personally Identifiable Information) - disable for privacy
        send_default_pii=False,
    )
    logging.getLogger("python_api").info("Sentry initialized for error tracking")
```

Add to `python_api/.env.example`:

```env
# Sentry Configuration
SENTRY_DSN=https://your-python-dsn@sentry.io/project-id
ENVIRONMENT=production
```

### Step 5: Test Sentry Integration

#### Test Frontend

Add a test button in your app (remove in production):

```vue
<template>
  <UButton @click="testSentry" color="red" variant="soft">
    Test Sentry Error
  </UButton>
</template>

<script setup lang="ts">
const testSentry = () => {
  throw new Error('Test Sentry Error - Frontend')
}
</script>
```

#### Test Backend

Add a test endpoint (remove in production):

```python
@app.get("/test-sentry")
async def test_sentry():
    """Test endpoint to verify Sentry integration"""
    if os.getenv("NODE_ENV") != "production":
        raise Exception("Test Sentry Error - Backend")
    return {"message": "Sentry test only available in development"}
```

### Step 6: Add GitHub Secrets

In GitHub repository settings → Secrets → Actions:

```
SENTRY_DSN_FRONTEND=https://your-frontend-dsn@sentry.io/project-id
SENTRY_DSN_BACKEND=https://your-backend-dsn@sentry.io/project-id
```

Update `.github/workflows/deploy.yml` to pass these as environment variables.

---

## Alternative Solutions

### 1. LogRocket (Session Replay + Errors)

Best for: Understanding user behavior + errors

```bash
npm install logrocket logrocket-vue
```

```typescript
// plugins/logrocket.client.ts
import LogRocket from 'logrocket'

export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === 'production') {
    LogRocket.init('your-app-id/your-project')
  }
})
```

### 2. Custom Error Tracking (Free)

Create `server/api/log-error.post.ts`:

```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Log to console/file/database
  console.error('[Frontend Error]', {
    message: body.message,
    stack: body.stack,
    url: body.url,
    timestamp: new Date().toISOString(),
  })
  
  // Optional: Send to email, Slack, Discord webhook
  // await $fetch('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', {
  //   method: 'POST',
  //   body: { text: `Error: ${body.message}` }
  // })
  
  return { success: true }
})
```

Frontend error handler:

```typescript
// plugins/error-handler.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    $fetch('/api/log-error', {
      method: 'POST',
      body: {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        component: instance?.$options.name,
        info,
      },
    }).catch(console.error)
  }
})
```

---

## Performance Monitoring

### Add Performance Metrics

Create `composables/usePerformance.ts`:

```typescript
export const usePerformance = () => {
  const trackPageLoad = () => {
    if (typeof window === 'undefined') return
    
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      }
      
      // Send to your monitoring service or API
      console.log('Performance Metrics:', metrics)
      
      // Optional: Send to Sentry
      // Sentry.setMeasurement('page.load', loadComplete, 'millisecond')
    })
  }
  
  return { trackPageLoad }
}
```

Use in `app.vue`:

```typescript
const { trackPageLoad } = usePerformance()
onMounted(() => trackPageLoad())
```

---

## Best Practices

### 1. Environment-Based Configuration

```typescript
const isDev = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Only initialize in production
if (isProduction) {
  Sentry.init({ /* config */ })
}
```

### 2. Error Filtering

```typescript
beforeSend(event) {
  // Don't send development errors
  if (isDev) return null
  
  // Filter out known issues
  if (event.message?.includes('ResizeObserver')) return null
  
  // Filter by status code
  if (event.request?.url?.includes('404')) return null
  
  return event
}
```

### 3. Context Enrichment

```typescript
// Add user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
})

// Add custom tags
Sentry.setTag('page', 'dashboard')
Sentry.setTag('feature', 'predictions')

// Add breadcrumbs
Sentry.addBreadcrumb({
  message: 'User clicked predict button',
  category: 'ui.click',
  level: 'info',
})
```

### 4. Rate Limiting

Prevent error spam:

```typescript
Sentry.init({
  // ... other config
  beforeSend(event) {
    // Track error frequency
    const errorKey = event.exception?.values?.[0]?.type || 'unknown'
    // Implement your rate limiting logic
    return event
  },
})
```

---

## Next Steps

1. ✅ Choose an error tracking service (recommend Sentry)
2. ✅ Sign up and get DSN keys
3. ✅ Install SDKs for frontend and backend
4. ✅ Configure environment variables
5. ✅ Test integration in development
6. ✅ Deploy to production
7. ✅ Set up alerts and notifications
8. ✅ Create monitoring dashboard

---

## Resources

- [Sentry Vue Documentation](https://docs.sentry.io/platforms/javascript/guides/vue/)
- [Sentry FastAPI Integration](https://docs.sentry.io/platforms/python/integrations/fastapi/)
- [Nuxt Error Handling](https://nuxt.com/docs/getting-started/error-handling)
- [Web Vitals](https://web.dev/vitals/)

---

## Support

For issues with error tracking integration:
- Open an issue: [GitHub Issues](https://github.com/Themis128/matlab-nuxt-app/issues)
- Check documentation: [Project Docs](../docs/README.md)
