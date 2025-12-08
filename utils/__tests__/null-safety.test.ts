import { describe, it, expect, vi } from 'vitest';
import { safeGet, safeCall, safeArrayGet, safeParseJSON } from '../null-safety';

describe('null-safety utilities', () => {
  describe('safeGet', () => {
    it('should return value when path exists', () => {
      const obj = { user: { name: 'John' } };
      expect(safeGet(obj, 'user.name', '')).toBe('John');
    });

    it('should return default when path does not exist', () => {
      const obj = { user: {} };
      expect(safeGet(obj, 'user.name', 'Unknown')).toBe('Unknown');
    });

    it('should return default when object is null', () => {
      expect(safeGet(null, 'user.name', 'Unknown')).toBe('Unknown');
    });

    it('should return default when object is undefined', () => {
      expect(safeGet(undefined, 'user.name', 'Unknown')).toBe('Unknown');
    });
  });

  describe('safeCall', () => {
    it('should call function and return result', () => {
      const fn = vi.fn(() => 'result');
      expect(safeCall(fn, '')).toBe('result');
      expect(fn).toHaveBeenCalled();
    });

    it('should return default when function throws', () => {
      const fn = vi.fn(() => {
        throw new Error('Error');
      });
      expect(safeCall(fn, 'default')).toBe('default');
    });

    it('should return default when function is null', () => {
      expect(safeCall(null, 'default')).toBe('default');
    });
  });

  describe('safeArrayGet', () => {
    it('should return array element when index is valid', () => {
      const array = [1, 2, 3];
      expect(safeArrayGet(array, 1, 0)).toBe(2);
    });

    it('should return default when index is out of bounds', () => {
      const array = [1, 2, 3];
      expect(safeArrayGet(array, 10, 0)).toBe(0);
    });

    it('should return default when array is null', () => {
      expect(safeArrayGet(null, 0, 0)).toBe(0);
    });
  });

  describe('safeParseJSON', () => {
    it('should parse valid JSON', () => {
      const json = '{"name": "John"}';
      expect(safeParseJSON(json, {})).toEqual({ name: 'John' });
    });

    it('should return default when JSON is invalid', () => {
      const json = 'invalid json';
      expect(safeParseJSON(json, {})).toEqual({});
    });

    it('should return default when input is null', () => {
      expect(safeParseJSON(null, {})).toEqual({});
    });
  });
});
