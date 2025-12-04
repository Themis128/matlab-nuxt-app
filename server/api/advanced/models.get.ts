import { getPythonApiUrl } from '../../utils/get-python-api-url';

export default defineEventHandler(async (event) => {
  // Set CORS headers
  setHeader(event, 'Access-Control-Allow-Origin', '*');
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  try {
    const pythonApiUrl = getPythonApiUrl(event);

    const response = await fetch(`${pythonApiUrl}/api/advanced/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Python API returned ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    console.error('Error fetching available models:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch available models',
    });
  }
});
