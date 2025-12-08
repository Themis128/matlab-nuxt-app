import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAnalyticsStore } from '../analyticsStore';

describe('analyticsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  describe('state', () => {
    it('should initialize with default state', () => {
      const store = useAnalyticsStore();

      expect(store.sessionId).toBe('');
      expect(store.sessionStartTime).toBeNull();
      expect(store.eventsQueue).toEqual([]);
      expect(store.pageViews).toEqual([]);
      expect(store.isEnabled).toBe(true);
      expect(store.isInitialized).toBe(false);
      expect(store.trackingConsent).toBeNull();
    });
  });

  describe('getters', () => {
    it('should calculate session duration', () => {
      const store = useAnalyticsStore();
      const startTime = Date.now() - 5000;
      store.sessionStartTime = startTime;

      const duration = store.sessionDuration;

      expect(duration).toBeGreaterThanOrEqual(5000);
    });

    it('should return 0 duration when session not started', () => {
      const store = useAnalyticsStore();

      expect(store.sessionDuration).toBe(0);
    });

    it('should get recent events', () => {
      const store = useAnalyticsStore();
      store.eventsQueue = [
        { name: 'event1', timestamp: Date.now(), sessionId: 'session1' },
        { name: 'event2', timestamp: Date.now(), sessionId: 'session1' },
        { name: 'event3', timestamp: Date.now(), sessionId: 'session1' },
      ];

      const recent = store.recentEvents(2);

      expect(recent).toHaveLength(2);
    });

    it('should filter events by name', () => {
      const store = useAnalyticsStore();
      store.eventsQueue = [
        { name: 'click', timestamp: Date.now(), sessionId: 'session1' },
        { name: 'view', timestamp: Date.now(), sessionId: 'session1' },
        { name: 'click', timestamp: Date.now(), sessionId: 'session1' },
      ];

      const clickEvents = store.eventsByName('click');

      expect(clickEvents).toHaveLength(2);
      expect(clickEvents.every((e) => e.name === 'click')).toBe(true);
    });

    it('should get recent page views', () => {
      const store = useAnalyticsStore();
      store.pageViews = [
        { path: '/page1', timestamp: Date.now() },
        { path: '/page2', timestamp: Date.now() },
        { path: '/page3', timestamp: Date.now() },
      ];

      const recent = store.recentPageViews(2);

      expect(recent).toHaveLength(2);
    });

    it('should check if tracking is allowed', () => {
      const store = useAnalyticsStore();

      expect(store.canTrack).toBe(true); // enabled and consent not false

      store.trackingConsent = false;
      expect(store.canTrack).toBe(false);

      store.trackingConsent = true;
      store.isEnabled = false;
      expect(store.canTrack).toBe(false);
    });

    it('should get session info', () => {
      const store = useAnalyticsStore();
      store.sessionId = 'test-session';
      store.sessionStartTime = Date.now() - 1000;
      store.totalEvents = 5;
      store.totalPageViews = 3;

      const info = store.sessionInfo;

      expect(info.sessionId).toBe('test-session');
      expect(info.duration).toBeGreaterThanOrEqual(1000);
      expect(info.eventCount).toBe(5);
      expect(info.pageViewCount).toBe(3);
    });
  });

  describe('actions', () => {
    it('should initialize analytics', () => {
      const store = useAnalyticsStore();

      store.initialize();

      expect(store.isInitialized).toBe(true);
      expect(store.sessionId).toBeTruthy();
      expect(store.sessionStartTime).toBeTruthy();
    });

    it('should load consent from localStorage', () => {
      localStorage.setItem('analytics-consent', 'true');

      const store = useAnalyticsStore();
      store.initialize();

      expect(store.trackingConsent).toBe(true);
    });

    it('should set user ID and properties', () => {
      const store = useAnalyticsStore();

      store.setUserId('user123');
      expect(store.userId).toBe('user123');

      store.setUserProperties({ plan: 'premium', region: 'us' });
      expect(store.userProperties).toEqual({ plan: 'premium', region: 'us' });
    });

    it('should set tracking consent', () => {
      const store = useAnalyticsStore();

      store.setTrackingConsent(true);

      expect(store.trackingConsent).toBe(true);
      expect(localStorage.getItem('analytics-consent')).toBe('true');
    });

    it('should clear events queue when consent withdrawn', () => {
      const store = useAnalyticsStore();
      store.eventsQueue = [{ name: 'test', timestamp: Date.now(), sessionId: 'session1' }];

      store.setTrackingConsent(false);

      expect(store.eventsQueue).toEqual([]);
    });

    it('should track event when allowed', () => {
      const store = useAnalyticsStore();
      store.initialize();
      store.trackingConsent = true;

      store.trackEvent('button_click', { buttonId: 'submit' });

      expect(store.eventsQueue).toHaveLength(1);
      expect(store.eventsQueue[0]?.name).toBe('button_click');
      expect(store.eventsQueue[0]?.properties?.buttonId).toBe('submit');
      expect(store.totalEvents).toBe(1);
    });

    it('should not track event when consent not given', () => {
      const store = useAnalyticsStore();
      store.initialize();
      store.trackingConsent = false;

      store.trackEvent('button_click');

      expect(store.eventsQueue).toHaveLength(0);
      expect(store.totalEvents).toBe(0);
    });

    it('should limit events queue to 100', () => {
      const store = useAnalyticsStore();
      store.initialize();
      store.trackingConsent = true;

      for (let i = 0; i < 105; i++) {
        store.trackEvent(`event${i}`);
      }

      expect(store.eventsQueue.length).toBeLessThanOrEqual(100);
    });

    it('should track page view', () => {
      const store = useAnalyticsStore();
      store.initialize();
      store.trackingConsent = true;

      // Mock document.referrer
      Object.defineProperty(document, 'referrer', {
        value: 'https://example.com',
        writable: true,
      });

      store.trackPageView('/dashboard', 'Dashboard', 5000);

      expect(store.pageViews).toHaveLength(1);
      expect(store.pageViews[0]?.path).toBe('/dashboard');
      expect(store.pageViews[0]?.title).toBe('Dashboard');
      expect(store.pageViews[0]?.duration).toBe(5000);
      expect(store.totalPageViews).toBe(1);
    });

    it('should limit page views to 50', () => {
      const store = useAnalyticsStore();
      store.initialize();
      store.trackingConsent = true;

      for (let i = 0; i < 55; i++) {
        store.trackPageView(`/page${i}`);
      }

      expect(store.pageViews.length).toBeLessThanOrEqual(50);
    });

    it('should flush events queue', () => {
      const store = useAnalyticsStore();
      store.initialize();
      store.trackingConsent = true;
      store.trackEvent('event1');
      store.trackEvent('event2');

      const events = store.flushEvents();

      expect(events).toHaveLength(2);
      expect(store.eventsQueue).toEqual([]);
    });

    it('should start new session', () => {
      const store = useAnalyticsStore();
      store.initialize();
      store.totalEvents = 10;
      store.totalPageViews = 5;
      const oldSessionId = store.sessionId;

      store.startNewSession();

      expect(store.sessionId).not.toBe(oldSessionId);
      expect(store.totalEvents).toBe(0);
      expect(store.totalPageViews).toBe(0);
    });

    it('should clear all data', () => {
      const store = useAnalyticsStore();
      store.initialize();
      store.trackEvent('test');
      store.trackPageView('/test');

      store.clearData();

      expect(store.eventsQueue).toEqual([]);
      expect(store.pageViews).toEqual([]);
      expect(store.totalEvents).toBe(0);
      expect(store.totalPageViews).toBe(0);
    });

    it('should reset store', () => {
      const store = useAnalyticsStore();
      store.initialize();
      store.setUserId('user123');
      store.trackEvent('test');

      store.reset();

      expect(store.sessionId).toBe('');
      expect(store.sessionStartTime).toBeNull();
      expect(store.eventsQueue).toEqual([]);
      expect(store.userId).toBeNull();
      expect(store.isInitialized).toBe(false);
    });
  });
});
