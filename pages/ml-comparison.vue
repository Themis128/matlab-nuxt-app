<template>
  <div class="min-h-screen bg-background">
    <!-- Header Section -->
    <section class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold mb-4">ML Model Comparison</h1>
          <p class="text-xl text-blue-100 max-w-2xl mx-auto">
            Compare and analyze different machine learning models for mobile dataset performance
          </p>
        </div>
      </div>
    </section>

    <!-- Model Comparison Dashboard -->
    <section class="py-20">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Model Selection Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <UCard
            v-for="model in models"
            :key="model.id"
            :class="[
              'cursor-pointer transition-all duration-300 hover:shadow-xl',
              selectedModel === model.id
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'hover:-translate-y-1',
            ]"
            @click="selectModel(model.id)"
          >
            <div class="text-center">
              <div
                class="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                :class="model.color"
              >
                <UIcon :name="model.icon" class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {{ model.name }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">{{ model.description }}</p>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Accuracy</span>
                  <span
                    class="font-semibold"
                    :class="model.accuracy > 90 ? 'text-green-600' : 'text-yellow-600'"
                  >
                    {{ model.accuracy }}%
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Training Time</span>
                  <span class="font-semibold text-blue-600">{{ model.trainingTime }}</span>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Detailed Comparison Section -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-16">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Model Performance Comparison
          </h2>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Metric
                  </th>
                  <th v-for="model in selectedModels" :key="model.id" class="text-center py-3 px-4">
                    <div class="font-semibold text-gray-900 dark:text-white">{{ model.name }}</div>
                    <div class="text-xs text-gray-500">{{ model.type }}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="metric in comparisonMetrics"
                  :key="metric.key"
                  class="border-b border-gray-100 dark:border-gray-700"
                >
                  <td class="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {{ metric.label }}
                  </td>
                  <td v-for="model in selectedModels" :key="model.id" class="text-center py-3 px-4">
                    <span :class="getMetricClass(getMetricValue(model, metric.key), metric.type)">
                      {{ formatMetric(getMetricValue(model, metric.key), metric.type) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Visual Comparison Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <UCard class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Accuracy Comparison
            </h3>
            <div class="space-y-3">
              <div v-for="model in selectedModels" :key="model.id" class="flex items-center gap-3">
                <div class="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ model.name }}
                </div>
                <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-500"
                    :class="model.color.replace('bg-', 'bg-')"
                    :style="{ width: `${model.accuracy}%` }"
                  ></div>
                </div>
                <div class="w-12 text-sm font-semibold text-gray-900 dark:text-white text-right">
                  {{ model.accuracy }}%
                </div>
              </div>
            </div>
          </UCard>

          <UCard class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Training Time Comparison
            </h3>
            <div class="space-y-3">
              <div v-for="model in selectedModels" :key="model.id" class="flex items-center gap-3">
                <div class="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ model.name }}
                </div>
                <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-500"
                    :class="model.color.replace('bg-', 'bg-')"
                    :style="{ width: `${(model.trainingTimeMinutes / maxTrainingTime) * 100}%` }"
                  ></div>
                </div>
                <div class="w-16 text-sm font-semibold text-gray-900 dark:text-white text-right">
                  {{ model.trainingTimeMinutes }}m
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Model Recommendations -->
        <div
          class="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8"
        >
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Recommended Models
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UCard v-for="recommendation in recommendations" :key="recommendation.id" class="p-6">
              <div class="text-center">
                <div
                  class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  :class="recommendation.badgeColor"
                >
                  <UIcon :name="recommendation.icon" class="w-8 h-8 text-white" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {{ recommendation.title }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {{ recommendation.description }}
                </p>
                <div class="space-y-2">
                  <div class="text-sm">
                    <span class="text-gray-500">Best for:</span>
                    <span class="font-semibold text-gray-900 dark:text-white ml-1">{{
                      recommendation.bestFor
                    }}</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">Accuracy:</span>
                    <span class="font-semibold text-green-600 ml-1"
                      >{{ recommendation.accuracy }}%</span
                    >
                  </div>
                </div>
                <UButton size="sm" color="green" class="mt-4 w-full"> Try Model </UButton>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  // Page meta (fallback)
  onMounted(() => {
    document.title = 'ML Model Comparison - MATLAB Deep Learning Platform'
    const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    const content =
      'Compare machine learning models for mobile dataset analysis with performance metrics and recommendations'
    if (existing) existing.content = content
    else {
      const m = document.createElement('meta')
      m.name = 'description'
      m.content = content
      document.head.appendChild(m)
    }
  })

  // Model interface
  interface Model {
    id: string
    name: string
    type: string
    description: string
    accuracy: number
    trainingTime: string
    trainingTimeMinutes: number
    color: string
    icon: string
    precision: number
    recall: number
    f1Score: number
    loss: number
    inferenceTime: string
  }

  // Available models
  const models = ref<Model[]>([
    {
      id: 'cnn',
      name: 'CNN',
      type: 'Convolutional Neural Network',
      description: 'Best for image recognition and spatial data',
      accuracy: 94.7,
      trainingTime: '2.3 hrs',
      trainingTimeMinutes: 138,
      color: 'bg-purple-500',
      icon: 'i-heroicons-cpu-chip',
      precision: 0.947,
      recall: 0.932,
      f1Score: 0.939,
      loss: 0.156,
      inferenceTime: '45ms',
    },
    {
      id: 'lstm',
      name: 'LSTM',
      type: 'Long Short-Term Memory',
      description: 'Excellent for sequential data and time series',
      accuracy: 91.2,
      trainingTime: '3.1 hrs',
      trainingTimeMinutes: 186,
      color: 'bg-blue-500',
      icon: 'i-heroicons-chart-bar',
      precision: 0.912,
      recall: 0.908,
      f1Score: 0.91,
      loss: 0.234,
      inferenceTime: '67ms',
    },
    {
      id: 'transformer',
      name: 'Transformer',
      type: 'Attention-based Model',
      description: 'State-of-the-art for complex patterns',
      accuracy: 96.8,
      trainingTime: '4.7 hrs',
      trainingTimeMinutes: 282,
      color: 'bg-green-500',
      icon: 'i-heroicons-sparkles',
      precision: 0.968,
      recall: 0.961,
      f1Score: 0.964,
      loss: 0.089,
      inferenceTime: '78ms',
    },
    {
      id: 'ensemble',
      name: 'Ensemble',
      type: 'Combined Models',
      description: 'Combination of multiple algorithms',
      accuracy: 97.3,
      trainingTime: '6.2 hrs',
      trainingTimeMinutes: 372,
      color: 'bg-orange-500',
      icon: 'i-heroicons-squares-plus',
      precision: 0.973,
      recall: 0.969,
      f1Score: 0.971,
      loss: 0.067,
      inferenceTime: '123ms',
    },
  ])

  // Selected models for comparison
  const selectedModel = ref('cnn')
  const selectedModels = computed(() => models.value.filter(m => selectedModel.value === m.id))

  // Comparison metrics
  const comparisonMetrics = [
    { key: 'accuracy', label: 'Accuracy (%)', type: 'percentage' },
    { key: 'precision', label: 'Precision', type: 'decimal' },
    { key: 'recall', label: 'Recall', type: 'decimal' },
    { key: 'f1Score', label: 'F1 Score', type: 'decimal' },
    { key: 'loss', label: 'Loss', type: 'decimal' },
    { key: 'inferenceTime', label: 'Inference Time', type: 'time' },
  ]

  // Recommendations
  const recommendations = ref([
    {
      id: 'beginner',
      title: 'Best for Beginners',
      description: 'Easy to implement and understand',
      bestFor: 'Starting out with ML',
      accuracy: 91.2,
      icon: 'i-heroicons-academic-cap',
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'performance',
      title: 'Highest Performance',
      description: 'Maximum accuracy and reliability',
      bestFor: 'Production systems',
      accuracy: 97.3,
      icon: 'i-heroicons-trophy',
      badgeColor: 'bg-yellow-500',
    },
    {
      id: 'balance',
      title: 'Best Balance',
      description: 'Good performance with reasonable speed',
      bestFor: 'Real-time applications',
      accuracy: 94.7,
      icon: 'i-heroicons-scale',
      badgeColor: 'bg-green-500',
    },
  ])

  // Computed values
  const maxTrainingTime = computed(() => Math.max(...models.value.map(m => m.trainingTimeMinutes)))

  // Methods
  const selectModel = (modelId: string) => {
    selectedModel.value = modelId
  }

  const getMetricClass = (value: number | string, type: string) => {
    if (type === 'time') return 'text-gray-900 dark:text-white font-semibold'
    if (type === 'percentage') {
      const num = typeof value === 'string' ? parseFloat(value) : value
      return num > 95
        ? 'text-green-600 font-semibold'
        : num > 90
          ? 'text-blue-600 font-semibold'
          : 'text-yellow-600 font-semibold'
    }
    return 'text-gray-900 dark:text-white font-semibold'
  }

  const formatMetric = (value: number | string, type: string) => {
    if (type === 'percentage') return `${value}%`
    if (type === 'decimal') return typeof value === 'number' ? value.toFixed(3) : value
    if (type === 'time') return value
    return value.toString()
  }

  const getMetricValue = (model: Model, metricKey: string): number | string => {
    return (model as any)[metricKey]
  }
</script>

<style scoped>
  /* Additional styles can be added here if needed */
</style>
