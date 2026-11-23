import { callPythonAPI } from '../../../utils/python-api';

export default defineEventHandler(async (event: any) => {
  try {
    const body = await readBody(event);

    const result = await callPythonAPI<{ price: number }>(
      '/api/distilled/predict/price',
      body,
      event
    );

    if (!result) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Python API is not available',
      });
    }

    return result;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      throw error as { statusCode: number; statusMessage?: string };
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to predict price: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
