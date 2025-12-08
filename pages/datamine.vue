<template>
  <DPageLayout
    :show-hero="true"
    title="Data Mining & Exploration"
    description="Discover hidden patterns and insights in your mobile datasets with advanced data mining techniques"
  >
    <template #hero-actions>
      <span class="badge badge-primary badge-lg mb-4">
        <Icon name="heroicons:chart-bar" class="h-3 w-3" />
        Analytics
      </span>
    </template>

    <!-- Enhanced Data Mining Dashboard -->
    <ModernSection title="Data Overview" description="Key metrics and insights from your dataset">
      <!-- Data Overview Cards -->
      <div class="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ModernCard hover-color="purple" class="group">
          <div class="mb-6 flex items-center gap-4">
            <div class="rounded-xl bg-primary p-4 text-primary-content shadow-lg">
              <Icon name="heroicons:server-stack" class="h-7 w-7" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-base-content">Total Records</h3>
              <p class="text-sm font-medium opacity-70">Dataset Size</p>
            </div>
          </div>
          <div class="text-center">
            <div class="mb-2 text-4xl font-extrabold text-base-content">2.4M</div>
            <div class="text-sm font-semibold text-primary">+12% this month</div>
          </div>
        </ModernCard>

        <ModernCard hover-color="blue" class="group">
          <div class="mb-6 flex items-center gap-4">
            <div class="rounded-xl bg-info p-4 text-info-content shadow-lg">
              <Icon name="heroicons:chart-bar" class="h-7 w-7" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-base-content">Patterns Found</h3>
              <p class="text-sm font-medium opacity-70">Discovered</p>
            </div>
          </div>
          <div class="text-center">
            <div class="mb-2 text-4xl font-extrabold text-base-content">147</div>
            <div class="text-sm font-semibold text-info">+23 this week</div>
          </div>
        </ModernCard>

        <ModernCard hover-color="green" class="group">
          <div class="mb-6 flex items-center gap-4">
            <div
              class="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white shadow-lg"
            >
              <Icon name="heroicons:sparkles" class="h-7 w-7" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-base-content">Clusters</h3>
              <p class="text-sm font-medium opacity-70">Identified</p>
            </div>
          </div>
          <div class="text-center">
            <div class="mb-2 text-4xl font-extrabold text-base-content">8</div>
            <div class="text-sm font-semibold text-success">Optimal groups</div>
          </div>
        </ModernCard>

        <ModernCard hover-color="orange" class="group">
          <div class="mb-6 flex items-center gap-4">
            <div
              class="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white shadow-lg"
            >
              <Icon name="heroicons:bolt" class="h-7 w-7" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-base-content">Anomalies</h3>
              <p class="text-sm font-medium opacity-70">Detected</p>
            </div>
          </div>
          <div class="text-center">
            <div class="mb-2 text-4xl font-extrabold text-base-content">23</div>
            <div class="text-sm font-semibold text-warning">Requires attention</div>
          </div>
        </ModernCard>
      </div>
    </ModernSection>

    <!-- Data Mining Tools -->
    <div class="mb-16 rounded-2xl bg-base-100 p-8 shadow-lg">
      <h2 class="mb-8 text-center text-2xl font-bold text-base-content">Data Mining Tools</h2>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="tool in dataMiningTools" :key="tool.id">
          <DCard
            class="cursor-pointer p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="text-center">
              <div
                class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                :style="{ backgroundColor: tool.color }"
              >
                <Icon :name="tool.icon" class="h-6 w-6 text-white" />
              </div>
              <h3 class="mb-2 text-lg font-semibold text-base-content">
                {{ tool.name }}
              </h3>
              <p class="mb-4 text-sm text-base-content/70">
                {{ tool.description }}
              </p>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-base-content/60">Status</span>
                  <span
                    :class="tool.status === 'Active' ? 'text-success' : 'text-base-content/60'"
                    >{{ tool.status }}</span
                  >
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-base-content/60">Last Run</span>
                  <span class="font-semibold text-base-content">{{ tool.lastRun }}</span>
                </div>
              </div>
              <DButton size="sm" variant="primary" class="mt-4 w-full"> Run Analysis </DButton>
            </div>
          </DCard>
        </div>
      </div>
    </div>

    <!-- Pattern Discovery -->
    <div class="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
      <DCard class="p-6">
        <h3 class="mb-4 text-lg font-semibold text-base-content">Frequent Patterns</h3>
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
                <Icon :name="pattern.icon" class="h-4 w-4 text-white" />
              </div>
              <div>
                <div class="font-medium text-base-content">
                  {{ pattern.name }}
                </div>
                <div class="text-sm text-base-content/60">{{ pattern.frequency }}% occurrence</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-base-content">
                {{ pattern.support }}
              </div>
              <div class="text-xs text-base-content/60">support</div>
            </div>
          </div>
        </div>
      </DCard>

      <DCard class="p-6">
        <h3 class="mb-4 text-lg font-semibold text-base-content">Association Rules</h3>
        <div class="space-y-4">
          <div
            v-for="rule in associationRules"
            :key="rule.id"
            class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
          >
            <div class="mb-2 flex items-center justify-between">
              <div class="font-medium text-base-content">
                {{ rule.antecedent }}
              </div>
              <Icon name="heroicons:arrow-right" class="h-4 w-4 text-base-content/40" />
              <div class="font-medium text-base-content">
                {{ rule.consequent }}
              </div>
            </div>
            <div class="flex justify-between text-sm">
              <div>
                <span class="text-base-content/60">Confidence:</span>
                <span class="ml-1 font-semibold text-base-content">{{ rule.confidence }}%</span>
              </div>
              <div>
                <span class="text-base-content/60">Lift:</span>
                <span class="ml-1 font-semibold text-base-content">{{ rule.lift }}</span>
              </div>
            </div>
          </div>
        </div>
      </DCard>
    </div>

    <!-- Cluster Analysis -->
    <div
      class="mb-16 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-8 dark:from-violet-900/20 dark:to-purple-900/20"
    >
      <h2 class="mb-8 text-center text-2xl font-bold text-base-content">
        Cluster Analysis Results
      </h2>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div v-for="cluster in clusters" :key="cluster.id">
          <DCard class="p-6">
            <div class="mb-4 text-center">
              <div
                class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                :style="{ backgroundColor: cluster.color }"
              >
                <Icon :name="cluster.icon" class="h-6 w-6 text-white" />
              </div>
              <h3 class="text-lg font-semibold text-base-content">
                {{ cluster.name }}
              </h3>
              <p class="text-sm text-base-content/70">
                {{ cluster.description }}
              </p>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-base-content/60">Size</span>
                <span class="font-semibold text-base-content">{{ cluster.size }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-base-content/60">Density</span>
                <span class="font-semibold text-base-content">{{ cluster.density }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-base-content/60">Silhouette</span>
                <span class="font-semibold text-green-600">{{ cluster.silhouette }}</span>
              </div>
            </div>

            <DButton
              size="sm"
              variant="outline"
              class="mt-4 w-full"
              @click="exploreCluster(cluster)"
            >
              Explore Cluster
            </DButton>
          </DCard>
        </div>
      </div>
    </div>

    <!-- Data Exploration -->
    <div class="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <div class="mb-8 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-base-content">Interactive Data Explorer</h2>
        <div class="flex gap-4">
          <DSelect v-model="selectedDataset" :options="datasetOptions" />
          <DButton variant="primary">
            <Icon name="i-heroicons-play" class="mr-2 h-4 w-4" />
            Analyze
          </DButton>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <div
            class="flex h-96 items-center justify-center rounded-lg bg-gray-100 p-6 dark:bg-gray-700"
          >
            <div class="text-center">
              <Icon
                name="i-heroicons-chart-bar-square"
                class="mx-auto mb-4 h-16 w-16 text-base-content/40"
              />
              <h3 class="mb-2 text-lg font-semibold text-base-content">Data Visualization</h3>
              <p class="text-base-content/70">Interactive charts and graphs will appear here</p>
            </div>
          </div>
        </div>

        <div>
          <h3 class="mb-4 text-lg font-semibold text-base-content">Dataset Statistics</h3>
          <div class="space-y-4">
            <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div class="mb-1 text-sm text-base-content/60">Total Features</div>
              <div class="text-lg font-semibold text-base-content">24</div>
            </div>
            <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div class="mb-1 text-sm text-base-content/60">Missing Values</div>
              <div class="text-lg font-semibold text-base-content">0.02%</div>
            </div>
            <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div class="mb-1 text-sm text-base-content/60">Data Quality Score</div>
              <div class="text-lg font-semibold text-green-600">98.5%</div>
            </div>
            <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div class="mb-1 text-sm text-base-content/60">Last Updated</div>
              <div class="text-sm font-semibold text-base-content">2 hours ago</div>
            </div>
          </div>

          <div class="mt-6">
            <h4 class="text-md mb-3 font-semibold text-base-content">Export Options</h4>
            <div class="space-y-2">
              <DButton size="sm" variant="outline" class="w-full">
                <Icon name="i-heroicons-document-arrow-down" class="mr-2 h-4 w-4" />
                Export to CSV
              </DButton>
              <DButton size="sm" variant="outline" class="w-full">
                <Icon name="i-heroicons-code-bracket" class="mr-2 h-4 w-4" />
                Export to JSON
              </DButton>
              <DButton size="sm" variant="outline" class="w-full">
                <Icon name="i-heroicons-presentation-chart-bar" class="mr-2 h-4 w-4" />
                Generate Report
              </DButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DPageLayout>
</template>

<script setup lang="ts">
// Page metadata
definePageMeta({
  layout: 'dashboard',
});
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

// Frequent patterns - fetch from API or calculate from dataset
const frequentPatterns = ref<
  Array<{
    id: string;
    name: string;
    frequency: number;
    support: number;
    color: string;
    icon: string;
  }>
>([]);

// Association rules - fetch from API or calculate from dataset
const associationRules = ref<
  Array<{
    id: string;
    antecedent: string;
    consequent: string;
    confidence: number;
    lift: number;
  }>
>([]);

// Fetch data mining results from API (for future use)
// const fetchDataMiningResults = async () => {
//   try {
//     // Try to fetch from dataset statistics API
//     const stats = await $fetch('/api/dataset/statistics').catch(() => null);
//     if (stats) {
//       // Process statistics to generate patterns
//       // This would be enhanced when data mining API endpoints are available
//     }
//   } catch (error) {
//     console.debug('Data mining results not available:', error);
//   }
// };

// Explore cluster function
const exploreCluster = (cluster: any) => {
  navigateTo(`/search?cluster=${cluster.id}&q=${encodeURIComponent(cluster.name)}`);
};

// Clusters - fetch from API or calculate from dataset
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
