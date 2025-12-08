/**
 * Composable for checking API health status
 */
import { ref, readonly, onMounted, onUnmounted } from 'vue';

export const useApiStatus = () => {
  const status = ref({
    isOnline: false,
    isChecking: false,
    lastChecked: null as number | null,
    error: null as string | null,
    backoffMs: 30000,
  });

  let timer: ReturnType<typeof setTimeout> | null = null;

  const checkApiHealth = async () => {
    status.value.isChecking = true;
    status.value.error = null;

    try {
      // Check Python API health through Nuxt API endpoint
      // Using type assertion to bypass Nuxt route type inference (excessive stack depth issue)
      // This is a known issue with complex route type inference in Nuxt 4 when there are many routes
      const response = await $fetch<{ status: string; error?: string }>('/api/health' as any, {
        method: 'GET',
        timeout: 3000, // 3 second timeout
      });

      if (response?.status === 'healthy') {
        status.value.isOnline = true;
        status.value.error = null;
      } else {
        status.value.isOnline = false;
        status.value.error = response?.error || 'API returned unexpected status';
      }
    } catch (error: unknown) {
      status.value.isOnline = false;
      status.value.error = error instanceof Error ? error.message : 'Cannot connect to API';
    } finally {
      status.value.isChecking = false;
      status.value.lastChecked = Date.now();
    }
  };

  const scheduleNext = () => {
    if (timer) clearTimeout(timer);
    const delay = status.value.isOnline ? 30000 : Math.min(status.value.backoffMs, 10 * 60 * 1000);
    timer = setTimeout(async () => {
      await checkApiHealth();
      // Increase backoff if still offline, reset when online
      if (!status.value.isOnline) {
        status.value.backoffMs = Math.min(status.value.backoffMs * 2, 10 * 60 * 1000);
      } else {
        status.value.backoffMs = 30000;
      }
      scheduleNext();
    }, delay);
  };

  // Auto-check on mount and periodically with exponential backoff when offline
  onMounted(() => {
    // Initial check then schedule
    checkApiHealth().finally(scheduleNext);
  });

  // Cleanup timer on unmount
  onUnmounted(() => {
    if (timer) clearTimeout(timer);
  });

  return {
    status: readonly(status),
    checkApiHealth,
  };
};
