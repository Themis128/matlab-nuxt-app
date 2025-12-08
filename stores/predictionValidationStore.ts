import { defineStore } from 'pinia';

/**
 * Pinia store for validating predictions against model performance metrics
 */
export interface PredictionValidation {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  message: string;
  expectedRange?: { min: number; max: number };
}

interface PriceInput {
  ram: number;
  battery: number;
  screen: number;
  weight: number;
  year: number;
  company: string;
}

interface RamInput {
  battery: number;
  screen: number;
  weight: number;
  year: number;
  price: number;
  company: string;
}

interface BatteryInput {
  ram: number;
  screen: number;
  weight: number;
  year: number;
  price: number;
  company: string;
}

interface BrandInput {
  ram: number;
  battery: number;
  screen: number;
  weight: number;
  year: number;
  price: number;
}

export const usePredictionValidationStore = defineStore('predictionValidation', {
  state: () => ({
    MODEL_METRICS: {
      price: {
        r2: 0.7754,
        rmse: 167.83,
        mae: 119.73,
        typicalRange: { min: 100, max: 2000 },
      },
      ram: {
        r2: 0.6381,
        rmse: 1.64,
        mae: 1.2,
        typicalRange: { min: 2, max: 24 },
      },
      battery: {
        r2: 0.7489,
        rmse: 141.9,
        mae: 110.5,
        typicalRange: { min: 2000, max: 7000 },
      },
      brand: {
        accuracy: 0.5652,
        typicalRange: { min: 0, max: 1 },
      },
    },
  }),

  actions: {
    validatePrice(predictedPrice: number, input: PriceInput): PredictionValidation {
      const metrics = this.MODEL_METRICS.price;
      const expectedRange = {
        min: Math.max(metrics.typicalRange.min, predictedPrice - metrics.rmse * 2),
        max: Math.min(metrics.typicalRange.max, predictedPrice + metrics.rmse * 2),
      };

      // Check if prediction is within typical range
      const inRange =
        predictedPrice >= metrics.typicalRange.min && predictedPrice <= metrics.typicalRange.max;

      // Determine confidence based on R² and whether it's in range
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      let message = '';

      if (inRange) {
        if (metrics.r2 > 0.75) {
          confidence = 'high';
          message = `Prediction is within expected range. Model accuracy (R² = ${metrics.r2.toFixed(2)}) suggests this is reliable. Expected error: ±$${Math.round(metrics.rmse)}.`;
        } else {
          confidence = 'medium';
          message = `Prediction is within expected range. Model accuracy (R² = ${metrics.r2.toFixed(2)}) suggests moderate reliability. Expected error: ±$${Math.round(metrics.rmse)}.`;
        }
      } else {
        confidence = 'low';
        message = `Prediction is outside typical price range ($${metrics.typicalRange.min}-$${metrics.typicalRange.max}). This may indicate an unusual phone configuration or model limitation.`;
      }

      // Additional validation for Apple phones (typically premium priced)
      if (input.company.toLowerCase() === 'apple' && predictedPrice < 500) {
        confidence = 'low';
        message = 'Price seems unusually low for an Apple device. Please verify inputs.';
      }

      // Check for unrealistic combinations
      if (input.ram >= 12 && input.battery >= 5000 && input.year >= 2024 && predictedPrice < 800) {
        confidence = 'low';
        message = 'Price seems low for a high-end 2024 device with these specifications.';
      }

      return {
        isValid: inRange,
        confidence,
        message,
        expectedRange,
      };
    },

    validateRam(predictedRam: number, _input: RamInput): PredictionValidation {
      const metrics = this.MODEL_METRICS.ram;
      const expectedRange = {
        min: Math.max(metrics.typicalRange.min, predictedRam - metrics.rmse * 2),
        max: Math.min(metrics.typicalRange.max, predictedRam + metrics.rmse * 2),
      };

      const inRange =
        predictedRam >= metrics.typicalRange.min && predictedRam <= metrics.typicalRange.max;

      const confidence: 'high' | 'medium' | 'low' = metrics.r2 > 0.6 ? 'medium' : 'low';
      const message = inRange
        ? `Prediction is within expected range. Expected error: ±${metrics.rmse.toFixed(1)} GB.`
        : `Prediction is outside typical RAM range (${metrics.typicalRange.min}-${metrics.typicalRange.max} GB).`;

      return {
        isValid: inRange,
        confidence,
        message,
        expectedRange,
      };
    },

    validateBattery(predictedBattery: number, _input: BatteryInput): PredictionValidation {
      const metrics = this.MODEL_METRICS.battery;
      const expectedRange = {
        min: Math.max(metrics.typicalRange.min, predictedBattery - metrics.rmse * 2),
        max: Math.min(metrics.typicalRange.max, predictedBattery + metrics.rmse * 2),
      };

      const inRange =
        predictedBattery >= metrics.typicalRange.min &&
        predictedBattery <= metrics.typicalRange.max;

      const confidence: 'high' | 'medium' | 'low' = metrics.r2 > 0.7 ? 'high' : 'medium';
      const message = inRange
        ? `Prediction is within expected range. Expected error: ±${Math.round(metrics.rmse)} mAh.`
        : `Prediction is outside typical battery range (${metrics.typicalRange.min}-${metrics.typicalRange.max} mAh).`;

      return {
        isValid: inRange,
        confidence,
        message,
        expectedRange,
      };
    },

    validateBrand(_predictedBrand: string, _input: BrandInput): PredictionValidation {
      const metrics = this.MODEL_METRICS.brand;
      const confidence: 'high' | 'medium' | 'low' = metrics.accuracy > 0.5 ? 'medium' : 'low';
      const message = `Brand classification accuracy: ${(metrics.accuracy * 100).toFixed(1)}%. Prediction may not always be accurate.`;

      return {
        isValid: true, // Brand is always "valid" (it's a classification)
        confidence,
        message,
      };
    },
  },

  // Note: MODEL_METRICS is static configuration data, no need for persistence
  // If metrics need to be updated dynamically in the future, add persist config
});
