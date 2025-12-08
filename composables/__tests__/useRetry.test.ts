import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRetry } from '../useRetry';

describe('useRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const { retry } = useRetry();
      const fn = vi.fn().mockResolvedValue('success');

      const result = await retry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const { retry } = useRetry();
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const promise = retry(fn, 3, 100);

      // Fast-forward timers
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);

      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const { retry } = useRetry();
      const error = new Error('persistent failure');
      const fn = vi.fn().mockRejectedValue(error);

      const promise = retry(fn, 3, 100);

      // Fast-forward timers
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);
      await vi.advanceTimersByTimeAsync(400);

      // Properly handle the rejection using expect().rejects
      await expect(promise).rejects.toThrow('persistent failure');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff', async () => {
      const { retry } = useRetry();
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const promise = retry(fn, 3, 1000);

      // First retry after 1s
      await vi.advanceTimersByTimeAsync(1000);
      // Second retry after 2s
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;

      expect(result).toBe('success');
    });
  });

  describe('retryIf', () => {
    it('should retry only if shouldRetry returns true', async () => {
      const { retryIf } = useRetry();
      const shouldRetry = vi.fn((error: Error) => error.message.includes('retry'));
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('retry this'))
        .mockResolvedValue('success');

      const promise = retryIf(fn, shouldRetry, 3, 100);

      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;

      expect(result).toBe('success');
      expect(shouldRetry).toHaveBeenCalled();
    });

    it('should not retry if shouldRetry returns false', async () => {
      const { retryIf } = useRetry();
      const shouldRetry = vi.fn(() => false);
      const error = new Error('do not retry');
      const fn = vi.fn().mockRejectedValue(error);

      const promise = retryIf(fn, shouldRetry, 3, 100);

      await expect(promise).rejects.toThrow('do not retry');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(shouldRetry).toHaveBeenCalledWith(error);
    });
  });
});
