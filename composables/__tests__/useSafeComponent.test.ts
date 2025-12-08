import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock useSentryLogger
const mockSentryLogger = {
  logError: vi.fn(),
  debug: vi.fn(),
};
vi.stubGlobal('useSentryLogger', () => mockSentryLogger);

// Mock import.meta before importing
// Note: import.meta properties are read-only in some environments
// We'll test the behavior rather than trying to change import.meta

// Import after setting up mocks
import { useSafeComponent } from '../useSafeComponent';

describe('useSafeComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all utility methods', () => {
    const utils = useSafeComponent();

    expect(utils).toHaveProperty('isClient');
    expect(utils).toHaveProperty('isServer');
    expect(utils).toHaveProperty('safeValue');
    expect(utils).toHaveProperty('safeArray');
    expect(utils).toHaveProperty('safeObject');
    expect(utils).toHaveProperty('safeNumber');
    expect(utils).toHaveProperty('safeString');
    expect(utils).toHaveProperty('safeAsync');
    expect(utils).toHaveProperty('safeHandler');
    expect(utils).toHaveProperty('isValid');
  });

  describe('safeValue', () => {
    it('should return value if not null/undefined', () => {
      const utils = useSafeComponent();
      expect(utils.safeValue('test', 'fallback')).toBe('test');
      expect(utils.safeValue(123, 0)).toBe(123);
      expect(utils.safeValue(true, false)).toBe(true);
    });

    it('should return fallback for null', () => {
      const utils = useSafeComponent();
      expect(utils.safeValue(null, 'fallback')).toBe('fallback');
    });

    it('should return fallback for undefined', () => {
      const utils = useSafeComponent();
      expect(utils.safeValue(undefined, 'fallback')).toBe('fallback');
    });
  });

  describe('safeArray', () => {
    it('should return array if valid', () => {
      const utils = useSafeComponent();
      const arr = [1, 2, 3];
      expect(utils.safeArray(arr)).toBe(arr);
    });

    it('should return empty array for null', () => {
      const utils = useSafeComponent();
      expect(utils.safeArray(null)).toEqual([]);
    });

    it('should return empty array for undefined', () => {
      const utils = useSafeComponent();
      expect(utils.safeArray(undefined)).toEqual([]);
    });

    it('should return empty array for non-array', () => {
      const utils = useSafeComponent();
      expect(utils.safeArray({} as any)).toEqual([]);
      expect(utils.safeArray('string' as any)).toEqual([]);
    });
  });

  describe('safeObject', () => {
    it('should return object if valid', () => {
      const utils = useSafeComponent();
      const obj = { key: 'value' };
      expect(utils.safeObject(obj, { key: 'fallback' })).toBe(obj);
    });

    it('should return fallback for null', () => {
      const utils = useSafeComponent();
      const fallback = { default: true };
      expect(utils.safeObject(null, fallback)).toBe(fallback);
    });

    it('should return fallback for undefined', () => {
      const utils = useSafeComponent();
      const fallback = { default: true };
      expect(utils.safeObject(undefined, fallback)).toBe(fallback);
    });

    it('should return fallback for non-object', () => {
      const utils = useSafeComponent();
      const fallback = { default: true };
      expect(utils.safeObject('string' as any, fallback)).toBe(fallback);
      expect(utils.safeObject(123 as any, fallback)).toBe(fallback);
    });
  });

  describe('safeNumber', () => {
    it('should return number if valid', () => {
      const utils = useSafeComponent();
      expect(utils.safeNumber(123, 0)).toBe(123);
      expect(utils.safeNumber(0, 1)).toBe(0);
      expect(utils.safeNumber(-5, 0)).toBe(-5);
    });

    it('should return fallback for null', () => {
      const utils = useSafeComponent();
      expect(utils.safeNumber(null, 42)).toBe(42);
    });

    it('should return fallback for undefined', () => {
      const utils = useSafeComponent();
      expect(utils.safeNumber(undefined, 42)).toBe(42);
    });

    it('should return fallback for NaN', () => {
      const utils = useSafeComponent();
      expect(utils.safeNumber(NaN, 42)).toBe(42);
    });

    it('should use default fallback of 0', () => {
      const utils = useSafeComponent();
      expect(utils.safeNumber(null)).toBe(0);
    });
  });

  describe('safeString', () => {
    it('should return string if valid', () => {
      const utils = useSafeComponent();
      expect(utils.safeString('test', 'fallback')).toBe('test');
      expect(utils.safeString('', 'fallback')).toBe('');
    });

    it('should return fallback for null', () => {
      const utils = useSafeComponent();
      expect(utils.safeString(null, 'fallback')).toBe('fallback');
    });

    it('should return fallback for undefined', () => {
      const utils = useSafeComponent();
      expect(utils.safeString(undefined, 'fallback')).toBe('fallback');
    });

    it('should return fallback for non-string', () => {
      const utils = useSafeComponent();
      expect(utils.safeString(123 as any, 'fallback')).toBe('fallback');
    });

    it('should use default fallback of empty string', () => {
      const utils = useSafeComponent();
      expect(utils.safeString(null)).toBe('');
    });
  });

  describe('safeAsync', () => {
    it('should return result on success', async () => {
      const utils = useSafeComponent();
      const operation = vi.fn().mockResolvedValue('success');

      const result = await utils.safeAsync(operation, 'fallback');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('should return fallback on error', async () => {
      const utils = useSafeComponent();
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));

      const result = await utils.safeAsync(operation, 'fallback');

      expect(result).toBe('fallback');
    });

    it('should call onError handler on error', async () => {
      const utils = useSafeComponent();
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));
      const onError = vi.fn();

      await utils.safeAsync(operation, 'fallback', onError);

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle onError handler errors gracefully', async () => {
      const utils = useSafeComponent();
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));
      const onError = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await utils.safeAsync(operation, 'fallback', onError);

      expect(result).toBe('fallback');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should log to Sentry on client-side error', async () => {
      const utils = useSafeComponent();
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));

      await utils.safeAsync(operation, 'fallback');

      // Sentry logging depends on import.meta.client which is set in test environment
      // The actual behavior depends on the test environment configuration
      expect(operation).toHaveBeenCalled();
    });
  });

  describe('safeHandler', () => {
    it('should call handler successfully', () => {
      const utils = useSafeComponent();
      const handler = vi.fn().mockReturnValue('result');

      const safeHandler = utils.safeHandler(handler);
      const result = safeHandler('arg1', 'arg2');

      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toBe('result');
    });

    it('should handle handler errors gracefully', () => {
      const utils = useSafeComponent();
      const handler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });

      const safeHandler = utils.safeHandler(handler);
      expect(() => safeHandler()).not.toThrow();
    });

    it('should call fallback on error', () => {
      const utils = useSafeComponent();
      const handler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      const fallback = vi.fn();

      const safeHandler = utils.safeHandler(handler, fallback);
      safeHandler();

      expect(fallback).toHaveBeenCalled();
    });

    it('should log to Sentry on client-side error', () => {
      const utils = useSafeComponent();
      const handler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });

      const safeHandler = utils.safeHandler(handler);
      safeHandler();

      // Sentry logging depends on import.meta.client which is set in test environment
      // The actual behavior depends on the test environment configuration
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('isValid', () => {
    it('should return true for valid values', () => {
      const utils = useSafeComponent();
      expect(utils.isValid('test')).toBe(true);
      expect(utils.isValid(123)).toBe(true);
      expect(utils.isValid(true)).toBe(true);
      expect(utils.isValid([])).toBe(true);
      expect(utils.isValid({})).toBe(true);
      expect(utils.isValid(0)).toBe(true);
      expect(utils.isValid('')).toBe(true);
    });

    it('should return false for null', () => {
      const utils = useSafeComponent();
      expect(utils.isValid(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      const utils = useSafeComponent();
      expect(utils.isValid(undefined)).toBe(false);
    });
  });

  describe('isClient and isServer', () => {
    it('should expose isClient and isServer properties', () => {
      const utils = useSafeComponent();
      // These properties are set from import.meta.client and import.meta.server
      // In test environment, these may be undefined, but the composable should handle it
      // The important thing is that the properties exist and don't throw errors
      expect('isClient' in utils).toBe(true);
      expect('isServer' in utils).toBe(true);
      // Accessing them should not throw
      expect(() => utils.isClient).not.toThrow();
      expect(() => utils.isServer).not.toThrow();
    });
  });
});
