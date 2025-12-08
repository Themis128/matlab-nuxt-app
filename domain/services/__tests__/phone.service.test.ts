/**
 * Phone Service Tests
 */

import { describe, it, expect } from 'vitest';
import { PhoneService } from '../phone.service';
import { Phone } from '../../models/phone.model';

describe('PhoneService', () => {
  const service = new PhoneService();

  describe('calculateValueScore', () => {
    it('should calculate value score correctly', () => {
      const phone = new Phone('1', {
        brand: 'Apple',
        model: 'iPhone 15',
        price: 999,
        ram: 8,
        battery: 4000,
      });

      const score = service.calculateValueScore(phone);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(10);
    });

    it('should return 0 for phones without required specs', () => {
      const phone = new Phone('1', {
        brand: 'Apple',
        model: 'iPhone',
      });

      expect(service.calculateValueScore(phone)).toBe(0);
    });
  });

  describe('comparePhones', () => {
    it('should compare two phones', () => {
      const phone1 = new Phone('1', {
        brand: 'Apple',
        model: 'iPhone 15',
        price: 999,
        ram: 8,
        battery: 4000,
      });

      const phone2 = new Phone('2', {
        brand: 'Samsung',
        model: 'Galaxy S24',
        price: 899,
        ram: 8,
        battery: 4000,
      });

      const comparison = service.comparePhones(phone1, phone2);
      expect(comparison.better).toBeDefined();
      expect(comparison.differences).toBeDefined();
    });
  });

  describe('filterPhones', () => {
    const phones = [
      new Phone('1', {
        brand: 'Apple',
        model: 'iPhone 15',
        price: 999,
        ram: 8,
      }),
      new Phone('2', {
        brand: 'Samsung',
        model: 'Galaxy S24',
        price: 899,
        ram: 12,
      }),
      new Phone('3', {
        brand: 'Apple',
        model: 'iPhone 14',
        price: 799,
        ram: 6,
      }),
    ];

    it('should filter by price range', () => {
      const filtered = service.filterPhones(phones, {
        minPrice: 800,
        maxPrice: 950,
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0]!.specs.price).toBe(899);
    });

    it('should filter by brand', () => {
      const filtered = service.filterPhones(phones, {
        brands: ['apple'],
      });

      expect(filtered.length).toBe(2);
      expect(filtered.every((p) => p.specs.brand.toLowerCase() === 'apple')).toBe(true);
    });
  });

  describe('sortPhones', () => {
    const phones = [
      new Phone('1', {
        brand: 'Apple',
        model: 'iPhone 15',
        price: 999,
        ram: 8,
        battery: 4000,
      }),
      new Phone('2', {
        brand: 'Samsung',
        model: 'Galaxy S24',
        price: 899,
        ram: 12,
        battery: 4000,
      }),
      new Phone('3', {
        brand: 'Apple',
        model: 'iPhone 14',
        price: 799,
        ram: 6,
        battery: 3500,
      }),
    ];

    it('should sort by price ascending', () => {
      const sorted = service.sortPhones(phones, 'price', 'asc');
      expect(sorted[0]!.specs.price).toBe(799);
      expect(sorted[2]!.specs.price).toBe(999);
    });

    it('should sort by price descending', () => {
      const sorted = service.sortPhones(phones, 'price', 'desc');
      expect(sorted[0]!.specs.price).toBe(999);
      expect(sorted[2]!.specs.price).toBe(799);
    });
  });
});
