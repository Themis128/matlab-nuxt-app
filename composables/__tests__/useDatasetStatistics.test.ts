import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDatasetStatistics } from '../useDatasetStatistics';

// Mock useFetch
const mockUseFetch = vi.fn();

vi.mock('#app', () => ({
  useFetch: (...args: any[]) => mockUseFetch(...args),
}));

describe('useDatasetStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFetch.mockReturnValue({
      data: { value: null },
      pending: { value: false },
      error: { value: null },
      refresh: vi.fn(),
      status: { value: 'idle' },
    });
  });

  it('should return statistics interface', () => {
    const stats = useDatasetStatistics();

    expect(stats).toHaveProperty('statistics');
    expect(stats).toHaveProperty('isLoading');
    expect(stats).toHaveProperty('error');
    expect(stats).toHaveProperty('refresh');
    expect(stats).toHaveProperty('status');
  });

  it('should call useFetch with correct parameters', () => {
    useDatasetStatistics();

    expect(mockUseFetch).toHaveBeenCalledWith(
      '/api/dataset/statistics',
      expect.objectContaining({
        key: 'dataset-statistics',
        server: true,
        lazy: false,
      })
    );
  });

  it('should have default values', () => {
    useDatasetStatistics();

    const call = mockUseFetch.mock.calls[0]![1];
    const defaults = call.default();

    expect(defaults.totalRecords).toBe(0);
    expect(defaults.columns).toEqual([]);
    expect(defaults.companies).toEqual([]);
    expect(defaults.yearRange).toEqual({ min: 2020, max: 2025 });
  });

  it('should transform response data', () => {
    useDatasetStatistics();

    const call = mockUseFetch.mock.calls[0]![1];
    const transformed = call.transform({
      totalRecords: 100,
      companies: ['Apple', 'Samsung'],
      columns: ['modelName', 'price'],
    });

    expect(transformed.totalModels).toBe(100);
    expect(transformed.brands).toEqual(['Apple', 'Samsung']);
  });
});
