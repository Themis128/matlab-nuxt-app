import { defineStore } from 'pinia'

/**
 * Enhanced API status interface with more detailed information
 */
export interface ApiStatus {
  // Core status
  isOnline: boolean
  isChecking: boolean
  lastChecked: number | null

  // Error handling
  error: string | null
  errorType: 'network' | 'timeout' | 'server' | 'validation' | null

  // Connection details
  responseTime: number | null
  consecutiveFailures: number
  lastSuccessAt: number | null
  lastFailureAt: number | null

  // Advanced features
  retryCount: number
  isRetrying: boolean
  nextRetryAt: number | null
}

/**
 * API health check response
 */
export interface ApiHealthResponse {
  status: 'healthy' | 'unhealthy'
  message?: string
  timestamp?: string
  version?: string
  uptime?: number
}

/**
 * Enhanced Pinia store for API health management
 */
export const useApiStore = defineStore('api', {
  state: (): ApiStatus => ({
    // Core status
    isOnline: false,
    isChecking: false,
    lastChecked: null,

    // Error handling
    error: null,
    errorType: null,

    // Connection details
    responseTime: null,
    consecutiveFailures: 0,
    lastSuccessAt: null,
    lastFailureAt: null,

    // Advanced features
    retryCount: 0,
    isRetrying: false,
    nextRetryAt: null,
  }),

  getters: {
    /**
     * Get formatted last checked time
     */
    lastCheckedFormatted: state => {
      if (!state.lastChecked) return 'Never'
      return new Date(state.lastChecked).toLocaleTimeString()
    },

    /**
     * Get time since last successful check
     */
    timeSinceLastSuccess: state => {
      if (!state.lastSuccessAt) return null
      return Date.now() - state.lastSuccessAt
    },

    /**
     * Check if API is in a failure state
     */
    isInFailureState: state => {
      return state.consecutiveFailures >= 3
    },

    /**
     * Get connection quality based on response time
     */
    connectionQuality: state => {
      if (!state.responseTime) return 'unknown'
      if (state.responseTime < 500) return 'excellent'
      if (state.responseTime < 1000) return 'good'
      if (state.responseTime < 2000) return 'fair'
      return 'poor'
    },

    /**
     * Get status summary for UI display
     */
    statusSummary: state => {
      if (state.isOnline) {
        return {
          status: 'online',
          message: 'API is online and responding',
          color: 'green',
          icon: 'i-heroicons-check-circle',
        }
      }

      if (state.isChecking) {
        return {
          status: 'checking',
          message: 'Checking API status...',
          color: 'blue',
          icon: 'i-heroicons-arrow-path',
        }
      }

      if (state.error) {
        return {
          status: 'error',
          message: state.error,
          color: 'red',
          icon: 'i-heroicons-exclamation-triangle',
        }
      }

      return {
        status: 'offline',
        message: 'API is offline',
        color: 'gray',
        icon: 'i-heroicons-x-circle',
      }
    },
  },

  actions: {
    /**
     * Enhanced API health check with detailed error handling
     */
    async checkApiHealth() {
      const startTime = Date.now()
      this.isChecking = true
      this.error = null
      this.errorType = null

      try {
        // Check Python API health through Nuxt API endpoint
        const response = await $fetch<ApiHealthResponse>('/api/health', {
          method: 'GET',
          timeout: 5000, // 5 second timeout
          retry: false,
        })

        const responseTime = Date.now() - startTime
        this.responseTime = responseTime

        if (response?.status === 'healthy') {
          this.isOnline = true
          this.error = null
          this.errorType = null
          this.consecutiveFailures = 0
          this.lastSuccessAt = Date.now()
          this.lastFailureAt = null
          this.retryCount = 0
          this.isRetrying = false
          this.nextRetryAt = null
        } else {
          throw new Error(response?.message || 'API returned unhealthy status')
        }
      } catch (error: unknown) {
        this.isOnline = false
        this.consecutiveFailures++
        this.lastFailureAt = Date.now()

        // Categorize error type
        if (error instanceof Error) {
          if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
            this.errorType = 'timeout'
            this.error = 'Connection timeout - API may be slow to respond'
          } else if (error.message.includes('fetch') || error.message.includes('network')) {
            this.errorType = 'network'
            this.error = 'Network error - cannot reach API server'
          } else if (error.message.includes('500') || error.message.includes('server')) {
            this.errorType = 'server'
            this.error = 'Server error - API is experiencing issues'
          } else {
            this.errorType = 'validation'
            this.error = error.message
          }
        } else {
          this.errorType = 'server'
          this.error = 'Unknown error occurred while checking API status'
        }

        // Implement exponential backoff for retries
        if (this.consecutiveFailures >= 3 && !this.isRetrying) {
          this.scheduleRetry()
        }
      } finally {
        this.isChecking = false
        this.lastChecked = Date.now()
      }
    },

    /**
     * Schedule a retry with exponential backoff
     */
    scheduleRetry() {
      if (this.isRetrying) return

      const baseDelay = 5000 // 5 seconds
      const maxDelay = 60000 // 1 minute
      const exponentialDelay = Math.min(baseDelay * Math.pow(2, this.retryCount), maxDelay)

      this.isRetrying = true
      this.nextRetryAt = Date.now() + exponentialDelay

      setTimeout(() => {
        this.retryCount++
        this.isRetrying = false
        this.nextRetryAt = null
        this.checkApiHealth()
      }, exponentialDelay)
    },

    /**
     * Manual refresh of API status
     */
    async refreshStatus() {
      await this.checkApiHealth()
    },

    /**
     * Reset error state and retry immediately
     */
    async resetAndRetry() {
      this.error = null
      this.errorType = null
      this.consecutiveFailures = 0
      this.retryCount = 0
      this.isRetrying = false
      this.nextRetryAt = null
      await this.checkApiHealth()
    },

    /**
     * Start periodic health checks with improved error handling
     */
    startPeriodicHealthCheck() {
      // Initial check
      this.checkApiHealth()

      // Set up periodic checks
      const interval = setInterval(() => {
        // Skip if currently retrying to avoid overlapping requests
        if (!this.isRetrying) {
          this.checkApiHealth()
        }
      }, 30000) // Check every 30 seconds

      return interval
    },

    /**
     * Stop periodic health checks
     */
    stopPeriodicHealthCheck(interval: ReturnType<typeof setInterval>) {
      clearInterval(interval)
    },

    /**
     * Force offline status (useful for testing)
     */
    forceOffline() {
      this.isOnline = false
      this.error = 'Manually set to offline'
      this.errorType = 'server'
    },

    /**
     * Clear all errors and reset state
     */
    clearErrors() {
      this.error = null
      this.errorType = null
      this.consecutiveFailures = 0
      this.retryCount = 0
      this.isRetrying = false
      this.nextRetryAt = null
    },
  },
})
