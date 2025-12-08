import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSentryMetrics } from '../useSentryMetrics';

// Mock useSentryUtils
const mockSentryInstance = {
  metrics: {
    count: vi.fn(),
    gauge: vi.fn(),
    distribution: vi.fn(),
    set: vi.fn(),
  },
};

vi.mock('~/composables/useSentryUtils', () => ({
  isSentryAvailable: () => true,
  getSentryInstance: () => mockSentryInstance,
}));

// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      client: true,
    },
  },
  writable: true,
});

// Mock performance
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
  },
  writable: true,
});

describe('useSentryMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return metrics methods', () => {
    const metrics = useSentryMetrics();

    expect(metrics).toHaveProperty('count');
    expect(metrics).toHaveProperty('gauge');
    expect(metrics).toHaveProperty('distribution');
    expect(metrics).toHaveProperty('set');
    expect(metrics).toHaveProperty('timing');
    expect(metrics).toHaveProperty('increment');
    expect(metrics).toHaveProperty('decrement');
  });

  it('should track counter', () => {
    const metrics = useSentryMetrics();
    metrics.count('test_counter', 5);

    expect(mockSentryInstance.metrics.count).toHaveBeenCalledWith('test_counter', 5, undefined);
  });

  it('should track gauge', () => {
    const metrics = useSentryMetrics();
    metrics.gauge('test_gauge', 100);

    expect(mockSentryInstance.metrics.gauge).toHaveBeenCalledWith('test_gauge', 100, undefined);
  });

  it('should track distribution', () => {
    const metrics = useSentryMetrics();
    metrics.distribution('test_dist', 50);

    expect(mockSentryInstance.metrics.distribution).toHaveBeenCalledWith(
      'test_dist',
      50,
      undefined
    );
  });

  it('should track set', () => {
    const metrics = useSentryMetrics();
    metrics.set('test_set', 'value1');

    expect(mockSentryInstance.metrics.set).toHaveBeenCalledWith('test_set', 'value1', undefined);
  });

  it('should increment counter', () => {
    const metrics = useSentryMetrics();
    metrics.increment('test_counter');

    expect(mockSentryInstance.metrics.count).toHaveBeenCalledWith('test_counter', 1, undefined);
  });

  it('should decrement counter', () => {
    const metrics = useSentryMetrics();
    metrics.decrement('test_counter');

    expect(mockSentryInstance.metrics.count).toHaveBeenCalledWith('test_counter', -1, undefined);
  });

  it('should track timing', async () => {
    const metrics = useSentryMetrics();
    const operation = vi.fn().mockResolvedValue('result');

    const result = await metrics.timing('test_op', operation);

    expect(operation).toHaveBeenCalled();
    expect(result).toBe('result');
    expect(mockSentryInstance.metrics.distribution).toHaveBeenCalled();
  });

  it('should track page view', () => {
    const metrics = useSentryMetrics();
    metrics.trackPageView('/test-page');

    expect(mockSentryInstance.metrics.count).toHaveBeenCalled();
  });

  it('should track interaction', () => {
    const metrics = useSentryMetrics();
    metrics.trackInteraction('click', 'button');

    expect(mockSentryInstance.metrics.count).toHaveBeenCalled();
  });

  it('should track API call', () => {
    const metrics = useSentryMetrics();
    metrics.trackApiCall('/api/test', 'GET', 200, 100);

    expect(mockSentryInstance.metrics.count).toHaveBeenCalled();
    expect(mockSentryInstance.metrics.distribution).toHaveBeenCalled();
  });

  it('should track error', () => {
    const metrics = useSentryMetrics();
    metrics.trackError('TypeError');

    expect(mockSentryInstance.metrics.count).toHaveBeenCalled();
  });

  it('should track performance', () => {
    const metrics = useSentryMetrics();
    metrics.trackPerformance('load_time', 100, 'ms');

    expect(mockSentryInstance.metrics.gauge).toHaveBeenCalled();
  });
});
