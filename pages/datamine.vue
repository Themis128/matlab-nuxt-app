<template>
  <div class="bg-background min-h-screen">
    <!-- Header Section -->
    <section class="bg-gradient-to-r from-violet-600 to-purple-600 py-16 text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="mb-4 text-4xl font-bold sm:text-5xl">Data Mining & Exploration</h1>
          <p class="mx-auto max-w-2xl text-xl text-violet-100">
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
        <div class="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <UCard class="group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-lg bg-violet-500 p-3 text-white">
                <UIcon name="i-heroicons-database" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Total Records</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Dataset Size</p>
              </div>
            </div>
            <div class="text-center">
              <div class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">2.4M</div>
              <div class="text-sm text-violet-600 dark:text-violet-400">+12% this month</div>
            </div>
          </UCard>

          <UCard class="group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-lg bg-blue-500 p-3 text-white">
                <UIcon name="i-heroicons-chart-bar" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Patterns Found</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Discovered</p>
              </div>
            </div>
            <div class="text-center">
              <div class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">147</div>
              <div class="text-sm text-blue-600 dark:text-blue-400">+23 this week</div>
            </div>
          </UCard>

          <UCard class="group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-lg bg-green-500 p-3 text-white">
                <UIcon name="i-heroicons-sparkles" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Clusters</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Identified</p>
              </div>
            </div>
            <div class="text-center">
              <div class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">8</div>
              <div class="text-sm text-green-600 dark:text-green-400">Optimal groups</div>
            </div>
          </UCard>

          <UCard class="group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div class="mb-6 flex items-center gap-4">
              <div class="rounded-lg bg-orange-500 p-3 text-white">
                <UIcon name="i-heroicons-lightning-bolt" class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Anomalies</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Detected</p>
              </div>
            </div>
            <div class="text-center">
              <div class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">23</div>
              <div class="text-sm text-orange-600 dark:text-orange-400">Requires attention</div>
            </div>
          </UCard>
        </div>

        <!-- Data Mining Tools -->
        <div class="mb-16 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 class="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Data Mining Tools
          </h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UCard
              v-for="tool in dataMiningTools"
              :key="tool.id"
              class="cursor-pointer p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div class="text-center">
                <div
                  class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  :style="{ backgroundColor: tool.color }"
                >
                  <UIcon :name="tool.icon" class="h-6 w-6 text-white" />
                </div>
                <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {{ tool.name }}
                </h3>
                <p class="mb-4 text-sm text-gray-600 dark:text-gray-300">{{ tool.description }}</p>
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
        <div class="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <UCard class="p-6">
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Frequent Patterns
            </h3>
            <div class="space-y-4">
              <div
                v-for="pattern in frequentPatterns"
                :key="pattern.id"
                class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full"
                    :style="{ backgroundColor: pattern.color }"
                  >
                    <UIcon :name="pattern.icon" class="h-4 w-4 text-white" />
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
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Association Rules
            </h3>
            <div class="space-y-4">
              <div
                v-for="rule in associationRules"
                :key="rule.id"
                class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
              >
                <div class="mb-2 flex items-center justify-between">
                  <div class="font-medium text-gray-900 dark:text-white">{{ rule.antecedent }}</div>
                  <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 text-gray-400" />
                  <div class="font-medium text-gray-900 dark:text-white">{{ rule.consequent }}</div>
                </div>
                <div class="flex justify-between text-sm">
                  <div>
                    <span class="text-gray-500">Confidence:</span>
                    <span class="ml-1 font-semibold text-gray-900 dark:text-white"
                      >{{ rule.confidence }}%</span
                    >
                  </div>
                  <div>
                    <span class="text-gray-500">Lift:</span>
                    <span class="ml-1 font-semibold text-gray-900 dark:text-white">{{
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
          class="mb-16 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-8 dark:from-violet-900/20 dark:to-purple-900/20"
        >
          <h2 class="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Cluster Analysis Results
          </h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <UCard v-for="cluster in clusters" :key="cluster.id" class="p-6">
              <div class="mb-4 text-center">
                <div
                  class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                  :style="{ backgroundColor: cluster.color }"
                >
                  <UIcon :name="cluster.icon" class="h-6 w-6 text-white" />
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
        <div class="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <div class="mb-8 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Interactive Data Explorer
            </h2>
            <div class="flex gap-4">
              <USelect v-model="selectedDataset" :options="datasetOptions" />
              <UButton color="violet">
                <UIcon name="i-heroicons-play" class="mr-2 h-4 w-4" />
                Analyze
              </UButton>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div class="lg:col-span-2">
              <div
                class="flex h-96 items-center justify-center rounded-lg bg-gray-100 p-6 dark:bg-gray-700"
              >
                <div class="text-center">
                  <UIcon
                    name="i-heroicons-chart-bar-square"
                    class="mx-auto mb-4 h-16 w-16 text-gray-400"
                  />
                  <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Data Visualization
                  </h3>
                  <p class="text-gray-600 dark:text-gray-300">
                    Interactive charts and graphs will appear here
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Dataset Statistics
              </h3>
              <div class="space-y-4">
                <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <div class="mb-1 text-sm text-gray-500">Total Features</div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">24</div>
                </div>
                <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <div class="mb-1 text-sm text-gray-500">Missing Values</div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">0.02%</div>
                </div>
                <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <div class="mb-1 text-sm text-gray-500">Data Quality Score</div>
                  <div class="text-lg font-semibold text-green-600">98.5%</div>
                </div>
                <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <div class="mb-1 text-sm text-gray-500">Last Updated</div>
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">2 hours ago</div>
                </div>
              </div>

              <div class="mt-6">
                <h4 class="text-md mb-3 font-semibold text-gray-900 dark:text-white">
                  Export Options
                </h4>
                <div class="space-y-2">
                  <UButton size="sm" variant="outline" class="w-full">
                    <UIcon name="i-heroicons-document-arrow-down" class="mr-2 h-4 w-4" />
                    Export to CSV
                  </UButton>
                  <UButton size="sm" variant="outline" class="w-full">
                    <UIcon name="i-heroicons-code-bracket" class="mr-2 h-4 w-4" />
                    Export to JSON
                  </UButton>
                  <UButton size="sm" variant="outline" class="w-full">
                    <UIcon name="i-heroicons-presentation-chart-bar" class="mr-2 h-4 w-4" />
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
import { ref, onMounted } from 'vue';
// Page meta (fallback)
onMounted(() => {
  document.title = 'Data Mining & Exploration - MATLAB Deep Learning Platform';
  const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  const content =
    'Discover hidden patterns and insights in mobile datasets with advanced data mining techniques';
  if (existing) existing.content = content;
  else {
    const m = document.createElement('meta');
    m.name = 'description';
    m.content = content;
    document.head.appendChild(m);
  }
});

// Selected dataset
const selectedDataset = ref('mobile-devices');

// Dataset options
const datasetOptions = [
  { label: 'Mobile Devices Dataset', value: 'mobile-devices' },
  { label: 'User Behavior Data', value: 'user-behavior' },
  { label: 'App Usage Statistics', value: 'app-usage' },
  { label: 'Market Research Data', value: 'market-research' },
];

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
]);

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
]);

// Association rules (placeholder data)
const associationRules = ref([
  { id: 'r1', antecedent: 'high_ram', consequent: 'high_price', confidence: 92, lift: 1.4 },
  { id: 'r2', antecedent: 'large_battery', consequent: 'long_life', confidence: 88, lift: 1.2 },
]);

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
]);
</script>
