<template>
  <div v-if="showStatus" class="fixed bottom-4 right-4 z-50 max-w-sm">
    <div :class="['rounded-lg border p-3', statusClass]">
      <div class="flex items-center gap-2">
        <span class="text-lg">{{ statusIcon }}</span>
        <div class="flex-1">
          <p class="text-sm font-medium">
            {{ statusText }}
          </p>
          <p v-if="statusMessage" class="mt-1 text-xs opacity-75">
            {{ statusMessage }}
          </p>
        </div>
        <button v-if="showDetails" @click="toggleDetails" class="text-xs underline">
          {{ showDetails ? 'Hide' : 'Show' }} Details
        </button>
      </div>

      <div v-if="showDetails && details" class="mt-3 space-y-1 border-t pt-3 text-xs">
        <div v-for="(value, key) in details" :key="key" class="flex justify-between">
          <span class="font-medium">{{ key }}:</span>
          <span>{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Extend Window interface to include Sentry
declare global {
  interface Window {
    Sentry?: any;
    $sentry?: any;
  }
}

// Mock Sentry utils since composable doesn't exist
const isSentryAvailable = () => {
  return typeof window !== 'undefined' && window.Sentry !== undefined;
};

interface Props {
  showDetails?: boolean;
  showWhenConfigured?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false,
  showWhenConfigured: true,
});

const sentryAvailable = ref(false);
const dsnConfigured = ref(false);
const environment = ref('');
const details = ref<Record<string, string>>({});
const showDetailsState = ref(props.showDetails);

const toggleDetails = () => {
  showDetailsState.value = !showDetailsState.value;
};

const showStatus = computed(() => {
  if (props.showWhenConfigured && !dsnConfigured.value) {
    return false;
  }
  return true;
});

const statusClass = computed(() => {
  if (!sentryAvailable.value) {
    return 'border-red-200 bg-red-50 text-red-800';
  }
  if (!dsnConfigured.value) {
    return 'border-yellow-200 bg-yellow-50 text-yellow-800';
  }
  return 'border-green-200 bg-green-50 text-green-800';
});

const statusIcon = computed(() => {
  if (!sentryAvailable.value) {
    return '❌';
  }
  if (!dsnConfigured.value) {
    return '⚠️';
  }
  return '✅';
});

const statusText = computed(() => {
  if (!sentryAvailable.value) {
    return 'Sentry Not Available';
  }
  if (!dsnConfigured.value) {
    return 'Sentry Not Configured';
  }
  return 'Sentry Active';
});

const statusMessage = computed(() => {
  if (!sentryAvailable.value) {
    return 'Sentry SDK is not loaded';
  }
  if (!dsnConfigured.value) {
    return 'Set SENTRY_DSN in .env.sentry to enable error tracking';
  }
  return `Tracking errors in ${environment.value || 'production'} environment`;
});

onMounted(() => {
  sentryAvailable.value = isSentryAvailable();

  const dsn = process.env.SENTRY_DSN || '';
  dsnConfigured.value =
    !!dsn &&
    !dsn.includes('your-dsn') &&
    !dsn.includes('your-project-id') &&
    dsn.startsWith('https://');

  environment.value = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

  if (showDetailsState.value) {
    const dsnPreview =
      dsnConfigured.value && dsn.length > 30 ? `${dsn.substring(0, 30)}...` : 'Not set';
    details.value = {
      Initialized: sentryAvailable.value ? 'Yes' : 'No',
      'DSN Configured': dsnConfigured.value ? 'Yes' : 'No',
      Environment: environment.value,
      DSN: dsnPreview,
    };
  }
});
</script>
