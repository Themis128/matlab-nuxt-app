/**
 * Prediction Service Tests
 */

import { describe, it, expect } from 'vitest';
import { PredictionService } from '../prediction.service';
import { Prediction } from '../../models/prediction.model';

describe('PredictionService', () => {
  const service = new PredictionService();

  describe('validateInput', () => {
    it('should validate correct input', () => {
      const input = {
        brand: 'Apple',
        price: 999,
        ram: 8,
        battery: 4000,
      };
      expect(service.validateInput(input)).toBe(true);
    });

    it('should reject invalid input', () => {
      const input = {
        price: -100, // Invalid: negative price
      };
      expect(service.validateInput(input)).toBe(false);
    });
  });

  describe('calculateInputQuality', () => {
    it('should return 1.0 for all required fields', () => {
      const input = {
        brand: 'Apple',
        price: 999,
        ram: 8,
        battery: 4000,
      };
      expect(service.calculateInputQuality(input)).toBe(1.0);
    });

    it('should return 0.5 for half the fields', () => {
      const input = {
        brand: 'Apple',
        price: 999,
      };
      expect(service.calculateInputQuality(input)).toBe(0.5);
    });
  });

  describe('shouldCache', () => {
    it('should cache high confidence predictions', () => {
      const prediction = new Prediction(
        { brand: 'Apple' },
        { prediction: 999, confidence: 0.9 },
        'price'
      );
      expect(service.shouldCache(prediction)).toBe(true);
    });

    it('should not cache low confidence predictions', () => {
      const prediction = new Prediction(
        { brand: 'Apple' },
        { prediction: 999, confidence: 0.5 },
        'price'
      );
      expect(service.shouldCache(prediction)).toBe(false);
    });
  });

  describe('formatPrediction', () => {
    it('should format price correctly', () => {
      const prediction = new Prediction({ brand: 'Apple' }, { prediction: 999 }, 'price');
      const formatted = service.formatPrediction(prediction, 'price');
      expect(formatted).toContain('$');
      expect(formatted).toContain('999');
    });

    it('should format RAM correctly', () => {
      const prediction = new Prediction({ brand: 'Apple' }, { prediction: 8 }, 'ram');
      const formatted = service.formatPrediction(prediction, 'ram');
      expect(formatted).toBe('8GB');
    });
  });
});
