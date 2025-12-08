/**
 * useSafeAsync - Safe async data fetching composable
 *
 * Nuxt 4 Best Practices:
 * - Uses useAsyncData (Nuxt 4 native)
 * - SSR safe
 * - Error handling built-in
 * - TypeScript strict
 * - Prevents breaking on errors
 */

import type { UseFetchOptions } from 'nuxt/app';

interface SafeAsyncOptions<T> extends Omit<UseFetchOptions<T>, 'retry'> {
  fallback?: T;
  onError?: (error: Error) => void;
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Safe async data fetching with error handling
 *
 * @example
 * ```ts
 * const { data, error, pending, refresh } = useSafeAsync(
 *   'my-data',
 *   () => $fetch('/api/data'),
 *   {
 *     fallback: { items: [] },
 *     retry: true,
 *     retryCount: 3,
 *   }
 * );
 * ```
 */
export function useSafeAsync<T>(
  key: string,
  handler: () => Promise<T>,
  options: SafeAsyncOptions<T> = {}
) {
  const {
    fallback,
    onError,
    retry = false,
    retryCount = 3,
    retryDelay = 1000,
    watch: watchSources,
    ...fetchOptions
  } = options;

  // Use Nuxt 4's useAsyncData
  const { data, error, pending, refresh, status } = useAsyncData<T>(
    key,
    async () => {
      let lastError: Error | null = null;
      let attempts = 0;

      while (attempts < (retry ? retryCount : 1)) {
        try {
          const result = await handler();
          return result;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          attempts++;

          // Call error handler
          if (onError) {
            try {
              onError(lastError);
            } catch (handlerError) {
              console.error('[useSafeAsync] Error in onError handler:', handlerError);
            }
          }

          // Log to Sentry if available (SSR safe)
          if (import.meta.client) {
            try {
              const logger = useSentryLogger();
              logger.logError(`useSafeAsync error (attempt ${attempts})`, lastError, {
                key,
                attempts,
                retry,
              });
            } catch (_sentryError) {
              // Fallback to console
              console.error(`[useSafeAsync] Error fetching ${key}:`, lastError);
            }
          }

          // Retry logic
          if (retry && attempts < retryCount) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay * attempts));
            continue;
          }

          // Return fallback on error
          if (fallback !== undefined) {
            return fallback;
          }

          // Re-throw if no fallback
          throw lastError;
        }
      }

      // Should never reach here, but TypeScript needs it
      throw lastError || new Error('Unknown error');
    },
    {
      ...(watchSources && { watch: watchSources }),
      ...fetchOptions,
    }
  );

  // Safe refresh that handles errors
  const safeRefresh = async () => {
    try {
      await refresh();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (onError) {
        try {
          onError(error);
        } catch (handlerError) {
          console.error('[useSafeAsync] Error in onError handler:', handlerError);
        }
      }

      // Return fallback if available
      if (fallback !== undefined && data.value === null) {
        data.value = fallback as any;
      }
    }
  };

  return {
    data: readonly(data),
    error: readonly(error),
    pending: readonly(pending),
    refresh: safeRefresh,
    status: readonly(status),
  };
}
