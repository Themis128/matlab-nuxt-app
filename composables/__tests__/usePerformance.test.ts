import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePerformance } from '../usePerformance';

// Mock performance store
const mockPerformanceStore = {
  trackMetric: vi.fn(),
  updatePageLoad: vi.fn(),
  updateWebVitals: vi.fn(),
};

vi.mock('~/stores/performanceStore', () => ({
  usePerformanceStore: () => mockPerformanceStore,
}));

// Mock Vue nextTick
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    nextTick: (fn: () => void) => Promise.resolve(fn()),
  };
});

describe('usePerformance', () => {
  let mockPerformance: any;
  let mockPerformanceObserver: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.performance
    mockPerformance = {
      getEntriesByType: vi.fn(),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(),
    };

    // Mock PerformanceObserver with observe method
    mockPerformanceObserver = vi.fn().mockImplementation(function (this: any, _callback: any) {
      this.observe = vi.fn();
      return this;
    });
    mockPerformanceObserver.prototype.observe = vi.fn();
    (global as any).PerformanceObserver = mockPerformanceObserver;

    // Mock window object
    const mockWindow = {
      performance: mockPerformance,
      dispatchEvent: vi.fn(),
    };

    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
      configurable: true,
    });

    // Also set up global performance (the composable uses performance directly, not window.performance)
    Object.defineProperty(global, 'performance', {
      value: mockPerformance,
      writable: true,
      configurable: true,
    });

    // Mock process
    (global as any).process = {
      client: true,
      dev: false,
      env: {
        NUXT_PUBLIC_PERFORMANCE_DEBUG: undefined,
      },
    };

    // Mock console
    global.console.error = vi.fn();
    global.console.warn = vi.fn();
    global.console.log = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return all performance methods', () => {
    const performance = usePerformance();

    expect(performance).toHaveProperty('measurePageLoad');
    expect(performance).toHaveProperty('measureResourceTiming');
    expect(performance).toHaveProperty('measureApiCall');
    expect(performance).toHaveProperty('getWebVitals');
    expect(performance).toHaveProperty('trackPerformanceMetric');
    expect(performance).toHaveProperty('initializePerformanceTracking');
  });

  it('should measure page load timing', () => {
    const mockNavTiming = {
      domainLookupStart: 0,
      domainLookupEnd: 10,
      connectStart: 10,
      connectEnd: 20,
      requestStart: 20,
      responseStart: 30,
      responseEnd: 40,
      domContentLoadedEventStart: 50,
      domContentLoadedEventEnd: 60,
      loadEventStart: 70,
      loadEventEnd: 80,
      fetchStart: 0,
    };

    mockPerformance.getEntriesByType.mockReturnValue([mockNavTiming]);

    const performance = usePerformance();
    const result = performance.measurePageLoad();

    expect(result).toEqual({
      dns: 10,
      tcp: 10,
      request: 10,
      response: 10,
      dom: 10,
      load: 10,
      total: 80,
    });
  });

  it('should return null if navigation timing not available', () => {
    mockPerformance.getEntriesByType.mockReturnValue([]);

    const performance = usePerformance();
    const result = performance.measurePageLoad();

    expect(result).toBeNull();
  });

  it('should return null when window is undefined', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const performance = usePerformance();
    const result = performance.measurePageLoad();

    expect(result).toBeNull();
  });

  it('should handle errors in measurePageLoad gracefully', () => {
    mockPerformance.getEntriesByType.mockImplementation(() => {
      throw new Error('Performance API error');
    });

    const performance = usePerformance();
    const result = performance.measurePageLoad();

    expect(result).toBeNull();
    expect(global.console.error).toHaveBeenCalled();
  });

  it('should measure resource timing', () => {
    const mockResource = {
      name: 'https://example.com/image.jpg',
      duration: 100,
      transferSize: 50000,
      initiatorType: 'img',
      startTime: 0,
    };

    mockPerformance.getEntriesByType.mockReturnValue([mockResource]);

    const performance = usePerformance();
    const result = performance.measureResourceTiming('image.jpg');

    expect(result).toEqual({
      name: 'https://example.com/image.jpg',
      duration: 100,
      size: 50000,
      type: 'img',
      startTime: 0,
    });
  });

  it('should return null if resource not found', () => {
    mockPerformance.getEntriesByType.mockReturnValue([]);

    const performance = usePerformance();
    const result = performance.measureResourceTiming('nonexistent.jpg');

    expect(result).toBeNull();
  });

  it('should return null when window is undefined for measureResourceTiming', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const performance = usePerformance();
    const result = performance.measureResourceTiming('test.jpg');

    expect(result).toBeNull();
  });

  it('should handle errors in measureResourceTiming gracefully', () => {
    mockPerformance.getEntriesByType.mockImplementation(() => {
      throw new Error('Performance API error');
    });

    const performance = usePerformance();
    const result = performance.measureResourceTiming('test.jpg');

    expect(result).toBeNull();
    expect(global.console.error).toHaveBeenCalled();
  });

  it('should measure API call duration', async () => {
    const mockMeasure = { duration: 150 };
    mockPerformance.getEntriesByName.mockReturnValue([mockMeasure]);

    const performance = usePerformance();
    const apiCall = vi.fn().mockResolvedValue({ data: 'result' });

    const result = await performance.measureApiCall(apiCall);

    expect(apiCall).toHaveBeenCalled();
    expect(mockPerformance.mark).toHaveBeenCalledTimes(2);
    expect(mockPerformance.measure).toHaveBeenCalled();
    expect(result).toEqual({ data: 'result' });
  });

  it('should track slow API calls', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockMeasure = { duration: 1500 }; // > 1000ms
    mockPerformance.getEntriesByName.mockReturnValue([mockMeasure]);

    const performance = usePerformance();
    const apiCall = vi.fn().mockResolvedValue({ data: 'result' });

    await performance.measureApiCall(apiCall);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Slow API call detected'));

    consoleSpy.mockRestore();
  });

  it('should handle API call errors', async () => {
    const performance = usePerformance();
    const apiCall = vi.fn().mockRejectedValue(new Error('API error'));

    await expect(performance.measureApiCall(apiCall)).rejects.toThrow('API error');
    expect(mockPerformance.mark).toHaveBeenCalledTimes(2);
  });

  it('should execute API call when window is undefined', async () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const performance = usePerformance();
    const apiCall = vi.fn().mockResolvedValue({ data: 'result' });

    const result = await performance.measureApiCall(apiCall);

    expect(result).toEqual({ data: 'result' });
    expect(apiCall).toHaveBeenCalled();
    expect(mockPerformance.mark).not.toHaveBeenCalled();
  });

  it('should execute API call when window.performance is undefined', async () => {
    Object.defineProperty(global, 'window', {
      value: { performance: undefined },
      writable: true,
      configurable: true,
    });

    const performance = usePerformance();
    const apiCall = vi.fn().mockResolvedValue({ data: 'result' });

    const result = await performance.measureApiCall(apiCall);

    expect(result).toEqual({ data: 'result' });
    expect(apiCall).toHaveBeenCalled();
  });

  it('should handle missing measure entry in measureApiCall', async () => {
    mockPerformance.getEntriesByName.mockReturnValue([]);

    const performance = usePerformance();
    const apiCall = vi.fn().mockResolvedValue({ data: 'result' });

    const result = await performance.measureApiCall(apiCall);

    expect(result).toEqual({ data: 'result' });
    expect(mockPerformance.mark).toHaveBeenCalledTimes(2);
  });

  it('should get web vitals', () => {
    const performance = usePerformance();
    const vitals = performance.getWebVitals();

    // Web vitals are cached globally, may be null initially
    expect(vitals).toHaveProperty('lcp');
    expect(vitals).toHaveProperty('fid');
    expect(vitals).toHaveProperty('cls');
  });

  it('should return null when window is undefined for getWebVitals', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const performance = usePerformance();
    const result = performance.getWebVitals();

    expect(result).toBeNull();
  });

  it('should return null when window.performance is undefined for getWebVitals', () => {
    Object.defineProperty(global, 'window', {
      value: { performance: undefined },
      writable: true,
      configurable: true,
    });

    const performance = usePerformance();
    const result = performance.getWebVitals();

    expect(result).toBeNull();
  });

  it('should track performance metric', () => {
    const performance = usePerformance();
    performance.trackPerformanceMetric('custom_metric', 100, 'ms');

    expect(mockPerformanceStore.trackMetric).toHaveBeenCalledWith('custom_metric', 100, 'ms');
  });

  it('should dispatch performance metric event', () => {
    const performance = usePerformance();
    performance.trackPerformanceMetric('custom_metric', 100, 'ms');

    expect((global as any).window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'performance-metric',
        detail: expect.objectContaining({
          name: 'custom_metric',
          value: 100,
          unit: 'ms',
        }),
      })
    );
  });

  it('should not track when window is undefined', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const performance = usePerformance();
    performance.trackPerformanceMetric('custom_metric', 100);

    expect(mockPerformanceStore.trackMetric).not.toHaveBeenCalled();
  });

  it('should handle store errors gracefully in trackPerformanceMetric', () => {
    mockPerformanceStore.trackMetric.mockImplementation(() => {
      throw new Error('Store error');
    });

    const performance = usePerformance();
    performance.trackPerformanceMetric('custom_metric', 100);

    expect(global.console.warn).toHaveBeenCalledWith(
      'Performance store not available:',
      expect.any(Error)
    );
  });

  it('should not dispatch event when process.client is false', () => {
    (global as any).process.client = false;

    const performance = usePerformance();
    performance.trackPerformanceMetric('custom_metric', 100);

    expect((global as any).window.dispatchEvent).not.toHaveBeenCalled();

    // Restore
    (global as any).process.client = true;
  });

  it('should log in development when debug enabled', () => {
    (global as any).process.dev = true;
    (global as any).process.env.NUXT_PUBLIC_PERFORMANCE_DEBUG = 'true';

    const performance = usePerformance();
    performance.trackPerformanceMetric('custom_metric', 100);

    expect(global.console.log).toHaveBeenCalledWith(
      'Performance Metric:',
      expect.objectContaining({
        name: 'custom_metric',
        value: 100,
      })
    );

    // Restore
    (global as any).process.dev = false;
    (global as any).process.env.NUXT_PUBLIC_PERFORMANCE_DEBUG = undefined;
  });

  it('should not log in production', () => {
    (global as any).process.dev = false;

    const performance = usePerformance();
    performance.trackPerformanceMetric('custom_metric', 100);

    expect(global.console.log).not.toHaveBeenCalled();
  });

  it('should initialize performance tracking', async () => {
    const mockNavTiming = {
      domainLookupStart: 0,
      domainLookupEnd: 10,
      connectStart: 10,
      connectEnd: 20,
      requestStart: 20,
      responseStart: 30,
      responseEnd: 40,
      domContentLoadedEventStart: 50,
      domContentLoadedEventEnd: 60,
      loadEventStart: 70,
      loadEventEnd: 80,
      fetchStart: 0,
    };

    mockPerformance.getEntriesByType.mockReturnValue([mockNavTiming]);

    const performance = usePerformance();
    performance.initializePerformanceTracking();

    // Wait for nextTick
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockPerformanceStore.updatePageLoad).toHaveBeenCalled();
    expect(mockPerformanceStore.trackMetric).toHaveBeenCalledWith('page_load_total', 80);
    expect(mockPerformanceStore.trackMetric).toHaveBeenCalledWith('page_load_dom', 10);
  });

  it('should not initialize when window is undefined', async () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const performance = usePerformance();
    performance.initializePerformanceTracking();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockPerformanceStore.updatePageLoad).not.toHaveBeenCalled();
  });

  it('should handle missing page load metrics', async () => {
    mockPerformance.getEntriesByType.mockReturnValue([]);

    const performance = usePerformance();
    performance.initializePerformanceTracking();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockPerformanceStore.updatePageLoad).not.toHaveBeenCalled();
  });

  it('should handle store errors gracefully in initializePerformanceTracking', async () => {
    const mockNavTiming = {
      domainLookupStart: 0,
      domainLookupEnd: 10,
      connectStart: 10,
      connectEnd: 20,
      requestStart: 20,
      responseStart: 30,
      responseEnd: 40,
      domContentLoadedEventStart: 50,
      domContentLoadedEventEnd: 60,
      loadEventStart: 70,
      loadEventEnd: 80,
      fetchStart: 0,
    };

    mockPerformance.getEntriesByType.mockReturnValue([mockNavTiming]);
    mockPerformanceStore.updatePageLoad.mockImplementation(() => {
      throw new Error('Store error');
    });

    const performance = usePerformance();
    performance.initializePerformanceTracking();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(global.console.warn).toHaveBeenCalled();
  });

  it('should track Web Vitals after delay', async () => {
    vi.useFakeTimers();

    const performance = usePerformance();
    performance.initializePerformanceTracking();

    // Wait for nextTick
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Fast-forward time
    vi.advanceTimersByTime(2000);

    // Should attempt to update Web Vitals
    expect(mockPerformanceStore.updateWebVitals).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should handle missing window.performance gracefully', () => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true,
    });

    const performance = usePerformance();
    const result = performance.measurePageLoad();

    expect(result).toBeNull();
  });

  it('should initialize Web Vitals observers on first use', () => {
    const _performance = usePerformance();

    // PerformanceObserver should be called (may be called multiple times for different observers)
    // Just verify it was called at least once
    expect(mockPerformanceObserver).toHaveBeenCalled();
  });

  it('should not initialize observers when PerformanceObserver is undefined', () => {
    (global as any).PerformanceObserver = undefined;

    // Should not throw
    expect(() => {
      usePerformance();
    }).not.toThrow();
  });

  it('should not initialize observers when window is undefined', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    // Should not throw
    expect(() => {
      usePerformance();
    }).not.toThrow();
  });
});
