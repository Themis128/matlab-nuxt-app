/**
 * Utility to call Python API endpoints
 */
import { getPythonApiUrl } from './get-python-api-url';

export async function callPythonAPI<T>(
  endpoint: string,
  body: Record<string, unknown>,
  event?: any
): Promise<T | null> {
  const pythonApiUrl = getPythonApiUrl(event);

  try {
    const response = await fetch(`${pythonApiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    // Return the response data regardless of status code
    // Let the calling code handle errors appropriately
    const data = await response.json();
    return data;
  } catch {
    // Python API not available, return null to fallback
  }

  return null;
}
