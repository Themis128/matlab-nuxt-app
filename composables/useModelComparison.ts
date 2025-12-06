/**
 * Nuxt 4 composable for model comparison functionality
 * Uses useState for shared state across components
 */
interface Model {
  id: string;
  name: string;
  brand: string;
  price: number;
  year: number;
  ram: number;
  battery: number;
  screen: number;
}

export const useModelComparison = () => {
  const modelsToCompare = useState<Model[]>('comparison-models', () => []);

  const { data, pending, error, refresh } = useFetch<{
    models: Model[];
    differences: Record<string, any>;
  }>('/api/dataset/compare', {
    method: 'POST',
    body: computed(() => ({ models: modelsToCompare.value })),
    watch: [modelsToCompare], // Auto-refetch when models change
    key: 'model-comparison',
    lazy: true, // Non-blocking
    default: () => ({ models: [], differences: {} }),
  });

  const addModel = (model: Model) => {
    // Limit to 3 models for comparison
    if (modelsToCompare.value.length < 3) {
      // Check if model already exists
      const exists = modelsToCompare.value.some((m) => m.id === model.id);
      if (!exists) {
        modelsToCompare.value.push(model);
      }
    }
  };

  const removeModel = (index: number) => {
    if (index >= 0 && index < modelsToCompare.value.length) {
      modelsToCompare.value.splice(index, 1);
    }
  };

  const clearComparison = () => {
    modelsToCompare.value = [];
  };

  const canAddMore = computed(() => modelsToCompare.value.length < 3);

  return {
    comparison: data,
    isLoading: pending,
    error,
    models: readonly(modelsToCompare),
    addModel,
    removeModel,
    clearComparison,
    canAddMore,
    refresh,
  };
};
