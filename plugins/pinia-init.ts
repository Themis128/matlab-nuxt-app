import { defineNuxtPlugin } from 'nuxt/app';
import { onMounted } from 'vue';
import { useApiStore } from '../stores/apiStore';
import { usePredictionHistoryStore } from '../stores/predictionHistoryStore';

/**
 * Plugin to initialize Pinia stores after Pinia is fully initialized by @pinia/nuxt
 * This plugin handles store initialization logic without creating duplicate Pinia instances
 */
export default defineNuxtPlugin({
  name: 'pinia-init',
  enforce: 'post', // Run after other plugins (including @pinia/nuxt)

  setup() {
    // Only run certain initializations on client-side
    if (process.client) {
      // Initialize stores when app is mounted
      onMounted(() => {
        // Initialize API store and start health checks
        const apiStore = useApiStore();
        const intervalId = apiStore.startPeriodicHealthCheck();

        // Load prediction history from localStorage
        const predictionHistoryStore = usePredictionHistoryStore();
        predictionHistoryStore.loadHistory();

        // Clean up when page unloads
        if (typeof window !== 'undefined') {
          window.addEventListener('beforeunload', () => {
            if (intervalId) {
              apiStore.stopPeriodicHealthCheck(intervalId);
            }
          });
        }
      });
    }

    // Return empty object (no exposed functionality)
    return {};
  },
});
