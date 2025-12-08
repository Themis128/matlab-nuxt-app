import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useAlgoliaSearch } from '../useAlgoliaSearch';

// Ensure Vue reactivity is available
vi.stubGlobal('ref', ref);

// Mock Nuxt composables
const mockUseFetch = vi.fn();
const mockUseSentryLogger = {
  error: vi.fn(),
};

vi.mock('#app', () => ({
  useFetch: (...args: any[]) => mockUseFetch(...args),
}));

vi.mock('~/composables/useSentryLogger', () => ({
  useSentryLogger: () => mockUseSentryLogger,
}));

// Stub globally for auto-imports
vi.stubGlobal('useFetch', (...args: any[]) => mockUseFetch(...args));
vi.stubGlobal('useSentryLogger', () => mockUseSentryLogger);

describe('useAlgoliaSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // useFetch can be awaited in Nuxt - returns a promise that resolves to object with refs
    const mockData = ref(null);
    const mockError = ref(null);
    mockUseFetch.mockResolvedValue({
      data: mockData,
      error: mockError,
    });
  });

  it('should initialize with default values', () => {
    const search = useAlgoliaSearch();

    expect(search.searchQuery.value).toBe('');
    expect(search.currentPage.value).toBe(0);
    expect(search.hitsPerPage.value).toBe(20);
    expect(search.filters.value).toEqual({});
  });

  it('should build filters string correctly', () => {
    const search = useAlgoliaSearch();

    const filters = search.buildFilters({
      brand: 'Apple',
      minPrice: 500,
      maxPrice: 1000,
      minRam: 4,
      maxRam: 8,
    });

    expect(filters).toContain('brand:"Apple"');
    expect(filters).toContain('price:500 TO 1000');
    expect(filters).toContain('ram:4 TO 8');
  });

  it('should sanitize filter values to prevent injection', () => {
    const search = useAlgoliaSearch();

    const filters = search.buildFilters({
      brand: 'Apple"; DROP TABLE users; --',
      processor: 'A14\nBionic',
    });

    // Check that quotes are escaped (prevents SQL injection)
    expect(filters).toContain('\\"');
    // Check that newlines are removed
    expect(filters).not.toContain('\n');
    expect(filters).not.toContain('A14\nBionic');
    // The "DROP TABLE" text is still there but quotes are escaped, preventing injection
    expect(filters).toContain('DROP TABLE'); // Text is present but safely escaped
  });

  it('should perform search with query', async () => {
    const mockResult = {
      hits: [{ id: '1', name: 'iPhone' }],
      nbHits: 1,
      page: 0,
      nbPages: 1,
      hitsPerPage: 20,
      processingTimeMS: 10,
      query: 'iPhone',
    };

    const mockData = ref(mockResult);
    const mockError = ref(null);

    // useFetch can be awaited - returns a promise that resolves to object with refs
    mockUseFetch.mockResolvedValue({
      data: mockData,
      error: mockError,
    });

    const search = useAlgoliaSearch();
    const result = await search.search({ query: 'iPhone' });

    expect(mockUseFetch).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  it('should perform search with filters', async () => {
    const mockResult = {
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage: 20,
      processingTimeMS: 5,
      query: '',
    };

    const mockData = ref(mockResult);
    const mockError = ref(null);

    mockUseFetch.mockResolvedValue({
      data: mockData,
      error: mockError,
    });

    const search = useAlgoliaSearch();
    await search.search({
      filters: { brand: 'Apple', minPrice: 500 },
    });

    expect(mockUseFetch).toHaveBeenCalled();
    const call = mockUseFetch.mock.calls[0]![0];
    expect(call).toBe('/api/algolia/search');
  });

  it('should handle search errors gracefully', async () => {
    const mockError = new Error('Search failed');
    const mockData = ref(null);
    const mockErrorRef = ref(mockError);

    mockUseFetch.mockReturnValue({
      data: mockData,
      error: mockErrorRef,
    });

    const search = useAlgoliaSearch();
    const result = await search.search({ query: 'iPhone' });

    expect(result).toBeNull();
    expect(mockUseSentryLogger.error).toHaveBeenCalled();
  });

  it('should clear filters', () => {
    const search = useAlgoliaSearch();
    search.searchQuery.value = 'iPhone';
    search.currentPage.value = 2;
    search.filters.value = { brand: 'Apple' };

    search.clearFilters();

    expect(search.searchQuery.value).toBe('');
    expect(search.currentPage.value).toBe(0);
    expect(search.filters.value).toEqual({});
  });

  it('should update filter', () => {
    const search = useAlgoliaSearch();
    search.updateFilter('brand', 'Apple');

    expect(search.filters.value.brand).toBe('Apple');
  });

  it('should use reactive state values when options not provided', async () => {
    const mockResult = {
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage: 20,
      processingTimeMS: 5,
      query: 'test',
    };

    const mockData = ref(mockResult);
    const mockError = ref(null);

    mockUseFetch.mockResolvedValue({
      data: mockData,
      error: mockError,
    });

    const search = useAlgoliaSearch();
    search.searchQuery.value = 'test';
    search.currentPage.value = 1;
    search.hitsPerPage.value = 10;

    await search.search();

    expect(mockUseFetch).toHaveBeenCalled();
    const call = mockUseFetch.mock.calls[0]![1];
    expect(call.query.q).toBe('test');
    expect(call.query.page).toBe(1);
    expect(call.query.hitsPerPage).toBe(10);
  });

  it('should handle all filter types', () => {
    const search = useAlgoliaSearch();

    const filters = search.buildFilters({
      brand: 'Apple',
      minPrice: 500,
      maxPrice: 1000,
      minRam: 4,
      maxRam: 8,
      minBattery: 3000,
      maxBattery: 5000,
      minScreen: 5.5,
      maxScreen: 6.5,
      minStorage: 64,
      maxStorage: 256,
      year: 2023,
      processor: 'A14',
    });

    expect(filters).toContain('brand:"Apple"');
    expect(filters).toContain('price:500 TO 1000');
    expect(filters).toContain('ram:4 TO 8');
    expect(filters).toContain('battery:3000 TO 5000');
    expect(filters).toContain('screen:5.5 TO 6.5');
    expect(filters).toContain('storage:64 TO 256');
    expect(filters).toContain('year:2023');
    expect(filters).toContain('processor:"A14"');
  });
});
