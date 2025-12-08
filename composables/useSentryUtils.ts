/**
 * Shared Sentry utilities
 * Common functions used by Sentry composables
 *
 * Note: In Nuxt 3, @sentry/nuxt provides Sentry through the runtime context.
 * We use runtime access to avoid Vite's import restrictions on module entry points.
 *
 * This file uses runtime access patterns instead of direct imports to comply with Vite's restrictions.
 */

// Cache for Sentry instance to avoid repeated lookups
let _cachedSentry: any = null;

/**
 * Get Sentry instance synchronously
 * Accesses Sentry through Nuxt's runtime context to avoid Vite import restrictions
 */
export const getSentryInstanceSync = (): any | undefined => {
  // Return cached instance if available
  if (_cachedSentry) return _cachedSentry;

  try {
    // Try to use useNuxtApp if we're in a composable context
    // This is the recommended way in Nuxt 3
    try {
      // Use dynamic evaluation to access useNuxtApp without static import
      if (typeof useNuxtApp === 'function') {
        const app = useNuxtApp();
        if (app && (app as any).$sentry) {
          _cachedSentry = (app as any).$sentry;
          return _cachedSentry;
        }
      }
    } catch {
      // useNuxtApp not available, continue with other methods
    }

    // Client-side: access through global scope
    if (import.meta.client && typeof window !== 'undefined') {
      const win = window as any;
      // Check multiple possible locations where Sentry might be available
      if (win.Sentry) {
        _cachedSentry = win.Sentry;
        return _cachedSentry;
      }
      if (win.__SENTRY__) {
        _cachedSentry = win.__SENTRY__;
        return _cachedSentry;
      }
      if (win.$nuxt?.$sentry) {
        _cachedSentry = win.$nuxt.$sentry;
        return _cachedSentry;
      }
    }

    // Server-side: try to access through globalThis
    if (import.meta.server && typeof globalThis !== 'undefined') {
      const global = globalThis as any;
      if (global.Sentry) {
        _cachedSentry = global.Sentry;
        return _cachedSentry;
      }
      if (global.__SENTRY__) {
        _cachedSentry = global.__SENTRY__;
        return _cachedSentry;
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
};

/**
 * Get Sentry instance (async version for future use)
 */
export const getSentryInstance = async (): Promise<any | undefined> => {
  return getSentryInstanceSync();
};

/**
 * Check if Sentry is available in the current context
 */
export const isSentryAvailable = (): boolean => {
  try {
    const sentry = getSentryInstanceSync();
    return !!sentry;
  } catch {
    return false;
  }
};

/**
 * Safely add a breadcrumb to Sentry
 */
export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: string,
  data?: Record<string, unknown>
) => {
  try {
    const sentry = getSentryInstanceSync();
    if (sentry && 'addBreadcrumb' in sentry && typeof sentry.addBreadcrumb === 'function') {
      sentry.addBreadcrumb({
        message,
        category: category || 'custom',
        level: (level || 'info') as 'debug' | 'info' | 'warning' | 'error' | 'fatal',
        data,
        timestamp: Date.now() / 1000,
      });
    }
  } catch (error) {
    // Silently fail if Sentry is not available
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry Utils] Failed to add breadcrumb:', error);
    }
  }
};

/**
 * Set user context if available
 */
export const setUserContext = (userId?: string, additionalContext?: Record<string, unknown>) => {
  try {
    const sentry = getSentryInstanceSync();
    if (!sentry) return;

    if (userId && 'setUser' in sentry && typeof sentry.setUser === 'function') {
      sentry.setUser({ id: userId });
    }

    if (additionalContext && 'setExtras' in sentry && typeof sentry.setExtras === 'function') {
      sentry.setExtras(additionalContext);
    }
  } catch (error) {
    // Silently fail if Sentry is not available
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry Utils] Failed to set context:', error);
    }
  }
};

/**
 * Safely capture an exception with context
 */
export const captureException = (
  error: Error,
  level?: string,
  context?: Record<string, unknown>,
  tags?: Record<string, string | number | boolean>
) => {
  try {
    const sentry = getSentryInstanceSync();
    if (!sentry) return;

    // Set user context if provided
    if (
      context?.userId &&
      typeof context.userId === 'string' &&
      'setUser' in sentry &&
      typeof sentry.setUser === 'function'
    ) {
      sentry.setUser({ id: context.userId });
    }

    // Set extra context
    if (context && 'setExtras' in sentry && typeof sentry.setExtras === 'function') {
      sentry.setExtras(context);
    }

    // Set tags if provided
    if (tags && 'setTags' in sentry && typeof sentry.setTags === 'function') {
      sentry.setTags(tags);
    }

    if ('captureException' in sentry && typeof sentry.captureException === 'function') {
      sentry.captureException(error);
    }
  } catch (err) {
    // Silently fail if Sentry is not available
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry Utils] Failed to capture exception:', err);
    }
  }
};

/**
 * Safely capture a message with context
 */
export const captureMessage = (
  message: string,
  level?: string,
  context?: Record<string, unknown>
) => {
  try {
    const sentry = getSentryInstanceSync();
    if (!sentry) return;

    if (
      context?.userId &&
      typeof context.userId === 'string' &&
      'setUser' in sentry &&
      typeof sentry.setUser === 'function'
    ) {
      sentry.setUser({ id: context.userId });
    }

    if (context && 'setExtras' in sentry && typeof sentry.setExtras === 'function') {
      sentry.setExtras(context);
    }

    if ('captureMessage' in sentry && typeof sentry.captureMessage === 'function') {
      sentry.captureMessage(
        message,
        (level || 'info') as 'debug' | 'info' | 'warning' | 'error' | 'fatal'
      );
    }
  } catch (error) {
    // Silently fail if Sentry is not available
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry Utils] Failed to capture message:', error);
    }
  }
};
