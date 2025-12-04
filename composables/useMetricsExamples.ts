/**
 * Sentry Metrics Usage Examples for Nuxt
 *
 * This file demonstrates how to use the Sentry metrics composable
 * in various scenarios within a Nuxt application.
 */

import { useSentryMetrics } from './useSentryMetrics';

export const useMetricsExamples = () => {
  const metrics = useSentryMetrics();

  /**
   * Example: Track button clicks and user interactions
   */
  const trackButtonClick = (buttonName: string, page?: string) => {
    metrics.count('button_click', 1, {
      attributes: {
        button: buttonName,
        page: page || 'unknown',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      },
    });

    // Alternative using the convenience method
    metrics.trackInteraction('click', buttonName, {
      page: page || 'unknown',
    });
  };

  /**
   * Example: Track API calls with response times
   */
  const trackApiRequest = async <T = unknown>(
    endpoint: string,
    method: string,
    requestFn: () => Promise<{ status: number; data?: T }>
  ) => {
    const startTime = performance.now();

    try {
      const response = await requestFn();
      const duration = performance.now() - startTime;

      metrics.trackApiCall(endpoint, method, response.status, duration, {
        success: true,
        response_size: JSON.stringify(response.data || {}).length,
      });

      return response;
    } catch (error: unknown) {
      const duration = performance.now() - startTime;
      const errorObj = error as { response?: { status?: number }; name?: string; message?: string };

      metrics.trackApiCall(endpoint, method, errorObj.response?.status || 0, duration, {
        success: false,
        error_type: errorObj.name || 'Unknown',
        error_message: errorObj.message?.substring(0, 100), // Limit error message length
      });

      throw error;
    }
  };

  /**
   * Example: Track page views
   */
  const trackPageView = (
    pageName?: string,
    additionalAttributes?: Record<string, string | number | boolean>
  ) => {
    metrics.trackPageView(pageName, {
      timestamp: new Date().toISOString(),
      ...additionalAttributes,
    });
  };

  /**
   * Example: Track performance metrics
   */
  const trackPerformanceMetrics = () => {
    if (typeof window !== 'undefined') {
      // Memory usage (if available) - Chrome-specific API
      const perfMemory = (
        performance as {
          memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
        }
      ).memory;
      if (perfMemory) {
        metrics.trackPerformance('memory_used', perfMemory.usedJSHeapSize, 'byte', {
          total_heap: perfMemory.totalJSHeapSize,
          heap_limit: perfMemory.jsHeapSizeLimit,
        });
      }

      // Navigation timing
      if (performance.timing) {
        const navigationTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        metrics.distribution('page_load_time', navigationTime, {
          unit: 'millisecond',
          attributes: {
            navigation_type: performance.navigation?.type?.toString(),
          },
        });
      }
    }
  };

  /**
   * Example: Track errors with context
   */
  const trackApplicationError = (
    error: Error,
    context?: Record<string, string | number | boolean>
  ) => {
    metrics.trackError(error.name, {
      message: error.message?.substring(0, 200), // Limit message length
      stack_trace: error.stack?.substring(0, 500), // Limit stack trace
      ...context,
    });
  };

  /**
   * Example: Track user engagement metrics
   */
  const trackUserEngagement = {
    sessionStart: () => metrics.increment('session_start'),
    featureUsed: (featureName: string) =>
      metrics.count('feature_usage', 1, {
        attributes: { feature: featureName },
      }),
    timeSpent: (page: string, durationSeconds: number) =>
      metrics.distribution('time_spent', durationSeconds, {
        unit: 'second',
        attributes: { page },
      }),
  };

  /**
   * Example: Track business metrics
   */
  const trackBusinessMetrics = {
    predictionRequested: (modelType: string) =>
      metrics.count('prediction_request', 1, {
        attributes: { model: modelType },
      }),
    predictionCompleted: (modelType: string, accuracy?: number) =>
      metrics.count('prediction_completed', 1, {
        attributes: {
          model: modelType,
          accuracy: accuracy?.toString(),
        },
      }),
    dataProcessed: (recordsCount: number, operation: string) =>
      metrics.gauge('data_processing_volume', recordsCount, {
        attributes: { operation },
      }),
  };

  /**
   * Example: Using the timing utility for async operations
   */
  const timeAsyncOperation = async <T>(
    operationName: string,
    operation: () => Promise<T>,
    additionalAttributes?: Record<string, any>
  ): Promise<T> => {
    return metrics.timing(operationName, operation, {
      attributes: additionalAttributes,
    });
  };

  /**
   * Example: Track queue/deque operations (useful for background jobs)
   */
  const trackQueueMetrics = {
    itemAdded: (queueName: string) => {
      metrics.increment(`${queueName}_queue_size`);
      metrics.count('queue_item_added', 1, { attributes: { queue: queueName } });
    },
    itemProcessed: (queueName: string, processingTime?: number) => {
      metrics.decrement(`${queueName}_queue_size`);
      metrics.count('queue_item_processed', 1, { attributes: { queue: queueName } });

      if (processingTime) {
        metrics.distribution('queue_processing_time', processingTime, {
          unit: 'millisecond',
          attributes: { queue: queueName },
        });
      }
    },
    queueSize: (queueName: string, size: number) => {
      metrics.gauge(`${queueName}_queue_size`, size);
    },
  };

  /**
   * Example: Track unique users (using sets)
   */
  const trackUniqueUsers = (userId: string, action: string) => {
    metrics.set(`unique_users_${action}`, userId, {
      attributes: {
        action,
        timestamp: new Date().toISOString().split('T')[0], // Date only for daily uniqueness
      },
    });
  };

  /**
   * Example: Batch metrics for high-frequency events
   * Use this for events that happen very frequently to reduce overhead
   */
  const batchMetrics = {
    buttonClicks: new Map<string, number>(),
    apiCalls: new Map<string, number>(),

    addButtonClick: (buttonName: string) => {
      const current = batchMetrics.buttonClicks.get(buttonName) || 0;
      batchMetrics.buttonClicks.set(buttonName, current + 1);
    },

    addApiCall: (endpoint: string) => {
      const current = batchMetrics.apiCalls.get(endpoint) || 0;
      batchMetrics.apiCalls.set(endpoint, current + 1);
    },

    flush: () => {
      // Send batched button click metrics
      batchMetrics.buttonClicks.forEach((count, buttonName) => {
        metrics.count('button_click_batch', count, {
          attributes: { button: buttonName },
        });
      });
      batchMetrics.buttonClicks.clear();

      // Send batched API call metrics
      batchMetrics.apiCalls.forEach((count, endpoint) => {
        metrics.count('api_call_batch', count, {
          attributes: { endpoint },
        });
      });
      batchMetrics.apiCalls.clear();
    },
  };

  return {
    // Basic tracking
    trackButtonClick,
    trackApiRequest,
    trackPageView,
    trackPerformanceMetrics,
    trackApplicationError,

    // Specialized tracking
    trackUserEngagement,
    trackBusinessMetrics,
    trackQueueMetrics,
    trackUniqueUsers,

    // Utilities
    timeAsyncOperation,
    batchMetrics,
  };
};
