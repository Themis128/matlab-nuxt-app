import { describe, it, expect } from 'vitest';
import { resolve, normalize } from 'path';

/**
 * Path validation utility functions
 * These mirror the validation logic used in the codebase
 */

function validatePath(pathToCheck: string, baseDir: string): string | null {
  try {
    const resolved = resolve(baseDir, pathToCheck);
    const normalized = normalize(resolved);
    const normalizedBase = normalize(baseDir);

    if (!normalized.startsWith(normalizedBase)) {
      return null;
    }

    // Check for path traversal sequences
    if (pathToCheck.includes('..')) {
      return null;
    }

    return normalized;
  } catch {
    return null;
  }
}

function validateFilePath(filePath: string, rootDir: string): string | null {
  try {
    const resolved = resolve(filePath);
    const resolvedRoot = resolve(rootDir);

    // Ensure the resolved path is within the root directory
    if (!resolved.startsWith(resolvedRoot + '/') && resolved !== resolvedRoot) {
      return null;
    }

    // Additional check: ensure no path traversal sequences in the original path
    if (filePath.includes('..')) {
      return null;
    }

    return resolved;
  } catch {
    return null;
  }
}

function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts and dangerous characters
  let clean = fileName.replace(/\.\./g, '').replace(/\//g, '').replace(/\\/g, '');
  // Remove dangerous characters
  clean = clean.replace(/[<>:"|?*\x00-\x1f]/g, '');
  // Limit length
  clean = clean.substring(0, 100);
  // Ensure only alphanumeric and safe characters remain
  clean = clean.replace(/[^a-zA-Z0-9_\-.]/g, '');
  // Ensure it's not empty
  if (!clean) {
    clean = 'unknown_file';
  }
  return clean;
}

describe('Path Validation Functions', () => {
  const baseDir = '/app/project';
  const rootDir = '/app/project';

  describe('validatePath', () => {
    it('should accept valid relative paths', () => {
      const result = validatePath('subfolder/file.txt', baseDir);
      expect(result).not.toBeNull();
      expect(result).toContain('subfolder/file.txt');
    });

    it('should reject path traversal with ..', () => {
      const result = validatePath('../etc/passwd', baseDir);
      expect(result).toBeNull();
    });

    it('should reject path traversal with multiple ..', () => {
      const result = validatePath('../../etc/passwd', baseDir);
      expect(result).toBeNull();
    });

    it('should reject paths outside base directory', () => {
      const result = validatePath('/etc/passwd', baseDir);
      expect(result).toBeNull();
    });

    it('should handle empty path', () => {
      const result = validatePath('', baseDir);
      expect(result).not.toBeNull();
    });

    it('should handle current directory', () => {
      const result = validatePath('.', baseDir);
      expect(result).not.toBeNull();
    });

    it('should reject encoded path traversal', () => {
      const result = validatePath('%2e%2e%2fetc%2fpasswd', baseDir);
      // Should be normalized and checked, but encoded sequences should be handled
      expect(result).toBeNull();
    });
  });

  describe('validateFilePath', () => {
    it('should accept valid file paths within root', () => {
      const result = validateFilePath('/app/project/file.txt', rootDir);
      expect(result).not.toBeNull();
    });

    it('should reject paths outside root directory', () => {
      const result = validateFilePath('/etc/passwd', rootDir);
      expect(result).toBeNull();
    });

    it('should reject path traversal sequences', () => {
      const result = validateFilePath('/app/project/../etc/passwd', rootDir);
      expect(result).toBeNull();
    });

    it('should handle relative paths correctly', () => {
      const result = validateFilePath('file.txt', rootDir);
      expect(result).not.toBeNull();
    });
  });

  describe('sanitizeFileName', () => {
    it('should sanitize normal filenames', () => {
      const result = sanitizeFileName('test_file.txt');
      expect(result).toBe('test_file.txt');
    });

    it('should remove path traversal sequences', () => {
      const result = sanitizeFileName('../../../etc/passwd');
      expect(result).not.toContain('..');
      expect(result).not.toContain('/');
    });

    it('should remove dangerous characters', () => {
      const result = sanitizeFileName('file<>:"|?*.txt');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain(':');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(200);
      const result = sanitizeFileName(longName);
      expect(result.length).toBeLessThanOrEqual(100);
    });

    it('should provide default name for empty result', () => {
      const result = sanitizeFileName('...');
      expect(result).toBe('unknown_file');
    });

    it('should preserve safe characters', () => {
      const result = sanitizeFileName('test-file_123.txt');
      expect(result).toContain('test-file_123.txt');
    });

    it('should handle unicode characters', () => {
      const result = sanitizeFileName('файл.txt');
      // Should remove non-ASCII characters
      expect(result).not.toContain('файл');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined gracefully', () => {
      expect(() => validatePath(null as any, baseDir)).not.toThrow();
      expect(() => validateFilePath(undefined as any, rootDir)).not.toThrow();
    });

    it('should handle very long paths', () => {
      const longPath = 'a'.repeat(1000) + '/file.txt';
      const result = validatePath(longPath, baseDir);
      // Should either validate or reject, but not crash
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should handle special filesystem characters', () => {
      const result = sanitizeFileName('file\n\r\t.txt');
      expect(result).not.toContain('\n');
      expect(result).not.toContain('\r');
      expect(result).not.toContain('\t');
    });

    it('should handle Windows path separators', () => {
      const result = sanitizeFileName('file\\path.txt');
      expect(result).not.toContain('\\');
    });

    it('should handle mixed path separators', () => {
      const result = sanitizeFileName('file/path\\test.txt');
      expect(result).not.toContain('/');
      expect(result).not.toContain('\\');
    });
  });

  describe('Security Scenarios', () => {
    it('should prevent directory traversal attack', () => {
      const malicious = '../../../../etc/passwd';
      expect(validatePath(malicious, baseDir)).toBeNull();
      expect(sanitizeFileName(malicious)).not.toContain('..');
    });

    it('should prevent absolute path injection', () => {
      const malicious = '/etc/passwd';
      expect(validatePath(malicious, baseDir)).toBeNull();
    });

    it('should prevent null byte injection', () => {
      const malicious = 'file.txt\0../../etc/passwd';
      const result = sanitizeFileName(malicious);
      expect(result).not.toContain('\0');
    });

    it('should prevent command injection via filename', () => {
      const malicious = 'file.txt; rm -rf /';
      const result = sanitizeFileName(malicious);
      expect(result).not.toContain(';');
      expect(result).not.toContain('rm');
    });
  });
});
