<template>
  <div class="min-h-screen bg-background">
    <section
      class="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 py-16"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6"
          >
            <UIcon name="i-heroicons-funnel" class="w-4 h-4" />
            Advanced Search
          </div>
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Perfect
            <span class="text-purple-600 dark:text-purple-400">Analytics Model</span>
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Search through our comprehensive database of MATLAB deep learning models with advanced
            filters.
          </p>
        </div>

        <div class="max-w-4xl mx-auto">
          <UCard class="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div class="space-y-6">
              <div class="relative">
                <UIcon
                  name="i-heroicons-magnifying-glass"
                  class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                />
                <UInput
                  v-model="searchQuery"
                  placeholder="Search models by name, algorithm..."
                  size="lg"
                  class="pl-12"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <USelect
                  v-model="selectedAlgorithm"
                  placeholder="Algorithm"
                  :options="algorithms"
                />
                <USelect
                  v-model="selectedDataset"
                  placeholder="Dataset Type"
                  :options="datasetTypes"
                />
                <USelect
                  v-model="selectedAccuracy"
                  placeholder="Min Accuracy"
                  :options="accuracyRanges"
                />
              </div>

              <div class="flex justify-center">
                <UButton size="lg" color="purple" variant="solid" class="font-semibold">
                  <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 mr-2" />
                  Search Models
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <section class="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Search Results</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">24 models found</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UCard
            v-for="model in models"
            :key="model.id"
            class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-start gap-4">
              <div class="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <UIcon
                  name="i-heroicons-cpu-chip"
                  class="w-6 h-6 text-purple-600 dark:text-purple-400"
                />
              </div>
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      {{ model.name }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ model.algorithm }}</p>
                  </div>
                  <UBadge :color="model.accuracy > 90 ? 'green' : 'yellow'" variant="soft">
                    {{ model.accuracy }}% Accuracy
                  </UBadge>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-4">{{ model.description }}</p>
                <div class="flex gap-2">
                  <UButton size="sm" color="purple" variant="outline">View Details</UButton>
                  <UButton size="sm" variant="ghost">Compare</UButton>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

onMounted(() => {
  document.title = 'Advanced Search - MATLAB Analytics';
  const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  const content = 'Search and filter through comprehensive MATLAB deep learning models';
  if (existing) existing.content = content;
  else {
    const m = document.createElement('meta');
    m.name = 'description';
    m.content = content;
    document.head.appendChild(m);
  }
});

const searchQuery = ref('');
const selectedAlgorithm = ref('');
const selectedDataset = ref('');
const selectedAccuracy = ref('');

const algorithms = [
  { label: 'CNN', value: 'cnn' },
  { label: 'RNN/LSTM', value: 'rnn' },
  { label: 'Transformer', value: 'transformer' },
];

const datasetTypes = [
  { label: 'Image Classification', value: 'image' },
  { label: 'Time Series', value: 'time-series' },
  { label: 'Text/NLP', value: 'text' },
];

const accuracyRanges = [
  { label: '90%+', value: '90' },
  { label: '80-89%', value: '80' },
  { label: 'Any', value: 'any' },
];

const models = [
  {
    id: 1,
    name: 'MobileNetV3-Large',
    algorithm: 'CNN',
    accuracy: 94.7,
    description: 'Efficient convolutional neural network optimized for mobile devices.',
  },
  {
    id: 2,
    name: 'LSTM Time Series Predictor',
    algorithm: 'RNN',
    accuracy: 91.2,
    description: 'Long Short-Term Memory network for time series forecasting.',
  },
];
</script>
