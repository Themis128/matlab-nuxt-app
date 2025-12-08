import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock $fetch before importing
const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);

describe('useApiStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with offline status', async () => {
    const { useApiStatus } = await import('../useApiStatus');
    const { status } = useApiStatus();

    expect(status.value.isOnline).toBe(false);
    expect(status.value.isChecking).toBe(false);
    expect(status.value.error).toBeNull();
  });

  it('should check API health successfully', async () => {
    mockFetch.mockResolvedValue({ status: 'healthy' });

    const { useApiStatus } = await import('../useApiStatus');
    const { status, checkApiHealth } = useApiStatus();
    await checkApiHealth();

    // Add type guards for status value
    expect(status.value).toHaveProperty('isOnline');
    expect(status.value).toHaveProperty('isChecking');
    expect(status.value).toHaveProperty('error');
    expect(status.value).toHaveProperty('lastChecked');

    // Updated assertions with proper type checking
    expect(status.value.isOnline).toBe(true);
    expect(status.value.error).toBeNull();
    expect(status.value.lastChecked).not.toBeNull();
    expect(status.value.lastChecked).toBeGreaterThan(0);
  });

  it('should handle API health check failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { useApiStatus } = await import('../useApiStatus');
    const { status, checkApiHealth } = useApiStatus();
    await checkApiHealth();

    expect(status.value.isOnline).toBe(false);
    expect(status.value.error).toBeTruthy();
    expect(status.value.lastChecked).not.toBeNull();
  });

  it('should set error message on failure', async () => {
    mockFetch.mockRejectedValue(new Error('Connection timeout'));

    const { useApiStatus } = await import('../useApiStatus');
    const { status, checkApiHealth } = useApiStatus();
    await checkApiHealth();

    expect(status.value.error).toBe('Connection timeout');
  });

  it('should update lastChecked timestamp', async () => {
    mockFetch.mockResolvedValue({ status: 'healthy' });

    const { useApiStatus } = await import('../useApiStatus');
    const { status, checkApiHealth } = useApiStatus();
    const beforeCheck = Date.now();

    await checkApiHealth();

    expect(status.value.lastChecked).toBeGreaterThanOrEqual(beforeCheck);
  });

  it('should set isChecking during health check', async () => {
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    mockFetch.mockReturnValue(fetchPromise);

    const { useApiStatus } = await import('../useApiStatus');
    const { status, checkApiHealth } = useApiStatus();
    const checkPromise = checkApiHealth();

    // Should be checking
    expect(status.value.isChecking).toBe(true);

    // Resolve fetch
    resolveFetch!({ status: 'healthy' });
    await checkPromise;

    // Should not be checking anymore
    expect(status.value.isChecking).toBe(false);
  });
});
