/**
 * Utility to call Python API endpoints
 */
import { getPythonApiUrl } from './get-python-api-url';

const PYTHON_API_TIMEOUT_MS = 5000;

export async function callPythonAPI<T>(
  endpoint: string,
  body: Record<string, unknown> | null = null,
  event?: any,
  method: 'GET' | 'POST' = 'POST'
): Promise<T | null> {
  const pythonApiUrl = getPythonApiUrl(event);

  try {
    const requestOptions: RequestInit = {
      method,
      signal: AbortSignal.timeout(PYTHON_API_TIMEOUT_MS), // 5 second timeout
    };

    // Only add body and content-type for non-GET requests
    if (method !== 'GET' && body) {
      requestOptions.headers = {
        'Content-Type': 'application/json',
      };
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${pythonApiUrl}${endpoint}`, requestOptions);

    // Return the response data regardless of status code
    // Let the calling code handle errors appropriately
    const data = await response.json();
    return data;
  } catch {
    // Python API not available, return null to fallback
  }

  return null;
}
