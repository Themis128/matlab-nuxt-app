/**
 * Composable for checking API health status
 */

import { ref, readonly, onMounted, onUnmounted } from 'vue'

export const useApiStatus = () => {
  const status = ref({
    isOnline: false,
    isChecking: false,
    lastChecked: null as number | null,
    error: null as string | null,
    backoffMs: 30000,
  })

  const checkApiHealth = async () => {
    status.value.isChecking = true
    status.value.error = null

    try {
      // Check Python API health through Nuxt API endpoint
      const response = (await $fetch('/api/health', {
        method: 'GET',
        timeout: 3000, // 3 second timeout
      })) as { status: string; error?: string }

      if (response?.status === 'healthy') {
        status.value.isOnline = true
        status.value.error = null
      } else {
        status.value.isOnline = false
        status.value.error = response?.error || 'API returned unexpected status'
      }
    } catch (error: unknown) {
      status.value.isOnline = false
      status.value.error = error instanceof Error ? error.message : 'Cannot connect to API'
    } finally {
      status.value.isChecking = false
      status.value.lastChecked = Date.now()
    }
  }

  // Auto-check on mount and periodically with exponential backoff when offline
  onMounted(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    const scheduleNext = () => {
      if (timer) clearTimeout(timer)
      const delay = status.value.isOnline ? 30000 : Math.min(status.value.backoffMs, 10 * 60 * 1000)
      timer = setTimeout(async () => {
        await checkApiHealth()
        // Increase backoff if still offline, reset when online
        if (!status.value.isOnline) {
          status.value.backoffMs = Math.min(status.value.backoffMs * 2, 10 * 60 * 1000)
        } else {
          status.value.backoffMs = 30000
        }
        scheduleNext()
      }, delay)
    }

    // Initial check then schedule
    checkApiHealth().finally(scheduleNext)

    onUnmounted(() => {
      if (timer) clearTimeout(timer)
    })
  })

  return {
    status: readonly(status),
    checkApiHealth,
  }
}
