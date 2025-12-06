/**
 * Composable for lazy loading components
 * Provides utilities for dynamic component imports with loading states
 */

import { defineAsyncComponent } from 'vue';

export function useLazyComponent() {
  /**
   * Lazy load a component with loading state
   */
  function lazyLoad<T extends () => Promise<any>>(
    importFn: T,
    options?: {
      loadingComponent?: any;
      errorComponent?: any;
      delay?: number;
      timeout?: number;
    }
  ) {
    return defineAsyncComponent({
      loader: importFn,
      loadingComponent: options?.loadingComponent,
      errorComponent: options?.errorComponent,
      delay: options?.delay || 200,
      timeout: options?.timeout || 30000,
    });
  }

  /**
   * Lazy load analytics chart components
   */
  const AnalyticsAccuracyChart = lazyLoad(() => import('~/components/AnalyticsAccuracyChart.vue'));
  const AnalyticsTopBrandsChart = lazyLoad(
    () => import('~/components/AnalyticsTopBrandsChart.vue')
  );
  const AnalyticsGeographicalChart = lazyLoad(
    () => import('~/components/AnalyticsGeographicalChart.vue')
  );
  const AnalyticsFeatureImportanceChart = lazyLoad(
    () => import('~/components/AnalyticsFeatureImportanceChart.vue')
  );
  const AnalyticsYearlyTrendsChart = lazyLoad(
    () => import('~/components/AnalyticsYearlyTrendsChart.vue')
  );

  /**
   * Lazy load dashboard components
   */
  const PerformanceMetrics = lazyLoad(() => import('~/components/PerformanceMetrics.vue'));
  const MagicUIDashboard = lazyLoad(() => import('~/components/MagicUIDashboard.vue'));
  const DashboardContent = lazyLoad(() => import('~/components/DashboardContent.vue'));

  /**
   * Lazy load utility components
   */
  const UserPreferencesDialog = lazyLoad(() => import('~/components/UserPreferencesDialog.vue'));

  return {
    lazyLoad,
    // Pre-configured lazy components
    AnalyticsAccuracyChart,
    AnalyticsTopBrandsChart,
    AnalyticsGeographicalChart,
    AnalyticsFeatureImportanceChart,
    AnalyticsYearlyTrendsChart,
    PerformanceMetrics,
    MagicUIDashboard,
    DashboardContent,
    UserPreferencesDialog,
  };
}
