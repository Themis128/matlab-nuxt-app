import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { computed } from 'vue';
import { useApi } from '../useApi';

// Make computed available globally for auto-imports
vi.stubGlobal('computed', computed);

// Mock dependencies
const mockApiStore = {
  checkApiHealth: vi.fn(),
  refreshStatus: vi.fn(),
  resetAndRetry: vi.fn(),
  startPeriodicHealthCheck: vi.fn(() => setInterval(() => {}, 1000)),
  stopPeriodicHealthCheck: vi.fn(),
  clearErrors: vi.fn(),
  forceOffline: vi.fn(),
  cleanup: vi.fn(),
  isOnline: true,
  isChecking: false,
  error: null,
  errorType: null,
  responseTime: 100,
  connectionQuality: 'good',
  statusSummary: 'online',
  isInFailureState: false,
  lastChecked: Date.now(),
  lastCheckedFormatted: 'just now',
  timeSinceLastSuccess: 0,
};

const mockGateway = {
  predictPrice: vi.fn(),
  predictRAM: vi.fn(),
  predictBattery: vi.fn(),
  predictBrand: vi.fn(),
  searchPhones: vi.fn(),
  health: vi.fn(),
};

vi.mock('~/app/application/features/api/store/api.store', () => ({
  useApiStore: () => mockApiStore,
}));

vi.mock('~/composables/useApiGateway', () => ({
  useApiGateway: () => mockGateway,
}));

describe('useApi', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('Health Check Methods', () => {
    it('should call store.checkApiHealth', async () => {
      const api = useApi();
      await api.checkApiHealth();

      expect(mockApiStore.checkApiHealth).toHaveBeenCalled();
    });

    it('should call store.refreshStatus', async () => {
      const api = useApi();
      await api.refreshStatus();

      expect(mockApiStore.refreshStatus).toHaveBeenCalled();
    });

    it('should call store.resetAndRetry', async () => {
      const api = useApi();
      await api.resetAndRetry();

      expect(mockApiStore.resetAndRetry).toHaveBeenCalled();
    });

    it('should start periodic health check', () => {
      const api = useApi();
      const interval = api.startPeriodicHealthCheck();

      expect(mockApiStore.startPeriodicHealthCheck).toHaveBeenCalled();
      expect(interval).toBeDefined();
    });

    it('should stop periodic health check', () => {
      const api = useApi();
      const interval = setInterval(() => {}, 1000);
      api.stopPeriodicHealthCheck(interval);

      expect(mockApiStore.stopPeriodicHealthCheck).toHaveBeenCalledWith(interval);
    });
  });

  describe('API Gateway Methods', () => {
    it('should call gateway.predictPrice', async () => {
      const mockResponse = { data: { price: 500 } };
      mockGateway.predictPrice.mockResolvedValue(mockResponse);

      const api = useApi();
      const result = await api.predictPrice({ brand: 'Apple' });

      expect(mockGateway.predictPrice).toHaveBeenCalledWith({ brand: 'Apple' }, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call gateway.predictPrice with options', async () => {
      const mockResponse = { data: { price: 500 } };
      mockGateway.predictPrice.mockResolvedValue(mockResponse);
      const options = { useCache: true, cacheTTL: 3600 };

      const api = useApi();
      const result = await api.predictPrice({ brand: 'Apple' }, options);

      expect(mockGateway.predictPrice).toHaveBeenCalledWith({ brand: 'Apple' }, options);
      expect(result).toEqual(mockResponse);
    });

    it('should call gateway.predictRAM', async () => {
      const mockResponse = { data: { ram: 8 } };
      mockGateway.predictRAM.mockResolvedValue(mockResponse);

      const api = useApi();
      const result = await api.predictRAM({ brand: 'Samsung' });

      expect(mockGateway.predictRAM).toHaveBeenCalledWith({ brand: 'Samsung' }, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call gateway.predictBattery', async () => {
      const mockResponse = { data: { battery: 4000 } };
      mockGateway.predictBattery.mockResolvedValue(mockResponse);

      const api = useApi();
      const result = await api.predictBattery({ brand: 'Xiaomi' });

      expect(mockGateway.predictBattery).toHaveBeenCalledWith({ brand: 'Xiaomi' }, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call gateway.predictBrand', async () => {
      const mockResponse = { data: { brand: 'Apple' } };
      mockGateway.predictBrand.mockResolvedValue(mockResponse);

      const api = useApi();
      const result = await api.predictBrand({ price: 1000 });

      expect(mockGateway.predictBrand).toHaveBeenCalledWith({ price: 1000 }, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call gateway.searchPhones', async () => {
      const mockResponse = { data: { results: [] } };
      mockGateway.searchPhones.mockResolvedValue(mockResponse);

      const api = useApi();
      const result = await api.searchPhones('iPhone');

      expect(mockGateway.searchPhones).toHaveBeenCalledWith('iPhone', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should call gateway.health', async () => {
      const mockResponse = { data: { status: 'healthy' } };
      mockGateway.health.mockResolvedValue(mockResponse);

      const api = useApi();
      const result = await api.health();

      expect(mockGateway.health).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Management', () => {
    it('should call store.clearErrors', () => {
      const api = useApi();
      api.clearErrors();

      expect(mockApiStore.clearErrors).toHaveBeenCalled();
    });

    it('should call store.forceOffline', () => {
      const api = useApi();
      api.forceOffline();

      expect(mockApiStore.forceOffline).toHaveBeenCalled();
    });

    it('should call store.cleanup', () => {
      const api = useApi();
      api.cleanup();

      expect(mockApiStore.cleanup).toHaveBeenCalled();
    });
  });

  describe('Computed Properties', () => {
    it('should expose isOnline computed', () => {
      const api = useApi();
      expect(api.isOnline.value).toBe(true);
    });

    it('should expose isChecking computed', () => {
      const api = useApi();
      expect(api.isChecking.value).toBe(false);
    });

    it('should expose error computed', () => {
      const api = useApi();
      expect(api.error.value).toBeNull();
    });

    it('should expose errorType computed', () => {
      const api = useApi();
      expect(api.errorType.value).toBeNull();
    });

    it('should expose responseTime computed', () => {
      const api = useApi();
      expect(api.responseTime.value).toBe(100);
    });

    it('should expose connectionQuality computed', () => {
      const api = useApi();
      expect(api.connectionQuality.value).toBe('good');
    });

    it('should expose statusSummary computed', () => {
      const api = useApi();
      expect(api.statusSummary.value).toBe('online');
    });

    it('should expose isInFailureState computed', () => {
      const api = useApi();
      expect(api.isInFailureState.value).toBe(false);
    });

    it('should expose lastChecked computed', () => {
      const api = useApi();
      expect(api.lastChecked.value).toBeDefined();
    });

    it('should expose lastCheckedFormatted computed', () => {
      const api = useApi();
      expect(api.lastCheckedFormatted.value).toBe('just now');
    });

    it('should expose timeSinceLastSuccess computed', () => {
      const api = useApi();
      expect(api.timeSinceLastSuccess.value).toBe(0);
    });
  });
});
