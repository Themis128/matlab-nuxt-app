<template>
  <div class="bg-background min-h-screen">
    <!-- Header Section -->
    <section class="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="mb-4 text-4xl font-bold sm:text-5xl">Model Showcase</h1>
          <p class="mx-auto max-w-2xl text-xl text-indigo-100">
            Explore and interact with our collection of machine learning models trained on mobile
            datasets
          </p>
        </div>
      </div>
    </section>

    <!-- Featured Models -->
    <section class="py-20">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Model Categories -->
        <div class="mb-16 flex flex-wrap justify-center gap-4">
          <UButton
            v-for="category in categories"
            :key="category.id"
            :color="selectedCategory === category.id ? 'purple' : 'gray'"
            variant="outline"
            @click="selectedCategory = category.id"
          >
            <UIcon :name="category.icon" class="mr-2 h-4 w-4" />
            {{ category.name }}
          </UButton>
        </div>

        <!-- Models Grid -->
        <div class="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="model in filteredModels"
            :key="model.id"
            class="group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            @click="selectModel(model)"
          >
            <div class="relative">
              <div
                class="mb-4 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
              >
                <img
                  :src="model.previewImage"
                  :alt="model.name"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <UButton color="white" variant="solid" size="sm">
                    <UIcon name="i-heroicons-play" class="mr-2 h-4 w-4" />
                    Demo
                  </UButton>
                </div>
              </div>

              <div class="mb-3 flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg"
                  :style="{ backgroundColor: model.color }"
                >
                  <UIcon :name="model.icon" class="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ model.name }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ model.category }}</p>
                </div>
              </div>

              <p class="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                {{ model.description }}
              </p>

              <div class="mb-4 grid grid-cols-2 gap-4">
                <div class="text-center">
                  <div class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ model.accuracy }}%
                  </div>
                  <div class="text-xs text-gray-500">Accuracy</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ model.inferenceTime }}ms
                  </div>
                  <div class="text-xs text-gray-500">Inference</div>
                </div>
              </div>

              <div class="flex gap-2">
                <UButton
                  size="sm"
                  color="purple"
                  variant="outline"
                  class="flex-1"
                  @click="selectModel(model)"
                  >Try Model</UButton
                >
                <UButton size="sm" variant="outline">
                  <UIcon name="i-heroicons-code-bracket" class="h-4 w-4" />
                </UButton>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Interactive Demo Section -->
        <div v-if="selectedModel" class="mb-16 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <div class="mb-6 flex items-center gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-lg"
              :style="{ backgroundColor: selectedModel.color }"
            >
              <UIcon :name="selectedModel.icon" class="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ selectedModel.name }} Demo
              </h2>
              <p class="text-gray-600 dark:text-gray-300">{{ selectedModel.description }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Input Data</h3>
              <div class="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Mobile Dataset Sample</label
                >
                <UTextarea
                  v-model="demoInput"
                  placeholder="Enter sample mobile dataset features..."
                  :rows="6"
                />
              </div>
              <UButton color="purple" @click="runDemo" :loading="isRunning">
                <UIcon name="i-heroicons-play" class="mr-2 h-4 w-4" />
                Run Prediction
              </UButton>
            </div>

            <div>
              <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Results</h3>
              <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <div v-if="demoResult" class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600 dark:text-gray-300">Prediction</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{
                      demoResult.prediction
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600 dark:text-gray-300">Confidence</span>
                    <span class="font-semibold text-green-600">{{ demoResult.confidence }}%</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600 dark:text-gray-300">Processing Time</span>
                    <span class="font-semibold text-blue-600"
                      >{{ demoResult.processingTime }}ms</span
                    >
                  </div>
                  <div>
                    <div class="mb-2 text-sm text-gray-600 dark:text-gray-300">
                      Class Probabilities
                    </div>
                    <div class="space-y-2">
                      <div
                        v-for="prob in demoResult.probabilities"
                        :key="prob.class"
                        class="flex items-center justify-between"
                      >
                        <span class="text-sm text-gray-600 dark:text-gray-300">{{
                          prob.class
                        }}</span>
                        <div class="flex items-center gap-2">
                          <div class="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-600">
                            <div
                              class="h-2 rounded-full transition-all duration-500"
                              :style="{
                                width: `${prob.probability * 100}%`,
                                backgroundColor: selectedModel.color,
                              }"
                            ></div>
                          </div>
                          <span class="w-12 text-sm font-semibold text-gray-900 dark:text-white"
                            >{{ (prob.probability * 100).toFixed(1) }}%</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="py-8 text-center text-gray-500 dark:text-gray-400">
                  <UIcon
                    name="i-heroicons-chart-bar-square"
                    class="mx-auto mb-2 h-12 w-12 opacity-50"
                  />
                  <p>Run a prediction to see results</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Model Performance Comparison -->
        <div
          class="mb-16 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 p-8 dark:from-purple-900/20 dark:to-indigo-900/20"
        >
          <h2 class="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Model Performance Comparison
          </h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <UCard v-for="stat in performanceStats" :key="stat.id" class="p-6 text-center">
              <div
                class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                :style="{ backgroundColor: stat.color }"
              >
                <UIcon :name="stat.icon" class="h-6 w-6 text-white" />
              </div>
              <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {{ stat.title }}
              </h3>
              <div class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                {{ stat.value }}
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300">{{ stat.description }}</p>
            </UCard>
          </div>
        </div>

        <!-- Model Details Modal -->
        <UModal v-model="showModelDetails" :ui="{ width: 'max-w-4xl' }">
          <UCard>
            <template #header>
              <div class="flex items-center gap-4">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-lg"
                  :style="{ backgroundColor: selectedModel?.color }"
                >
                  <UIcon :name="selectedModel?.icon" class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ selectedModel?.name }}
                  </h2>
                  <p class="text-gray-600 dark:text-gray-300">{{ selectedModel?.category }}</p>
                </div>
              </div>
            </template>

            <div class="space-y-6">
              <div>
                <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Model Architecture
                </h3>
                <p class="text-gray-600 dark:text-gray-300">{{ selectedModel?.longDescription }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div
                  v-for="metric in selectedModel?.metrics"
                  :key="metric.name"
                  class="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700"
                >
                  <div class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ metric.value }}
                  </div>
                  <div class="text-sm text-gray-500">{{ metric.name }}</div>
                </div>
              </div>

              <div>
                <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Use Cases</h3>
                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="useCase in selectedModel?.useCases"
                    :key="useCase"
                    color="purple"
                    variant="soft"
                  >
                    {{ useCase }}
                  </UBadge>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="flex gap-3">
                <UButton color="purple" class="flex-1"> Deploy Model </UButton>
                <UButton variant="outline"> Download </UButton>
              </div>
            </template>
          </UCard>
        </UModal>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const categories = ref([
  { id: 'all', name: 'All Models', icon: 'i-heroicons-squares-2x2' },
  { id: 'classification', name: 'Classification', icon: 'i-heroicons-tag' },
  { id: 'regression', name: 'Regression', icon: 'i-heroicons-chart-bar' },
  { id: 'clustering', name: 'Clustering', icon: 'i-heroicons-squares-2x2' },
  { id: 'nlp', name: 'NLP', icon: 'i-heroicons-chat-bubble-left-right' },
  { id: 'computer-vision', name: 'Computer Vision', icon: 'i-heroicons-eye' },
]);

const selectedCategory = ref('all');

const models = ref([
  {
    id: 1,
    name: 'MobileNet CNN',
    category: 'Computer Vision',
    categoryId: 'computer-vision',
    description: 'Optimized CNN for mobile device classification and feature recognition',
    longDescription:
      'MobileNet CNN is specifically designed for efficient inference on mobile devices while maintaining high accuracy for mobile classification tasks.',
    accuracy: 94.7,
    inferenceTime: 45,
    color: '#8B5CF6',
    icon: 'i-heroicons-cpu-chip',
    previewImage: '/mobile_images/default-phone.png',
    useCases: ['Device Classification', 'Feature Recognition', 'Image Processing'],
    metrics: [
      { name: 'Parameters', value: '4.2M' },
      { name: 'FLOPs', value: '567M' },
      { name: 'Input Size', value: '224x224' },
      { name: 'Classes', value: '10' },
    ],
  },
  {
    id: 2,
    name: 'LSTM Sentiment Analyzer',
    category: 'NLP',
    categoryId: 'nlp',
    description: 'LSTM-based model for analyzing user reviews and feedback from mobile app stores',
    longDescription:
      'Long Short-Term Memory network trained on mobile app reviews to classify sentiment and extract insights.',
    accuracy: 91.2,
    inferenceTime: 67,
    color: '#3B82F6',
    icon: 'i-heroicons-chat-bubble-left-right',
    previewImage: '/mobile_images/default-phone.png',
    useCases: ['Sentiment Analysis', 'Review Classification', 'User Feedback'],
    metrics: [
      { name: 'Hidden Units', value: '256' },
      { name: 'Embedding Dim', value: '128' },
      { name: 'Vocab Size', value: '50K' },
      { name: 'Classes', value: '3' },
    ],
  },
  {
    id: 3,
    name: 'Random Forest Regressor',
    category: 'Regression',
    categoryId: 'regression',
    description: 'Ensemble model for predicting mobile device prices based on specifications',
    longDescription:
      'Random Forest ensemble method for robust price prediction with interpretable feature importance.',
    accuracy: 89.5,
    inferenceTime: 12,
    color: '#10B981',
    icon: 'i-heroicons-chart-bar',
    previewImage: '/mobile_images/default-phone.png',
    useCases: ['Price Prediction', 'Market Analysis', 'Feature Importance'],
    metrics: [
      { name: 'Trees', value: '100' },
      { name: 'Max Depth', value: '15' },
      { name: 'Features', value: '24' },
      { name: 'R² Score', value: '0.89' },
    ],
  },
  {
    id: 4,
    name: 'K-Means Clustering',
    category: 'Clustering',
    categoryId: 'clustering',
    description: 'Unsupervised learning to discover patterns and group similar mobile devices',
    longDescription:
      'K-Means clustering algorithm to discover natural groupings in mobile device characteristics.',
    accuracy: 87.3,
    inferenceTime: 23,
    color: '#F59E0B',
    icon: 'i-heroicons-squares-2x2',
    previewImage: '/mobile_images/default-phone.png',
    useCases: ['Market Segmentation', 'Pattern Discovery', 'Device Grouping'],
    metrics: [
      { name: 'Clusters', value: '8' },
      { name: 'Features', value: '15' },
      { name: 'Silhouette Score', value: '0.73' },
      { name: 'Iterations', value: '50' },
    ],
  },
  {
    id: 5,
    name: 'Transformer Classifier',
    category: 'Classification',
    categoryId: 'classification',
    description: 'State-of-the-art transformer for multi-class mobile app category classification',
    longDescription:
      'Transformer-based encoder for sophisticated mobile app category classification with attention mechanisms.',
    accuracy: 96.8,
    inferenceTime: 78,
    color: '#EF4444',
    icon: 'i-heroicons-sparkles',
    previewImage: '/mobile_images/default-phone.png',
    useCases: ['App Classification', 'Category Prediction', 'Content Analysis'],
    metrics: [
      { name: 'Layers', value: '12' },
      { name: 'Attention Heads', value: '12' },
      { name: 'Embedding Dim', value: '768' },
    ],
  },
]);

const filteredModels = computed(() => {
  if (selectedCategory.value === 'all') return models.value;
  return models.value.filter((model) => model.categoryId === selectedCategory.value);
});

const selectedModel = ref<any>(null);

function selectModel(model: any) {
  selectedModel.value = model;
  showModelDetails.value = true;
}

const demoInput = ref('');

const isRunning = ref(false);

const demoResult = ref<any>(null);

async function runDemo() {
  isRunning.value = true;
  // Simulate API call
  setTimeout(() => {
    demoResult.value = {
      prediction: 'Premium Smartphone',
      confidence: 92.5,
      processingTime: 45,
      probabilities: [
        { class: 'Budget', probability: 0.02 },
        { class: 'Mid-range', probability: 0.15 },
        { class: 'Premium', probability: 0.83 },
      ],
    };
    isRunning.value = false;
  }, 1000);
}

const performanceStats = ref([
  {
    id: 'accuracy',
    title: 'Highest Accuracy',
    value: '96.8%',
    description: 'Transformer Classifier',
    color: '#EF4444',
    icon: 'i-heroicons-sparkles',
  },
  {
    id: 'speed',
    title: 'Fastest Inference',
    value: '12ms',
    description: 'Random Forest',
    color: '#10B981',
    icon: 'i-heroicons-bolt',
  },
  {
    id: 'models',
    title: 'Total Models',
    value: '5',
    description: 'Across all categories',
    color: '#8B5CF6',
    icon: 'i-heroicons-squares-2x2',
  },
  {
    id: 'categories',
    title: 'Categories',
    value: '6',
    description: 'ML techniques covered',
    color: '#3B82F6',
    icon: 'i-heroicons-tag',
  },
]);

const showModelDetails = ref(false);
</script>
