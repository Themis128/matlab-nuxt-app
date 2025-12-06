<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <PageHero
        title="Nuxt 4 Composables Examples"
        description="Demonstrating Nuxt 4 native composables in action"
      />

      <!-- Christmas Theme Toggle -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold">Christmas Theme (useCookie + useState)</h2>
            <UButton :color="isActive ? 'green' : 'purple'" @click="toggle">
              {{ isActive ? '🎄 Disable' : '✨ Enable' }} Christmas Mode
            </UButton>
          </div>
        </template>
        <div class="space-y-4">
          <p>Theme is {{ isActive ? 'active' : 'inactive' }}</p>
          <div class="flex gap-4">
            <div class="h-16 w-16 rounded-lg" :style="{ backgroundColor: theme.colors.primary }">
              Primary
            </div>
            <div class="h-16 w-16 rounded-lg" :style="{ backgroundColor: theme.colors.secondary }">
              Secondary
            </div>
            <div class="h-16 w-16 rounded-lg" :style="{ backgroundColor: theme.colors.accent }">
              Accent
            </div>
          </div>
        </div>
      </UCard>

      <!-- Dataset Statistics (useFetch) -->
      <UCard class="mb-8">
        <template #header>
          <h2 class="text-2xl font-bold">Dataset Statistics (useFetch)</h2>
        </template>
        <div v-if="isLoading" class="py-8 text-center">
          <UIcon name="i-heroicons-arrow-path" class="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p>Loading statistics...</p>
        </div>
        <div v-else-if="error" class="text-red-500">Error: {{ error }}</div>
        <div v-else-if="statistics" class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
            <div class="text-sm text-gray-500 dark:text-gray-400">Total Records</div>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ statistics.totalRecords.toLocaleString() }}
            </div>
          </div>
          <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div class="text-sm text-gray-500 dark:text-gray-400">Companies</div>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ statistics.companies?.length || 0 }}
            </div>
          </div>
          <div class="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <div class="text-sm text-gray-500 dark:text-gray-400">Average Price</div>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              ${{ statistics.priceRange?.avg?.toLocaleString() || 0 }}
            </div>
          </div>
        </div>
        <div class="mt-4">
          <UButton @click="refresh">Refresh Data</UButton>
        </div>
      </UCard>

      <!-- Dataset Search (useFetch with reactive query) -->
      <UCard class="mb-8">
        <template #header>
          <h2 class="text-2xl font-bold">Dataset Search (Reactive useFetch)</h2>
        </template>
        <div class="space-y-4">
          <UInput
            v-model="searchQuery"
            placeholder="Search for mobile models..."
            icon="i-heroicons-magnifying-glass"
            class="w-full"
          />
          <div class="flex gap-4">
            <USelect v-model="filters.brand" :options="brandOptions" placeholder="Select Brand" />
            <UButton @click="clearFilters" variant="outline">Clear Filters</UButton>
          </div>
          <div v-if="searchResults?.length" class="space-y-2">
            <div
              v-for="result in searchResults"
              :key="result.id"
              class="rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div class="font-semibold">{{ result.name }}</div>
              <div class="text-sm text-gray-500">{{ result.brand }} - ${{ result.price }}</div>
            </div>
          </div>
          <div v-else-if="!isSearchLoading && searchQuery" class="py-8 text-center text-gray-500">
            No results found
          </div>
        </div>
      </UCard>

      <!-- Model Comparison (useState + useFetch) -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold">Model Comparison (useState)</h2>
            <UButton
              v-if="comparisonModels.length > 0"
              @click="clearComparison"
              variant="outline"
              size="sm"
            >
              Clear ({{ comparisonModels.length }})
            </UButton>
          </div>
        </template>
        <div class="space-y-4">
          <div v-if="comparisonModels.length === 0" class="py-8 text-center text-gray-500">
            No models selected for comparison
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(model, index) in comparisonModels"
              :key="model.id"
              class="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <div class="font-semibold">{{ model.name }}</div>
                <div class="text-sm text-gray-500">{{ model.brand }} - ${{ model.price }}</div>
              </div>
              <UButton @click="removeModel(index)" variant="ghost" size="sm" color="red">
                Remove
              </UButton>
            </div>
          </div>
          <div class="flex gap-2">
            <UButton @click="addSampleModel" :disabled="!canAddMore" variant="outline">
              Add Sample Model
            </UButton>
            <span class="self-center text-sm text-gray-500">
              {{ comparisonModels.length }}/3 models
            </span>
          </div>
        </div>
      </UCard>

      <!-- Status Indicators -->
      <UCard>
        <template #header>
          <h2 class="text-2xl font-bold">Composable Status</h2>
        </template>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <div class="mb-2 font-semibold">Statistics Status</div>
            <div class="text-sm">
              Status: <span :class="statusColor">{{ statisticsStatus }}</span>
            </div>
          </div>
          <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
            <div class="mb-2 font-semibold">Search Status</div>
            <div class="text-sm">Loading: {{ isSearchLoading ? 'Yes' : 'No' }}</div>
            <div class="text-sm">Results: {{ searchResults?.length || 0 }}</div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
// Nuxt 4 composables - auto-imported
const { theme, isActive, toggle } = useChristmasTheme();
const { statistics, isLoading, error, refresh, status: statisticsStatus } = useDatasetStatistics();
const {
  results: searchResults,
  isLoading: isSearchLoading,
  searchQuery,
  filters,
  clearFilters,
} = useDatasetSearch();
const {
  models: comparisonModels,
  addModel,
  removeModel,
  clearComparison,
  canAddMore,
} = useModelComparison();

// Set page meta using useHead
useHead({
  title: 'Nuxt 4 Composables Examples - MATLAB Deep Learning',
  meta: [
    {
      name: 'description',
      content:
        'Examples of Nuxt 4 native composables including useFetch, useState, useCookie, and more',
    },
  ],
});

// Brand options for select
const brandOptions = [
  { label: 'All Brands', value: '' },
  { label: 'Apple', value: 'Apple' },
  { label: 'Samsung', value: 'Samsung' },
  { label: 'Xiaomi', value: 'Xiaomi' },
  { label: 'OnePlus', value: 'OnePlus' },
];

// Status color based on status value
const statusColor = computed(() => {
  switch (statisticsStatus.value) {
    case 'success':
      return 'text-green-600';
    case 'pending':
      return 'text-yellow-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
});

// Sample model for testing
const addSampleModel = () => {
  const sampleModels = [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      price: 999,
      year: 2023,
      ram: 8,
      battery: 3274,
      screen: 6.1,
    },
    {
      id: '2',
      name: 'Galaxy S24 Ultra',
      brand: 'Samsung',
      price: 1199,
      year: 2024,
      ram: 12,
      battery: 5000,
      screen: 6.8,
    },
    {
      id: '3',
      name: 'Xiaomi 14 Pro',
      brand: 'Xiaomi',
      price: 899,
      year: 2024,
      ram: 12,
      battery: 4880,
      screen: 6.73,
    },
  ];

  const randomModel = sampleModels[Math.floor(Math.random() * sampleModels.length)];
  if (randomModel) {
    addModel(randomModel);
  }
};
</script>

<style scoped>
/* Christmas theme styles will be applied via the plugin */
</style>
