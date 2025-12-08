/**
 * Nuxt 4 composable for performance monitoring
 * Tracks Web Vitals and custom performance metrics
 */

import { nextTick } from 'vue';

// Lazy import function for performance store (handles cases where store might not be available)
// Using variable to prevent Vite from statically analyzing the import path
const performanceStorePath = '~/stores/performanceStore';
const getPerformanceStore = async () => {
  try {
    // Use dynamic import with variable to avoid build-time errors
    const storeModule = await import(/* @vite-ignore */ performanceStorePath);
    return storeModule.usePerformanceStore;
  } catch {
    return null;
  }
};

// Global cache for Web Vitals (shared across all instances)
const webVitalsCache: { lcp: number | null; fid: number | null; cls: number } = {
  lcp: null,
  fid: null,
  cls: 0,
};

let observersInitialized = false;

// Initialize PerformanceObserver for Web Vitals (called once, early)
const initWebVitalsObserver = () => {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;
  if (observersInitialized) return;

  try {
    // LCP Observer - observe largest-contentful-paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry && lastEntry.startTime) {
          webVitalsCache.lcp = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      // LCP observer not supported
    }

    // FID Observer - observe first-input
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const entry = entries[0] as PerformanceEventTiming;
          if (entry.processingStart && entry.startTime) {
            webVitalsCache.fid = entry.processingStart - entry.startTime;
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch {
      // FID observer not supported
    }

    // CLS Observer - observe layout-shift
    try {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          const layoutShift = entry as any;
          if (!layoutShift.hadRecentInput && layoutShift.value) {
            webVitalsCache.cls += layoutShift.value;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch {
      // CLS observer not supported
    }

    observersInitialized = true;
  } catch {
    // PerformanceObserver not fully supported
  }
};

export const usePerformance = () => {
  // Initialize observers on first use
  if (typeof window !== 'undefined') {
    initWebVitalsObserver();
  }
  const measurePageLoad = () => {
    if (typeof window === 'undefined' || !window.performance) return null;

    try {
      // Get navigation timing - use modern API when available
      let navTiming: PerformanceNavigationTiming | null = null;

      // Try modern PerformanceNavigationTiming API first
      const navEntries = performance.getEntriesByType(
        'navigation'
      ) as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        navTiming = navEntries[0] as PerformanceNavigationTiming;
      }

      if (!navTiming) return null;

      return {
        dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,
        tcp: navTiming.connectEnd - navTiming.connectStart,
        request: navTiming.responseStart - navTiming.requestStart,
        response: navTiming.responseEnd - navTiming.responseStart,
        dom: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
        load: navTiming.loadEventEnd - navTiming.loadEventStart,
        total: navTiming.loadEventEnd - navTiming.fetchStart,
      };
    } catch (error) {
      console.error('Error measuring page load:', error);
      return null;
    }
  };

  const measureResourceTiming = (resourceName: string) => {
    if (typeof window === 'undefined' || !window.performance) return null;

    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const resource = resources.find((r) => r.name.includes(resourceName));

      if (!resource) return null;

      return {
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize,
        type: resource.initiatorType,
        startTime: resource.startTime,
      };
    } catch (error) {
      console.error('Error measuring resource timing:', error);
      return null;
    }
  };

  const measureApiCall = async (apiCall: () => Promise<any>) => {
    if (typeof window === 'undefined' || !window.performance) {
      return await apiCall();
    }

    const startMark = `api-call-start-${Date.now()}`;
    const endMark = `api-call-end-${Date.now()}`;

    performance.mark(startMark);

    try {
      const result = await apiCall();
      performance.mark(endMark);
      performance.measure('api-call-duration', startMark, endMark);

      const measure = performance.getEntriesByName('api-call-duration')[0];
      const duration = measure ? measure.duration : 0;

      // Track slow API calls
      if (duration > 1000) {
        console.warn(`Slow API call detected: ${duration}ms`);
      }

      return result;
    } catch (error) {
      performance.mark(endMark);
      throw error;
    }
  };

  const getWebVitals = () => {
    if (typeof window === 'undefined' || !window.performance) return null;

    // Return cached values (will be null/0 if not yet collected)
    // The global initWebVitalsObserver is already called at the start of usePerformance
    return {
      lcp: webVitalsCache.lcp,
      fid: webVitalsCache.fid,
      cls: webVitalsCache.cls > 0 ? webVitalsCache.cls : null,
    };
  };

  const trackPerformanceMetric = (metricName: string, value: number, unit: string = 'ms') => {
    if (typeof window === 'undefined') return;

    const metric = {
      name: metricName,
      value,
      unit,
      timestamp: Date.now(),
    };

    // Sync with performance store (async, non-blocking)
    getPerformanceStore()
      .then((storeFactory) => {
        if (storeFactory) {
          try {
            const performanceStore = storeFactory();
            performanceStore.trackMetric(metricName, value, unit);
          } catch (error) {
            console.warn('Performance store not available:', error);
          }
        }
      })
      .catch(() => {
        // Store import failed - continue without it
      });

    // Send to analytics if available
    if (process.client) {
      window.dispatchEvent(
        new CustomEvent('performance-metric', {
          detail: metric,
        })
      );
    }

    // Log in development (only if explicitly enabled)
    if (process.dev && process.env.NUXT_PUBLIC_PERFORMANCE_DEBUG === 'true') {
      console.log('Performance Metric:', metric);
    }
  };

  // Helper function to initialize performance tracking
  // Components should call this in their onMounted hook
  const initializePerformanceTracking = () => {
    if (typeof window === 'undefined') return;

    nextTick(() => {
      const pageLoadMetrics = measurePageLoad();
      if (pageLoadMetrics) {
        // Sync with performance store (async, non-blocking)
        getPerformanceStore()
          .then((storeFactory) => {
            if (storeFactory) {
              try {
                const performanceStore = storeFactory();
                performanceStore.updatePageLoad(pageLoadMetrics);
              } catch (error) {
                console.warn('Performance store not available:', error);
              }
            }
          })
          .catch(() => {
            // Store import failed - continue without it
          });

        trackPerformanceMetric('page_load_total', pageLoadMetrics.total);
        trackPerformanceMetric('page_load_dom', pageLoadMetrics.dom);
      }

      // Track Web Vitals after a delay
      setTimeout(() => {
        const vitals = getWebVitals();
        if (vitals) {
          // Sync with performance store (async, non-blocking)
          getPerformanceStore()
            .then((storeFactory) => {
              if (storeFactory) {
                try {
                  const performanceStore = storeFactory();
                  performanceStore.updateWebVitals(vitals);
                } catch (error) {
                  console.warn('Performance store not available:', error);
                }
              }
            })
            .catch(() => {
              // Store import failed - continue without it
            });

          if (vitals.lcp) trackPerformanceMetric('lcp', vitals.lcp);
          if (vitals.fid) trackPerformanceMetric('fid', vitals.fid);
          if (vitals.cls) trackPerformanceMetric('cls', vitals.cls, 'score');
        }
      }, 2000);
    });
  };

  return {
    measurePageLoad,
    measureResourceTiming,
    measureApiCall,
    getWebVitals,
    trackPerformanceMetric,
    initializePerformanceTracking,
  };
};
