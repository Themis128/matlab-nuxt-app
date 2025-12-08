/**
 * Base API Call Composable Pattern
 *
 * This composable provides a standardized pattern for API calls with:
 * - Loading states
 * - Error handling
 * - Retry logic
 * - Sentry logging
 * - Type safety
 *
 * Use this as a base for creating new API-related composables
 *
 * @example
 * ```ts
 * export const useMyApi = () => {
 *   const base = useBaseApiCall();
 *
 *   const fetchData = async (id: string) => {
 *     return base.execute(
 *       () => $fetch(`/api/data/${id}`),
 *       { key: `data-${id}` }
 *     );
 *   };
 *
 *   return {
 *     ...base,
 *     fetchData,
 *   };
 * };
 * ```
 */

import type { Ref } from 'vue';

export interface BaseApiCallOptions {
  /** Unique key for caching/identification */
  key?: string;
  /** Retry configuration */
  retry?: {
    enabled: boolean;
    maxAttempts?: number;
    delay?: number;
  };
  /** Error handler callback */
  onError?: (error: Error) => void;
  /** Success handler callback */
  onSuccess?: <T>(data: T) => void;
  /** Whether to log errors to Sentry */
  logToSentry?: boolean;
}

export interface BaseApiCallReturn<T> {
  /** Response data */
  data: Readonly<Ref<T | null>>;
  /** Error state */
  error: Readonly<Ref<Error | null>>;
  /** Loading state */
  loading: Readonly<Ref<boolean>>;
  /** Execute the API call */
  execute: (fn: () => Promise<T>, options?: BaseApiCallOptions) => Promise<T | null>;
  /** Reset all states */
  reset: () => void;
}

/**
 * Base API call composable with standardized error handling and loading states
 */
export function useBaseApiCall<T = any>(): BaseApiCallReturn<T> {
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const loading = ref(false);

  /**
   * Execute an API call with error handling and retry logic
   */
  const execute = async (
    fn: () => Promise<T>,
    options: BaseApiCallOptions = {}
  ): Promise<T | null> => {
    const {
      key = 'api-call',
      retry = { enabled: false, maxAttempts: 3, delay: 1000 },
      onError,
      onSuccess,
      logToSentry = true,
    } = options;

    // Reset error state
    error.value = null;
    loading.value = true;

    let lastError: Error | null = null;
    const maxAttempts = retry?.enabled ? retry.maxAttempts || 3 : 1;
    const delay = retry?.delay || 1000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await fn();

        // Success
        data.value = result;
        loading.value = false;

        // Call success handler
        if (onSuccess) {
          try {
            onSuccess(result);
          } catch (handlerError) {
            console.error(`[useBaseApiCall] Error in onSuccess handler for ${key}:`, handlerError);
          }
        }

        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        error.value = lastError;

        // Call error handler
        if (onError) {
          try {
            onError(lastError);
          } catch (handlerError) {
            console.error(`[useBaseApiCall] Error in onError handler for ${key}:`, handlerError);
          }
        }

        // Log to Sentry if enabled
        if (logToSentry && import.meta.client) {
          try {
            const logger = useSentryLogger();
            logger.logError(`API call failed: ${key}`, lastError, {
              key,
              attempt: attempt + 1,
              maxAttempts,
              retryEnabled: retry?.enabled,
            });
          } catch (_sentryError) {
            // Fallback to console
            console.error(
              `[useBaseApiCall] Error in ${key} (attempt ${attempt + 1}/${maxAttempts}):`,
              lastError
            );
          }
        }

        // Retry logic
        if (retry?.enabled && attempt < maxAttempts - 1) {
          const retryDelay = delay * Math.pow(2, attempt); // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }

        // No more retries
        break;
      }
    }

    // All attempts failed
    loading.value = false;
    return null;
  };

  /**
   * Reset all states
   */
  const reset = () => {
    data.value = null;
    error.value = null;
    loading.value = false;
  };

  return {
    data: readonly(data) as Readonly<Ref<T | null>>,
    error: readonly(error) as Readonly<Ref<Error | null>>,
    loading: readonly(loading) as Readonly<Ref<boolean>>,
    execute,
    reset,
  };
}
