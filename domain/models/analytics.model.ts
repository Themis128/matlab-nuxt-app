/**
 * Analytics Domain Model
 *
 * Represents analytics data and metrics in the domain layer.
 */

export interface AnalyticsDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsTimeSeries {
  name: string;
  data: AnalyticsDataPoint[];
  unit?: string;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'stable';
  unit?: string;
}

export interface AnalyticsDimension {
  name: string;
  value: string | number;
  count?: number;
  percentage?: number;
}

export class Analytics {
  constructor(
    public readonly id: string,
    public readonly metrics: AnalyticsMetric[],
    public readonly timeSeries?: AnalyticsTimeSeries[],
    public readonly dimensions?: AnalyticsDimension[],
    public readonly period?: {
      start: string;
      end: string;
    },
    public readonly metadata?: Record<string, unknown>
  ) {}

  /**
   * Get metric by name
   */
  getMetric(name: string): AnalyticsMetric | undefined {
    return this.metrics.find((m) => m.name === name);
  }

  /**
   * Get total value for a metric
   */
  getTotal(metricName: string): number {
    const metric = this.getMetric(metricName);
    return metric?.value ?? 0;
  }

  /**
   * Calculate growth rate
   */
  getGrowthRate(metricName: string): number {
    const metric = this.getMetric(metricName);
    if (!metric || !metric.previousValue || metric.previousValue === 0) {
      return 0;
    }
    return ((metric.value - metric.previousValue) / metric.previousValue) * 100;
  }

  /**
   * Get top dimension by count
   */
  getTopDimension(dimensionName: string, limit = 5): AnalyticsDimension[] {
    if (!this.dimensions) return [];

    return this.dimensions
      .filter((d) => d.name === dimensionName)
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, limit);
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      metrics: this.metrics,
      timeSeries: this.timeSeries,
      dimensions: this.dimensions,
      period: this.period,
      metadata: this.metadata,
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: any): Analytics {
    return new Analytics(
      data.id,
      data.metrics || [],
      data.timeSeries,
      data.dimensions,
      data.period,
      data.metadata
    );
  }
}
