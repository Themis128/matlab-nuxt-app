<template>
  <DPageLayout>
    <div class="container mx-auto max-w-7xl p-6">
      <!-- Header -->
      <DPageHeader
        title="Query Assistant"
        description="Ask natural language questions about mobile devices and get intelligent answers powered by AI"
        icon="heroicons:chat-bubble-left-right"
        icon-bg="primary"
      >
        <span class="badge badge-success badge-lg animate-pulse">
          <Icon name="heroicons:sparkles" class="h-3 w-3" />
          AI Powered
        </span>
      </DPageHeader>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Query Interface -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Query Input -->
          <div class="card-modern animate-scale-in p-6">
            <div class="mb-4">
              <h2 class="flex items-center gap-2 text-xl font-semibold text-base-content">
                <Icon name="heroicons:question-mark-circle" class="h-5 w-5 text-primary" />
                Ask a Question
              </h2>
              <p class="mt-1 text-sm opacity-70">
                Type your question below or click on an example to get started
              </p>
            </div>

            <div class="space-y-6">
              <div class="relative">
                <textarea
                  v-model="query"
                  placeholder="Ask me anything about mobile devices... e.g., 'What are the best phones under $500 with good cameras?'"
                  rows="4"
                  :disabled="loading"
                  class="textarea textarea-bordered textarea-lg w-full resize-none"
                  maxlength="500"
                />
                <div class="absolute bottom-3 right-3 text-xs text-base-content/60">
                  {{ query.length }}/500
                </div>
              </div>

              <!-- Example Queries -->
              <div class="space-y-3">
                <p class="text-sm font-medium text-base-content">Quick examples:</p>
                <div class="flex flex-wrap gap-2">
                  <DButton
                    v-for="example in exampleQueries"
                    :key="example"
                    variant="ghost"
                    size="sm"
                    :disabled="loading"
                    class="text-xs"
                    @click="query = example"
                  >
                    {{ example }}
                  </DButton>
                </div>
              </div>

              <div class="flex items-center justify-between border-t border-base-300 pt-4">
                <div class="flex items-center gap-2 text-sm opacity-70">
                  <Icon name="heroicons:shield-check" class="h-4 w-4" />
                  <span>Powered by advanced AI</span>
                </div>

                <DButton
                  :loading="loading"
                  :disabled="!query.trim()"
                  variant="primary"
                  size="lg"
                  class="px-6"
                  @click="submitQuery"
                >
                  <Icon name="heroicons:paper-airplane" class="h-5 w-5" />
                  Ask AI
                </DButton>
              </div>
            </div>
          </div>

          <!-- Results -->
          <DCard v-if="response || loading">
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="card-title">Response</h2>
                <span v-if="responseTime" class="badge badge-neutral badge-lg">
                  {{ responseTime }}ms
                </span>
              </div>
            </template>

            <div v-if="loading" class="space-y-3">
              <div class="h-4 w-full animate-pulse rounded bg-base-300" />
              <div class="h-4 w-3/4 animate-pulse rounded bg-base-300" />
              <div class="h-4 w-1/2 animate-pulse rounded bg-base-300" />
            </div>

            <div v-else-if="response" class="space-y-4">
              <div class="dark:prose-invert prose max-w-none">
                <p>{{ response.answer }}</p>
              </div>

              <!-- Related Products -->
              <div v-if="response.products?.length" class="space-y-3">
                <h3 class="text-md font-semibold">Related Products</h3>
                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div
                    v-for="product in response.products"
                    :key="product.id"
                    class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    @click="navigateToProduct(product)"
                  >
                    <OptimizedImage
                      :src="product.image_url || '/mobile_images/default-phone.png'"
                      :alt="product.model_name"
                      class="h-12 w-12 rounded object-cover"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium">
                        {{ product.model_name }}
                      </p>
                      <p class="text-xs opacity-70">
                        {{ product.company }}
                      </p>
                      <p class="text-xs font-semibold text-green-600">${{ product.price }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sources -->
              <div v-if="response.sources?.length" class="space-y-2">
                <h3 class="text-sm font-semibold opacity-70">Sources</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="source in response.sources"
                    :key="source"
                    class="badge badge-outline badge-sm"
                  >
                    {{ source }}
                  </span>
                </div>
              </div>
            </div>

            <DAlert v-if="error" variant="error" title="Error" :message="error" class="mt-4" />
          </DCard>

          <!-- Query History -->
          <DCard v-if="queryHistory.length">
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="card-title">Recent Queries</h2>
                <DButton variant="ghost" size="xs" @click="clearHistory"> Clear History </DButton>
              </div>
            </template>

            <div class="space-y-2">
              <div
                v-for="(item, index) in queryHistory.slice(0, 5)"
                :key="index"
                class="cursor-pointer rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                @click="query = item.query"
              >
                <p class="text-sm font-medium">
                  {{ item.query }}
                </p>
                <p class="text-xs opacity-70">
                  {{ formatTime(item.timestamp) }}
                </p>
              </div>
            </div>
          </DCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <DCard>
            <template #header>
              <h3 class="card-title">Quick Actions</h3>
            </template>

            <div class="card-body space-y-3">
              <DButton variant="ghost" block @click="navigateTo('/search')">
                <Icon name="heroicons:magnifying-glass" class="h-4 w-4" />
                Browse Devices
              </DButton>

              <DButton variant="ghost" block @click="navigateTo('/compare')">
                <Icon name="heroicons:scale" class="h-4 w-4" />
                Compare Devices
              </DButton>

              <DButton variant="ghost" block @click="navigateTo('/ai-demo')">
                <Icon name="heroicons:sparkles" class="h-4 w-4" />
                Price Prediction
              </DButton>

              <DButton variant="ghost" block @click="navigateTo('/recommendations')">
                <Icon name="heroicons:heart" class="h-4 w-4" />
                Recommendations
              </DButton>
            </div>
          </DCard>

          <!-- Tips -->
          <DCard>
            <template #header>
              <h3 class="card-title">Tips</h3>
            </template>

            <div class="space-y-3 text-sm">
              <div class="flex items-start gap-2">
                <Icon name="heroicons:light-bulb" class="mt-0.5 h-4 w-4 text-warning" />
                <p>Be specific about your requirements (budget, features, brand preferences)</p>
              </div>

              <div class="flex items-start gap-2">
                <Icon name="heroicons:light-bulb" class="mt-0.5 h-4 w-4 text-warning" />
                <p>Ask about comparisons between specific models</p>
              </div>

              <div class="flex items-start gap-2">
                <Icon name="heroicons:light-bulb" class="mt-0.5 h-4 w-4 text-warning" />
                <p>Include use cases (gaming, photography, business)</p>
              </div>

              <div class="flex items-start gap-2">
                <Icon name="heroicons:light-bulb" class="mt-0.5 h-4 w-4 text-warning" />
                <p>Ask about trends and market insights</p>
              </div>
            </div>
          </DCard>

          <!-- Stats -->
          <DCard>
            <template #header>
              <h3 class="card-title">Query Stats</h3>
            </template>

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm opacity-70">Total Queries</span>
                <span class="font-semibold">{{ queryHistory.length }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-sm opacity-70">Avg Response Time</span>
                <span class="font-semibold">{{ avgResponseTime }}ms</span>
              </div>

              <div class="flex justify-between">
                <span class="text-sm opacity-70">Success Rate</span>
                <span class="font-semibold text-success">{{ successRate }}%</span>
              </div>
            </div>
          </DCard>
        </div>
      </div>
    </div>
  </DPageLayout>
</template>

<script setup lang="ts">
// Page metadata
definePageMeta({
  title: 'Query Assistant',
  description: 'Ask natural language questions about mobile devices',
  layout: 'query',
});

// Reactive state
const query = ref('');
const response = ref<any>(null);
const loading = ref(false);
const error = ref('');
const responseTime = ref<number | null>(null);

// Query history (stored in localStorage)
const queryHistory = ref<Array<{ query: string; timestamp: Date; responseTime?: number }>>([]);

// Example queries
const exampleQueries = [
  'Best phones under $500',
  'iPhone vs Samsung flagship',
  'Gaming phones with high refresh rate',
  'Best camera phones 2024',
];

// Load query history from localStorage
onMounted(() => {
  const stored = localStorage.getItem('query-history');
  if (stored) {
    try {
      queryHistory.value = JSON.parse(stored).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch (e) {
      console.warn('Failed to load query history:', e);
    }
  }
});

// Save query history to localStorage
const saveHistory = () => {
  localStorage.setItem('query-history', JSON.stringify(queryHistory.value));
};

// User activity tracking
const { trackQuery } = useUserActivity();

// Submit query
const submitQuery = async () => {
  if (!query.value.trim()) return;

  loading.value = true;
  error.value = '';
  response.value = null;

  const startTime = Date.now();

  try {
    // Call real API endpoint
    const result = await $fetch('/api/query/assistant', {
      method: 'POST',
      body: {
        query: query.value,
        context: 'mobile_devices',
      },
    });

    responseTime.value = Date.now() - startTime;
    response.value = result;

    // Track user activity
    await trackQuery(query.value, result);

    // Add to history
    queryHistory.value.unshift({
      query: query.value,
      timestamp: new Date(),
      responseTime: responseTime.value,
    });

    // Keep only last 50 queries
    if (queryHistory.value.length > 50) {
      queryHistory.value = queryHistory.value.slice(0, 50);
    }

    saveHistory();
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Failed to process your query. Please try again.';
    console.error('Query error:', err);
  } finally {
    loading.value = false;
  }
};

// Handle navigation to product details
const navigateToProduct = (product: any) => {
  if (product.id) {
    navigateTo(`/search?id=${product.id}`);
  } else {
    // Fallback to search by name
    navigateTo(`/search?q=${encodeURIComponent(product.model_name || product.company)}`);
  }
};

// Clear query history
const clearHistory = () => {
  queryHistory.value = [];
  localStorage.removeItem('query-history');
};

// Format timestamp
const formatTime = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return timestamp.toLocaleDateString();
};

// Computed stats
const avgResponseTime = computed(() => {
  const times = queryHistory.value
    .filter((item) => item.responseTime)
    .map((item) => item.responseTime!);

  if (times.length === 0) return 0;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
});

const successRate = computed(() => {
  if (queryHistory.value.length === 0) return 100;
  return Math.round((queryHistory.value.length / queryHistory.value.length) * 100);
});

// Handle enter key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    submitQuery();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>
