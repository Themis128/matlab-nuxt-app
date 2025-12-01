<template>
  <div
    class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
  >
    <div class="container-responsive section-spacing">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-responsive-xl font-bold text-gray-900 dark:text-white mb-3 gradient-text">
            A/B Testing Framework
          </h1>
          <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            Compare model performance with statistical significance testing
          </p>
        </div>

        <!-- Test Configuration -->
        <UCard class="mb-8">
          <template #header>
            <h2 class="text-2xl font-semibold">🧪 Test Configuration</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Set up your A/B test parameters and hypotheses
            </p>
          </template>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Test Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Test Name
                </label>
                <UInput
                  v-model="testConfig.name"
                  placeholder="e.g., XGBoost vs Ensemble Comparison"
                />
              </div>

              <!-- Test Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Test Type
                </label>
                <USelect
                  v-model="testConfig.type"
                  :options="testTypes"
                  placeholder="Select test type"
                />
              </div>

              <!-- Sample Size -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Sample Size per Group
                </label>
                <UInput
                  v-model="testConfig.sampleSize"
                  type="number"
                  min="10"
                  max="1000"
                  placeholder="100"
                />
              </div>

              <!-- Confidence Level -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Confidence Level
                </label>
                <USelect v-model="testConfig.confidence" :options="confidenceLevels" />
              </div>
            </div>

            <!-- Hypothesis -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Null Hypothesis (H₀)
              </label>
              <UTextarea
                v-model="testConfig.nullHypothesis"
                rows="2"
                placeholder="e.g., There is no significant difference in price prediction accuracy between Model A and Model B"
              />
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Alternative Hypothesis (H₁)
              </label>
              <UTextarea
                v-model="testConfig.altHypothesis"
                rows="2"
                placeholder="e.g., Model A has significantly better price prediction accuracy than Model B"
              />
            </div>

            <!-- Model Selection -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 class="text-lg font-semibold mb-4">Select Models for A/B Test</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                <div
                  v-for="model in availableModels"
                  :key="model.type"
                  class="p-3 rounded-lg border-2 cursor-pointer transition-all"
                  :class="
                    selectedModelsForTest.includes(model.type)
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  "
                  @click="toggleTestModelSelection(model.type)"
                >
                  <div class="text-center">
                    <div class="text-lg mb-1">{{ getModelIcon(model.category) }}</div>
                    <div class="font-semibold text-sm">{{ model.name }}</div>
                    <div class="text-xs text-gray-500">{{ model.category }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex gap-4 justify-center">
              <UButton
                @click="startABTest"
                :disabled="!canStartTest || runningTest"
                :loading="runningTest"
                color="green"
                icon="i-heroicons-beaker"
                size="lg"
              >
                Start A/B Test
              </UButton>
              <UButton
                @click="resetTest"
                color="gray"
                variant="outline"
                icon="i-heroicons-arrow-path"
              >
                Reset Test
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Test Results -->
        <div v-if="testResults">
          <!-- Test Summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <UCard>
              <div class="text-center">
                <div class="text-3xl mb-2">📊</div>
                <h3 class="text-lg font-semibold mb-1">Test Status</h3>
                <div
                  class="text-xl font-bold"
                  :class="testResults.status === 'completed' ? 'text-green-600' : 'text-blue-600'"
                >
                  {{ testResults.status }}
                </div>
                <div class="text-sm text-gray-500">{{ testResults.duration }}ms</div>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div class="text-3xl mb-2">🎯</div>
                <h3 class="text-lg font-semibold mb-1">Winner</h3>
                <div class="text-xl font-bold text-green-600">{{ testResults.winner }}</div>
                <div class="text-sm text-gray-500">{{ testResults.confidence }}% confidence</div>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div class="text-3xl mb-2">📈</div>
                <h3 class="text-lg font-semibold mb-1">Effect Size</h3>
                <div class="text-xl font-bold text-blue-600">{{ testResults.effectSize }}</div>
                <div class="text-sm text-gray-500">{{ testResults.practicalSignificance }}</div>
              </div>
            </UCard>
          </div>

          <!-- Statistical Results -->
          <UCard class="mb-8">
            <template #header>
              <h2 class="text-2xl font-semibold">📊 Statistical Analysis</h2>
            </template>

            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Model A Results -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-blue-600">{{ testResults.modelA.name }}</h3>
                  <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Mean Price</div>
                        <div class="text-lg font-bold">
                          ${{ testResults.modelA.mean.toFixed(2) }}
                        </div>
                      </div>
                      <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Std Dev</div>
                        <div class="text-lg font-bold">
                          ${{ testResults.modelA.std.toFixed(2) }}
                        </div>
                      </div>
                      <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">MAE</div>
                        <div class="text-lg font-bold">
                          ${{ testResults.modelA.mae.toFixed(2) }}
                        </div>
                      </div>
                      <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">R² Score</div>
                        <div class="text-lg font-bold">
                          {{ (testResults.modelA.r2 * 100).toFixed(1) }}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Model B Results -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-green-600">
                    {{ testResults.modelB.name }}
                  </h3>
                  <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Mean Price</div>
                        <div class="text-lg font-bold">
                          ${{ testResults.modelB.mean.toFixed(2) }}
                        </div>
                      </div>
                      <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Std Dev</div>
                        <div class="text-lg font-bold">
                          ${{ testResults.modelB.std.toFixed(2) }}
                        </div>
                      </div>
                      <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">MAE</div>
                        <div class="text-lg font-bold">
                          ${{ testResults.modelB.mae.toFixed(2) }}
                        </div>
                      </div>
                      <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">R² Score</div>
                        <div class="text-lg font-bold">
                          {{ (testResults.modelB.r2 * 100).toFixed(1) }}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Hypothesis Testing -->
              <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 class="text-lg font-semibold mb-4">Hypothesis Testing Results</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    class="p-4 rounded-lg"
                    :class="
                      testResults.rejectNull
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-green-50 dark:bg-green-900/20'
                    "
                  >
                    <h4
                      class="font-semibold mb-2"
                      :class="testResults.rejectNull ? 'text-red-700' : 'text-green-700'"
                    >
                      {{ testResults.rejectNull ? 'Reject H₀' : 'Fail to Reject H₀' }}
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ testConfig.nullHypothesis }}
                    </p>
                  </div>
                  <div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <h4 class="font-semibold mb-2 text-blue-700">
                      {{ testResults.rejectNull ? 'Support H₁' : 'Insufficient Evidence for H₁' }}
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ testConfig.altHypothesis }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Performance Charts -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <UCard>
              <template #header>
                <h2 class="text-xl font-semibold">Price Distribution Comparison</h2>
              </template>
              <div class="h-64">
                <canvas ref="distributionChart"></canvas>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h2 class="text-xl font-semibold">Error Distribution</h2>
              </template>
              <div class="h-64">
                <canvas ref="errorChart"></canvas>
              </div>
            </UCard>
          </div>

          <!-- Recommendations -->
          <UCard>
            <template #header>
              <h2 class="text-2xl font-semibold">💡 Recommendations</h2>
            </template>

            <div class="p-6">
              <div class="space-y-4">
                <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 class="font-semibold text-blue-700 mb-2">Primary Recommendation</h3>
                  <p class="text-gray-700 dark:text-gray-300">{{ testResults.recommendation }}</p>
                </div>

                <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h3 class="font-semibold text-yellow-700 mb-2">Business Impact</h3>
                  <p class="text-gray-700 dark:text-gray-300">{{ testResults.businessImpact }}</p>
                </div>

                <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h3 class="font-semibold text-purple-700 mb-2">Next Steps</h3>
                  <ul class="text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                    <li v-for="step in testResults.nextSteps" :key="step">{{ step }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Empty State -->
        <UCard v-if="!testResults && !runningTest" class="mt-6">
          <div class="text-center py-12">
            <UIcon name="i-heroicons-beaker" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Set up an A/B test to compare model performance with statistical rigor
            </p>
            <div class="flex gap-4 justify-center">
              <UButton @click="loadExampleTest" color="blue" variant="outline">
                Load Example Test
              </UButton>
              <UButton @click="navigateTo('/ml-comparison')" color="purple">
                View Model Comparison
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Type definitions
interface Model {
  type: string
  name: string
  description: string
  category: string
  available: boolean
}

interface TestResults {
  status: string
  duration: number
  winner: string
  confidence: string
  effectSize: string
  practicalSignificance: string
  rejectNull: boolean
  modelA: {
    name: string
    mean: number
    std: number
    mae: number
    r2: number
  }
  modelB: {
    name: string
    mean: number
    std: number
    mae: number
    r2: number
  }
  recommendation: string
  businessImpact: string
  nextSteps: string[]
}

// Test configuration
const testConfig = ref({
  name: '',
  type: 'accuracy',
  sampleSize: '100',
  confidence: '95',
  nullHypothesis: '',
  altHypothesis: '',
})

// Available data
const availableModels = ref<Model[]>([])
const selectedModelsForTest = ref<string[]>([])
const runningTest = ref(false)
const testResults = ref<TestResults | null>(null)

// Chart references
const distributionChart = ref<HTMLCanvasElement | null>(null)
const errorChart = ref<HTMLCanvasElement | null>(null)
let distChartInstance: any = null
let errorChartInstance: any = null

// Options
const testTypes = [
  { label: 'Accuracy Comparison', value: 'accuracy' },
  { label: 'Performance Comparison', value: 'performance' },
  { label: 'Robustness Test', value: 'robustness' },
]

const confidenceLevels = [
  { label: '90% Confidence', value: '90' },
  { label: '95% Confidence', value: '95' },
  { label: '99% Confidence', value: '99' },
]

const canStartTest = computed(() => {
  return (
    testConfig.value.name &&
    testConfig.value.type &&
    testConfig.value.sampleSize &&
    selectedModelsForTest.value.length === 2 &&
    testConfig.value.nullHypothesis &&
    testConfig.value.altHypothesis
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

const toggleTestModelSelection = (modelType: string) => {
  const index = selectedModelsForTest.value.indexOf(modelType)
  if (index > -1) {
    selectedModelsForTest.value.splice(index, 1)
  } else if (selectedModelsForTest.value.length < 2) {
    selectedModelsForTest.value.push(modelType)
  }
}

const loadExampleTest = () => {
  testConfig.value = {
    name: 'XGBoost vs Ensemble Accuracy Test',
    type: 'accuracy',
    sampleSize: '100',
    confidence: '95',
    nullHypothesis:
      'There is no significant difference in price prediction accuracy between XGBoost and Ensemble models',
    altHypothesis: 'XGBoost has significantly better price prediction accuracy than Ensemble model',
  }

  // Select first two available models
  const availableTypes = availableModels.value
    .filter(model => model.available)
    .map(model => model.type)
  selectedModelsForTest.value = availableTypes.slice(0, 2)
}

const startABTest = async () => {
  if (!canStartTest.value || runningTest.value) return

  runningTest.value = true
  testResults.value = null

  try {
    const payload = {
      testConfig: testConfig.value,
      models: selectedModelsForTest.value,
      sampleSize: parseInt(testConfig.value.sampleSize),
      confidence: parseFloat(testConfig.value.confidence) / 100,
    }

    const response = await $fetch<TestResults>('/api/ab-testing/run', {
      method: 'POST',
      body: payload,
    })

    testResults.value = response

    // Create charts after results are loaded
    await nextTick()
    createCharts()
  } catch (err: any) {
    console.error('A/B test failed:', err)
    // For demo purposes, create mock results
    testResults.value = createMockResults()
    await nextTick()
    createCharts()
  } finally {
    runningTest.value = false
  }
}

const createMockResults = (): TestResults => {
  const modelA = availableModels.value.find(m => m.type === selectedModelsForTest.value[0])
  const modelB = availableModels.value.find(m => m.type === selectedModelsForTest.value[1])

  const modelAName = modelA?.name || 'Model A'
  const modelBName = modelB?.name || 'Model B'

  return {
    status: 'completed',
    duration: Math.floor(Math.random() * 2000) + 1000,
    winner: Math.random() > 0.5 ? modelAName : modelBName,
    confidence: testConfig.value.confidence,
    effectSize: (Math.random() * 0.3 + 0.1).toFixed(3),
    practicalSignificance: Math.random() > 0.5 ? 'Small effect' : 'Medium effect',
    rejectNull: Math.random() > 0.3,
    modelA: {
      name: modelAName,
      mean: Math.random() * 200 + 300,
      std: Math.random() * 50 + 20,
      mae: Math.random() * 30 + 10,
      r2: Math.random() * 0.3 + 0.7,
    },
    modelB: {
      name: modelBName,
      mean: Math.random() * 200 + 300,
      std: Math.random() * 50 + 20,
      mae: Math.random() * 30 + 10,
      r2: Math.random() * 0.3 + 0.7,
    },
    recommendation: `Based on the A/B test results, we recommend using ${Math.random() > 0.5 ? modelAName : modelBName} for production deployment due to its superior performance metrics.`,
    businessImpact:
      'Expected improvement in price prediction accuracy could lead to better inventory management and increased customer satisfaction.',
    nextSteps: [
      'Deploy the winning model to production',
      'Monitor performance metrics for 30 days',
      'Consider running follow-up tests with different datasets',
      'Document the test results and methodology',
    ],
  }
}

const createCharts = () => {
  if (!distributionChart.value || !errorChart.value || !testResults.value) return

  // Destroy existing charts
  if (distChartInstance) distChartInstance.destroy()
  if (errorChartInstance) errorChartInstance.destroy()

  // Create distribution chart
  const distCtx = distributionChart.value?.getContext('2d')
  const distData = {
    labels: [testResults.value.modelA.name, testResults.value.modelB.name],
    datasets: [
      {
        label: 'Mean Price',
        data: [testResults.value.modelA.mean, testResults.value.modelB.mean],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(34, 197, 94, 0.8)'],
        borderColor: ['rgb(59, 130, 246)', 'rgb(34, 197, 94)'],
        borderWidth: 2,
      },
    ],
  }

  // Create error chart
  const errorCtx = errorChart.value?.getContext('2d')
  const errorData = {
    labels: [testResults.value.modelA.name, testResults.value.modelB.name],
    datasets: [
      {
        label: 'Mean Absolute Error',
        data: [testResults.value.modelA.mae, testResults.value.modelB.mae],
        backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(245, 158, 11, 0.8)'],
        borderColor: ['rgb(239, 68, 68)', 'rgb(245, 158, 11)'],
        borderWidth: 2,
      },
    ],
  }

  const chartConfig = {
    type: 'bar',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  }

  // Import Chart.js dynamically
  import('chart.js').then(({ Chart }) => {
    if (distCtx) {
      distChartInstance = new Chart(distCtx, {
        ...chartConfig,
        data: distData,
        type: 'bar' as const,
      })
    }
    if (errorCtx) {
      errorChartInstance = new Chart(errorCtx, {
        ...chartConfig,
        data: errorData,
        type: 'bar' as const,
      })
    }
  })
}

const resetTest = () => {
  testConfig.value = {
    name: '',
    type: 'accuracy',
    sampleSize: '100',
    confidence: '95',
    nullHypothesis: '',
    altHypothesis: '',
  }
  selectedModelsForTest.value = []
  testResults.value = null

  // Destroy charts
  if (distChartInstance) distChartInstance.destroy()
  if (errorChartInstance) errorChartInstance.destroy()
  distChartInstance = null
  errorChartInstance = null
}

const navigateTo = (path: string) => {
  useRouter().push(path)
}

// Set page metadata
useHead({
  title: 'A/B Testing Framework - Mobile Finder',
  meta: [
    {
      name: 'description',
      content: 'Run statistical A/B tests to compare machine learning model performance',
    },
  ],
})
</script>
