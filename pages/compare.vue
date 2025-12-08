<template>
  <div class="min-h-screen bg-base-200">
    <!-- Enhanced Hero Section -->
    <section class="relative overflow-hidden py-20">
      <div class="bg-grid-pattern absolute inset-0 opacity-5 dark:opacity-10" />
      <div
        class="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10"
      />

      <div class="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300"
          >
            <Icon name="heroicons:scale" class="h-4 w-4" />
            Phone Comparison
          </div>
          <h1 class="mb-4 text-5xl font-extrabold text-base-content sm:text-6xl">
            Compare Mobile Phones
            <span class="block text-primary">Side by Side</span>
          </h1>
          <p class="mx-auto max-w-2xl text-xl opacity-70">
            Make informed decisions by comparing specifications, features, and performance metrics.
          </p>
        </div>

        <!-- Enhanced Comparison Card -->
        <div class="mx-auto max-w-5xl">
          <DCard class="border-2 border-base-300 bg-base-100/90 p-8 shadow-2xl backdrop-blur-xl">
            <div class="mb-8 text-center">
              <h2 class="mb-3 text-3xl font-bold text-base-content">Select Phones to Compare</h2>
              <p class="text-lg opacity-70">
                Choose up to 4 phones to compare their specifications
              </p>
            </div>

            <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div v-for="(model, index) in models" :key="index" class="space-y-3">
                <label class="label">
                  <span class="label-text">Phone {{ index + 1 }}</span>
                </label>
                <DSelect
                  :model-value="model?.name || ''"
                  placeholder="Select phone"
                  :options="
                    availablePhones.map((p) => ({ label: p.name || p, value: p.name || p }))
                  "
                  @update:model-value="(value) => handlePhoneSelect(String(value || ''), index)"
                />
                <DButton v-if="model" size="xs" variant="error" @click="removeModel(index)">
                  <Icon name="heroicons:x-mark" class="h-4 w-4" />
                  Remove
                </DButton>
              </div>
              <div v-if="canAddMore" class="space-y-3">
                <label class="label">
                  <span class="label-text">Add Phone</span>
                </label>
                <DButton size="lg" variant="outline" class="w-full" @click="addEmptySlot">
                  <Icon name="heroicons:plus" class="h-5 w-5" />
                  Add Another
                </DButton>
              </div>
            </div>

            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <DButton
                v-if="models && models.length > 0"
                size="md"
                variant="ghost"
                class="transition-all duration-200 hover:scale-105"
                @click="clearComparison"
              >
                <Icon name="heroicons:trash" class="h-4 w-4" />
                Clear All
              </DButton>
              <DButton
                size="lg"
                variant="primary"
                class="font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                :disabled="!models || models.length < 2"
                :loading="isLoading"
                @click="handleCompare"
              >
                <Icon name="heroicons:arrow-right" class="mr-2 h-5 w-5" />
                Compare Selected Phones
              </DButton>
            </div>
          </DCard>
        </div>
      </div>
    </section>

    <!-- Enhanced Comparison Results Section -->
    <section
      v-if="comparisonData && comparisonData.length > 0"
      class="relative overflow-hidden py-20"
    >
      <div class="bg-grid-pattern absolute inset-0 opacity-5 dark:opacity-10" />
      <div class="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <div
            class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-info/20 to-secondary/20 px-4 py-2 text-sm font-semibold text-info shadow-sm"
          >
            <Icon name="heroicons:chart-bar" class="h-4 w-4" />
            Comparison Results
          </div>
          <h2
            class="mb-4 bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text text-4xl font-extrabold text-transparent"
          >
            Comparison Results
          </h2>
          <p class="text-xl text-base-content/70">
            Detailed specifications and performance comparison
          </p>
        </div>

        <div v-auto-animate class="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <DCard
            v-for="(phone, index) in comparisonData"
            :key="phone.id || index"
            class="group relative overflow-hidden border-2 border-base-300/50 bg-base-100 p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:border-info hover:shadow-2xl"
          >
            <div class="relative mb-6 flex justify-center">
              <div
                class="h-48 w-full overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300"
              >
                <NuxtImg
                  :src="phone.image || '/mobile_images/default-phone.svg'"
                  :alt="phone.name"
                  width="200"
                  height="192"
                  class="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  format="webp"
                />
              </div>
              <DButton
                size="sm"
                variant="error"
                class="absolute -right-2 -top-2 h-8 w-8 rounded-full p-0 shadow-lg transition-all duration-200 hover:scale-110"
                @click="removeModel(index)"
              >
                <Icon name="heroicons:x-mark" class="h-4 w-4" />
              </DButton>
            </div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              {{ phone.name }}
            </h3>
            <p class="mb-3 text-sm font-medium text-blue-600 dark:text-blue-400">
              {{ phone.brand }}
            </p>
            <div class="text-3xl font-extrabold text-green-600 dark:text-green-400">
              ${{ phone.price }}
            </div>
          </DCard>
        </div>

        <!-- Enhanced Comparison Table -->
        <div
          class="overflow-x-auto rounded-2xl border-2 border-gray-200/50 shadow-2xl dark:border-gray-700/50"
        >
          <table class="w-full bg-white dark:bg-gray-800">
            <thead
              class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800"
            >
              <tr>
                <th class="px-8 py-5 text-left text-base font-bold text-gray-900 dark:text-white">
                  Specification
                </th>
                <th
                  v-for="phone in comparisonData"
                  :key="phone.id"
                  class="min-w-48 px-8 py-5 text-center text-base font-bold text-gray-900 dark:text-white"
                >
                  {{ phone.name }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y-2 divide-gray-200 dark:divide-gray-700">
              <tr class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-8 py-5 text-base font-semibold text-gray-900 dark:text-white">
                  Price
                </td>
                <td
                  v-for="phone in comparisonData"
                  :key="phone.id"
                  class="px-8 py-5 text-center text-base text-gray-600 dark:text-gray-300"
                >
                  <span class="font-bold text-green-600 dark:text-green-400"
                    >${{ phone.price }}</span
                  >
                </td>
              </tr>
              <tr class="transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-8 py-5 text-base font-semibold text-gray-900 dark:text-white">
                  Display
                </td>
                <td
                  v-for="phone in comparisonData"
                  :key="phone.id"
                  class="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300"
                >
                  {{ phone.display }} {{ phone.displayType }}
                </td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  Processor
                </td>
                <td
                  v-for="phone in comparisonData"
                  :key="phone.id"
                  class="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300"
                >
                  {{ phone.processor }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
          <DButton size="lg" variant="outline" class="font-semibold" @click="handleExport">
            <Icon name="i-heroicons-arrow-down-tray" class="mr-2 h-5 w-5" />
            Export Comparison
          </DButton>
          <DButton size="lg" variant="info" class="font-semibold" @click="viewBestDeal">
            <Icon name="i-heroicons-shopping-bag" class="mr-2 h-5 w-5" />
            View Best Deal
          </DButton>
        </div>
      </div>
    </section>

    <section v-else class="bg-gray-50 py-20 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 text-center sm:px-6 lg:px-8">
        <Icon
          name="i-heroicons-scale"
          class="mx-auto mb-6 h-24 w-24 text-gray-300 dark:text-gray-600"
        />
        <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Ready to Compare Phones?
        </h2>
        <p class="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          Select at least 2 phones above to see a detailed side-by-side comparison.
        </p>
        <DButton size="lg" variant="info" class="font-semibold" @click="scrollToTop">
          <Icon name="i-heroicons-plus" class="mr-2 h-5 w-5" />
          Add Phones to Compare
        </DButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Page metadata
definePageMeta({
  layout: 'compare',
});
import { computed, onMounted } from 'vue';
import { usePageSeoWithStructuredData } from '../composables/usePageSeoWithStructuredData';
import { useModelComparison } from '../composables/useModelComparison';
import { useDataExport } from '../composables/useDataExport';
import { useAnalytics } from '../composables/useAnalytics';
import { useUserActivity } from '../composables/useUserActivity';

// Page SEO meta tags with structured data (set at top level for better SEO)
usePageSeoWithStructuredData({
  title: 'Compare Phones - MATLAB Analytics',
  description:
    'Compare mobile phones side by side with detailed specifications, features, and performance metrics. Make informed decisions with comprehensive phone comparison tools.',
  keywords: [
    'phone comparison',
    'mobile phone compare',
    'smartphone comparison',
    'phone specs',
    'device comparison',
    'phone features',
  ],
  type: 'website',
  image: '/og-compare.jpg',
  structuredData: {
    organization: true,
    breadcrumbs: [
      { name: 'Home', url: 'https://matlab-analytics.com' },
      { name: 'Compare', url: 'https://matlab-analytics.com/compare' },
    ],
  },
});

// Import composables
const { models, comparison, isLoading, addModel, removeModel, clearComparison, canAddMore } =
  useModelComparison();
const { exportDataset } = useDataExport();
const analytics = useAnalytics();
const { trackComparison, trackView } = useUserActivity();

// Available phones for selection
const { data: phonesData } = await useFetch('/api/products', {
  query: { limit: 100 },
  transform: (data: any) => {
    return (data.products || [])
      .filter((p: any) => p.model && p.company)
      .map((p: any) => ({
        label: `${p.company} ${p.model}`,
        value: `${p.company}-${p.model}`.toLowerCase().replace(/\s+/g, '-'),
        data: {
          id: p.id,
          name: p.model,
          brand: p.company,
          price: p.price_usa || p.price_dubai || p.price_india || 0,
          ram: parseInt(p.ram) || 0,
          battery: parseInt(p.battery) || 0,
          screen: parseFloat(p.screen_size) || 0,
          image: p.image_url,
        },
      }));
  },
});

const availablePhones = computed(() => phonesData.value || []);

// Comparison data computed property
const comparisonData = computed(() => {
  if (!comparison.value || !comparison.value.models) {
    return [];
  }
  return Array.isArray(comparison.value.models) ? comparison.value.models : [];
});

// Handlers
const handlePhoneSelect = (value: string, index: number) => {
  const phoneOption = availablePhones.value.find((p: any) => p.value === value);
  if (phoneOption && phoneOption.data) {
    // Update or add model
    if (models.value[index]) {
      // For updating existing model, we might need to remove and re-add
      removeModel(Number(models.value[index].id));
      addModel(phoneOption.data);
    } else {
      addModel(phoneOption.data);
    }
    analytics.trackDatasetAction('compare', { action: 'add', model: phoneOption.data.name });
  }
};

const addEmptySlot = () => {
  if (canAddMore.value) {
    // Add an empty model using the composable function
    addModel({
      id: '',
      name: '',
      brand: '',
      price: 0,
      year: 2024,
      ram: 0,
      battery: 0,
      screen: 0,
    });
  }
};

// User activity tracking
// const { trackComparison, trackView } = useUserActivity(); // Already declared above

const handleCompare = async () => {
  if (models.value && models.value.length >= 2) {
    analytics.trackDatasetAction('compare', {
      action: 'compare',
      count: models.value.length,
    });

    // Track user activity
    const deviceNames = models.value
      .filter((m: any) => m.name)
      .map((m: any) => `${m.brand} ${m.name}`.trim());

    if (deviceNames.length >= 2) {
      await trackComparison(deviceNames);
    }
  }
};

// Export comparison
const handleExport = () => {
  if (comparison.value?.models) {
    exportDataset([...comparison.value.models], 'csv', 'phone-comparison.csv');
    analytics.trackDatasetAction('export', { format: 'csv', type: 'comparison' });
  }
};

const viewBestDeal = () => {
  if (comparisonData.value && comparisonData.value.length > 0) {
    // Find the phone with the lowest price
    const bestDeal = comparisonData.value.reduce((prev: any, current: any) =>
      prev.price < current.price ? prev : current
    );
    analytics.trackDatasetAction('compare', { model: bestDeal.name, price: bestDeal.price });
    // Navigate to search with the best deal phone
    navigateTo(`/search?q=${encodeURIComponent(bestDeal.name)}`);
  }
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Page setup
onMounted(async () => {
  // Track page view
  await trackView('Device Comparison', `Comparing ${models.value.length} devices`);
  analytics.trackPageView('/compare', 'Phone Comparison');
});
</script>
