/**
 * Standardized error handling utility
 * Provides consistent error responses across all API endpoints
 */

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
  statusCode: number;
  timestamp: string;
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standard error response formatter
 */
export function formatError(error: unknown): APIError {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      statusCode: 500,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    statusCode: 500,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handle API errors consistently
 */
export function handleAPIError(event: any, error: unknown) {
  const formattedError = formatError(error);

  // Log error for monitoring (Sentry will pick this up)
  if (process.env.NODE_ENV !== 'test') {
    console.error('[API Error]', {
      code: formattedError.code,
      message: formattedError.message,
      statusCode: formattedError.statusCode,
      path: event?.node?.req?.url,
      method: event?.node?.req?.method,
    });
  }

  throw createError({
    statusCode: formattedError.statusCode,
    statusMessage: formattedError.message,
    data: {
      error: {
        code: formattedError.code,
        message: formattedError.message,
        details: formattedError.details,
        timestamp: formattedError.timestamp,
      },
    },
  });
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  CIRCUIT_BREAKER_OPEN: 'CIRCUIT_BREAKER_OPEN',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
