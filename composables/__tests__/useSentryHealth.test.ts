import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSentryHealth } from '../useSentryHealth';

// Mock $fetch
const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);

// Mock useSentryLogger
const mockSentryLogger = {
  error: vi.fn(),
};

vi.mock('~/composables/useSentryLogger', () => ({
  useSentryLogger: () => mockSentryLogger,
}));

// Mock process.env
const originalEnv = process.env;

describe('useSentryHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return health methods', () => {
    const health = useSentryHealth();

    expect(health).toHaveProperty('checkHealth');
    expect(health).toHaveProperty('isConfigured');
    expect(health).toHaveProperty('isApiAccessible');
    expect(health).toHaveProperty('getConfigStatus');
  });

  it('should check health status', async () => {
    const mockHealth = {
      status: 'healthy',
      checks: {},
      summary: { configured: true, apiConnected: true, ready: true },
    };
    mockFetch.mockResolvedValue(mockHealth);

    const health = useSentryHealth();
    const result = await health.checkHealth();

    expect(result).toEqual(mockHealth);
  });

  it('should handle health check errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const health = useSentryHealth();
    const result = await health.checkHealth();

    expect(result).toBeNull();
    expect(mockSentryLogger.error).toHaveBeenCalled();
  });

  it('should check if Sentry is configured', () => {
    process.env.SENTRY_DSN = 'https://test@sentry.io/project';
    const health = useSentryHealth();

    expect(health.isConfigured()).toBe(true);
  });

  it('should return false for placeholder DSN', () => {
    process.env.SENTRY_DSN = 'https://your-dsn@sentry.io/project';
    const health = useSentryHealth();

    expect(health.isConfigured()).toBe(false);
  });

  it('should check API accessibility', async () => {
    mockFetch.mockResolvedValue({
      summary: { apiConnected: true },
    });

    const health = useSentryHealth();
    const accessible = await health.isApiAccessible();

    expect(accessible).toBe(true);
  });

  it('should get config status', () => {
    process.env.SENTRY_DSN = 'https://test@sentry.io/project';
    process.env.SENTRY_ORG = 'test-org';
    process.env.SENTRY_PROJECT = 'test-project';
    process.env.SENTRY_AUTH_TOKEN = 'test-token';

    const health = useSentryHealth();
    const status = health.getConfigStatus();

    expect(status.dsn).toBe(true);
    expect(status.org).toBe(true);
    expect(status.project).toBe(true);
    expect(status.authToken).toBe(true);
  });
});
