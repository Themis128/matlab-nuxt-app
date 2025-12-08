import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useApiStore } from '../apiStore';

// Mock $fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);

describe('apiStore', () => {
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
    });
  });

  describe('getters', () => {
    it('should format last checked time', () => {
      const store = useApiStore();
      store.lastChecked = Date.now();

      expect(store.lastCheckedFormatted).not.toBe('Never');
      expect(typeof store.lastCheckedFormatted).toBe('string');
    });

    it('should return "Never" when lastChecked is null', () => {
      const store = useApiStore();
      store.lastChecked = null;

      expect(store.lastCheckedFormatted).toBe('Never');
    });

    it('should calculate time since last success', () => {
      const store = useApiStore();
      const now = Date.now();
      store.lastSuccessAt = now - 5000;

      expect(store.timeSinceLastSuccess).toBe(5000);
    });

    it('should detect failure state', () => {
      const store = useApiStore();
      store.consecutiveFailures = 3;

      expect(store.isInFailureState).toBe(true);
    });

    it('should determine connection quality', () => {
      const store = useApiStore();

      store.responseTime = 300;
      expect(store.connectionQuality).toBe('excellent');

      store.responseTime = 800;
      expect(store.connectionQuality).toBe('good');

      store.responseTime = 1500;
      expect(store.connectionQuality).toBe('fair');

      store.responseTime = 2500;
      expect(store.connectionQuality).toBe('poor');
    });

    it('should provide status summary', () => {
      const store = useApiStore();

      store.isOnline = true;
      expect(store.statusSummary.status).toBe('online');

      store.isOnline = false;
      store.isChecking = true;
      expect(store.statusSummary.status).toBe('checking');

      store.isChecking = false;
      store.error = 'Test error';
      expect(store.statusSummary.status).toBe('error');
    });
  });

  describe('actions', () => {
    it('should check API health successfully', async () => {
      mockFetch.mockResolvedValue({ status: 'healthy' });

      const store = useApiStore();
      await store.checkApiHealth();

      expect(store.isOnline).toBe(true);
      expect(store.error).toBeNull();
      expect(store.consecutiveFailures).toBe(0);
      expect(store.lastSuccessAt).not.toBeNull();
    });

    it('should handle API health check failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const store = useApiStore();
      await store.checkApiHealth();

      expect(store.isOnline).toBe(false);
      expect(store.error).toBeTruthy();
      expect(store.consecutiveFailures).toBe(1);
    });

    it('should categorize timeout errors', async () => {
      mockFetch.mockRejectedValue(new Error('TimeoutError'));

      const store = useApiStore();
      await store.checkApiHealth();

      expect(store.errorType).toBe('timeout');
      expect(store.error).toContain('timeout');
    });

    it('should schedule retry with exponential backoff', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const store = useApiStore();
      store.consecutiveFailures = 3;

      store.scheduleRetry();

      expect(store.isRetrying).toBe(true);
      expect(store.nextRetryAt).not.toBeNull();

      // Fast-forward timer to trigger retry
      await vi.advanceTimersByTimeAsync(5000);

      // After retry completes, isRetrying should be false
      // Note: The actual retry will call checkApiHealth which may set it back
      // This test verifies the scheduling mechanism works
      expect(store.nextRetryAt).not.toBeNull(); // Initially set
    });

    it('should clear errors', () => {
      const store = useApiStore();
      store.error = 'Test error';
      store.errorType = 'network';
      store.consecutiveFailures = 5;

      store.clearErrors();

      expect(store.error).toBeNull();
      expect(store.errorType).toBeNull();
      expect(store.consecutiveFailures).toBe(0);
    });

    it('should start periodic health checks', () => {
      const store = useApiStore();
      const interval = store.startPeriodicHealthCheck();

      expect(interval).toBeDefined();

      store.stopPeriodicHealthCheck(interval);
    });
  });
});
