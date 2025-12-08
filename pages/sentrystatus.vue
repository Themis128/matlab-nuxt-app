<template>
  <DPageLayout>
    <div class="container mx-auto max-w-4xl p-8">
      <DPageHeader
        title="Sentry Status"
        description="Monitor your Sentry integration health and configuration status"
        icon="heroicons:heart"
        icon-bg="error"
      />

      <!-- Loading State -->
      <div v-if="pending" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <!-- Error State -->
      <DAlert
        v-else-if="error"
        variant="error"
        title="Failed to Check Status"
        :message="error.message || 'Unable to connect to Sentry API'"
      />

      <!-- Status Display -->
      <div v-else-if="data" class="space-y-6">
        <!-- Overall Status -->
        <div
          :class="[
            'rounded-lg border-2 p-6',
            data.status === 'healthy'
              ? 'border-green-200 bg-green-50'
              : 'border-yellow-200 bg-yellow-50',
          ]"
        >
          <div class="flex items-center">
            <span class="mr-4 text-3xl">
              {{ data.status === 'healthy' ? '✅' : '⚠️' }}
            </span>
            <div>
              <h2
                class="text-2xl font-bold"
                :class="[data.status === 'healthy' ? 'text-green-800' : 'text-yellow-800']"
              >
                {{ data.status === 'healthy' ? 'Sentry is Healthy' : 'Sentry has Issues' }}
              </h2>
              <p
                :class="['mt-1', data.status === 'healthy' ? 'text-green-600' : 'text-yellow-600']"
              >
                {{
                  data.summary.ready ? 'All systems operational' : 'Some components need attention'
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Configuration Status -->
        <div class="rounded-lg border border-gray-200 bg-white p-6">
          <h3 class="mb-4 text-lg font-semibold text-gray-900">Configuration</h3>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="flex items-center justify-between rounded bg-gray-50 p-3">
              <span class="font-medium">DSN</span>
              <span
                :class="[
                  'rounded px-2 py-1 text-sm',
                  data.checks.configuration.dsn
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ data.checks.configuration.dsn ? 'Configured' : 'Missing' }}
              </span>
            </div>
            <div class="flex items-center justify-between rounded bg-gray-50 p-3">
              <span class="font-medium">Organization</span>
              <span
                :class="[
                  'rounded px-2 py-1 text-sm',
                  data.checks.configuration.org
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ data.checks.configuration.org ? 'Set' : 'Missing' }}
              </span>
            </div>
            <div class="flex items-center justify-between rounded bg-gray-50 p-3">
              <span class="font-medium">Project</span>
              <span
                :class="[
                  'rounded px-2 py-1 text-sm',
                  data.checks.configuration.project
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ data.checks.configuration.project ? 'Set' : 'Missing' }}
              </span>
            </div>
            <div class="flex items-center justify-between rounded bg-gray-50 p-3">
              <span class="font-medium">Auth Token</span>
              <span
                :class="[
                  'rounded px-2 py-1 text-sm',
                  data.checks.configuration.authToken
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ data.checks.configuration.authToken ? 'Set' : 'Missing' }}
              </span>
            </div>
          </div>
          <div class="mt-4 rounded bg-blue-50 p-3">
            <span class="font-medium">Environment:</span>
            <span class="ml-2 text-blue-800">{{ data.checks.configuration.environment }}</span>
          </div>
        </div>

        <!-- API Connectivity -->
        <div class="rounded-lg border border-gray-200 bg-white p-6">
          <h3 class="mb-4 text-lg font-semibold text-gray-900">API Connectivity</h3>
          <div class="flex items-center justify-between rounded bg-gray-50 p-4">
            <div>
              <span class="font-medium">Sentry API</span>
              <p v-if="data.checks.api.error" class="mt-1 text-sm text-red-600">
                {{ data.checks.api.error }}
              </p>
            </div>
            <span
              :class="[
                'rounded px-3 py-1 text-sm font-medium',
                data.checks.api.accessible
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              ]"
            >
              {{ data.checks.api.accessible ? 'Connected' : 'Failed' }}
            </span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="rounded-lg border border-gray-200 bg-white p-6">
          <h3 class="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div class="flex flex-wrap gap-3">
            <NuxtLink
              to="/sentry-dashboard"
              class="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              View Dashboard
            </NuxtLink>
            <NuxtLink
              to="/sentry-test"
              class="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            >
              Test Integration
            </NuxtLink>
            <button
              class="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              @click="refresh()"
            >
              Refresh Status
            </button>
          </div>
        </div>

        <!-- Timestamp -->
        <div class="text-center text-sm text-gray-500">
          Last checked: {{ new Date(data.checks.timestamp).toLocaleString() }}
        </div>
      </div>
    </div>
  </DPageLayout>
</template>

<script setup lang="ts">
import type { SentryHealthStatus } from '~/composables/useSentryHealth';

// Page metadata
definePageMeta({
  title: 'Sentry Status',
  description: 'Monitor Sentry integration health and configuration',
  layout: 'default',
});

// Fetch Sentry health status
const { data, pending, error, refresh } = await useFetch<SentryHealthStatus>('/api/sentry/health', {
  server: false, // Client-side only to avoid SSR issues
});

// Auto-refresh every 30 seconds
let refreshInterval: NodeJS.Timeout | null = null;

onMounted(() => {
  refreshInterval = setInterval(() => {
    refresh();
  }, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
