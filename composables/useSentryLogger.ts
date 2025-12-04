/**
 * Sentry Logger Composable for Nuxt
 *
 * This composable provides logging functionality using Sentry's available APIs.
 * Since structured logs may not be available in the current SDK version,
 * this uses console logging, breadcrumbs, and captureMessage for logging.
 */

import {
  addBreadcrumb,
  captureException,
  captureMessage,
  isSentryAvailable,
} from './useSentryUtils';

export interface LogAttributes {
  [key: string]: string | number | boolean | undefined;
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Composable for Sentry logging functionality
 */
export const useSentryLogger = () => {
  /**
   * Log at debug level
   */
  const debug = (message: string, context?: LogContext) => {
    captureMessage(message, 'debug', context);
    // Add breadcrumb for debugging
    addBreadcrumb(message, 'logger', 'debug', context);
  };

  /**
   * Log at info level
   */
  const info = (message: string, context?: LogContext) => {
    console.info(`[INFO] ${message}`, context);
    captureMessage(message, 'info', context);
    addBreadcrumb(message, 'logger', 'info', context);
  };

  /**
   * Log at warning level
   */
  const warn = (message: string, context?: LogContext) => {
    console.warn(`[WARN] ${message}`, context);
    captureMessage(message, 'warning', context);
    addBreadcrumb(message, 'logger', 'warning', context);
  };

  /**
   * Log at error level
   */
  const logError = (message: string, error?: Error, context?: LogContext) => {
    console.error(`[ERROR] ${message}`, error, context);

    if (error && error instanceof Error) {
      captureException(
        error,
        'error',
        {
          message,
          ...context,
        },
        {
          logger: 'true',
          level: 'error',
        }
      );
    } else {
      captureMessage(message, 'error', context);
    }

    addBreadcrumb(message, 'logger', 'error', { ...context, error: error?.message });
  };

  /**
   * Log at fatal level
   */
  const fatal = (message: string, errorObj?: Error, context?: LogContext) => {
    console.error(`[FATAL] ${message}`, errorObj, context);

    if (errorObj && errorObj instanceof Error) {
      captureException(errorObj, 'fatal', {
        message,
        ...context,
        level: 'fatal',
      });
    } else {
      captureMessage(message, 'fatal', context);
    }

    addBreadcrumb(message, 'logger', 'fatal', { ...context, error: errorObj?.message });
  };

  /**
   * Log at trace level
   */
  const trace = (message: string, context?: LogContext) => {
    debug(message, context);
  };

  /**
   * Create a formatted message using template literals
   * Note: This is a simplified version since structured logs may not be available
   */
  const fmt = (template: string, ...values: unknown[]) => {
    let result = template;
    values.forEach((value, index) => {
      result = result.replace(new RegExp(`\\$\\{${index}\\}`, 'g'), String(value));
    });
    return result;
  };

  /**
   * Log with printf-style formatting (server-side only)
   */
  const printf = (template: string, ...args: unknown[]) => {
    try {
      // Use Node.js util.format if available (server-side)
      const utilFormat = (
        globalThis as unknown as { util?: { format?: (...a: unknown[]) => string } }
      )?.util?.format;
      if (utilFormat) {
        return utilFormat(template, ...args);
      }
      // Fallback to simple replacement
      let result = template;
      args.forEach((arg) => {
        result = result.replace(/%s|%d|%j|%o/, String(arg));
      });
      return result;
    } catch (error) {
      console.warn('[Sentry Logger] Printf formatting failed:', error);
      return template;
    }
  };

  /**
   * Log API requests
   */
  const logApiRequest = (
    method: string,
    url: string,
    statusCode?: number,
    duration?: number,
    context?: LogContext
  ) => {
    const message = `API ${method} ${url}`;
    const logContext = {
      method,
      url,
      statusCode,
      duration,
      ...context,
    };

    if (statusCode && statusCode >= 400) {
      logError(message, undefined, logContext);
    } else if (duration && duration > 5000) {
      warn(`${message} - Slow response`, logContext);
    } else {
      info(message, logContext);
    }
  };

  /**
   * Log user actions
   */
  const logUserAction = (action: string, details?: unknown, context?: LogContext) => {
    const message = `User action: ${action}`;
    const logContext: LogContext = { ...context, action };
    if (details !== undefined) {
      (logContext as any).details = details;
    }
    info(message, logContext);
  };

  /**
   * Log performance metrics
   */
  const logPerformance = (metric: string, value: number, unit?: string, context?: LogContext) => {
    const message = `Performance: ${metric} = ${value}${unit ? ` ${unit}` : ''}`;
    info(message, { ...context, metric, value, unit });
  };

  /**
   * Log business events
   */
  const logBusinessEvent = (event: string, properties?: unknown, context?: LogContext) => {
    const message = `Business event: ${event}`;
    const logContext: LogContext = { ...context, event };
    if (properties !== undefined) {
      (logContext as any).properties = properties;
    }
    info(message, logContext);
  };

  /**
   * Start a logging session/context
   */
  const startSession = (sessionId: string, context?: LogContext) => {
    info(`Session started: ${sessionId}`, { ...context, sessionId, event: 'session_start' });

    // Set session context for subsequent logs
    if (isSentryAvailable()) {
      try {
        const Sentry = (globalThis as any).Sentry || (window as any).Sentry;
        Sentry.setTag('session_id', sessionId);
        if (context) {
          Sentry.setExtras({ session_context: context });
        }
      } catch (error) {
        console.warn('[Sentry Logger] Failed to set session context:', error);
      }
    }
  };

  /**
   * End a logging session
   */
  const endSession = (sessionId: string, context?: LogContext) => {
    info(`Session ended: ${sessionId}`, { ...context, sessionId, event: 'session_end' });

    // Clear session context
    if (isSentryAvailable()) {
      try {
        const Sentry =
          (globalThis as unknown as { Sentry?: unknown })?.Sentry ||
          (window as unknown as { Sentry?: unknown })?.Sentry;
        if (Sentry && typeof Sentry === 'object') {
          (Sentry as any).setTag?.('session_id', undefined);
          (Sentry as any).setExtras?.({ session_context: undefined });
        }
      } catch (error) {
        console.warn('[Sentry Logger] Failed to clear session context:', error);
      }
    }
  };

  return {
    // Core logging methods
    trace,
    debug,
    info,
    warn,
    logError,
    fatal,

    // Utilities
    fmt,
    printf,

    // Specialized loggers
    logApiRequest,
    logUserAction,
    logPerformance,
    logBusinessEvent,

    // Session management
    startSession,
    endSession,

    // Sentry-specific methods
    addBreadcrumb,
    captureMessage,

    // Status
    isSentryAvailable,
  };
};
