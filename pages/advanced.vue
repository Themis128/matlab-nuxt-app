<template>
  <div class="min-h-screen bg-background">
    <!-- Header Section -->
    <section class="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold mb-4">Advanced Analytics</h1>
          <p class="text-xl text-purple-100 max-w-2xl mx-auto">
            Deep dive into advanced analytics features with powerful data mining and machine
            learning tools
          </p>
        </div>
      </div>
    </section>

    <!-- Advanced Features Dashboard -->
    <section class="py-20">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Analytics Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <UCard class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 rounded-lg bg-purple-500 text-white">
                <UIcon name="i-heroicons-chart-bar-square" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Advanced Metrics
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Enterprise Analytics</p>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-300">Model Accuracy</span>
                <span class="font-semibold text-green-600">97.8%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-300">Training Time</span>
                <span class="font-semibold text-blue-600">2.3 hrs</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-300">Data Points</span>
                <span class="font-semibold text-purple-600">2.4M</span>
              </div>
            </div>
            <UButton variant="outline" size="sm" class="mt-6 w-full"> View Details </UButton>
          </UCard>

          <UCard class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 rounded-lg bg-blue-500 text-white">
                <UIcon name="i-heroicons-cpu-chip" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Neural Networks</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Deep Learning</p>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-300">Active Networks</span>
                <span class="font-semibold text-blue-600">12</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-300">Layers</span>
                <span class="font-semibold text-green-600">256</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-300">Parameters</span>
                <span class="font-semibold text-purple-600">45.2M</span>
              </div>
            </div>
            <UButton variant="outline" size="sm" class="mt-6 w-full"> Configure </UButton>
          </UCard>

          <UCard class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 rounded-lg bg-green-500 text-white">
                <UIcon name="i-heroicons-presentation-chart-bar" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Performance</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Real-time</p>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-300">Throughput</span>
                <span class="font-semibold text-green-600">1.2K/s</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-300">Latency</span>
                <span class="font-semibold text-blue-600">23ms</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-300">Uptime</span>
                <span class="font-semibold text-purple-600">99.9%</span>
              </div>
            </div>
            <UButton variant="outline" size="sm" class="mt-6 w-full"> Monitor </UButton>
          </UCard>
        </div>

        <!-- Advanced Configuration Section -->
        <div class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 mb-16">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Advanced Configuration
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Model Parameters
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Learning Rate
                  </label>
                  <USlider v-model="config.learningRate" :min="0.001" :max="0.1" :step="0.001" />
                  <span class="text-sm text-gray-500">{{ config.learningRate }}</span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Batch Size
                  </label>
                  <USelect v-model="config.batchSize" :options="batchSizeOptions" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Epochs
                  </label>
                  <UInput v-model="config.epochs" type="number" />
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Data Processing
              </h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Data Augmentation</span>
                  <UToggle v-model="config.dataAugmentation" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Normalization</span>
                  <UToggle v-model="config.normalization" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Cross Validation</span>
                  <UToggle v-model="config.crossValidation" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-center mt-8">
            <UButton size="lg" color="purple"> Apply Configuration </UButton>
          </div>
        </div>

        <!-- Real-time Monitoring -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Real-time Monitoring
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Training Progress
              </h3>
              <div class="space-y-4">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">Current Epoch</span>
                  <span class="font-semibold">{{ currentEpoch }}/{{ totalEpochs }}</span>
                </div>
                <UProgress :value="(currentEpoch / totalEpochs) * 100" />
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">Loss</span>
                  <span class="font-semibold text-red-600">{{ currentLoss }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">Accuracy</span>
                  <span class="font-semibold text-green-600">{{ currentAccuracy }}%</span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                System Resources
              </h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-gray-600 dark:text-gray-300">CPU Usage</span>
                    <span class="font-semibold">{{ cpuUsage }}%</span>
                  </div>
                  <UProgress :value="cpuUsage" color="blue" />
                </div>
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-gray-600 dark:text-gray-300">Memory Usage</span>
                    <span class="font-semibold">{{ memoryUsage }}%</span>
                  </div>
                  <UProgress :value="memoryUsage" color="green" />
                </div>
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-gray-600 dark:text-gray-300">GPU Usage</span>
                    <span class="font-semibold">{{ gpuUsage }}%</span>
                  </div>
                  <UProgress :value="gpuUsage" color="purple" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  // Page meta
  useHead({
    title: 'Advanced Analytics - MATLAB Deep Learning Platform',
    meta: [
      {
        name: 'description',
        content:
          'Advanced analytics dashboard with deep learning model configuration and real-time monitoring',
      },
    ],
  })

  // Reactive configuration
  const config = reactive({
    learningRate: 0.01,
    batchSize: 32,
    epochs: 100,
    dataAugmentation: true,
    normalization: true,
    crossValidation: false,
  })

  // Monitoring data
  const currentEpoch = ref(127)
  const totalEpochs = ref(200)
  const currentLoss = ref(0.234)
  const currentAccuracy = ref(94.7)
  const cpuUsage = ref(67)
  const memoryUsage = ref(82)
  const gpuUsage = ref(45)

  const batchSizeOptions = [
    { label: '16', value: 16 },
    { label: '32', value: 32 },
    { label: '64', value: 64 },
    { label: '128', value: 128 },
  ]

  // Simulate real-time updates
  onMounted(() => {
    const interval = setInterval(() => {
      currentEpoch.value = Math.min(currentEpoch.value + 1, totalEpochs.value)
      currentLoss.value = Math.max(0.1, currentLoss.value + (Math.random() - 0.5) * 0.01)
      currentAccuracy.value = Math.min(99.9, currentAccuracy.value + (Math.random() - 0.5) * 0.1)
      cpuUsage.value = Math.max(20, Math.min(90, cpuUsage.value + (Math.random() - 0.5) * 5))
      memoryUsage.value = Math.max(30, Math.min(95, memoryUsage.value + (Math.random() - 0.5) * 3))
      gpuUsage.value = Math.max(10, Math.min(85, gpuUsage.value + (Math.random() - 0.5) * 4))
    }, 2000)

    onUnmounted(() => {
      clearInterval(interval)
    })
  })
</script>

<style scoped>
  /* Additional styles can be added here if needed */
</style>
