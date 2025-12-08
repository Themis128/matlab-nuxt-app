<template>
  <DPageLayout
    :show-hero="true"
    title="Advanced Analytics"
    description="Deep dive into advanced analytics features with powerful data mining and machine learning tools"
    bg="base-200"
  >
    <template #hero-actions>
      <span class="badge badge-primary badge-lg mb-4">
        <Icon name="heroicons:chart-bar-square" class="h-3 w-3" />
        Enterprise Analytics
      </span>
    </template>

    <!-- Advanced Features Dashboard -->
    <section class="py-20">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Analytics Cards Grid -->
        <div class="animate-stagger mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div
            class="card-modern group p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-lg bg-purple-500 p-3 text-white">
                <Icon name="heroicons:chart-bar-square" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-base-content">Advanced Metrics</h3>
                <p class="text-sm text-base-content/60">Enterprise Analytics</p>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-base-content/70">Model Accuracy</span>
                <span class="font-semibold text-success">97.8%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-base-content/70">Training Time</span>
                <span class="font-semibold text-info">2.3 hrs</span>
              </div>
              <div class="flex justify-between">
                <span class="text-base-content/70">Data Points</span>
                <span class="font-semibold text-primary">2.4M</span>
              </div>
            </div>
            <DButton
              variant="outline"
              size="sm"
              class="mt-6 w-full"
              @click="navigateTo('/model-showcase')"
            >
              View Details
            </DButton>
          </div>

          <div
            class="card-modern group p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-lg bg-blue-500 p-3 text-white">
                <Icon name="heroicons:cpu-chip" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-base-content">Neural Networks</h3>
                <p class="text-sm text-base-content/60">Deep Learning</p>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-base-content/70">Active Networks</span>
                <span class="font-semibold text-info">12</span>
              </div>
              <div class="flex justify-between">
                <span class="text-base-content/70">Layers</span>
                <span class="font-semibold text-success">256</span>
              </div>
              <div class="flex justify-between">
                <span class="text-base-content/70">Parameters</span>
                <span class="font-semibold text-primary">45.2M</span>
              </div>
            </div>
            <DButton variant="outline" size="sm" class="mt-6 w-full" @click="scrollToConfig">
              Configure
            </DButton>
          </div>

          <div
            class="card-modern group p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-lg bg-green-500 p-3 text-white">
                <Icon name="heroicons:presentation-chart-bar" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-base-content">Performance</h3>
                <p class="text-sm text-base-content/60">Real-time</p>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-base-content/70">Throughput</span>
                <span class="font-semibold text-success">1.2K/s</span>
              </div>
              <div class="flex justify-between">
                <span class="text-base-content/70">Latency</span>
                <span class="font-semibold text-info">23ms</span>
              </div>
              <div class="flex justify-between">
                <span class="text-base-content/70">Uptime</span>
                <span class="font-semibold text-primary">99.9%</span>
              </div>
            </div>
            <DButton variant="outline" size="sm" class="mt-6 w-full" @click="scrollToMonitoring">
              Monitor
            </DButton>
          </div>
        </div>

        <!-- Advanced Configuration Section -->
        <div class="mb-16 rounded-2xl bg-base-200 p-8">
          <h2 class="mb-8 text-center text-2xl font-bold text-base-content">
            Advanced Configuration
          </h2>

          <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h3 class="mb-4 text-lg font-semibold text-base-content">Model Parameters</h3>
              <div class="space-y-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-base-content/70">
                    Learning Rate
                  </label>
                  <input
                    v-model.number="config.learningRate"
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    class="w-full"
                  />
                  <span class="text-sm text-base-content/60">{{ config.learningRate }}</span>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-base-content/70">
                    Batch Size
                  </label>
                  <DSelect v-model="config.batchSize" :options="batchSizeOptions" />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-base-content/70">
                    Epochs
                  </label>
                  <DInput v-model="config.epochs" type="number" />
                </div>
              </div>
            </div>

            <div>
              <h3 class="mb-4 text-lg font-semibold text-base-content">Data Processing</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-base-content/70">Data Augmentation</span>
                  <input
                    v-model="config.dataAugmentation"
                    type="checkbox"
                    class="toggle toggle-primary"
                  />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-base-content/70">Normalization</span>
                  <input
                    v-model="config.normalization"
                    type="checkbox"
                    class="toggle toggle-primary"
                  />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-base-content/70">Cross Validation</span>
                  <input
                    v-model="config.crossValidation"
                    type="checkbox"
                    class="toggle toggle-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-center">
            <DButton size="lg" variant="primary" @click="applyConfiguration">
              Apply Configuration
            </DButton>
          </div>
        </div>

        <!-- Real-time Monitoring -->
        <div class="rounded-2xl bg-base-100 p-8 shadow-lg">
          <h2 class="mb-8 text-center text-2xl font-bold text-base-content">
            Real-time Monitoring
          </h2>

          <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h3 class="mb-4 text-lg font-semibold text-base-content">Training Progress</h3>
              <div class="space-y-4">
                <div class="flex justify-between">
                  <span class="text-base-content/70">Current Epoch</span>
                  <span class="font-semibold">{{ currentEpoch }}/{{ totalEpochs }}</span>
                </div>
                <progress
                  class="progress progress-primary w-full"
                  :value="(currentEpoch / totalEpochs) * 100"
                  max="100"
                />
                <div class="flex justify-between">
                  <span class="text-base-content/70">Loss</span>
                  <span class="font-semibold text-error">{{ currentLoss }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-base-content/70">Accuracy</span>
                  <span class="font-semibold text-success">{{ currentAccuracy }}%</span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="mb-4 text-lg font-semibold text-base-content">System Resources</h3>
              <div class="space-y-4">
                <div>
                  <div class="mb-1 flex justify-between">
                    <span class="text-base-content/70">CPU Usage</span>
                    <span class="font-semibold">{{ cpuUsage }}%</span>
                  </div>
                  <progress class="progress progress-info w-full" :value="cpuUsage" max="100" />
                </div>
                <div>
                  <div class="mb-1 flex justify-between">
                    <span class="text-base-content/70">Memory Usage</span>
                    <span class="font-semibold">{{ memoryUsage }}%</span>
                  </div>
                  <progress
                    class="progress progress-success w-full"
                    :value="memoryUsage"
                    max="100"
                  />
                </div>
                <div>
                  <div class="mb-1 flex justify-between">
                    <span class="text-base-content/70">GPU Usage</span>
                    <span class="font-semibold">{{ gpuUsage }}%</span>
                  </div>
                  <progress class="progress progress-primary w-full" :value="gpuUsage" max="100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </DPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useUserActivity } from '~/composables/useUserActivity';

// Page meta (fallback)
onMounted(() => {
  document.title = 'Advanced Analytics - MATLAB Deep Learning Platform';
  const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  const content =
    'Advanced analytics dashboard with deep learning model configuration and real-time monitoring';
  if (existing) existing.content = content;
  else {
    const m = document.createElement('meta');
    m.name = 'description';
    m.content = content;
    document.head.appendChild(m);
  }
});

// Reactive configuration
const config = reactive({
  learningRate: 0.01,
  batchSize: 32,
  epochs: 100,
  dataAugmentation: true,
  normalization: true,
  crossValidation: false,
});

// Monitoring data
const currentEpoch = ref(127);
const totalEpochs = ref(200);
const currentLoss = ref(0.234);
const currentAccuracy = ref(94.7);
const cpuUsage = ref(67);
const memoryUsage = ref(82);
const gpuUsage = ref(45);

const batchSizeOptions = [
  { label: '16', value: 16 },
  { label: '32', value: 32 },
  { label: '64', value: 64 },
  { label: '128', value: 128 },
];

// Real-time updates - fetch actual training metrics if available
const fetchTrainingMetrics = async () => {
  try {
    // Try to fetch real training status from API if available
    const status = await $fetch('/api/dataset/preprocessing-status').catch(() => null);
    if (status && typeof status === 'object' && 'training' in status) {
      // Update with real training data if available
      const training = (status as any).training;
      if (training) {
        currentEpoch.value = training.currentEpoch || currentEpoch.value;
        currentLoss.value = training.currentLoss || currentLoss.value;
        currentAccuracy.value = training.currentAccuracy || currentAccuracy.value;
      }
    }
  } catch {
    // Silently fail - use static values
    console.debug('Training metrics not available');
  }
};

// System resource monitoring (if available)
const updateSystemMetrics = async () => {
  try {
    // Try to get real system metrics if API provides them
    // For now, we'll use static values as system metrics require backend support
    // This can be enhanced when system monitoring API is available
  } catch {
    // Use default values
  }
};

const scrollToConfig = () => {
  const configSection = document.querySelector('.rounded-2xl.bg-gray-50');
  if (configSection) {
    configSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const scrollToMonitoring = () => {
  const monitoringSection = document.querySelector('.rounded-2xl.bg-white');
  if (monitoringSection) {
    monitoringSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const applyConfiguration = async () => {
  // Apply the configuration - in a real app, this would send to API
  console.log('Applying configuration:', config);
  // You could show a toast notification here
  // Track configuration if analytics is available
  try {
    const { trackActivity } = useUserActivity?.() || { trackActivity: () => {} };
    await trackActivity(
      'view',
      'Applied configuration',
      `Learning rate: ${config.learningRate}, Batch size: ${config.batchSize}, Epochs: ${config.epochs}`,
      {
        learningRate: config.learningRate,
        batchSize: config.batchSize,
        epochs: config.epochs,
      }
    );
  } catch {
    console.debug('Analytics tracking not available');
  }
};

onMounted(() => {
  // Fetch initial metrics
  fetchTrainingMetrics();
  updateSystemMetrics();

  // Only update epoch if training is active (not random simulation)
  // Remove random updates - use real data or static display
  const interval = setInterval(() => {
    fetchTrainingMetrics();
    updateSystemMetrics();
  }, 5000); // Check every 5 seconds instead of simulating

  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>

<style scoped>
/* Additional styles can be added here if needed */
</style>
