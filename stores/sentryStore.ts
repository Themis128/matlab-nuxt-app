import { defineStore } from 'pinia';
import type { SentryIssue, SentryError } from '~/types/sentry';

// Note: SentryIssue and SentryError are available from ~/types/sentry
// Re-export removed to avoid duplicate export warning
// Import directly from ~/types/sentry if needed

/**
 * Sentry store for managing Sentry error tracking state
 */
export const useSentryStore = defineStore('sentry', {
  state: () => ({
    // Sentry connection state
    isConnected: false,
    isInitialized: false,
    dsn: null as string | null,

    // Error tracking
    errors: [] as SentryError[],
    issues: [] as SentryIssue[],

    // Error statistics
    errorCount: 0,
    lastErrorTime: null as number | null,
    errorRate: 0, // errors per minute

    // User context
    userContext: null as {
      id?: string;
      username?: string;
      email?: string;
      [key: string]: any;
    } | null,

    // Tags and context
    tags: {} as Record<string, string>,
    context: {} as Record<string, any>,

    // Settings
    enabled: true,
    sampleRate: 1.0,
    environment: 'development' as string,
    release: null as string | null,

    // Performance monitoring
    performanceEnabled: true,
    tracesSampleRate: 0.1,

    // Breadcrumbs
    breadcrumbs: [] as Array<{
      message: string;
      category: string;
      level: string;
      timestamp: number;
      data?: Record<string, any>;
    }>,
  }),

  getters: {
    /**
     * Get recent errors (last N)
     */
    recentErrors:
      (state) =>
      (count: number = 10) => {
        return state.errors.slice(-count);
      },

    /**
     * Get unresolved errors
     */
    unresolvedErrors: (state) => {
      return state.errors.filter((e) => !e.resolved);
    },

    /**
     * Get errors by level
     */
    errorsByLevel: (state) => (level: string) => {
      return state.errors.filter((e) => e.level === level);
    },

    /**
     * Get error rate (errors per minute)
     */
    currentErrorRate: (state) => {
      if (state.errors.length < 2) return 0;

      const lastError = state.errors[state.errors.length - 1];
      const firstError = state.errors[0];
      if (!lastError || !firstError) return 0;

      const timeSpan = lastError.timestamp - firstError.timestamp;
      const minutes = timeSpan / 60000;
      return minutes > 0 ? state.errors.length / minutes : 0;
    },

    /**
     * Get critical errors count
     */
    criticalErrorsCount: (state) => {
      return state.errors.filter((e) => e.level === 'fatal' || e.level === 'error').length;
    },

    /**
     * Get recent breadcrumbs
     */
    recentBreadcrumbs:
      (state) =>
      (count: number = 20) => {
        return state.breadcrumbs.slice(-count);
      },
  },

  actions: {
    /**
     * Initialize Sentry store
     */
    initialize(dsn?: string, options?: { environment?: string; release?: string }) {
      if (this.isInitialized) return;

      this.dsn = dsn || null;
      this.isInitialized = true;

      if (options) {
        if (options.environment) this.environment = options.environment;
        if (options.release) this.release = options.release;
      }

      // Try to detect Sentry connection
      if (typeof window !== 'undefined') {
        // Check if Sentry is available
        const sentryAvailable = typeof (window as any).Sentry !== 'undefined';
        this.isConnected = sentryAvailable;
      }
    },

    /**
     * Set user context
     */
    setUserContext(user: { id?: string; username?: string; email?: string; [key: string]: any }) {
      this.userContext = { ...user };
    },

    /**
     * Clear user context
     */
    clearUserContext() {
      this.userContext = null;
    },

    /**
     * Set tag
     */
    setTag(key: string, value: string) {
      this.tags[key] = value;
    },

    /**
     * Set multiple tags
     */
    setTags(tags: Record<string, string>) {
      this.tags = { ...this.tags, ...tags };
    },

    /**
     * Remove tag
     */
    removeTag(key: string) {
      delete this.tags[key];
    },

    /**
     * Set context
     */
    setContext(key: string, context: any) {
      this.context[key] = context;
    },

    /**
     * Add error to store
     */
    addError(error: Omit<SentryError, 'id' | 'timestamp'>) {
      const sentryError: SentryError = {
        ...error,
        id: `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: Date.now(),
        resolved: false,
      };

      this.errors.push(sentryError);
      this.errorCount++;
      this.lastErrorTime = Date.now();

      // Update error rate
      this.errorRate = this.currentErrorRate;

      // Keep only last 100 errors
      if (this.errors.length > 100) {
        this.errors.shift();
      }
    },

    /**
     * Resolve error
     */
    resolveError(errorId: string) {
      const error = this.errors.find((e) => e.id === errorId);
      if (error) {
        error.resolved = true;
      }
    },

    /**
     * Add breadcrumb
     */
    addBreadcrumb(
      message: string,
      category: string,
      level: string = 'info',
      data?: Record<string, any>
    ) {
      this.breadcrumbs.push({
        message,
        category,
        level,
        timestamp: Date.now(),
        data,
      });

      // Keep only last 100 breadcrumbs
      if (this.breadcrumbs.length > 100) {
        this.breadcrumbs.shift();
      }
    },

    /**
     * Clear breadcrumbs
     */
    clearBreadcrumbs() {
      this.breadcrumbs = [];
    },

    /**
     * Update issues list
     */
    updateIssues(issues: SentryIssue[]) {
      this.issues = issues;
    },

    /**
     * Enable/disable Sentry
     */
    setEnabled(enabled: boolean) {
      this.enabled = enabled;
    },

    /**
     * Set sample rate
     */
    setSampleRate(rate: number) {
      this.sampleRate = Math.max(0, Math.min(1, rate));
    },

    /**
     * Set environment
     */
    setEnvironment(environment: string) {
      this.environment = environment;
    },

    /**
     * Set release
     */
    setRelease(release: string) {
      this.release = release;
    },

    /**
     * Clear all errors
     */
    clearErrors() {
      this.errors = [];
      this.errorCount = 0;
      this.lastErrorTime = null;
      this.errorRate = 0;
    },

    /**
     * Reset store
     */
    reset() {
      this.errors = [];
      this.issues = [];
      this.breadcrumbs = [];
      this.errorCount = 0;
      this.lastErrorTime = null;
      this.errorRate = 0;
      this.userContext = null;
      this.tags = {};
      this.context = {};
    },
  },

  persist: {
    key: 'sentry-store',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    paths: ['errors', 'tags', 'context', 'userContext', 'enabled'],
  },
});
