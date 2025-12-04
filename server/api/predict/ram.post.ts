import { callPythonAPI } from '../../utils/python-api';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const result = await callPythonAPI<{ ram: number }>('/api/predict/ram', body, event);

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
      statusMessage: `Failed to predict RAM: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
