/**
 * Prediction Validation Schemas
 *
 * Using Zod for runtime validation
 */

import { z } from 'zod';

export const PredictionInputSchema = z
  .object({
    brand: z.string().optional(),
    price: z.number().positive().optional(),
    ram: z.number().positive().optional(),
    battery: z.number().positive().optional(),
    storage: z.number().positive().optional(),
    screenSize: z.number().positive().optional(),
    camera: z.number().positive().optional(),
  })
  .passthrough(); // Allow additional fields

export const PredictionOutputSchema = z.object({
  prediction: z.union([z.number(), z.string()]),
  confidence: z.number().min(0).max(1).optional(),
  model: z.string().optional(),
  metadata: z
    .object({
      processingTime: z.number().optional(),
      modelVersion: z.string().optional(),
      timestamp: z.string().optional(),
    })
    .optional(),
});

export const PredictionResultSchema = z.object({
  input: PredictionInputSchema,
  output: PredictionOutputSchema,
  type: z.enum(['price', 'ram', 'battery', 'brand', 'advanced']),
  id: z.string().optional(),
  createdAt: z.string().optional(),
});

export type PredictionInput = z.infer<typeof PredictionInputSchema>;
export type PredictionOutput = z.infer<typeof PredictionOutputSchema>;
export type PredictionResult = z.infer<typeof PredictionResultSchema>;
