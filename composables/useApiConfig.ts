/**
 * Composable for accessing API configuration
 * Provides dynamic backend URL detection
 */
export const useApiConfig = () => {
  const config = useRuntimeConfig();

  /**
   * Dynamically determine Python API URL
   * Priority:
   * 1. Environment variable (NUXT_PUBLIC_API_BASE)
   * 2. Same-origin Nitro proxy (client-side — avoids CORS; PYTHON_API_URL is
   *    not exposed to the browser bundle and direct calls to the backend are
   *    CORS-blocked anyway)
   * 3. Fallback to localhost:8000 (SSR/dev)
   */
  const getPythonApiUrl = (): string => {
    // Client-side: always go through the same-origin Nitro /api/* proxy.
    // Returning '' makes `${pythonApiUrl}/api/...` a relative URL.
    if (process.client) {
      return '';
    }

    // Use environment variable if set
    if (config.public?.apiBase && config.public.apiBase !== 'http://localhost:8000') {
      return config.public.apiBase as string;
    }

    return config.public?.apiBase as string;
  };

  return {
    /**
     * Python API base URL
     * Dynamically detected based on current host or configured via environment variables
     */
    pythonApiUrl: getPythonApiUrl(),

    /**
     * Check if Python API is disabled
     */
    isPythonApiDisabled: config.public?.pyApiDisabled as boolean,
  };
};
