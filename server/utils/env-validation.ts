/**
 * Environment Variables Validation Utility
 *
 * Validates environment variables at startup using Zod schemas
 * Provides type-safe access to validated environment variables
 *
 * Usage:
 *   import { env } from '~/server/utils/env-validation';
 *   const apiUrl = env.public.apiBase;
 */

import { z } from 'zod';

/**
 * Schema for server-only (private) environment variables
 */
const serverEnvSchema = z.object({
  // API Configuration
  NUXT_API_SECRET: z.string().min(1).optional(),

  // Algolia Configuration
  ALGOLIA_APP_ID: z.string().min(1).optional(),
  ALGOLIA_ADMIN_API_KEY: z.string().min(1).optional(),
  ALGOLIA_INDEX: z.string().default('phones_index'),

  // Database Configuration
  DATABASE_URL: z.string().url().optional(),
  DATABASE_SSL: z.enum(['true', 'false']).optional(),

  // Sentry Configuration
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // CORS Configuration
  ALLOWED_ORIGINS: z.string().optional(),
  NUXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // CSP Configuration
  DISABLE_CSP: z.enum(['true', 'false']).optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Schema for public (client-exposed) environment variables
 */
const publicEnvSchema = z.object({
  NUXT_PUBLIC_API_BASE: z.string().url().optional(),
  PYTHON_API_URL: z.string().url().optional(),
  NUXT_PUBLIC_PY_API_DISABLED: z.enum(['0', '1']).optional(),
  NUXT_PUBLIC_GA_ID: z.string().optional(),
  NUXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  ALGOLIA_PUBLIC_API_KEY: z.string().optional(),
});

/**
 * Combined environment schema
 */
const _envSchema = z.object({
  server: serverEnvSchema,
  public: publicEnvSchema,
});

/**
 * Validate and parse environment variables
 */
function validateEnv() {
  try {
    const serverEnv = serverEnvSchema.parse(process.env);
    const publicEnv = publicEnvSchema.parse(process.env);

    return {
      server: serverEnv,
      public: publicEnv,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      console.error('❌ Environment variable validation failed:');
      console.error('Missing or invalid environment variables:');
      missingVars.forEach((err) => {
        console.error(`  - ${err.path}: ${err.message}`);
      });

      // In production, throw error to prevent startup with invalid config
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `Invalid environment configuration. Please check the following variables: ${missingVars.map((e) => e.path).join(', ')}`
        );
      }

      // In development, log warning but continue
      console.warn('⚠️  Continuing with partial configuration (development mode)');
    }

    // Return partial config if validation fails in development
    return {
      server: {} as z.infer<typeof serverEnvSchema>,
      public: {} as z.infer<typeof publicEnvSchema>,
    };
  }
}

/**
 * Validated environment variables
 * Use this instead of process.env directly for type safety
 */
export const env = validateEnv();

/**
 * Type exports for use in other files
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

/**
 * Helper function to get required environment variable
 * Throws error if variable is missing
 */
export function getRequiredEnv(key: keyof ServerEnv): string {
  const value = env.server[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value as string;
}

/**
 * Helper function to check if we're in production
 */
export function isProduction(): boolean {
  return env.server.NODE_ENV === 'production';
}

/**
 * Helper function to check if we're in development
 */
export function isDevelopment(): boolean {
  return env.server.NODE_ENV === 'development';
}

/**
 * Helper function to get API base URL with fallback
 */
export function getApiBaseUrl(): string {
  return env.public.NUXT_PUBLIC_API_BASE || env.public.PYTHON_API_URL || 'http://localhost:8000';
}

/**
 * Helper function to check if Python API is disabled
 */
export function isPythonApiDisabled(): boolean {
  return env.public.NUXT_PUBLIC_PY_API_DISABLED === '1';
}
