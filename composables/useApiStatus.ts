/**
 * Composable for checking API health status
 */

export const useApiStatus = () => {
  const status = ref({
    isOnline: false,
    isChecking: false,
    lastChecked: null as number | null,
    error: null as string | null,
  })

  const checkApiHealth = async () => {
    status.value.isChecking = true
    status.value.error = null

    try {
      // Check Python API health through Nuxt API endpoint
      const response = await $fetch<{ status: string; error?: string }>('/api/health', {
        method: 'GET',
        timeout: 3000, // 3 second timeout
      })

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

  // Auto-check on mount and periodically
  onMounted(() => {
    checkApiHealth()
    // Check every 30 seconds
    const interval = setInterval(checkApiHealth, 30000)

    onUnmounted(() => {
      clearInterval(interval)
    })
  })

  return {
    status: readonly(status),
    checkApiHealth,
  }
}
