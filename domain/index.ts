/**
 * Domain Layer Public API
 *
 * Centralized exports for domain layer
 */

// Models
export { Prediction } from './models/prediction.model';
export type {
  PredictionInput,
  PredictionOutput,
  PredictionResult,
} from './models/prediction.model';
export { Phone } from './models/phone.model';
export type { PhoneSpecs, PhoneImage } from './models/phone.model';
export { MLModel } from './models/model.model';
export type { ModelType, PredictionTask, ModelMetrics, ModelMetadata } from './models/model.model';
export { Analytics } from './models/analytics.model';
export type {
  AnalyticsDataPoint,
  AnalyticsTimeSeries,
  AnalyticsMetric,
  AnalyticsDimension,
} from './models/analytics.model';

// Validators (schemas only, types come from models)
export {
  PredictionInputSchema,
  PredictionOutputSchema,
  PredictionResultSchema,
} from './validators/prediction.schema';
export { PhoneSchema, PhoneSpecsSchema, PhoneImageSchema } from './validators/phone.schema';
export { SearchQuerySchema, SearchResultSchema } from './validators/search.schema';
export type { SearchQuery, SearchResult } from './validators/search.schema';

// Services
export { PredictionService } from './services/prediction.service';
export { PhoneService } from './services/phone.service';
export { AnalyticsService } from './services/analytics.service';
