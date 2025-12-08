import { describe, it, expect } from 'vitest';
import { useChartData } from '../useChartData';

describe('useChartData', () => {
  it('should return all formatting methods', () => {
    const chart = useChartData();

    expect(chart).toHaveProperty('formatChartData');
    expect(chart).toHaveProperty('formatPriceDistribution');
    expect(chart).toHaveProperty('formatBrandDistribution');
    expect(chart).toHaveProperty('formatTimeSeries');
    expect(chart).toHaveProperty('formatComparisonData');
  });

  describe('formatChartData', () => {
    it('should return empty data for empty array', () => {
      const chart = useChartData();
      const result = chart.formatChartData([]);

      expect(result.categories).toEqual([]);
      expect(result.series).toEqual([]);
    });

    it('should format simple chart data', () => {
      const chart = useChartData();
      const data = [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
      ];

      const result = chart.formatChartData(data);

      expect(result.categories).toEqual(['A', 'B']);
      expect(result.series).toHaveLength(1);
      expect(result.series[0]!.data).toEqual([10, 20]);
    });

    it('should format multi-series chart data', () => {
      const chart = useChartData();
      const data = [
        { category: 'Q1', series: 'A', value: 10 },
        { category: 'Q1', series: 'B', value: 20 },
        { category: 'Q2', series: 'A', value: 15 },
        { category: 'Q2', series: 'B', value: 25 },
      ];

      const result = chart.formatChartData(data, {
        xKey: 'category',
        yKey: 'value',
        seriesKey: 'series',
      });

      expect(result.categories).toEqual(['Q1', 'Q2']);
      expect(result.series).toHaveLength(2);
    });
  });

  describe('formatPriceDistribution', () => {
    it('should format price distribution', () => {
      const chart = useChartData();
      const data = [
        { price: 300 },
        { price: 700 },
        { price: 1200 },
        { price: 1800 },
        { price: 2500 },
      ];

      const result = chart.formatPriceDistribution(data);

      expect(result.categories).toHaveLength(5);
      expect(result.series[0]!.data).toEqual([1, 1, 1, 1, 1]);
    });
  });

  describe('formatBrandDistribution', () => {
    it('should format brand distribution', () => {
      const chart = useChartData();
      const data = [{ brand: 'Apple' }, { brand: 'Apple' }, { brand: 'Samsung' }];

      const result = chart.formatBrandDistribution(data);

      expect(result.categories).toContain('Apple');
      expect(result.categories).toContain('Samsung');
      expect(result.series[0]!.data[0]).toBe(2); // Apple count
    });

    it('should limit to top 10 brands', () => {
      const chart = useChartData();
      const data = Array.from({ length: 20 }, (_, i) => ({ brand: `Brand${i}` }));

      const result = chart.formatBrandDistribution(data);

      expect(result.categories.length).toBeLessThanOrEqual(10);
    });
  });

  describe('formatTimeSeries', () => {
    it('should format time series data', () => {
      const chart = useChartData();
      const data = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-02-01', value: 200 },
      ];

      const result = chart.formatTimeSeries(data, 'date', 'value');

      expect(result.categories).toHaveLength(2);
      expect(result.series[0]!.data).toEqual([100, 200]);
    });
  });

  describe('formatComparisonData', () => {
    it('should format comparison data', () => {
      const chart = useChartData();
      const models = [
        { name: 'Model A', price: 999, ram: 8 },
        { name: 'Model B', price: 899, ram: 12 },
      ];

      const result = chart.formatComparisonData(models, ['price', 'ram']);

      expect(result.categories).toEqual(['Model A', 'Model B']);
      expect(result.series).toHaveLength(2);
      expect(result.series[0]!.data).toEqual([999, 899]);
      expect(result.series[1]!.data).toEqual([8, 12]);
    });
  });
});
