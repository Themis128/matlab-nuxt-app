<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8 text-center">
          <div class="inline-block mb-4">
            <UIcon name="i-heroicons-currency-dollar" class="w-16 h-16 text-primary-600 dark:text-primary-400" />
          </div>
          <h1
            class="text-5xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Recommendations
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400">
            Enter your budget and discover mobile models from all brands with their specifications
          </p>
        </div>

        <!-- Search Form -->
        <UCard class="mb-8">
          <template #header>
            <h2 class="text-2xl font-semibold">Search by Price</h2>
          </template>
          <div class="p-6">
            <form @submit.prevent=" searchModels ">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (USD)
                  </label>
                  <UInput v-model=" searchPrice " type="number" placeholder="e.g., 500" size="lg"
                    icon="i-heroicons-currency-dollar" :min=" 0 " :step=" 10 " />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Tolerance ({{ ( tolerance * 100 ).toFixed( 0 ) }}%)
                  </label>
                  <URange v-model=" tolerance " :min=" 0.05 " :max=" 0.5 " :step=" 0.05 " class="mt-2" />
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5%</span>
                    <span>50%</span>
                  </div>
                </div>
                <div class="flex items-end">
                  <UButton @click=" searchModels " :loading=" loading " size="lg" color="primary" block
                    icon="i-heroicons-magnifying-glass">
                    Recommend
                  </UButton>
                </div>
              </div>
            </form>
            <div v-if=" priceRange " class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Searching for models between
                <span class="font-semibold">${{ priceRange.min.toFixed( 2 ) }}</span> and
                <span class="font-semibold">${{ priceRange.max.toFixed( 2 ) }}</span>
              </p>
            </div>
          </div>
        </UCard>

        <!-- Error State -->
        <UAlert v-if=" error " color="red" variant="soft" :title=" error " class="mb-6" />

        <!-- Loading State -->
        <div v-if=" loading " class="text-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 mx-auto text-gray-400 animate-spin mb-4" />
          <p class="text-gray-600 dark:text-gray-400">Searching for models...</p>
        </div>

        <!-- Results -->
        <div v-if=" results && !loading ">
          <!-- Summary -->
          <UCard class="mb-6">
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="text-3xl font-bold text-primary">{{ results.totalCount }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Total Models Found</div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold text-green-600">{{ results.brands.length }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Brands Available</div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold text-purple-600">{{ filteredModels.length }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Models Displayed</div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Brands Filter -->
          <UCard class="mb-6" v-if=" results.brands.length > 0 ">
            <template #header>
              <h3 class="text-lg font-semibold">Filter by Brand</h3>
            </template>
            <div class="p-4">
              <div class="flex flex-wrap gap-2">
                <UBadge v-for=" brand in results.brands " :key=" brand "
                  :color=" selectedBrands.includes( brand ) ? 'primary' : 'gray' " variant="soft" size="lg"
                  class="cursor-pointer" @click="toggleBrand( brand )">
                  {{ brand }}
                </UBadge>
              </div>
            </div>
          </UCard>

          <!-- Models Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard v-for=" model in filteredModels " :key=" `${ model.company }-${ model.modelName }` "
              class="hover:shadow-xl transition-all duration-300 hover:scale-105">
              <template #header>
                <!-- Phone Image -->
                <div class="relative mb-4">
                  <div v-if=" getImagePath( model ) "
                    class="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                    <img :src=" getImagePath( model ) " :alt=" `${ model.company } ${ model.modelName }` "
                      class="w-full h-full object-contain p-4" @error=" handleImageError " />
                  </div>
                  <div v-else
                    class="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                    <UIcon name="i-heroicons-device-phone-mobile" class="w-16 h-16 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                <div class="flex justify-between items-start">
                  <div>
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
              <div class="p-4 space-y-3">
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
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Weight</div>
                    <div class="font-semibold">{{ model.weight }}g</div>
                  </div>
                </div>

                <!-- Additional Specs -->
                <div v-if=" model.frontCamera || model.backCamera || model.storage "
                  class="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div class="grid grid-cols-2 gap-3">
                    <div v-if=" model.frontCamera ">
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Front Camera</div>
                      <div class="font-semibold">{{ model.frontCamera }} MP</div>
                    </div>
                    <div v-if=" model.backCamera ">
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Back Camera</div>
                      <div class="font-semibold">{{ model.backCamera }} MP</div>
                    </div>
                    <div v-if=" model.storage ">
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Storage</div>
                      <div class="font-semibold">{{ model.storage }} GB</div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Year</div>
                      <div class="font-semibold">{{ model.year }}</div>
                    </div>
                  </div>
                </div>

                <!-- Processor & Display -->
                <div v-if=" model.processor || model.displayType || model.refreshRate "
                  class="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div class="space-y-2">
                    <div v-if=" model.processor ">
                      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Processor</div>
                      <div class="font-semibold text-sm">{{ model.processor }}</div>
                    </div>
                    <div v-if=" model.displayType " class="flex items-center gap-2">
                      <span class="text-xs text-gray-500 dark:text-gray-400">Display:</span>
                      <span class="font-semibold text-sm">{{ model.displayType }}</span>
                    </div>
                    <div v-if=" model.refreshRate " class="flex items-center gap-2">
                      <span class="text-xs text-gray-500 dark:text-gray-400">Refresh Rate:</span>
                      <span class="font-semibold text-sm">{{ model.refreshRate }} Hz</span>
                    </div>
                    <div v-if=" model.resolution " class="flex items-center gap-2">
                      <span class="text-xs text-gray-500 dark:text-gray-400">Resolution:</span>
                      <span class="font-semibold text-sm">{{ model.resolution }}</span>
                    </div>
                  </div>
                </div>

                <!-- Price Difference Indicator -->
                <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500 dark:text-gray-400">Price Difference</span>
                    <UBadge
                      :color=" searchPrice && Math.abs( model.price - searchPrice ) < searchPrice * 0.1 ? 'green' : 'yellow' "
                      variant="soft" size="xs">
                      {{ searchPrice && ( model.price > searchPrice ? '+' : '' ) }}${{ searchPrice ? ( model.price -
                        searchPrice ).toFixed( 0 ) : '0' }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Empty State -->
          <UCard v-if=" filteredModels.length === 0 " class="mt-6">
            <div class="text-center py-12">
              <UIcon name="i-heroicons-magnifying-glass" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p class="text-gray-600 dark:text-gray-400">
                No models found matching the selected brands. Try selecting different brands.
              </p>
            </div>
          </UCard>
        </div>

        <!-- Empty State (No Search) -->
        <UCard v-if=" !results && !loading " class="mt-6">
          <div class="text-center py-12">
            <UIcon name="i-heroicons-currency-dollar" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p class="text-gray-600 dark:text-gray-400">
              Enter a price above to find matching mobile models from all brands
            </p>
          </div>
        </UCard>

        <!-- Quick Actions -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <UButton to="/search" color="primary" size="xl" block icon="i-heroicons-funnel">
            Advanced Search
          </UButton>
          <UButton to="/compare" color="green" size="xl" block icon="i-heroicons-scale">
            Compare Models
          </UButton>
          <UButton to="/" color="gray" size="xl" block icon="i-heroicons-home" variant="outline">
            Home
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface PhoneModel
  {
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
  }

  interface ModelsByPriceResponse
  {
    models: PhoneModel[]
    totalCount: number
    priceRange: {
      min: number
      max: number
      requested: number
      tolerance: number
    }
    brands: string[]
  }

  const searchPrice = ref<number | undefined>( undefined )
  const tolerance = ref( 0.2 ) // 20% default
  const loading = ref( false )
  const error = ref<string | null>( null )
  const results = ref<ModelsByPriceResponse | null>( null )
  const selectedBrands = ref<string[]>( [] )
  const priceRange = computed( () => results.value?.priceRange )

  const searchModels = async () =>
  {
    // For testing purposes, always use a default price if none is provided
    if ( !searchPrice.value || searchPrice.value <= 0 )
    {
      searchPrice.value = 500
    }

    loading.value = true
    error.value = null
    results.value = null
    selectedBrands.value = []

    try
    {
      const data = await $fetch<ModelsByPriceResponse>( '/api/dataset/models-by-price', {
        params: {
          price: searchPrice.value,
          tolerance: tolerance.value,
          maxResults: 100
        }
      } )
      results.value = data
      // Clear any previous errors
      error.value = null

      // Select all brands by default if we have results
      if ( data.brands.length > 0 )
      {
        selectedBrands.value = [ ...data.brands ]
      } else
      {
        selectedBrands.value = []
      }

      // Show helpful message if no results
      if ( data.totalCount === 0 )
      {
        error.value = `No models found in the price range $${ data.priceRange.min.toFixed( 2 ) } - $${ data.priceRange.max.toFixed( 2 ) }. Try adjusting the price tolerance or search with a different price.`
      } else
      {
        // Clear error if we have results
        error.value = null
      }
    } catch ( err: any )
    {
      error.value = err.message || 'Failed to search models'
      console.error( 'Error:', err )
    } finally
    {
      loading.value = false
    }
  }

  const toggleBrand = ( brand: string ) =>
  {
    const index = selectedBrands.value.indexOf( brand )
    if ( index > -1 )
    {
      selectedBrands.value.splice( index, 1 )
    } else
    {
      selectedBrands.value.push( brand )
    }
  }

  const filteredModels = computed( () =>
  {
    if ( !results.value || !results.value.models ) return []

    // If no brands are selected but we have brands available, show all models
    // This handles the case where selectedBrands might be empty initially
    if ( selectedBrands.value.length === 0 )
    {
      return results.value.models
    }

    // Filter by selected brands
    return results.value.models.filter( model => selectedBrands.value.includes( model.company ) )
  } )

  // Get image path for a model
  const getImagePath = ( model: PhoneModel ): string | undefined =>
  {
    // Construct image path based on model name (matching scraper output format)
    const sanitizedName = `${ model.company } ${ model.modelName }`
      .replace( /[<>:"/\\|?*]/g, '_' )
      .replace( /\s+/g, '_' )
      .substring( 0, 100 )

    // Try different possible paths (matching scraper output)
    const possiblePaths = [
      `/mobile_images/${ sanitizedName }/${ sanitizedName }_1.jpg`,
      `/mobile_images/${ sanitizedName }/${ sanitizedName }_2.jpg`,
      `/mobile_images/${ sanitizedName }/${ sanitizedName }_3.jpg`
    ]

    // Return first path (browser will handle 404 if image doesn't exist)
    return possiblePaths[ 0 ]
  }

  // Handle image load errors
  const handleImageError = ( event: Event ) =>
  {
    const img = event.target as HTMLImageElement
    img.style.display = 'none'
  }

  // Set page metadata
  useHead( {
    title: 'Find Models by Price - Deep Learning',
    meta: [
      { name: 'description', content: 'Search for mobile phone models by price and compare specifications across all brands' }
    ]
  } )
</script>
