import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePerformanceStore } from '../performanceStore';

describe('performanceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('state', () => {
    it('should initialize with default state', () => {
      const store = usePerformanceStore();

      expect(store.currentWebVitals).toBeNull();
      expect(store.currentPageLoad).toBeNull();
      expect(store.metricsHistory).toEqual([]);
      expect(store.isTracking).toBe(false);
      expect(store.thresholds).toBeDefined();
    });
  });

  describe('getters', () => {
    it('should get latest metrics', () => {
      const store = usePerformanceStore();
      store.currentWebVitals = { lcp: 2000, fid: 50, cls: 0.05 };
      store.currentPageLoad = {
        dns: 10,
        tcp: 20,
        request: 30,
        response: 40,
        dom: 50,
        load: 60,
        total: 210,
      };

      const latest = store.latestMetrics;

      expect(latest.webVitals).toEqual({ lcp: 2000, fid: 50, cls: 0.05 });
      expect(latest.pageLoad).toBeDefined();
    });

    it('should calculate performance score', () => {
      const store = usePerformanceStore();
      store.currentWebVitals = { lcp: 2000, fid: 50, cls: 0.05 };

      const score = store.performanceScore;

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 score when no vitals', () => {
      const store = usePerformanceStore();

      expect(store.performanceScore).toBe(0);
    });

    it('should calculate performance grade', () => {
      const store = usePerformanceStore();
      store.currentWebVitals = { lcp: 2000, fid: 50, cls: 0.05 };

      const grade = store.performanceGrade;

      expect(['A', 'B', 'C', 'D', 'F']).toContain(grade);
    });

    it('should check if performance is good', () => {
      const store = usePerformanceStore();
      store.currentWebVitals = { lcp: 2000, fid: 50, cls: 0.05 };

      expect(store.isPerformanceGood).toBeDefined();
      expect(typeof store.isPerformanceGood).toBe('boolean');
    });

    it('should get recent metrics', () => {
      const store = usePerformanceStore();
      store.metricsHistory = [
        { name: 'metric1', value: 100, unit: 'ms', timestamp: Date.now() },
        { name: 'metric2', value: 200, unit: 'ms', timestamp: Date.now() },
        { name: 'metric3', value: 300, unit: 'ms', timestamp: Date.now() },
      ];

      const recent = store.recentMetrics(2);

      expect(recent).toHaveLength(2);
    });

    it('should filter metrics by name', () => {
      const store = usePerformanceStore();
      store.metricsHistory = [
        { name: 'lcp', value: 2000, unit: 'ms', timestamp: Date.now() },
        { name: 'fid', value: 50, unit: 'ms', timestamp: Date.now() },
        { name: 'lcp', value: 2100, unit: 'ms', timestamp: Date.now() },
      ];

      const lcpMetrics = store.metricsByName('lcp');

      expect(lcpMetrics).toHaveLength(2);
      expect(lcpMetrics.every((m) => m.name === 'lcp')).toBe(true);
    });

    it('should count active alerts', () => {
      const store = usePerformanceStore();
      store.alerts = [
        { type: 'warning', metric: 'lcp', message: 'Warning', timestamp: Date.now() },
        { type: 'error', metric: 'fid', message: 'Error', timestamp: Date.now() },
      ];

      expect(store.activeAlertsCount).toBe(2);
    });
  });

  describe('actions', () => {
    it('should start and stop tracking', () => {
      const store = usePerformanceStore();

      store.startTracking();
      expect(store.isTracking).toBe(true);
      expect(store.trackingStartTime).toBeTruthy();

      store.stopTracking();
      expect(store.isTracking).toBe(false);
      expect(store.trackingStartTime).toBeNull();
    });

    it('should update Web Vitals', () => {
      const store = usePerformanceStore();
      const vitals = { lcp: 2000, fid: 50, cls: 0.05 };

      store.updateWebVitals(vitals);

      expect(store.currentWebVitals).toEqual(vitals);
      expect(store.webVitalsHistory).toHaveLength(1);
    });

    it('should limit Web Vitals history to 50', () => {
      const store = usePerformanceStore();

      for (let i = 0; i < 55; i++) {
        store.updateWebVitals({ lcp: 2000, fid: 50, cls: 0.05 });
      }

      expect(store.webVitalsHistory.length).toBeLessThanOrEqual(50);
    });

    it('should update page load metrics', () => {
      const store = usePerformanceStore();
      const metrics = {
        dns: 10,
        tcp: 20,
        request: 30,
        response: 40,
        dom: 50,
        load: 60,
        total: 210,
      };

      store.updatePageLoad(metrics);

      expect(store.currentPageLoad).toEqual(metrics);
      expect(store.pageLoadHistory).toHaveLength(1);
    });

    it('should add performance metric', () => {
      const store = usePerformanceStore();

      store.addMetric({
        name: 'custom_metric',
        value: 150,
        unit: 'ms',
        timestamp: Date.now(),
      });

      expect(store.metricsHistory).toHaveLength(1);
      expect(store.metricsHistory[0]?.name).toBe('custom_metric');
    });

    it('should track metric with convenience method', () => {
      const store = usePerformanceStore();

      store.trackMetric('api_call', 200, 'ms', { endpoint: '/api/data' });

      expect(store.metricsHistory).toHaveLength(1);
      expect(store.metricsHistory[0]?.name).toBe('api_call');
      expect(store.metricsHistory[0]?.value).toBe(200);
      expect(store.metricsHistory[0]?.attributes?.endpoint).toBe('/api/data');
    });

    it('should check Web Vitals thresholds and create alerts', () => {
      const store = usePerformanceStore();

      // Poor LCP
      store.updateWebVitals({ lcp: 5000, fid: 50, cls: 0.05 });

      expect(store.alerts.length).toBeGreaterThan(0);
      expect(store.alerts.some((a) => a.metric === 'lcp' && a.type === 'error')).toBe(true);
    });

    it('should add performance alert', () => {
      const store = usePerformanceStore();

      store.addAlert('warning', 'lcp', 'LCP is high');

      expect(store.alerts).toHaveLength(1);
      expect(store.alerts[0]?.type).toBe('warning');
      expect(store.alerts[0]?.metric).toBe('lcp');
    });

    it('should limit alerts to 20', () => {
      const store = usePerformanceStore();

      for (let i = 0; i < 25; i++) {
        store.addAlert('warning', 'metric', `Alert ${i}`);
      }

      expect(store.alerts.length).toBeLessThanOrEqual(20);
    });

    it('should clear alerts', () => {
      const store = usePerformanceStore();
      store.addAlert('warning', 'lcp', 'Test');

      store.clearAlerts();

      expect(store.alerts).toEqual([]);
    });

    it('should clear history', () => {
      const store = usePerformanceStore();
      store.addMetric({ name: 'test', value: 100, unit: 'ms', timestamp: Date.now() });
      store.updateWebVitals({ lcp: 2000, fid: 50, cls: 0.05 });
      store.updatePageLoad({
        dns: 10,
        tcp: 20,
        request: 30,
        response: 40,
        dom: 50,
        load: 60,
        total: 210,
      });

      store.clearHistory();

      expect(store.metricsHistory).toEqual([]);
      expect(store.webVitalsHistory).toEqual([]);
      expect(store.pageLoadHistory).toEqual([]);
    });

    it('should reset store', () => {
      const store = usePerformanceStore();
      store.startTracking();
      store.updateWebVitals({ lcp: 2000, fid: 50, cls: 0.05 });
      store.addAlert('warning', 'lcp', 'Test');

      store.reset();

      expect(store.currentWebVitals).toBeNull();
      expect(store.currentPageLoad).toBeNull();
      expect(store.metricsHistory).toEqual([]);
      expect(store.alerts).toEqual([]);
      expect(store.isTracking).toBe(false);
    });
  });
});
