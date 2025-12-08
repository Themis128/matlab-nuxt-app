import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAnalyticsStore } from '../analytics.store';

// Mock AnalyticsService
const mockAnalyticsService = {
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
  flushEvents: vi.fn(),
};

vi.mock('@/domain', () => ({
  AnalyticsService: vi.fn(() => mockAnalyticsService),
}));

describe('analytics.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
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
      expect(store.userId).toBeNull();
      expect(store.trackingConsent).toBeNull();
    });
  });

  describe('getters', () => {
    it('should calculate session duration', () => {
      const store = useAnalyticsStore();
      store.sessionStartTime = Date.now() - 5000;

      // Access getter - Pinia exposes getters as computed properties
      const duration = (store as any).sessionDuration;
      expect(duration).toBeGreaterThan(0);
    });

    it('should return 0 if session not started', () => {
      const store = useAnalyticsStore();
      store.sessionStartTime = null;

      // Access getter - Pinia exposes getters as computed properties
      const duration = (store as any).sessionDuration;
      expect(duration).toBe(0);
    });

    it('should get recent events', () => {
      const store = useAnalyticsStore();
      store.eventsQueue = [
        { name: 'event1', timestamp: Date.now(), sessionId: 'test' },
        { name: 'event2', timestamp: Date.now(), sessionId: 'test' },
        { name: 'event3', timestamp: Date.now(), sessionId: 'test' },
      ];

      // Access getter - Pinia exposes getters as computed properties
      const recent = (store as any).recentEvents(2);
      expect(recent).toHaveLength(2);
    });

    it('should filter events by name', () => {
      const store = useAnalyticsStore();
      store.eventsQueue = [
        { name: 'click', timestamp: Date.now(), sessionId: 'test' },
        { name: 'view', timestamp: Date.now(), sessionId: 'test' },
        { name: 'click', timestamp: Date.now(), sessionId: 'test' },
      ];

      // Access getter - Pinia exposes getters as computed properties
      const clicks = (store as any).eventsByName('click');
      expect(clicks).toHaveLength(2);
    });

    it('should get recent page views', () => {
      const store = useAnalyticsStore();
      store.pageViews = [
        { path: '/page1', timestamp: Date.now() },
        { path: '/page2', timestamp: Date.now() },
      ];

      // Access getter - Pinia exposes getters as computed properties
      const recent = (store as any).recentPageViews(1);
      expect(recent).toHaveLength(1);
    });
  });

  describe('actions', () => {
    it('should initialize store', () => {
      const store = useAnalyticsStore();
      store.initialize();

      expect(store.isInitialized).toBe(true);
      expect(store.sessionId).not.toBe('');
      expect(store.sessionStartTime).not.toBeNull();
    });

    it('should set user ID', () => {
      const store = useAnalyticsStore();
      store.setUserId('user123');

      expect(store.userId).toBe('user123');
    });

    it('should set user properties', () => {
      const store = useAnalyticsStore();
      store.setUserProperties({ name: 'John', age: 30 });

      expect(store.userProperties).toEqual({ name: 'John', age: 30 });
    });

    it('should set tracking consent', () => {
      const store = useAnalyticsStore();
      store.setTrackingConsent(true);

      expect(store.trackingConsent).toBe(true);
    });

    it('should set enabled state', () => {
      const store = useAnalyticsStore();
      store.setEnabled(false);

      expect(store.isEnabled).toBe(false);
    });

    it('should track event', () => {
      const store = useAnalyticsStore();
      store.initialize();
      store.trackEvent('test_event', { key: 'value' });

      expect(store.eventsQueue).toHaveLength(1);
      expect(store.eventsQueue[0]!.name).toBe('test_event');
      expect(store.eventsQueue[0]!.properties).toEqual({ key: 'value' });
    });

    it('should not track event if disabled', () => {
      const store = useAnalyticsStore();
      store.setEnabled(false);
      store.trackEvent('test_event');

      expect(store.eventsQueue).toHaveLength(0);
    });

    it('should track page view', () => {
      const store = useAnalyticsStore();
      store.trackPageView('/test-page', 'Test Page');

      expect(store.pageViews).toHaveLength(1);
      expect(store.pageViews[0]!.path).toBe('/test-page');
      expect(store.pageViews[0]!.title).toBe('Test Page');
    });

    it('should start new session', () => {
      const store = useAnalyticsStore();
      const oldSessionId = store.sessionId;
      store.startNewSession();

      expect(store.sessionId).not.toBe(oldSessionId);
      expect(store.sessionStartTime).not.toBeNull();
    });

    it('should clear data', () => {
      const store = useAnalyticsStore();
      store.eventsQueue = [{ name: 'test', timestamp: Date.now(), sessionId: 'test' }];
      store.pageViews = [{ path: '/test', timestamp: Date.now() }];
      store.totalEvents = 5;
      store.totalPageViews = 3;

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
      store.setUserProperties({ name: 'John' });

      store.reset();

      expect(store.sessionId).toBe('');
      expect(store.userId).toBeNull();
      expect(store.userProperties).toEqual({});
      expect(store.isInitialized).toBe(false);
    });
  });
});
