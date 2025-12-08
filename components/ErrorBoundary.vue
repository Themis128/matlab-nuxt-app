<template>
  <div v-if="hasError" class="flex min-h-[400px] items-center justify-center p-8">
    <div class="card bg-base-100 w-full max-w-lg shadow-xl">
      <div class="card-body text-center">
        <div class="mb-4">
          <Icon name="heroicons:exclamation-triangle" class="mx-auto h-12 w-12 text-error" />
        </div>
        <h3 class="card-title justify-center mb-2 text-xl">
          {{ errorTitle }}
        </h3>
        <div class="alert alert-error mb-6">
          <span>{{ errorMessage }}</span>
        </div>
        <div class="card-actions justify-center gap-3">
          <button class="btn btn-primary" @click="handleRetry">
            <Icon name="heroicons:arrow-path" class="h-4 w-4" />
            {{ t('errors.boundary.tryAgain') }}
          </button>
          <button class="btn btn-ghost" @click="handleReset">
            <Icon name="heroicons:home" class="h-4 w-4" />
            {{ t('errors.boundary.goHome') }}
          </button>
        </div>
        <div v-if="showDetails" class="card bg-base-200 mt-6">
          <div class="card-body">
            <details class="collapse collapse-arrow">
              <summary class="collapse-title text-sm font-medium cursor-pointer">
                {{ t('errors.boundary.details') }}
              </summary>
              <div class="collapse-content">
                <pre class="mt-4 overflow-x-auto rounded-lg bg-base-300 p-4 text-xs">{{
                  errorDetails
                }}</pre>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
/**
 * ErrorBoundary Component
 *
 * Nuxt 4 Best Practices:
 * - Uses onErrorCaptured for Vue 3 error handling
 * - SSR safe (no client-only code)
 * - Auto-imports (no manual imports needed)
 * - TypeScript strict mode
 * - Graceful error handling
 */

const { t } = useI18n();

interface Props {
  fallback?: string;
  showDetails?: boolean;
  onError?: (error: Error, instance: any, info: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  fallback: '',
  showDetails: false,
  onError: undefined,
});

const hasError = ref(false);
const error = ref<Error | null>(null);
const errorInfo = ref<string>('');
const errorInstance = ref<any>(null);

// Computed error messages
const errorTitle = computed(() => {
  if (props.fallback) return props.fallback;
  return error.value?.message || t('errors.boundary.title');
});

const errorMessage = computed(() => {
  if (error.value) {
    // Provide user-friendly messages
    if (error.value.message.includes('fetch')) {
      return t('errors.boundary.fetchError');
    }
    if (error.value.message.includes('network')) {
      return t('errors.boundary.networkError');
    }
    return t('errors.boundary.unexpectedError');
  }
  return t('errors.boundary.componentError');
});

const errorDetails = computed(() => {
  if (!error.value) return '';
  return [
    `Error: ${error.value.message}`,
    `Stack: ${error.value.stack || 'No stack trace'}`,
    `Info: ${errorInfo.value || 'No additional info'}`,
  ].join('\n');
});

// Error handler following Nuxt 4 patterns
onErrorCaptured((err: unknown, instance: any, info: string) => {
  // Convert to Error if needed
  const errorObj = err instanceof Error ? err : new Error(String(err));

  hasError.value = true;
  error.value = errorObj;
  errorInfo.value = info;
  errorInstance.value = instance;

  // Call custom error handler if provided
  if (props.onError) {
    try {
      props.onError(errorObj, instance, info);
    } catch (handlerError) {
      console.error('[ErrorBoundary] Error in onError handler:', handlerError);
    }
  }

  // Log to Sentry if available (SSR safe)
  if (import.meta.client) {
    try {
      const logger = useSentryLogger();
      logger.logError('Component error caught by ErrorBoundary', errorObj, {
        component: instance?.$options?.name || 'Unknown',
        info,
        errorBoundary: true,
      });
    } catch (_sentryError) {
      // Fallback to console if Sentry fails
      console.error('[ErrorBoundary] Error:', errorObj);
      console.error('[ErrorBoundary] Component:', instance?.$options?.name);
      console.error('[ErrorBoundary] Info:', info);
    }
  }

  // Return false to prevent error from propagating
  return false;
});

// Retry handler
const handleRetry = () => {
  hasError.value = false;
  error.value = null;
  errorInfo.value = '';
  errorInstance.value = null;

  // Try to refresh if it's a data fetching error
  if (import.meta.client && errorInstance.value) {
    // Force component re-render
    nextTick(() => {
      // Component will re-render and try again
    });
  }
};

// Reset handler
const handleReset = () => {
  navigateTo('/');
};
</script>

<style scoped>
/* Styles are now handled by Nuxt UI components */
</style>
