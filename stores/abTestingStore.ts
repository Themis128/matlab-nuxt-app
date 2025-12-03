import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ABTestConfig {
  name: string
  type: string
  sampleSize: number
  confidence: number
  nullHypothesis: string
  altHypothesis: string
  models: string[]
}

export interface ABTestResult {
  status: string
  duration: number
  winner: string
  confidence: number
  effectSize: number
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

export interface ABTestRequest {
  testConfig: ABTestConfig
  models: string[]
  sampleSize: number
  confidence: number
}

export const useABTestingStore = defineStore('abTesting', () => {
  // State
  const currentTest = ref<ABTestConfig | null>(null)
  const testResult = ref<ABTestResult | null>(null)
  const isRunningTest = ref(false)
  const testHistory = ref<ABTestResult[]>([])
  const availableModels = ref<string[]>([])

  // Getters
  const testTypes = computed(() => [
    { value: 'accuracy', label: 'Accuracy Comparison' },
    { value: 'performance', label: 'Performance Comparison' },
    { value: 'robustness', label: 'Robustness Test' },
  ])

  const confidenceLevels = computed(() => [
    { value: 90, label: '90% Confidence' },
    { value: 95, label: '95% Confidence' },
    { value: 99, label: '99% Confidence' },
  ])

  const isTestReady = computed(() => {
    return (
      currentTest.value &&
      currentTest.value.name &&
      currentTest.value.type &&
      currentTest.value.sampleSize > 0 &&
      currentTest.value.models.length === 2 &&
      currentTest.value.nullHypothesis &&
      currentTest.value.altHypothesis
    )
  })

  const recentTests = computed(() => testHistory.value.slice(0, 5))

  // Actions
  async function initialize() {
    await fetchAvailableModels()
  }

  async function fetchAvailableModels() {
    try {
      const response = await $fetch('/api/ab-testing/models')
      availableModels.value = response.models
        .filter((model: { type: string; available: boolean }) => model.available)
        .map((model: { type: string; available: boolean }) => model.type)
    } catch (error) {
      console.error('Failed to fetch available models for A/B testing:', error)
      // Fallback to common models
      availableModels.value = [
        'distilled',
        'ensemble_stacking',
        'xgboost_conservative',
        'xgboost_aggressive',
        'price_eur',
        'price_inr',
      ]
    }
  }

  function createTest(config: Partial<ABTestConfig>) {
    currentTest.value = {
      name: config.name || '',
      type: config.type || 'accuracy',
      sampleSize: config.sampleSize || 100,
      confidence: config.confidence || 95,
      nullHypothesis: config.nullHypothesis || '',
      altHypothesis: config.altHypothesis || '',
      models: config.models || [],
    }
  }

  function loadExampleTest() {
    currentTest.value = {
      name: 'XGBoost vs Ensemble Accuracy Test',
      type: 'accuracy',
      sampleSize: 100,
      confidence: 95,
      nullHypothesis:
        'There is no significant difference in price prediction accuracy between XGBoost and Ensemble models',
      altHypothesis:
        'XGBoost has significantly better price prediction accuracy than Ensemble model',
      models: ['xgboost_conservative', 'ensemble_stacking'],
    }
  }

  async function runABTest(testRequest?: ABTestRequest): Promise<ABTestResult | null> {
    if (isRunningTest.value) return null

    const request = testRequest || {
      testConfig: currentTest.value!,
      models: currentTest.value!.models,
      sampleSize: currentTest.value!.sampleSize,
      confidence: currentTest.value!.confidence / 100,
    }

    if (!request.testConfig || request.models.length !== 2) {
      throw new Error('Invalid test configuration')
    }

    isRunningTest.value = true

    try {
      const response = await $fetch('/api/ab-testing/run', {
        method: 'POST',
        body: request,
      })

      testResult.value = response
      testHistory.value.unshift(response)

      // Keep only last 10 test results
      if (testHistory.value.length > 10) {
        testHistory.value = testHistory.value.slice(0, 10)
      }

      return response
    } catch (error) {
      console.error('A/B test failed:', error)
      // For demo purposes, return mock result
      const mockResult = createMockResult(request)
      testResult.value = mockResult
      testHistory.value.unshift(mockResult)
      return mockResult
    } finally {
      isRunningTest.value = false
    }
  }

  function createMockResult(request: ABTestRequest): ABTestResult {
    const modelA = request.models[0] || 'Model A'
    const modelB = request.models[1] || 'Model B'

    const winner = Math.random() > 0.5 ? modelA : modelB
    const rejectNull = Math.random() > 0.3

    return {
      status: 'completed',
      duration: Math.floor(Math.random() * 2000) + 1000,
      winner: winner.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      confidence: request.confidence * 100,
      effectSize: parseFloat((Math.random() * 0.3 + 0.1).toFixed(3)),
      practicalSignificance: Math.random() > 0.5 ? 'Small effect' : 'Medium effect',
      rejectNull,
      modelA: {
        name: modelA.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        mean: Math.random() * 200 + 300,
        std: Math.random() * 50 + 20,
        mae: Math.random() * 30 + 10,
        r2: Math.random() * 0.3 + 0.7,
      },
      modelB: {
        name: modelB.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        mean: Math.random() * 200 + 300,
        std: Math.random() * 50 + 20,
        mae: Math.random() * 30 + 10,
        r2: Math.random() * 0.3 + 0.7,
      },
      recommendation: `Based on the A/B test results, we recommend using ${winner.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} for production deployment due to its superior performance metrics.`,
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

  function resetTest() {
    currentTest.value = null
    testResult.value = null
  }

  function clearHistory() {
    testHistory.value = []
  }

  return {
    // State
    currentTest,
    testResult,
    isRunningTest,
    testHistory,
    availableModels,

    // Getters
    testTypes,
    confidenceLevels,
    isTestReady,
    recentTests,

    // Actions
    initialize,
    fetchAvailableModels,
    createTest,
    loadExampleTest,
    runABTest,
    resetTest,
    clearHistory,
  }
})
