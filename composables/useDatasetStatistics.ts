/**
 * Dataset Statistics Composable
 * Provides statistics and insights about the dataset
 */

interface DatasetStatistics {
  totalPhones: number;
  companies: string[];
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
  ramOptions: number[];
  batteryRange: {
    min: number;
    max: number;
    avg: number;
  };
  yearRange: {
    min: number;
    max: number;
  };
  topBrands: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  averageSpecs: {
    price: number;
    ram: number;
    battery: number;
    screen: number;
  };
}

export function useDatasetStatistics() {
  // Reactive state
  const statistics = ref<DatasetStatistics | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch dataset statistics
   */
  const fetchStatistics = async () => {
    if (statistics.value) return statistics.value;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await $fetch<DatasetStatistics>('/api/statistics' as any);
      statistics.value = response;
      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch statistics';
      console.error('Failed to fetch dataset statistics:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get statistics (with caching)
   */
  const getStatistics = async (): Promise<DatasetStatistics | null> => {
    if (statistics.value) {
      return statistics.value;
    }
    return await fetchStatistics();
  };

  /**
   * Refresh statistics
   */
  const refreshStatistics = async () => {
    statistics.value = null;
    return await fetchStatistics();
  };

  /**
   * Get brand distribution
   */
  const getBrandDistribution = () => {
    if (!statistics.value) return [];
    return statistics.value.topBrands;
  };

  /**
   * Get price statistics
   */
  const getPriceStats = () => {
    if (!statistics.value) return null;
    return statistics.value.priceRange;
  };

  /**
   * Get RAM distribution
   */
  const getRamDistribution = () => {
    if (!statistics.value) return [];
    return statistics.value.ramOptions.map((ram: number) => ({
      ram,
      count: Math.floor(Math.random() * 100) + 10, // Mock data
    }));
  };

  /**
   * Get battery statistics
   */
  const getBatteryStats = () => {
    if (!statistics.value) return null;
    return statistics.value.batteryRange;
  };

  /**
   * Get year distribution
   */
  const getYearDistribution = () => {
    if (!statistics.value) return [];
    const { min, max } = statistics.value.yearRange;
    const years = [];
    for (let year = min; year <= max; year++) {
      years.push({
        year,
        count: Math.floor(Math.random() * 50) + 5, // Mock data
      });
    }
    return years;
  };

  /**
   * Get average specifications
   */
  const getAverageSpecs = () => {
    if (!statistics.value) return null;
    return statistics.value.averageSpecs;
  };

  // Initialize on first use
  onMounted(() => {
    // Pre-fetch statistics in background
    fetchStatistics();
  });

  return {
    statistics: readonly(statistics),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchStatistics,
    getStatistics,
    refreshStatistics,
    getBrandDistribution,
    getPriceStats,
    getRamDistribution,
    getBatteryStats,
    getYearDistribution,
    getAverageSpecs,
  };
}
