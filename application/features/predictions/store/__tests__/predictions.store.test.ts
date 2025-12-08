import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePredictionsStore } from '../predictions.store';

// Mock PredictionService
const mockPredictionService = {
  predictPrice: vi.fn(),
  predictRAM: vi.fn(),
  predictBattery: vi.fn(),
  predictBrand: vi.fn(),
  advancedPredict: vi.fn(),
};

vi.mock('@/domain', () => ({
  PredictionService: vi.fn(() => mockPredictionService),
  PredictionInputSchema: {
    parse: vi.fn((data) => data),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('predictions.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('state', () => {
    it('should initialize with default state', () => {
      const store = usePredictionsStore();

      expect(store.history).toEqual([]);
      expect(store.availableModels).toEqual([]);
      expect(store.selectedModel).toBe('distilled');
      expect(store.selectedCurrency).toBe('USD');
      expect(store.isLoadingModels).toBe(false);
      expect(store.isLoadingPrediction).toBe(false);
    });
  });

  describe('getters', () => {
    it('should get all history', () => {
      const store = usePredictionsStore();
      store.history = [
        {
          id: '1',
          model: 'price',
          input: {},
          result: 500,
          timestamp: Date.now(),
          predictionTime: 100,
          source: 'api',
        },
      ];

      expect(store.getAllHistory).toHaveLength(1);
    });

    it('should get history by model', () => {
      const store = usePredictionsStore();
      store.history = [
        {
          id: '1',
          model: 'price',
          input: {},
          result: 500,
          timestamp: Date.now(),
          predictionTime: 100,
          source: 'api',
        },
        {
          id: '2',
          model: 'ram',
          input: {},
          result: 8,
          timestamp: Date.now(),
          predictionTime: 100,
          source: 'api',
        },
      ];

      const priceHistory = store.getHistoryByModel('price');
      expect(priceHistory).toHaveLength(1);
      expect(priceHistory[0]!.model).toBe('price');
    });
  });

  describe('actions', () => {
    it('should save prediction to history', () => {
      const store = usePredictionsStore();
      const prediction = {
        model: 'price' as const,
        input: { brand: 'Apple' },
        result: 999,
        predictionTime: 100,
        source: 'api' as const,
      };

      store.savePrediction(prediction);

      expect(store.history).toHaveLength(1);
      expect(store.history[0]!.result).toBe(999);
    });

    it('should clear history', () => {
      const store = usePredictionsStore();
      store.history = [
        {
          id: '1',
          model: 'price',
          input: {},
          result: 500,
          timestamp: Date.now(),
          predictionTime: 100,
          source: 'api',
        },
      ];

      store.clearHistory();

      expect(store.history).toEqual([]);
    });

    it('should validate price', () => {
      const store = usePredictionsStore();
      const validation = store.validatePrice(500, {});

      expect(validation.isValid).toBe(true);
      expect(validation.confidence).toBeDefined();
    });

    it('should validate RAM', () => {
      const store = usePredictionsStore();
      const validation = store.validateRam(8, {});

      expect(validation.isValid).toBe(true);
    });

    it('should validate battery', () => {
      const store = usePredictionsStore();
      const validation = store.validateBattery(4000, {});

      expect(validation.isValid).toBe(true);
    });

    it('should validate brand', () => {
      const store = usePredictionsStore();
      const validation = store.validateBrand('Apple', {});

      expect(validation.isValid).toBe(true);
    });

    it('should set selected model', () => {
      const store = usePredictionsStore();
      store.setSelectedModel('neural');

      expect(store.selectedModel).toBe('neural');
    });

    it('should set selected currency', () => {
      const store = usePredictionsStore();
      store.setSelectedCurrency('EUR');

      expect(store.selectedCurrency).toBe('EUR');
    });
  });
});
