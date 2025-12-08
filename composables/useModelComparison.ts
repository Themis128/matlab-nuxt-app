/**
 * Model Comparison Composable
 * Provides utilities for comparing different ML models
 */

interface ModelData {
  id: string;
  name: string;
  brand: string;
  price: number;
  ram: number;
  battery: number;
  year: number;
  screen?: number;
  processor?: string;
  storage?: number;
}

export function useModelComparison() {
  // Reactive state
  const models = ref<ModelData[]>([]);
  const isLoading = ref(false);
  const maxModels = 4;

  // Computed properties to match expected interface
  const comparison = computed(() => ({
    models: models.value,
  }));

  const canAddMore = computed(() => models.value.length < maxModels);

  /**
   * Add a model to comparison
   */
  const addModel = (model: ModelData) => {
    // Check if model already exists
    const exists = models.value.some((m: ModelData) => m.id === model.id);
    if (exists) return;

    // Check max limit
    if (models.value.length >= maxModels) {
      // Remove first model if at limit
      models.value.shift();
    }

    models.value.push(model);
  };

  /**
   * Remove a model from comparison
   */
  const removeModel = (index: number) => {
    if (index >= 0 && index < models.value.length) {
      models.value.splice(index, 1);
    }
  };

  /**
   * Clear all compared models
   */
  const clearComparison = () => {
    models.value = [];
  };

  /**
   * Check if a model is in comparison
   */
  const isInComparison = (modelId: string): boolean => {
    return models.value.some((m: ModelData) => m.id === modelId);
  };

  /**
   * Get comparison data for charts
   */
  const getComparisonData = () => {
    return {
      models: models.value,
      metrics: ['price', 'ram', 'battery', 'year'] as const,
      data: models.value.map((model: ModelData) => ({
        name: model.name,
        price: model.price,
        ram: model.ram,
        battery: model.battery,
        year: model.year,
      })),
    };
  };

  /**
   * Navigate to comparison page
   */
  const navigateToComparison = () => {
    if (models.value.length > 0) {
      navigateTo('/compare');
    }
  };

  return {
    models: readonly(models),
    comparison: readonly(comparison),
    isLoading: readonly(isLoading),
    canAddMore,
    maxModels,
    addModel,
    removeModel,
    clearComparison,
    isInComparison,
    getComparisonData,
    navigateToComparison,
  };
}
