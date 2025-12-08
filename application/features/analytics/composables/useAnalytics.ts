/**
 * Unified Analytics Composable
 *
 * Consolidates analytics-related functionality.
 * Integrates with domain layer for analytics processing.
 */

import { useAnalyticsStore } from '../store/analytics.store';
import type { AnalyticsStoreActions, AnalyticsStoreGetters } from '../types/store.types';
import { AnalyticsService } from '@/domain';

export const useAnalytics = () => {
  const store = useAnalyticsStore();

  // Type-safe access to store methods
  // Pinia stores expose actions and getters directly, but TypeScript needs help
  const storeActions = store as unknown as AnalyticsStoreActions;
  const storeGetters = store as unknown as AnalyticsStoreGetters;
  const _analyticsService = new AnalyticsService();

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initialize analytics
   */
  const initialize = () => {
    storeActions.initialize();
  };

  // ==========================================================================
  // User Management
  // ==========================================================================

  /**
   * Set user ID
   */
  const setUserId = (userId: string) => {
    storeActions.setUserId(userId);
  };

  /**
   * Set user properties
   */
  const setUserProperties = (properties: Record<string, any>) => {
    storeActions.setUserProperties(properties);
  };

  /**
   * Set tracking consent
   */
  const setTrackingConsent = (consent: boolean) => {
    storeActions.setTrackingConsent(consent);
  };

  /**
   * Enable/disable analytics
   */
  const setEnabled = (enabled: boolean) => {
    storeActions.setEnabled(enabled);
  };

  // ==========================================================================
  // Event Tracking
  // ==========================================================================

  /**
   * Track event
   */
  const trackEvent = (name: string, properties?: Record<string, any>) => {
    storeActions.trackEvent(name, properties);
  };

  /**
   * Track page view
   */
  const trackPageView = (path: string, title?: string, duration?: number) => {
    storeActions.trackPageView(path, title, duration);
  };

  /**
   * Track custom event with domain service processing
   */
  const trackCustomEvent = (name: string, properties?: Record<string, any>) => {
    if (!storeGetters.canTrack) return;

    // Use domain service for event processing if needed
    trackEvent(name, properties);
  };

  // ==========================================================================
  // Session Management
  // ==========================================================================

  /**
   * Start new session
   */
  const startNewSession = () => {
    storeActions.startNewSession();
  };

  /**
   * Flush events queue
   */
  const flushEvents = () => {
    return storeActions.flushEvents() || [];
  };

  /**
   * Clear all data
   */
  const clearData = () => {
    storeActions.clearData();
  };

  /**
   * Reset analytics
   */
  const reset = () => {
    storeActions.reset();
  };

  // ==========================================================================
  // Computed Properties
  // ==========================================================================

  const sessionId = computed(() => store.sessionId);
  const sessionDuration = computed(() => storeGetters.sessionDuration);
  const sessionInfo = computed(() => storeGetters.sessionInfo);
  const canTrack = computed(() => storeGetters.canTrack);
  const isEnabled = computed(() => store.isEnabled);
  const trackingConsent = computed(() => store.trackingConsent);
  const totalEvents = computed(() => store.totalEvents);
  const totalPageViews = computed(() => store.totalPageViews);

  /**
   * Get recent events
   */
  const getRecentEvents = (count: number = 10) => {
    return storeGetters.recentEvents(count);
  };

  /**
   * Get events by name
   */
  const getEventsByName = (name: string) => {
    return storeGetters.eventsByName(name);
  };

  /**
   * Get recent page views
   */
  const getRecentPageViews = (count: number = 10) => {
    return storeGetters.recentPageViews(count);
  };

  return {
    // Initialization
    initialize,

    // User Management
    setUserId,
    setUserProperties,
    setTrackingConsent,
    setEnabled,

    // Event Tracking
    trackEvent,
    trackPageView,
    trackCustomEvent,

    // Session Management
    startNewSession,
    flushEvents,
    clearData,
    reset,

    // Computed
    sessionId,
    sessionDuration,
    sessionInfo,
    canTrack,
    isEnabled,
    trackingConsent,
    totalEvents,
    totalPageViews,
    getRecentEvents,
    getEventsByName,
    getRecentPageViews,
  };
};
