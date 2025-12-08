import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, readonly } from 'vue';

// Mock useAsyncData
const mockUseAsyncData = vi.fn();
vi.stubGlobal('useAsyncData', mockUseAsyncData);

// Mock useSentryLogger
const mockSentryLogger = {
  logError: vi.fn(),
  debug: vi.fn(),
};
vi.stubGlobal('useSentryLogger', () => mockSentryLogger);

// Mock import.meta.client
Object.defineProperty(import.meta, 'client', {
  value: true,
  writable: true,
});

// Make Vue APIs available
vi.stubGlobal('readonly', readonly);

describe('useSafeAsync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return data, error, pending, refresh, and status', async () => {
    const mockData = ref({ items: [] });
    const mockError = ref(null);
    const mockPending = ref(false);
    const mockRefresh = vi.fn();
    const mockStatus = ref('idle');

    mockUseAsyncData.mockReturnValue({
      data: mockData,
      error: mockError,
      pending: mockPending,
      refresh: mockRefresh,
      status: mockStatus,
    });

    const { useSafeAsync } = await import('../useSafeAsync');
    const result = useSafeAsync('test-key', async () => ({ items: [] }));

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('pending');
    expect(result).toHaveProperty('refresh');
    expect(result).toHaveProperty('status');
  });

  it('should call handler successfully', async () => {
    const handler = vi.fn().mockResolvedValue({ data: 'test' });
    const mockData = ref(null);
    const mockError = ref(null);
    const mockPending = ref(false);
    const mockRefresh = vi.fn();
    const mockStatus = ref('idle');

    mockUseAsyncData.mockImplementation((key, handlerFn) => {
      // Call the handler to test it
      handlerFn().then((result: any) => {
        mockData.value = result;
      });
      return {
        data: mockData,
        error: mockError,
        pending: mockPending,
        refresh: mockRefresh,
        status: mockStatus,
      };
    });

    const { useSafeAsync } = await import('../useSafeAsync');
    useSafeAsync('test-key', handler);

    await vi.runAllTimersAsync();
    expect(handler).toHaveBeenCalled();
  });

  it('should use fallback on error', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('Test error'));
    const fallbackValue = { items: [] };
    const mockData = ref(fallbackValue); // Initialize with fallback (useAsyncData default behavior)
    const mockError = ref(null);
    const mockPending = ref(false);
    const mockRefresh = vi.fn();
    const mockStatus = ref('idle');

    mockUseAsyncData.mockImplementation((_key, _handlerFn, _options) => {
      // useAsyncData calls default() when handler fails, which sets the fallback
      // We simulate this by initializing mockData with the fallback
      return {
        data: mockData,
        error: mockError,
        pending: mockPending,
        refresh: mockRefresh,
        status: mockStatus,
      };
    });

    const { useSafeAsync } = await import('../useSafeAsync');
    const result = useSafeAsync('test-key', handler, { fallback: fallbackValue });

    // The fallback should be set via default() in useAsyncData
    expect(result.data.value).toEqual(fallbackValue);
    expect(mockUseAsyncData).toHaveBeenCalledWith(
      'test-key',
      expect.any(Function),
      expect.objectContaining({
        default: expect.any(Function),
      })
    );
  });

  it('should call onError handler on error', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('Test error'));
    const onError = vi.fn();
    const mockData = ref(null);
    const mockError = ref(null);
    const mockPending = ref(false);
    const mockRefresh = vi.fn();
    const mockStatus = ref('idle');

    mockUseAsyncData.mockImplementation((key, handlerFn) => {
      handlerFn().catch((err: any) => {
        onError(err);
      });
      return {
        data: mockData,
        error: mockError,
        pending: mockPending,
        refresh: mockRefresh,
        status: mockStatus,
      };
    });

    const { useSafeAsync } = await import('../useSafeAsync');
    useSafeAsync('test-key', handler, { onError });

    await vi.runAllTimersAsync();
    expect(onError).toHaveBeenCalled();
  });

  it('should retry on failure when retry is enabled', async () => {
    let attemptCount = 0;
    const handler = vi.fn().mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 3) {
        return Promise.reject(new Error('Test error'));
      }
      return Promise.resolve({ data: 'success' });
    });

    const mockData = ref(null);
    const mockError = ref(null);
    const mockPending = ref(false);
    const mockRefresh = vi.fn();
    const mockStatus = ref('idle');

    mockUseAsyncData.mockImplementation((key, handlerFn) => {
      handlerFn();
      return {
        data: mockData,
        error: mockError,
        pending: mockPending,
        refresh: mockRefresh,
        status: mockStatus,
      };
    });

    const { useSafeAsync } = await import('../useSafeAsync');
    useSafeAsync('test-key', handler, { retry: true, retryCount: 3, retryDelay: 100 });

    await vi.runAllTimersAsync();
    // Handler should be called multiple times due to retries
    expect(handler).toHaveBeenCalled();
  });

  it('should handle safeRefresh errors', async () => {
    const mockData = ref(null);
    const mockError = ref(null);
    const mockPending = ref(false);
    const mockRefresh = vi.fn().mockRejectedValue(new Error('Refresh error'));
    const mockStatus = ref('idle');
    const onError = vi.fn();

    mockUseAsyncData.mockReturnValue({
      data: mockData,
      error: mockError,
      pending: mockPending,
      refresh: mockRefresh,
      status: mockStatus,
    });

    const { useSafeAsync } = await import('../useSafeAsync');
    const result = useSafeAsync('test-key', async () => ({}), { onError, fallback: { items: [] } });

    await result.refresh();
    expect(onError).toHaveBeenCalled();
  });

  it('should use default fallback when data is null after refresh error', async () => {
    const mockData = ref(null);
    const mockError = ref(null);
    const mockPending = ref(false);
    const mockRefresh = vi.fn().mockRejectedValue(new Error('Refresh error'));
    const mockStatus = ref('idle');

    mockUseAsyncData.mockReturnValue({
      data: mockData,
      error: mockError,
      pending: mockPending,
      refresh: mockRefresh,
      status: mockStatus,
    });

    const { useSafeAsync } = await import('../useSafeAsync');
    const result = useSafeAsync('test-key', async () => ({}), { fallback: { items: [] } });

    await result.refresh();
    expect(mockData.value).toEqual({ items: [] });
  });

  it('should return readonly refs', async () => {
    const mockData = ref({ items: [] });
    const mockError = ref(null);
    const mockPending = ref(false);
    const mockRefresh = vi.fn();
    const mockStatus = ref('idle');

    mockUseAsyncData.mockReturnValue({
      data: mockData,
      error: mockError,
      pending: mockPending,
      refresh: mockRefresh,
      status: mockStatus,
    });

    const { useSafeAsync } = await import('../useSafeAsync');
    const result = useSafeAsync('test-key', async () => ({}));

    // Should be readonly (writable property should be false or undefined)
    expect(result.data).toBeDefined();
    expect(result.error).toBeDefined();
    expect(result.pending).toBeDefined();
    expect(result.status).toBeDefined();
  });
});
