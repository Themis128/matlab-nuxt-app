<template>
  <div class="min-h-screen bg-base-200">
    <!-- Top Header with Search -->
    <header class="sticky top-0 z-40 border-b border-base-300 bg-base-100 shadow-sm">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between gap-4">
          <!-- Logo/Title -->
          <div class="flex items-center gap-3">
            <Icon name="heroicons:device-phone-mobile" class="h-8 w-8 text-primary" />
            <div>
              <h1 class="text-lg font-bold text-base-content">Device Browser</h1>
              <p class="text-xs opacity-70">Explore mobile phones</p>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="max-w-2xl flex-1">
            <DInput
              v-model="searchQuery"
              placeholder="Search by name, brand, model..."
              icon="heroicons:magnifying-glass"
              size="lg"
              @update:model-value="handleSearch"
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <DButton variant="ghost"
icon="heroicons:scale" @click="navigateTo('/compare')">
              Compare
            </DButton>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex gap-6">
        <!-- Sidebar Filters -->
        <aside class="hidden w-64 flex-shrink-0 lg:block">
          <div class="sticky top-24 rounded-lg border border-base-300 bg-base-100 p-4 shadow-lg">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-base-content">Filters</h2>
              <DButton v-if="hasActiveFilters" size="xs" variant="ghost" @click="clearFilters">
                Clear
              </DButton>
            </div>

            <!-- Filter Slot -->
            <slot name="filters">
              <!-- Default filters if none provided -->
              <div class="space-y-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-base-content"> Brand </label>
                  <DSelect
                    v-model="filters.brand"
                    placeholder="All Brands"
                    :options="brandOptions"
                    @update:model-value="handleFilterChange"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-base-content"> RAM (GB) </label>
                  <DSelect
                    v-model="filters.ram"
                    placeholder="All RAM"
                    :options="ramOptions"
                    @update:model-value="handleFilterChange"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-base-content">
                    Price Range
                  </label>
                  <div class="grid grid-cols-2 gap-2">
                    <DInput v-model="filters.minPrice"
placeholder="Min" type="number" size="sm" />
                    <DInput v-model="filters.maxPrice"
placeholder="Max" type="number" size="sm" />
                  </div>
                </div>
              </div>
            </slot>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="min-w-0 flex-1">
          <!-- View Controls -->
          <div class="mb-6 flex items-center justify-between">
            <div class="text-sm opacity-70">
              <span class="font-semibold text-base-content">{{ totalResults || 0 }}</span>
              devices found
            </div>
            <div class="flex items-center gap-2">
              <!-- View Toggle -->
              <div class="flex rounded-lg border border-base-300 p-1">
                <DButton
                  :variant="viewMode === 'grid' ? 'primary' : 'ghost'"
                  size="sm"
                  icon="heroicons:squares-2x2"
                  @click="viewMode = 'grid'"
                />
                <DButton
                  :variant="viewMode === 'list' ? 'primary' : 'ghost'"
                  size="sm"
                  icon="heroicons:bars-3"
                  @click="viewMode = 'list'"
                />
              </div>
              <!-- Sort -->
              <DSelect v-model="sortBy"
:options="sortOptions" size="sm" class="w-40" />
            </div>
          </div>

          <!-- Mobile Filters Button -->
          <DButton
            class="mb-4 w-full lg:hidden"
            variant="outline"
            icon="heroicons:funnel"
            @click="mobileFiltersOpen = true"
          >
            Filters
            <span
              v-if="hasActiveFilters"
              class="badge badge-primary badge-sm absolute -right-1 -top-1"
            >
              {{ activeFilterCount }}
            </span>
          </DButton>

          <!-- Content Slot -->
          <div
            :class="[
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-4',
            ]"
          >
            <slot />
          </div>

          <!-- Pagination Slot -->
          <div class="mt-8">
            <slot name="pagination" />
          </div>
        </main>
      </div>
    </div>

    <!-- Mobile Filters Drawer -->
    <div
      :class="['drawer drawer-end lg:hidden', { 'drawer-open': mobileFiltersOpen }]"
      @click.self="mobileFiltersOpen = false"
    >
      <input id="drawer-toggle"
v-model="mobileFiltersOpen" type="checkbox" class="drawer-toggle"
/>
      <div class="drawer-side">
        <label
for="drawer-toggle" class="drawer-overlay" />
        <div class="drawer-content flex flex-col bg-base-100 p-4">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold">Filters</h2>
            <DButton v-if="hasActiveFilters" size="xs" variant="ghost" @click="clearFilters">
              Clear All
            </DButton>
            <DButton
              size="xs"
              variant="ghost"
              icon="heroicons:x-mark"
              @click="mobileFiltersOpen = false"
            >
              Close
            </DButton>
          </div>
          <slot name="filters" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref('');
const viewMode = ref<'grid' | 'list'>('grid');
const sortBy = ref('relevance');
const mobileFiltersOpen = ref(false);

const filters = ref({
  brand: null,
  ram: null,
  minPrice: null,
  maxPrice: null,
});

const brandOptions = [
  { label: 'All Brands', value: null },
  { label: 'Apple', value: 'Apple' },
  { label: 'Samsung', value: 'Samsung' },
  { label: 'Xiaomi', value: 'Xiaomi' },
  { label: 'Huawei', value: 'Huawei' },
  { label: 'OnePlus', value: 'OnePlus' },
].map((opt) => ({ label: opt.label, value: opt.value }));

const ramOptions = [
  { label: 'All RAM', value: null },
  { label: '4 GB', value: 4 },
  { label: '6 GB', value: 6 },
  { label: '8 GB', value: 8 },
  { label: '12 GB', value: 12 },
  { label: '16 GB', value: 16 },
].map((opt) => ({ label: opt.label, value: opt.value }));

const sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Name: A-Z', value: 'name-asc' },
].map((opt) => ({ label: opt.label, value: opt.value }));

const totalResults = defineModel<number>('totalResults', { default: 0 });

const hasActiveFilters = computed(() => {
  return (
    filters.value.brand || filters.value.ram || filters.value.minPrice || filters.value.maxPrice
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.brand) count++;
  if (filters.value.ram) count++;
  if (filters.value.minPrice || filters.value.maxPrice) count++;
  return count;
});

const handleSearch = () => {
  // Emit search event
  emit('search', searchQuery.value);
};

const handleFilterChange = () => {
  // Emit filter change event
  emit('filter-change', filters.value);
};

const clearFilters = () => {
  filters.value = {
    brand: null,
    ram: null,
    minPrice: null,
    maxPrice: null,
  };
  handleFilterChange();
};

const emit = defineEmits<{
  search: [query: string];
  'filter-change': [filters: typeof filters.value];
}>();

// Expose filters for parent components
defineExpose({
  filters,
  searchQuery,
  viewMode,
  sortBy,
});
</script>
