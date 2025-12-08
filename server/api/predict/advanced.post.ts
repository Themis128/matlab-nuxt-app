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
    const requiredFields = ['modelType', 'ram', 'battery', 'screen', 'weight', 'year', 'company'];
    const missingFields = requiredFields.filter((field) => !body[field] && body[field] !== 0);

    if (missingFields.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Build payload for Python API
    const payload = {
      ram: parseFloat(body.ram),
      battery: parseFloat(body.battery),
      screen: parseFloat(body.screen),
      weight: parseFloat(body.weight),
      year: parseInt(body.year),
      company: body.company,
      front_camera: body.front_camera ? parseFloat(body.front_camera) : undefined,
      back_camera: body.back_camera ? parseFloat(body.back_camera) : undefined,
      processor: body.processor || undefined,
      storage: body.storage ? parseFloat(body.storage) : undefined,
      model_type: body.modelType,
      currency: body.currency || 'USD',
    };

    const result = await callPythonAPI('/api/advanced/predict', payload, event);

    if (!result) {
      throw new Error('Python API is not available');
    }

    return result;
  } catch (error: unknown) {
    console.error('Error in advanced prediction:', error);
    throw error;
  }
});
