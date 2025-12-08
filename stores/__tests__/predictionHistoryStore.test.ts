import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePredictionHistoryStore } from '../predictionHistoryStore';

// Mock Sentry logger
vi.mock('~/composables/useSentryLogger', () => ({
  useSentryLogger: () => ({
    logError: vi.fn(),
  }),
}));

describe('predictionHistoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Clear localStorage
    localStorage.clear();
  });

  describe('state', () => {
    it('should initialize with empty history', () => {
      const store = usePredictionHistoryStore();
      expect(store.history).toEqual([]);
    });
  });

  describe('actions', () => {
    it('should save prediction to history', () => {
      const store = usePredictionHistoryStore();
      const prediction = {
        model: 'price' as const,
        input: { ram: 8, battery: 4000 },
        result: 500,
        predictionTime: 100,
        source: 'api' as const,
      };

      store.savePrediction(prediction);

      expect(store.history).toHaveLength(1);
      expect(store.history[0]!.model).toBe('price');
      expect(store.history[0]!.result).toBe(500);
      expect(store.history[0]!.id).toBeDefined();
      expect(store.history[0]!.timestamp).toBeDefined();
    });

    it('should limit history to MAX_HISTORY items', () => {
      const store = usePredictionHistoryStore();
      const prediction = {
        model: 'price' as const,
        input: {},
        result: 500,
        predictionTime: 100,
        source: 'api' as const,
      };

      // Add more than MAX_HISTORY (50) items
      for (let i = 0; i < 55; i++) {
        store.savePrediction(prediction);
      }

      expect(store.history.length).toBeLessThanOrEqual(50);
    });

    it('should load history from localStorage', () => {
      const store = usePredictionHistoryStore();
      const testHistory = [
        {
          id: '1',
          model: 'price' as const,
          input: {},
          result: 500,
          timestamp: Date.now(),
          predictionTime: 100,
          source: 'api' as const,
        },
      ];

      localStorage.setItem('mobile-prediction-history', JSON.stringify(testHistory));
      store.loadHistory();

      expect(store.history).toHaveLength(1);
      expect(store.history[0]!.id).toBe('1');
    });

    it('should clear history', () => {
      const store = usePredictionHistoryStore();
      store.savePrediction({
        model: 'price',
        input: {},
        result: 500,
        predictionTime: 100,
        source: 'api',
      });

      expect(store.history.length).toBeGreaterThan(0);

      store.clearHistory();

      expect(store.history).toEqual([]);
      expect(localStorage.getItem('mobile-prediction-history')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const store = usePredictionHistoryStore();
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      store.savePrediction({
        model: 'price',
        input: {},
        result: 500,
        predictionTime: 100,
        source: 'api',
      });

      // Should not throw, but history should still be updated in memory
      expect(store.history.length).toBeGreaterThan(0);

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('getters', () => {
    it('should get all history', () => {
      const store = usePredictionHistoryStore();
      store.savePrediction({
        model: 'price',
        input: {},
        result: 500,
        predictionTime: 100,
        source: 'api',
      });

      const allHistory = store.getAllHistory;
      expect(allHistory).toHaveLength(1);
    });

    it('should filter history by model', () => {
      const store = usePredictionHistoryStore();
      store.savePrediction({
        model: 'price',
        input: {},
        result: 500,
        predictionTime: 100,
        source: 'api',
      });
      store.savePrediction({
        model: 'ram',
        input: {},
        result: 8,
        predictionTime: 100,
        source: 'api',
      });

      const priceHistory = store.getHistoryByModel('price');
      expect(priceHistory).toHaveLength(1);
      expect(priceHistory[0]!.model).toBe('price');

      const ramHistory = store.getHistoryByModel('ram');
      expect(ramHistory).toHaveLength(1);
      expect(ramHistory[0]!.model).toBe('ram');
    });
  });
});
