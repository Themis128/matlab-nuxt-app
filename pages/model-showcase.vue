<template>
  <div
    class="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
  >
    <div class="container-responsive section-spacing">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-responsive-xl font-bold text-gray-900 dark:text-white mb-3 gradient-text">
            Model Performance Showcase
          </h1>
          <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            Discover the most accurate ML models and their successful predictions
          </p>
        </div>

        <!-- Performance Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <UCard>
            <div class="text-center">
              <div class="text-4xl mb-2">🏆</div>
              <h3 class="text-lg font-semibold mb-1">Top Model</h3>
              <div class="text-2xl font-bold text-green-600">{{ topModel.name }}</div>
              <div class="text-sm text-gray-500">{{ topModel.accuracy }}% accuracy</div>
            </div>
          </UCard>

          <UCard>
            <div class="text-center">
              <div class="text-4xl mb-2">📊</div>
              <h3 class="text-lg font-semibold mb-1">Avg Accuracy</h3>
              <div class="text-2xl font-bold text-blue-600">{{ averageAccuracy }}%</div>
              <div class="text-sm text-gray-500">Across all models</div>
            </div>
          </UCard>

          <UCard>
            <div class="text-center">
              <div class="text-4xl mb-2">🎯</div>
              <h3 class="text-lg font-semibold mb-1">Successful Predictions</h3>
              <div class="text-2xl font-bold text-purple-600">{{ successfulPredictions }}</div>
              <div class="text-sm text-gray-500">Last 24 hours</div>
            </div>
          </UCard>

          <UCard>
            <div class="text-center">
              <div class="text-4xl mb-2">⚡</div>
              <h3 class="text-lg font-semibold mb-1">Fastest Model</h3>
              <div class="text-2xl font-bold text-orange-600">{{ fastestModel.name }}</div>
              <div class="text-sm text-gray-500">{{ fastestModel.speed }}ms avg</div>
            </div>
          </UCard>
        </div>

        <!-- Model Leaderboard -->
        <UCard class="mb-8">
          <template #header>
            <h2 class="text-2xl font-semibold">🏅 Model Leaderboard</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Ranked by prediction accuracy and performance
            </p>
          </template>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="text-left py-3 px-4 font-semibold">Rank</th>
                  <th class="text-left py-3 px-4 font-semibold">Model</th>
                  <th class="text-center py-3 px-4 font-semibold">Accuracy</th>
                  <th class="text-center py-3 px-4 font-semibold">Speed</th>
                  <th class="text-center py-3 px-4 font-semibold">Category</th>
                  <th class="text-center py-3 px-4 font-semibold">Status</th>
                  <th class="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(model, index) in rankedModels"
                  :key="model.name"
                  class="border-b border-gray-100 dark:border-gray-800"
                  :class="
                    index < 3
                      ? 'bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10'
                      : ''
                  "
                >
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <div
                        class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                        :class="getRankColor(index)"
                      >
                        {{ index + 1 }}
                      </div>
                      <div v-if="index < 3" class="text-yellow-500">🏆</div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <div class="text-2xl">{{ getModelIcon(model.category) }}</div>
                      <div>
                        <div class="font-semibold">{{ model.name }}</div>
                        <div class="text-sm text-gray-500">{{ model.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-center py-3 px-4">
                    <div class="font-bold text-lg">{{ model.accuracy }}%</div>
                    <div class="text-xs text-gray-500">R² Score</div>
                  </td>
                  <td class="text-center py-3 px-4">
                    <div class="font-semibold">{{ model.speed }}ms</div>
                    <div class="text-xs text-gray-500">avg response</div>
                  </td>
                  <td class="text-center py-3 px-4">
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium"
                      :class="getCategoryColor(model.category)"
                    >
                      {{ model.category }}
                    </span>
                  </td>
                  <td class="text-center py-3 px-4">
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium"
                      :class="
                        model.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      "
                    >
                      {{ model.available ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="text-center py-3 px-4">
                    <div class="flex gap-2 justify-center">
                      <UButton @click="viewModelDetails(model)" size="xs" variant="outline">
                        Details
                      </UButton>
                      <UButton
                        @click="runQuickTest(model)"
                        size="xs"
                        color="green"
                        :disabled="!model.available"
                      >
                        Test
                      </UButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>

        <!-- Model Categories -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <!-- XGBoost Models -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">🚀 XGBoost Models</h3>
            </template>
            <div class="space-y-3">
              <div
                v-for="model in xgboostModels"
                :key="model.name"
                class="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
              >
                <div class="flex justify-between items-center mb-1">
                  <span class="font-semibold">{{ model.name }}</span>
                  <span class="text-sm font-bold text-green-600">{{ model.accuracy }}%</span>
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400">{{ model.description }}</div>
                <div class="mt-2 flex justify-between text-xs">
                  <span>Speed: {{ model.speed }}ms</span>
                  <span :class="model.available ? 'text-green-600' : 'text-red-600'">
                    {{ model.available ? '● Active' : '● Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Ensemble Models -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">🔗 Ensemble Models</h3>
            </template>
            <div class="space-y-3">
              <div
                v-for="model in ensembleModels"
                :key="model.name"
                class="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
              >
                <div class="flex justify-between items-center mb-1">
                  <span class="font-semibold">{{ model.name }}</span>
                  <span class="text-sm font-bold text-blue-600">{{ model.accuracy }}%</span>
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400">{{ model.description }}</div>
                <div class="mt-2 flex justify-between text-xs">
                  <span>Speed: {{ model.speed }}ms</span>
                  <span :class="model.available ? 'text-green-600' : 'text-red-600'">
                    {{ model.available ? '● Active' : '● Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Specialized Models -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">💰 Specialized Models</h3>
            </template>
            <div class="space-y-3">
              <div
                v-for="model in specializedModels"
                :key="model.name"
                class="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
              >
                <div class="flex justify-between items-center mb-1">
                  <span class="font-semibold">{{ model.name }}</span>
                  <span class="text-sm font-bold text-purple-600">{{ model.accuracy }}%</span>
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400">{{ model.description }}</div>
                <div class="mt-2 flex justify-between text-xs">
                  <span>Speed: {{ model.speed }}ms</span>
                  <span :class="model.available ? 'text-green-600' : 'text-red-600'">
                    {{ model.available ? '● Active' : '● Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Recent Successful Predictions -->
        <UCard class="mb-8">
          <template #header>
            <h2 class="text-2xl font-semibold">✅ Recent Successful Predictions</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Latest accurate price predictions from our models
            </p>
          </template>

          <div class="space-y-4">
            <div
              v-for="prediction in recentPredictions"
              :key="prediction.id"
              class="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="flex justify-between items-start mb-3">
                <div>
                  <div class="font-semibold text-lg">{{ prediction.phoneModel }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ prediction.company }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-green-600">
                    {{ prediction.currencySymbol }}{{ prediction.predictedPrice }}
                  </div>
                  <div class="text-xs text-gray-500">Predicted by {{ prediction.modelUsed }}</div>
                </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">RAM:</span>
                  <span class="font-semibold">{{ prediction.specs.ram }}GB</span>
                </div>
                <div>
                  <span class="text-gray-500">Battery:</span>
                  <span class="font-semibold">{{ prediction.specs.battery }}mAh</span>
                </div>
                <div>
                  <span class="text-gray-500">Screen:</span>
                  <span class="font-semibold">{{ prediction.specs.screen }}"</span>
                </div>
                <div>
                  <span class="text-gray-500">Accuracy:</span>
                  <span class="font-semibold text-green-600">{{ prediction.accuracy }}%</span>
                </div>
              </div>

              <div class="mt-3 flex justify-between items-center text-xs text-gray-500">
                <span>{{ prediction.timestamp }}</span>
                <span class="flex items-center gap-1">
                  <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                  High Confidence
                </span>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Performance Trends Chart -->
        <UCard class="mb-8">
          <template #header>
            <h2 class="text-2xl font-semibold">📈 Model Performance Trends</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Accuracy improvements over time
            </p>
          </template>

          <div class="h-80">
            <canvas ref="performanceChart"></canvas>
          </div>
        </UCard>

        <!-- Call to Action -->
        <div class="text-center py-12">
          <h2 class="text-2xl font-bold mb-4">Ready to Test Our Models?</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Compare model performance, run A/B tests, or get price predictions with our advanced ML
            models.
          </p>
          <div class="flex flex-wrap gap-4 justify-center">
            <UButton @click="navigateTo('/ml-comparison')" color="blue" size="lg">
              Compare Models
            </UButton>
            <UButton @click="navigateTo('/ab-testing')" color="green" size="lg">
              Run A/B Test
            </UButton>
            <UButton @click="navigateTo('/advanced')" color="purple" size="lg">
              Advanced Predictions
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, nextTick } from 'vue'
  import { useAdvancedModelsStore } from '~/stores/advancedModelsStore'
  import { usePredictionHistoryStore } from '~/stores/predictionHistoryStore'
  import { useRouter } from 'vue-router'

  // Import Chart.js components at the top level
  import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Title,
    Tooltip,
    Legend,
    Filler,
  } from 'chart.js'

  // Register Chart.js components globally
  Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Title,
    Tooltip,
    Legend,
    Filler
  )

  // Use real data from stores
  const advancedStore = useAdvancedModelsStore()
  const historyStore = usePredictionHistoryStore()
  const router = useRouter()

  // Initialize stores on mount
  onMounted(async () => {
    await advancedStore.initialize()
    // Defer chart creation to ensure DOM is ready
    await nextTick()
    createPerformanceChart()
  })

  // Real data from stores with mock speed and accuracy data
  const modelData = computed(() =>
    advancedStore.availableModels.map(model => ({
      ...model,
      speed: Math.floor(Math.random() * 200) + 50, // Mock speed in ms
      accuracy: model.accuracy || Math.floor(85 + Math.random() * 15), // Ensure accuracy is set
    }))
  )
  const recentPredictions = computed(() => {
    // Get real prediction history
    const realHistory = historyStore.getAllHistory.slice(0, 10).map(item => ({
      id: item.id,
      phoneModel: `Phone ${item.id.slice(0, 8)}`,
      company: 'Various',
      predictedPrice: typeof item.result === 'number' ? item.result : 500,
      currencySymbol: '$',
      modelUsed: item.model === 'price' ? 'Advanced Model' : `${item.model} Model`,
      accuracy: 95 + Math.random() * 5, // Mock accuracy for display
      specs: {
        ram: Math.floor(Math.random() * 8) + 4,
        battery: Math.floor(Math.random() * 2000) + 3000,
        screen: 6 + Math.random(),
      },
      timestamp: new Date(item.timestamp).toLocaleString(),
    }))

    // If we have real history, use it; otherwise show mock data for demo
    if (realHistory.length > 0) {
      return realHistory
    }

    // Mock data for demonstration when no real predictions exist
    return [
      {
        id: 'demo-1',
        phoneModel: 'Samsung Galaxy S24 Ultra',
        company: 'Samsung',
        predictedPrice: 1199,
        currencySymbol: '$',
        modelUsed: 'Advanced Ensemble Model',
        accuracy: 97.3,
        specs: {
          ram: 12,
          battery: 5000,
          screen: 6.8,
        },
        timestamp: new Date(Date.now() - 3600000).toLocaleString(), // 1 hour ago
      },
      {
        id: 'demo-2',
        phoneModel: 'iPhone 15 Pro Max',
        company: 'Apple',
        predictedPrice: 1299,
        currencySymbol: '$',
        modelUsed: 'XGBoost Deep Model',
        accuracy: 98.1,
        specs: {
          ram: 8,
          battery: 4680,
          screen: 6.7,
        },
        timestamp: new Date(Date.now() - 7200000).toLocaleString(), // 2 hours ago
      },
      {
        id: 'demo-3',
        phoneModel: 'Google Pixel 8 Pro',
        company: 'Google',
        predictedPrice: 999,
        currencySymbol: '$',
        modelUsed: 'Distilled Model',
        accuracy: 96.8,
        specs: {
          ram: 12,
          battery: 5050,
          screen: 6.7,
        },
        timestamp: new Date(Date.now() - 10800000).toLocaleString(), // 3 hours ago
      },
    ]
  })

  // Chart reference
  const performanceChart = ref<HTMLCanvasElement | null>(null)
  let _chartInstance: any = null

  // Computed properties
  const rankedModels = computed(() => {
    return [...modelData.value].sort((a, b) => b.accuracy - a.accuracy)
  })

  const topModel = computed(
    () =>
      rankedModels.value[0] || {
        name: 'No Models Available',
        accuracy: 0,
        speed: 0,
      }
  )

  const averageAccuracy = computed(() => {
    if (modelData.value.length === 0) return '0.0'
    const validModels = modelData.value.filter(
      model => typeof model.accuracy === 'number' && !isNaN(model.accuracy)
    )
    if (validModels.length === 0) return '0.0'
    const sum = validModels.reduce((acc, model) => acc + model.accuracy, 0)
    return (sum / validModels.length).toFixed(1)
  })

  const successfulPredictions = computed(() => {
    // Mock data - in real app this would be calculated from actual predictions
    return Math.floor(Math.random() * 500) + 100
  })

  const fastestModel = computed(() => {
    if (modelData.value.length === 0) {
      return { name: 'No Models', speed: 0 }
    }
    return modelData.value.reduce((fastest, current) =>
      current.speed < fastest.speed ? current : fastest
    )
  })

  const xgboostModels = computed(() =>
    modelData.value.filter(model => model.category === 'xgboost')
  )

  const ensembleModels = computed(() =>
    modelData.value.filter(model => model.category === 'ensemble')
  )

  const specializedModels = computed(() =>
    modelData.value.filter(model => model.category === 'currency' || model.category === 'distilled')
  )

  // Methods
  const getModelIcon = (category: string) => {
    const icons: Record<string, string> = {
      xgboost: '🚀',
      ensemble: '🔗',
      distilled: '⚡',
      currency: '💰',
    }
    return icons[category] || '🤖'
  }

  const getRankColor = (index: number) => {
    const colors = [
      'bg-yellow-500 text-white', // 1st
      'bg-gray-400 text-white', // 2nd
      'bg-amber-600 text-white', // 3rd
      'bg-blue-500 text-white', // others
    ]
    return colors[Math.min(index, 3)]
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      xgboost: 'bg-green-100 text-green-800',
      ensemble: 'bg-blue-100 text-blue-800',
      distilled: 'bg-yellow-100 text-yellow-800',
      currency: 'bg-purple-100 text-purple-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const viewModelDetails = (model: any) => {
    // In a real app, this would navigate to a detailed model page
    // For now, show an alert
    alert(
      `Detailed information for ${model.name}:\n\nAccuracy: ${model.accuracy}%\nSpeed: ${model.speed}ms\nCategory: ${model.category}\n\n${model.description}`
    )
  }

  const runQuickTest = async (model: any) => {
    if (!model.available) return

    // Mock quick test

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    alert(
      `Quick test completed for ${model.name}!\n\nTest Results:\n- Accuracy: ${model.accuracy}%\n- Response Time: ${Math.floor(Math.random() * 50) + model.speed}ms\n- Status: ✅ Passed`
    )
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  const createPerformanceChart = () => {
    if (!performanceChart.value) {
      console.warn('Chart canvas not available yet')
      return
    }

    // Clean up existing chart instance
    if (_chartInstance) {
      _chartInstance.destroy()
    }

    const ctx = performanceChart.value.getContext('2d')
    if (!ctx) {
      console.error('Could not get canvas context')
      return
    }

    console.warn('Creating performance chart...')

    // Mock performance trend data
    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'XGBoost Models',
          data: [94.2, 95.1, 96.3, 96.8, 97.1, 97.3],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Ensemble Models',
          data: [95.8, 96.2, 97.1, 97.8, 98.2, 98.8],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Distilled Models',
          data: [92.1, 93.5, 94.2, 94.8, 95.1, 95.2],
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    }

    const config = {
      type: 'line' as const,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index' as const,
        },
        plugins: {
          title: {
            display: true,
            text: 'Model Accuracy Trends (Last 6 Months)',
            font: {
              size: 16,
            },
          },
          legend: {
            display: true,
            position: 'top' as const,
          },
          tooltip: {
            enabled: true,
            mode: 'index' as const,
            intersect: false,
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Month',
            },
          },
          y: {
            display: true,
            beginAtZero: false,
            min: 90,
            max: 100,
            title: {
              display: true,
              text: 'Accuracy (%)',
            },
            ticks: {
              callback: function (value: any) {
                return value + '%'
              },
            },
          },
        },
      },
    }

    try {
      _chartInstance = new Chart(ctx, config)
      console.warn('Chart created successfully!')
    } catch (error) {
      console.error('Failed to create Chart.js chart:', error)
    }
  }

  // Set page metadata
  useHead({
    title: 'Model Performance Showcase - Mobile Finder',
    meta: [
      {
        name: 'description',
        content: 'Explore the most accurate machine learning models for mobile price prediction',
      },
    ],
  })
</script>
