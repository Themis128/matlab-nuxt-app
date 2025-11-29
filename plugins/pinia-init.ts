import { defineNuxtPlugin } from 'nuxt/app'
import { useApiStore } from '../stores/apiStore'
import { usePredictionHistoryStore } from '../stores/predictionHistoryStore'

/**
 * Plugin to initialize Pinia stores
 * This plugin runs after Pinia is fully initialized
 */
export default defineNuxtPlugin({
  name: 'pinia-init',
  enforce: 'post', // Run after core plugins (including Pinia)

  setup(nuxtApp) {
    // Only run certain initializations on client-side
    if (process.client) {
      // Initialize stores when app is mounted
      nuxtApp.hook('app:mounted', () => {
        // Initialize API store and start health checks
        const apiStore = useApiStore()
        const intervalId = apiStore.startPeriodicHealthCheck()

        // Load prediction history from localStorage
        const predictionHistoryStore = usePredictionHistoryStore()
        predictionHistoryStore.loadHistory()

        // Clean up when page unloads
        if (typeof window !== 'undefined') {
          window.addEventListener('beforeunload', () => {
            if (intervalId) {
              apiStore.stopPeriodicHealthCheck(intervalId)
            }
          })
        }
      })
    }

    // Return empty object (no exposed functionality)
    return {}
  },
})
