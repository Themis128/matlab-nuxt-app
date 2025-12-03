<template>
  <div class="min-h-screen bg-background">
    <!-- Header Section -->
    <section class="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold mb-4">Data Mining & Exploration</h1>
          <p class="text-xl text-violet-100 max-w-2xl mx-auto">
            Discover hidden patterns and insights in your mobile datasets with advanced data mining
            techniques
          </p>
        </div>
      </div>
    </section>

    <!-- Data Mining Dashboard -->
    <section class="py-20">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Data Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <UCard class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 rounded-lg bg-violet-500 text-white">
                <UIcon name="i-heroicons-database" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Total Records</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Dataset Size</p>
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">2.4M</div>
              <div class="text-sm text-violet-600 dark:text-violet-400">+12% this month</div>
            </div>
          </UCard>

          <UCard class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 rounded-lg bg-blue-500 text-white">
                <UIcon name="i-heroicons-chart-bar" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Patterns Found</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Discovered</p>
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">147</div>
              <div class="text-sm text-blue-600 dark:text-blue-400">+23 this week</div>
            </div>
          </UCard>

          <UCard class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 rounded-lg bg-green-500 text-white">
                <UIcon name="i-heroicons-sparkles" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Clusters</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Identified</p>
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">8</div>
              <div class="text-sm text-green-600 dark:text-green-400">Optimal groups</div>
            </div>
          </UCard>

          <UCard class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 rounded-lg bg-orange-500 text-white">
                <UIcon name="i-heroicons-lightning-bolt" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Anomalies</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Detected</p>
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">23</div>
              <div class="text-sm text-orange-600 dark:text-orange-400">Requires attention</div>
            </div>
          </UCard>
        </div>

        <!-- Data Mining Tools -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-16">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Data Mining Tools
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard
              v-for="tool in dataMiningTools"
              :key="tool.id"
              class="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div class="text-center">
                <div
                  class="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                  :style="{ backgroundColor: tool.color }"
                >
                  <UIcon :name="tool.icon" class="w-6 h-6 text-white" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {{ tool.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">{{ tool.description }}</p>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Status</span>
                    <span :class="tool.status === 'Active' ? 'text-green-600' : 'text-gray-500'">{{
                      tool.status
                    }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Last Run</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{
                      tool.lastRun
                    }}</span>
                  </div>
                </div>
                <UButton
                  size="sm"
                  :color="tool.color === '#8B5CF6' ? 'violet' : 'blue'"
                  class="mt-4 w-full"
                >
                  Run Analysis
                </UButton>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Pattern Discovery -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <UCard class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Frequent Patterns
            </h3>
            <div class="space-y-4">
              <div
                v-for="pattern in frequentPatterns"
                :key="pattern.id"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :style="{ backgroundColor: pattern.color }"
                  >
                    <UIcon :name="pattern.icon" class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">{{ pattern.name }}</div>
                    <div class="text-sm text-gray-500">{{ pattern.frequency }}% occurrence</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ pattern.support }}
                  </div>
                  <div class="text-xs text-gray-500">support</div>
                </div>
              </div>
            </div>
          </UCard>

          <UCard class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Association Rules
            </h3>
            <div class="space-y-4">
              <div
                v-for="rule in associationRules"
                :key="rule.id"
                class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="font-medium text-gray-900 dark:text-white">{{ rule.antecedent }}</div>
                  <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-gray-400" />
                  <div class="font-medium text-gray-900 dark:text-white">{{ rule.consequent }}</div>
                </div>
                <div class="flex justify-between text-sm">
                  <div>
                    <span class="text-gray-500">Confidence:</span>
                    <span class="font-semibold text-gray-900 dark:text-white ml-1"
                      >{{ rule.confidence }}%</span
                    >
                  </div>
                  <div>
                    <span class="text-gray-500">Lift:</span>
                    <span class="font-semibold text-gray-900 dark:text-white ml-1">{{
                      rule.lift
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Cluster Analysis -->
        <div
          class="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-16"
        >
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Cluster Analysis Results
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UCard v-for="cluster in clusters" :key="cluster.id" class="p-6">
              <div class="text-center mb-4">
                <div
                  class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                  :style="{ backgroundColor: cluster.color }"
                >
                  <UIcon :name="cluster.icon" class="w-6 h-6 text-white" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ cluster.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ cluster.description }}</p>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Size</span>
                  <span class="font-semibold text-gray-900 dark:text-white">{{
                    cluster.size
                  }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Density</span>
                  <span class="font-semibold text-gray-900 dark:text-white">{{
                    cluster.density
                  }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Silhouette</span>
                  <span class="font-semibold text-green-600">{{ cluster.silhouette }}</span>
                </div>
              </div>

              <UButton size="sm" variant="outline" class="mt-4 w-full"> Explore Cluster </UButton>
            </UCard>
          </div>
        </div>

        <!-- Data Exploration -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Interactive Data Explorer
            </h2>
            <div class="flex gap-4">
              <USelect v-model="selectedDataset" :options="datasetOptions" />
              <UButton color="violet">
                <UIcon name="i-heroicons-play" class="w-4 h-4 mr-2" />
                Analyze
              </UButton>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
              <div
                class="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 h-96 flex items-center justify-center"
              >
                <div class="text-center">
                  <UIcon
                    name="i-heroicons-chart-bar-square"
                    class="w-16 h-16 mx-auto mb-4 text-gray-400"
                  />
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Data Visualization
                  </h3>
                  <p class="text-gray-600 dark:text-gray-300">
                    Interactive charts and graphs will appear here
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Dataset Statistics
              </h3>
              <div class="space-y-4">
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="text-sm text-gray-500 mb-1">Total Features</div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">24</div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="text-sm text-gray-500 mb-1">Missing Values</div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">0.02%</div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="text-sm text-gray-500 mb-1">Data Quality Score</div>
                  <div class="text-lg font-semibold text-green-600">98.5%</div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="text-sm text-gray-500 mb-1">Last Updated</div>
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">2 hours ago</div>
                </div>
              </div>

              <div class="mt-6">
                <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Export Options
                </h4>
                <div class="space-y-2">
                  <UButton size="sm" variant="outline" class="w-full">
                    <UIcon name="i-heroicons-document-arrow-down" class="w-4 h-4 mr-2" />
                    Export to CSV
                  </UButton>
                  <UButton size="sm" variant="outline" class="w-full">
                    <UIcon name="i-heroicons-code-bracket" class="w-4 h-4 mr-2" />
                    Export to JSON
                  </UButton>
                  <UButton size="sm" variant="outline" class="w-full">
                    <UIcon name="i-heroicons-presentation-chart-bar" class="w-4 h-4 mr-2" />
                    Generate Report
                  </UButton>
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
  import { ref } from 'vue'
  // Page meta
  useHead({
    title: 'Data Mining & Exploration - MATLAB Deep Learning Platform',
    meta: [
      {
        name: 'description',
        content:
          'Discover hidden patterns and insights in mobile datasets with advanced data mining techniques',
      },
    ],
  })

  // Selected dataset
  const selectedDataset = ref('mobile-devices')

  // Dataset options
  const datasetOptions = [
    { label: 'Mobile Devices Dataset', value: 'mobile-devices' },
    { label: 'User Behavior Data', value: 'user-behavior' },
    { label: 'App Usage Statistics', value: 'app-usage' },
    { label: 'Market Research Data', value: 'market-research' },
  ]

  // Data mining tools
  const dataMiningTools = ref([
    {
      id: 'association-rule',
      name: 'Association Rules',
      description: 'Discover relationships between different attributes',
      color: '#8B5CF6',
      icon: 'i-heroicons-link',
      status: 'Active',
      lastRun: '5 min ago',
    },
    {
      id: 'clustering',
      name: 'Clustering Analysis',
      description: 'Group similar data points together',
      color: '#3B82F6',
      icon: 'i-heroicons-squares-2x2',
      status: 'Active',
      lastRun: '12 min ago',
    },
    {
      id: 'outlier-detection',
      name: 'Outlier Detection',
      description: 'Identify unusual patterns and anomalies',
      color: '#EF4444',
      icon: 'i-heroicons-exclamation-triangle',
      status: 'Active',
      lastRun: '12 min ago',
    },
  ])

  // Frequent patterns (placeholder data)
  const frequentPatterns = ref([
    {
      id: 'p1',
      name: 'High RAM & Battery',
      frequency: 72,
      support: 320,
      color: '#3B82F6',
      icon: 'i-heroicons-sparkles',
    },
    {
      id: 'p2',
      name: 'Budget Flagship',
      frequency: 45,
      support: 210,
      color: '#10B981',
      icon: 'i-heroicons-flag',
    },
  ])

  // Association rules (placeholder data)
  const associationRules = ref([
    { id: 'r1', antecedent: 'high_ram', consequent: 'high_price', confidence: 92, lift: 1.4 },
    { id: 'r2', antecedent: 'large_battery', consequent: 'long_life', confidence: 88, lift: 1.2 },
  ])

  // Clusters (placeholder data)
  const clusters = ref([
    {
      id: 'c1',
      name: 'Flagship',
      description: 'Premium devices',
      color: '#8B5CF6',
      icon: 'i-heroicons-star',
      size: 1200,
      density: 0.82,
      silhouette: 0.61,
    },
    {
      id: 'c2',
      name: 'Budget',
      description: 'Value devices',
      color: '#F59E0B',
      icon: 'i-heroicons-currency-dollar',
      size: 5400,
      density: 0.64,
      silhouette: 0.48,
    },
  ])
</script>
