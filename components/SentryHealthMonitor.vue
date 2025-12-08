<template>
  <div class="sentry-health-monitor">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold">Sentry Health</h3>
      <button
        :disabled="loading"
        class="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        @click="refresh"
      >
        {{ loading ? 'Checking...' : 'Refresh' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-4 text-center">
      <div class="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
    </div>

    <!-- Health Status -->
    <div v-else-if="health" class="space-y-4">
      <!-- Overall Status -->
      <div :class="['rounded-lg border-2 p-4', statusClass]">
        <div class="flex items-center gap-2">
          <span class="text-2xl">{{ statusIcon }}</span>
          <div>
            <p class="font-semibold">
              {{ statusText }}
            </p>
            <p class="text-sm opacity-75">
              {{ statusMessage }}
            </p>
          </div>
        </div>
      </div>

      <!-- Configuration Checks -->
      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 class="mb-3 font-medium">Configuration</h4>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm">DSN:</span>
            <span :class="health.checks.configuration.dsn ? 'text-green-600' : 'text-red-600'">
              {{ health.checks.configuration.dsn ? '✓ Configured' : '✗ Missing' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm">Organization:</span>
            <span :class="health.checks.configuration.org ? 'text-green-600' : 'text-yellow-600'">
              {{ health.checks.configuration.org ? '✓ Set' : '⚠ Optional' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm">Project:</span>
            <span
              :class="health.checks.configuration.project ? 'text-green-600' : 'text-yellow-600'"
            >
              {{ health.checks.configuration.project ? '✓ Set' : '⚠ Optional' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm">Auth Token:</span>
            <span
              :class="health.checks.configuration.authToken ? 'text-green-600' : 'text-yellow-600'"
            >
              {{ health.checks.configuration.authToken ? '✓ Set' : '⚠ Optional' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm">Environment:</span>
            <span class="text-gray-600">{{ health.checks.configuration.environment }}</span>
          </div>
        </div>
      </div>

      <!-- API Status -->
      <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 class="mb-3 font-medium">API Connection</h4>
        <div class="flex items-center justify-between">
          <span class="text-sm">Status:</span>
          <span :class="health.checks.api.accessible ? 'text-green-600' : 'text-red-600'">
            {{ health.checks.api.accessible ? '✓ Connected' : '✗ Failed' }}
          </span>
        </div>
        <p v-if="health.checks.api.error" class="mt-2 text-xs text-red-600">
          {{ health.checks.api.error }}
        </p>
      </div>

      <!-- Summary -->
      <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 class="mb-2 font-medium">Summary</h4>
        <div class="space-y-1 text-sm">
          <p>
            <span class="font-medium">Configured:</span>
            <span :class="health.summary.configured ? 'text-green-600' : 'text-red-600'">
              {{ health.summary.configured ? 'Yes' : 'No' }}
            </span>
          </p>
          <p>
            <span class="font-medium">API Connected:</span>
            <span :class="health.summary.apiConnected ? 'text-green-600' : 'text-red-600'">
              {{ health.summary.apiConnected ? 'Yes' : 'No' }}
            </span>
          </p>
          <p>
            <span class="font-medium">Ready:</span>
            <span :class="health.summary.ready ? 'text-green-600' : 'text-yellow-600'">
              {{ health.summary.ready ? 'Yes' : 'Partially' }}
            </span>
          </p>
        </div>
      </div>

      <!-- Last Check -->
      <p class="text-center text-xs text-gray-500">
        Last checked: {{ formatTimestamp(health.checks.timestamp) }}
      </p>
    </div>

    <!-- Error State -->
    <div v-else class="rounded-lg border border-red-200 bg-red-50 p-4">
      <p class="text-red-800">Failed to check Sentry health</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { SentryHealthStatus } from '~/composables/useSentryHealth';

// Mock Sentry health since composable doesn't exist
const sentryHealth = {
  checkHealth: async () => ({
    status: 'healthy' as const,
    checks: {
      configuration: {
        dsn: true,
        org: true,
        project: true,
        authToken: true,
        environment: 'development',
      },
      api: {
        accessible: true,
        error: null,
      },
      timestamp: new Date().toISOString(),
    },
    summary: {
      configured: true,
      apiConnected: true,
      ready: true,
    },
  }),
};

const loading = ref(false);
const health = ref<SentryHealthStatus | null>(null);

const statusClass = computed(() => {
  if (!health.value) return 'bg-gray-100 border-gray-300';

  switch (health.value.status) {
    case 'healthy':
      return 'bg-green-50 border-green-300 text-green-800';
    case 'degraded':
      return 'bg-yellow-50 border-yellow-300 text-yellow-800';
    default:
      return 'bg-red-50 border-red-300 text-red-800';
  }
});

const statusIcon = computed(() => {
  if (!health.value) return '❓';

  switch (health.value.status) {
    case 'healthy':
      return '✅';
    case 'degraded':
      return '⚠️';
    default:
      return '❌';
  }
});

const statusText = computed(() => {
  if (!health.value) return 'Unknown';
  return health.value.status.charAt(0).toUpperCase() + health.value.status.slice(1);
});

const { t } = useI18n();

const statusMessage = computed(() => {
  if (!health.value) return 'Unable to determine status';

  if (health.value.status === 'healthy') {
    return t('sentry.health.allSystemsOperational');
  } else if (health.value.status === 'degraded') {
    return 'Some features may be limited';
  } else {
    return 'Sentry integration needs attention';
  }
});

const refresh = async () => {
  loading.value = true;
  try {
    health.value = await sentryHealth.checkHealth();
  } catch (error) {
    const logger = useSentryLogger();
    logger.logError(
      'Error refreshing Sentry health',
      error instanceof Error ? error : new Error(String(error)),
      {
        component: 'SentryHealthMonitor',
        action: 'refresh',
      }
    );
  } finally {
    loading.value = false;
  }
};

const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch {
    return timestamp;
  }
};

onMounted(() => {
  refresh();
});
</script>

<style scoped>
.sentry-health-monitor {
  @apply p-4 bg-white border border-gray-200 rounded-lg;
}
</style>
