# Sentry Logger Integration Guide

This guide explains how to use Sentry logging in your Nuxt application for comprehensive application monitoring and debugging.

## Overview

Sentry provides structured logging capabilities that allow you to send text-based log information from your applications to Sentry. Once in Sentry, these logs can be viewed alongside relevant errors, searched by text-string, or searched using their individual attributes.

## Setup

The Sentry Logger functionality has been integrated into your Nuxt application with the following components:

- **`composables/useSentryLogger.ts`** - Core logger composable
- **`sentry.client.config.ts`** - Updated with console integration
- **Test files** - Validation of logger implementation

## Requirements

- Sentry JavaScript SDK version `7.47.0` or above ✅ (Your project uses compatible versions)
- Valid Sentry DSN configured
- Console integration enabled ✅ (configured in your setup)

## Current Implementation Notes

**Important:** Your current Nuxt SDK version may not support the full structured logging features described in the Sentry documentation. This implementation provides logging functionality using available Sentry APIs (console integration, breadcrumbs, and captureMessage).

The structured logs feature (`Sentry.logger`) requires SDK version `9.41.0`+, but your project uses the Nuxt SDK which may have different API availability. This implementation uses:

- **Console Integration** - Captures console logs as breadcrumbs
- **Capture Message** - Sends log messages to Sentry
- **Breadcrumbs** - Adds context for debugging
- **User Context** - Associates logs with users
- **Error/Exception Handling** - Proper error capture

## Basic Usage

### Using the Logger Composable

```typescript
// In any Vue component or composable
const { info, error, warn, logApiRequest } = useSentryLogger();
```

### Log Levels

```typescript
const logger = useSentryLogger();

// Different log levels
logger.trace('Detailed trace information', { component: 'auth' });
logger.debug('Debug information for development', { userId: '123' });
logger.info('General information', { action: 'login' });
logger.warn('Warning about potential issues', { threshold: 80 });
logger.error('Error occurred', new Error('Database connection failed'), { userId: '456' });
logger.fatal('Critical system failure', error, { system: 'payment' });
```

### Context and Attributes

All logging methods accept an optional context object that adds structured data to your logs:

```typescript
logger.info('User logged in', {
  userId: '12345',
  loginMethod: 'email',
  ipAddress: '192.168.1.1',
  userAgent: 'Chrome/91.0',
  component: 'AuthService',
});
```

## Specialized Logging Methods

### API Request Logging

Automatically logs API calls with appropriate levels based on response status and performance:

```typescript
const logger = useSentryLogger();

// Successful API call
logger.logApiRequest('GET', '/api/users', 200, 150, {
  userId: '123',
  cached: false,
});

// Failed API call (automatically logged as error)
logger.logApiRequest('POST', '/api/payment', 500, 2000, {
  amount: 99.99,
  error: 'Payment gateway timeout',
});

// Slow API call (automatically logged as warning)
logger.logApiRequest('GET', '/api/reports', 200, 8000, {
  reportType: 'monthly',
  size: 'large',
});
```

### User Action Logging

Track user interactions and behaviors:

```typescript
logger.logUserAction('button_click', {
  button: 'checkout',
  page: '/cart',
  value: 129.99,
});

logger.logUserAction('form_submit', {
  form: 'contact',
  fields: ['name', 'email', 'message'],
});
```

### Performance Logging

Monitor application performance metrics:

```typescript
logger.logPerformance('page_load', 1250, 'ms', {
  page: '/dashboard',
  device: 'mobile',
});

logger.logPerformance('api_response_size', 2048576, 'bytes', {
  endpoint: '/api/data',
  compressed: true,
});
```

### Business Event Logging

Track important business events:

```typescript
logger.logBusinessEvent('purchase', {
  product: 'premium_plan',
  amount: 29.99,
  currency: 'USD',
  userId: '789',
});

logger.logBusinessEvent('subscription_upgrade', {
  from: 'basic',
  to: 'premium',
  revenue: 19.99,
});
```

## Advanced Usage

### Session Management

Track user sessions for better context:

```typescript
const logger = useSentryLogger();

// Start a session
logger.startSession('session_12345', {
  userId: '999',
  source: 'web',
  device: 'desktop',
});

// Log activities within the session
logger.info('User viewed dashboard', { page: '/dashboard' });
logger.logUserAction('export_data', { format: 'csv' });

// End the session
logger.endSession('session_12345', {
  duration: 1800, // 30 minutes
  pagesViewed: 5,
});
```

### Message Formatting

Use template formatting for dynamic messages:

```typescript
const logger = useSentryLogger();

// Template literals with fmt
const user = 'John';
const action = 'login';
const message = logger.fmt('${0} performed ${1} action', user, action);
logger.info(message, { userId: '123' });

// Printf-style formatting (server-side)
const printfMessage = logger.printf('User %s has %d items in cart', 'Alice', 3);
logger.info(printfMessage, { cartId: 'cart_456' });
```

### Error Handling with Context

Properly capture errors with rich context:

```typescript
try {
  await processPayment(paymentData);
  logger.info('Payment processed successfully', {
    orderId: paymentData.orderId,
    amount: paymentData.amount,
  });
} catch (error) {
  logger.error('Payment processing failed', error, {
    orderId: paymentData.orderId,
    amount: paymentData.amount,
    paymentMethod: paymentData.method,
    userId: paymentData.userId,
  });
  throw error;
}
```

## Configuration

### Environment Variables

```bash
# Sentry DSN (required)
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Environment
SENTRY_ENVIRONMENT=production

# Release tracking
SENTRY_RELEASE=1.2.3
```

### Console Integration

Your setup includes console integration that captures console logs as Sentry breadcrumbs:

```typescript
// In sentry.client.config.ts
integrations: [
  // ... other integrations
  Sentry.consoleIntegration(), // Captures console.log/warn/error
];
```

This means console logs are automatically captured and can be viewed in Sentry alongside errors.

## Integration Examples

### Vue Component Integration

```vue
<template>
  <button @click="handlePurchase" :disabled="loading">
    {{ loading ? 'Processing...' : 'Buy Now' }}
  </button>
</template>

<script setup>
const { logBusinessEvent, logUserAction, error } = useSentryLogger();
const loading = ref(false);

const handlePurchase = async () => {
  loading.value = true;

  try {
    logUserAction('purchase_initiated', {
      product: 'premium_plan',
      amount: 29.99,
    });

    await processPurchase();

    logBusinessEvent('purchase_completed', {
      product: 'premium_plan',
      amount: 29.99,
      revenue: 29.99,
    });
  } catch (err) {
    error('Purchase failed', err, {
      product: 'premium_plan',
      amount: 29.99,
      errorType: 'payment_failed',
    });
  } finally {
    loading.value = false;
  }
};
</script>
```

### API Route Monitoring

```typescript
// In server/api/users.get.ts
export default defineEventHandler(async (event) => {
  const { logApiRequest, error } = useSentryLogger();
  const startTime = Date.now();

  try {
    const userId = getRouterParam(event, 'id');
    const user = await getUserById(userId);

    const duration = Date.now() - startTime;
    logApiRequest('GET', `/api/users/${userId}`, 200, duration, {
      userId,
      found: !!user,
    });

    return user;
  } catch (err) {
    const duration = Date.now() - startTime;
    logApiRequest('GET', `/api/users/${getRouterParam(event, 'id')}`, 500, duration, {
      error: err.message,
    });

    error('Failed to fetch user', err, {
      userId: getRouterParam(event, 'id'),
      endpoint: '/api/users/[id]',
    });

    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
```

### Global Error Handler

```typescript
// In plugins/error-handler.client.ts
export default defineNuxtPlugin(() => {
  const { error } = useSentryLogger();

  // Global error handler
  window.addEventListener('error', (event) => {
    error('JavaScript error occurred', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      message: event.message,
      component: 'global_error_handler',
    });
  });

  // Vue error handler
  const app = useNuxtApp();
  app.vueApp.config.errorHandler = (err, instance, info) => {
    error('Vue error occurred', err, {
      component: instance?.$?.type?.name || 'unknown',
      lifecycleHook: info,
      route: app.$router?.currentRoute?.value?.path,
    });
  };
});
```

## Best Practices

### Log Levels

- **TRACE**: Very detailed information for debugging (usually disabled in production)
- **DEBUG**: Detailed information for development debugging
- **INFO**: General information about application operation
- **WARN**: Warning about potential issues that don't stop execution
- **ERROR**: Errors that affect functionality but don't crash the app
- **FATAL**: Critical errors that may cause system failure

### Context Information

Always include relevant context in your logs:

```typescript
// Good - includes user, action, and relevant data
logger.info('User updated profile', {
  userId: '123',
  fields: ['name', 'email'],
  ipAddress: '192.168.1.1',
});

// Avoid - missing context
logger.info('Profile updated');
```

### Sensitive Data

Never log sensitive information:

```typescript
// Bad - includes sensitive data
logger.info('Payment processed', {
  cardNumber: '4111111111111111', // Never log this!
  password: 'secret123',
});

// Good - sanitized data
logger.info('Payment processed', {
  lastFour: '1111',
  paymentMethod: 'credit_card',
  amount: 99.99,
});
```

### Performance Considerations

- Don't log in performance-critical loops
- Use appropriate log levels to control verbosity
- Consider sampling for high-frequency events
- Batch similar logs when possible

## Testing

Run the logger test suite to verify functionality:

```bash
# Test the logger implementation
node test_sentry_logger.cjs
```

This will test all core logging functionality with mocked Sentry methods.

## Troubleshooting

### Logs Not Appearing in Sentry

1. **Check Sentry DSN**: Ensure `SENTRY_DSN` is properly configured
2. **Verify Console Integration**: Console logs should appear as breadcrumbs
3. **Check Network**: Ensure Sentry requests aren't blocked
4. **Review Log Levels**: Make sure logs aren't filtered out

### Console Logs Not Captured

1. **Console Integration**: Ensure `Sentry.consoleIntegration()` is in your integrations
2. **Browser Console**: Check browser console for any Sentry errors
3. **Content Security Policy**: CSP might block Sentry requests

### Performance Issues

1. **Reduce Verbosity**: Use higher log levels in production
2. **Batch Logs**: Group similar log messages
3. **Conditional Logging**: Only log when necessary

## Migration from Console Logging

Replace console statements with structured logging:

```typescript
// Before
console.log('User logged in:', userId);
console.error('Payment failed:', error);

// After
const logger = useSentryLogger();
logger.info('User logged in', { userId });
logger.error('Payment failed', error, { userId, amount });
```

## Available Methods

### Core Logging Methods

- `trace(message, context?)` - Trace level logging
- `debug(message, context?)` - Debug level logging
- `info(message, context?)` - Info level logging
- `warn(message, context?)` - Warning level logging
- `error(message, error?, context?)` - Error level logging
- `fatal(message, error?, context?)` - Fatal level logging

### Specialized Methods

- `logApiRequest(method, url, statusCode?, duration?, context?)` - API request logging
- `logUserAction(action, details?, context?)` - User action logging
- `logPerformance(metric, value, unit?, context?)` - Performance logging
- `logBusinessEvent(event, properties?, context?)` - Business event logging

### Utilities

- `fmt(template, ...values)` - Template formatting
- `printf(template, ...args)` - Printf-style formatting

### Session Management

- `startSession(sessionId, context?)` - Start logging session
- `endSession(sessionId, context?)` - End logging session

## Summary

The Sentry Logger composable provides comprehensive logging functionality for your Nuxt application. It combines console logging with structured Sentry logging to give you full visibility into your application's behavior, errors, and performance.

Use the appropriate log levels, include relevant context, and follow the best practices outlined above for optimal monitoring and debugging capabilities.
