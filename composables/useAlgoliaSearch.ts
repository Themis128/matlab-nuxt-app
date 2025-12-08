/**
 * Composable for Algolia search functionality
 * Provides reactive search with filters and pagination
 */

import type { AlgoliaRecord } from '~/types/algolia';

interface AlgoliaSearchFilters {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRam?: number;
  maxRam?: number;
  minBattery?: number;
  maxBattery?: number;
  minScreen?: number;
  maxScreen?: number;
  minStorage?: number;
  maxStorage?: number;
  year?: number;
  processor?: string;
}

interface AlgoliaSearchOptions {
  query?: string;
  page?: number;
  hitsPerPage?: number;
  filters?: AlgoliaSearchFilters;
}

interface AlgoliaSearchResult {
  hits: AlgoliaRecord[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
  query: string;
}

export const useAlgoliaSearch = () => {
  const searchQuery = ref('');
  const currentPage = ref(0);
  const hitsPerPage = ref(20);
  const filters = ref<AlgoliaSearchFilters>({});

  // Sanitize filter values to prevent injection
  const sanitizeFilterValue = (value: string): string => {
    // Escape quotes and remove special characters that could be used for injection
    return value
      .replace(/"/g, '\\"')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .trim();
  };

  // Build Algolia filters string
  const buildFilters = (filterObj: AlgoliaSearchFilters): string => {
    const filterParts: string[] = [];

    if (filterObj.brand) {
      const sanitizedBrand = sanitizeFilterValue(filterObj.brand);
      filterParts.push(`brand:"${sanitizedBrand}"`);
    }

    if (filterObj.minPrice !== undefined || filterObj.maxPrice !== undefined) {
      const min = filterObj.minPrice ?? 0;
      const max = filterObj.maxPrice ?? 99999;
      filterParts.push(`price:${min} TO ${max}`);
    }

    if (filterObj.minRam !== undefined || filterObj.maxRam !== undefined) {
      const min = filterObj.minRam ?? 0;
      const max = filterObj.maxRam ?? 128;
      filterParts.push(`ram:${min} TO ${max}`);
    }

    if (filterObj.minBattery !== undefined || filterObj.maxBattery !== undefined) {
      const min = filterObj.minBattery ?? 0;
      const max = filterObj.maxBattery ?? 10000;
      filterParts.push(`battery:${min} TO ${max}`);
    }

    if (filterObj.minScreen !== undefined || filterObj.maxScreen !== undefined) {
      const min = filterObj.minScreen ?? 0;
      const max = filterObj.maxScreen ?? 10;
      filterParts.push(`screen:${min} TO ${max}`);
    }

    if (filterObj.minStorage !== undefined || filterObj.maxStorage !== undefined) {
      const min = filterObj.minStorage ?? 0;
      const max = filterObj.maxStorage ?? 1024;
      filterParts.push(`storage:${min} TO ${max}`);
    }

    if (filterObj.year) {
      filterParts.push(`year:${filterObj.year}`);
    }

    if (filterObj.processor) {
      const sanitizedProcessor = sanitizeFilterValue(filterObj.processor);
      filterParts.push(`processor:"${sanitizedProcessor}"`);
    }

    return filterParts.join(' AND ');
  };

  // Perform search
  const search = async (
    options: AlgoliaSearchOptions = {}
  ): Promise<AlgoliaSearchResult | null> => {
    const query = options.query ?? searchQuery.value;
    const page = options.page ?? currentPage.value;
    const hitsPerPageValue = options.hitsPerPage ?? hitsPerPage.value;
    const searchFilters = options.filters ?? filters.value;

    // Build query parameters
    const queryParams: Record<string, string | number> = {
      q: query,
      page,
      hitsPerPage: hitsPerPageValue,
    };

    const filtersString = buildFilters(searchFilters);
    if (filtersString) {
      queryParams.filters = filtersString;
    }

    try {
      const { data, error } = await useFetch<AlgoliaSearchResult>('/api/algolia/search', {
        query: queryParams,
        key: `algolia-search-${query}-${page}-${filtersString}`,
      });

      if (error.value) {
        const logger = useSentryLogger();
        logger.logError(
          'Algolia search error',
          error.value instanceof Error ? error.value : new Error(String(error.value)),
          {
            composable: 'useAlgoliaSearch',
            action: 'search',
            query,
          }
        );
        return null;
      }

      return data.value ?? null;
    } catch (error) {
      const logger = useSentryLogger();
      logger.logError(
        'Algolia search failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          composable: 'useAlgoliaSearch',
          action: 'search',
          query,
        }
      );
      return null;
    }
  };

  // Clear filters
  const clearFilters = () => {
    filters.value = {};
    searchQuery.value = '';
    currentPage.value = 0;
  };

  // Update filter
  const updateFilter = <K extends keyof AlgoliaSearchFilters>(
    key: K,
    value: AlgoliaSearchFilters[K]
  ) => {
    filters.value[key] = value;
  };

  return {
    searchQuery,
    currentPage,
    hitsPerPage,
    filters,
    search,
    clearFilters,
    updateFilter,
    buildFilters,
  };
};
