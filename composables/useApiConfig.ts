/**
 * Composable for accessing API configuration
 * Provides dynamic backend URL detection
 */
export const useApiConfig = () => {
  const config = useRuntimeConfig()

  /**
   * Dynamically determine Python API URL
   * Priority:
   * 1. Environment variable (NUXT_PUBLIC_API_BASE)
   * 2. Current browser location with port 8000 (for Replit/cloud platforms)
   * 3. Fallback to localhost:8000
   */
  const getPythonApiUrl = (): string => {
    // Use environment variable if set
    if (config.public?.apiBase && config.public.apiBase !== 'http://localhost:8000') {
      return config.public.apiBase as string
    }

    // Client-side: detect from browser location
    if (process.client) {
      const currentHost = window.location.hostname
      const currentProtocol = window.location.protocol

      // Check for Replit or cloud platforms
      if (currentHost.includes('replit.dev') || currentHost.includes('repl.co')) {
        return `${currentProtocol}//${currentHost}:8000`
      }

      // For localhost, use port 8000
      if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        return `${currentProtocol}//${currentHost}:8000`
      }

      // For other domains, assume API is on port 8000
      return `${currentProtocol}//${currentHost}:8000`
    }

    // Server-side or fallback
    return config.public?.apiBase as string
  }

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
  }
}
