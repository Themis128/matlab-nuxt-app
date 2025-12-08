import { describe, it, expect } from 'vitest';

/**
 * Example utility test
 * This demonstrates how to test utility functions
 */

function add(a: number, b: number): number {
  return a + b;
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

describe('Utility Functions', () => {
  describe('add', () => {
    it('should add two numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
      expect(add(0, 0)).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(100)).toContain('100');
      expect(formatCurrency(1000)).toContain('1,000');
    });

    it('should use USD by default', () => {
      const result = formatCurrency(100);
      expect(result).toContain('$');
    });
  });
});
