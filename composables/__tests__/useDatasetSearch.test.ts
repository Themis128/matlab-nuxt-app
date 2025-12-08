import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDatasetSearch } from '../useDatasetSearch';

// Mock useFetch
const mockUseFetch = vi.fn();

vi.mock('#app', () => ({
  useFetch: (...args: any[]) => mockUseFetch(...args),
}));

describe('useDatasetSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFetch.mockReturnValue({
      data: { value: [] },
      pending: { value: false },
      error: { value: null },
      refresh: vi.fn(),
    });
  });

  it('should initialize with default values', () => {
    const search = useDatasetSearch();

    expect(search.searchQuery.value).toBe('');
    expect(search.filters.value.brand).toBe('');
    expect(search.filters.value.priceRange).toEqual([0, 5000]);
    expect(search.filters.value.yearRange).toEqual([2020, 2025]);
  });

  it('should call useFetch with correct parameters', () => {
    useDatasetSearch();

    expect(mockUseFetch).toHaveBeenCalledWith(
      '/api/dataset/search',
      expect.objectContaining({
        method: 'POST',
        lazy: true,
      })
    );
  });

  it('should clear filters', () => {
    const search = useDatasetSearch();
    search.searchQuery.value = 'iPhone';
    search.filters.value.brand = 'Apple';

    search.clearFilters();

    expect(search.searchQuery.value).toBe('');
    expect(search.filters.value.brand).toBe('');
    expect(search.filters.value.priceRange).toEqual([0, 5000]);
  });

  it('should return search interface', () => {
    const search = useDatasetSearch();

    expect(search).toHaveProperty('results');
    expect(search).toHaveProperty('isLoading');
    expect(search).toHaveProperty('error');
    expect(search).toHaveProperty('refresh');
    expect(search).toHaveProperty('clearFilters');
  });
});
