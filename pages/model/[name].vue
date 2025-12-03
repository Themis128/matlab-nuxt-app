<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
  >
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-12 h-12 mx-auto text-gray-400 animate-spin mb-4"
          />
          <p class="text-gray-600 dark:text-gray-400">Loading model details...</p>
        </div>

        <!-- Error State -->
        <UAlert v-if="error" color="red" variant="soft" :title="error" class="mb-6" />

        <!-- Model Details -->
        <div v-if="model && !loading">
          <!-- Header -->
          <div class="mb-8">
            <UButton
              @click="navigateTo('/search')"
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-left"
              class="mb-4"
            >
              Back to Search
            </UButton>
            <div class="flex flex-col md:flex-row gap-6">
              <!-- Model Image -->
              <div class="flex-shrink-0">
                <div
                  v-if="model.imageUrl"
                  class="w-full md:w-96 h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                >
                  <img
                    :src="model.imageUrl"
                    :alt="model.modelName"
                    class="w-full h-full object-contain"
                    @error="handleImageError"
                  />
                </div>
                <div
                  v-else
                  class="w-full md:w-96 h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
                >
                  <UIcon name="i-heroicons-device-phone-mobile" class="w-24 h-24 text-gray-400" />
                </div>
              </div>

              <!-- Model Info -->
              <div class="flex-1">
                <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {{ model.modelName }}
                </h1>
                <p class="text-2xl text-gray-600 dark:text-gray-400 mb-4">{{ model.company }}</p>
                <div class="text-4xl font-bold text-primary mb-6">
                  ${{ model.price.toLocaleString() }}
                </div>

                <!-- Quick Actions -->
                <div class="flex gap-4 mb-6">
                  <UButton @click="addToComparison" color="primary" icon="i-heroicons-scale">
                    Compare
                  </UButton>
                  <UButton
                    @click="findSimilar"
                    color="green"
                    variant="outline"
                    icon="i-heroicons-sparkles"
                  >
                    Find Similar
                  </UButton>
                  <UButton
                    @click="searchByPrice"
                    color="purple"
                    variant="outline"
                    icon="i-heroicons-currency-dollar"
                  >
                    Find by Price
                  </UButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Specifications -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Core Specifications -->
            <UCard>
              <template #header>
                <h2 class="text-2xl font-semibold">Core Specifications</h2>
              </template>
              <div class="p-6 space-y-4">
                <div
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">Price</span>
                  <span class="font-semibold text-lg">${{ model.price.toLocaleString() }}</span>
                </div>
                <div
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">RAM</span>
                  <span class="font-semibold">{{ model.ram }} GB</span>
                </div>
                <div
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">Battery</span>
                  <span class="font-semibold">{{ model.battery }} mAh</span>
                </div>
                <div
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">Screen Size</span>
                  <span class="font-semibold">{{ model.screenSize }}"</span>
                </div>
                <div
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">Weight</span>
                  <span class="font-semibold">{{ model.weight }}g</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-gray-600 dark:text-gray-400">Launch Year</span>
                  <span class="font-semibold">{{ model.year }}</span>
                </div>
              </div>
            </UCard>

            <!-- Additional Specifications -->
            <UCard>
              <template #header>
                <h2 class="text-2xl font-semibold">Additional Specifications</h2>
              </template>
              <div class="p-6 space-y-4">
                <div
                  v-if="model.storage"
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">Storage</span>
                  <span class="font-semibold">{{ model.storage }} GB</span>
                </div>
                <div
                  v-if="model.processor"
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">Processor</span>
                  <span class="font-semibold">{{ model.processor }}</span>
                </div>
                <div
                  v-if="model.frontCamera"
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">Front Camera</span>
                  <span class="font-semibold">{{ model.frontCamera }} MP</span>
                </div>
                <div
                  v-if="model.backCamera"
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">Back Camera</span>
                  <span class="font-semibold">{{ model.backCamera }} MP</span>
                </div>
                <div
                  v-if="model.displayType"
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">Display Type</span>
                  <span class="font-semibold">{{ model.displayType }}</span>
                </div>
                <div
                  v-if="model.refreshRate"
                  class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span class="text-gray-600 dark:text-gray-400">Refresh Rate</span>
                  <span class="font-semibold">{{ model.refreshRate }} Hz</span>
                </div>
                <div v-if="model.resolution" class="flex justify-between items-center py-2">
                  <span class="text-gray-600 dark:text-gray-400">Resolution</span>
                  <span class="font-semibold">{{ model.resolution }}</span>
                </div>
                <div
                  v-if="
                    !model.storage && !model.processor && !model.frontCamera && !model.backCamera
                  "
                  class="text-center py-4 text-gray-500"
                >
                  No additional specifications available
                </div>
              </div>
            </UCard>
          </div>

          <!-- Similar Models -->
          <UCard v-if="similarModels.length > 0" class="mb-8">
            <template #header>
              <h2 class="text-2xl font-semibold">Similar Models</h2>
            </template>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <UCard
                  v-for="similar in similarModels"
                  :key="similar.model.modelName"
                  class="hover:shadow-lg transition-shadow cursor-pointer"
                  @click="navigateTo(`/model/${encodeURIComponent(similar.model.modelName)}`)"
                >
                  <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <h3 class="font-bold text-gray-900 dark:text-white">
                          {{ similar.model.modelName }}
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          {{ similar.model.company }}
                        </p>
                      </div>
                      <UBadge
                        :color="similar.similarityScore > 80 ? 'green' : 'yellow'"
                        variant="soft"
                      >
                        {{ Math.round(similar.similarityScore) }}% match
                      </UBadge>
                    </div>
                    <div class="text-2xl font-bold text-primary mb-2">
                      ${{ similar.model.price.toLocaleString() }}
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span class="text-gray-500">RAM:</span>
                        <span class="font-semibold ml-1">{{ similar.model.ram }} GB</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Battery:</span>
                        <span class="font-semibold ml-1">{{ similar.model.battery }} mAh</span>
                      </div>
                    </div>
                  </div>
                </UCard>
              </div>
            </div>
          </UCard>
        </div>
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

  interface SimilarModel {
    model: PhoneModel
    similarityScore: number
  }

  const route = useRoute()
  const modelName = decodeURIComponent(route.params.name as string)

  const loading = ref(true)
  const error = ref<string | null>(null)
  const model = ref<PhoneModel | null>(null)
  const similarModels = ref<SimilarModel[]>([])

  const loadModel = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<PhoneModel>(`/api/dataset/model/${encodeURIComponent(modelName)}`)
      model.value = data

      // Automatically load similar models
      await loadSimilarModels()
    } catch (err: any) {
      error.value = err.message || 'Failed to load model details'
      console.error('Error:', err)
    } finally {
      loading.value = false
    }
  }

  const loadSimilarModels = async () => {
    if (!model.value) return

    try {
      const data = await $fetch<{ models: SimilarModel[] }>('/api/dataset/similar', {
        method: 'POST',
        body: {
          ram: model.value.ram,
          battery: model.value.battery,
          screenSize: model.value.screenSize,
          weight: model.value.weight,
          year: model.value.year,
          price: model.value.price,
          limit: 6,
        },
      })
      // Filter out the current model
      similarModels.value = data.models
        .filter(s => s.model.modelName !== model.value?.modelName)
        .slice(0, 6)
    } catch (err) {
      console.error('Error loading similar models:', err)
    }
  }

  const addToComparison = () => {
    // Store in localStorage or state management
    const comparison = JSON.parse(localStorage.getItem('comparison') || '[]')
    if (!comparison.includes(model.value?.modelName)) {
      comparison.push(model.value?.modelName)
      localStorage.setItem('comparison', JSON.stringify(comparison))
    }
    navigateTo('/compare')
  }

  const findSimilar = () => {
    if (model.value) {
      navigateTo(
        `/search?brand=${encodeURIComponent(model.value.company)}&minRam=${model.value.ram - 2}&maxRam=${model.value.ram + 2}`
      )
    }
  }

  const searchByPrice = () => {
    if (model.value) {
      navigateTo(`/recommendations?price=${model.value.price}`)
    }
  }

  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    img.style.display = 'none'
  }

  onMounted(() => {
    loadModel()
  })

  // Set page metadata
  useHead({
    title: model.value
      ? `${model.value.modelName} - Mobile Finder`
      : 'Model Details - Mobile Finder',
    meta: [
      {
        name: 'description',
        content: model.value
          ? `Complete specifications for ${model.value.modelName}`
          : 'View mobile phone model details',
      },
    ],
  })
</script>
