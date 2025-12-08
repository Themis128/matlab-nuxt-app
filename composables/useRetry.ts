/**
 * Retry utility with exponential backoff
 * Helps handle transient network errors and improve reliability
 */

export const useRetry = () => {
  /**
   * Retry a function with exponential backoff
   *
   * @param fn Function to retry
   * @param maxRetries Maximum number of retry attempts
   * @param initialDelay Initial delay in milliseconds
   * @returns Promise that resolves with the function result
   */
  const retry = async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 1000
  ): Promise<T> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on last attempt
        if (attempt === maxRetries - 1) {
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Max retries exceeded');
  };

  /**
   * Retry with custom retry condition
   *
   * @param fn Function to retry
   * @param shouldRetry Function that determines if error should be retried
   * @param maxRetries Maximum number of retry attempts
   * @param initialDelay Initial delay in milliseconds
   */
  const retryIf = async <T>(
    fn: () => Promise<T>,
    shouldRetry: (error: Error) => boolean,
    maxRetries = 3,
    initialDelay = 1000
  ): Promise<T> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        lastError = err;

        // Check if we should retry this error
        if (!shouldRetry(err) || attempt === maxRetries - 1) {
          throw err;
        }

        // Calculate delay with exponential backoff
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Max retries exceeded');
  };

  return {
    retry,
    retryIf,
  };
};
