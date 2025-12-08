import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSentryStore } from '../sentryStore';
import type { SentryError, SentryIssue } from '~/types/sentry';

describe('sentryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Mock window.Sentry
    if (typeof window !== 'undefined') {
      (window as any).Sentry = undefined;
    }
  });

  describe('state', () => {
    it('should initialize with default state', () => {
      const store = useSentryStore();

      expect(store.isConnected).toBe(false);
      expect(store.isInitialized).toBe(false);
      expect(store.dsn).toBeNull();
      expect(store.errors).toEqual([]);
      expect(store.issues).toEqual([]);
      expect(store.errorCount).toBe(0);
      expect(store.enabled).toBe(true);
    });
  });

  describe('getters', () => {
    it('should get recent errors', () => {
      const store = useSentryStore();
      const errors: SentryError[] = [
        {
          id: '1',
          message: 'Error 1',
          type: 'Error',
          level: 'error',
          timestamp: Date.now(),
          resolved: false,
        },
        {
          id: '2',
          message: 'Error 2',
          type: 'Warning',
          level: 'warning',
          timestamp: Date.now(),
          resolved: false,
        },
        {
          id: '3',
          message: 'Error 3',
          type: 'Error',
          level: 'error',
          timestamp: Date.now(),
          resolved: false,
        },
      ];
      store.errors = errors;

      const recent = store.recentErrors(2);

      expect(recent).toHaveLength(2);
      expect(recent[0]?.id).toBe('2');
      expect(recent[1]?.id).toBe('3');
    });

    it('should get unresolved errors', () => {
      const store = useSentryStore();
      store.errors = [
        {
          id: '1',
          message: 'Error 1',
          type: 'Error',
          level: 'error',
          timestamp: Date.now(),
          resolved: false,
        },
        {
          id: '2',
          message: 'Error 2',
          type: 'Error',
          level: 'error',
          timestamp: Date.now(),
          resolved: true,
        },
        {
          id: '3',
          message: 'Error 3',
          type: 'Error',
          level: 'error',
          timestamp: Date.now(),
          resolved: false,
        },
      ];

      const unresolved = store.unresolvedErrors;

      expect(unresolved).toHaveLength(2);
      expect(unresolved.every((e) => !e.resolved)).toBe(true);
    });

    it('should filter errors by level', () => {
      const store = useSentryStore();
      store.errors = [
        {
          id: '1',
          message: 'Error 1',
          type: 'Error',
          level: 'error',
          timestamp: Date.now(),
          resolved: false,
        },
        {
          id: '2',
          message: 'Error 2',
          type: 'Warning',
          level: 'warning',
          timestamp: Date.now(),
          resolved: false,
        },
        {
          id: '3',
          message: 'Error 3',
          type: 'Error',
          level: 'error',
          timestamp: Date.now(),
          resolved: false,
        },
      ];

      const errorLevel = store.errorsByLevel('error');

      expect(errorLevel).toHaveLength(2);
      expect(errorLevel.every((e) => e.level === 'error')).toBe(true);
    });

    it('should calculate error rate', () => {
      const store = useSentryStore();
      const now = Date.now();
      store.errors = [
        {
          id: '1',
          message: 'Error 1',
          type: 'Error',
          level: 'error',
          timestamp: now - 60000,
          resolved: false,
        },
        {
          id: '2',
          message: 'Error 2',
          type: 'Error',
          level: 'error',
          timestamp: now,
          resolved: false,
        },
      ];

      const rate = store.currentErrorRate;

      expect(rate).toBeGreaterThan(0);
    });

    it('should return 0 error rate for less than 2 errors', () => {
      const store = useSentryStore();
      store.errors = [
        {
          id: '1',
          message: 'Error 1',
          type: 'Error',
          level: 'error',
          timestamp: Date.now(),
          resolved: false,
        },
      ];

      expect(store.currentErrorRate).toBe(0);
    });

    it('should count critical errors', () => {
      const store = useSentryStore();
      store.errors = [
        {
          id: '1',
          message: 'Error 1',
          type: 'Fatal',
          level: 'fatal',
          timestamp: Date.now(),
          resolved: false,
        },
        {
          id: '2',
          message: 'Error 2',
          type: 'Error',
          level: 'error',
          timestamp: Date.now(),
          resolved: false,
        },
        {
          id: '3',
          message: 'Error 3',
          type: 'Warning',
          level: 'warning',
          timestamp: Date.now(),
          resolved: false,
        },
      ];

      expect(store.criticalErrorsCount).toBe(2);
    });

    it('should get recent breadcrumbs', () => {
      const store = useSentryStore();
      store.breadcrumbs = [
        { message: 'Breadcrumb 1', category: 'navigation', level: 'info', timestamp: Date.now() },
        { message: 'Breadcrumb 2', category: 'user', level: 'info', timestamp: Date.now() },
        { message: 'Breadcrumb 3', category: 'console', level: 'info', timestamp: Date.now() },
      ];

      const recent = store.recentBreadcrumbs(2);

      expect(recent).toHaveLength(2);
    });
  });

  describe('actions', () => {
    it('should initialize store', () => {
      const store = useSentryStore();

      store.initialize('https://example@sentry.io/123', {
        environment: 'production',
        release: '1.0.0',
      });

      expect(store.isInitialized).toBe(true);
      expect(store.dsn).toBe('https://example@sentry.io/123');
      expect(store.environment).toBe('production');
      expect(store.release).toBe('1.0.0');
    });

    it('should detect Sentry connection when available', () => {
      if (typeof window !== 'undefined') {
        (window as any).Sentry = {};

        const store = useSentryStore();
        store.initialize();

        expect(store.isConnected).toBe(true);
      }
    });

    it('should set user context', () => {
      const store = useSentryStore();

      store.setUserContext({ id: '123', username: 'testuser', email: 'test@example.com' });

      expect(store.userContext).toEqual({
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      });
    });

    it('should clear user context', () => {
      const store = useSentryStore();
      store.setUserContext({ id: '123' });

      store.clearUserContext();

      expect(store.userContext).toBeNull();
    });

    it('should set and remove tags', () => {
      const store = useSentryStore();

      store.setTag('environment', 'production');
      expect(store.tags.environment).toBe('production');

      store.setTags({ version: '1.0.0', region: 'us-east' });
      expect(store.tags.version).toBe('1.0.0');
      expect(store.tags.region).toBe('us-east');

      store.removeTag('environment');
      expect(store.tags.environment).toBeUndefined();
    });

    it('should set context', () => {
      const store = useSentryStore();

      store.setContext('user', { id: '123', role: 'admin' });

      expect(store.context.user).toEqual({ id: '123', role: 'admin' });
    });

    it('should add error to store', () => {
      const store = useSentryStore();

      store.addError({
        message: 'Test error',
        type: 'Error',
        level: 'error',
      });

      expect(store.errors).toHaveLength(1);
      expect(store.errorCount).toBe(1);
      expect(store.errors[0]?.message).toBe('Test error');
      expect(store.errors[0]?.id).toBeDefined();
      expect(store.errors[0]?.timestamp).toBeDefined();
    });

    it('should limit errors to 100', () => {
      const store = useSentryStore();

      for (let i = 0; i < 105; i++) {
        store.addError({ message: `Error ${i}`, type: 'Error', level: 'error' });
      }

      expect(store.errors.length).toBeLessThanOrEqual(100);
    });

    it('should resolve error', () => {
      const store = useSentryStore();
      store.addError({ message: 'Test error', type: 'Error', level: 'error' });
      const errorId = store.errors[0]!.id;

      store.resolveError(errorId);

      expect(store.errors[0]?.resolved).toBe(true);
    });

    it('should add breadcrumb', () => {
      const store = useSentryStore();

      store.addBreadcrumb('User clicked button', 'user', 'info', { buttonId: 'submit' });

      expect(store.breadcrumbs).toHaveLength(1);
      expect(store.breadcrumbs[0]?.message).toBe('User clicked button');
      expect(store.breadcrumbs[0]?.category).toBe('user');
    });

    it('should limit breadcrumbs to 100', () => {
      const store = useSentryStore();

      for (let i = 0; i < 105; i++) {
        store.addBreadcrumb(`Breadcrumb ${i}`, 'test', 'info');
      }

      expect(store.breadcrumbs.length).toBeLessThanOrEqual(100);
    });

    it('should clear breadcrumbs', () => {
      const store = useSentryStore();
      store.addBreadcrumb('Test', 'test', 'info');

      store.clearBreadcrumbs();

      expect(store.breadcrumbs).toEqual([]);
    });

    it('should update issues', () => {
      const store = useSentryStore();
      const issues: SentryIssue[] = [
        {
          id: '1',
          title: 'Issue 1',
          level: 'error',
          count: 10,
          status: 'unresolved',
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Issue 2',
          level: 'warning',
          count: 5,
          status: 'unresolved',
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
        },
      ];

      store.updateIssues(issues);

      expect(store.issues).toEqual(issues);
    });

    it('should enable/disable Sentry', () => {
      const store = useSentryStore();

      store.setEnabled(false);
      expect(store.enabled).toBe(false);

      store.setEnabled(true);
      expect(store.enabled).toBe(true);
    });

    it('should set sample rate', () => {
      const store = useSentryStore();

      store.setSampleRate(0.5);
      expect(store.sampleRate).toBe(0.5);

      store.setSampleRate(1.5); // Should clamp to 1.0
      expect(store.sampleRate).toBe(1.0);

      store.setSampleRate(-0.5); // Should clamp to 0.0
      expect(store.sampleRate).toBe(0.0);
    });

    it('should set environment and release', () => {
      const store = useSentryStore();

      store.setEnvironment('production');
      expect(store.environment).toBe('production');

      store.setRelease('2.0.0');
      expect(store.release).toBe('2.0.0');
    });

    it('should clear errors', () => {
      const store = useSentryStore();
      store.addError({ message: 'Error 1', type: 'Error', level: 'error' });
      store.addError({ message: 'Error 2', type: 'Error', level: 'error' });

      store.clearErrors();

      expect(store.errors).toEqual([]);
      expect(store.errorCount).toBe(0);
      expect(store.lastErrorTime).toBeNull();
      expect(store.errorRate).toBe(0);
    });

    it('should reset store', () => {
      const store = useSentryStore();
      store.addError({ message: 'Error', type: 'Error', level: 'error' });
      store.setUserContext({ id: '123' });
      store.setTag('test', 'value');
      store.setContext('test', { data: 'value' });

      store.reset();

      expect(store.errors).toEqual([]);
      expect(store.issues).toEqual([]);
      expect(store.breadcrumbs).toEqual([]);
      expect(store.userContext).toBeNull();
      expect(store.tags).toEqual({});
      expect(store.context).toEqual({});
    });
  });
});
