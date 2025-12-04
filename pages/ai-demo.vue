<template>
  <div class="min-h-screen bg-background">
    <!-- Hero Section -->
    <section
      class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 py-16"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6"
          >
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
            AI Predictions Demo
          </div>
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Experience AI-Powered
            <span class="text-purple-600 dark:text-purple-400">Phone Predictions</span>
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            See our advanced MATLAB deep learning models in action. Upload phone specifications and
            get instant predictions on performance, pricing, and market trends.
          </p>
        </div>

        <!-- Demo Interface -->
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Input Panel -->
            <UCard class="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <template #header>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Input Specifications
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Enter phone details for AI analysis
                </p>
              </template>

              <div class="space-y-6">
                <!-- Basic Info -->
                <div class="grid grid-cols-2 gap-4">
                  <UFormGroup label="Brand">
                    <USelect
                      v-model="demoData.brand"
                      placeholder="Select brand"
                      :options="brands"
                      option-attribute="label"
                      value-attribute="value"
                    />
                  </UFormGroup>
                  <UFormGroup label="Model Name">
                    <UInput v-model="demoData.modelName" placeholder="e.g., Galaxy S24" />
                  </UFormGroup>
                </div>

                <!-- Technical Specs -->
                <div class="grid grid-cols-2 gap-4">
                  <UFormGroup label="Display Size (inches)">
                    <UInput
                      v-model="demoData.displaySize"
                      type="number"
                      step="0.1"
                      placeholder="6.1"
                    />
                  </UFormGroup>
                  <UFormGroup label="RAM (GB)">
                    <USelect
                      v-model="demoData.ram"
                      :options="ramOptions"
                      option-attribute="label"
                      value-attribute="value"
                    />
                  </UFormGroup>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <UFormGroup label="Storage (GB)">
                    <USelect
                      v-model="demoData.storage"
                      :options="storageOptions"
                      option-attribute="label"
                      value-attribute="value"
                    />
                  </UFormGroup>
                  <UFormGroup label="Main Camera (MP)">
                    <UInput v-model="demoData.mainCamera" type="number" placeholder="50" />
                  </UFormGroup>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <UFormGroup label="Battery (mAh)">
                    <UInput v-model="demoData.battery" type="number" placeholder="4000" />
                  </UFormGroup>
                  <UFormGroup label="Processor">
                    <USelect
                      v-model="demoData.processor"
                      placeholder="Select processor"
                      :options="processors"
                      option-attribute="label"
                      value-attribute="value"
                    />
                  </UFormGroup>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                  <UButton
                    color="purple"
                    variant="solid"
                    class="flex-1"
                    :loading="isPredicting"
                    @click="runPrediction"
                  >
                    <UIcon name="i-heroicons-sparkles" class="w-5 h-5 mr-2" />
                    {{ isPredicting ? 'Analyzing...' : 'Run AI Prediction' }}
                  </UButton>
                  <UButton variant="outline" @click="resetForm">
                    <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 mr-2" />
                    Reset
                  </UButton>
                </div>
              </div>
            </UCard>

            <!-- Results Panel -->
            <UCard class="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <template #header>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">AI Predictions</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">Real-time analysis results</p>
              </template>

              <div v-if="!predictionResults" class="text-center py-12">
                <UIcon
                  name="i-heroicons-cpu-chip"
                  class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
                />
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Ready for Analysis
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                  Fill in the specifications and click "Run AI Prediction" to see our MATLAB models
                  in action.
                </p>
              </div>

              <div v-else class="space-y-6">
                <!-- Price Prediction -->
                <div
                  class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5 text-green-600" />
                    <h3 class="font-semibold text-gray-900 dark:text-white">Predicted Price</h3>
                  </div>
                  <div class="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    ${{ predictionResults.price }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Confidence: {{ predictionResults.priceConfidence }}%
                  </div>
                </div>

                <!-- Performance Score -->
                <div
                  class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-blue-600" />
                    <h3 class="font-semibold text-gray-900 dark:text-white">Performance Score</h3>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        class="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-1000"
                        :style="{ width: predictionResults.performanceScore + '%' }"
                      ></div>
                    </div>
                    <span class="font-bold text-blue-600 dark:text-blue-400"
                      >{{ predictionResults.performanceScore }}/100</span
                    >
                  </div>
                </div>

                <!-- Market Position -->
                <div
                  class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <UIcon name="i-heroicons-trophy" class="w-5 h-5 text-purple-600" />
                    <h3 class="font-semibold text-gray-900 dark:text-white">Market Position</h3>
                  </div>
                  <div class="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {{ predictionResults.marketPosition }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ predictionResults.marketDescription }}
                  </div>
                </div>

                <!-- Key Insights -->
                <div
                  class="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-orange-600" />
                    <h3 class="font-semibold text-gray-900 dark:text-white">AI Insights</h3>
                  </div>
                  <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li
                      v-for="insight in predictionResults.insights"
                      :key="insight"
                      class="flex items-start gap-2"
                    >
                      <UIcon
                        name="i-heroicons-check-circle"
                        class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                      />
                      {{ insight }}
                    </li>
                  </ul>
                </div>

                <!-- Model Confidence -->
                <div class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Model Confidence</div>
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ predictionResults.overallConfidence }}%
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    Based on {{ predictionResults.trainingSamples }} training samples
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            How Our AI Prediction Works
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our MATLAB-powered deep learning models analyze thousands of phone specifications to
            provide accurate predictions and market insights.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <UCard
            class="text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          >
            <div
              class="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            >
              <UIcon name="i-heroicons-server-stack" class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Data Processing
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Advanced feature engineering and preprocessing of phone specifications using MATLAB's
              powerful data tools.
            </p>
          </UCard>

          <UCard
            class="text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          >
            <div
              class="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            >
              <UIcon name="i-heroicons-cpu-chip" class="w-8 h-8 text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Deep Learning</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Ensemble of neural networks trained on comprehensive mobile phone datasets for
              accurate predictions.
            </p>
          </UCard>

          <UCard
            class="text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          >
            <div
              class="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            >
              <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-green-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Market Analysis
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Real-time market trend analysis and competitive positioning based on current market
              data.
            </p>
          </UCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

interface PredictionResult {
  price: number;
  priceConfidence: number;
  performanceScore: number;
  marketPosition: string;
  marketDescription: string;
  insights: string[];
  overallConfidence: number;
  trainingSamples: string;
}

// Page meta (fallback for environments without Nuxt auto-imports)
onMounted(() => {
  document.title = 'AI Predictions Demo - MATLAB Analytics';
  const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  const content =
    'Experience AI-powered phone predictions using advanced MATLAB deep learning models';
  if (existing) existing.content = content;
  else {
    const m = document.createElement('meta');
    m.name = 'description';
    m.content = content;
    document.head.appendChild(m);
  }
});

// Reactive data
const isPredicting = ref(false);
const predictionResults = ref<PredictionResult | null>(null);

const demoData = reactive({
  brand: '',
  modelName: '',
  displaySize: '',
  ram: '',
  storage: '',
  mainCamera: '',
  battery: '',
  processor: '',
});

// Options
const brands = [
  { label: 'Samsung', value: 'samsung' },
  { label: 'Apple', value: 'apple' },
  { label: 'Google', value: 'google' },
  { label: 'OnePlus', value: 'oneplus' },
  { label: 'Xiaomi', value: 'xiaomi' },
  { label: 'Sony', value: 'sony' },
  { label: 'Motorola', value: 'motorola' },
  { label: 'Other', value: 'other' },
];

const ramOptions = [
  { label: '4GB', value: '4' },
  { label: '6GB', value: '6' },
  { label: '8GB', value: '8' },
  { label: '12GB', value: '12' },
  { label: '16GB', value: '16' },
  { label: '18GB+', value: '18' },
];

const storageOptions = [
  { label: '64GB', value: '64' },
  { label: '128GB', value: '128' },
  { label: '256GB', value: '256' },
  { label: '512GB', value: '512' },
  { label: '1TB+', value: '1024' },
];

const processors = [
  { label: 'Snapdragon 8 Gen 3', value: 'sd8g3' },
  { label: 'Snapdragon 8 Gen 2', value: 'sd8g2' },
  { label: 'A17 Pro', value: 'a17pro' },
  { label: 'Google Tensor G3', value: 'tensor-g3' },
  { label: 'Dimensity 9200', value: 'dimensity9200' },
  { label: 'Snapdragon 7 Gen 1', value: 'sd7g1' },
  { label: 'Other', value: 'other' },
];

// Methods
const runPrediction = async () => {
  if (!demoData.brand || !demoData.displaySize) {
    // Show validation error
    return;
  }

  isPredicting.value = true;

  // Simulate AI prediction delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock prediction results based on input
  const basePrice = calculateBasePrice();
  const performanceScore = calculatePerformanceScore();

  predictionResults.value = {
    price: Math.round(basePrice + (Math.random() - 0.5) * 200),
    priceConfidence: Math.round(85 + Math.random() * 10),
    performanceScore: Math.round(performanceScore),
    marketPosition: getMarketPosition(performanceScore),
    marketDescription: getMarketDescription(performanceScore),
    insights: generateInsights(),
    overallConfidence: Math.round(88 + Math.random() * 8),
    trainingSamples: '50,000+',
  };

  isPredicting.value = false;
};

const calculateBasePrice = () => {
  let basePrice = 300;

  // Brand multiplier
  const brandMultipliers: Record<string, number> = {
    samsung: 1.2,
    apple: 2.5,
    google: 1.8,
    oneplus: 1.3,
    xiaomi: 0.9,
    sony: 1.1,
    motorola: 0.8,
    other: 1.0,
  };
  basePrice *= (brandMultipliers as Record<string, number>)[demoData.brand] || 1;

  // RAM multiplier
  const ramValue = parseInt(demoData.ram) || 8;
  basePrice += (ramValue - 4) * 50;

  // Storage multiplier
  const storageValue = parseInt(demoData.storage) || 128;
  basePrice += (storageValue - 64) * 0.5;

  // Camera multiplier
  const cameraValue = parseInt(demoData.mainCamera) || 50;
  basePrice += (cameraValue - 12) * 2;

  return Math.max(200, Math.min(2000, basePrice));
};

const calculatePerformanceScore = () => {
  let score = 50;

  // Processor score
  const processorScores: Record<string, number> = {
    sd8g3: 95,
    a17pro: 98,
    'tensor-g3': 88,
    dimensity9200: 92,
    sd8g2: 90,
    sd7g1: 75,
    other: 60,
  };
  score = (processorScores as Record<string, number>)[demoData.processor] || 60;

  // RAM adjustment
  const ramValue = parseInt(demoData.ram) || 8;
  score += Math.min(10, (ramValue - 4) * 2);

  // Storage adjustment (minor)
  const storageValue = parseInt(demoData.storage) || 128;
  score += Math.min(5, (storageValue - 64) / 32);

  return Math.min(100, Math.max(30, score));
};

const getMarketPosition = (score: number) => {
  if (score >= 95) return 'Flagship';
  if (score >= 85) return 'Premium';
  if (score >= 75) return 'Mid-Range';
  if (score >= 65) return 'Budget';
  return 'Entry-Level';
};

const getMarketDescription = (score: number) => {
  if (score >= 95) return 'Top-tier performance and features';
  if (score >= 85) return 'High-end specifications with premium features';
  if (score >= 75) return 'Balanced performance and value';
  if (score >= 65) return 'Good value for everyday use';
  return 'Basic functionality at affordable price';
};

const generateInsights = () => {
  const insights = [
    'Strong camera performance relative to price point',
    'Battery life exceeds category average',
    'Display quality is above average for this segment',
    'Processor provides smooth multitasking experience',
  ];

  // Randomly select 3 insights
  return insights.sort(() => Math.random() - 0.5).slice(0, 3);
};

const resetForm = () => {
  Object.keys(demoData).forEach((key) => {
    (demoData as any)[key] = '';
  });
  predictionResults.value = null;
};
</script>
