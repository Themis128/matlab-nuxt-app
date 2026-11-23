import { callPythonAPI } from '../../utils/python-api';

export default defineEventHandler(async (event: any) => {
  try {
    const result = await callPythonAPI<unknown>('/api/distilled/info', null, event, 'GET');

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
      statusMessage: `Failed to fetch distilled model info: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
