import { getRequestHost, getRequestProtocol } from 'h3';

/**
 * Dynamically determines the Python API URL based on the current host
 * This allows the frontend to connect to the Python API on platforms like Replit
 * where the host URL is dynamically assigned.
 *
 * Priority order:
 * 1. PYTHON_API_URL or NUXT_PUBLIC_API_BASE environment variable (explicit override)
 * 2. Current request host with port 8000 (dynamic detection)
 * 3. localhost:8000 (development fallback)
 */

export function getPythonApiUrl(event?: any): string {
  // Check environment variables first (highest priority)
  const envUrl = process.env.PYTHON_API_URL || process.env.NUXT_PUBLIC_API_BASE;
  if (envUrl) {
    return envUrl;
  }

  // If event is provided, derive from request host
  if (event) {
    try {
      const host = getRequestHost(event, { xForwardedHost: true });

      if (host) {
        // Check if host contains replit.dev or other cloud platforms
        if (host.includes('replit.dev') || host.includes('repl.co')) {
          // For Replit: replace frontend port (3000/5000) with backend port (8000)
          const protocol = getRequestProtocol(event, { xForwardedProto: true });
          const baseHost = host.replace(/:\d+$/, ''); // Remove port if present
          return `${protocol}://${baseHost}:8000`;
        }

        // For other environments: use same host with port 8000
        const protocol = getRequestProtocol(event, { xForwardedProto: true });
        const baseHost = host.replace(/:\d+$/, ''); // Remove port if present

        // If it's localhost or 127.0.0.1, use port 8000
        if (baseHost.includes('localhost') || baseHost.includes('127.0.0.1')) {
          return `${protocol}://${baseHost}:8000`;
        }

        // For production domains, assume API is on same domain
        return `${protocol}://${baseHost}:8000`;
      }
    } catch (error) {
      console.warn('Failed to derive Python API URL from request:', error);
    }
  }

  // Default fallback for local development
  return 'http://localhost:8000';
}
