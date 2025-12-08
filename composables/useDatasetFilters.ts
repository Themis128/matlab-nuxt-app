/**
 * Nuxt 4 composable for dataset filtering and search
 * Provides filter state management and query building
 *
 * Note: This composable manages filter state. Components should handle their own data fetching
 * using the getQueryParams() helper to build query strings.
 */
import { ref, computed } from 'vue';

interface FilterOptions {
  brand?: string;
  priceRange?: [number, number];
  yearRange?: [number, number];
  ram?: number;
  battery?: number;
  screen?: number;
  searchQuery?: string;
}

export const useDatasetFilters = () => {
  const filters = ref<FilterOptions>({
    brand: '',
    priceRange: [0, 5000],
    yearRange: [2020, 2025],
    ram: undefined,
    battery: undefined,
    screen: undefined,
    searchQuery: '',
  });

  // Helper to build query parameters for API calls
  const getQueryParams = () => {
    const query: Record<string, any> = {};

    if (filters.value.brand) {
      query.brand = filters.value.brand;
    }
    if (filters.value.searchQuery) {
      query.search = filters.value.searchQuery;
    }
    if (filters.value.priceRange) {
      query.minPrice = filters.value.priceRange[0];
      query.maxPrice = filters.value.priceRange[1];
    }
    if (filters.value.yearRange) {
      query.year = filters.value.yearRange;
    }
    if (filters.value.ram !== undefined) {
      query.minRam = filters.value.ram;
      query.maxRam = filters.value.ram;
    }
    if (filters.value.battery !== undefined) {
      query.minBattery = filters.value.battery;
      query.maxBattery = filters.value.battery;
    }
    if (filters.value.screen !== undefined) {
      query.minScreen = filters.value.screen;
      query.maxScreen = filters.value.screen;
    }

    return query;
  };

  const clearFilters = () => {
    filters.value = {
      brand: '',
      priceRange: [0, 5000],
      yearRange: [2020, 2025],
      ram: undefined,
      battery: undefined,
      screen: undefined,
      searchQuery: '',
    };
  };

  const hasActiveFilters = computed(() => {
    return (
      filters.value.brand !== '' ||
      filters.value.searchQuery !== '' ||
      filters.value.ram !== undefined ||
      filters.value.battery !== undefined ||
      filters.value.screen !== undefined ||
      filters.value.priceRange?.[0] !== 0 ||
      filters.value.priceRange?.[1] !== 5000 ||
      filters.value.yearRange?.[0] !== 2020 ||
      filters.value.yearRange?.[1] !== 2025
    );
  });

  return {
    filters,
    getQueryParams,
    clearFilters,
    hasActiveFilters,
  };
};
