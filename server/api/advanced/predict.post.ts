import { getPythonApiUrl } from '../../utils/get-python-api-url';
import { createError, defineEventHandler, readBody, setHeader, getMethod } from 'h3';
import type { H3Event } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
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
    const body = await readBody(event);

    console.warn('Advanced prediction request:', body);

    // Transform field names from camelCase to snake_case for Python API
    const transformedBody = {
      model_type: body.modelType,
      currency: body.currency,
      ram: body.ram,
      battery: body.battery,
      screen: body.screen,
      weight: body.weight,
      year: body.year,
      company: body.company,
      front_camera: body.front_camera,
      back_camera: body.back_camera,
      processor: body.processor,
      storage: body.storage,
    };

    const response = await fetch(`${pythonApiUrl}/api/advanced/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedBody),
      signal: AbortSignal.timeout(30000), // 30 second timeout for ML predictions
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Python API error ${response.status}:`, errorText);
      throw new Error(`Python API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.warn('Advanced prediction result:', result);
    return result;
  } catch (error: unknown) {
    console.error('Error in advanced prediction:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get advanced prediction',
    });
  }
});
