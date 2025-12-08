import { describe, it, expect } from 'vitest';
import { usePredictionValidation } from '../usePredictionValidation';

describe('usePredictionValidation', () => {
  const { validatePrice, validateRam, validateBattery, validateBrand } = usePredictionValidation();

  describe('validatePrice', () => {
    it('should validate price within typical range', () => {
      const result = validatePrice(500, {
        ram: 8,
        battery: 4000,
        screen: 6.5,
        weight: 200,
        year: 2023,
        company: 'Samsung',
      });

      expect(result.isValid).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.message).toContain('within expected range');
    });

    it('should flag price outside typical range', () => {
      const result = validatePrice(50, {
        ram: 8,
        battery: 4000,
        screen: 6.5,
        weight: 200,
        year: 2023,
        company: 'Samsung',
      });

      expect(result.isValid).toBe(false);
      expect(result.confidence).toBe('low');
      expect(result.message).toContain('outside typical price range');
    });

    it('should flag unusually low Apple price', () => {
      const result = validatePrice(300, {
        ram: 8,
        battery: 4000,
        screen: 6.5,
        weight: 200,
        year: 2023,
        company: 'Apple',
      });

      expect(result.isValid).toBe(true); // Still in range
      expect(result.confidence).toBe('low');
      expect(result.message).toContain('unusually low for an Apple device');
    });

    it('should flag unrealistic high-end device price', () => {
      const result = validatePrice(500, {
        ram: 16,
        battery: 6000,
        screen: 7,
        weight: 250,
        year: 2024,
        company: 'Samsung',
      });

      expect(result.isValid).toBe(true);
      expect(result.confidence).toBe('low');
      expect(result.message).toContain('seems low for a high-end');
    });
  });

  describe('validateRam', () => {
    it('should validate RAM within typical range', () => {
      const result = validateRam(8, {
        battery: 4000,
        screen: 6.5,
        weight: 200,
        year: 2023,
        price: 500,
        company: 'Samsung',
      });

      expect(result.isValid).toBe(true);
      expect(result.confidence).toBe('medium');
      expect(result.message).toContain('within expected range');
    });

    it('should flag RAM outside typical range', () => {
      const result = validateRam(1, {
        battery: 4000,
        screen: 6.5,
        weight: 200,
        year: 2023,
        price: 500,
        company: 'Samsung',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('outside typical RAM range');
    });
  });

  describe('validateBattery', () => {
    it('should validate battery within typical range', () => {
      const result = validateBattery(4000, {
        ram: 8,
        screen: 6.5,
        weight: 200,
        year: 2023,
        price: 500,
        company: 'Samsung',
      });

      expect(result.isValid).toBe(true);
      expect(result.confidence).toBe('high');
      expect(result.message).toContain('within expected range');
    });

    it('should flag battery outside typical range', () => {
      const result = validateBattery(1000, {
        ram: 8,
        screen: 6.5,
        weight: 200,
        year: 2023,
        price: 500,
        company: 'Samsung',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('outside typical battery range');
    });
  });

  describe('validateBrand', () => {
    it('should always return valid for brand classification', () => {
      const result = validateBrand('Samsung', {
        ram: 8,
        battery: 4000,
        screen: 6.5,
        weight: 200,
        year: 2023,
        price: 500,
      });

      expect(result.isValid).toBe(true);
      expect(result.confidence).toBe('medium');
      expect(result.message).toContain('accuracy');
    });
  });
});
