import { defineStore } from 'pinia';

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

interface ModelComparisonResult {
  [key: string]: unknown;
}

export const useAdvancedModelsStore = defineStore('advancedModels', {
  state: () => ({
    availableModels: [] as AdvancedModel[],
    selectedModel: 'distilled',
    selectedCurrency: 'USD',
    isLoadingModels: false,
    isLoadingPrediction: false,
    lastPrediction: null as PredictionResult | null,
    predictionHistory: [] as PredictionResult[],
    processingTime: 0,
  }),

  getters: {
    /**
     * Get only available models
     */
    activeModels: (state) => {
      return state.availableModels.filter((model) => model.available);
    },

    /**
     * Group models by category
     */
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

    /**
     * Get current selected model details
     */
    currentModel: (state) => {
      return state.availableModels.find((model) => model.type === state.selectedModel);
    },

    /**
     * Available currencies
     */
    currencies: () => [
      { code: 'USD', symbol: '$', name: 'US Dollar' },
      { code: 'EUR', symbol: '€', name: 'Euro' },
      { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    ],

    /**
     * Get current currency details
     */
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
    /**
     * Fetch available models from API
     */
    async fetchAvailableModels() {
      if (this.isLoadingModels) return;

      this.isLoadingModels = true;
      try {
        const response = (await ($fetch as any)('/api/advanced/models')) as {
          models?: AdvancedModel[];
        };
        this.availableModels = response.models || [];

        // Set default model if current selection is not available
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
            component: 'advancedModelsStore',
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
    async runPrediction(request: AdvancedPredictionRequest): Promise<PredictionResult | null> {
      if (this.isLoadingPrediction) return null;

      this.isLoadingPrediction = true;
      const startTime = Date.now();

      try {
        const response = (await ($fetch as any)('/api/advanced/predict', {
          method: 'POST',
          body: request,
        })) as PredictionResult;

        this.processingTime = Date.now() - startTime;
        this.lastPrediction = response;
        this.predictionHistory.unshift(response);

        // Keep only last 10 predictions
        if (this.predictionHistory.length > 10) {
          this.predictionHistory = this.predictionHistory.slice(0, 10);
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
        this.isLoadingPrediction = false;
      }
    },

    /**
     * Compare multiple models
     */
    async compareModels(
      models: string[],
      request: Omit<AdvancedPredictionRequest, 'modelType'>
    ): Promise<ModelComparisonResult | null> {
      if (this.isLoadingPrediction || models.length === 0) return null;

      this.isLoadingPrediction = true;
      const startTime = Date.now();

      try {
        const response = (await ($fetch as any)('/api/advanced/compare', {
          method: 'POST',
          body: {
            models,
            ...request,
          },
        })) as ModelComparisonResult;

        this.processingTime = Date.now() - startTime;

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
     * Clear prediction history
     */
    clearHistory() {
      this.predictionHistory = [];
      this.lastPrediction = null;
    },

    /**
     * Initialize store
     */
    async initialize() {
      await this.fetchAvailableModels();
    },
  },

  persist: {
    key: 'advanced-models-store',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    paths: ['selectedModel', 'selectedCurrency', 'predictionHistory', 'lastPrediction'],
  },
});
