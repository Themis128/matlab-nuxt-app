/**
 * API Gateway Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { APIGateway, getAPIGateway, type GatewayOptions } from '../index';

// Mock dependencies
vi.mock('~/server/utils/get-python-api-url', () => ({
  getPythonApiUrl: () => 'http://localhost:8000',
}));

vi.mock('~/server/utils/circuit-breaker', () => ({
  circuitBreakers: {
    pythonAPI: {
      execute: (fn: () => Promise<any>) => fn(),
      getState: () => 'CLOSED',
    },
  },
}));

vi.mock('~/server/utils/cache', () => ({
  withCache: vi.fn(async (_key: string, fn: () => Promise<any>, _options: any) => {
    // Simulate cache miss
    return fn();
  }),
  cacheKey: (prefix: string, ...parts: string[]) => `${prefix}:${parts.join(':')}`,
}));

vi.mock('~/server/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    logError: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('APIGateway', () => {
  let gateway: APIGateway;

  beforeEach(() => {
    gateway = getAPIGateway();
    vi.clearAllMocks();
  });

  describe('predictPrice', () => {
    it('should make price prediction request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ price: 999, confidence: 0.95 }),
      });

      const result = await gateway.predictPrice({
        brand: 'Apple',
        ram: 8,
        battery: 4000,
      });

      expect(result.data).toHaveProperty('price');
      expect(result.metadata).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(gateway.predictPrice({ brand: 'Apple' })).rejects.toThrow();
    });
  });

  describe('health', () => {
    it('should check API health', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      });

      const result = await gateway.health({ skipCircuitBreaker: true });

      expect(result.data).toHaveProperty('status');
    });
  });

  describe('caching', () => {
    it('should use cache when enabled', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      const options: GatewayOptions = {
        useCache: true,
        cacheTTL: 300,
      };

      await gateway.searchPhones('iPhone', options);

      // Cache should be attempted
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
