import { defineStore } from 'pinia';

/**
 * Performance metrics interface
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  attributes?: Record<string, any>;
}

/**
 * Web Vitals data
 */
export interface WebVitals {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp?: number | null; // First Contentful Paint
  ttfb?: number | null; // Time to First Byte
}

/**
 * Page load metrics
 */
export interface PageLoadMetrics {
  dns: number;
  tcp: number;
  request: number;
  response: number;
  dom: number;
  load: number;
  total: number;
}

/**
 * Performance store for tracking and managing performance metrics
 */
export const usePerformanceStore = defineStore('performance', {
  state: () => ({
    // Current metrics
    currentWebVitals: null as WebVitals | null,
    currentPageLoad: null as PageLoadMetrics | null,

    // Metrics history (last 50 entries)
    metricsHistory: [] as PerformanceMetric[],
    webVitalsHistory: [] as WebVitals[],
    pageLoadHistory: [] as PageLoadMetrics[],

    // Performance tracking state
    isTracking: false,
    trackingStartTime: null as number | null,

    // Performance thresholds
    thresholds: {
      lcp: { good: 2500, poor: 4000 }, // milliseconds
      fid: { good: 100, poor: 300 }, // milliseconds
      cls: { good: 0.1, poor: 0.25 }, // score
      fcp: { good: 1800, poor: 3000 }, // milliseconds
      ttfb: { good: 800, poor: 1800 }, // milliseconds
    },

    // Performance alerts
    alerts: [] as Array<{
      type: 'warning' | 'error';
      metric: string;
      message: string;
      timestamp: number;
    }>,
  }),

  getters: {
    /**
     * Get latest performance metrics
     */
    latestMetrics: (state) => {
      return {
        webVitals: state.currentWebVitals,
        pageLoad: state.currentPageLoad,
      };
    },

    /**
     * Get performance score based on Web Vitals
     */
    performanceScore: (state) => {
      if (!state.currentWebVitals) return 0;

      const { lcp, fid, cls } = state.currentWebVitals;
      let score = 100;

      // LCP scoring
      if (lcp !== null) {
        if (lcp > state.thresholds.lcp.poor) score -= 30;
        else if (lcp > state.thresholds.lcp.good) score -= 15;
      }

      // FID scoring
      if (fid !== null) {
        if (fid > state.thresholds.fid.poor) score -= 30;
        else if (fid > state.thresholds.fid.good) score -= 15;
      }

      // CLS scoring
      if (cls !== null) {
        if (cls > state.thresholds.cls.poor) score -= 30;
        else if (cls > state.thresholds.cls.good) score -= 15;
      }

      return Math.max(0, score);
    },

    /**
     * Get performance grade (A-F)
     */
    performanceGrade: (state) => {
      if (!state.currentWebVitals) return 'N/A';

      const score = (() => {
        const { lcp, fid, cls } = state.currentWebVitals;
        let score = 100;

        // LCP scoring
        if (lcp !== null) {
          if (lcp > state.thresholds.lcp.poor) score -= 30;
          else if (lcp > state.thresholds.lcp.good) score -= 15;
        }

        // FID scoring
        if (fid !== null) {
          if (fid > state.thresholds.fid.poor) score -= 30;
          else if (fid > state.thresholds.fid.good) score -= 15;
        }

        // CLS scoring
        if (cls !== null) {
          if (cls > state.thresholds.cls.poor) score -= 30;
          else if (cls > state.thresholds.cls.good) score -= 15;
        }

        return Math.max(0, score);
      })();

      if (score >= 90) return 'A';
      if (score >= 75) return 'B';
      if (score >= 60) return 'C';
      if (score >= 40) return 'D';
      return 'F';
    },

    /**
     * Check if performance is good
     */
    isPerformanceGood: (state) => {
      const score = (() => {
        if (!state.currentWebVitals) return null;

        const { lcp, fid, cls } = state.currentWebVitals;
        let score = 100;

        // LCP scoring
        if (lcp !== null) {
          if (lcp > state.thresholds.lcp.poor) score -= 30;
          else if (lcp > state.thresholds.lcp.good) score -= 15;
        }

        // FID scoring
        if (fid !== null) {
          if (fid > state.thresholds.fid.poor) score -= 30;
          else if (fid > state.thresholds.fid.good) score -= 15;
        }

        // CLS scoring
        if (cls !== null) {
          if (cls > state.thresholds.cls.poor) score -= 30;
          else if (cls > state.thresholds.cls.good) score -= 15;
        }

        return Math.max(0, score);
      })();

      return score !== null && score >= 75;
    },

    /**
     * Get recent metrics (last N entries)
     */
    recentMetrics:
      (state) =>
      (count: number = 10) => {
        return state.metricsHistory.slice(-count);
      },

    /**
     * Get metrics by name
     */
    metricsByName: (state) => (name: string) => {
      return state.metricsHistory.filter((m) => m.name === name);
    },

    /**
     * Get active alerts count
     */
    activeAlertsCount: (state) => {
      return state.alerts.length;
    },

    /**
     * Get unread alerts
     */
    unreadAlerts: (state) => {
      return state.alerts.filter((a) => !a.timestamp || Date.now() - a.timestamp < 3600000); // Last hour
    },
  },

  actions: {
    /**
     * Start performance tracking
     */
    startTracking() {
      this.isTracking = true;
      this.trackingStartTime = Date.now();
    },

    /**
     * Stop performance tracking
     */
    stopTracking() {
      this.isTracking = false;
      this.trackingStartTime = null;
    },

    /**
     * Update Web Vitals
     */
    updateWebVitals(vitals: WebVitals) {
      this.currentWebVitals = vitals;

      // Add to history (keep last 50)
      this.webVitalsHistory.push({ ...vitals });
      if (this.webVitalsHistory.length > 50) {
        this.webVitalsHistory.shift();
      }

      // Check thresholds and create alerts
      this.checkWebVitalsThresholds(vitals);
    },

    /**
     * Update page load metrics
     */
    updatePageLoad(metrics: PageLoadMetrics) {
      this.currentPageLoad = metrics;

      // Add to history (keep last 50)
      this.pageLoadHistory.push({ ...metrics });
      if (this.pageLoadHistory.length > 50) {
        this.pageLoadHistory.shift();
      }
    },

    /**
     * Add performance metric
     */
    addMetric(metric: PerformanceMetric) {
      this.metricsHistory.push(metric);

      // Keep only last 50 metrics
      if (this.metricsHistory.length > 50) {
        this.metricsHistory.shift();
      }
    },

    /**
     * Track performance metric (convenience method)
     */
    trackMetric(
      name: string,
      value: number,
      unit: string = 'ms',
      attributes?: Record<string, any>
    ) {
      this.addMetric({
        name,
        value,
        unit,
        timestamp: Date.now(),
        attributes,
      });
    },

    /**
     * Check Web Vitals against thresholds
     */
    checkWebVitalsThresholds(vitals: WebVitals) {
      // Check LCP
      if (vitals.lcp !== null) {
        if (vitals.lcp > this.thresholds.lcp.poor) {
          this.addAlert(
            'error',
            'lcp',
            `LCP is ${vitals.lcp}ms (poor threshold: ${this.thresholds.lcp.poor}ms)`
          );
        } else if (vitals.lcp > this.thresholds.lcp.good) {
          this.addAlert('warning', 'lcp', `LCP is ${vitals.lcp}ms (needs improvement)`);
        }
      }

      // Check FID
      if (vitals.fid !== null) {
        if (vitals.fid > this.thresholds.fid.poor) {
          this.addAlert(
            'error',
            'fid',
            `FID is ${vitals.fid}ms (poor threshold: ${this.thresholds.fid.poor}ms)`
          );
        } else if (vitals.fid > this.thresholds.fid.good) {
          this.addAlert('warning', 'fid', `FID is ${vitals.fid}ms (needs improvement)`);
        }
      }

      // Check CLS
      if (vitals.cls !== null) {
        if (vitals.cls > this.thresholds.cls.poor) {
          this.addAlert(
            'error',
            'cls',
            `CLS is ${vitals.cls} (poor threshold: ${this.thresholds.cls.poor})`
          );
        } else if (vitals.cls > this.thresholds.cls.good) {
          this.addAlert('warning', 'cls', `CLS is ${vitals.cls} (needs improvement)`);
        }
      }
    },

    /**
     * Add performance alert
     */
    addAlert(type: 'warning' | 'error', metric: string, message: string) {
      this.alerts.push({
        type,
        metric,
        message,
        timestamp: Date.now(),
      });

      // Keep only last 20 alerts
      if (this.alerts.length > 20) {
        this.alerts.shift();
      }
    },

    /**
     * Clear alerts
     */
    clearAlerts() {
      this.alerts = [];
    },

    /**
     * Clear metrics history
     */
    clearHistory() {
      this.metricsHistory = [];
      this.webVitalsHistory = [];
      this.pageLoadHistory = [];
    },

    /**
     * Reset store to initial state
     */
    reset() {
      this.currentWebVitals = null;
      this.currentPageLoad = null;
      this.metricsHistory = [];
      this.webVitalsHistory = [];
      this.pageLoadHistory = [];
      this.alerts = [];
      this.isTracking = false;
      this.trackingStartTime = null;
    },
  },

  persist: {
    key: 'performance-store',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    paths: ['metricsHistory', 'webVitalsHistory', 'pageLoadHistory', 'thresholds'],
  },
});
