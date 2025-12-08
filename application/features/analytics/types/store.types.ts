/**
 * Type definitions for Analytics Store
 * Helps TypeScript properly infer store types
 */

import type { useAnalyticsStore } from '../store/analytics.store';

// Define types locally to avoid import issues
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface PageView {
  path: string;
  title?: string;
  timestamp: number;
  duration?: number;
  referrer?: string;
}

// Extract the store instance type
export type AnalyticsStoreInstance = ReturnType<typeof useAnalyticsStore>;

// Helper type for store actions
export interface AnalyticsStoreActions {
  initialize: () => void;
  setUserId: (userId: string) => void;
  setUserProperties: (properties: Record<string, any>) => void;
  setTrackingConsent: (consent: boolean) => void;
  setEnabled: (enabled: boolean) => void;
  trackEvent: (name: string, properties?: Record<string, any>) => void;
  trackPageView: (path: string, title?: string, duration?: number) => void;
  startNewSession: () => void;
  flushEvents: () => AnalyticsEvent[];
  clearData: () => void;
  reset: () => void;
}

// Helper type for store getters
export interface AnalyticsStoreGetters {
  sessionDuration: number;
  canTrack: boolean;
  sessionInfo: {
    sessionId: string;
    duration: number;
    startTime: number | null;
    eventCount: number;
    pageViewCount: number;
  };
  recentEvents: (count?: number) => AnalyticsEvent[];
  eventsByName: (name: string) => AnalyticsEvent[];
  recentPageViews: (count?: number) => PageView[];
}
