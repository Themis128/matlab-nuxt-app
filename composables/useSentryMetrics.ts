/**
 * Sentry Metrics Composable for Nuxt
 *
 * This composable provides a type-safe interface for Sentry metrics functionality.
 * Supports counters, gauges, distributions, and sets with attribute support.
 */

export interface MetricAttributes {
  [key: string]: string | number | boolean | undefined;
}

export interface MetricOptions {
  attributes?: MetricAttributes;
  unit?: string;
}

export interface MetricFilterOptions {
  enableMetrics?: boolean;
  beforeSendMetric?: (metric: any) => any | null;
}

/**
 * Composable for Sentry metrics functionality
 */
export const useSentryMetrics = () => {
  // Check if Sentry is available
  const isSentryAvailable = () => {
    if (typeof window === 'undefined') {
      // Server-side check
      return typeof globalThis !== 'undefined' && 'Sentry' in globalThis;
    }
    // Client-side check
    return typeof window !== 'undefined' && 'Sentry' in window;
  };

  /**
   * Track an incrementing value (counter)
   * Use for counting events like button clicks, function calls, etc.
   */
  const count = (name: string, value: number = 1, options?: MetricOptions) => {
    if (!isSentryAvailable()) return;

    try {
      const Sentry = (globalThis as any).Sentry || (window as any).Sentry;
      Sentry.metrics.count(name, value, options);
    } catch (error) {
      console.warn('[Sentry Metrics] Failed to send counter metric:', error);
    }
  };

  /**
   * Track a value that can go up and down (gauge)
   * Use for values like memory usage, queue depth, active connections, etc.
   */
  const gauge = (name: string, value: number, options?: MetricOptions) => {
    if (!isSentryAvailable()) return;

    try {
      const Sentry = (globalThis as any).Sentry || (window as any).Sentry;
      Sentry.metrics.gauge(name, value, options);
    } catch (error) {
      console.warn('[Sentry Metrics] Failed to send gauge metric:', error);
    }
  };

  /**
   * Track the distribution of a value (distribution)
   * Use for timing data, response sizes, etc.
   */
  const distribution = (name: string, value: number, options?: MetricOptions) => {
    if (!isSentryAvailable()) return;

    try {
      const Sentry = (globalThis as any).Sentry || (window as any).Sentry;
      Sentry.metrics.distribution(name, value, options);
    } catch (error) {
      console.warn('[Sentry Metrics] Failed to send distribution metric:', error);
    }
  };

  /**
   * Track unique occurrences (set)
   * Use for counting unique users, IP addresses, etc.
   */
  const set = (name: string, value: string | number, options?: MetricOptions) => {
    if (!isSentryAvailable()) return;

    try {
      const Sentry = (globalThis as any).Sentry || (window as any).Sentry;
      Sentry.metrics.set(name, value, options);
    } catch (error) {
      console.warn('[Sentry Metrics] Failed to send set metric:', error);
    }
  };

  /**
   * Timing utility for measuring operation duration
   */
  const timing = async <T>(
    name: string,
    operation: () => Promise<T>,
    options?: MetricOptions
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      distribution(`${name}_duration`, duration, {
        ...options,
        unit: 'millisecond',
      });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      distribution(`${name}_error_duration`, duration, {
        ...options,
        unit: 'millisecond',
        attributes: {
          ...options?.attributes,
          error: true,
          error_type: error instanceof Error ? error.name : 'Unknown',
        },
      });
      throw error;
    }
  };

  /**
   * Increment a counter by name
   * Convenience method for simple counting
   */
  const increment = (name: string, options?: MetricOptions) => {
    count(name, 1, options);
  };

  /**
   * Decrement a counter by name
   * Convenience method for simple counting
   */
  const decrement = (name: string, options?: MetricOptions) => {
    count(name, -1, options);
  };

  /**
   * Track page views
   */
  const trackPageView = (pageName?: string, attributes?: MetricAttributes) => {
    const page = pageName || (typeof window !== 'undefined' ? window.location.pathname : 'unknown');
    count('page_view', 1, {
      attributes: {
        page,
        ...attributes,
      },
    });
  };

  /**
   * Track user interactions
   */
  const trackInteraction = (
    interactionType: string,
    element?: string,
    attributes?: MetricAttributes
  ) => {
    count('user_interaction', 1, {
      attributes: {
        type: interactionType,
        element: element || 'unknown',
        ...attributes,
      },
    });
  };

  /**
   * Track API calls
   */
  const trackApiCall = (
    endpoint: string,
    method: string = 'GET',
    statusCode?: number,
    duration?: number,
    attributes?: MetricAttributes
  ) => {
    count('api_call', 1, {
      attributes: {
        endpoint,
        method: method.toUpperCase(),
        status_code: statusCode?.toString(),
        ...attributes,
      },
    });

    if (duration !== undefined) {
      distribution('api_response_time', duration, {
        unit: 'millisecond',
        attributes: {
          endpoint,
          method: method.toUpperCase(),
          ...attributes,
        },
      });
    }
  };

  /**
   * Track errors with metrics
   */
  const trackError = (errorType: string, attributes?: MetricAttributes) => {
    count('error', 1, {
      attributes: {
        type: errorType,
        ...attributes,
      },
    });
  };

  /**
   * Track performance metrics
   */
  const trackPerformance = (
    metricName: string,
    value: number,
    unit?: string,
    attributes?: MetricAttributes
  ) => {
    gauge(`performance_${metricName}`, value, {
      unit: unit || 'none',
      attributes,
    });
  };

  return {
    // Core metrics
    count,
    gauge,
    distribution,
    set,

    // Utilities
    timing,
    increment,
    decrement,

    // Tracking helpers
    trackPageView,
    trackInteraction,
    trackApiCall,
    trackError,
    trackPerformance,

    // Status
    isSentryAvailable,
  };
};
