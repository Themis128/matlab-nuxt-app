import { callPythonAPI } from '../../utils/python-api';
import { handleAPIError, AppError, ErrorCodes } from '../../utils/error-handler';
import { logger } from '../../utils/logger';

export default defineEventHandler(async (event: any) => {
  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  const startTime = Date.now();

  try {
    const body = await readBody(event);

    logger.debug('Advanced prediction request', {
      endpoint: '/api/advanced/predict',
      hasBody: !!body,
    });

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

    // Use enhanced Python API utility with circuit breaker
    const result = await callPythonAPI<unknown>(
      '/api/advanced/predict',
      transformedBody,
      event,
      'POST',
      {
        timeout: 30000, // 30 second timeout for ML predictions
        useCache: false, // Don't cache predictions
        skipCircuitBreaker: false,
      }
    );

    if (!result) {
      throw new AppError('Python API is not available', 503, ErrorCodes.EXTERNAL_API_ERROR);
    }

    const duration = Date.now() - startTime;
    logger.info('Advanced prediction successful', {
      endpoint: '/api/advanced/predict',
      duration,
    });

    return result;
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    logger.logError('Advanced prediction failed', error as Error, {
      endpoint: '/api/advanced/predict',
      duration,
    });
    return handleAPIError(event, error);
  }
});
