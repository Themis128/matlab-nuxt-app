/**
 * Pinia Store Tests
 * This file contains unit tests for the Pinia stores used in the application.
 * Run with: npx vitest run tests/stores.spec.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdvancedModelsStore } from '../stores/advancedModelsStore'
import { useABTestingStore } from '../stores/abTestingStore'

describe('Pinia Stores', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    const pinia = createPinia()
    setActivePinia(pinia)

    // Reset all mocks
    vi.clearAllMocks()
  })

  describe('Advanced Models Store', () => {
    let store: ReturnType<typeof useAdvancedModelsStore>

    beforeEach(() => {
      store = useAdvancedModelsStore()
    })

    describe('initial state', () => {
      it('should initialize with default values', () => {
        expect(store.availableModels).toEqual([])
        expect(store.selectedModel).toBe('distilled')
        expect(store.selectedCurrency).toBe('USD')
        expect(store.isLoadingModels).toBe(false)
        expect(store.isLoadingPrediction).toBe(false)
        expect(store.lastPrediction).toBeNull()
        expect(store.predictionHistory).toEqual([])
        expect(store.processingTime).toBe(0)
      })

      it('should have computed getters', () => {
        expect(store.activeModels).toEqual([])
        expect(store.modelCategories).toEqual({})
        expect(store.currentModel).toBeUndefined()
        expect(store.currentCurrency).toEqual({
          code: 'USD',
          symbol: '$',
          name: 'US Dollar',
        })
        expect(store.currencies).toHaveLength(3)
      })
    })

    describe('fetchAvailableModels', () => {
      it('should fetch models successfully', async () => {
        const mockModels = [
          {
            type: 'distilled',
            name: 'Distilled Model',
            description: 'Fast model',
            available: true,
            category: 'distilled',
            accuracy: 95.0,
          },
          {
            type: 'xgboost',
            name: 'XGBoost Model',
            description: 'Accurate model',
            available: true,
            category: 'xgboost',
            accuracy: 97.0,
          },
        ]

        ;(global.$fetch as any).mockResolvedValue({ models: mockModels })

        await store.fetchAvailableModels()

        expect(global.$fetch).toHaveBeenCalledWith('/api/advanced/models')
        expect(store.availableModels).toEqual(mockModels)
        expect(store.isLoadingModels).toBe(false)
      })

      it('should handle fetch errors and use fallback models', async () => {
        ;(global.$fetch as any).mockRejectedValue(new Error('Network error'))

        await store.fetchAvailableModels()

        expect(store.availableModels).toHaveLength(4) // fallback models
        expect(store.isLoadingModels).toBe(false)
      })

      it('should set default model when current selection is not available', async () => {
        const mockModels = [
          {
            type: 'xgboost',
            name: 'XGBoost Model',
            description: 'Accurate model',
            available: true,
            category: 'xgboost',
          },
        ]

        ;(global.$fetch as any).mockResolvedValue({ models: mockModels })

        await store.fetchAvailableModels()

        expect(store.selectedModel).toBe('xgboost') // Should set to first available
      })
    })

    describe('runPrediction', () => {
      const mockRequest = {
        modelType: 'distilled',
        currency: 'USD',
        ram: 8,
        battery: 4500,
        screen: 6.5,
        weight: 180,
        year: 2023,
        company: 'Samsung',
      }

      const mockResponse = {
        price: 899,
        model_used: 'distilled',
        accuracy_info: { r2_score: 0.95, note: 'Test prediction' },
        currency: 'USD',
        currency_symbol: '$',
      }

      it('should run prediction successfully', async () => {
        ;(global.$fetch as any).mockResolvedValue(mockResponse)

        const result = await store.runPrediction(mockRequest)

        expect(global.$fetch).toHaveBeenCalledWith('/api/advanced/predict', {
          method: 'POST',
          body: mockRequest,
        })
        expect(result).toEqual(mockResponse)
        expect(store.lastPrediction).toEqual(mockResponse)
        expect(store.predictionHistory).toHaveLength(1)
        expect(store.predictionHistory[0]).toEqual(mockResponse)
        expect(store.processingTime).toBeGreaterThanOrEqual(0)
        expect(store.isLoadingPrediction).toBe(false)
      })

      it('should prevent concurrent predictions', async () => {
        store.isLoadingPrediction = true

        const result = await store.runPrediction(mockRequest)

        expect(result).toBeNull()
        expect(global.$fetch).not.toHaveBeenCalled()
      })

      it('should handle prediction errors', async () => {
        ;(global.$fetch as any).mockRejectedValue(new Error('Prediction failed'))

        await expect(store.runPrediction(mockRequest)).rejects.toThrow('Prediction failed')
        expect(store.isLoadingPrediction).toBe(false)
      })
    })

    describe('compareModels', () => {
      const models = ['distilled', 'xgboost']
      const request = {
        currency: 'USD',
        ram: 8,
        battery: 4500,
        screen: 6.5,
        weight: 180,
        year: 2023,
        company: 'Samsung',
      }

      const mockResponse = {
        specifications: request,
        predictions: [
          {
            model_type: 'distilled',
            model_name: 'Distilled Model',
            price: 899,
            category: 'distilled',
            description: 'Fast model',
          },
        ],
        comparison_stats: {
          total_models: 2,
          successful_predictions: 2,
          average_price: 925,
        },
      }

      it('should compare models successfully', async () => {
        ;(global.$fetch as any).mockResolvedValue(mockResponse)

        const result = await store.compareModels(models, request)

        expect(global.$fetch).toHaveBeenCalledWith('/api/advanced/compare', {
          method: 'POST',
          body: {
            models,
            ...request,
          },
        })
        expect(result).toEqual(mockResponse)
        expect(store.processingTime).toBeGreaterThanOrEqual(0)
        expect(store.isLoadingPrediction).toBe(false)
      })

      it('should reject empty model list', async () => {
        const result = await store.compareModels([], request)

        expect(result).toBeNull()
      })

      it('should handle comparison errors', async () => {
        ;(global.$fetch as any).mockRejectedValue(new Error('Comparison failed'))

        await expect(store.compareModels(models, request)).rejects.toThrow('Comparison failed')
        expect(store.isLoadingPrediction).toBe(false)
      })
    })

    describe('setters', () => {
      it('should set selected model', () => {
        store.setSelectedModel('xgboost')
        expect(store.selectedModel).toBe('xgboost')
      })

      it('should set selected currency', () => {
        store.setSelectedCurrency('EUR')
        expect(store.selectedCurrency).toBe('EUR')
      })

      it('should clear history', () => {
        const mockResponse = {
          price: 899,
          model_used: 'distilled',
          accuracy_info: { r2_score: 0.95, note: 'Test prediction' },
          currency: 'USD',
          currency_symbol: '$',
        }
        store.predictionHistory = [mockResponse]
        store.lastPrediction = mockResponse

        store.clearHistory()

        expect(store.predictionHistory).toEqual([])
        expect(store.lastPrediction).toBeNull()
      })
    })
  })

  describe('A/B Testing Store', () => {
    let store: ReturnType<typeof useABTestingStore>

    beforeEach(() => {
      store = useABTestingStore()
    })

    describe('initial state', () => {
      it('should initialize with default values', () => {
        expect(store.currentTest).toBeNull()
        expect(store.testResult).toBeNull()
        expect(store.isRunningTest).toBe(false)
        expect(store.testHistory).toEqual([])
        expect(store.availableModels).toEqual([])
      })

      it('should have computed getters', () => {
        expect(store.testTypes).toHaveLength(3)
        expect(store.confidenceLevels).toHaveLength(3)
        // isTestReady should be falsy when no test is configured
        expect(store.isTestReady).toBeFalsy()
        expect(store.recentTests).toEqual([])
      })
    })

    describe('initialize', () => {
      it('should fetch available models', async () => {
        const mockModels = [
          { type: 'distilled', available: true },
          { type: 'xgboost', available: true },
        ]

        ;(global.$fetch as any).mockResolvedValue({ models: mockModels })

        await store.initialize()

        expect(global.$fetch).toHaveBeenCalledWith('/api/advanced/models')
        expect(store.availableModels).toEqual(['distilled', 'xgboost'])
      })
    })

    describe('createTest', () => {
      it('should create a test configuration', () => {
        const config = {
          name: 'Test Experiment',
          type: 'accuracy',
          sampleSize: 100,
          confidence: 95,
          nullHypothesis: 'No difference',
          altHypothesis: 'There is difference',
          models: ['modelA', 'modelB'],
        }

        store.createTest(config)

        expect(store.currentTest).toEqual(config)
        // Test that all required fields are set
        expect(store.currentTest?.name).toBe('Test Experiment')
        expect(store.currentTest?.models).toEqual(['modelA', 'modelB'])
      })
    })

    describe('loadExampleTest', () => {
      it('should load example test configuration', () => {
        store.loadExampleTest()

        expect(store.currentTest).toEqual({
          name: 'XGBoost vs Ensemble Accuracy Test',
          type: 'accuracy',
          sampleSize: 100,
          confidence: 95,
          nullHypothesis:
            'There is no significant difference in price prediction accuracy between XGBoost and Ensemble models',
          altHypothesis:
            'XGBoost has significantly better price prediction accuracy than Ensemble model',
          models: ['xgboost_conservative', 'ensemble_stacking'],
        })
      })
    })

    describe('runABTest', () => {
      const mockRequest = {
        testConfig: {
          name: 'Test',
          type: 'accuracy',
          sampleSize: 100,
          confidence: 95,
          nullHypothesis: 'H0',
          altHypothesis: 'H1',
          models: ['modelA', 'modelB'],
        },
        models: ['modelA', 'modelB'],
        sampleSize: 100,
        confidence: 0.95,
      }

      const mockResponse = {
        status: 'completed',
        duration: 1500,
        winner: 'Model A',
        confidence: 95,
        effectSize: 0.25,
        practicalSignificance: 'Small effect',
        rejectNull: true,
        modelA: {
          name: 'Model A',
          mean: 850,
          std: 50,
          mae: 25,
          r2: 0.95,
        },
        modelB: {
          name: 'Model B',
          mean: 900,
          std: 55,
          mae: 30,
          r2: 0.92,
        },
        recommendation: 'Use Model A for better accuracy',
        businessImpact: 'Expected 5% improvement in predictions',
        nextSteps: ['Deploy Model A', 'Monitor performance'],
      }

      it('should run A/B test successfully', async () => {
        ;(global.$fetch as any).mockResolvedValue(mockResponse)

        const result = await store.runABTest(mockRequest)

        expect(global.$fetch).toHaveBeenCalledWith('/api/ab-testing/run', {
          method: 'POST',
          body: mockRequest,
        })
        expect(result).toEqual(mockResponse)
        expect(store.testResult).toEqual(mockResponse)
        expect(store.testHistory).toHaveLength(1)
        expect(store.testHistory[0]).toEqual(mockResponse)
        expect(store.isRunningTest).toBe(false)
      })

      it('should prevent concurrent tests', async () => {
        store.isRunningTest = true

        const result = await store.runABTest(mockRequest)

        expect(result).toBeNull()
        expect(global.$fetch).not.toHaveBeenCalled()
      })

      it('should reject invalid test configuration', async () => {
        const invalidRequest = {
          ...mockRequest,
          models: [], // Empty models array
        }

        await expect(store.runABTest(invalidRequest)).rejects.toThrow('Invalid test configuration')
      })

      it('should handle test errors and return mock result', async () => {
        ;(global.$fetch as any).mockRejectedValue(new Error('Test failed'))

        const result = await store.runABTest(mockRequest)

        expect(result).toBeDefined()
        expect(result?.status).toBe('completed')
        expect(store.isRunningTest).toBe(false)
      })
    })

    describe('resetTest', () => {
      it('should reset test state', () => {
        store.currentTest = {
          name: 'Test',
          type: 'accuracy',
          sampleSize: 100,
          confidence: 95,
          nullHypothesis: 'H0',
          altHypothesis: 'H1',
          models: ['a', 'b'],
        }
        store.testResult = { status: 'completed' } as any

        store.resetTest()

        expect(store.currentTest).toBeNull()
        expect(store.testResult).toBeNull()
      })
    })

    describe('clearHistory', () => {
      it('should clear test history', () => {
        store.testHistory = [{ status: 'completed' }] as any

        store.clearHistory()

        expect(store.testHistory).toEqual([])
      })
    })
  })
})

// Run tests with: npx vitest run tests/stores.spec.ts
