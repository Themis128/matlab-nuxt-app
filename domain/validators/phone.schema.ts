/**
 * Phone Validation Schemas
 */

import { z } from 'zod';

export const PhoneSpecsSchema = z
  .object({
    brand: z.string().min(1),
    model: z.string().min(1),
    price: z.number().positive().optional(),
    ram: z.number().positive().optional(),
    storage: z.number().positive().optional(),
    battery: z.number().positive().optional(),
    screenSize: z.number().positive().optional(),
    camera: z.number().positive().optional(),
    processor: z.string().optional(),
    os: z.string().optional(),
    releaseDate: z.string().optional(),
  })
  .passthrough();

export const PhoneImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  thumbnail: z.string().url().optional(),
});

export const PhoneSchema = z.object({
  id: z.union([z.string(), z.number()]),
  specs: PhoneSpecsSchema,
  image: PhoneImageSchema.optional(),
  metadata: z
    .object({
      source: z.string().optional(),
      lastUpdated: z.string().optional(),
      popularity: z.number().optional(),
      valueScore: z.number().min(0).max(10).optional(),
    })
    .optional(),
});

export type PhoneSpecs = z.infer<typeof PhoneSpecsSchema>;
export type PhoneImage = z.infer<typeof PhoneImageSchema>;
export type Phone = z.infer<typeof PhoneSchema>;
