<template>
  <div class="min-h-screen bg-gradient-to-b from-base-200 via-base-100 to-base-200">
    <!-- Hero Section with Enhanced Styling -->
    <section class="relative overflow-hidden py-20">
      <!-- Background Pattern -->
      <div class="bg-grid-pattern absolute inset-0 opacity-5" />
      <div
        class="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10"
      />

      <div class="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 px-4 py-2 text-sm font-semibold text-primary shadow-sm"
          >
            <Icon name="heroicons:funnel" class="h-4 w-4" />
            Advanced Search
          </div>
          <h1
            class="mb-4 bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl"
          >
            Find Your Perfect
            <span
              class="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >Mobile Phone</span
            >
          </h1>
          <p class="mx-auto max-w-2xl text-xl text-base-content/70">
            Search through our comprehensive database of mobile phones with advanced filters and
            specifications.
          </p>
        </div>

        <!-- Enhanced Search Card -->
        <div class="mx-auto max-w-5xl">
          <div class="card bg-base-100 border-2 shadow-2xl">
            <div class="card-body space-y-8">
              <!-- Enhanced Search Input -->
              <div class="form-control">
                <div class="input-group">
                  <input
                    v-model="filters.searchQuery"
                    type="text"
                    placeholder="Search phones by name, brand, model..."
                    class="input input-bordered input-lg w-full"
                    @input="handleSearch"
                  />
                  <button class="btn btn-square btn-lg">
                    <Icon name="heroicons:magnifying-glass" class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <!-- Enhanced Filters Grid -->
              <div class="grid grid-cols-1 gap-6 md:grid-cols-3" data-testid="search-filters">
                <DSelect
                  v-model="filters.brand"
                  label="Brand"
                  placeholder="All Brands"
                  :options="brandOptions"
                  data-testid="brand-select"
                  @update:model-value="handleFilterChange"
                />
                <DInput
                  v-model="filters.ram"
                  label="RAM (GB)"
                  type="number"
                  placeholder="Min RAM"
                  data-testid="ram-input"
                  @update:model-value="handleFilterChange"
                />
                <DInput
                  v-model="filters.battery"
                  label="Battery (mAh)"
                  type="number"
                  placeholder="Min Battery"
                  data-testid="battery-input"
                  @update:model-value="handleFilterChange"
                />
              </div>

              <!-- Enhanced Action Buttons -->
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <DButton
                  v-if="hasActiveFilters"
                  variant="ghost"
                  size="md"
                  class="transition-all duration-200 hover:scale-105"
                  @click="clearFilters"
                >
                  <Icon name="heroicons:x-mark" class="h-4 w-4" />
                  Clear Filters
                </DButton>
                <div class="flex flex-col gap-3 sm:ml-auto sm:flex-row">
                  <DButton
                    variant="outline"
                    size="md"
                    class="transition-all duration-200 hover:scale-105 hover:shadow-md"
                    @click="handleExport"
                  >
                    <Icon name="heroicons:arrow-down-tray" class="h-4 w-4" />
                    Export Results
                  </DButton>
                  <DButton
                    variant="primary"
                    size="lg"
                    :loading="pending"
                    class="font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                    data-testid="search-button"
                    @click="handleSearch"
                  >
                    <Icon name="heroicons:magnifying-glass" class="h-5 w-5" />
                    Search Phones
                  </DButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Enhanced Results Section -->
    <section class="py-20">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-4xl font-bold text-base-content">Search Results</h2>
          <div class="badge badge-lg gap-2">
            <Icon name="heroicons:chart-bar" class="h-5 w-5 text-primary" />
            <p v-if="filteredData.length > 0" class="text-lg font-semibold">
              {{ filtered }} of {{ total }} phones found
            </p>
            <p v-else-if="!pending" class="text-lg opacity-70">
              No phones found matching your criteria
            </p>
            <p v-else class="text-lg opacity-70">Searching...</p>
          </div>
        </div>

        <!-- Enhanced Results Grid -->
        <div
          v-if="filteredData.length > 0"
          v-auto-animate
          class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="phone in paginatedPhones"
            :key="phone.id"
            class="card bg-base-100 border-2 border-base-300 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-2xl"
          >
            <!-- Card Content with Enhanced Layout -->
            <div class="p-6">
              <!-- Image Section -->
              <div class="mb-4 flex justify-center">
                <div
                  class="relative h-48 w-full overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300"
                >
                  <OptimizedImage
                    :src="normalizeImageUrl(phone, '/mobile_images/default-phone.svg')"
                    :alt="phone.name || phone.model_name || 'Phone'"
                    class="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>

              <!-- Phone Info -->
              <div class="mb-4">
                <div class="mb-2 flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="card-title mb-1 text-xl">
                      {{ phone.name }}
                    </h3>
                    <p class="text-sm font-medium text-primary">
                      {{ phone.brand }}
                    </p>
                  </div>
                  <span
                    :class="[
                      'badge ml-2 text-base font-bold shadow-md',
                      phone.price > 500 ? 'badge-success' : 'badge-info',
                    ]"
                  >
                    ${{ phone.price }}
                  </span>
                </div>

                <!-- Specifications Grid -->
                <div class="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-base-200 p-3">
                  <div class="flex items-center gap-2">
                    <Icon name="heroicons:cpu-chip" class="h-4 w-4 text-primary" />
                    <div>
                      <span class="block text-xs opacity-70">RAM</span>
                      <span class="font-bold text-base-content">{{ phone.ram }}GB</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Icon name="heroicons:battery-100" class="h-4 w-4 text-success" />
                    <div>
                      <span class="block text-xs opacity-70">Battery</span>
                      <span class="font-bold text-base-content">{{ phone.battery }}mAh</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="card-actions flex gap-2">
                <DButton
                  variant="primary"
                  size="sm"
                  class="flex-1 font-semibold shadow-md transition-all duration-200 hover:scale-105"
                  @click="navigateTo(`/search?q=${encodeURIComponent(phone.name)}`)"
                >
                  <Icon name="heroicons:eye" class="h-4 w-4" />
                  View Details
                </DButton>
                <DButton
                  variant="outline"
                  size="sm"
                  class="font-semibold transition-all duration-200 hover:scale-105 hover:shadow-md"
                  @click="addToComparison(phone)"
                >
                  <Icon name="heroicons:arrows-right-left" class="h-4 w-4" />
                  Compare
                </DButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredData.length > 0" class="mt-12 flex justify-center">
          <div class="join">
            <DButton
              class="join-item"
              size="sm"
              variant="outline"
              :disabled="currentPage === 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >
              «
            </DButton>
            <DButton
              v-for="page in visiblePages"
              :key="page"
              class="join-item"
              size="sm"
              :variant="currentPage === page ? 'primary' : 'outline'"
              @click="currentPage = page"
            >
              {{ page }}
            </DButton>
            <DButton
              class="join-item"
              size="sm"
              variant="outline"
              :disabled="currentPage === totalPages"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >
              »
            </DButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Page metadata
definePageMeta({
  layout: 'catalog',
});

import { computed, onMounted, ref, watch } from 'vue';
import dayjs from 'dayjs';
import type { AlgoliaRecord } from '~/types/algolia';
// Explicit imports needed since auto-import doesn't work from app/pages/
// Using relative paths for reliable SSR and client-side resolution
import { usePageSeoWithStructuredData } from '../composables/usePageSeoWithStructuredData';
import { useDatasetFilters } from '../composables/useDatasetFilters';
import { useDataExport } from '../composables/useDataExport';
import { useModelComparison } from '../composables/useModelComparison';
import { useAnalytics } from '../composables/useAnalytics';
import { usePerformance } from '../composables/usePerformance';
import { useImagePreloader } from '../composables/useImagePreloader';
import { useAlgoliaSearch } from '../composables/useAlgoliaSearch';

// Page SEO meta tags with structured data (set at top level for better SEO)
usePageSeoWithStructuredData({
  title: 'Advanced Search - Mobile Phones',
  description:
    'Search and filter through comprehensive mobile phone database with detailed specifications. Find the perfect phone by brand, RAM, battery, price, and more.',
  keywords: [
    'mobile phone search',
    'phone database',
    'phone specifications',
    'phone comparison',
    'smartphone search',
    'mobile device finder',
  ],
  type: 'website',
  image: '/og-search.jpg',
  structuredData: {
    organization: true,
    breadcrumbs: [
      { name: 'Home', url: 'https://matlab-analytics.com' },
      { name: 'Search', url: 'https://matlab-analytics.com/search' },
    ],
  },
});

// Use Nuxt 4 composables
const { filters, getQueryParams, clearFilters, hasActiveFilters } = useDatasetFilters();
const { exportDataset } = useDataExport();
const { addModel } = useModelComparison();
const analytics = useAnalytics();
const performance = usePerformance();
const config = useRuntimeConfig();

// Check if Algolia is available
const useAlgolia = computed(() => {
  return !!(config.public.algoliaAppId && config.public.algoliaIndex);
});

// Algolia search composable
const algoliaSearch = useAlgoliaSearch();
const algoliaResults = ref<AlgoliaRecord[]>([]);
const algoliaTotal = ref(0);
const algoliaPending = ref(false);

// Image preloader for better performance
const { preloadSearchResults } = useImagePreloader();

// Pagination
const currentPage = ref(1);
const itemsPerPage = 12;

// Fetch data from API (fallback when Algolia not available)
const { data: apiData, pending: apiPending } = await useFetch('/api/products', {
  query: computed(() => ({
    ...getQueryParams(),
    page: currentPage.value,
    limit: itemsPerPage,
  })),
  transform: (data: any) => {
    return {
      data: (data.products || []).map((product: any) => ({
        id: product.id,
        name: product.model,
        brand: product.company,
        price: product.price_usa || product.price_dubai || product.price_india || 0,
        ram: parseInt(product.ram) || 0,
        battery: parseInt(product.battery) || 0,
        image: product.image_url,
        year: product.launched_year,
      })),
      total: data.total || 0,
    };
  },
  // Only fetch if not using Algolia
  immediate: !useAlgolia.value,
});

// Perform Algolia search
const performAlgoliaSearch = async () => {
  if (!useAlgolia.value) return;

  algoliaPending.value = true;
  try {
    algoliaSearch.searchQuery.value = filters.value.searchQuery || '';
    algoliaSearch.currentPage.value = currentPage.value - 1; // Algolia uses 0-based pages
    algoliaSearch.hitsPerPage.value = itemsPerPage;

    // Build filters
    const searchFilters: any = {};
    if (filters.value.brand) {
      searchFilters.brand = filters.value.brand;
    }
    if (filters.value.ram) {
      searchFilters.minRam = filters.value.ram;
      searchFilters.maxRam = filters.value.ram;
    }
    if (filters.value.battery) {
      searchFilters.minBattery = filters.value.battery;
      searchFilters.maxBattery = filters.value.battery;
    }
    if (filters.value.priceRange) {
      const [min, max] = filters.value.priceRange;
      searchFilters.minPrice = min;
      searchFilters.maxPrice = max;
    }

    const result = await algoliaSearch.search({
      query: filters.value.searchQuery || '',
      page: currentPage.value - 1,
      hitsPerPage: itemsPerPage,
      filters: searchFilters,
    });

    if (result) {
      algoliaResults.value = result.hits;
      algoliaTotal.value = result.nbHits;

      // Preload images in background for better performance
      preloadSearchResults(result.hits);
    }
  } catch (error) {
    const logger = useSentryLogger();
    logger.logError(
      'Algolia search error',
      error instanceof Error ? error : new Error(String(error)),
      {
        page: 'search',
        action: 'performSearch',
      }
    );
  } finally {
    algoliaPending.value = false;
  }
};

// Watch for filter changes and perform Algolia search
watch(
  [
    () => filters.value.searchQuery,
    () => filters.value.brand,
    () => filters.value.ram,
    () => filters.value.battery,
    () => filters.value.priceRange,
    currentPage,
  ],
  () => {
    if (useAlgolia.value) {
      performAlgoliaSearch();
    }
  },
  { immediate: true }
);

// Transform Algolia results to match expected format with normalized image URLs
const algoliaData = computed(() => {
  if (!useAlgolia.value || algoliaResults.value.length === 0) return null;

  const { normalizeImageUrl } = useAlgoliaImage();

  return {
    data: algoliaResults.value.map((hit: AlgoliaRecord) => ({
      id: hit.objectID,
      name: hit.model_name || hit.title || 'Unknown',
      brand: hit.brand || hit.company || 'Unknown',
      ram: hit.ram || 0,
      battery: hit.battery || 0,
      // Use normalized image URL with proper fallback
      image: normalizeImageUrl(hit),
      image_url: normalizeImageUrl(hit),
      year: hit.year || new Date().getFullYear(),
      storage: hit.storage,
      processor: hit.processor,
      screen: hit.screen,
      // Preserve original record for image display
      ...hit,
    })),
    total: algoliaTotal.value,
  };
});

// Use Algolia data if available, otherwise use API data
const filteredData = computed(() => {
  if (useAlgolia.value && algoliaData.value) {
    return algoliaData.value.data;
  }
  if (!apiData.value?.data) return [];
  return apiData.value.data.filter((phone: any) => {
    if (filters.value.ram && phone.ram !== filters.value.ram) return false;
    if (filters.value.battery && phone.battery !== filters.value.battery) return false;
    if (filters.value.priceRange) {
      const [min, max] = filters.value.priceRange;
      if (phone.price < min || phone.price > max) return false;
    }
    return true;
  });
});

const total = computed(() => {
  if (useAlgolia.value && algoliaData.value) {
    return algoliaData.value.total;
  }
  return apiData.value?.total || 0;
});

const filtered = computed(() => filteredData.value.length);
const pending = computed(() => (useAlgolia.value ? algoliaPending.value : apiPending.value));

// Brand options from statistics
const { statistics } = useDatasetStatistics();
const brandOptions = computed(() => {
  const brands = statistics.value?.companies || [];
  return brands.map((brand) => ({ label: brand, value: brand }));
});

// Paginated phones (only needed for API fallback, Algolia handles pagination)
const paginatedPhones = computed(() => {
  if (useAlgolia.value) {
    return filteredData.value; // Algolia already returns paginated results
  }
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredData.value.slice(start, end);
});

// Visible pages for pagination (max 7 pages shown)
const visiblePages = computed(() => {
  const maxVisible = 7;
  const pages: number[] = [];

  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    const start = Math.max(1, currentPage.value - 3);
    const end = Math.min(totalPages.value, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});

const totalPages = computed(() => {
  if (useAlgolia.value) {
    return Math.ceil(total.value / itemsPerPage);
  }
  return Math.ceil(filteredData.value.length / itemsPerPage);
});

// User activity tracking
const { trackSearch, trackView } = useUserActivity();

// Handlers
const handleSearch = async () => {
  analytics.trackDatasetAction('search', { query: filters.value.searchQuery });

  // Track user activity
  if (filters.value.searchQuery) {
    await trackSearch(filters.value.searchQuery, filteredData.value.length);
  }

  currentPage.value = 1;
};

const handleFilterChange = () => {
  analytics.trackDatasetAction('filter', filters.value);
  currentPage.value = 1;
};

const handleExport = () => {
  exportDataset(filteredData.value, 'csv', `mobile-search-${dayjs().format('YYYY-MM-DD')}.csv`);
  analytics.trackDatasetAction('export', { format: 'csv', count: filteredData.value.length });
};

const addToComparison = (phone: any) => {
  addModel({
    id: phone.id,
    name: phone.name,
    brand: phone.brand,
    price: phone.price,
    ram: phone.ram,
    battery: phone.battery,
    year: phone.year || new Date().getFullYear(),
    screen: 0,
  });
  analytics.trackDatasetAction('compare', { action: 'add', model: phone.name });
  navigateTo('/compare');
};

// Track page view
onMounted(async () => {
  // Track page view
  await trackView('Device Browser', 'Browsing mobile phone database');

  analytics.trackPageView('/search', 'Advanced Search');

  // Measure page load performance
  nextTick(() => {
    const loadMetrics = performance.measurePageLoad();
    if (loadMetrics) {
      analytics.trackEvent('page_load', { page: 'search', duration: loadMetrics.total });
    }
  });
});
</script>
