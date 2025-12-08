import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePredictionValidationStore } from '../predictionValidationStore';

describe('predictionValidationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('state', () => {
    it('should initialize with model metrics', () => {
      const store = usePredictionValidationStore();

      expect(store.MODEL_METRICS.price).toBeDefined();
      expect(store.MODEL_METRICS.ram).toBeDefined();
      expect(store.MODEL_METRICS.battery).toBeDefined();
      expect(store.MODEL_METRICS.brand).toBeDefined();
    });
  });

  describe('actions', () => {
    describe('validatePrice', () => {
      it('should validate price within range with high confidence', () => {
        const store = usePredictionValidationStore();
        const input = {
          ram: 8,
          battery: 4000,
          screen: 6.1,
          weight: 174,
          year: 2024,
          company: 'Samsung',
        };

        const result = store.validatePrice(500, input);

        expect(result.isValid).toBe(true);
        expect(result.confidence).toBe('high');
        expect(result.expectedRange).toBeDefined();
      });

      it('should flag low price for Apple devices', () => {
        const store = usePredictionValidationStore();
        const input = {
          ram: 8,
          battery: 4000,
          screen: 6.1,
          weight: 174,
          year: 2024,
          company: 'Apple',
        };

        const result = store.validatePrice(300, input);

        expect(result.confidence).toBe('low');
        expect(result.message).toContain('unusually low for an Apple device');
      });

      it('should flag unrealistic combinations', () => {
        const store = usePredictionValidationStore();
        const input = {
          ram: 16,
          battery: 6000,
          screen: 6.5,
          weight: 200,
          year: 2024,
          company: 'Samsung',
        };

        const result = store.validatePrice(500, input);

        expect(result.confidence).toBe('low');
        expect(result.message).toContain('high-end 2024 device');
      });

      it('should return low confidence for out-of-range prices', () => {
        const store = usePredictionValidationStore();
        const input = {
          ram: 8,
          battery: 4000,
          screen: 6.1,
          weight: 174,
          year: 2024,
          company: 'Samsung',
        };

        const result = store.validatePrice(50, input);

        expect(result.isValid).toBe(false);
        expect(result.confidence).toBe('low');
      });
    });

    describe('validateRam', () => {
      it('should validate RAM within range', () => {
        const store = usePredictionValidationStore();
        const input = {
          battery: 4000,
          screen: 6.1,
          weight: 174,
          year: 2024,
          price: 999,
          company: 'Samsung',
        };

        const result = store.validateRam(8, input);

        expect(result.isValid).toBe(true);
        expect(result.confidence).toBe('medium');
        expect(result.expectedRange).toBeDefined();
      });

      it('should flag out-of-range RAM', () => {
        const store = usePredictionValidationStore();
        const input = {
          battery: 4000,
          screen: 6.1,
          weight: 174,
          year: 2024,
          price: 999,
          company: 'Samsung',
        };

        const result = store.validateRam(50, input);

        expect(result.isValid).toBe(false);
        expect(result.message).toContain('outside typical RAM range');
      });
    });

    describe('validateBattery', () => {
      it('should validate battery within range', () => {
        const store = usePredictionValidationStore();
        const input = {
          ram: 8,
          screen: 6.1,
          weight: 174,
          year: 2024,
          price: 999,
          company: 'Samsung',
        };

        const result = store.validateBattery(4000, input);

        expect(result.isValid).toBe(true);
        expect(result.confidence).toBe('high');
        expect(result.expectedRange).toBeDefined();
      });

      it('should flag out-of-range battery', () => {
        const store = usePredictionValidationStore();
        const input = {
          ram: 8,
          screen: 6.1,
          weight: 174,
          year: 2024,
          price: 999,
          company: 'Samsung',
        };

        const result = store.validateBattery(1000, input);

        expect(result.isValid).toBe(false);
        expect(result.message).toContain('outside typical battery range');
      });
    });

    describe('validateBrand', () => {
      it('should always return valid for brand classification', () => {
        const store = usePredictionValidationStore();
        const input = {
          ram: 8,
          battery: 4000,
          screen: 6.1,
          weight: 174,
          year: 2024,
          price: 999,
        };

        const result = store.validateBrand('Apple', input);

        expect(result.isValid).toBe(true);
        expect(result.message).toContain('Brand classification accuracy');
      });

      it('should return medium confidence for brand', () => {
        const store = usePredictionValidationStore();
        const input = {
          ram: 8,
          battery: 4000,
          screen: 6.1,
          weight: 174,
          year: 2024,
          price: 999,
        };

        const result = store.validateBrand('Samsung', input);

        expect(result.confidence).toBe('medium');
      });
    });
  });
});
