<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto w-full max-w-md px-6 text-center">
      <!-- Error Icon -->
      <div class="mb-8">
        <div
          class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20"
        >
          <Icon :name="errorIcon"
class="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
      </div>

      <!-- Error Code -->
      <h1 class="mb-4 text-6xl font-bold text-gray-900 dark:text-white">
        {{ error.statusCode }}
      </h1>

      <!-- Error Message -->
      <h2 class="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
        {{ errorTitle }}
      </h2>

      <p class="mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
        {{ errorDescription }}
      </p>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <UButton color="primary" @click="handleError" size="lg" block>
          <Icon name="i-heroicons-arrow-left"
class="mr-2 h-4 w-4" />
          {{ primaryAction }}
        </UButton>

        <UButton variant="ghost" @click="navigateTo('/')" size="lg" block>
          <Icon name="i-heroicons-home"
class="mr-2 h-4 w-4" />
          Go to Homepage
        </UButton>

        <UButton v-if="showReportButton"
@click="reportError" variant="ghost" size="sm" block>
          <Icon name="i-heroicons-bug-ant"
class="mr-2 h-4 w-4" />
          Report this issue
        </UButton>
      </div>

      <!-- Additional Help -->
      <div class="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">Need help? Try these options:</p>

        <div class="flex justify-center space-x-6 text-sm">
          <NuxtLink
            to="/search"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Browse Devices
          </NuxtLink>
          <NuxtLink
            to="/ai-demo"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            AI Predictions
          </NuxtLink>
          <NuxtLink
            to="/api-docs"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            API Docs
          </NuxtLink>
        </div>
      </div>

      <!-- Error Details (Development) -->
      <div v-if="isDevelopment && error.stack"
class="mt-8 text-left">
        <details class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <summary class="mb-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
            Error Details (Development)
          </summary>
          <pre class="overflow-auto text-xs text-gray-600 dark:text-gray-400">{{
            error.stack
          }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Get error from props
const props = defineProps<{
  error: {
    statusCode: number;
    statusMessage?: string;
    message?: string;
    stack?: string;
  };
}>();

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development';

// Computed properties for error handling
const errorIcon = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return 'i-heroicons-magnifying-glass';
    case 403:
      return 'i-heroicons-lock-closed';
    case 500:
    case 502:
    case 503:
      return 'i-heroicons-server';
    default:
      return 'i-heroicons-exclamation-triangle';
  }
});

const errorTitle = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return 'Page Not Found';
    case 403:
      return 'Access Forbidden';
    case 500:
      return 'Server Error';
    case 502:
      return 'Bad Gateway';
    case 503:
      return 'Service Unavailable';
    default:
      return 'Something went wrong';
  }
});

const errorDescription = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return "The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.";
    case 403:
      return "You don't have permission to access this resource. Please check your credentials or contact support.";
    case 500:
      return "We're experiencing some technical difficulties. Our team has been notified and is working to fix this issue.";
    case 502:
      return "We're having trouble connecting to our servers. Please try again in a few moments.";
    case 503:
      return 'Our service is temporarily unavailable due to maintenance or high traffic. Please try again later.';
    default:
      return (
        props.error.statusMessage ||
        props.error.message ||
        'An unexpected error occurred. Please try again.'
      );
  }
});

const primaryAction = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return 'Go Back';
    case 500:
    case 502:
    case 503:
      return 'Try Again';
    default:
      return 'Go Back';
  }
});

const showReportButton = computed(() => {
  return props.error.statusCode >= 500;
});

// Error handling methods
const handleError = () => {
  if (props.error.statusCode === 404) {
    // Go back or to home if no history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('/');
    }
  } else {
    // Try to reload the page
    window.location.reload();
  }
};

const reportError = () => {
  // Log error to Sentry if available
  if (process.client && window.$sentry) {
    window.$sentry.captureException(
      new Error(`${props.error.statusCode}: ${props.error.statusMessage}`)
    );
  }

  // Show success message
  const toast = useToast();
  toast.add({
    title: 'Error Reported',
    description: 'Thank you for reporting this issue. Our team will investigate.',
    color: 'success',
  });
};

// Set page title based on error
useHead({
  title: `${props.error.statusCode} - ${errorTitle.value}`,
});

// Log error for monitoring
onMounted(() => {
  if (process.client) {
    console.error('Error page rendered:', {
      statusCode: props.error.statusCode,
      message: props.error.statusMessage || props.error.message,
      url: window.location.href,
    });
  }
});
</script>

<style scoped>
/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}
</style>
