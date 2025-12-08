/**
 * Prediction Domain Service
 *
 * Contains business logic for predictions
 */

import type { Prediction } from '../models/prediction.model';
import { PredictionInputSchema, PredictionOutputSchema } from '../validators/prediction.schema';

export class PredictionService {
  /**
   * Validate prediction input
   */
  validateInput(input: unknown): boolean {
    try {
      PredictionInputSchema.parse(input);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate prediction output
   */
  validateOutput(output: unknown): boolean {
    try {
      PredictionOutputSchema.parse(output);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calculate prediction confidence based on input quality
   */
  calculateInputQuality(input: Record<string, unknown>): number {
    const requiredFields = ['brand', 'price', 'ram', 'battery'];
    const providedFields = requiredFields.filter((field) => input[field] !== undefined);
    return providedFields.length / requiredFields.length;
  }

  /**
   * Determine if prediction should be cached
   */
  shouldCache(prediction: Prediction): boolean {
    // Cache predictions with high confidence
    return prediction.isHighConfidence(0.7);
  }

  /**
   * Format prediction for display
   */
  formatPrediction(prediction: Prediction, type: string): string {
    const value = prediction.getValue();

    switch (type) {
      case 'price':
        return `$${value.toLocaleString()}`;
      case 'ram':
        return `${value}GB`;
      case 'battery':
        return `${value}mAh`;
      case 'brand':
        return String(prediction.output.prediction);
      default:
        return String(value);
    }
  }
}
