<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
  >
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-3">Advanced Search</h1>
          <p class="text-xl text-gray-600 dark:text-gray-400">
            Search mobile phones by multiple criteria
          </p>
        </div>

        <!-- Search Form -->
        <UCard class="mb-8">
          <template #header>
            <h2 class="text-2xl font-semibold">Search Filters</h2>
          </template>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <!-- Brand Filter -->
              <UFormGroup label="Brand(s)">
                <USelectMenu
                  v-model="filters.brands"
                  :options="availableBrands"
                  multiple
                  searchable
                  placeholder="Select brands"
                />
              </UFormGroup>

              <!-- Price Range -->
              <UFormGroup label="Price Range ($)">
                <div class="flex gap-2">
                  <UInput
                    v-model.number="filters.minPrice"
                    type="number"
                    placeholder="Min"
                    icon="i-heroicons-currency-dollar"
                  />
                  <UInput
                    v-model.number="filters.maxPrice"
                    type="number"
                    placeholder="Max"
                    icon="i-heroicons-currency-dollar"
                  />
                </div>
              </UFormGroup>

              <!-- RAM Range -->
              <UFormGroup label="RAM (GB)">
                <div class="flex gap-2">
                  <UInput
                    v-model.number="filters.minRam"
                    type="number"
                    placeholder="Min"
                    min="1"
                    max="24"
                  />
                  <UInput
                    v-model.number="filters.maxRam"
                    type="number"
                    placeholder="Max"
                    min="1"
                    max="24"
                  />
                </div>
              </UFormGroup>

              <!-- Battery Range -->
              <UFormGroup label="Battery (mAh)">
                <div class="flex gap-2">
                  <UInput
                    v-model.number="filters.minBattery"
                    type="number"
                    placeholder="Min"
                    min="1000"
                  />
                  <UInput
                    v-model.number="filters.maxBattery"
                    type="number"
                    placeholder="Max"
                    max="10000"
                  />
                </div>
              </UFormGroup>

              <!-- Screen Size Range -->
              <UFormGroup label="Screen Size (inches)">
                <div class="flex gap-2">
                  <UInput
                    v-model.number="filters.minScreen"
                    type="number"
                    placeholder="Min"
                    min="3"
                    max="10"
                    step="0.1"
                  />
                  <UInput
                    v-model.number="filters.maxScreen"
                    type="number"
                    placeholder="Max"
                    min="3"
                    max="10"
                    step="0.1"
                  />
                </div>
              </UFormGroup>

              <!-- Year Filter -->
              <UFormGroup label="Year(s)">
                <USelectMenu
                  v-model="filters.years"
                  :options="yearOptions"
                  multiple
                  searchable
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Select years"
                />
              </UFormGroup>

              <!-- Storage Range -->
              <UFormGroup label="Storage (GB)">
                <div class="flex gap-2">
                  <UInput
                    v-model.number="filters.minStorage"
                    type="number"
                    placeholder="Min"
                    min="32"
                  />
                  <UInput
                    v-model.number="filters.maxStorage"
                    type="number"
                    placeholder="Max"
                    max="2048"
                  />
                </div>
              </UFormGroup>

              <!-- Processor Filter -->
              <UFormGroup label="Processor">
                <UInput v-model="filters.processor" placeholder="e.g., A17, Snapdragon" />
              </UFormGroup>

              <!-- Model Name Filter -->
              <UFormGroup label="Model Name">
                <USelectMenu
                  v-model="filters.modelName"
                  :options="availableModels"
                  searchable
                  :disabled="filters.brands.length === 0"
                  placeholder="Select a model (choose brand first)"
                />
              </UFormGroup>

              <!-- Sort Options -->
              <UFormGroup label="Sort By">
                <USelect
                  v-model="sortBy"
                  :options="sortOptions"
                  option-attribute="label"
                  value-attribute="value"
                />
              </UFormGroup>

              <UFormGroup label="Sort Order">
                <USelect
                  v-model="sortOrder"
                  :options="[
                    { label: 'Ascending', value: 'asc' },
                    { label: 'Descending', value: 'desc' },
                  ]"
                  option-attribute="label"
                  value-attribute="value"
                />
              </UFormGroup>
            </div>

            <div class="flex gap-4">
              <UButton
                @click="searchModels"
                :loading="loading"
                color="primary"
                size="lg"
                icon="i-heroicons-magnifying-glass"
              >
                Search
              </UButton>
              <UButton
                @click="resetFilters"
                color="gray"
                size="lg"
                variant="outline"
                icon="i-heroicons-arrow-path"
              >
                Reset
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Error State -->
        <UAlert v-if="error" color="red" variant="soft" :title="error" class="mb-6" />

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-12 h-12 mx-auto text-gray-400 animate-spin mb-4"
          />
          <p class="text-gray-600 dark:text-gray-400">Searching...</p>
        </div>

        <!-- Results -->
        <div v-if="results && !loading">
          <!-- Summary -->
          <UCard class="mb-6">
            <div class="p-6">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-2xl font-bold">{{ results.filteredCount }} Models Found</h3>
                  <p class="text-gray-600 dark:text-gray-400">
                    Showing {{ results.models.length }} of {{ results.totalCount }} results
                  </p>
                </div>
                <div v-if="results.pagination.hasMore" class="text-sm text-gray-500">
                  Page {{ Math.floor(results.pagination.offset / results.pagination.limit) + 1 }}
                </div>
              </div>
            </div>
          </UCard>

          <!-- Selection Controls -->
          <UCard class="mb-6" v-if="selectedModelsForComparison.length > 0">
            <div class="p-4">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-4">
                  <span class="font-semibold"
                    >{{ selectedModelsForComparison.length }} models selected</span
                  >
                  <div class="flex gap-2">
                    <UButton
                      @click="compareSelectedModels"
                      color="primary"
                      icon="i-heroicons-scale"
                      size="sm"
                    >
                      Compare Selected
                    </UButton>
                    <UButton
                      @click="clearModelSelection"
                      color="gray"
                      variant="outline"
                      size="sm"
                      icon="i-heroicons-x-mark"
                    >
                      Clear Selection
                    </UButton>
                  </div>
                </div>
                <div class="text-sm text-gray-500">Maximum 5 models can be compared</div>
              </div>
            </div>
          </UCard>

          <!-- Models Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <UCard
              v-for="model in results.models"
              :key="`${model.company}-${model.modelName}`"
              class="hover:shadow-lg transition-shadow"
              :class="{ 'ring-2 ring-primary': isModelSelected(model) }"
            >
              <!-- Selection Checkbox -->
              <div class="absolute top-3 left-3 z-10">
                <UCheckbox
                  :model-value="isModelSelected(model)"
                  @update:model-value="(selected: boolean) => toggleModelSelection(model, selected)"
                  :disabled="!isModelSelected(model) && selectedModelsForComparison.length >= 5"
                />
              </div>

              <template #header>
                <div class="flex justify-between items-start pl-8">
                  <div
                    class="flex-1 cursor-pointer"
                    @click="navigateTo(`/model/${encodeURIComponent(model.modelName)}`)"
                  >
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                      {{ model.modelName }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ model.company }}</p>
                  </div>
                  <UBadge color="primary" variant="soft" size="lg">
                    ${{ model.price.toLocaleString() }}
                  </UBadge>
                </div>
              </template>
              <div class="p-4">
                <!-- Model Image -->
                <div v-if="model.imageUrl" class="mb-4">
                  <img
                    :src="model.imageUrl"
                    :alt="model.modelName"
                    class="w-full h-48 object-contain rounded-lg bg-gray-100 dark:bg-gray-800"
                    @error="handleImageError"
                  />
                </div>

                <!-- Core Specs -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">RAM</div>
                    <div class="font-semibold">{{ model.ram }} GB</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Battery</div>
                    <div class="font-semibold">{{ model.battery }} mAh</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Screen</div>
                    <div class="font-semibold">{{ model.screenSize }}"</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Year</div>
                    <div class="font-semibold">{{ model.year }}</div>
                  </div>
                </div>

                <!-- Additional Specs -->
                <div
                  v-if="model.storage || model.processor"
                  class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                >
                  <div class="space-y-1">
                    <div v-if="model.storage" class="text-xs">
                      <span class="text-gray-500 dark:text-gray-400">Storage:</span>
                      <span class="font-semibold ml-1">{{ model.storage }} GB</span>
                    </div>
                    <div v-if="model.processor" class="text-xs">
                      <span class="text-gray-500 dark:text-gray-400">Processor:</span>
                      <span class="font-semibold ml-1">{{ model.processor }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Pagination -->
          <div
            v-if="results.pagination.hasMore || results.pagination.offset > 0"
            class="flex justify-center gap-4"
          >
            <UButton
              @click="loadPreviousPage"
              :disabled="results.pagination.offset === 0"
              color="gray"
              variant="outline"
              icon="i-heroicons-arrow-left"
            >
              Previous
            </UButton>
            <UButton
              @click="loadNextPage"
              :disabled="!results.pagination.hasMore"
              color="primary"
              icon="i-heroicons-arrow-right"
              trailing
            >
              Next
            </UButton>
          </div>

          <!-- Empty State -->
          <UCard v-if="results.models.length === 0" class="mt-6">
            <div class="text-center py-12">
              <UIcon
                name="i-heroicons-magnifying-glass"
                class="w-16 h-16 mx-auto text-gray-400 mb-4"
              />
              <p class="text-gray-600 dark:text-gray-400">
                No models found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          </UCard>
        </div>

        <!-- Empty State (No Search) -->
        <UCard v-if="!results && !loading" class="mt-6">
          <div class="text-center py-12">
            <UIcon name="i-heroicons-funnel" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p class="text-gray-600 dark:text-gray-400">
              Use the filters above to search for mobile phones
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PhoneModel {
  modelName: string
  company: string
  price: number
  ram: number
  battery: number
  screenSize: number
  weight: number
  year: number
  frontCamera?: number
  backCamera?: number
  storage?: number
  processor?: string
  displayType?: string
  refreshRate?: number
  resolution?: string
  imageUrl?: string
}

interface SearchResponse {
  models: PhoneModel[]
  totalCount: number
  filteredCount: number
  filters: any
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

const filters = ref({
  brands: [] as string[],
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  minRam: undefined as number | undefined,
  maxRam: undefined as number | undefined,
  minBattery: undefined as number | undefined,
  maxBattery: undefined as number | undefined,
  minScreen: undefined as number | undefined,
  maxScreen: undefined as number | undefined,
  years: [] as number[],
  minStorage: undefined as number | undefined,
  maxStorage: undefined as number | undefined,
  processor: undefined as string | undefined,
  modelName: undefined as string | undefined,
})

const sortBy = ref('price')
const sortOrder = ref<'asc' | 'desc'>('asc')
const loading = ref(false)
const error = ref<string | null>(null)
const results = ref<SearchResponse | null>(null)
const currentOffset = ref(0)
const limit = 20

// Model selection for comparison
const selectedModelsForComparison = ref<string[]>([])

// Available models for selected brands
const availableModels = ref<string[]>([])

// Available brands (you can fetch this from API or hardcode)
const availableBrands = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'OnePlus',
  'Google',
  'Realme',
  'Oppo',
  'Vivo',
  'Huawei',
  'Sony',
  'Motorola',
  'Nokia',
  'Nothing',
  'Asus',
  'LG',
  'Tecno',
  'Infinix',
  'POCO',
  'Redmi',
]

// Year options - converted to objects for USelectMenu
const yearOptions = [
  { label: '2025', value: 2025 },
  { label: '2024', value: 2024 },
  { label: '2023', value: 2023 },
  { label: '2022', value: 2022 },
  { label: '2021', value: 2021 },
  { label: '2020', value: 2020 },
  { label: '2019', value: 2019 },
  { label: '2018', value: 2018 },
  { label: '2017', value: 2017 },
  { label: '2016', value: 2016 },
  { label: '2015', value: 2015 },
]

const sortOptions = [
  { label: 'Price', value: 'price' },
  { label: 'RAM', value: 'ram' },
  { label: 'Battery', value: 'battery' },
  { label: 'Screen Size', value: 'screen' },
  { label: 'Year', value: 'year' },
]

// Fetch available models for selected brands
const fetchAvailableModels = async (brands: string[]) => {
  if (brands.length === 0) {
    availableModels.value = []
    filters.value.modelName = undefined
    return
  }

  try {
    const params = brands.map(brand => `brands=${encodeURIComponent(brand)}`).join('&')
    const models = await $fetch<string[]>(
      `http://localhost:8000/api/dataset/models-by-company?${params}`
    )
    availableModels.value = models
  } catch (err) {
    console.error('Error fetching models:', err)
    availableModels.value = []
  }
}

// Watch for brand changes and update available models
watch(
  () => filters.value.brands,
  async (newBrands: string[]) => {
    await fetchAvailableModels(newBrands)
  },
  { deep: true }
)

const searchModels = async (offset = 0) => {
  loading.value = true
  error.value = null
  currentOffset.value = offset

  try {
    const searchParams = new URLSearchParams()
    searchParams.append('sortBy', sortBy.value)
    searchParams.append('sortOrder', sortOrder.value)
    searchParams.append('limit', limit.toString())
    searchParams.append('offset', offset.toString())

    if (filters.value.brands.length > 0) {
      filters.value.brands.forEach((b: string) => searchParams.append('brand', b))
    }
    if (filters.value.minPrice != undefined)
      searchParams.append('minPrice', filters.value.minPrice.toString())
    if (filters.value.maxPrice != undefined)
      searchParams.append('maxPrice', filters.value.maxPrice.toString())
    if (filters.value.minRam != undefined)
      searchParams.append('minRam', filters.value.minRam.toString())
    if (filters.value.maxRam != undefined)
      searchParams.append('maxRam', filters.value.maxRam.toString())
    if (filters.value.minBattery != undefined)
      searchParams.append('minBattery', filters.value.minBattery.toString())
    if (filters.value.maxBattery != undefined)
      searchParams.append('maxBattery', filters.value.maxBattery.toString())
    if (filters.value.minScreen != undefined)
      searchParams.append('minScreen', filters.value.minScreen.toString())
    if (filters.value.maxScreen != undefined)
      searchParams.append('maxScreen', filters.value.maxScreen.toString())
    if (filters.value.years.length > 0) {
      filters.value.years.forEach((y: number) => searchParams.append('year', y.toString()))
    }
    if (filters.value.minStorage != undefined)
      searchParams.append('minStorage', filters.value.minStorage.toString())
    if (filters.value.maxStorage != undefined)
      searchParams.append('maxStorage', filters.value.maxStorage.toString())
    if (filters.value.processor) searchParams.append('processor', filters.value.processor)
    if (filters.value.modelName) searchParams.append('modelName', filters.value.modelName)

    const data = await $fetch<SearchResponse>(
      `http://localhost:8000/api/dataset/search?${searchParams.toString()}`
    )
    results.value = data
  } catch (err: any) {
    error.value = err.message || 'Failed to search models'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    brands: [],
    minPrice: undefined,
    maxPrice: undefined,
    minRam: undefined,
    maxRam: undefined,
    minBattery: undefined,
    maxBattery: undefined,
    minScreen: undefined,
    maxScreen: undefined,
    years: [],
    minStorage: undefined,
    maxStorage: undefined,
    processor: undefined,
    modelName: undefined,
  }
  sortBy.value = 'price'
  sortOrder.value = 'asc'
  results.value = null
  currentOffset.value = 0
}

const loadNextPage = () => {
  if (results.value && results.value.pagination.hasMore) {
    searchModels(results.value.pagination.offset + limit)
  }
}

const loadPreviousPage = () => {
  if (results.value && results.value.pagination.offset >= limit) {
    searchModels(results.value.pagination.offset - limit)
  }
}

// Model selection functions
const isModelSelected = (model: PhoneModel) => {
  return selectedModelsForComparison.value.includes(model.modelName)
}

const toggleModelSelection = (model: PhoneModel, selected: boolean) => {
  if (selected) {
    if (
      selectedModelsForComparison.value.length < 5 &&
      !selectedModelsForComparison.value.includes(model.modelName)
    ) {
      selectedModelsForComparison.value.push(model.modelName)
    }
  } else {
    const index = selectedModelsForComparison.value.indexOf(model.modelName)
    if (index > -1) {
      selectedModelsForComparison.value.splice(index, 1)
    }
  }
}

const clearModelSelection = () => {
  selectedModelsForComparison.value = []
}

const compareSelectedModels = () => {
  if (selectedModelsForComparison.value.length >= 2) {
    // Store in localStorage for the compare page
    localStorage.setItem('comparison', JSON.stringify(selectedModelsForComparison.value))
    // Navigate to compare page
    navigateTo('/compare')
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Set page metadata
useHead({
  title: 'Advanced Search - Mobile Finder',
  meta: [
    {
      name: 'description',
      content:
        'Search mobile phones by multiple criteria including brand, price, RAM, battery, and more',
    },
  ],
})
</script>
