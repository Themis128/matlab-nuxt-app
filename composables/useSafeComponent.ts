/**
 * useSafeComponent - Safe component utilities
 *
 * Nuxt 4 Best Practices:
 * - SSR safe
 * - Error handling
 * - TypeScript strict
 * - Prevents component errors
 */

/**
 * Safe component utilities for error handling and stability
 */
export function useSafeComponent() {
  // Check if we're on client (SSR safe)
  const isClient = import.meta.client;
  const isServer = import.meta.server;

  /**
   * Safe value getter that handles null/undefined
   */
  const safeValue = <T>(value: T | null | undefined, fallback: T): T => {
    return value ?? fallback;
  };

  /**
   * Safe array getter
   */
  const safeArray = <T>(value: T[] | null | undefined): T[] => {
    return Array.isArray(value) ? value : [];
  };

  /**
   * Safe object getter
   */
  const safeObject = <T extends Record<string, any>>(
    value: T | null | undefined,
    fallback: T
  ): T => {
    return value && typeof value === 'object' ? value : fallback;
  };

  /**
   * Safe number getter
   */
  const safeNumber = (value: number | null | undefined, fallback: number = 0): number => {
    return typeof value === 'number' && !isNaN(value) ? value : fallback;
  };

  /**
   * Safe string getter
   */
  const safeString = (value: string | null | undefined, fallback: string = ''): string => {
    return typeof value === 'string' ? value : fallback;
  };

  /**
   * Safe async operation wrapper
   */
  const safeAsync = async <T>(
    operation: () => Promise<T>,
    fallback: T,
    onError?: (error: Error) => void
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (onError) {
        try {
          onError(err);
        } catch (handlerError) {
          console.error('[useSafeComponent] Error in onError handler:', handlerError);
        }
      }

      // Log to Sentry if available (SSR safe)
      if (isClient) {
        try {
          const logger = useSentryLogger();
          logger.logError('Safe async operation failed', err);
        } catch (_sentryError) {
          console.error('[useSafeComponent] Error:', err);
        }
      }

      return fallback;
    }
  };

  /**
   * Safe event handler wrapper
   */
  const safeHandler = <T extends (...args: any[]) => any>(handler: T, fallback?: () => void): T => {
    return ((...args: Parameters<T>) => {
      try {
        return handler(...args);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        // Log error
        if (isClient) {
          try {
            const logger = useSentryLogger();
            logger.logError('Event handler error', err);
          } catch (_sentryError) {
            console.error('[useSafeComponent] Event handler error:', err);
          }
        }

        // Call fallback if provided
        if (fallback) {
          try {
            fallback();
          } catch (fallbackError) {
            console.error('[useSafeComponent] Fallback error:', fallbackError);
          }
        }
      }
    }) as T;
  };

  /**
   * Check if value exists and is valid
   */
  const isValid = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
  };

  return {
    isClient,
    isServer,
    safeValue,
    safeArray,
    safeObject,
    safeNumber,
    safeString,
    safeAsync,
    safeHandler,
    isValid,
  };
}
