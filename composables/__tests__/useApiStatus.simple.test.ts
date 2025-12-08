import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock $fetch
const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);

// Simple test that doesn't require Vue lifecycle hooks
describe('useApiStatus - Simple Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should export useApiStatus function', async () => {
    const { useApiStatus } = await import('../useApiStatus');
    expect(typeof useApiStatus).toBe('function');
  });

  it('should return status and checkApiHealth', async () => {
    const { useApiStatus } = await import('../useApiStatus');
    const result = useApiStatus();

    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('checkApiHealth');
    expect(typeof result.checkApiHealth).toBe('function');
  });

  it('should have initial status values', async () => {
    const { useApiStatus } = await import('../useApiStatus');
    const { status } = useApiStatus();

    expect(status.value).toHaveProperty('isOnline');
    expect(status.value).toHaveProperty('isChecking');
    expect(status.value).toHaveProperty('error');
    expect(status.value.isOnline).toBe(false);
  });
});
