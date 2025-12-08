import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useStoreSync } from '../useStoreSync';

// Mock stores
const mockPerformanceStore = {
  trackMetric: vi.fn(),
  updateWebVitals: vi.fn(),
  updatePageLoad: vi.fn(),
};

const mockSentryStore = {
  addError: vi.fn(),
};

vi.mock('~/stores/performanceStore', () => ({
  usePerformanceStore: () => mockPerformanceStore,
}));

vi.mock('~/stores/sentryStore', () => ({
  useSentryStore: () => mockSentryStore,
}));

// Mock usePerformance
const mockPerformance = {
  getWebVitals: vi.fn(() => ({ lcp: 100, fid: 50, cls: 0.1 })),
  measurePageLoad: vi.fn(() => ({ total: 1000, dom: 500 })),
};

vi.mock('~/composables/usePerformance', () => ({
  usePerformance: () => mockPerformance,
}));

describe('useStoreSync', () => {
  let mockWindow: any;
  let mockAddEventListener: any;
  let mockRemoveEventListener: any;
  let mockSetInterval: any;
  let mockClearInterval: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();
    mockSetInterval = vi.fn(() => 123);
    mockClearInterval = vi.fn();

    mockWindow = {
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    };

    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
      configurable: true,
    });

    global.setInterval = mockSetInterval;
    global.clearInterval = mockClearInterval;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return sync methods', () => {
    const sync = useStoreSync();

    expect(sync).toHaveProperty('initialize');
    expect(sync).toHaveProperty('syncPerformanceMetrics');
    expect(sync).toHaveProperty('syncSentryErrors');
  });

  it('should return early on server-side', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const sync = useStoreSync()!;
    sync.initialize();

    expect(mockAddEventListener).not.toHaveBeenCalled();
  });

  it('should sync performance metrics', () => {
    const sync = useStoreSync()!;
    const interval = sync.syncPerformanceMetrics();

    expect(mockAddEventListener).toHaveBeenCalledWith('performance-metric', expect.any(Function));
    expect(mockSetInterval).toHaveBeenCalled();
    expect(interval).toBe(123);
  });

  it('should handle performance metric events', () => {
    const sync = useStoreSync()!;
    sync.syncPerformanceMetrics();

    // Get the event listener
    const eventListener = mockAddEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'performance-metric'
    )?.[1];

    expect(eventListener).toBeDefined();

    // Simulate event
    const mockEvent = {
      detail: {
        name: 'test_metric',
        value: 100,
        unit: 'ms',
      },
    };

    eventListener(mockEvent);

    expect(mockPerformanceStore.trackMetric).toHaveBeenCalledWith(
      'test_metric',
      100,
      'ms',
      undefined
    );
  });

  it('should sync Web Vitals periodically', () => {
    const sync = useStoreSync()!;
    sync.syncPerformanceMetrics();

    // Fast-forward time
    vi.advanceTimersByTime(5000);

    expect(mockPerformance.getWebVitals).toHaveBeenCalled();
    expect(mockPerformanceStore.updateWebVitals).toHaveBeenCalled();
  });

  it('should sync page load metrics periodically', () => {
    const sync = useStoreSync()!;
    sync.syncPerformanceMetrics();

    // Fast-forward time
    vi.advanceTimersByTime(5000);

    expect(mockPerformance.measurePageLoad).toHaveBeenCalled();
    expect(mockPerformanceStore.updatePageLoad).toHaveBeenCalled();
  });

  it('should clean up interval on beforeunload', () => {
    const sync = useStoreSync()!;
    sync.syncPerformanceMetrics();

    // Get beforeunload listener
    const beforeunloadListener = mockAddEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'beforeunload'
    )?.[1];

    expect(beforeunloadListener).toBeDefined();

    // Simulate beforeunload
    beforeunloadListener();

    expect(mockClearInterval).toHaveBeenCalledWith(123);
  });

  it('should sync Sentry errors', () => {
    const sync = useStoreSync()!;
    sync.syncSentryErrors();

    expect(mockAddEventListener).toHaveBeenCalledWith('sentry-error', expect.any(Function));
  });

  it('should handle Sentry error events', () => {
    const sync = useStoreSync()!;
    sync.syncSentryErrors();

    // Get the event listener
    const eventListener = mockAddEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'sentry-error'
    )?.[1];

    expect(eventListener).toBeDefined();

    // Simulate event
    const mockEvent = {
      detail: {
        message: 'Test error',
        type: 'error',
        level: 'error',
        context: { component: 'test' },
      },
    };

    eventListener(mockEvent);

    expect(mockSentryStore.addError).toHaveBeenCalledWith({
      message: 'Test error',
      type: 'error',
      level: 'error',
      context: { component: 'test' },
    });
  });

  it('should initialize all syncs', () => {
    const sync = useStoreSync()!;
    sync.initialize();

    expect(mockAddEventListener).toHaveBeenCalled();
  });

  it('should handle performance sync errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockSetInterval.mockImplementation(() => {
      throw new Error('Interval error');
    });

    const sync = useStoreSync()!;
    const result = sync.syncPerformanceMetrics();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle Sentry sync errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockAddEventListener.mockImplementation(() => {
      throw new Error('Event listener error');
    });

    const sync = useStoreSync()!;
    sync.syncSentryErrors();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should not sync when vitals are null', () => {
    (mockPerformance.getWebVitals as any).mockReturnValue(null);
    const sync = useStoreSync()!;
    sync.syncPerformanceMetrics();

    vi.advanceTimersByTime(5000);

    expect(mockPerformanceStore.updateWebVitals).not.toHaveBeenCalled();
  });

  it('should not sync when page load is null', () => {
    (mockPerformance.measurePageLoad as any).mockReturnValue(null);
    const sync = useStoreSync()!;
    sync.syncPerformanceMetrics();

    vi.advanceTimersByTime(5000);

    expect(mockPerformanceStore.updatePageLoad).not.toHaveBeenCalled();
  });
});
