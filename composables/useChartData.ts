/**
 * Nuxt 4 composable for chart data transformation
 * Formats data for ApexCharts and other chart libraries
 */
export const useChartData = () => {
  const formatChartData = (
    rawData: any[],
    options?: { xKey?: string; yKey?: string; seriesKey?: string }
  ) => {
    if (!rawData || rawData.length === 0) {
      return {
        categories: [],
        series: [],
      };
    }

    const { xKey = 'name', yKey = 'value', seriesKey } = options || {};

    // Simple format: single series
    if (!seriesKey) {
      const categories = rawData.map((item) => item[xKey]);
      const series = [
        {
          name: 'Data',
          data: rawData.map((item) => item[yKey]),
        },
      ];

      return { categories, series };
    }

    // Multiple series format
    const seriesMap = new Map<string, number[]>();
    const categories = Array.from(new Set(rawData.map((item) => item[xKey])));

    rawData.forEach((item) => {
      const seriesName = item[seriesKey];
      if (!seriesMap.has(seriesName)) {
        seriesMap.set(seriesName, new Array(categories.length).fill(0));
      }
      const index = categories.indexOf(item[xKey]);
      if (index !== -1) {
        seriesMap.get(seriesName)![index] = item[yKey];
      }
    });

    const series = Array.from(seriesMap.entries()).map(([name, data]) => ({
      name,
      data,
    }));

    return { categories, series };
  };

  const formatPriceDistribution = (data: any[]) => {
    const priceRanges = [
      { label: '$0-500', min: 0, max: 500 },
      { label: '$500-1000', min: 500, max: 1000 },
      { label: '$1000-1500', min: 1000, max: 1500 },
      { label: '$1500-2000', min: 1500, max: 2000 },
      { label: '$2000+', min: 2000, max: Infinity },
    ];

    const distribution = priceRanges.map((range) => ({
      x: range.label,
      y: data.filter((item) => item.price >= range.min && item.price < range.max).length,
    }));

    return {
      categories: distribution.map((d) => d.x),
      series: [
        {
          name: 'Count',
          data: distribution.map((d) => d.y),
        },
      ],
    };
  };

  const formatBrandDistribution = (data: any[]) => {
    const brandCounts = data.reduce(
      (acc, item) => {
        const brand = item.brand || item.company || 'Unknown';
        acc[brand] = (acc[brand] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sorted = Object.entries(brandCounts)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 10); // Top 10 brands

    return {
      categories: sorted.map(([brand]) => brand),
      series: [
        {
          name: 'Count',
          data: sorted.map(([, count]) => count),
        },
      ],
    };
  };

  const formatTimeSeries = (data: any[], dateKey: string = 'date', valueKey: string = 'value') => {
    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a[dateKey]).getTime();
      const dateB = new Date(b[dateKey]).getTime();
      return dateA - dateB;
    });

    return {
      categories: sorted.map((item) => {
        const date = new Date(item[dateKey]);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }),
      series: [
        {
          name: 'Value',
          data: sorted.map((item) => item[valueKey]),
        },
      ],
    };
  };

  const formatComparisonData = (models: any[], fields: string[]) => {
    const categories = models.map((model) => model.name || model.id);
    const series = fields.map((field) => ({
      name: field.charAt(0).toUpperCase() + field.slice(1),
      data: models.map((model) => model[field] || 0),
    }));

    return { categories, series };
  };

  return {
    formatChartData,
    formatPriceDistribution,
    formatBrandDistribution,
    formatTimeSeries,
    formatComparisonData,
  };
};
