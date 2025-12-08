import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useABTestingStore } from '../abTestingStore';

// Mock $fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);

// Mock Sentry logger globally
vi.stubGlobal('useSentryLogger', () => ({
  logError: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
}));

describe('abTestingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('state', () => {
    it('should initialize with default state', () => {
      const store = useABTestingStore();

      expect(store.currentTest).toBeNull();
      expect(store.testResult).toBeNull();
      expect(store.isRunningTest).toBe(false);
      expect(store.testHistory).toEqual([]);
      expect(store.availableModels).toEqual([]);
    });
  });

  describe('getters', () => {
    it('should return test types', () => {
      const store = useABTestingStore();

      expect(store.testTypes).toHaveLength(3);
      expect(store.testTypes[0]?.value).toBe('accuracy');
    });

    it('should return confidence levels', () => {
      const store = useABTestingStore();

      expect(store.confidenceLevels).toHaveLength(3);
      expect(store.confidenceLevels[0]?.value).toBe(90);
    });

    it('should check if test is ready', () => {
      const store = useABTestingStore();

      expect(store.isTestReady).toBe(false);

      store.currentTest = {
        name: 'Test',
        type: 'accuracy',
        sampleSize: 100,
        confidence: 95,
        nullHypothesis: 'H0',
        altHypothesis: 'H1',
        models: ['model1', 'model2'],
      };

      expect(store.isTestReady).toBe(true);
    });

    it('should return recent tests', () => {
      const store = useABTestingStore();
      const mockResult = {
        status: 'completed',
        duration: 1000,
        winner: 'Model A',
        confidence: 95,
        effectSize: 0.5,
        practicalSignificance: 'Medium',
        rejectNull: true,
        modelA: { name: 'A', mean: 100, std: 10, mae: 5, r2: 0.9 },
        modelB: { name: 'B', mean: 90, std: 10, mae: 6, r2: 0.85 },
        recommendation: 'Use A',
        businessImpact: 'Positive',
        nextSteps: [],
      };

      // Add 7 test results
      for (let i = 0; i < 7; i++) {
        store.testHistory.push({ ...mockResult, winner: `Model ${i}` });
      }

      expect(store.recentTests).toHaveLength(5);
    });
  });

  describe('actions', () => {
    it('should fetch available models', async () => {
      mockFetch.mockResolvedValue({
        models: [
          { type: 'model1', available: true },
          { type: 'model2', available: false },
          { type: 'model3', available: true },
        ],
      });

      const store = useABTestingStore();
      await store.fetchAvailableModels();

      expect(store.availableModels).toEqual(['model1', 'model3']);
    });

    it('should use fallback models on error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const store = useABTestingStore();
      await store.fetchAvailableModels();

      expect(store.availableModels.length).toBeGreaterThan(0);
      expect(store.availableModels).toContain('distilled');
    });

    it('should create test configuration', () => {
      const store = useABTestingStore();

      store.createTest({
        name: 'Test',
        type: 'accuracy',
        models: ['model1', 'model2'],
      });

      expect(store.currentTest).toBeDefined();
      expect(store.currentTest?.name).toBe('Test');
      expect(store.currentTest?.type).toBe('accuracy');
      expect(store.currentTest?.models).toEqual(['model1', 'model2']);
    });

    it('should load example test', () => {
      const store = useABTestingStore();

      store.loadExampleTest();

      expect(store.currentTest).toBeDefined();
      expect(store.currentTest?.name).toContain('XGBoost vs Ensemble');
      expect(store.currentTest?.models).toEqual(['xgboost_conservative', 'ensemble_stacking']);
    });

    it('should run A/B test with fallback result', async () => {
      mockFetch.mockResolvedValue(null); // API returns null, triggers fallback

      const store = useABTestingStore();
      store.currentTest = {
        name: 'Test',
        type: 'accuracy',
        sampleSize: 100,
        confidence: 95,
        nullHypothesis: 'H0',
        altHypothesis: 'H1',
        models: ['model1', 'model2'],
      };

      const result = await store.runABTest();

      expect(result).toBeDefined();
      expect(result?.status).toBe('completed');
      expect(result?.winner).toBeDefined();
      expect(store.testResult).toEqual(result);
      expect(store.isRunningTest).toBe(false);
    });

    it('should limit test history to 10 items', async () => {
      const store = useABTestingStore();
      store.currentTest = {
        name: 'Test',
        type: 'accuracy',
        sampleSize: 100,
        confidence: 95,
        nullHypothesis: 'H0',
        altHypothesis: 'H1',
        models: ['model1', 'model2'],
      };

      mockFetch.mockResolvedValue(null);

      // Run 12 tests
      for (let i = 0; i < 12; i++) {
        await store.runABTest();
      }

      expect(store.testHistory.length).toBeLessThanOrEqual(10);
    });

    it('should reset test', () => {
      const store = useABTestingStore();
      store.currentTest = {
        name: 'Test',
        type: 'accuracy',
        sampleSize: 100,
        confidence: 95,
        nullHypothesis: 'H0',
        altHypothesis: 'H1',
        models: ['model1', 'model2'],
      };
      store.testResult = {
        status: 'completed',
        duration: 1000,
        winner: 'Model A',
        confidence: 95,
        effectSize: 0.5,
        practicalSignificance: 'Medium',
        rejectNull: true,
        modelA: { name: 'A', mean: 100, std: 10, mae: 5, r2: 0.9 },
        modelB: { name: 'B', mean: 90, std: 10, mae: 6, r2: 0.85 },
        recommendation: 'Use A',
        businessImpact: 'Positive',
        nextSteps: [],
      };

      store.resetTest();

      expect(store.currentTest).toBeNull();
      expect(store.testResult).toBeNull();
    });

    it('should clear history', () => {
      const store = useABTestingStore();
      store.testHistory = [
        {
          status: 'completed',
          duration: 1000,
          winner: 'Model A',
          confidence: 95,
          effectSize: 0.5,
          practicalSignificance: 'Medium',
          rejectNull: true,
          modelA: { name: 'A', mean: 100, std: 10, mae: 5, r2: 0.9 },
          modelB: { name: 'B', mean: 90, std: 10, mae: 6, r2: 0.85 },
          recommendation: 'Use A',
          businessImpact: 'Positive',
          nextSteps: [],
        },
      ];

      store.clearHistory();

      expect(store.testHistory).toEqual([]);
    });

    it('should initialize store', async () => {
      mockFetch.mockResolvedValue({ models: [] });

      const store = useABTestingStore();
      await store.initialize();

      expect(mockFetch).toHaveBeenCalledWith('/api/ab-testing/models');
    });
  });
});
