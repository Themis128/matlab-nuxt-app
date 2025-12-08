<template>
  <DPageLayout>
    <div class="container mx-auto max-w-4xl p-8">
      <DPageHeader
        title="Sentry Integration Test"
        description="Use this page to test your Sentry integration. All errors triggered here will be sent to Sentry."
        icon="heroicons:bug-ant"
        icon-bg="warning"
      />

      <!-- Sentry Status -->
      <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h2 class="mb-2 text-xl font-semibold">Sentry Status</h2>
        <div class="space-y-2">
          <p>
            <span class="font-medium">Initialized:</span>
            <span :class="sentryAvailable ? 'text-green-600' : 'text-red-600'">
              {{ sentryAvailable ? 'Yes' : 'No' }}
            </span>
          </p>
          <p>
            <span class="font-medium">DSN Configured:</span>
            <span :class="dsnConfigured ? 'text-green-600' : 'text-yellow-600'">
              {{ dsnConfigured ? 'Yes' : 'No (using placeholder or not set)' }}
            </span>
          </p>
          <p v-if="userContext.id" class="text-sm text-gray-600">
            <span class="font-medium">User Context:</span> {{ userContext.id }}
          </p>
        </div>
      </div>

      <!-- Test Error Buttons -->
      <div class="mb-8 space-y-4">
        <h2 class="mb-4 text-2xl font-semibold">Test Error Types</h2>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- JavaScript Error -->
          <button
            class="rounded-lg bg-red-500 px-6 py-3 text-white transition-colors hover:bg-red-600"
            @click="triggerJavaScriptError"
          >
            Trigger JavaScript Error
          </button>

          <!-- Vue Error -->
          <button
            class="rounded-lg bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600"
            @click="triggerVueError"
          >
            Trigger Vue Error
          </button>

          <!-- Promise Rejection -->
          <button
            class="rounded-lg bg-yellow-500 px-6 py-3 text-white transition-colors hover:bg-yellow-600"
            @click="triggerPromiseRejection"
          >
            Trigger Promise Rejection
          </button>

          <!-- API Error -->
          <button
            class="rounded-lg bg-purple-500 px-6 py-3 text-white transition-colors hover:bg-purple-600"
            @click="triggerApiError"
          >
            Trigger API Error
          </button>

          <!-- Custom Message -->
          <button
            class="rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
            @click="sendCustomMessage"
          >
            Send Custom Message
          </button>

          <!-- Performance Metric -->
          <button
            class="rounded-lg bg-green-500 px-6 py-3 text-white transition-colors hover:bg-green-600"
            @click="trackPerformanceMetric"
          >
            Track Performance Metric
          </button>
        </div>
      </div>

      <!-- User Context Management -->
      <div class="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 class="mb-4 text-xl font-semibold">User Context</h2>
        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium">User ID</label>
            <input
              v-model="userContext.id"
              type="text"
              placeholder="Enter user ID"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">User Email</label>
            <input
              v-model="userContext.email"
              type="email"
              placeholder="Enter user email"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Username</label>
            <input
              v-model="userContext.username"
              type="text"
              placeholder="Enter username"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            class="rounded-lg bg-indigo-500 px-6 py-3 text-white transition-colors hover:bg-indigo-600"
            @click="updateUserContext"
          >
            Update User Context
          </button>
          <button
            class="ml-2 rounded-lg bg-gray-500 px-6 py-3 text-white transition-colors hover:bg-gray-600"
            @click="clearUserContext"
          >
            Clear User Context
          </button>
        </div>
      </div>

      <!-- Test Results -->
      <div v-if="testResults.length > 0" class="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 class="mb-4 text-xl font-semibold">Test Results</h2>
        <div class="space-y-2">
          <div
            v-for="(result, index) in testResults"
            :key="index"
            class="rounded border border-gray-200 bg-white p-3"
          >
            <p class="font-medium">
              {{ result.type }}
            </p>
            <p class="text-sm text-gray-600">
              {{ result.message }}
            </p>
            <p class="mt-1 text-xs text-gray-500">
              {{ result.timestamp }}
            </p>
          </div>
        </div>
        <button class="mt-4 text-sm text-gray-600 hover:text-gray-800" @click="testResults = []">
          Clear Results
        </button>
      </div>
    </div>
  </DPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  title: 'Sentry Test',
  layout: 'default',
});

interface TestResult {
  type: string;
  message: string;
  timestamp: string;
}

const sentryAvailable = ref(false);
const dsnConfigured = ref(false);
const userContext = ref({
  id: '',
  email: '',
  username: '',
});
const testResults = ref<TestResult[]>([]);

const logger = useSentryLogger();
const metrics = useSentryMetrics();
const sentryUser = useSentryUser();

onMounted(() => {
  // Check Sentry availability
  sentryAvailable.value = isSentryAvailable();

  // Check if DSN is configured (not a placeholder)
  const dsn = process.env.SENTRY_DSN || '';
  dsnConfigured.value =
    !!dsn &&
    !dsn.includes('your-dsn') &&
    !dsn.includes('your-project-id') &&
    dsn.startsWith('https://');

  // Log page view
  metrics.trackPageView('sentry-test');

  logger.info('Sentry test page loaded', {
    sentryAvailable: sentryAvailable.value,
    dsnConfigured: dsnConfigured.value,
  });
});

const addTestResult = (type: string, message: string) => {
  testResults.value.unshift({
    type,
    message,
    timestamp: new Date().toLocaleString(),
  });
};

const triggerJavaScriptError = () => {
  try {
    addTestResult('JavaScript Error', 'Triggering a JavaScript error...');
    // @ts-ignore - Intentionally causing an error
    undefinedFunction();
  } catch (error) {
    logger.logError(
      'Test JavaScript Error',
      error instanceof Error ? error : new Error(String(error)),
      {
        test: true,
        errorType: 'javascript',
      }
    );
    addTestResult('JavaScript Error', 'Error caught and sent to Sentry');
  }
};

const triggerVueError = () => {
  addTestResult('Vue Error', 'Triggering a Vue component error...');
  // This will be caught by the Vue error handler
  throw new Error('Test Vue Error: This is a test error from the Sentry test page');
};

const triggerPromiseRejection = async () => {
  addTestResult('Promise Rejection', 'Triggering an unhandled promise rejection...');
  // This will be caught by the unhandledrejection handler
  Promise.reject(new Error('Test Promise Rejection: This is a test promise rejection'));
};

const triggerApiError = async () => {
  addTestResult('API Error', 'Triggering an API error...');
  try {
    const response = await fetch('/api/nonexistent-endpoint');
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    logger.logError('Test API Error', error instanceof Error ? error : new Error(String(error)), {
      test: true,
      errorType: 'api',
      endpoint: '/api/nonexistent-endpoint',
    });
    addTestResult('API Error', 'API error caught and sent to Sentry');
  }
};

const sendCustomMessage = () => {
  addTestResult('Custom Message', 'Sending a custom message to Sentry...');
  logger.info('Test Custom Message', {
    test: true,
    message: 'This is a test custom message',
    timestamp: new Date().toISOString(),
  });
  addTestResult('Custom Message', 'Custom message sent to Sentry');
};

const trackPerformanceMetric = () => {
  addTestResult('Performance Metric', 'Tracking a performance metric...');
  const startTime = performance.now();

  // Simulate some work
  setTimeout(() => {
    const duration = performance.now() - startTime;
    metrics.trackPerformance('test_operation', duration, 'millisecond', {
      test: true,
      operation: 'simulated_work',
    });
    addTestResult('Performance Metric', `Performance metric tracked: ${duration.toFixed(2)}ms`);
  }, 100);
};

const updateUserContext = () => {
  if (userContext.value.id) {
    sentryUser.setUser({
      id: userContext.value.id,
      email: userContext.value.email,
      username: userContext.value.username,
    });
    addTestResult('User Context', `User context updated: ${userContext.value.id}`);
  } else {
    addTestResult('User Context', 'Please enter a User ID first');
  }
};

const clearUserContext = () => {
  userContext.value = { id: '', email: '', username: '' };
  sentryUser.clearUser();
  addTestResult('User Context', 'User context cleared');
};
</script>
