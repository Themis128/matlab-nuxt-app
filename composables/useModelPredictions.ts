/**
 * Unified Model Predictions Composable
 *
 * Provides access to ALL available ML models:
 * - Distilled (fast, production-ready)
 * - Ensemble (stacking, neural variants)
 * - XGBoost (conservative, aggressive, deep)
 * - Sklearn (price, ram, battery, brand)
 * - Multi-currency (USD, EUR, INR)
 */

import type { UseFetchOptions } from 'nuxt/app';

export interface PredictionRequest {
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
  currency?: 'USD' | 'EUR' | 'INR';
}

export interface PredictionResponse {
  price?: number;
  ram?: number;
  battery?: number;
  brand?: string;
  model_used: string;
  accuracy_info?: {
    r2_score?: number;
    note?: string;
  };
  currency?: string;
  currency_symbol?: string;
}

export type ModelType =
  | 'distilled'
  | 'ensemble_stacking'
  | 'xgboost_conservative'
  | 'xgboost_aggressive'
  | 'xgboost_deep'
  | 'sklearn_price'
  | 'sklearn_ram'
  | 'sklearn_battery'
  | 'sklearn_brand'
  | 'price_eur'
  | 'price_inr'
  | 'price_usd';

export interface ModelInfo {
  type: ModelType;
  name: string;
  description: string;
  speed: 'fast' | 'medium' | 'slow';
  accuracy: 'high' | 'medium' | 'low';
  recommended: boolean;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    type: 'distilled',
    name: 'Distilled Model',
    description: 'Production-ready, 12× faster than ensemble',
    speed: 'fast',
    accuracy: 'high',
    recommended: true,
  },
  {
    type: 'ensemble_stacking',
    name: 'Ensemble Stacking',
    description: 'Multi-algorithm ensemble (best accuracy)',
    speed: 'slow',
    accuracy: 'high',
    recommended: true,
  },
  {
    type: 'xgboost_conservative',
    name: 'XGBoost Conservative',
    description: 'Balanced XGBoost configuration',
    speed: 'medium',
    accuracy: 'high',
    recommended: true,
  },
  {
    type: 'xgboost_aggressive',
    name: 'XGBoost Aggressive',
    description: 'High-performance XGBoost',
    speed: 'medium',
    accuracy: 'high',
    recommended: false,
  },
  {
    type: 'xgboost_deep',
    name: 'XGBoost Deep',
    description: 'Deep XGBoost with complex features',
    speed: 'slow',
    accuracy: 'high',
    recommended: false,
  },
  {
    type: 'sklearn_price',
    name: 'Sklearn Price',
    description: 'Standard sklearn price predictor',
    speed: 'fast',
    accuracy: 'medium',
    recommended: false,
  },
  {
    type: 'sklearn_ram',
    name: 'Sklearn RAM',
    description: 'RAM capacity predictor',
    speed: 'fast',
    accuracy: 'medium',
    recommended: false,
  },
  {
    type: 'sklearn_battery',
    name: 'Sklearn Battery',
    description: 'Battery capacity predictor',
    speed: 'fast',
    accuracy: 'medium',
    recommended: false,
  },
  {
    type: 'sklearn_brand',
    name: 'Sklearn Brand',
    description: 'Brand classifier',
    speed: 'fast',
    accuracy: 'medium',
    recommended: false,
  },
  {
    type: 'price_usd',
    name: 'USD Price Model',
    description: 'US Dollar pricing model',
    speed: 'fast',
    accuracy: 'high',
    recommended: false,
  },
  {
    type: 'price_eur',
    name: 'EUR Price Model',
    description: 'Euro pricing model',
    speed: 'fast',
    accuracy: 'high',
    recommended: false,
  },
  {
    type: 'price_inr',
    name: 'INR Price Model',
    description: 'Indian Rupee pricing model',
    speed: 'fast',
    accuracy: 'high',
    recommended: false,
  },
];

export function useModelPredictions() {
  const { pythonApiUrl } = useApiConfig();

  /**
   * Predict price using any available model
   */
  async function predictPrice(
    request: PredictionRequest,
    modelType: ModelType = 'distilled',
    options?: UseFetchOptions<PredictionResponse>
  ): Promise<PredictionResponse> {
    // Use distilled endpoint for distilled model
    if (modelType === 'distilled') {
      const { data, error } = await useFetch<PredictionResponse>(
        `${pythonApiUrl}/api/distilled/predict/price`,
        {
          method: 'POST',
          body: {
            ram: request.ram,
            battery: request.battery,
            screen: request.screen,
            weight: request.weight,
            year: request.year,
            company: request.company,
            front_camera: request.front_camera,
            back_camera: request.back_camera,
            processor: request.processor,
            storage: request.storage,
          },
          ...options,
        }
      );

      if (error.value) {
        throw new Error(`Distilled prediction failed: ${error.value.message}`);
      }

      return data.value as PredictionResponse;
    }

    // Use advanced endpoint for other models
    const { data, error } = await useFetch<PredictionResponse>(
      `${pythonApiUrl}/api/advanced/predict`,
      {
        method: 'POST',
        body: {
          ...request,
          model_type: modelType,
          currency: request.currency || 'USD',
        },
        ...options,
      }
    );

    if (error.value) {
      throw new Error(`Prediction failed: ${error.value.message}`);
    }

    return data.value as PredictionResponse;
  }

  /**
   * Predict RAM using sklearn model
   */
  async function predictRam(
    request: Omit<PredictionRequest, 'ram'> & { price: number },
    options?: UseFetchOptions<PredictionResponse>
  ): Promise<PredictionResponse> {
    const { data, error } = await useFetch<PredictionResponse>(`${pythonApiUrl}/api/predict/ram`, {
      method: 'POST',
      body: {
        battery: request.battery,
        screen: request.screen,
        weight: request.weight,
        year: request.year,
        price: request.price,
        company: request.company,
      },
      ...options,
    });

    if (error.value) {
      throw new Error(`RAM prediction failed: ${error.value.message}`);
    }

    return data.value as PredictionResponse;
  }

  /**
   * Predict battery using sklearn model
   */
  async function predictBattery(
    request: Omit<PredictionRequest, 'battery'> & { price: number },
    options?: UseFetchOptions<PredictionResponse>
  ): Promise<PredictionResponse> {
    const { data, error } = await useFetch<PredictionResponse>(
      `${pythonApiUrl}/api/predict/battery`,
      {
        method: 'POST',
        body: {
          ram: request.ram,
          screen: request.screen,
          weight: request.weight,
          year: request.year,
          price: request.price,
          company: request.company,
        },
        ...options,
      }
    );

    if (error.value) {
      throw new Error(`Battery prediction failed: ${error.value.message}`);
    }

    return data.value as PredictionResponse;
  }

  /**
   * Predict brand using sklearn model
   */
  async function predictBrand(
    request: Omit<PredictionRequest, 'company'> & { price: number },
    options?: UseFetchOptions<PredictionResponse>
  ): Promise<PredictionResponse> {
    const { data, error } = await useFetch<PredictionResponse>(
      `${pythonApiUrl}/api/predict/brand`,
      {
        method: 'POST',
        body: {
          ram: request.ram,
          battery: request.battery,
          screen: request.screen,
          weight: request.weight,
          year: request.year,
          price: request.price,
        },
        ...options,
      }
    );

    if (error.value) {
      throw new Error(`Brand prediction failed: ${error.value.message}`);
    }

    return data.value as PredictionResponse;
  }

  /**
   * Compare predictions across multiple models
   */
  async function compareModels(
    request: PredictionRequest,
    modelTypes: ModelType[] = ['distilled', 'ensemble_stacking', 'xgboost_conservative']
  ): Promise<Record<ModelType, PredictionResponse>> {
    const predictions = await Promise.allSettled(
      modelTypes.map((modelType) => predictPrice(request, modelType))
    );

    const results: Record<string, PredictionResponse> = {};

    predictions.forEach((result, index) => {
      const modelType = modelTypes[index]!;
      if (result.status === 'fulfilled') {
        results[modelType] = result.value;
      } else {
        // Return error response
        results[modelType] = {
          model_used: modelType,
          price: 0,
          accuracy_info: {
            note: `Error: ${result.reason.message}`,
          },
        } as PredictionResponse;
      }
    });

    return results as Record<ModelType, PredictionResponse>;
  }

  /**
   * Get model information
   */
  async function getModelInfo(modelType: ModelType = 'distilled'): Promise<any> {
    if (modelType === 'distilled') {
      const { data, error } = await useFetch(`${pythonApiUrl}/api/distilled/info`);
      if (error.value) throw error.value;
      return data.value;
    }

    const { data, error } = await useFetch(`${pythonApiUrl}/api/advanced/info`);
    if (error.value) throw error.value;
    return data.value;
  }

  /**
   * Get all available models
   */
  function getAvailableModels(): ModelInfo[] {
    return AVAILABLE_MODELS;
  }

  /**
   * Get recommended models
   */
  function getRecommendedModels(): ModelInfo[] {
    return AVAILABLE_MODELS.filter((m) => m.recommended);
  }

  return {
    predictPrice,
    predictRam,
    predictBattery,
    predictBrand,
    compareModels,
    getModelInfo,
    getAvailableModels,
    getRecommendedModels,
    AVAILABLE_MODELS,
  };
}
