/**
 * Nuxt 4 composable for dataset search functionality
 * Uses useFetch with reactive query parameters
 */
interface SearchFilters {
  brand?: string;
  priceRange?: [number, number];
  yearRange?: [number, number];
  ram?: number;
  battery?: number;
}

interface SearchResult {
  id: string;
  name: string;
  brand: string;
  price: number;
  year: number;
  ram: number;
  battery: number;
}

export const useDatasetSearch = () => {
  const searchQuery = ref('');
  const filters = ref<SearchFilters>({
    brand: '',
    priceRange: [0, 5000],
    yearRange: [2020, 2025],
  });

  const { data, pending, error, refresh } = useFetch<SearchResult[]>('/api/dataset/search', {
    method: 'POST',
    body: computed(() => ({
      query: searchQuery.value,
      filters: filters.value,
    })),
    watch: [searchQuery, filters], // Auto-refetch when search query or filters change
    key: 'dataset-search',
    // Lazy loading - doesn't block page load
    lazy: true,
    // Default empty array
    default: () => [],
  });

  const clearFilters = () => {
    filters.value = {
      brand: '',
      priceRange: [0, 5000],
      yearRange: [2020, 2025],
    };
    searchQuery.value = '';
  };

  return {
    results: data,
    isLoading: pending,
    error,
    searchQuery,
    filters,
    refresh,
    clearFilters,
  };
};
