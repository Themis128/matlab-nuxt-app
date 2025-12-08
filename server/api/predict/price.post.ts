import { callPythonAPI } from '../../utils/python-api';

import { setCorsHeaders } from '../../utils/cors';

export default defineEventHandler(async (event: any) => {
  // Set secure CORS headers
  setCorsHeaders(event);

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  try {
    const body = await readBody(event);

    // Validate required fields
    const requiredFields = ['ram', 'battery', 'screen', 'weight', 'year', 'company'];
    const missingFields = requiredFields.filter((field) => !body[field] && body[field] !== 0);

    if (missingFields.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const result = await callPythonAPI<{ price: number }>('/api/predict/price', body, event);

    if (!result) {
      throw new Error('Python API is not available');
    }

    return result;
  } catch (error: unknown) {
    console.error('Error in price prediction:', error);
    throw error;
  }
});
