<template>
  <DPageLayout
    :show-hero="true"
    title="ML Model Comparison"
    description="Compare and analyze different machine learning models for mobile dataset performance"
    bg="base-200"
  >
    <template #hero-actions>
      <span class="badge badge-info badge-lg mb-4">
        <Icon name="heroicons:cpu-chip" class="h-3 w-3" />
        Machine Learning
      </span>
    </template>

    <!-- Enhanced Model Comparison Dashboard -->
    <ModernSection
      title="Select Models to Compare"
      description="Choose models to analyze and compare their performance metrics"
    >
      <!-- Model Selection Cards -->
      <div class="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <template v-for="model in models" :key="model.id">
          <ModernCard
            hover-color="blue"
            class="cursor-pointer transition-all duration-300"
            :class="[selectedModel === model.id ? 'bg-primary/20 ring-2 ring-primary' : '']"
            @click="selectModel(model.id)"
          >
            <div class="text-center">
              <div
                class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg"
                :class="model.color"
              >
                <Icon :name="model.icon" class="h-7 w-7 text-white" />
              </div>
              <h3 class="mb-2 text-xl font-bold text-base-content">
                {{ model.name }}
              </h3>
              <p class="mb-4 text-sm leading-relaxed opacity-70">
                {{ model.description }}
              </p>
              <div class="space-y-3 rounded-lg bg-base-200 p-3">
                <div class="flex justify-between text-sm">
                  <span class="font-medium opacity-70">Accuracy</span>
                  <span
                    class="font-bold"
                    :class="model.accuracy > 90 ? 'text-success' : 'text-warning'"
                  >
                    {{ model.accuracy }}%
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="font-medium opacity-70">Training Time</span>
                  <span class="font-bold text-info">{{ model.trainingTime }}</span>
                </div>
              </div>
            </div>
          </ModernCard>
        </template>
      </div>

      <!-- Detailed Comparison Section -->
      <div class="mb-16 rounded-2xl bg-base-100 p-8 shadow-lg">
        <h2 class="mb-8 text-center text-2xl font-bold text-base-content">
          Model Performance Comparison
        </h2>

        <div class="overflow-x-auto">
          <table class="table w-full text-sm">
            <thead>
              <tr class="border-b border-base-300">
                <th class="px-4 py-3 text-left font-semibold text-base-content">Metric</th>
                <th v-for="model in selectedModels" :key="model.id" class="px-4 py-3 text-center">
                  <div class="font-semibold text-base-content">
                    {{ model.name }}
                  </div>
                  <div class="text-xs opacity-70">
                    {{ model.type }}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="metric in comparisonMetrics"
                :key="metric.key"
                class="border-b border-base-300"
              >
                <td class="px-4 py-3 font-medium text-base-content">
                  {{ metric.label }}
                </td>
                <td v-for="model in selectedModels" :key="model.id" class="px-4 py-3 text-center">
                  <span :class="getMetricClass(getMetricValue(model, metric.key), metric.type)">
                    {{ formatMetric(getMetricValue(model, metric.key), metric.type) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Visual Comparison Charts -->
      <div class="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DCard class="p-6">
          <h3 class="mb-4 text-lg font-semibold text-base-content">Accuracy Comparison</h3>
          <div class="space-y-3">
            <div v-for="model in selectedModels" :key="model.id" class="flex items-center gap-3">
              <div class="w-20 text-sm font-medium opacity-70">
                {{ model.name }}
              </div>
              <div class="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="model.color.replace('bg-', 'bg-')"
                  :style="{ width: `${model.accuracy}%` }"
                />
              </div>
              <div class="w-12 text-right text-sm font-semibold text-base-content">
                {{ model.accuracy }}%
              </div>
            </div>
          </div>
        </DCard>

        <DCard class="p-6">
          <h3 class="mb-4 text-lg font-semibold text-base-content">Training Time Comparison</h3>
          <div class="space-y-3">
            <div v-for="model in selectedModels" :key="model.id" class="flex items-center gap-3">
              <div class="w-20 text-sm font-medium opacity-70">
                {{ model.name }}
              </div>
              <div class="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="model.color.replace('bg-', 'bg-')"
                  :style="{ width: `${(model.trainingTimeMinutes / maxTrainingTime) * 100}%` }"
                />
              </div>
              <div class="w-16 text-right text-sm font-semibold text-base-content">
                {{ model.trainingTimeMinutes }}m
              </div>
            </div>
          </div>
        </DCard>
      </div>

      <!-- Model Recommendations -->
      <div
        class="rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 p-8 dark:from-green-900/20 dark:to-blue-900/20"
      >
        <h2 class="mb-6 text-center text-2xl font-bold text-base-content">Recommended Models</h2>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <template v-for="recommendation in recommendations" :key="recommendation.id">
            <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <div class="text-center">
                <div
                  class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  :class="recommendation.badgeColor"
                >
                  <Icon :name="recommendation.icon" class="h-8 w-8 text-white" />
                </div>
                <h3 class="mb-2 text-lg font-semibold text-base-content">
                  {{ recommendation.title }}
                </h3>
                <p class="mb-4 text-sm opacity-70">
                  {{ recommendation.description }}
                </p>
                <div class="space-y-2">
                  <div class="text-sm">
                    <span class="opacity-70">Best for:</span>
                    <span class="ml-1 font-semibold text-base-content">{{
                      recommendation.bestFor
                    }}</span>
                  </div>
                  <div class="text-sm">
                    <span class="opacity-70">Accuracy:</span>
                    <span class="ml-1 font-semibold text-green-600"
                      >{{ recommendation.accuracy }}%</span
                    >
                  </div>
                </div>
                <DButton
                  size="sm"
                  variant="success"
                  class="mt-4 w-full"
                  @click="tryModel(recommendation)"
                >
                  Try Model
                </DButton>
              </div>
            </div>
          </template>
        </div>
      </div>
    </ModernSection>
  </DPageLayout>
</template>

<script setup lang="ts">
// Page metadata
definePageMeta({
  layout: 'dashboard',
});

import { ref, computed, onMounted } from 'vue';
// Page meta (fallback)
onMounted(() => {
  document.title = 'ML Model Comparison - MATLAB Deep Learning Platform';
  const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  const content =
    'Compare machine learning models for mobile dataset analysis with performance metrics and recommendations';
  if (existing) existing.content = content;
  else {
    const m = document.createElement('meta');
    m.name = 'description';
    m.content = content;
    document.head.appendChild(m);
  }
});

// Model interface
interface Model {
  id: string;
  name: string;
  type: string;
  description: string;
  accuracy: number;
  trainingTime: string;
  trainingTimeMinutes: number;
  color: string;
  icon: string;
  precision: number;
  recall: number;
  f1Score: number;
  loss: number;
  inferenceTime: string;
}

// Available models
const models = ref<Model[]>([
  {
    id: 'cnn',
    name: 'CNN',
    type: 'Convolutional Neural Network',
    description: 'Best for image recognition and spatial data',
    accuracy: 94.7,
    trainingTime: '2.3 hrs',
    trainingTimeMinutes: 138,
    color: 'bg-purple-500',
    icon: 'i-heroicons-cpu-chip',
    precision: 0.947,
    recall: 0.932,
    f1Score: 0.939,
    loss: 0.156,
    inferenceTime: '45ms',
  },
  {
    id: 'lstm',
    name: 'LSTM',
    type: 'Long Short-Term Memory',
    description: 'Excellent for sequential data and time series',
    accuracy: 91.2,
    trainingTime: '3.1 hrs',
    trainingTimeMinutes: 186,
    color: 'bg-blue-500',
    icon: 'i-heroicons-chart-bar',
    precision: 0.912,
    recall: 0.908,
    f1Score: 0.91,
    loss: 0.234,
    inferenceTime: '67ms',
  },
  {
    id: 'transformer',
    name: 'Transformer',
    type: 'Attention-based Model',
    description: 'State-of-the-art for complex patterns',
    accuracy: 96.8,
    trainingTime: '4.7 hrs',
    trainingTimeMinutes: 282,
    color: 'bg-green-500',
    icon: 'i-heroicons-sparkles',
    precision: 0.968,
    recall: 0.961,
    f1Score: 0.964,
    loss: 0.089,
    inferenceTime: '78ms',
  },
  {
    id: 'ensemble',
    name: 'Ensemble',
    type: 'Combined Models',
    description: 'Combination of multiple algorithms',
    accuracy: 97.3,
    trainingTime: '6.2 hrs',
    trainingTimeMinutes: 372,
    color: 'bg-orange-500',
    icon: 'i-heroicons-squares-plus',
    precision: 0.973,
    recall: 0.969,
    f1Score: 0.971,
    loss: 0.067,
    inferenceTime: '123ms',
  },
]);

// Selected models for comparison
const selectedModel = ref('cnn');
const selectedModels = computed(() =>
  models.value.filter((m: Model) => selectedModel.value === m.id)
);

// Comparison metrics
const comparisonMetrics = [
  { key: 'accuracy', label: 'Accuracy (%)', type: 'percentage' },
  { key: 'precision', label: 'Precision', type: 'decimal' },
  { key: 'recall', label: 'Recall', type: 'decimal' },
  { key: 'f1Score', label: 'F1 Score', type: 'decimal' },
  { key: 'loss', label: 'Loss', type: 'decimal' },
  { key: 'inferenceTime', label: 'Inference Time', type: 'time' },
];

// Recommendations
const recommendations = ref([
  {
    id: 'beginner',
    title: 'Best for Beginners',
    description: 'Easy to implement and understand',
    bestFor: 'Starting out with ML',
    accuracy: 91.2,
    icon: 'i-heroicons-academic-cap',
    badgeColor: 'bg-blue-500',
  },
  {
    id: 'performance',
    title: 'Highest Performance',
    description: 'Maximum accuracy and reliability',
    bestFor: 'Production systems',
    accuracy: 97.3,
    icon: 'i-heroicons-trophy',
    badgeColor: 'bg-yellow-500',
  },
  {
    id: 'balance',
    title: 'Best Balance',
    description: 'Good performance with reasonable speed',
    bestFor: 'Real-time applications',
    accuracy: 94.7,
    icon: 'i-heroicons-scale',
    badgeColor: 'bg-green-500',
  },
]);

// Computed values
const maxTrainingTime = computed(() =>
  Math.max(...models.value.map((m: Model) => m.trainingTimeMinutes))
);

// Methods
const selectModel = (modelId: string) => {
  selectedModel.value = modelId;
};

const getMetricClass = (value: number | string, type: string) => {
  if (type === 'time') return 'text-base-content font-semibold';
  if (type === 'percentage') {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num > 95
      ? 'text-green-600 font-semibold'
      : num > 90
        ? 'text-blue-600 font-semibold'
        : 'text-yellow-600 font-semibold';
  }
  return 'text-base-content font-semibold';
};

const formatMetric = (value: number | string, type: string) => {
  if (type === 'percentage') return `${value}%`;
  if (type === 'decimal') return typeof value === 'number' ? value.toFixed(3) : value;
  if (type === 'time') return value;
  return value.toString();
};

const tryModel = (recommendation: any) => {
  navigateTo(`/ai-demo?model=${recommendation.id}`);
};

const getMetricValue = (model: Model, metricKey: string): number | string => {
  return (model as any)[metricKey];
};
</script>

<style scoped>
/* Additional styles can be added here if needed */
</style>
