/**
 * Component Props Validation Utility
 *
 * Provides Zod-based validation for Vue component props
 * Ensures type safety and runtime validation
 *
 * @example
 * ```ts
 * // In component
 * import { validateProps } from '~/utils/component-props-validation';
 * import { z } from 'zod';
 *
 * const phoneSchema = z.object({
 *   id: z.string(),
 *   name: z.string(),
 *   price: z.number().positive(),
 * });
 *
 * type Phone = z.infer<typeof phoneSchema>;
 *
 * const props = defineProps<{
 *   phone: Phone;
 * }>();
 *
 * // Validate at runtime (optional, for extra safety)
 * onMounted(() => {
 *   const validation = validateProps(props, { phone: phoneSchema });
 *   if (!validation.valid) {
 *     console.error('Invalid props:', validation.errors);
 *   }
 * });
 * ```
 */

import { z } from 'zod';

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Validate component props against Zod schemas
 *
 * @param props Component props object
 * @param schemas Object mapping prop names to Zod schemas
 * @returns Validation result with errors if any
 */
export function validateProps(
  props: Record<string, any>,
  schemas: Record<string, z.ZodSchema>
): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  for (const [propName, schema] of Object.entries(schemas)) {
    const value = props[propName];

    // Skip validation if prop is undefined (optional props)
    if (value === undefined) {
      continue;
    }

    try {
      schema.parse(value);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          errors.push({
            path: `${propName}.${err.path.join('.')}`,
            message: err.message,
          });
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a prop validator function for use in components
 *
 * @example
 * ```ts
 * const validatePhone = createPropValidator({
 *   phone: phoneSchema,
 * });
 *
 * // In component
 * const validation = validatePhone(props);
 * ```
 */
export function createPropValidator(schemas: Record<string, z.ZodSchema>) {
  return (props: Record<string, any>): ValidationResult => {
    return validateProps(props, schemas);
  };
}

/**
 * Common Zod schemas for reuse across components
 */
export const commonSchemas = {
  /** String ID schema */
  id: z.string().min(1),

  /** Positive number schema */
  positiveNumber: z.number().positive(),

  /** Non-negative number schema */
  nonNegativeNumber: z.number().nonnegative(),

  /** URL schema */
  url: z.string().url(),

  /** Email schema */
  email: z.string().email(),

  /** Date string schema */
  dateString: z.string().datetime(),

  /** Optional string schema */
  optionalString: z.string().optional(),

  /** Optional number schema */
  optionalNumber: z.number().optional(),

  /** Boolean schema */
  boolean: z.boolean(),

  /** Array of strings schema */
  stringArray: z.array(z.string()),

  /** Object with string keys and any values */
  record: z.record(z.string(), z.any()),
};
