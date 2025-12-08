/**
 * Unified Predictions Store
 *
 * Consolidates:
 * - predictionHistoryStore
 * - predictionValidationStore
 * - advancedModelsStore
 *
 * Provides unified state management for all prediction-related functionality.
 */

import { defineStore } from 'pinia';
import { PredictionService, type PredictionInput } from '@/domain';

// ============================================================================
// Types
// ============================================================================

export interface PredictionHistoryItem {
  id: string;
  model: 'price' | 'brand' | 'ram' | 'battery' | 'advanced';
  input: Record<string, any>;
  result: number | string;
  timestamp: number;
  predictionTime: number;
  source: 'api' | 'fallback';
  error?: string;
  confidence?: number;
  modelUsed?: string;
}

export interface PredictionValidation {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  message: string;
  expectedRange?: { min: number; max: number };
}

export interface AdvancedModel {
  type: string;
  name: string;
  description: string;
  available: boolean;
  category: string;
  accuracy?: number;
}

export interface AdvancedPredictionResult {
  price: number;
  model_used: string;
  accuracy_info?: {
    r2_score: number;
    note: string;
  };
  currency: string;
  currency_symbol: string;
}

export interface AdvancedPredictionRequest {
  modelType: string;
  currency: string;
  ram: number;
  battery: number;
  screen: number;
  weight: number;
  year: number;
  company: string;
  front_camera?: number;
  back_camera?: number;
  processor?: string;
  storage?: number;
}

// ============================================================================
// Store
// ============================================================================

const STORAGE_KEY = 'mobile-prediction-history';
const MAX_HISTORY = 50;

export const usePredictionsStore = defineStore('predictions', {
  state: () => ({
    // History
    history: [] as PredictionHistoryItem[],

    // Advanced Models
    availableModels: [] as AdvancedModel[],
    selectedModel: 'distilled',
    selectedCurrency: 'USD',
    isLoadingModels: false,
    isLoadingPrediction: false,
    lastPrediction: null as AdvancedPredictionResult | null,
    advancedPredictionHistory: [] as AdvancedPredictionResult[],
    processingTime: 0,

    // Validation Metrics (static configuration)
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

  getters: {
    // History Getters
    getAllHistory(): PredictionHistoryItem[] {
      return this.history;
    },

    getHistoryByModel:
      (state) =>
      (model: string): PredictionHistoryItem[] => {
        return state.history.filter((item) => item.model === model);
      },

    // Advanced Models Getters
    activeModels: (state) => {
      return state.availableModels.filter((model) => model.available);
    },

    modelCategories: (state) => {
      const categories: Record<string, AdvancedModel[]> = {};
      state.availableModels.forEach((model) => {
        if (!categories[model.category]) {
          categories[model.category] = [];
        }
        categories[model.category]!.push(model);
      });
      return categories;
    },

    currentModel: (state) => {
      return state.availableModels.find((model) => model.type === state.selectedModel);
    },

    currencies: () => [
      { code: 'USD', symbol: '$', name: 'US Dollar' },
      { code: 'EUR', symbol: '€', name: 'Euro' },
      { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    ],

    currentCurrency(state): { code: string; symbol: string; name: string } | undefined {
      const currencies = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
      ];
      return currencies.find((currency) => currency.code === state.selectedCurrency);
    },
  },

  actions: {
    // ========================================================================
    // History Actions
    // ========================================================================

    /**
     * Load history from localStorage
     */
    loadHistory() {
      if (typeof window === 'undefined') return;

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.history = JSON.parse(stored);
        }
      } catch (error) {
        const logger = useSentryLogger();
        logger.logError(
          'Failed to load prediction history',
          error instanceof Error ? error : new Error(String(error)),
          {
            component: 'predictionsStore',
            action: 'loadHistory',
          }
        );
      }
    },

    /**
     * Save a new prediction to history
     */
    savePrediction(item: Omit<PredictionHistoryItem, 'id' | 'timestamp'>) {
      if (typeof window === 'undefined') return;

      try {
        const newItem: PredictionHistoryItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: Date.now(),
        };

        this.history.unshift(newItem);
        this.history = this.history.slice(0, MAX_HISTORY);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
      } catch (error) {
        const logger = useSentryLogger();
        logger.logError(
          'Failed to save prediction history',
          error instanceof Error ? error : new Error(String(error)),
          {
            component: 'predictionsStore',
            action: 'savePrediction',
          }
        );
      }
    },

    /**
     * Clear all history
     */
    clearHistory() {
      if (typeof window === 'undefined') return;

      this.history = [];
      localStorage.removeItem(STORAGE_KEY);
    },

    // ========================================================================
    // Validation Actions
    // ========================================================================

    validatePrice(predictedPrice: number, input: Record<string, any>): PredictionValidation {
      const metrics = this.MODEL_METRICS.price;
      const expectedRange = {
        min: Math.max(metrics.typicalRange.min, predictedPrice - metrics.rmse * 2),
        max: Math.min(metrics.typicalRange.max, predictedPrice + metrics.rmse * 2),
      };

      const inRange =
        predictedPrice >= metrics.typicalRange.min && predictedPrice <= metrics.typicalRange.max;

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

      // Additional validation for Apple phones
      if (input.company?.toLowerCase() === 'apple' && predictedPrice < 500) {
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

    validateRam(predictedRam: number, _input: Record<string, any>): PredictionValidation {
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

    validateBattery(predictedBattery: number, _input: Record<string, any>): PredictionValidation {
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

    validateBrand(_predictedBrand: string, _input: Record<string, any>): PredictionValidation {
      const metrics = this.MODEL_METRICS.brand;
      const confidence: 'high' | 'medium' | 'low' = metrics.accuracy > 0.5 ? 'medium' : 'low';
      const message = `Brand classification accuracy: ${(metrics.accuracy * 100).toFixed(1)}%. Prediction may not always be accurate.`;

      return {
        isValid: true,
        confidence,
        message,
      };
    },

    // ========================================================================
    // Advanced Models Actions
    // ========================================================================

    /**
     * Fetch available models from API
     */
    async fetchAvailableModels() {
      if (this.isLoadingModels) return;

      this.isLoadingModels = true;
      try {
        const response = await $fetch<{
          models?: AdvancedModel[];
        }>('/api/advanced/models');
        this.availableModels = response.models || [];

        if (!this.availableModels.find((model) => model.type === this.selectedModel)) {
          const firstAvailable = this.availableModels.find((model) => model.available);
          if (firstAvailable) {
            this.selectedModel = firstAvailable.type;
          }
        }
      } catch (error) {
        const logger = useSentryLogger();
        logger.logError(
          'Failed to fetch available models',
          error instanceof Error ? error : new Error(String(error)),
          {
            component: 'predictionsStore',
            action: 'fetchAvailableModels',
          }
        );
        // Fallback to hardcoded models
        this.availableModels = [
          {
            type: 'distilled',
            name: 'Distilled Model',
            description: 'Production-ready distilled model (10x faster)',
            available: true,
            category: 'distilled',
            accuracy: 98.24,
          },
          {
            type: 'ensemble_stacking',
            name: 'Ensemble Stacking',
            description: 'Ensemble stacking with multiple algorithms',
            available: true,
            category: 'ensemble',
            accuracy: 98.76,
          },
          {
            type: 'xgboost_conservative',
            name: 'XGBoost Conservative',
            description: 'Conservative XGBoost configuration',
            available: true,
            category: 'xgboost',
            accuracy: 97.32,
          },
          {
            type: 'xgboost_deep',
            name: 'XGBoost Deep',
            description: 'Deep XGBoost with complex features',
            available: true,
            category: 'xgboost',
            accuracy: 97.32,
          },
        ];
      } finally {
        this.isLoadingModels = false;
      }
    },

    /**
     * Run prediction with selected model
     */
    async runAdvancedPrediction(
      request: AdvancedPredictionRequest
    ): Promise<AdvancedPredictionResult | null> {
      if (this.isLoadingPrediction) return null;

      this.isLoadingPrediction = true;
      const startTime = Date.now();

      try {
        const response = await $fetch<AdvancedPredictionResult>('/api/advanced/predict', {
          method: 'POST',
          body: request,
        });

        this.processingTime = Date.now() - startTime;
        this.lastPrediction = response;
        this.advancedPredictionHistory.unshift(response);

        if (this.advancedPredictionHistory.length > 10) {
          this.advancedPredictionHistory = this.advancedPredictionHistory.slice(0, 10);
        }

        return response;
      } catch (error) {
        const logger = useSentryLogger();
        logger.logError(
          'Advanced prediction failed',
          error instanceof Error ? error : new Error(String(error)),
          {
            component: 'predictionsStore',
            action: 'runAdvancedPrediction',
          }
        );
        throw error;
      } finally {
        this.isLoadingPrediction = false;
      }
    },

    /**
     * Compare multiple models
     */
    async compareModels(
      models: string[],
      request: Omit<AdvancedPredictionRequest, 'modelType'>
    ): Promise<Record<string, unknown> | null> {
      if (this.isLoadingPrediction || models.length === 0) return null;

      this.isLoadingPrediction = true;
      const startTime = Date.now();

      try {
        const response = await $fetch<Record<string, unknown>>('/api/advanced/compare', {
          method: 'POST',
          body: {
            models,
            ...request,
          },
        });

        this.processingTime = Date.now() - startTime;

        return response;
      } catch (error) {
        const logger = useSentryLogger();
        logger.logError(
          'Model comparison failed',
          error instanceof Error ? error : new Error(String(error)),
          {
            component: 'predictionsStore',
            action: 'compareModels',
          }
        );
        throw error;
      } finally {
        this.isLoadingPrediction = false;
      }
    },

    /**
     * Set selected model type
     */
    setSelectedModel(modelType: string) {
      this.selectedModel = modelType;
    },

    /**
     * Set selected currency
     */
    setSelectedCurrency(currency: string) {
      this.selectedCurrency = currency;
    },

    /**
     * Clear advanced prediction history
     */
    clearAdvancedHistory() {
      this.advancedPredictionHistory = [];
      this.lastPrediction = null;
    },

    /**
     * Initialize store
     */
    async initialize() {
      this.loadHistory();
      await this.fetchAvailableModels();
    },
  },

  persist: {
    key: 'predictions-store',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    paths: ['selectedModel', 'selectedCurrency', 'advancedPredictionHistory', 'lastPrediction'],
  },
});
