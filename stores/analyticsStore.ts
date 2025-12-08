import { defineStore } from 'pinia';

/**
 * Analytics event interface
 */
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

/**
 * Page view data
 */
export interface PageView {
  path: string;
  title?: string;
  timestamp: number;
  duration?: number;
  referrer?: string;
}

/**
 * Analytics store for managing analytics state and events
 */
export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    // Current session
    sessionId: '',
    sessionStartTime: null as number | null,

    // Events queue (for offline support)
    eventsQueue: [] as AnalyticsEvent[],
    pageViews: [] as PageView[],

    // Analytics state
    isEnabled: true,
    isInitialized: false,
    providers: {
      googleAnalytics: false,
      plausible: false,
      custom: true,
    },

    // User identification
    userId: null as string | null,
    userProperties: {} as Record<string, any>,

    // Tracking preferences
    trackingConsent: null as boolean | null, // null = not asked, true = consented, false = declined

    // Statistics
    totalEvents: 0,
    totalPageViews: 0,
    lastEventTime: null as number | null,
  }),

  getters: {
    /**
     * Get current session duration
     */
    sessionDuration: (state) => {
      if (!state.sessionStartTime) return 0;
      return Date.now() - state.sessionStartTime;
    },

    /**
     * Get recent events (last N)
     */
    recentEvents:
      (state) =>
      (count: number = 10) => {
        return state.eventsQueue.slice(-count);
      },

    /**
     * Get events by name
     */
    eventsByName: (state) => (name: string) => {
      return state.eventsQueue.filter((e) => e.name === name);
    },

    /**
     * Get recent page views
     */
    recentPageViews:
      (state) =>
      (count: number = 10) => {
        return state.pageViews.slice(-count);
      },

    /**
     * Check if tracking is allowed
     */
    canTrack: (state) => {
      return state.isEnabled && state.trackingConsent !== false;
    },

    /**
     * Get session info
     */
    sessionInfo: (state) => {
      const duration = state.sessionStartTime ? Date.now() - state.sessionStartTime : 0;
      return {
        sessionId: state.sessionId,
        duration,
        startTime: state.sessionStartTime,
        eventCount: state.totalEvents,
        pageViewCount: state.totalPageViews,
      };
    },
  },

  actions: {
    /**
     * Initialize analytics
     */
    initialize() {
      if (this.isInitialized) return;

      // Generate session ID
      this.sessionId = this.generateSessionId();
      this.sessionStartTime = Date.now();

      // Check for existing consent
      if (typeof window !== 'undefined') {
        const consent = localStorage.getItem('analytics-consent');
        if (consent !== null) {
          this.trackingConsent = consent === 'true';
        }
      }

      this.isInitialized = true;
    },

    /**
     * Generate unique session ID
     */
    generateSessionId(): string {
      return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    },

    /**
     * Set user ID
     */
    setUserId(userId: string) {
      this.userId = userId;
    },

    /**
     * Set user properties
     */
    setUserProperties(properties: Record<string, any>) {
      this.userProperties = { ...this.userProperties, ...properties };
    },

    /**
     * Set tracking consent
     */
    setTrackingConsent(consent: boolean) {
      this.trackingConsent = consent;
      if (typeof window !== 'undefined') {
        localStorage.setItem('analytics-consent', String(consent));
      }

      // If consent withdrawn, clear queue
      if (!consent) {
        this.eventsQueue = [];
      }
    },

    /**
     * Enable/disable analytics
     */
    setEnabled(enabled: boolean) {
      this.isEnabled = enabled;
    },

    /**
     * Track event
     */
    trackEvent(name: string, properties?: Record<string, any>) {
      if (!this.canTrack) return;

      const event: AnalyticsEvent = {
        name,
        properties,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId || undefined,
      };

      this.eventsQueue.push(event);
      this.totalEvents++;
      this.lastEventTime = Date.now();

      // Keep only last 100 events in queue
      if (this.eventsQueue.length > 100) {
        this.eventsQueue.shift();
      }
    },

    /**
     * Track page view
     */
    trackPageView(path: string, title?: string, duration?: number) {
      if (!this.canTrack) return;

      const pageView: PageView = {
        path,
        title,
        timestamp: Date.now(),
        duration,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      };

      this.pageViews.push(pageView);
      this.totalPageViews++;

      // Keep only last 50 page views
      if (this.pageViews.length > 50) {
        this.pageViews.shift();
      }
    },

    /**
     * Flush events queue (send to analytics providers)
     */
    flushEvents() {
      if (!this.canTrack || this.eventsQueue.length === 0) return;

      // Events are typically sent immediately via composable
      // This method can be used for batch processing if needed
      const events = [...this.eventsQueue];
      this.eventsQueue = [];

      return events;
    },

    /**
     * Start new session
     */
    startNewSession() {
      this.sessionId = this.generateSessionId();
      this.sessionStartTime = Date.now();
      this.totalEvents = 0;
      this.totalPageViews = 0;
    },

    /**
     * Clear all data
     */
    clearData() {
      this.eventsQueue = [];
      this.pageViews = [];
      this.totalEvents = 0;
      this.totalPageViews = 0;
      this.lastEventTime = null;
    },

    /**
     * Reset store
     */
    reset() {
      this.sessionId = '';
      this.sessionStartTime = null;
      this.eventsQueue = [];
      this.pageViews = [];
      this.userId = null;
      this.userProperties = {};
      this.totalEvents = 0;
      this.totalPageViews = 0;
      this.lastEventTime = null;
      this.isInitialized = false;
    },
  },

  persist: {
    key: 'analytics-store',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    paths: ['sessionId', 'sessionStartTime', 'userId', 'userProperties', 'trackingConsent'],
  },
});
