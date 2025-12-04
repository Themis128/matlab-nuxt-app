/**
 * Shared Sentry utilities
 * Common functions used by Sentry composables
 */

/**
 * Get Sentry instance from global scope
 */
export const getSentryInstance = (): unknown => {
  if (typeof window === 'undefined') {
    return (globalThis as unknown as { Sentry?: unknown })?.Sentry;
  }
  return (window as unknown as { Sentry?: unknown })?.Sentry;
};

/**
 * Check if Sentry is available in the current context
 */
export const isSentryAvailable = (): boolean => {
  return !!getSentryInstance();
};

/**
 * Safely add a breadcrumb to Sentry
 */
type SentryLike = {
  addBreadcrumb?: (b: {
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, unknown>;
    timestamp?: number;
  }) => void;
  setUser?: (user: { id?: string }) => void;
  setExtras?: (extras: Record<string, unknown>) => void;
  setTags?: (tags: Record<string, string | number | boolean>) => void;
  captureException?: (err: unknown) => void;
  captureMessage?: (message: string, level?: string) => void;
};

export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: string,
  data?: Record<string, unknown>
) => {
  if (!isSentryAvailable()) return;

  try {
    const Sentry = getSentryInstance() as SentryLike | undefined;
    if (Sentry?.addBreadcrumb) {
      Sentry.addBreadcrumb({
        message,
        category: category || 'custom',
        level: level || 'info',
        data,
        timestamp: Date.now() / 1000,
      });
    }
  } catch (error) {
    console.warn('[Sentry Utils] Failed to add breadcrumb:', error);
  }
};

/**
 * Set user context if available
 */
export const setUserContext = (userId?: string, additionalContext?: Record<string, unknown>) => {
  if (!isSentryAvailable()) return;

  try {
    const Sentry = getSentryInstance() as SentryLike | undefined;

    if (userId) {
      Sentry?.setUser?.({ id: userId });
    }

    if (additionalContext) {
      Sentry?.setExtras?.(additionalContext);
    }
  } catch (error) {
    console.warn('[Sentry Utils] Failed to set context:', error);
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
  if (!isSentryAvailable()) return;

  try {
    const Sentry = getSentryInstance() as SentryLike | undefined;

    // Set user context if provided
    if (context?.userId && typeof context.userId === 'string') {
      Sentry?.setUser?.({ id: context.userId });
    }

    // Set extra context
    if (context) {
      Sentry?.setExtras?.(context);
    }

    // Set tags if provided
    if (tags) {
      Sentry?.setTags?.(tags);
    }

    Sentry?.captureException?.(error);
  } catch (err) {
    console.warn('[Sentry Utils] Failed to capture exception:', err);
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
  if (!isSentryAvailable()) return;

  try {
    const Sentry = getSentryInstance() as SentryLike | undefined;

    if (context?.userId && typeof context.userId === 'string') {
      Sentry?.setUser?.({ id: context.userId });
    }

    if (context) {
      Sentry?.setExtras?.(context);
    }

    Sentry?.captureMessage?.(message, level || 'info');
  } catch (error) {
    console.warn('[Sentry Utils] Failed to capture message:', error);
  }
};
