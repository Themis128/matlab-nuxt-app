import { usePerformanceStore } from '~/stores/performanceStore';
import { useSentryStore } from '~/stores/sentryStore';

/**
 * Composable to sync composables with Pinia stores
 * Ensures data flows from composables to stores automatically
 */

/**
 * Initialize store sync for all integrations
 * Call this in app.vue or a plugin to ensure stores are synced
 */
export const useStoreSync = () => {
  if (typeof window === 'undefined') return;

  // Sync performance metrics to store
  const syncPerformanceMetrics = () => {
    try {
      const performanceStore = usePerformanceStore();
      const performance = usePerformance();

      // Listen for performance metric events
      window.addEventListener('performance-metric', ((event: CustomEvent) => {
        const metric = event.detail;
        if (metric && metric.name && typeof metric.value === 'number') {
          performanceStore.trackMetric(
            metric.name,
            metric.value,
            metric.unit || 'ms',
            metric.attributes
          );
        }
      }) as EventListener);

      // Periodically sync Web Vitals
      const syncInterval = setInterval(() => {
        const vitals = performance.getWebVitals();
        if (vitals) {
          performanceStore.updateWebVitals(vitals);
        }

        const pageLoad = performance.measurePageLoad();
        if (pageLoad) {
          performanceStore.updatePageLoad(pageLoad);
        }
      }, 5000); // Sync every 5 seconds

      // Cleanup on unload
      window.addEventListener('beforeunload', () => {
        clearInterval(syncInterval);
      });

      return syncInterval;
    } catch (error) {
      console.warn('Failed to sync performance metrics:', error);
      return null;
    }
  };

  // Sync Sentry errors to store
  const syncSentryErrors = () => {
    try {
      const sentryStore = useSentryStore();

      // Listen for Sentry error events (if Sentry dispatches custom events)
      window.addEventListener('sentry-error', ((event: CustomEvent) => {
        const error = event.detail;
        if (error) {
          sentryStore.addError({
            message: error.message || 'Unknown error',
            type: error.type || 'error',
            level: error.level || 'error',
            context: error.context,
          });
        }
      }) as EventListener);
    } catch (error) {
      console.warn('Failed to sync Sentry errors:', error);
    }
  };

  // Initialize all syncs
  const initialize = () => {
    syncPerformanceMetrics();
    syncSentryErrors();
  };

  return {
    initialize,
    syncPerformanceMetrics,
    syncSentryErrors,
  };
};
