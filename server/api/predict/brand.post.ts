import { callPythonAPI } from '../../utils/python-api';
import { readBody, createError, defineEventHandler } from 'h3';
import type { H3Event } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event);

    const result = await callPythonAPI<{ brand: string }>('/api/predict/brand', body, event);

    if (!result) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Python API is not available',
      });
    }

    return result;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      throw error as any;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to predict brand: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
