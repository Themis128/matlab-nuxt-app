<template>
  <div class="bg-background min-h-screen">
    <section
      class="bg-gradient-to-br from-purple-50 to-blue-50 py-16 dark:from-purple-900/20 dark:to-blue-900/20"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
          >
            <UIcon name="i-heroicons-funnel" class="h-4 w-4" />
            Advanced Search
          </div>
          <h1 class="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
            Find Your Perfect
            <span class="text-purple-600 dark:text-purple-400">Mobile Phone</span>
          </h1>
          <p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Search through our comprehensive database of mobile phones with advanced filters and
            specifications.
          </p>
        </div>

        <div class="mx-auto max-w-4xl">
          <UCard class="bg-white/80 p-8 backdrop-blur-sm dark:bg-gray-800/80">
            <div class="space-y-6">
              <div class="relative">
                <UIcon
                  name="i-heroicons-magnifying-glass"
                  class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400"
                />
                <UInput
                  v-model="searchQuery"
                  placeholder="Search phones by name, brand..."
                  size="lg"
                  class="pl-12"
                />
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <USelect
                  v-model="selectedBrand"
                  placeholder="Brand"
                  :options="brands"
                  data-testid="brand-select"
                />
                <div>
                  <UInput
                    v-model="ramMin"
                    placeholder="Min RAM (GB)"
                    type="number"
                    data-testid="ram-min-input"
                  />
                </div>
                <div>
                  <UInput
                    v-model="ramMax"
                    placeholder="Max RAM (GB)"
                    type="number"
                    data-testid="ram-max-input"
                  />
                </div>
              </div>

              <div class="flex justify-center">
                <UButton
                  size="lg"
                  color="purple"
                  variant="solid"
                  class="font-semibold"
                  data-testid="search-button"
                >
                  <UIcon name="i-heroicons-magnifying-glass" class="mr-2 h-5 w-5" />
                  Search Phones
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-20 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Search Results</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300" v-if="phones.length > 0">
            {{ phones.length }} phones found
          </p>
          <p class="text-lg text-gray-600 dark:text-gray-300" v-else>
            No phones found matching your criteria
          </p>
        </div>

        <div v-if="phones.length > 0" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UCard
            v-for="phone in phones"
            :key="phone.id"
            class="model-card group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="flex items-start gap-4">
              <div
                class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <img
                  :src="phone.image"
                  :alt="`${phone.brand} ${phone.name}`"
                  class="h-full w-full object-cover"
                  @error="handleImageError"
                />
              </div>
              <div class="flex-1">
                <div class="mb-2 flex items-start justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      {{ phone.name }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ phone.brand }}</p>
                  </div>
                  <UBadge :color="phone.price > 500 ? 'green' : 'blue'" variant="soft">
                    ${{ phone.price }}
                  </UBadge>
                </div>
                <div class="mb-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-600 dark:text-gray-300">RAM:</span>
                    <span class="font-semibold">{{ phone.ram }}GB</span>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-300">Battery:</span>
                    <span class="font-semibold">{{ phone.battery }}mAh</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <UButton size="sm" color="purple" variant="outline">View Details</UButton>
                  <UButton size="sm" variant="ghost">Compare</UButton>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Pagination -->
        <div v-if="phones.length > 0" class="mt-12 flex justify-center">
          <div class="flex gap-2">
            <UButton
              variant="outline"
              size="sm"
              :disabled="currentPage === 1"
              data-testid="pagination-prev"
              @click="currentPage--"
            >
              Previous
            </UButton>
            <span class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <UButton
              variant="outline"
              size="sm"
              :disabled="currentPage === totalPages"
              data-testid="pagination-next"
              @click="currentPage++"
            >
              Next
            </UButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

interface Phone {
  id: number;
  name: string;
  brand: string;
  price: number;
  ram: number;
  battery: number;
  image?: string;
  weight?: string;
  screen?: string;
  frontCamera?: string;
  backCamera?: string;
  processor?: string;
  year?: number;
}

onMounted(() => {
  document.title = 'Advanced Search - Mobile Phones';
  const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  const content =
    'Search and filter through comprehensive mobile phone database with specifications';
  if (existing) existing.content = content;
  else {
    const m = document.createElement('meta');
    m.name = 'description';
    m.content = content;
    document.head.appendChild(m);
  }
});

// Search state
const searchQuery = ref('');
const selectedBrand = ref('');
const ramMin = ref('');
const ramMax = ref('');
const currentPage = ref(1);
const itemsPerPage = 12;
const isLoading = ref(false);
const error = ref('');

// API data
const allPhones = ref<Phone[]>([]);
const totalItems = ref(0);

// Fetch phones from API
const fetchPhones = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const params = new URLSearchParams({
      search: searchQuery.value,
      brand: selectedBrand.value,
      ramMin: ramMin.value,
      ramMax: ramMax.value,
      page: currentPage.value.toString(),
      limit: itemsPerPage.toString(),
    });

    const response = await $fetch<{ products: any[]; total: number }>(`/api/products?${params}`);
    allPhones.value = response.products.map((product: any) => ({
      id: product.id,
      name: product.model,
      brand: product.company,
      price:
        product.price_usa ||
        product.price_dubai ||
        product.price_india ||
        product.price_pakistan ||
        product.price_china ||
        0,
      ram: parseInt(product.ram) || 0,
      battery: parseInt(product.battery) || 0,
      image: product.image_url,
      weight: product.weight,
      screen: product.screen_size,
      frontCamera: product.front_camera,
      backCamera: product.back_camera,
      processor: product.processor,
      year: product.launched_year,
    }));
    totalItems.value = response.total;
  } catch (err) {
    error.value = 'Failed to load phones. Please try again.';
    console.error('Error fetching phones:', err);
  } finally {
    isLoading.value = false;
  }
};

// Watch for filter changes
watch([searchQuery, selectedBrand, ramMin, ramMax], () => {
  currentPage.value = 1;
  fetchPhones();
});

watch(currentPage, () => {
  fetchPhones();
});

// Initial load
onMounted(() => {
  fetchPhones();
});

// Computed properties for display
const phones = computed(() => allPhones.value);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

// Brand options - we'll need to fetch these separately or from current results
const brands = computed(() => {
  const uniqueBrands = [...new Set(allPhones.value.map((phone) => phone.brand))];
  return uniqueBrands.map((brand) => ({ label: brand, value: brand }));
});

// Handle image loading errors
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(img.alt || 'Phone')}`;
};
</script>
