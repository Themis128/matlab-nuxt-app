# Sentry Metrics Integration Guide

This guide explains how to use Sentry Metrics in your Nuxt application for comprehensive monitoring and analytics.

## Overview

Sentry Metrics allows you to send counters, gauges, distributions, and sets from your application to Sentry. Once in Sentry, these metrics can be viewed alongside relevant errors and searched using their individual attributes.

## Setup

The Sentry Metrics functionality has been integrated into your Nuxt application with the following components:

- **`composables/useSentryMetrics.ts`** - Core metrics composable
- **`composables/useMetricsExamples.ts`** - Usage examples and patterns
- **Updated Sentry configuration** - Client and server configs support metrics
- **Test files** - Validation of metrics implementation

## Requirements

- Sentry JavaScript SDK version `10.25.0` or above ✅ (Your project uses compatible versions)
- Valid Sentry DSN configured
- Metrics enabled (default: enabled, can be controlled via `SENTRY_ENABLE_METRICS` env var)

## Basic Usage

### Using the Metrics Composable

```typescript
// In any Vue component or composable
const { count, gauge, distribution, set } = useSentryMetrics();
```

### Counter Metrics

Use counters to track incrementing values like button clicks, function calls, or events:

```typescript
// Basic counter
count('button_click', 1);

// Counter with attributes
count('purchase', 1, {
  attributes: {
    product: 'premium_plan',
    currency: 'USD',
    amount: 29.99,
  },
});

// Convenience increment/decrement
increment('active_users');
decrement('available_slots');
```

### Gauge Metrics

Use gauges for values that can go up and down, like memory usage or queue depth:

```typescript
// Memory usage
gauge('memory_usage', 85.5, {
  unit: 'percentage',
  attributes: { component: 'frontend' },
});

// Queue size
gauge('queue_depth', 42, {
  attributes: { queue_type: 'processing' },
});
```

### Distribution Metrics

Use distributions to track the distribution of values, such as response times:

```typescript
// API response time
distribution('api_response_time', 245.7, {
  unit: 'millisecond',
  attributes: { endpoint: '/api/users' },
});

// File upload size
distribution('upload_size', 2048576, {
  unit: 'byte',
  attributes: { file_type: 'image' },
});
```

### Set Metrics

Use sets to track unique occurrences, like unique users or IP addresses:

```typescript
// Track unique daily visitors
set('unique_visitors', userId, {
  attributes: {
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    source: 'web',
  },
});
```

## Convenience Methods

The composable provides several helper methods for common tracking scenarios:

### Page Views

```typescript
const metrics = useSentryMetrics();

// Track current page
metrics.trackPageView();

// Track specific page with attributes
metrics.trackPageView('/dashboard', {
  referrer: 'google.com',
  user_type: 'premium',
});
```

### User Interactions

```typescript
// Track button clicks
metrics.trackInteraction('click', 'submit-button', {
  form: 'contact',
  page: '/contact',
});

// Track form submissions
metrics.trackInteraction('submit', 'contact-form', {
  fields_filled: 5,
  validation_errors: 0,
});
```

### API Calls

```typescript
// Track successful API call
metrics.trackApiCall('/api/users', 'GET', 200, 125.5, {
  cached: false,
  user_id: '123',
});

// Track failed API call
metrics.trackApiCall('/api/payment', 'POST', 500, 2340.8, {
  error_type: 'server_error',
  retry_count: 2,
});
```

### Error Tracking

```typescript
// Track application errors
metrics.trackError('ValidationError', {
  component: 'UserForm',
  field: 'email',
  severity: 'medium',
});

// Track custom error types
metrics.trackError('NetworkTimeout', {
  endpoint: '/api/external',
  timeout_ms: 30000,
});
```

### Performance Metrics

```typescript
// Track custom performance metrics
metrics.trackPerformance('render_time', 45.2, 'millisecond', {
  component: 'DataTable',
  rows: 1000,
});

// Track memory usage
metrics.trackPerformance('heap_used', 52428800, 'byte', {
  component: 'ImageProcessor',
});
```

## Advanced Usage

### Timing Operations

The `timing` utility automatically measures operation duration:

```typescript
const result = await metrics.timing(
  'database_query',
  async () => {
    return await fetchUserData(userId);
  },
  {
    attributes: {
      table: 'users',
      query_type: 'select',
    },
  }
);
```

### Batch Metrics

For high-frequency events, consider batching to reduce overhead:

```typescript
const batchMetrics = {
  buttonClicks: new Map(),

  addButtonClick(buttonName) {
    const current = this.buttonClicks.get(buttonName) || 0;
    this.buttonClicks.set(buttonName, current + 1);
  },

  flush() {
    this.buttonClicks.forEach((count, buttonName) => {
      metrics.count('button_click_batch', count, {
        attributes: { button: buttonName },
      });
    });
    this.buttonClicks.clear();
  },
};

// Use throughout your app
batchMetrics.addButtonClick('save-button');

// Flush periodically (e.g., every 30 seconds)
setInterval(() => batchMetrics.flush(), 30000);
```

## Configuration Options

### Environment Variables

```bash
# Enable/disable metrics (default: true)
SENTRY_ENABLE_METRICS=true

# Existing Sentry configuration
SENTRY_DSN=your-dsn-here
SENTRY_ENVIRONMENT=production
```

### Metrics Filtering

Metrics can be filtered before sending to Sentry. While the current implementation doesn't expose the `beforeSendMetric` callback directly in the composable, you can implement filtering logic in your metric calls:

```typescript
// Example: Only send metrics in production
const shouldSendMetrics = process.env.NODE_ENV === 'production';

if (shouldSendMetrics) {
  metrics.count('production_event', 1, {
    attributes: { environment: 'prod' },
  });
}

// Example: Filter sensitive data
const safeAttributes = {
  ...attributes,
  // Remove sensitive fields
  password: undefined,
  api_key: undefined,
};

metrics.count('user_action', 1, { attributes: safeAttributes });
```

## Best Practices

### Naming Conventions

- Use lowercase with underscores: `button_click`, `api_response_time`
- Be descriptive but concise: `user_login_success` vs `login_ok`
- Group related metrics: `api_request_total`, `api_request_duration`

### Attributes

- Use consistent attribute names across metrics
- Include contextual information: user type, page, component
- Avoid sensitive data in attributes
- Use appropriate data types: strings for categories, numbers for quantities

### Units

Specify units for gauge and distribution metrics:

- Time: `millisecond`, `second`
- Size: `byte`, `kilobyte`, `megabyte`
- Rate: `per_second`, `percentage`
- Custom units as needed

### Performance Considerations

- Don't send metrics in tight loops without batching
- Use appropriate metric types for your use case
- Consider sampling for very high-frequency metrics
- Monitor your Sentry usage to stay within limits

## Integration Examples

### Vue Component Integration

```vue
<template>
  <button @click="handleClick">Click me</button>
</template>

<script setup>
const { trackInteraction } = useSentryMetrics();

const handleClick = () => {
  trackInteraction('click', 'analytics-button', {
    component: 'AnalyticsDashboard',
    action: 'export_data',
  });

  // Your button logic here
  exportData();
};
</script>
```

### API Route Monitoring

```typescript
// In a Nuxt API route or server middleware
export default defineEventHandler(async (event) => {
  const { trackApiCall, timing } = useSentryMetrics();
  const startTime = Date.now();

  try {
    const result = await timing(
      'api_processing',
      async () => {
        // Your API logic here
        return await processRequest(event);
      },
      {
        attributes: {
          endpoint: event.path,
          method: event.method,
        },
      }
    );

    trackApiCall(event.path, event.method, 200, Date.now() - startTime, {
      success: true,
    });

    return result;
  } catch (error) {
    trackApiCall(event.path, event.method, 500, Date.now() - startTime, {
      success: false,
      error_type: error.name,
    });

    throw error;
  }
});
```

### Business Logic Monitoring

```typescript
// In your business logic composables
export const usePredictionService = () => {
  const { trackBusinessMetrics, timing } = useSentryMetrics();

  const makePrediction = async (data: PredictionInput) => {
    trackBusinessMetrics.predictionRequested(data.modelType);

    try {
      const result = await timing(
        'prediction_processing',
        async () => {
          return await runPrediction(data);
        },
        {
          attributes: {
            model_type: data.modelType,
            input_size: JSON.stringify(data).length,
          },
        }
      );

      trackBusinessMetrics.predictionCompleted(data.modelType, result.accuracy);

      return result;
    } catch (error) {
      trackBusinessMetrics.predictionCompleted(data.modelType, undefined);
      throw error;
    }
  };

  return { makePrediction };
};
```

## Testing

Run the test suite to verify metrics functionality:

```bash
# Run the simple test
node test_sentry_metrics_simple.cjs
```

This will test all core metrics functionality with mocked Sentry methods.

## Troubleshooting

### Metrics Not Appearing in Sentry

1. Verify Sentry DSN is configured correctly
2. Check that `SENTRY_ENABLE_METRICS` is not set to `false`
3. Ensure you're in an environment where Sentry is initialized
4. Check browser/server console for errors

### Performance Issues

1. Reduce metric frequency for high-traffic features
2. Use batching for repeated similar metrics
3. Implement sampling for development/testing environments

### TypeScript Errors

Make sure you're importing the composable correctly:

```typescript
import { useSentryMetrics } from '~/composables/useSentryMetrics';
```

## Migration from Other Monitoring Solutions

If migrating from other monitoring tools:

1. **Google Analytics**: Replace `gtag` calls with appropriate metrics calls
2. **Custom logging**: Replace console.log statements with structured metrics
3. **Performance monitoring**: Use the `timing` utility for operation measurements

## Support

For Sentry Metrics support:

- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nuxt/metrics/)
- [GitHub Discussions](https://github.com/getsentry/sentry-javascript/discussions/18055)

## Summary

Sentry Metrics provides powerful monitoring capabilities for your Nuxt application. Use the provided composables and examples to instrument your application effectively, following the best practices outlined above for optimal performance and insights.
