/**
 * Nuxt 4 composable for fetching dataset statistics
 * Uses useFetch for SSR-friendly data fetching
 */
export const useDatasetStatistics = () => {
  const { data, pending, error, refresh, status } = useFetch<{
    totalRecords: number;
    totalModels?: number;
    columns: string[];
    companies: string[];
    brands?: string[];
    yearRange: { min: number; max: number };
    priceRange: { min: number; max: number; avg: number };
    ramRange: { min: number; max: number; avg: number };
    batteryRange: { min: number; max: number; avg: number };
    screenRange: { min: number; max: number; avg: number };
    companyDistribution: Record<string, number>;
    yearDistribution: Record<string, number>;
  }>('/api/dataset/statistics', {
    key: 'dataset-statistics',
    // Transform response for compatibility
    transform: (data) => ({
      ...data,
      totalModels: data.totalRecords,
      brands: data.companies,
    }),
    // Default value while loading
    default: () => ({
      totalRecords: 0,
      columns: [],
      companies: [],
      yearRange: { min: 2020, max: 2025 },
      priceRange: { min: 0, max: 0, avg: 0 },
      ramRange: { min: 0, max: 0, avg: 0 },
      batteryRange: { min: 0, max: 0, avg: 0 },
      screenRange: { min: 0, max: 0, avg: 0 },
      companyDistribution: {},
      yearDistribution: {},
    }),
    // Server-side fetch enabled
    server: true,
    // Non-lazy (blocks navigation until loaded)
    lazy: false,
  });

  return {
    statistics: data,
    isLoading: pending,
    error,
    refresh,
    status,
  };
};
