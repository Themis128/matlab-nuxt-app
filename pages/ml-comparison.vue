<template>
  <div
    class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
  >
    <div class="container-responsive section-spacing">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-responsive-xl font-bold text-gray-900 dark:text-white mb-3 gradient-text">
            ML Model Comparison
          </h1>
          <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            Compare performance across multiple machine learning models for price prediction
          </p>
        </div>

        <!-- Model Selection -->
        <UCard class="mb-8">
          <template #header>
            <h2 class="text-2xl font-semibold">🎯 Select ML Models to Compare</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose from our advanced machine learning models
            </p>
          </template>

          <div class="p-6">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              <div
                v-for="model in availableModels"
                :key="model.type"
                class="p-4 rounded-lg border-2 cursor-pointer transition-all"
                :class="
                  selectedModels.includes(model.type)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                "
                @click="toggleModelSelection(model.type)"
              >
                <div class="text-center">
                  <div class="text-2xl mb-2">{{ getModelIcon(model.category) }}</div>
                  <h3 class="font-semibold mb-1">{{ model.name }}</h3>
                  <p class="text-xs text-gray-600 dark:text-gray-400">{{ model.description }}</p>
                  <div
                    class="text-xs mt-2"
                    :class="model.available ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ model.available ? 'Available' : 'Unavailable' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-4 justify-center">
              <UButton
                @click="runComparison"
                :disabled="selectedModels.length < 2 || loading"
                :loading="loading"
                color="blue"
                icon="i-heroicons-beaker"
                size="lg"
              >
                Run Model Comparison
              </UButton>
              <UButton
                @click="clearSelection"
                color="gray"
                variant="outline"
                icon="i-heroicons-x-mark"
              >
                Clear Selection
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Phone Specifications Input -->
        <UCard class="mb-8" v-if="selectedModels.length >= 2">
          <template #header>
            <h2 class="text-2xl font-semibold">📱 Test Specifications</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Enter phone specifications to test model predictions
            </p>
          </template>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  RAM (GB)
                </label>
                <UInput
                  v-model="testSpecs.ram"
                  type="number"
                  min="1"
                  max="24"
                  step="0.5"
                  placeholder="8"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Battery (mAh)
                </label>
                <UInput
                  v-model="testSpecs.battery"
                  type="number"
                  min="2000"
                  max="7000"
                  placeholder="4500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Screen Size (inches)
                </label>
                <UInput
                  v-model="testSpecs.screen"
                  type="number"
                  min="4"
                  max="8"
                  step="0.1"
                  placeholder="6.5"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Weight (grams)
                </label>
                <UInput
                  v-model="testSpecs.weight"
                  type="number"
                  min="100"
                  max="300"
                  placeholder="180"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Launch Year
                </label>
                <UInput
                  v-model="testSpecs.year"
                  type="number"
                  min="2020"
                  max="2025"
                  placeholder="2023"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Brand/Company
                </label>
                <USelect
                  v-model="testSpecs.company"
                  :options="companyOptions"
                  placeholder="Select brand"
                />
              </div>
            </div>

            <div class="flex gap-4">
              <USelect v-model="currency" :options="currencyOptions" class="w-32" />
              <UButton
                @click="runComparison"
                :disabled="!canRunTest || loading"
                :loading="loading"
                color="green"
                icon="i-heroicons-play"
              >
                Test Models
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Error State -->
        <UAlert v-if="error" color="red" variant="soft" :title="error" class="mb-6" />

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <UIcon name="i-heroicons-cog" class="w-12 h-12 mx-auto text-blue-400 animate-spin mb-4" />
          <p class="text-gray-600 dark:text-gray-400">Running model comparison...</p>
        </div>

        <!-- Comparison Results -->
        <div v-if="comparisonResults && !loading">
          <!-- Performance Overview -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <UCard>
              <div class="text-center">
                <div class="text-3xl mb-2">🎯</div>
                <h3 class="text-lg font-semibold mb-1">Best Model</h3>
                <div class="text-xl font-bold text-green-600">
                  {{ comparisonResults.bestModel }}
                </div>
                <div class="text-sm text-gray-500">${{ comparisonResults.bestPrice }}</div>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div class="text-3xl mb-2">📊</div>
                <h3 class="text-lg font-semibold mb-1">Average Price</h3>
                <div class="text-xl font-bold text-blue-600">
                  ${{ comparisonResults.averagePrice }}
                </div>
                <div class="text-sm text-gray-500">{{ comparisonResults.priceRange }} range</div>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div class="text-3xl mb-2">⚖️</div>
                <h3 class="text-lg font-semibold mb-1">Consistency</h3>
                <div class="text-xl font-bold text-purple-600">
                  {{ comparisonResults.consistency }}%
                </div>
                <div class="text-sm text-gray-500">Prediction stability</div>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div class="text-3xl mb-2">⏱️</div>
                <h3 class="text-lg font-semibold mb-1">Processing Time</h3>
                <div class="text-xl font-bold text-orange-600">{{ processingTime }}ms</div>
                <div class="text-sm text-gray-500">Total comparison time</div>
              </div>
            </UCard>
          </div>

          <!-- Detailed Results Table -->
          <UCard class="mb-8">
            <template #header>
              <h2 class="text-2xl font-semibold">📋 Model Performance Details</h2>
            </template>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="text-left py-3 px-4 font-semibold">Model</th>
                    <th class="text-center py-3 px-4 font-semibold">Predicted Price</th>
                    <th class="text-center py-3 px-4 font-semibold">Category</th>
                    <th class="text-center py-3 px-4 font-semibold">Status</th>
                    <th class="text-center py-3 px-4 font-semibold">vs Best</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="result in comparisonResults.predictions"
                    :key="result.model_type"
                    class="border-b border-gray-100 dark:border-gray-800"
                    :class="
                      result.price === comparisonResults.bestPrice
                        ? 'bg-green-50 dark:bg-green-900/10'
                        : ''
                    "
                  >
                    <td class="py-3 px-4">
                      <div class="font-semibold">{{ result.model_name }}</div>
                      <div class="text-sm text-gray-500">{{ result.description }}</div>
                    </td>
                    <td class="text-center py-3 px-4">
                      <div class="font-bold text-lg">{{ currencySymbol }}{{ result.price }}</div>
                    </td>
                    <td class="text-center py-3 px-4">
                      <span
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        :class="getCategoryColor(result.category)"
                      >
                        {{ result.category }}
                      </span>
                    </td>
                    <td class="text-center py-3 px-4">
                      <span
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        :class="
                          result.price ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        "
                      >
                        {{ result.price ? 'Success' : 'Failed' }}
                      </span>
                    </td>
                    <td class="text-center py-3 px-4">
                      <div
                        v-if="result.price && result.price !== comparisonResults.bestPrice"
                        class="text-red-600 font-medium"
                      >
                        +${{ (result.price - comparisonResults.bestPrice).toFixed(2) }}
                      </div>
                      <div
                        v-else-if="result.price === comparisonResults.bestPrice"
                        class="text-green-600 font-bold"
                      >
                        Best
                      </div>
                      <div v-else class="text-gray-400">N/A</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>

          <!-- Performance Chart -->
          <UCard class="mb-8">
            <template #header>
              <h2 class="text-2xl font-semibold">📈 Price Prediction Distribution</h2>
            </template>

            <div class="h-64">
              <canvas ref="chartCanvas"></canvas>
            </div>
          </UCard>
        </div>

        <!-- Empty State -->
        <UCard v-if="!comparisonResults && !loading" class="mt-6">
          <div class="text-center py-12">
            <UIcon name="i-heroicons-beaker" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Select 2 or more ML models to compare their performance on price prediction
            </p>
            <div class="flex gap-4 justify-center">
              <UButton @click="selectAllAvailable" color="blue" variant="outline">
                Select All Available
              </UButton>
              <UButton @click="navigateTo('/advanced')" color="purple">
                View Advanced Models
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

// Type definitions
interface Model {
  type: string
  name: string
  description: string
  category: string
  available: boolean
}

interface PredictionResult {
  model_type: string
  model_name: string
  description: string
  category: string
  price: number | null
}

interface ComparisonResults {
  predictions: PredictionResult[]
  bestModel: string
  bestPrice: number
  averagePrice: number
  priceRange: number
  consistency: number
}

// Model data
const availableModels = ref<Model[]>([])
const selectedModels = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const comparisonResults = ref<ComparisonResults | null>(null)
const processingTime = ref(0)

// Test specifications
const testSpecs = ref({
  ram: '8',
  battery: '4500',
  screen: '6.5',
  weight: '180',
  year: '2023',
  company: 'Samsung',
})

// Currency settings
const currency = ref('USD')
const currencySymbol = ref('$')

const companyOptions = [
  'Samsung',
  'Apple',
  'Xiaomi',
  'Google',
  'OnePlus',
  'Oppo',
  'Vivo',
  'Realme',
  'Huawei',
  'Honor',
  'Motorola',
  'Nokia',
  'Sony',
  'LG',
  'Asus',
  'Lenovo',
]

const currencyOptions = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'INR (₹)', value: 'INR' },
]

// Chart reference
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

const canRunTest = computed(() => {
  return (
    testSpecs.value.ram &&
    testSpecs.value.battery &&
    testSpecs.value.screen &&
    testSpecs.value.weight &&
    testSpecs.value.year &&
    testSpecs.value.company
  )
})

// Load available models
onMounted(async () => {
  try {
    const response = await $fetch<{ models: Model[] }>('/api/advanced/models')
    availableModels.value = response.models
  } catch (err) {
    console.error('Failed to load models:', err)
  }
})

const getModelIcon = (category: string) => {
  const icons: Record<string, string> = {
    sklearn: '🧠',
    xgboost: '🚀',
    ensemble: '🔗',
    distilled: '⚡',
    currency: '💰',
  }
  return icons[category] || '🤖'
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    sklearn: 'bg-blue-100 text-blue-800',
    xgboost: 'bg-green-100 text-green-800',
    ensemble: 'bg-purple-100 text-purple-800',
    distilled: 'bg-yellow-100 text-yellow-800',
    currency: 'bg-red-100 text-red-800',
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}

const toggleModelSelection = (modelType: string) => {
  const index = selectedModels.value.indexOf(modelType)
  if (index > -1) {
    selectedModels.value.splice(index, 1)
  } else if (selectedModels.value.length < 6) {
    selectedModels.value.push(modelType)
  }
}

const clearSelection = () => {
  selectedModels.value = []
  comparisonResults.value = null
}

const selectAllAvailable = () => {
  const availableTypes = availableModels.value
    .filter((model: Model) => model.available)
    .map((model: Model) => model.type)
  selectedModels.value = availableTypes.slice(0, 6) // Limit to 6 models
}

const runComparison = async () => {
  if (selectedModels.value.length < 2) {
    error.value = 'Please select at least 2 models to compare'
    return
  }

  if (!canRunTest.value) {
    error.value = 'Please fill in all test specifications'
    return
  }

  loading.value = true
  error.value = null
  comparisonResults.value = null
  const startTime = Date.now()

  try {
    // Update currency symbol
    const symbols: Record<string, string> = { USD: '$', EUR: '€', INR: '₹' }
    currencySymbol.value = symbols[currency.value] || '$'

    const payload = {
      ram: parseFloat(testSpecs.value.ram),
      battery: parseFloat(testSpecs.value.battery),
      screen: parseFloat(testSpecs.value.screen),
      weight: parseFloat(testSpecs.value.weight),
      year: parseInt(testSpecs.value.year),
      company: testSpecs.value.company,
      currency: currency.value,
    }

    const response = await $fetch<{ predictions: PredictionResult[] }>('/api/advanced/compare', {
      method: 'POST',
      body: payload,
    })

    comparisonResults.value = processComparisonResults(response)
    processingTime.value = Date.now() - startTime

    // Update chart after results are processed
    await nextTick()
    updateChart()
  } catch (err: any) {
    error.value = err.message || 'Failed to run model comparison'
    console.error('Comparison error:', err)
  } finally {
    loading.value = false
  }
}

const processComparisonResults = (response: { predictions: PredictionResult[] }) => {
  const successfulPredictions = response.predictions.filter(
    p => p.price !== null && p.price !== undefined
  )

  if (successfulPredictions.length === 0) {
    return {
      predictions: response.predictions,
      bestModel: 'None',
      bestPrice: 0,
      averagePrice: 0,
      priceRange: 0,
      consistency: 0,
    }
  }

  const prices = successfulPredictions.map(p => p.price!)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const avgPrice = prices.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) / prices.length

  // Consistency score (lower variance = higher consistency)
  const variance =
    prices.reduce((acc, price) => acc + Math.pow((price ?? 0) - avgPrice, 2), 0) / prices.length
  const consistency = Math.max(0, Math.min(100, 100 - (Math.sqrt(variance) / avgPrice) * 100))

  const bestPrediction = successfulPredictions.reduce((best, current) =>
    (current.price ?? Infinity) < (best.price ?? Infinity) ? current : best
  )

  return {
    predictions: response.predictions,
    bestModel: bestPrediction.model_name,
    bestPrice: bestPrediction.price ?? 0,
    averagePrice: Math.round(avgPrice),
    priceRange: Math.round(maxPrice - minPrice),
    consistency: Math.round(consistency),
  }
}

const updateChart = () => {
  if (!chartCanvas.value || !comparisonResults.value) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  const successfulPredictions = comparisonResults.value.predictions.filter(p => p.price !== null)

  const data = {
    labels: successfulPredictions.map(p => p.model_name),
    datasets: [
      {
        label: 'Predicted Price',
        data: successfulPredictions.map(p => p.price),
        backgroundColor: successfulPredictions.map(p =>
          p.price === comparisonResults.value!.bestPrice
            ? 'rgba(34, 197, 94, 0.8)'
            : 'rgba(59, 130, 246, 0.8)'
        ),
        borderColor: successfulPredictions.map(p =>
          p.price === comparisonResults.value!.bestPrice ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)'
        ),
        borderWidth: 2,
      },
    ],
  }

  const config = {
    type: 'bar' as const,
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Model Price Predictions',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value: any) {
              return currencySymbol.value + value
            },
          },
        },
      },
    },
  }

  // Import Chart.js dynamically
  import('chart.js').then(({ Chart }) => {
    if (ctx) {
      chartInstance = new Chart(ctx, config)
    }
  })
}

const navigateTo = (path: string) => {
  useRouter().push(path)
}

// Set page metadata
useHead({
  title: 'ML Model Comparison - Mobile Finder',
  meta: [
    {
      name: 'description',
      content:
        'Compare performance across multiple machine learning models for mobile price prediction',
    },
  ],
})
</script>
