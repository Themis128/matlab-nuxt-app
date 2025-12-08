import { defineNuxtPlugin } from 'nuxt/app';
// Nuxt 4: Use unified composables (auto-imported)
// Following Nuxt 4 best practices with feature-based composables
import { usePerformanceStore } from '../stores/performanceStore';
import { useSentryStore } from '../stores/sentryStore';
import { useChromeDevToolsStore } from '../stores/chromeDevToolsStore';
import { useStoreSync } from '../composables/useStoreSync';
// Import feature-based composables manually since they're not auto-imported
import { useApi } from '../infrastructure/api/composables/useApi';
import { usePredictions } from '../application/features/predictions/composables/usePredictions';
import { useUI } from '../application/features/ui/composables/useUI';

/**
 * Plugin to initialize stores and composables after Pinia is fully initialized by @pinia/nuxt
 * This plugin handles initialization logic following Nuxt 4 best practices
 * Uses unified composables instead of direct store access
 */
export default defineNuxtPlugin({
  name: 'pinia-init',
  enforce: 'post', // Run after other plugins (including @pinia/nuxt)

  setup() {
    // Only run certain initializations on client-side
    if (import.meta.client) {
      // Nuxt 4: Use unified composables (auto-imported)
      // Initialize API and start health checks
      const { startPeriodicHealthCheck } = useApi();
      const intervalId = startPeriodicHealthCheck();

      // Initialize predictions (loads history)
      const { initialize: initializePredictions } = usePredictions();
      initializePredictions();

      // Initialize analytics
      const { initialize: initializeAnalytics } = useAnalytics();
      initializeAnalytics();

      // Initialize UI (locale, preferences)
      const { initializeLocale } = useUI();
      initializeLocale();

      // Initialize performance store
      const performanceStore = usePerformanceStore();
      performanceStore.startTracking();

      // Initialize Sentry store
      const sentryStore = useSentryStore();
      const config = useRuntimeConfig();
      // Check for Sentry config (may not be in type definition)
      const sentryConfig = (config.public as any)?.sentry;
      if (sentryConfig?.dsn) {
        sentryStore.initialize(sentryConfig.dsn, {
          environment: process.env.NODE_ENV || 'development',
          release: sentryConfig.release,
        });
      } else {
        sentryStore.initialize();
      }

      // Initialize Chrome DevTools store
      const chromeDevToolsStore = useChromeDevToolsStore();
      chromeDevToolsStore.initialize('http://127.0.0.1:9222', 9222);

      // Initialize store sync for automatic data flow between composables and stores
      const storeSync = useStoreSync();
      if (storeSync) {
        storeSync.initialize();
      }

      // Clean up when page unloads
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          const { stopPeriodicHealthCheck } = useApi();
          if (intervalId) {
            stopPeriodicHealthCheck(intervalId);
          }
          // Stop performance tracking
          performanceStore.stopTracking();
        });
      }
    }

    // Return empty object (no exposed functionality)
    return {};
  },
});
