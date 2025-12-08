import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserActivity } from '../useUserActivity';

// Mock $fetch globally (Nuxt auto-import)
const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);

describe('useUserActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({});
  });

  it('should return all tracking methods', () => {
    const activity = useUserActivity();

    expect(activity).toHaveProperty('trackActivity');
    expect(activity).toHaveProperty('getActivity');
    expect(activity).toHaveProperty('trackSearch');
    expect(activity).toHaveProperty('trackComparison');
    expect(activity).toHaveProperty('trackPrediction');
    expect(activity).toHaveProperty('trackQuery');
    expect(activity).toHaveProperty('trackView');
  });

  it('should track search activity', async () => {
    const activity = useUserActivity();
    await activity.trackSearch('iPhone', 10);

    expect(mockFetch).toHaveBeenCalledWith('/api/user/activity', {
      method: 'POST',
      body: {
        type: 'search',
        title: 'Searched for "iPhone"',
        description: 'Found 10 results',
        metadata: { query: 'iPhone', results: 10 },
      },
    });
  });

  it('should track comparison activity with 2 devices', async () => {
    const activity = useUserActivity();
    await activity.trackComparison(['iPhone 15', 'Samsung S24']);

    expect(mockFetch).toHaveBeenCalledWith('/api/user/activity', {
      method: 'POST',
      body: {
        type: 'compare',
        title: 'Compared iPhone 15 vs Samsung S24',
        description: undefined,
        metadata: { devices: ['iPhone 15', 'Samsung S24'] },
      },
    });
  });

  it('should track comparison activity with multiple devices', async () => {
    const activity = useUserActivity();
    await activity.trackComparison(['iPhone', 'Samsung', 'Google']);

    expect(mockFetch).toHaveBeenCalledWith('/api/user/activity', {
      method: 'POST',
      body: {
        type: 'compare',
        title: 'Compared 3 devices',
        description: undefined,
        metadata: { devices: ['iPhone', 'Samsung', 'Google'] },
      },
    });
  });

  it('should track prediction activity', async () => {
    const activity = useUserActivity();
    await activity.trackPrediction('price', { price: 500 });

    expect(mockFetch).toHaveBeenCalledWith('/api/user/activity', {
      method: 'POST',
      body: {
        type: 'prediction',
        title: 'Generated price prediction',
        description: 'Predicted: {"price":500}',
        metadata: { type: 'price', result: { price: 500 } },
      },
    });
  });

  it('should track query activity', async () => {
    const activity = useUserActivity();
    const response = { answer: 'This is a long answer that should be truncated...' };
    await activity.trackQuery('What is the best phone?', response);

    expect(mockFetch).toHaveBeenCalledWith('/api/user/activity', {
      method: 'POST',
      body: {
        type: 'query',
        title: 'Asked: "What is the best phone?"',
        description: 'This is a long answer that should be truncated......', // substring(0, 100) + '...'
        metadata: { query: 'What is the best phone?', response },
      },
    });
  });

  it('should track view activity', async () => {
    const activity = useUserActivity();
    await activity.trackView('home', 'Homepage view');

    expect(mockFetch).toHaveBeenCalledWith('/api/user/activity', {
      method: 'POST',
      body: {
        type: 'view',
        title: 'Viewed home',
        description: 'Homepage view',
        metadata: { page: 'home', details: 'Homepage view' },
      },
    });
  });

  it('should get activity history', async () => {
    const mockResponse = {
      activities: [{ id: '1', type: 'search' }],
      stats: {
        searches: 5,
        comparisons: 2,
        predictions: 3,
        queries: 1,
        totalActivity: 11,
      },
      total: 11,
    };
    mockFetch.mockResolvedValue(mockResponse);

    const activity = useUserActivity();
    const result = await activity.getActivity(10);

    expect(mockFetch).toHaveBeenCalledWith('/api/user/activity?limit=10');
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors gracefully in trackActivity', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockRejectedValue(new Error('Network error'));

    const activity = useUserActivity();
    await expect(activity.trackActivity('search', 'Test')).resolves.not.toThrow();

    consoleSpy.mockRestore();
  });

  it('should return default values on getActivity error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValue(new Error('Network error'));

    const activity = useUserActivity();
    const result = await activity.getActivity();

    expect(result).toEqual({
      activities: [],
      stats: {
        searches: 0,
        comparisons: 0,
        predictions: 0,
        queries: 0,
        totalActivity: 0,
      },
      total: 0,
    });

    consoleSpy.mockRestore();
  });
});
