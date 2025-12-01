/**
 * Sentry Logger Composable for Nuxt
 *
 * This composable provides logging functionality using Sentry's available APIs.
 * Since structured logs may not be available in the current SDK version,
 * this uses console logging, breadcrumbs, and captureMessage for logging.
 */

import type { SeverityLevel } from '@sentry/nuxt'

export interface LogAttributes {
  [key: string]: string | number | boolean | undefined
}

export interface LogContext {
  userId?: string
  sessionId?: string
  component?: string
  action?: string
  [key: string]: any
}

/**
 * Composable for Sentry logging functionality
 */
export const useSentryLogger = () => {
  // Check if Sentry is available
  const isSentryAvailable = () => {
    if (typeof window === 'undefined') {
      // Server-side check
      return typeof globalThis !== 'undefined' && 'Sentry' in globalThis
    }
    // Client-side check
    return typeof window !== 'undefined' && 'Sentry' in window
  }

  /**
   * Add a breadcrumb to Sentry (useful for debugging)
   */
  const addBreadcrumb = (message: string, category?: string, level?: SeverityLevel, data?: any) => {
    if (!isSentryAvailable()) return

    try {
      const Sentry = (globalThis as any).Sentry || (window as any).Sentry
      Sentry.addBreadcrumb({
        message,
        category: category || 'custom',
        level: level || 'info',
        data,
        timestamp: Date.now() / 1000,
      })
    } catch (error) {
      console.warn('[Sentry Logger] Failed to add breadcrumb:', error)
    }
  }

  /**
   * Capture a message with Sentry
   */
  const captureMessage = (message: string, level?: SeverityLevel, context?: LogContext) => {
    if (!isSentryAvailable()) {
      return
    }

    try {
      const Sentry = (globalThis as any).Sentry || (window as any).Sentry

      // Set user context if provided
      if (context?.userId) {
        Sentry.setUser({ id: context.userId })
      }

      // Set extra context
      if (context) {
        Sentry.setExtras(context)
      }

      Sentry.captureMessage(message, level || 'info')

      // Add breadcrumb for debugging
      addBreadcrumb(message, 'logger', level, context)
    } catch (error) {
      console.warn('[Sentry Logger] Failed to capture message:', error)
    }
  }

  /**
   * Log at trace level
   */
  const trace = (message: string, context?: LogContext) => {
    // Note: console.debug not allowed by linter, logging handled by Sentry
    captureMessage(message, 'debug', context)
  }

  /**
   * Log at debug level
   */
  const debug = (message: string, context?: LogContext) => {
    // Note: console.debug not allowed by linter, logging handled by Sentry
    captureMessage(message, 'debug', context)
  }

  /**
   * Log at info level
   */
  const info = (message: string, context?: LogContext) => {
    // Note: console.info not allowed by linter, logging handled by Sentry
    captureMessage(message, 'info', context)
  }

  /**
   * Log at warning level
   */
  const warn = (message: string, context?: LogContext) => {
    console.warn(`[WARN] ${message}`, context)
    captureMessage(message, 'warning', context)
  }

  /**
   * Log at error level
   */
  const error = (message: string, error?: Error, context?: LogContext) => {
    console.error(`[ERROR] ${message}`, error, context)

    if (!isSentryAvailable()) return

    try {
      const Sentry = (globalThis as any).Sentry || (window as any).Sentry

      // Set user context if provided
      if (context?.userId) {
        Sentry.setUser({ id: context.userId })
      }

      // Set extra context
      if (context) {
        Sentry.setExtras(context)
      }

      // If we have an actual error object, capture it as an exception
      if (error && error instanceof Error) {
        Sentry.captureException(error, {
          tags: {
            logger: 'true',
            level: 'error',
          },
          extra: {
            message,
            ...context,
          },
        })
      } else {
        // Otherwise capture as message
        Sentry.captureMessage(message, 'error')
      }

      // Add breadcrumb
      addBreadcrumb(message, 'logger', 'error', { ...context, error: error?.message })
    } catch (err) {
      console.warn('[Sentry Logger] Failed to capture error:', err)
    }
  }

  /**
   * Log at fatal level
   */
  const fatal = (message: string, errorObj?: Error, context?: LogContext) => {
    console.error(`[FATAL] ${message}`, errorObj, context)
    // Call the error function (not the parameter) - using different parameter name to avoid shadowing
    error(message, errorObj, { ...context, level: 'fatal' })
  }

  /**
   * Create a formatted message using template literals
   * Note: This is a simplified version since structured logs may not be available
   */
  const fmt = (template: string, ...values: any[]) => {
    let result = template
    values.forEach((value, index) => {
      result = result.replace(new RegExp(`\\$\\{${index}\\}`, 'g'), String(value))
    })
    return result
  }

  /**
   * Log with printf-style formatting (server-side only)
   */
  const printf = (template: string, ...args: any[]) => {
    try {
      // Use Node.js util.format if available (server-side)
      const utilFormat = (globalThis as any)?.util?.format
      if (typeof utilFormat === 'function') {
        return utilFormat(template, ...args)
      }
      // Fallback to simple replacement
      let result = template
      args.forEach(arg => {
        result = result.replace(/%s|%d|%j|%o/, String(arg))
      })
      return result
    } catch {
      return template
    }
  }

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
    const message = `API ${method} ${url}`
    const logContext = {
      method,
      url,
      statusCode,
      duration,
      ...context,
    }

    if (statusCode && statusCode >= 400) {
      error(message, undefined, logContext)
    } else if (duration && duration > 5000) {
      warn(`${message} - Slow response`, logContext)
    } else {
      info(message, logContext)
    }
  }

  /**
   * Log user actions
   */
  const logUserAction = (action: string, details?: any, context?: LogContext) => {
    const message = `User action: ${action}`
    info(message, { ...context, action, details })
  }

  /**
   * Log performance metrics
   */
  const logPerformance = (metric: string, value: number, unit?: string, context?: LogContext) => {
    const message = `Performance: ${metric} = ${value}${unit ? ` ${unit}` : ''}`
    info(message, { ...context, metric, value, unit })
  }

  /**
   * Log business events
   */
  const logBusinessEvent = (event: string, properties?: any, context?: LogContext) => {
    const message = `Business event: ${event}`
    info(message, { ...context, event, properties })
  }

  /**
   * Start a logging session/context
   */
  const startSession = (sessionId: string, context?: LogContext) => {
    info(`Session started: ${sessionId}`, { ...context, sessionId, event: 'session_start' })

    // Set session context for subsequent logs
    if (isSentryAvailable()) {
      try {
        const Sentry = (globalThis as any).Sentry || (window as any).Sentry
        Sentry.setTag('session_id', sessionId)
        if (context) {
          Sentry.setExtras({ session_context: context })
        }
      } catch (error) {
        console.warn('[Sentry Logger] Failed to set session context:', error)
      }
    }
  }

  /**
   * End a logging session
   */
  const endSession = (sessionId: string, context?: LogContext) => {
    info(`Session ended: ${sessionId}`, { ...context, sessionId, event: 'session_end' })

    // Clear session context
    if (isSentryAvailable()) {
      try {
        const Sentry = (globalThis as any).Sentry || (window as any).Sentry
        Sentry.setTag('session_id', undefined)
        Sentry.setExtras({ session_context: undefined })
      } catch (error) {
        console.warn('[Sentry Logger] Failed to clear session context:', error)
      }
    }
  }

  return {
    // Core logging methods
    trace,
    debug,
    info,
    warn,
    error,
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
  }
}
