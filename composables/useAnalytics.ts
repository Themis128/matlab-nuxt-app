// Nuxt 4: Use unified analytics composable (auto-imported)
// This file is kept for backward compatibility but should use the new composable
// Migration: Use `useAnalytics()` from `~/app/application/features/analytics/composables/useAnalytics`

// Lazy import function for analytics store (handles cases where store might not be available)
// Using variable to prevent Vite from statically analyzing the import path
const analyticsStorePath = '~/app/application/features/analytics/store/analytics.store';
const getAnalyticsStore = async () => {
  try {
    // Use dynamic import with variable to avoid build-time errors
    const storeModule = await import(/* @vite-ignore */ analyticsStorePath);
    return storeModule.useAnalyticsStore;
  } catch {
    return null;
  }
};

/**
 * Nuxt 4 composable for analytics tracking
 * Supports multiple analytics providers
 */
export const useAnalytics = () => {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return;

    const eventData = {
      name: eventName,
      properties: properties || {},
      timestamp: new Date().toISOString(),
    };

    // Sync with analytics store (async, non-blocking)
    getAnalyticsStore()
      .then((storeFactory) => {
        if (storeFactory) {
          try {
            const analyticsStore = storeFactory();
            analyticsStore.trackEvent(eventName, properties);
          } catch (error) {
            // Store might not be available yet
            console.warn('Analytics store not available:', error);
          }
        }
      })
      .catch(() => {
        // Store import failed - continue without it
      });

    // Google Analytics 4 (gtag)
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }

    // Plausible Analytics
    if (window.plausible) {
      window.plausible(eventName, { props: properties });
    }

    // Custom analytics event
    if (process.client) {
      window.dispatchEvent(
        new CustomEvent('analytics-event', {
          detail: eventData,
        })
      );
    }

    // Console log in development (only if explicitly enabled)
    if (process.dev && process.env.NUXT_PUBLIC_ANALYTICS_DEBUG === 'true') {
      console.log('Analytics Event:', eventData);
    }
  };

  const trackPageView = (path: string, title?: string) => {
    if (typeof window === 'undefined') return;

    // Sync with analytics store (async, non-blocking)
    getAnalyticsStore()
      .then((storeFactory) => {
        if (storeFactory) {
          try {
            const analyticsStore = storeFactory();
            analyticsStore.trackPageView(path, title);
          } catch (error) {
            console.warn('Analytics store not available:', error);
          }
        }
      })
      .catch(() => {
        // Store import failed - continue without it
      });

    // Google Analytics 4
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path,
        page_title: title,
      });
    }

    // Plausible Analytics
    if (window.plausible) {
      window.plausible('pageview', { props: { path, title } });
    }

    trackEvent('page_view', { path, title });
  };

  const trackDatasetAction = (
    action: 'search' | 'filter' | 'export' | 'compare',
    details?: Record<string, any>
  ) => {
    trackEvent('dataset_action', {
      action,
      ...details,
    });
  };

  const trackPrediction = (modelType: string, accuracy?: number) => {
    trackEvent('prediction_made', {
      model_type: modelType,
      accuracy,
    });
  };

  const trackError = (error: Error, context?: Record<string, any>) => {
    trackEvent('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  };

  const initialize = () => {
    // Initialize analytics providers
    if (typeof window !== 'undefined') {
      // Any initialization logic for analytics providers can go here
      console.log('Analytics initialized');
    }
  };

  return {
    initialize,
    trackEvent,
    trackPageView,
    trackDatasetAction,
    trackPrediction,
    trackError,
  };
};

// Extend Window interface for analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
  }
}
