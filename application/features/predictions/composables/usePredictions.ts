/**
 * Unified Predictions Composable
 *
 * Consolidates prediction-related composables:
 * - usePredictionHistory
 * - usePredictionValidation
 * - useModelPredictions
 *
 * Provides a unified interface for all prediction operations.
 */

import { usePredictionsStore } from '../store/predictions.store';
import { useApiGateway } from '~/composables/useApiGateway';
import { PredictionService, type PredictionInput } from '@/domain';

export const usePredictions = () => {
  const store = usePredictionsStore();
  const gateway = useApiGateway();
  const _predictionService = new PredictionService();

  // ==========================================================================
  // History
  // ==========================================================================

  /**
   * Get all prediction history
   */
  const getHistory = () => {
    return store.getAllHistory;
  };

  /**
   * Get history by model type
   */
  const getHistoryByModel = (model: string) => {
    return store.getHistoryByModel(model);
  };

  /**
   * Save a prediction to history
   */
  const savePrediction = (item: {
    model: 'price' | 'brand' | 'ram' | 'battery' | 'advanced';
    input: Record<string, any>;
    result: number | string;
    predictionTime: number;
    source: 'api' | 'fallback';
    error?: string;
    confidence?: number;
    modelUsed?: string;
  }) => {
    store.savePrediction(item);
  };

  /**
   * Clear prediction history
   */
  const clearHistory = () => {
    store.clearHistory();
  };

  // ==========================================================================
  // Validation
  // ==========================================================================

  /**
   * Validate a price prediction
   */
  const validatePrice = (predictedPrice: number, input: Record<string, any>) => {
    return store.validatePrice(predictedPrice, input);
  };

  /**
   * Validate a RAM prediction
   */
  const validateRam = (predictedRam: number, input: Record<string, any>) => {
    return store.validateRam(predictedRam, input);
  };

  /**
   * Validate a battery prediction
   */
  const validateBattery = (predictedBattery: number, input: Record<string, any>) => {
    return store.validateBattery(predictedBattery, input);
  };

  /**
   * Validate a brand prediction
   */
  const validateBrand = (predictedBrand: string, input: Record<string, any>) => {
    return store.validateBrand(predictedBrand, input);
  };

  // ==========================================================================
  // Predictions (using API Gateway)
  // ==========================================================================

  /**
   * Predict price
   */
  const predictPrice = async (
    data: Record<string, unknown>,
    options?: { useCache?: boolean; cacheTTL?: number }
  ) => {
    try {
      // Validate input using domain schema
      // PredictionInputSchema expects a flat object with optional fields
      const { PredictionInputSchema } = await import('@/domain');
      const validated = PredictionInputSchema.parse(data) as Record<string, unknown>;

      // Make prediction via gateway
      const result = await gateway.predictPrice(validated, {
        useCache: options?.useCache ?? false,
        cacheTTL: options?.cacheTTL ?? 300,
      });

      return {
        success: true,
        data: result.data,
        metadata: result.metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  /**
   * Predict RAM
   */
  const predictRAM = async (
    data: Record<string, unknown>,
    options?: { useCache?: boolean; cacheTTL?: number }
  ) => {
    try {
      const _input: PredictionInput = {
        modelName: 'ram',
        features: data,
      };

      // Validate using Zod schema
      const { PredictionInputSchema } = await import('@/domain');
      const validated = PredictionInputSchema.parse(data) as Record<string, unknown>;
      const result = await gateway.predictRAM(validated, {
        useCache: options?.useCache ?? false,
        cacheTTL: options?.cacheTTL ?? 300,
      });

      return {
        success: true,
        data: result.data,
        metadata: result.metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  /**
   * Predict battery
   */
  const predictBattery = async (
    data: Record<string, unknown>,
    options?: { useCache?: boolean; cacheTTL?: number }
  ) => {
    try {
      const _input: PredictionInput = {
        modelName: 'battery',
        features: data,
      };

      // Validate using Zod schema
      const { PredictionInputSchema } = await import('@/domain');
      const validated = PredictionInputSchema.parse(data) as Record<string, unknown>;
      const result = await gateway.predictBattery(validated, {
        useCache: options?.useCache ?? false,
        cacheTTL: options?.cacheTTL ?? 300,
      });

      return {
        success: true,
        data: result.data,
        metadata: result.metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  /**
   * Predict brand
   */
  const predictBrand = async (
    data: Record<string, unknown>,
    options?: { useCache?: boolean; cacheTTL?: number }
  ) => {
    try {
      const _input: PredictionInput = {
        modelName: 'brand',
        features: data,
      };

      // Validate using Zod schema
      const { PredictionInputSchema } = await import('@/domain');
      const validated = PredictionInputSchema.parse(data) as Record<string, unknown>;
      const result = await gateway.predictBrand(validated, {
        useCache: options?.useCache ?? false,
        cacheTTL: options?.cacheTTL ?? 300,
      });

      return {
        success: true,
        data: result.data,
        metadata: result.metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  // ==========================================================================
  // Advanced Models
  // ==========================================================================

  /**
   * Fetch available advanced models
   */
  const fetchAvailableModels = async () => {
    await store.fetchAvailableModels();
  };

  /**
   * Run advanced prediction
   */
  const runAdvancedPrediction = async (request: {
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
  }) => {
    return await store.runAdvancedPrediction(request);
  };

  /**
   * Compare multiple models
   */
  const compareModels = async (
    models: string[],
    request: {
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
  ) => {
    return await store.compareModels(models, request);
  };

  /**
   * Set selected model
   */
  const setSelectedModel = (modelType: string) => {
    store.setSelectedModel(modelType);
  };

  /**
   * Set selected currency
   */
  const setSelectedCurrency = (currency: string) => {
    store.setSelectedCurrency(currency);
  };

  /**
   * Initialize predictions (load history, fetch models)
   */
  const initialize = async () => {
    await store.initialize();
  };

  // ==========================================================================
  // Computed Properties
  // ==========================================================================

  const history = computed(() => store.getAllHistory);
  const availableModels = computed(() => store.activeModels);
  const selectedModel = computed(() => store.selectedModel);
  const currentModel = computed(() => store.currentModel);
  const isLoadingModels = computed(() => store.isLoadingModels);
  const isLoadingPrediction = computed(() => store.isLoadingPrediction);
  const lastPrediction = computed(() => store.lastPrediction);
  const processingTime = computed(() => store.processingTime);

  return {
    // History
    history,
    getHistory,
    getHistoryByModel,
    savePrediction,
    clearHistory,

    // Validation
    validatePrice,
    validateRam,
    validateBattery,
    validateBrand,

    // Predictions
    predictPrice,
    predictRAM,
    predictBattery,
    predictBrand,

    // Advanced Models
    availableModels,
    selectedModel,
    currentModel,
    isLoadingModels,
    isLoadingPrediction,
    lastPrediction,
    processingTime,
    fetchAvailableModels,
    runAdvancedPrediction,
    compareModels,
    setSelectedModel,
    setSelectedCurrency,

    // Initialization
    initialize,
  };
};
