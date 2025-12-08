/**
 * Analytics Service Tests
 */

import { describe, it, expect } from 'vitest';
import { AnalyticsService } from '../analytics.service';
import type { AnalyticsTimeSeries } from '../../models/analytics.model';

describe('AnalyticsService', () => {
  const service = new AnalyticsService();

  describe('calculateTrend', () => {
    it('should detect upward trend', () => {
      const timeSeries: AnalyticsTimeSeries = {
        name: 'Sales',
        data: [
          { timestamp: '2024-01-01', value: 100 },
          { timestamp: '2024-01-02', value: 110 },
          { timestamp: '2024-01-03', value: 120 },
        ],
      };

      expect(service.calculateTrend(timeSeries)).toBe('up');
    });

    it('should detect downward trend', () => {
      const timeSeries: AnalyticsTimeSeries = {
        name: 'Sales',
        data: [
          { timestamp: '2024-01-01', value: 100 },
          { timestamp: '2024-01-02', value: 90 },
          { timestamp: '2024-01-03', value: 80 },
        ],
      };

      expect(service.calculateTrend(timeSeries)).toBe('down');
    });

    it('should detect stable trend', () => {
      const timeSeries: AnalyticsTimeSeries = {
        name: 'Sales',
        data: [
          { timestamp: '2024-01-01', value: 100 },
          { timestamp: '2024-01-02', value: 102 },
          { timestamp: '2024-01-03', value: 101 },
        ],
      };

      expect(service.calculateTrend(timeSeries)).toBe('stable');
    });
  });

  describe('calculateAverage', () => {
    it('should calculate average correctly', () => {
      const timeSeries: AnalyticsTimeSeries = {
        name: 'Sales',
        data: [
          { timestamp: '2024-01-01', value: 100 },
          { timestamp: '2024-01-02', value: 200 },
          { timestamp: '2024-01-03', value: 300 },
        ],
      };

      expect(service.calculateAverage(timeSeries)).toBe(200);
    });

    it('should return 0 for empty time series', () => {
      const timeSeries: AnalyticsTimeSeries = {
        name: 'Sales',
        data: [],
      };

      expect(service.calculateAverage(timeSeries)).toBe(0);
    });
  });

  describe('calculateGrowthRate', () => {
    it('should calculate positive growth', () => {
      expect(service.calculateGrowthRate(110, 100)).toBe(10);
    });

    it('should calculate negative growth', () => {
      expect(service.calculateGrowthRate(90, 100)).toBe(-10);
    });

    it('should return 0 when previous is 0', () => {
      expect(service.calculateGrowthRate(100, 0)).toBe(0);
    });
  });

  describe('updateMetricTrend', () => {
    it('should update metric with trend', () => {
      const metric = {
        name: 'Sales',
        value: 110,
        previousValue: 100,
      };

      const updated = service.updateMetricTrend(metric);
      expect(updated.change).toBe(10);
      expect(updated.changePercent).toBe(10);
      expect(updated.trend).toBe('up');
    });

    it('should handle metric without previous value', () => {
      const metric = {
        name: 'Sales',
        value: 100,
      };

      const updated = service.updateMetricTrend(metric);
      expect(updated).toEqual(metric);
    });
  });

  describe('formatMetric', () => {
    it('should format metric with unit', () => {
      const metric = {
        name: 'Sales',
        value: 1000,
        unit: 'USD',
        changePercent: 10,
      };

      const formatted = service.formatMetric(metric);
      expect(formatted).toContain('1,000');
      expect(formatted).toContain('USD');
      expect(formatted).toContain('+10.0%');
    });
  });
});
