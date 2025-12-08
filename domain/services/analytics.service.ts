/**
 * Analytics Domain Service
 *
 * Contains business logic for analytics
 */

import {
  Analytics,
  type AnalyticsMetric,
  type AnalyticsTimeSeries,
  type AnalyticsDataPoint,
} from '../models/analytics.model';

export class AnalyticsService {
  /**
   * Calculate trend from time series
   */
  calculateTrend(timeSeries: AnalyticsTimeSeries): 'up' | 'down' | 'stable' {
    if (timeSeries.data.length < 2) return 'stable';

    const first = timeSeries.data[0]!.value;
    const last = timeSeries.data[timeSeries.data.length - 1]!.value;
    const change = last - first;
    const changePercent = (change / first) * 100;

    if (changePercent > 5) return 'up';
    if (changePercent < -5) return 'down';
    return 'stable';
  }

  /**
   * Calculate average from time series
   */
  calculateAverage(timeSeries: AnalyticsTimeSeries): number {
    if (timeSeries.data.length === 0) return 0;

    const sum = timeSeries.data.reduce((acc, point) => acc + point.value, 0);
    return sum / timeSeries.data.length;
  }

  /**
   * Calculate growth rate
   */
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Update metric with trend
   */
  updateMetricTrend(metric: AnalyticsMetric): AnalyticsMetric {
    if (metric.previousValue !== undefined) {
      const change = metric.value - metric.previousValue;
      const changePercent = this.calculateGrowthRate(metric.value, metric.previousValue);

      return {
        ...metric,
        change,
        changePercent: Math.round(changePercent * 100) / 100,
        trend: changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable',
      };
    }

    return metric;
  }

  /**
   * Aggregate analytics data
   */
  aggregate(analytics: Analytics[]): Analytics {
    if (analytics.length === 0) {
      throw new Error('Cannot aggregate empty analytics array');
    }

    // Aggregate metrics
    const metricMap = new Map<string, AnalyticsMetric>();

    for (const a of analytics) {
      for (const metric of a.metrics) {
        const existing = metricMap.get(metric.name);
        if (existing) {
          metricMap.set(metric.name, {
            ...metric,
            value: existing.value + metric.value,
          });
        } else {
          metricMap.set(metric.name, { ...metric });
        }
      }
    }

    // Combine time series (if all have same name)
    const timeSeriesMap = new Map<string, AnalyticsDataPoint[]>();
    for (const a of analytics) {
      if (a.timeSeries) {
        for (const ts of a.timeSeries) {
          const existing = timeSeriesMap.get(ts.name);
          if (existing) {
            timeSeriesMap.set(ts.name, [...existing, ...ts.data]);
          } else {
            timeSeriesMap.set(ts.name, [...ts.data]);
          }
        }
      }
    }

    return new Analytics(
      'aggregated',
      Array.from(metricMap.values()),
      Array.from(timeSeriesMap.entries()).map(([name, data]) => ({
        name,
        data,
      })),
      analytics[0]!.dimensions,
      analytics[0]!.period,
      { aggregatedFrom: analytics.length }
    );
  }

  /**
   * Format metric for display
   */
  formatMetric(metric: AnalyticsMetric): string {
    const value = metric.value.toLocaleString();
    const unit = metric.unit || '';
    const change = metric.changePercent
      ? ` (${metric.changePercent > 0 ? '+' : ''}${metric.changePercent.toFixed(1)}%)`
      : '';

    return `${value}${unit}${change}`;
  }
}
