/**
 * Search Validation Schemas
 */

import { z } from 'zod';

export const SearchQuerySchema = z.object({
  q: z.string().min(1).optional(),
  brand: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minRam: z.number().positive().optional(),
  maxRam: z.number().positive().optional(),
  minBattery: z.number().positive().optional(),
  maxBattery: z.number().positive().optional(),
  sortBy: z.enum(['price', 'ram', 'battery', 'popularity', 'relevance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  useVectorSearch: z.boolean().optional(),
});

export const SearchResultSchema = z.object({
  results: z.array(z.any()),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
