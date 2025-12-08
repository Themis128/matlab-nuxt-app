import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useApiStore } from '../api.store';

// Mock useApiGateway
const mockApiGateway = {
  health: vi.fn(),
};

vi.mock('~/composables/useApiGateway', () => ({
  useApiGateway: () => mockApiGateway,
}));

describe('api.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('state', () => {
    it('should initialize with default state', () => {
      const store = useApiStore();

      expect(store.isOnline).toBe(false);
      expect(store.isChecking).toBe(false);
      expect(store.lastChecked).toBeNull();
      expect(store.error).toBeNull();
      expect(store.consecutiveFailures).toBe(0);
      expect(store.retryCount).toBe(0);
    });
  });

  describe('getters', () => {
    it('should format last checked time', () => {
      const store = useApiStore();
      store.lastChecked = Date.now();

      expect(store.lastCheckedFormatted).not.toBe('Never');
    });

    it('should return "Never" when lastChecked is null', () => {
      const store = useApiStore();
      store.lastChecked = null;

      expect(store.lastCheckedFormatted).toBe('Never');
    });

    it('should calculate time since last success', () => {
      const store = useApiStore();
      store.lastSuccessAt = Date.now() - 5000;

      expect(store.timeSinceLastSuccess).toBeGreaterThan(0);
    });

    it('should detect failure state', () => {
      const store = useApiStore();
      store.consecutiveFailures = 3;

      expect(store.isInFailureState).toBe(true);
    });

    it('should calculate connection quality', () => {
      const store = useApiStore();
      store.responseTime = 50;
      store.isOnline = true;

      expect(store.connectionQuality).toBe('excellent');
    });
  });

  describe('actions', () => {
    it('should check API health successfully', async () => {
      mockApiGateway.health.mockResolvedValue({
        success: true,
        data: { status: 'healthy' },
      });

      const store = useApiStore();
      await store.checkApiHealth();

      expect(store.isOnline).toBe(true);
      expect(store.consecutiveFailures).toBe(0);
    });

    it('should handle API health check failure', async () => {
      mockApiGateway.health.mockRejectedValue(new Error('Network error'));

      const store = useApiStore();
      await store.checkApiHealth();

      expect(store.isOnline).toBe(false);
      expect(store.consecutiveFailures).toBeGreaterThan(0);
    });

    it('should schedule retry', () => {
      const store = useApiStore();
      store.scheduleRetry();

      expect(store.isRetrying).toBe(true);
      expect(store.nextRetryAt).not.toBeNull();
    });

    it('should stop periodic health check', () => {
      const store = useApiStore();
      const interval = setInterval(() => {}, 1000);
      store._healthCheckInterval = interval;

      store.stopPeriodicHealthCheck();

      expect(store._healthCheckInterval).toBeNull();
    });

    it('should reset and retry', async () => {
      const store = useApiStore();
      store.consecutiveFailures = 5;
      store.retryCount = 3;

      store.resetAndRetry();

      expect(store.consecutiveFailures).toBe(0);
      expect(store.retryCount).toBe(0);
    });
  });
});
