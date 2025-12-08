import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSentryApi } from '../useSentryApi';

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

describe('useSentryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return API methods', () => {
    const api = useSentryApi();

    expect(api).toHaveProperty('getIssues');
    expect(api).toHaveProperty('getStats');
    expect(api).toHaveProperty('getReleases');
    expect(api).toHaveProperty('getIssue');
  });

  it('should get issues', async () => {
    const mockIssues = [{ id: '1', title: 'Test issue' }];
    mockFetch.mockResolvedValue({ issues: mockIssues });

    const api = useSentryApi();
    const issues = await api.getIssues(10);

    expect(issues).toEqual(mockIssues);
    expect(mockFetch).toHaveBeenCalledWith('/api/sentry/issues', {
      params: { limit: 10 },
    });
  });

  it('should handle getIssues errors', async () => {
    mockFetch.mockRejectedValue(new Error('API error'));

    const api = useSentryApi();
    const issues = await api.getIssues();

    expect(issues).toEqual([]);
    expect(mockSentryLogger.error).toHaveBeenCalled();
  });

  it('should get stats', async () => {
    const mockStats = {
      totalIssues: 10,
      unresolvedIssues: 5,
      resolvedIssues: 5,
      errors24h: 20,
      errors7d: 100,
    };
    mockFetch.mockResolvedValue(mockStats);

    const api = useSentryApi();
    const stats = await api.getStats();

    expect(stats).toEqual(mockStats);
  });

  it('should handle getStats errors', async () => {
    mockFetch.mockRejectedValue(new Error('API error'));

    const api = useSentryApi();
    const stats = await api.getStats();

    expect(stats).toBeNull();
  });

  it('should get releases', async () => {
    const mockReleases = [{ version: '1.0.0', date: '2024-01-01' }];
    mockFetch.mockResolvedValue({ releases: mockReleases });

    const api = useSentryApi();
    const releases = await api.getReleases(5);

    expect(releases).toEqual(mockReleases);
  });

  it('should get issue by ID', async () => {
    const mockIssue = { id: '1', title: 'Test issue' };
    mockFetch.mockResolvedValue({ issue: mockIssue });

    const api = useSentryApi();
    const issue = await api.getIssue('1');

    expect(issue).toEqual(mockIssue);
  });
});
