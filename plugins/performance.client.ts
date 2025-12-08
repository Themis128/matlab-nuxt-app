import { usePerformanceStore } from '~/stores/performanceStore';

/**
 * Nuxt 4 plugin for performance monitoring
 * Tracks Web Vitals and custom performance metrics
 * Integrates with Sentry for performance tracking
 */
export default defineNuxtPlugin((nuxtApp: any) => {
  if (typeof window === 'undefined' || !window.performance) return;

  // Initialize Web Vitals observers early (before any metrics are collected)
  const performance = usePerformance();
  const sentryMetrics = useSentryMetrics();

  // Sync with performance store
  try {
    const _performanceStore = usePerformanceStore();
    // Store is already initialized in pinia-init plugin
  } catch (error) {
    console.warn('Performance store not available:', error);
  }

  // Track route changes
  nuxtApp.hook('page:start', () => {
    const timestamp = Date.now();
    performance.trackPerformanceMetric('route_change_start', timestamp);
    sentryMetrics.trackInteraction('route_change', 'start');
  });

  nuxtApp.hook('page:finish', () => {
    const loadTime = performance.measurePageLoad();
    if (loadTime) {
      performance.trackPerformanceMetric('route_load_time', loadTime.total);

      // Send to Sentry
      sentryMetrics.trackPerformance('route_load_time', loadTime.total, 'millisecond', {
        dns: loadTime.dns,
        tcp: loadTime.tcp,
        request: loadTime.request,
        response: loadTime.response,
        dom: loadTime.dom,
        load: loadTime.load,
      });
    }

    // Track Web Vitals after page load
    nextTick(() => {
      setTimeout(() => {
        const vitals = performance.getWebVitals();
        if (vitals) {
          if (vitals.lcp) {
            performance.trackPerformanceMetric('lcp', vitals.lcp);
            sentryMetrics.trackPerformance('lcp', vitals.lcp, 'millisecond', {
              metric: 'largest_contentful_paint',
            });
          }
          if (vitals.fid) {
            performance.trackPerformanceMetric('fid', vitals.fid);
            sentryMetrics.trackPerformance('fid', vitals.fid, 'millisecond', {
              metric: 'first_input_delay',
            });
          }
          if (vitals.cls) {
            performance.trackPerformanceMetric('cls', vitals.cls, 'score');
            sentryMetrics.trackPerformance('cls', vitals.cls, 'score', {
              metric: 'cumulative_layout_shift',
            });
          }
        }
      }, 2000); // Wait 2 seconds for LCP
    });
  });

  // Listen for custom performance events
  if (process.client) {
    window.addEventListener('performance-metric', ((event: CustomEvent) => {
      const metric = event.detail;

      // Send to analytics if needed
      const analytics = useAnalytics();
      analytics.trackEvent('performance_metric', metric);

      // Send to Sentry if it's a performance metric
      if (metric.name && typeof metric.value === 'number') {
        sentryMetrics.trackPerformance(
          metric.name,
          metric.value,
          metric.unit || 'millisecond',
          metric.attributes || {}
        );
      }
    }) as EventListener);
  }
});
