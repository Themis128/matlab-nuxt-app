import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSentryErrorFilter } from '../useSentryErrorFilter';

// Mock dependencies
const mockCaptureException = vi.fn();
const mockSentryLogger = {
  debug: vi.fn(),
};

vi.mock('~/composables/useSentryUtils', () => ({
  captureException: (...args: any[]) => mockCaptureException(...args),
}));

vi.mock('~/composables/useSentryLogger', () => ({
  useSentryLogger: () => mockSentryLogger,
}));

describe('useSentryErrorFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return filter methods', () => {
    const filter = useSentryErrorFilter();

    expect(filter).toHaveProperty('addFilter');
    expect(filter).toHaveProperty('clearFilters');
    expect(filter).toHaveProperty('processError');
    expect(filter).toHaveProperty('captureFilteredError');
  });

  it('should add filter rule', () => {
    const filter = useSentryErrorFilter();
    filter.addFilter({
      pattern: /test/i,
      action: 'ignore',
    });

    const error = new Error('test error');
    const result = filter.processError(error);

    expect(result).toBe(false);
    expect(mockSentryLogger.debug).toHaveBeenCalled();
  });

  it('should ignore errors matching pattern', () => {
    const filter = useSentryErrorFilter();
    filter.addFilter({
      pattern: /network/i,
      action: 'ignore',
    });

    const error = new Error('Network error occurred');
    const result = filter.processError(error);

    expect(result).toBe(false);
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('should modify errors', () => {
    const filter = useSentryErrorFilter();
    filter.addFilter({
      pattern: /test/i,
      action: 'modify',
      message: 'Modified error',
    });

    const error = new Error('test error');
    const result = filter.processError(error);

    expect(result).toBe(true);
    expect(mockCaptureException).toHaveBeenCalled();
  });

  it('should tag errors', () => {
    const filter = useSentryErrorFilter();
    filter.addFilter({
      pattern: /test/i,
      action: 'tag',
      tags: { category: 'test' },
    });

    const error = new Error('test error');
    const result = filter.processError(error);

    expect(result).toBe(true);
    expect(mockCaptureException).toHaveBeenCalled();
  });

  it('should clear all filters', () => {
    const filter = useSentryErrorFilter();
    filter.addFilter({ pattern: /test/i, action: 'ignore' });
    filter.clearFilters();

    const error = new Error('test error');
    const result = filter.processError(error);

    expect(result).toBe(true); // Should send normally
  });

  it('should capture filtered error', () => {
    const filter = useSentryErrorFilter();
    const error = new Error('test error');

    filter.captureFilteredError(error);

    expect(mockCaptureException).toHaveBeenCalled();
  });
});
