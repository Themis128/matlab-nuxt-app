<template>
  <div class="bg-background min-h-screen">
    <!-- Header Section -->
    <section class="bg-gradient-to-r from-green-600 to-teal-600 py-16 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="mb-4 text-4xl font-bold sm:text-5xl">A/B Testing Dashboard</h1>
          <p class="mx-auto max-w-2xl text-xl text-green-100">
            Design, monitor, and analyze A/B tests for model performance and user experience
            optimization
          </p>
        </div>
      </div>
    </section>

    <!-- A/B Testing Overview -->
    <section class="py-20">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Active Tests Overview -->
        <div class="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <UCard class="group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-lg bg-green-500 p-3 text-white">
                <UIcon name="i-heroicons-play" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Active Tests</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Currently Running</p>
              </div>
            </div>
            <div class="text-center">
              <div class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">8</div>
              <div class="text-sm text-green-600 dark:text-green-400">+2 this week</div>
            </div>
          </UCard>

          <UCard class="group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-lg bg-blue-500 p-3 text-white">
                <UIcon name="i-heroicons-chart-bar-square" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Total Tests</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">All Time</p>
              </div>
            </div>
            <div class="text-center">
              <div class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">47</div>
              <div class="text-sm text-blue-600 dark:text-blue-400">23 completed</div>
            </div>
          </UCard>

          <UCard class="group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-lg bg-purple-500 p-3 text-white">
                <UIcon name="i-heroicons-trophy" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Success Rate</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
              </div>
            </div>
            <div class="text-center">
              <div class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">73%</div>
              <div class="text-sm text-purple-600 dark:text-purple-400">Above target</div>
            </div>
          </UCard>
        </div>

        <!-- Current A/B Tests -->
        <div class="mb-16 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <div class="mb-8 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Current Experiments</h2>
            <UButton color="green">
              <UIcon name="i-heroicons-plus" class="mr-2 h-4 w-4" />
              New Test
            </UButton>
          </div>

          <div class="space-y-6">
            <UCard v-for="test in activeTests" :key="test.id" class="p-6">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ test.name }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300">{{ test.description }}</p>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold" :class="getStatusColor(test.status)">
                    {{ test.status }}
                  </div>
                  <div class="text-xs text-gray-500">{{ test.duration }}</div>
                </div>
              </div>

              <div class="mb-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Variant A (Control)
                  </h4>
                  <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <div class="mb-2 flex items-center justify-between">
                      <span class="text-sm text-gray-600 dark:text-gray-300">Current Model</span>
                      <span class="font-semibold">{{ test.variantA.conversion }}%</span>
                    </div>
                    <UProgress :value="test.variantA.conversion" color="blue" />
                    <div class="mt-1 text-xs text-gray-500">
                      {{ test.variantA.samples }} samples
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Variant B (Treatment)
                  </h4>
                  <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <div class="mb-2 flex items-center justify-between">
                      <span class="text-sm text-gray-600 dark:text-gray-300">New Model</span>
                      <span
                        class="font-semibold"
                        :class="
                          getConversionColor(test.variantB.conversion, test.variantA.conversion)
                        "
                      >
                        {{ test.variantB.conversion }}%
                      </span>
                    </div>
                    <UProgress :value="test.variantB.conversion" color="green" />
                    <div class="mt-1 text-xs text-gray-500">
                      {{ test.variantB.samples }} samples
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex gap-4">
                  <div class="text-sm">
                    <span class="text-gray-500">Statistical Significance:</span>
                    <span
                      class="ml-1 font-semibold"
                      :class="getSignificanceColor(test.significance)"
                    >
                      {{ test.significance }}%
                    </span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">Confidence Level:</span>
                    <span class="ml-1 font-semibold text-gray-900 dark:text-white"
                      >{{ test.confidence }}%</span
                    >
                  </div>
                </div>
                <UButton size="sm" variant="outline"> View Details </UButton>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Test Configuration -->
        <div
          class="mb-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 dark:from-gray-900/50 dark:to-gray-800/50"
        >
          <h2 class="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Create New A/B Test
          </h2>

          <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Test Configuration
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Test Name
                  </label>
                  <UInput v-model="newTest.name" placeholder="Enter test name..." />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <UTextarea
                    v-model="newTest.description"
                    placeholder="Describe the test objective..."
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Test Type
                  </label>
                  <USelect v-model="newTest.type" :options="testTypeOptions" />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Traffic Split
                  </label>
                  <div class="flex items-center gap-4">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Control</span>
                    <UProgress :value="50" class="flex-1" />
                    <span class="text-sm text-gray-600 dark:text-gray-300">Treatment</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Success Metrics
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Primary Metric
                  </label>
                  <USelect v-model="newTest.primaryMetric" :options="metricOptions" />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Minimum Detectable Effect
                  </label>
                  <UInput v-model="newTest.mde" type="number" placeholder="2.0" />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confidence Level
                  </label>
                  <USelect v-model="newTest.confidence" :options="confidenceOptions" />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Test Duration (days)
                  </label>
                  <UInput v-model="newTest.duration" type="number" placeholder="7" />
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-center">
            <UButton size="lg" color="green"> Launch Test </UButton>
          </div>
        </div>

        <!-- Historical Results -->
        <div class="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 class="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Test Results Summary
          </h2>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Test Name
                  </th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                    Duration
                  </th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                    Lift
                  </th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                    Confidence
                  </th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="result in testResults"
                  :key="result.id"
                  class="border-b border-gray-100 dark:border-gray-700"
                >
                  <td class="px-4 py-3">
                    <div class="font-medium text-gray-900 dark:text-white">{{ result.name }}</div>
                    <div class="text-xs text-gray-500">{{ result.type }}</div>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span :class="getStatusColor(result.status)" class="text-sm font-medium">
                      {{ result.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                    {{ result.duration }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span :class="getLiftColor(result.lift)" class="font-semibold">
                      {{ result.lift > 0 ? '+' : '' }}{{ result.lift }}%
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                    {{ result.confidence }}%
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span :class="getResultColor(result.result)" class="text-sm font-semibold">
                      {{ result.result }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

// Page meta
onMounted(() => {
  document.title = 'A/B Testing Dashboard - MATLAB Deep Learning Platform';
  const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  const content = 'Design, monitor, and analyze A/B tests for model performance and optimization';
  if (existing) existing.content = content;
  else {
    const m = document.createElement('meta');
    m.name = 'description';
    m.content = content;
    document.head.appendChild(m);
  }
});

// New test form
const newTest = reactive({
  name: '',
  description: '',
  type: 'model-comparison',
  primaryMetric: 'accuracy',
  mde: 2.0,
  confidence: 95,
  duration: 7,
});

// Options for selects
const testTypeOptions = [
  { label: 'Model Comparison', value: 'model-comparison' },
  { label: 'Feature Testing', value: 'feature-testing' },
  { label: 'Algorithm Optimization', value: 'algorithm-optimization' },
  { label: 'Data Processing', value: 'data-processing' },
];

const metricOptions = [
  { label: 'Accuracy', value: 'accuracy' },
  { label: 'Precision', value: 'precision' },
  { label: 'Recall', value: 'recall' },
  { label: 'F1 Score', value: 'f1-score' },
  { label: 'User Engagement', value: 'user-engagement' },
];

const confidenceOptions = [
  { label: '90%', value: 90 },
  { label: '95%', value: 95 },
  { label: '99%', value: 99 },
];

// Active tests data
const activeTests = ref([
  {
    id: 1,
    name: 'CNN vs Transformer Model',
    description: 'Comparing CNN and Transformer architectures for mobile dataset classification',
    status: 'Running',
    duration: '5 days',
    variantA: { conversion: 94.7, samples: 12500 },
    variantB: { conversion: 96.8, samples: 12300 },
    significance: 87,
    confidence: 95,
  },
  {
    id: 2,
    name: 'Learning Rate Optimization',
    description: 'Testing different learning rates for model convergence',
    status: 'Running',
    duration: '3 days',
    variantA: { conversion: 91.2, samples: 8200 },
    variantB: { conversion: 93.1, samples: 8100 },
    significance: 76,
    confidence: 90,
  },
  {
    id: 3,
    name: 'Data Augmentation Impact',
    description: 'Evaluating the effect of data augmentation on model performance',
    status: 'Completed',
    duration: '7 days',
    variantA: { conversion: 89.5, samples: 15000 },
    variantB: { conversion: 92.3, samples: 14800 },
    significance: 95,
    confidence: 95,
  },
]);

// Test results history
const testResults = ref([
  {
    id: 101,
    name: 'Batch Size Comparison',
    type: 'Hyperparameter',
    status: 'Completed',
    duration: '5 days',
    lift: 3.2,
    confidence: 94,
    result: 'Winner',
  },
  {
    id: 102,
    name: 'Feature Engineering',
    type: 'Preprocessing',
    status: 'Completed',
    duration: '10 days',
    lift: -1.1,
    confidence: 87,
    result: 'No Effect',
  },
]);

// Simple helper functions used by template
function getStatusColor(status: string) {
  if (status === 'Running') return 'text-green-600';
  if (status === 'Completed') return 'text-gray-600';
  return 'text-gray-500';
}

function getConversionColor(b: number, a: number) {
  return b > a ? 'text-green-600' : 'text-red-600';
}

function getLiftColor(lift: number) {
  return lift > 0 ? 'text-green-600' : 'text-red-600';
}

function getResultColor(result: string) {
  return result === 'Winner' ? 'text-green-600' : 'text-gray-600';
}

function getSignificanceColor(sig: number) {
  if (sig >= 95) return 'text-green-600';
  if (sig >= 80) return 'text-yellow-600';
  return 'text-red-600';
}
</script>
lift: -1.1, confidence: 87, result: 'No Effect' },
