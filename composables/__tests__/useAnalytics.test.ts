import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock window and global objects
const mockGtag = vi.fn();
const mockPlausible = vi.fn();
const mockDispatchEvent = vi.fn();

// Mock process.client
vi.stubGlobal('process', {
  client: true,
  dev: false,
});

// Mock analytics store
const mockAnalyticsStore = {
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
};

vi.mock('~/app/application/features/analytics/store/analytics.store', () => ({
  useAnalyticsStore: () => mockAnalyticsStore,
}));

// Import after mocks
import { useAnalytics } from '../useAnalytics';

// Setup window mocks
beforeEach(() => {
  vi.clearAllMocks();

  // Reset window mocks
  global.window = {
    gtag: mockGtag,
    plausible: mockPlausible,
    dispatchEvent: mockDispatchEvent,
  } as any;

  // Mock process
  global.process = {
    client: true,
    dev: false,
  } as any;
});

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset window mocks
    global.window = {
      gtag: mockGtag,
      plausible: mockPlausible,
      dispatchEvent: mockDispatchEvent,
    } as any;
  });

  it('should track event', () => {
    const analytics = useAnalytics();

    analytics.trackEvent('test_event', { key: 'value' });

    expect(mockAnalyticsStore.trackEvent).toHaveBeenCalledWith('test_event', { key: 'value' });
    expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', { key: 'value' });
    expect(mockPlausible).toHaveBeenCalledWith('test_event', { props: { key: 'value' } });
    expect(mockDispatchEvent).toHaveBeenCalled();
  });

  it('should track event without properties', () => {
    const analytics = useAnalytics();

    analytics.trackEvent('simple_event');

    expect(mockAnalyticsStore.trackEvent).toHaveBeenCalledWith('simple_event', undefined);
    expect(mockGtag).toHaveBeenCalledWith('event', 'simple_event', undefined);
    expect(mockPlausible).toHaveBeenCalledWith('simple_event', { props: undefined });
  });

  it('should track page view', () => {
    const analytics = useAnalytics();

    analytics.trackPageView('/test-page', 'Test Page');

    expect(mockAnalyticsStore.trackPageView).toHaveBeenCalledWith('/test-page', 'Test Page');
    expect(mockGtag).toHaveBeenCalledWith('config', 'GA_MEASUREMENT_ID', {
      page_path: '/test-page',
      page_title: 'Test Page',
    });
    expect(mockPlausible).toHaveBeenCalledWith('pageview', {
      props: { path: '/test-page', title: 'Test Page' },
    });
  });

  it('should track page view without title', () => {
    const analytics = useAnalytics();

    analytics.trackPageView('/test-page');

    expect(mockAnalyticsStore.trackPageView).toHaveBeenCalledWith('/test-page', undefined);
  });

  it('should track dataset action', () => {
    const analytics = useAnalytics();

    analytics.trackDatasetAction('search', { query: 'iPhone' });

    expect(mockAnalyticsStore.trackEvent).toHaveBeenCalledWith('dataset_action', {
      action: 'search',
      query: 'iPhone',
    });
  });

  it('should track prediction', () => {
    const analytics = useAnalytics();

    analytics.trackPrediction('price', 0.95);

    expect(mockAnalyticsStore.trackEvent).toHaveBeenCalledWith('prediction_made', {
      model_type: 'price',
      accuracy: 0.95,
    });
  });

  it('should track error', () => {
    const analytics = useAnalytics();

    const error = new Error('Test error');
    analytics.trackError(error, { context: 'test' });

    expect(mockAnalyticsStore.trackEvent).toHaveBeenCalledWith('error_occurred', {
      error_message: 'Test error',
      error_stack: error.stack,
      context: 'test',
    });
  });

  it('should handle missing gtag gracefully', () => {
    delete (global.window as any).gtag;
    const analytics = useAnalytics();

    expect(() => analytics.trackEvent('test')).not.toThrow();
  });

  it('should handle missing plausible gracefully', () => {
    delete (global.window as any).plausible;
    const analytics = useAnalytics();

    expect(() => analytics.trackEvent('test')).not.toThrow();
  });

  it('should handle analytics store errors gracefully', () => {
    mockAnalyticsStore.trackEvent.mockImplementation(() => {
      throw new Error('Store error');
    });
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const analytics = useAnalytics();

    expect(() => analytics.trackEvent('test')).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should not track on server-side', () => {
    // Temporarily set window to undefined
    const originalWindow = global.window;
    global.window = undefined as any;

    const analytics = useAnalytics();

    analytics.trackEvent('test');
    analytics.trackPageView('/test');

    // Should not throw, but also should not call any tracking methods
    expect(mockAnalyticsStore.trackEvent).not.toHaveBeenCalled();
    expect(mockAnalyticsStore.trackPageView).not.toHaveBeenCalled();

    // Restore window
    global.window = originalWindow;
  });
});
