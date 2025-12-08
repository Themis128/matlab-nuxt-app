import { getPythonApiUrl } from '../../utils/get-python-api-url';

import { setCorsHeaders } from '../../utils/cors';

export default defineEventHandler(async (event: any) => {
  // Set secure CORS headers
  setCorsHeaders(event);

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
