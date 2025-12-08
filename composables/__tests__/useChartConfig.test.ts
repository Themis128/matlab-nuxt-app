import { describe, it, expect } from 'vitest';
import { useChartConfig } from '../useChartConfig';

describe('useChartConfig', () => {
  const { getChartOptions, getMobileDatasetChartOptions } = useChartConfig();

  describe('getChartOptions', () => {
    it('should return chart options for line chart', () => {
      const options = getChartOptions('line');

      expect(options.chart?.type).toBe('line');
      expect(options.stroke?.curve).toBe('smooth');
      expect(options.markers).toBeDefined();
    });

    it('should return chart options for bar chart', () => {
      const options = getChartOptions('bar');

      expect(options.chart?.type).toBe('bar');
      expect(options.plotOptions?.bar).toBeDefined();
    });

    it('should return chart options for pie chart', () => {
      const options = getChartOptions('pie');

      expect(options.chart?.type).toBe('pie');
      expect(options.dataLabels?.enabled).toBe(true);
      expect(options.plotOptions?.pie).toBeDefined();
    });

    it('should return chart options for donut chart', () => {
      const options = getChartOptions('donut');

      expect(options.chart?.type).toBe('donut');
      expect(options.plotOptions?.pie?.donut).toBeDefined();
    });

    it('should merge custom options', () => {
      const customOptions = {
        title: {
          text: 'Custom Title',
        },
      };

      const options = getChartOptions('line', customOptions);

      expect(options.title?.text).toBe('Custom Title');
      expect(options.chart?.type).toBe('line');
    });

    it('should have default theme mode', () => {
      const options = getChartOptions('line');

      expect(options.theme?.mode).toBe('light');
    });
  });

  describe('getMobileDatasetChartOptions', () => {
    it('should return options for price chart', () => {
      const options = getMobileDatasetChartOptions('price');

      expect(options).toBeDefined();
      expect(options.chart).toBeDefined();
    });

    it('should return options for brand chart', () => {
      const options = getMobileDatasetChartOptions('brand');

      expect(options).toBeDefined();
    });

    it('should return options for year chart', () => {
      const options = getMobileDatasetChartOptions('year');

      expect(options).toBeDefined();
    });

    it('should return options for ram chart', () => {
      const options = getMobileDatasetChartOptions('ram');

      expect(options).toBeDefined();
    });

    it('should return options for battery chart', () => {
      const options = getMobileDatasetChartOptions('battery');

      expect(options).toBeDefined();
    });
  });
});
