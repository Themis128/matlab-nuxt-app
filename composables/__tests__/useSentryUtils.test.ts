import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSentryInstanceSync,
  isSentryAvailable,
  addBreadcrumb,
  captureException,
  captureMessage,
} from '../useSentryUtils';

// Mock useNuxtApp
const mockNuxtApp = {
  $sentry: {
    addBreadcrumb: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    setUser: vi.fn(),
    setTag: vi.fn(),
    setContext: vi.fn(),
  },
};

vi.mock('#app', () => ({
  useNuxtApp: () => mockNuxtApp,
}));

// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      client: true,
      server: false,
    },
  },
  writable: true,
});

describe('useSentryUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear cache
    (getSentryInstanceSync as any)._cachedSentry = null;
  });

  it('should get Sentry instance from Nuxt app', () => {
    const sentry = getSentryInstanceSync();

    expect(sentry).toBeDefined();
    expect(sentry).toBe(mockNuxtApp.$sentry);
  });

  it('should cache Sentry instance', () => {
    const sentry1 = getSentryInstanceSync();
    const sentry2 = getSentryInstanceSync();

    expect(sentry1).toBe(sentry2);
  });

  it('should get Sentry instance from window', () => {
    (global as any).window = {
      Sentry: { captureException: vi.fn() },
    };

    const sentry = getSentryInstanceSync();

    expect(sentry).toBeDefined();
  });

  it('should check if Sentry is available', () => {
    const available = isSentryAvailable();

    expect(typeof available).toBe('boolean');
  });

  it('should add breadcrumb', () => {
    addBreadcrumb('Test message', 'test', 'info');

    expect(mockNuxtApp.$sentry.addBreadcrumb).toHaveBeenCalled();
  });

  it('should capture exception', () => {
    const error = new Error('Test error');
    captureException(error, 'error', {}, {});

    expect(mockNuxtApp.$sentry.captureException).toHaveBeenCalled();
  });

  it('should capture message', () => {
    captureMessage('Test message', 'info', {});

    expect(mockNuxtApp.$sentry.captureMessage).toHaveBeenCalled();
  });
});
