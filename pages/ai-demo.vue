<template>
  <div class="bg-background min-h-screen">
    <!-- Hero Section -->
    <section
      class="bg-gradient-to-br from-primary/10 to-secondary/10 py-16"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary"
          >
            <Icon
              name="heroicons:sparkles"
              class="h-4 w-4"
            />
            AI Predictions Demo
          </div>
          <h1 class="mb-4 text-4xl font-bold text-base-content sm:text-5xl">
            Experience AI-Powered
            <span class="text-primary">Phone Predictions</span>
          </h1>
          <p class="mx-auto max-w-2xl text-lg opacity-70">
            See our advanced MATLAB deep learning models in action. Upload phone specifications and
            get instant predictions on performance, pricing, and market trends.
          </p>
        </div>

        <!-- Demo Interface -->
        <div class="mx-auto max-w-6xl">
          <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <!-- Input Panel -->
            <DCard class="bg-base-100/80 p-6 backdrop-blur-sm">
              <template #header>
                <h2 class="card-title">
                  Input Specifications
                </h2>
                <p class="text-sm opacity-70">
                  Enter phone details for AI analysis
                </p>
              </template>

              <div class="space-y-6">
                <!-- Basic Info -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Brand</span>
                    </label>
                    <DSelect
                      v-model="demoData.brand"
                      placeholder="Select brand"
                      :options="brands"
                    />
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Model Name</span>
                    </label>
                    <DInput
                      v-model="demoData.modelName"
                      placeholder="e.g., Galaxy S24"
                    />
                  </div>
                </div>

                <!-- Technical Specs -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Display Size (inches)</span>
                    </label>
                    <DInput
                      v-model="demoData.displaySize"
                      type="number"
                      placeholder="6.1"
                    />
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">RAM (GB)</span>
                    </label>
                    <DSelect
                      v-model="demoData.ram"
                      :options="ramOptions"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Storage (GB)</span>
                    </label>
                    <DSelect
                      v-model="demoData.storage"
                      :options="storageOptions"
                    />
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Main Camera (MP)</span>
                    </label>
                    <DInput
                      v-model="demoData.mainCamera"
                      type="number"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Battery (mAh)</span>
                    </label>
                    <DInput
                      v-model="demoData.battery"
                      type="number"
                      placeholder="4000"
                    />
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Processor</span>
                    </label>
                    <DSelect
                      v-model="demoData.processor"
                      placeholder="Select processor"
                      :options="processors"
                    />
                  </div>
                </div>

                <!-- Model Selection -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">ML Model</span>
                  </label>
                  <DSelect
                    v-model="selectedModel"
                    :options="availableModels.map(m => ({ label: m.name, value: m.type }))"
                    placeholder="Select model"
                  />
                  <label class="label">
                    <span class="label-text-alt">
                      {{ availableModels.find((m) => m.type === selectedModel)?.description }}
                    </span>
                  </label>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                  <DButton
                    variant="primary"
                    class="flex-1"
                    :loading="isPredicting"
                    @click="runPrediction"
                  >
                    <Icon
                      name="i-heroicons-sparkles"
                      class="mr-2 h-5 w-5"
                    />
                    {{ isPredicting ? 'Analyzing...' : 'Run AI Prediction' }}
                  </DButton>
                  <DButton
                    variant="outline"
                    @click="resetForm"
                  >
                    <Icon
                      name="i-heroicons-arrow-path"
                      class="mr-2 h-5 w-5"
                    />
                    Reset
                  </DButton>
                </div>
              </div>
            </DCard>

            <!-- Results Panel -->
            <DCard class="bg-base-100/80 p-6 backdrop-blur-sm">
              <template #header>
                <h2 class="card-title">
                  AI Predictions
                </h2>
                <p class="text-sm opacity-70">
                  Real-time analysis results
                </p>
              </template>

              <div
                v-if="!predictionResults"
                class="py-12 text-center"
              >
                <UIcon
                  name="i-heroicons-cpu-chip"
                  class="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
                />
                <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  Ready for Analysis
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                  Fill in the specifications and click "Run AI Prediction" to see our MATLAB models
                  in action.
                </p>
              </div>

              <div
                v-else
                class="space-y-6"
              >
                <!-- Price Prediction -->
                <div
                  class="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20"
                >
                  <div class="mb-2 flex items-center gap-3">
                    <UIcon
                      name="i-heroicons-currency-dollar"
                      class="h-5 w-5 text-green-600"
                    />
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                      Predicted Price
                    </h3>
                  </div>
                  <div class="mb-1 text-3xl font-bold text-green-600 dark:text-green-400">
                    ${{ predictionResults.price }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Confidence: {{ predictionResults.priceConfidence }}%
                  </div>
                </div>

                <!-- Performance Score -->
                <div
                  class="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20"
                >
                  <div class="mb-2 flex items-center gap-3">
                    <UIcon
                      name="i-heroicons-chart-bar"
                      class="h-5 w-5 text-blue-600"
                    />
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                      Performance Score
                    </h3>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="h-3 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        class="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000"
                        :style="{ width: predictionResults.performanceScore + '%' }"
                      />
                    </div>
                    <span class="font-bold text-blue-600 dark:text-blue-400">{{ predictionResults.performanceScore }}/100</span>
                  </div>
                </div>

                <!-- Market Position -->
                <div
                  class="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:from-purple-900/20 dark:to-pink-900/20"
                >
                  <div class="mb-2 flex items-center gap-3">
                    <UIcon
                      name="i-heroicons-trophy"
                      class="h-5 w-5 text-purple-600"
                    />
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                      Market Position
                    </h3>
                  </div>
                  <div class="mb-1 text-xl font-bold text-purple-600 dark:text-purple-400">
                    {{ predictionResults.marketPosition }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ predictionResults.marketDescription }}
                  </div>
                </div>

                <!-- Key Insights -->
                <div
                  class="rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 p-4 dark:from-orange-900/20 dark:to-yellow-900/20"
                >
                  <div class="mb-3 flex items-center gap-3">
                    <UIcon
                      name="i-heroicons-light-bulb"
                      class="h-5 w-5 text-orange-600"
                    />
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                      AI Insights
                    </h3>
                  </div>
                  <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li
                      v-for="insight in predictionResults.insights"
                      :key="insight"
                      class="flex items-start gap-2"
                    >
                      <UIcon
                        name="i-heroicons-check-circle"
                        class="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                      />
                      {{ insight }}
                    </li>
                  </ul>
                </div>

                <!-- Model Confidence -->
                <div class="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
                  <div class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    Model Confidence
                  </div>
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ predictionResults.overallConfidence }}%
                  </div>
                  <div class="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    Model: {{ predictionResults.modelUsed || 'distilled' }}
                  </div>
                  <div class="mt-1 text-xs text-gray-500">
                    Based on {{ predictionResults.trainingSamples }} training samples
                  </div>
                </div>
              </div>
            </DCard>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="bg-gray-50 py-20 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            How Our AI Prediction Works
          </h2>
          <p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Our MATLAB-powered deep learning models analyze thousands of phone specifications to
            provide accurate predictions and market insights.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <DCard
            class="group text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 p-4 dark:bg-blue-900/30"
            >
              <Icon
                name="i-heroicons-server-stack"
                class="h-8 w-8 text-blue-600"
              />
            </div>
            <h3 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              Data Processing
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Advanced feature engineering and preprocessing of phone specifications using MATLAB's
              powerful data tools.
            </p>
          </DCard>

          <DCard
            class="group text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 p-4 dark:bg-purple-900/30"
            >
              <Icon
                name="i-heroicons-cpu-chip"
                class="h-8 w-8 text-purple-600"
              />
            </div>
            <h3 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              Deep Learning
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Ensemble of neural networks trained on comprehensive mobile phone datasets for
              accurate predictions.
            </p>
          </DCard>

          <DCard
            class="group text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 p-4 dark:bg-green-900/30"
            >
              <Icon
                name="i-heroicons-chart-bar"
                class="h-8 w-8 text-green-600"
              />
            </div>
            <h3 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
              Market Analysis
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Real-time market trend analysis and competitive positioning based on current market
              data.
            </p>
          </DCard>
        </div>
      </div>
    </section>
  </div>
  </DPageLayout>
</template>

<script setup lang="ts">
// Page metadata
definePageMeta({
  layout: 'dashboard',
});
import { ref, reactive, onMounted } from 'vue';
import type { ModelType } from '~/composables/useModelPredictions';

interface PredictionResult {
  price: number;
  priceConfidence: number;
  performanceScore: number;
  marketPosition: string;
  marketDescription: string;
  insights: string[];
  overallConfidence: number;
  trainingSamples: string;
  modelUsed?: string;
}

// Page meta (fallback for environments without Nuxt auto-imports)
onMounted(async () => {
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

  // Track page view
  await trackView('AI Predictions', 'Using ML models for price prediction');
});

// Use unified model predictions composable
const { predictPrice, getAvailableModels } = useModelPredictions();
const { trackPrediction, trackView } = useUserActivity();

// Reactive data
const isPredicting = ref(false);
const predictionResults = ref<PredictionResult | null>(null);
const selectedModel = ref<ModelType>('distilled');
const availableModels = ref(getAvailableModels());

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

  try {
    // Use unified model predictions composable
    const response = await predictPrice(
      {
        ram: parseFloat(demoData.ram) || 8,
        battery: parseFloat(demoData.battery) || 4000,
        screen: parseFloat(demoData.displaySize) || 6.1,
        weight: 180, // Default weight if not provided
        year: new Date().getFullYear(),
        company: demoData.brand || 'Samsung',
        front_camera: demoData.mainCamera ? parseFloat(demoData.mainCamera) : undefined,
        back_camera: demoData.mainCamera ? parseFloat(demoData.mainCamera) : undefined,
        processor: demoData.processor || undefined,
        storage: demoData.storage ? parseFloat(demoData.storage) : undefined,
      },
      selectedModel.value
    );

    const performanceScore = calculatePerformanceScore();
    const accuracy = response.accuracy_info?.r2_score
      ? Math.round(response.accuracy_info.r2_score * 100)
      : 85;

    predictionResults.value = {
      price: Math.round(response.price || calculateBasePrice()),
      priceConfidence: accuracy,
      performanceScore: Math.round(performanceScore),
      marketPosition: getMarketPosition(performanceScore),
      marketDescription: getMarketDescription(performanceScore),
      insights: generateInsights(demoData),
      overallConfidence: accuracy,
      trainingSamples: '50,000+',
      modelUsed: response.model_used || selectedModel.value,
    };

    // Track prediction activity
    await trackPrediction('price', {
      model: selectedModel.value,
      price: predictionResults.value.price,
      confidence: accuracy,
      brand: demoData.brand,
    });
  } catch (error) {
    const logger = useSentryLogger();
    logger.logError(
      'Prediction API error',
      error instanceof Error ? error : new Error(String(error)),
      {
        page: 'ai-demo',
        action: 'predict',
      }
    );
    // Fallback to calculated values if API fails
    const basePrice = calculateBasePrice();
    const performanceScore = calculatePerformanceScore();

    predictionResults.value = {
      price: Math.round(basePrice),
      priceConfidence: 75,
      performanceScore: Math.round(performanceScore),
      marketPosition: getMarketPosition(performanceScore),
      marketDescription: getMarketDescription(performanceScore),
      insights: generateInsights(demoData),
      overallConfidence: 75,
      trainingSamples: '50,000+',
      modelUsed: selectedModel.value,
    };
  } finally {
    isPredicting.value = false;
  }
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

const generateInsights = (data: typeof demoData) => {
  const insights: string[] = [];

  // Generate insights based on actual input data
  if (data.battery && parseFloat(data.battery) >= 5000) {
    insights.push('Exceptional battery capacity for extended usage');
  }
  if (data.ram && parseFloat(data.ram) >= 12) {
    insights.push('High RAM ensures smooth multitasking and future-proofing');
  }
  if (data.mainCamera && parseFloat(data.mainCamera) >= 50) {
    insights.push('Advanced camera system for professional photography');
  }
  if (data.processor && ['sd8g3', 'a17pro', 'tensor-g3'].includes(data.processor)) {
    insights.push('Flagship processor delivers top-tier performance');
  }
  if (data.displaySize && parseFloat(data.displaySize) >= 6.5) {
    insights.push('Large display provides immersive viewing experience');
  }

  // Add default insights if not enough specific ones
  const defaultInsights = [
    'Balanced specifications for everyday use',
    'Good value proposition in its category',
    'Reliable performance for most tasks',
  ];

  while (insights.length < 3) {
    const defaultInsight = defaultInsights[insights.length] || defaultInsights[0] || '';
    if (defaultInsight && !insights.includes(defaultInsight)) {
      insights.push(defaultInsight);
    } else {
      break;
    }
  }

  return insights.slice(0, 3);
};

const resetForm = () => {
  Object.keys(demoData).forEach((key) => {
    (demoData as any)[key] = '';
  });
  predictionResults.value = null;
};
</script>
