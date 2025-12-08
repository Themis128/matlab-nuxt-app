<template>
  <ErrorBoundary :show-details="showErrorDetails" @error="handleError">
    <Suspense>
      <template #default>
        <slot />
      </template>
      <template #fallback>
        <div class="safe-component-loading">
          <LoadingSpinner :type="loadingType" :size="loadingSize" :show-text="showLoadingText" />
        </div>
      </template>
    </Suspense>
  </ErrorBoundary>
</template>

<script setup lang="ts">
/**
 * SafeComponent Wrapper
 *
 * Nuxt 4 Best Practices:
 * - Wraps components with error boundary and suspense
 * - Handles loading and error states gracefully
 * - SSR safe
 * - Prevents component errors from breaking the app
 */

interface Props {
  loadingType?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'bars';
  loadingSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLoadingText?: boolean;
  showErrorDetails?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  loadingType: 'spinner',
  loadingSize: 'md',
  showLoadingText: false,
  showErrorDetails: false,
});

// Error handler
const handleError = (error: Error, instance: any, info: string) => {
  // Error is already handled by ErrorBoundary
  // This is just for additional logging if needed
  if (import.meta.client) {
    console.warn('[SafeComponent] Error caught:', {
      error: error.message,
      component: instance?.$options?.name,
      info,
    });
  }
};
</script>

<style scoped>
.safe-component-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--space-8);
}
</style>
