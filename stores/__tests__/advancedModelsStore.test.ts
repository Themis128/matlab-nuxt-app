import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAdvancedModelsStore } from '../advancedModelsStore';

// Mock $fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);

// Mock Sentry logger globally
vi.stubGlobal('useSentryLogger', () => ({
  logError: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
}));

describe('advancedModelsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('state', () => {
    it('should initialize with default state', () => {
      const store = useAdvancedModelsStore();

      expect(store.availableModels).toEqual([]);
      expect(store.selectedModel).toBe('distilled');
      expect(store.selectedCurrency).toBe('USD');
      expect(store.isLoadingModels).toBe(false);
      expect(store.isLoadingPrediction).toBe(false);
      expect(store.lastPrediction).toBeNull();
      expect(store.predictionHistory).toEqual([]);
      expect(store.processingTime).toBe(0);
    });
  });

  describe('getters', () => {
    it('should filter active models', () => {
      const store = useAdvancedModelsStore();
      store.availableModels = [
        { type: 'model1', name: 'Model 1', description: '', available: true, category: 'test' },
        { type: 'model2', name: 'Model 2', description: '', available: false, category: 'test' },
        { type: 'model3', name: 'Model 3', description: '', available: true, category: 'test' },
      ];

      const active = store.activeModels;

      expect(active).toHaveLength(2);
      expect(active.every((m) => m.available)).toBe(true);
    });

    it('should group models by category', () => {
      const store = useAdvancedModelsStore();
      store.availableModels = [
        {
          type: 'model1',
          name: 'Model 1',
          description: '',
          available: true,
          category: 'category1',
        },
        {
          type: 'model2',
          name: 'Model 2',
          description: '',
          available: true,
          category: 'category1',
        },
        {
          type: 'model3',
          name: 'Model 3',
          description: '',
          available: true,
          category: 'category2',
        },
      ];

      const categories = store.modelCategories;

      expect(categories.category1).toHaveLength(2);
      expect(categories.category2).toHaveLength(1);
    });

    it('should get current model', () => {
      const store = useAdvancedModelsStore();
      store.availableModels = [
        {
          type: 'distilled',
          name: 'Distilled',
          description: '',
          available: true,
          category: 'test',
        },
      ];

      const current = store.currentModel;

      expect(current?.type).toBe('distilled');
    });

    it('should get current currency', () => {
      const store = useAdvancedModelsStore();
      store.selectedCurrency = 'EUR';

      const currency = store.currentCurrency;

      expect(currency?.code).toBe('EUR');
      expect(currency?.symbol).toBe('€');
    });
  });

  describe('actions', () => {
    it('should fetch available models', async () => {
      mockFetch.mockResolvedValue({
        models: [
          { type: 'model1', name: 'Model 1', description: '', available: true, category: 'test' },
        ],
      });

      const store = useAdvancedModelsStore();
      await store.fetchAvailableModels();

      expect(store.availableModels).toHaveLength(1);
      expect(store.isLoadingModels).toBe(false);
    });

    it('should use fallback models on error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const store = useAdvancedModelsStore();
      await store.fetchAvailableModels();

      expect(store.availableModels.length).toBeGreaterThan(0);
      expect(store.availableModels[0]?.type).toBe('distilled');
    });

    it('should run prediction', async () => {
      const mockResult = {
        price: 500,
        model_used: 'distilled',
        currency: 'USD',
        currency_symbol: '$',
      };

      mockFetch.mockResolvedValue(mockResult);

      const store = useAdvancedModelsStore();
      const request = {
        modelType: 'distilled',
        currency: 'USD',
        ram: 8,
        battery: 4000,
        screen: 6.1,
        weight: 174,
        year: 2024,
        company: 'Samsung',
      };

      const result = await store.runPrediction(request);

      expect(result).toEqual(mockResult);
      expect(store.lastPrediction).toEqual(mockResult);
      // Check that prediction history contains a matching result (by content, not reference)
      expect(store.predictionHistory.length).toBeGreaterThan(0);
      expect(store.predictionHistory[0]).toEqual(mockResult);
      expect(store.isLoadingPrediction).toBe(false);
    });

    it('should limit prediction history to 10 items', async () => {
      const mockResult = {
        price: 500,
        model_used: 'distilled',
        currency: 'USD',
        currency_symbol: '$',
      };

      mockFetch.mockResolvedValue(mockResult);

      const store = useAdvancedModelsStore();
      const request = {
        modelType: 'distilled',
        currency: 'USD',
        ram: 8,
        battery: 4000,
        screen: 6.1,
        weight: 174,
        year: 2024,
        company: 'Samsung',
      };

      // Add 12 predictions
      for (let i = 0; i < 12; i++) {
        await store.runPrediction(request);
      }

      expect(store.predictionHistory.length).toBeLessThanOrEqual(10);
    });

    it('should set selected model', () => {
      const store = useAdvancedModelsStore();

      store.setSelectedModel('ensemble_stacking');

      expect(store.selectedModel).toBe('ensemble_stacking');
    });

    it('should set selected currency', () => {
      const store = useAdvancedModelsStore();

      store.setSelectedCurrency('EUR');

      expect(store.selectedCurrency).toBe('EUR');
    });

    it('should clear history', () => {
      const store = useAdvancedModelsStore();
      store.lastPrediction = {
        price: 500,
        model_used: 'test',
        currency: 'USD',
        currency_symbol: '$',
      };
      store.predictionHistory = [store.lastPrediction];

      store.clearHistory();

      expect(store.lastPrediction).toBeNull();
      expect(store.predictionHistory).toEqual([]);
    });

    it('should initialize store', async () => {
      mockFetch.mockResolvedValue({ models: [] });

      const store = useAdvancedModelsStore();
      await store.initialize();

      expect(mockFetch).toHaveBeenCalledWith('/api/advanced/models');
    });
  });
});
