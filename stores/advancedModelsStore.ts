import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface AdvancedModel {
  type: string;
  name: string;
  description: string;
  available: boolean;
  category: string;
  accuracy?: number;
}

export interface PredictionResult {
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

export const useAdvancedModelsStore = defineStore('advancedModels', () => {
  // State
  const availableModels = ref<AdvancedModel[]>([]);
  const selectedModel = ref<string>('distilled');
  const selectedCurrency = ref<string>('USD');
  const isLoadingModels = ref(false);
  const isLoadingPrediction = ref(false);
  const lastPrediction = ref<PredictionResult | null>(null);
  const predictionHistory = ref<PredictionResult[]>([]);
  const processingTime = ref<number>(0);

  // Getters
  const activeModels = computed(() => availableModels.value.filter((model) => model.available));

  const modelCategories = computed(() => {
    const categories: Record<string, AdvancedModel[]> = {};
    availableModels.value.forEach((model) => {
      if (!categories[model.category]) {
        categories[model.category] = [];
      }
      categories[model.category]!.push(model);
    });
    return categories;
  });

  const currentModel = computed(() =>
    availableModels.value.find((model) => model.type === selectedModel.value)
  );

  const currencies = computed(() => [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  ]);

  const currentCurrency = computed(() =>
    currencies.value.find((currency) => currency.code === selectedCurrency.value)
  );

  // Actions
  async function fetchAvailableModels() {
    if (isLoadingModels.value) return;

    isLoadingModels.value = true;
    try {
      const response = await $fetch('/api/advanced/models');
      availableModels.value = response.models || [];

      // Set default model if current selection is not available
      if (!availableModels.value.find((model) => model.type === selectedModel.value)) {
        const firstAvailable = availableModels.value.find((model) => model.available);
        if (firstAvailable) {
          selectedModel.value = firstAvailable.type;
        }
      }
    } catch (error) {
      const logger = useSentryLogger();
      logger.logError(
        'Failed to fetch available models',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'advancedModelsStore',
          action: 'fetchAvailableModels',
        }
      );
      // Fallback to hardcoded models
      availableModels.value = [
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
      isLoadingModels.value = false;
    }
  }

  async function runPrediction(
    request: AdvancedPredictionRequest
  ): Promise<PredictionResult | null> {
    if (isLoadingPrediction.value) return null;

    isLoadingPrediction.value = true;
    const startTime = Date.now();

    try {
      const response = await $fetch('/api/advanced/predict', {
        method: 'POST',
        body: request,
      });

      processingTime.value = Date.now() - startTime;
      lastPrediction.value = response;
      predictionHistory.value.unshift(response);

      // Keep only last 10 predictions
      if (predictionHistory.value.length > 10) {
        predictionHistory.value = predictionHistory.value.slice(0, 10);
      }

      return response;
    } catch (error) {
      const logger = useSentryLogger();
      logger.logError(
        'Advanced prediction failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'advancedModelsStore',
          action: 'predictPrice',
        }
      );
      throw error;
    } finally {
      isLoadingPrediction.value = false;
    }
  }

  async function compareModels(
    models: string[],
    request: Omit<AdvancedPredictionRequest, 'modelType'>
  ): Promise<any> {
    if (isLoadingPrediction.value || models.length === 0) return null;

    isLoadingPrediction.value = true;
    const startTime = Date.now();

    try {
      const response = await $fetch('/api/advanced/compare', {
        method: 'POST',
        body: {
          models,
          ...request,
        },
      });

      processingTime.value = Date.now() - startTime;

      return response;
    } catch (error) {
      const logger = useSentryLogger();
      logger.logError(
        'Model comparison failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          component: 'advancedModelsStore',
          action: 'compareModels',
        }
      );
      throw error;
    } finally {
      isLoadingPrediction.value = false;
    }
  }

  function setSelectedModel(modelType: string) {
    selectedModel.value = modelType;
  }

  function setSelectedCurrency(currency: string) {
    selectedCurrency.value = currency;
  }

  function clearHistory() {
    predictionHistory.value = [];
    lastPrediction.value = null;
  }

  // Initialize store
  async function initialize() {
    await fetchAvailableModels();
  }

  return {
    // State
    availableModels,
    selectedModel,
    selectedCurrency,
    isLoadingModels,
    isLoadingPrediction,
    lastPrediction,
    predictionHistory,
    processingTime,

    // Getters
    activeModels,
    modelCategories,
    currentModel,
    currencies,
    currentCurrency,

    // Actions
    fetchAvailableModels,
    runPrediction,
    compareModels,
    setSelectedModel,
    setSelectedCurrency,
    clearHistory,
    initialize,
  };
});
