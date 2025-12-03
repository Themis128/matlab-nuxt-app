<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto container-responsive">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-responsive-lg font-bold text-gray-900 dark:text-white gradient-text">
              🔍 Data Mining Studio
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Upload, analyze, and mine insights from your datasets with advanced AI
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ currentDataset ? `Analyzing: ${currentDataset.name}` : 'No dataset loaded' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto container-responsive section-spacing">
      <!-- Upload Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div
          class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center"
        >
          <UIcon name="i-heroicons-cloud-arrow-up" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Upload Your Dataset
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Support for CSV, JSON, Excel files. Maximum 50MB.
          </p>
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.json,.xlsx,.xls"
            @change="handleFileUpload"
            class="hidden"
          />
          <UButton
            @click="handleFileSelect"
            color="primary"
            size="lg"
            :loading="uploading"
            :disabled="uploading"
          >
            <UIcon name="i-heroicons-document-plus" class="w-5 h-5 mr-2" />
            Choose File
          </UButton>
        </div>
      </div>

      <!-- Analysis Tabs -->
      <div v-if="currentDataset" class="mb-8">
        <UTabs v-model="activeTab" :items="analysisTabs" />

        <!-- Data Profiling Tab -->
        <div v-if="activeTab === 'profile'" class="mt-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <!-- Dataset Overview -->
            <div class="lg:col-span-1">
              <UCard>
                <h3 class="text-lg font-semibold mb-4">Dataset Overview</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Rows:</span>
                    <span class="font-semibold">{{ currentDataset.rows }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Columns:</span>
                    <span class="font-semibold">{{ currentDataset.columns }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">File Size:</span>
                    <span class="font-semibold">{{ formatFileSize(currentDataset.size) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Missing Values:</span>
                    <span class="font-semibold">{{ currentDataset.missingValues }}</span>
                  </div>
                </div>
              </UCard>
            </div>

            <!-- Column Types -->
            <div class="lg:col-span-2">
              <UCard>
                <h3 class="text-lg font-semibold mb-4">Column Analysis</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="col in currentDataset.columnTypes"
                    :key="col.name"
                    class="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <div class="flex justify-between items-center">
                      <span class="font-medium">{{ col.name }}</span>
                      <UBadge :color="getTypeColor(col.type)">{{ col.type }}</UBadge>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {{ col.unique }} unique • {{ col.missing }} missing
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </div>

          <!-- Data Preview -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Data Preview (First 10 Rows)</h3>
            </template>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      v-for="col in currentDataset.preview.columns"
                      :key="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {{ col }}
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <tr v-for="row in currentDataset.preview.data" :key="row.id">
                    <td
                      v-for="value in row"
                      :key="value"
                      class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                    >
                      {{ value }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>
        </div>

        <!-- Visualization Tab -->
        <div v-if="activeTab === 'visualize'" class="mt-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UCard>
              <h3 class="text-lg font-semibold mb-4">Distribution Analysis</h3>
              <div class="space-y-4">
                <USelectMenu
                  v-model="selectedColumn"
                  :options="numericColumns"
                  placeholder="Select numeric column"
                  class="w-full"
                />
                <div v-if="selectedColumn" class="h-64">
                  <!-- Chart placeholder - would integrate with Chart.js or similar -->
                  <div
                    class="h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center"
                  >
                    <div class="text-center">
                      <UIcon
                        name="i-heroicons-chart-bar"
                        class="w-12 h-12 mx-auto text-gray-400 mb-2"
                      />
                      <p class="text-gray-600 dark:text-gray-400">
                        Histogram of {{ selectedColumn }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-500">
                        Interactive chart would render here
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>

            <UCard>
              <h3 class="text-lg font-semibold mb-4">Correlation Matrix</h3>
              <div
                class="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center"
              >
                <div class="text-center">
                  <UIcon
                    name="i-heroicons-squares-2x2"
                    class="w-12 h-12 mx-auto text-gray-400 mb-2"
                  />
                  <p class="text-gray-600 dark:text-gray-400">Correlation Heatmap</p>
                  <p class="text-sm text-gray-500 dark:text-gray-500">
                    Feature correlation analysis
                  </p>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Feature Engineering Tab -->
        <div v-if="activeTab === 'features'" class="mt-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UCard>
              <h3 class="text-lg font-semibold mb-4">Feature Engineering Tools</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Scaling Method</label>
                  <USelectMenu
                    v-model="scalingMethod"
                    :options="scalingOptions"
                    placeholder="Choose scaling method"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Encoding Method</label>
                  <USelectMenu
                    v-model="encodingMethod"
                    :options="encodingOptions"
                    placeholder="Choose encoding method"
                  />
                </div>
                <UButton @click="applyFeatureEngineering" color="primary" :loading="processing">
                  Apply Transformations
                </UButton>
              </div>
            </UCard>

            <UCard>
              <h3 class="text-lg font-semibold mb-4">Generated Features</h3>
              <div class="space-y-2">
                <div
                  v-for="feature in engineeredFeatures"
                  :key="feature.name"
                  class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <span class="text-sm">{{ feature.name }}</span>
                  <UBadge :color="feature.type === 'numeric' ? 'green' : 'blue'">{{
                    feature.type
                  }}</UBadge>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Model Training Tab -->
        <div v-if="activeTab === 'model'" class="mt-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UCard>
              <h3 class="text-lg font-semibold mb-4">Model Configuration</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Target Variable</label>
                  <USelectMenu
                    v-model="targetVariable"
                    :options="availableTargets"
                    placeholder="Select target column"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Algorithm</label>
                  <USelectMenu
                    v-model="selectedAlgorithm"
                    :options="algorithmOptions"
                    placeholder="Choose algorithm"
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Test Size</label>
                    <UInput v-model="testSize" type="number" step="0.1" min="0.1" max="0.5" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">Random State</label>
                    <UInput v-model="randomState" type="number" />
                  </div>
                </div>
                <UButton @click="trainModel" color="primary" :loading="training" block>
                  <UIcon name="i-heroicons-cpu-chip" class="w-5 h-5 mr-2" />
                  Train Model
                </UButton>
              </div>
            </UCard>

            <UCard>
              <h3 class="text-lg font-semibold mb-4">Training Results</h3>
              <div v-if="trainingResults" class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center p-3 bg-green-50 dark:bg-green-900 rounded">
                    <div class="text-2xl font-bold text-green-600">
                      {{ trainingResults.r2.toFixed(4) }}
                    </div>
                    <div class="text-sm text-green-700 dark:text-green-300">R² Score</div>
                  </div>
                  <div class="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded">
                    <div class="text-2xl font-bold text-blue-600">
                      {{ trainingResults.rmse.toFixed(2) }}
                    </div>
                    <div class="text-sm text-blue-700 dark:text-blue-300">RMSE</div>
                  </div>
                </div>
                <div class="mt-4">
                  <h4 class="font-medium mb-2">Feature Importance</h4>
                  <div class="space-y-1">
                    <div
                      v-for="feature in trainingResults.featureImportance.slice(0, 5)"
                      :key="feature.name"
                      class="flex justify-between text-sm"
                    >
                      <span>{{ feature.name }}</span>
                      <span>{{ feature.importance.toFixed(3) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
                <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 mx-auto mb-2" />
                <p>Train a model to see results</p>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Insights Tab -->
        <div v-if="activeTab === 'insights'" class="mt-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UCard>
              <h3 class="text-lg font-semibold mb-4">Automated Insights</h3>
              <div class="space-y-3">
                <div
                  v-for="insight in insights"
                  :key="insight.id"
                  class="p-3 bg-blue-50 dark:bg-blue-900 rounded"
                >
                  <div class="flex items-start">
                    <UIcon
                      :name="insight.icon"
                      class="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                    />
                    <div>
                      <h4 class="font-medium text-blue-900 dark:text-blue-100">
                        {{ insight.title }}
                      </h4>
                      <p class="text-sm text-blue-700 dark:text-blue-300">
                        {{ insight.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>

            <UCard>
              <h3 class="text-lg font-semibold mb-4">Data Quality Report</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm">Completeness</span>
                  <div class="flex items-center">
                    <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="bg-green-600 h-2 rounded-full"
                        :style="{ width: dataQuality.completeness + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium">{{ dataQuality.completeness }}%</span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">Consistency</span>
                  <div class="flex items-center">
                    <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="bg-blue-600 h-2 rounded-full"
                        :style="{ width: dataQuality.consistency + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium">{{ dataQuality.consistency }}%</span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">Accuracy</span>
                  <div class="flex items-center">
                    <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="bg-purple-600 h-2 rounded-full"
                        :style="{ width: dataQuality.accuracy + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium">{{ dataQuality.accuracy }}%</span>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <UIcon name="i-heroicons-magnifying-glass" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Dataset Loaded</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Upload a dataset to start mining insights with advanced AI algorithms
        </p>
        <UButton @click="handleFileSelect" color="primary" size="lg">
          <UIcon name="i-heroicons-document-plus" class="w-5 h-5 mr-2" />
          Choose File
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // Page meta
  useHead({
    title: 'Data Mining Studio - Mobile Finder',
    meta: [
      {
        name: 'description',
        content:
          'Advanced data mining studio with AI-powered analysis, feature engineering, model training, and automated insights generation.',
      },
    ],
  })

  // Reactive state
  const fileInput = ref<HTMLInputElement | null>(null)
  const uploading = ref(false)
  const processing = ref(false)
  const training = ref(false)
  const currentDataset = ref(null)
  const activeTab = ref('profile')
  const selectedColumn = ref('')
  const scalingMethod = ref('')
  const encodingMethod = ref('')
  const targetVariable = ref('')
  const selectedAlgorithm = ref('')
  const testSize = ref(0.2)
  const randomState = ref(42)
  const trainingResults = ref(null)

  // Analysis tabs
  const analysisTabs = [
    { label: 'Data Profiling', value: 'profile' },
    { label: 'Visualization', value: 'visualize' },
    { label: 'Feature Engineering', value: 'features' },
    { label: 'Model Training', value: 'model' },
    { label: 'AI Insights', value: 'insights' },
  ]

  // Options
  const scalingOptions = [
    { label: 'Standard Scaler', value: 'standard' },
    { label: 'Min-Max Scaler', value: 'minmax' },
    { label: 'Robust Scaler', value: 'robust' },
  ]

  const encodingOptions = [
    { label: 'Label Encoding', value: 'label' },
    { label: 'One-Hot Encoding', value: 'onehot' },
    { label: 'Ordinal Encoding', value: 'ordinal' },
  ]

  const algorithmOptions = [
    { label: 'Linear Regression', value: 'linear' },
    { label: 'Random Forest', value: 'rf' },
    { label: 'XGBoost', value: 'xgb' },
    { label: 'Neural Network', value: 'nn' },
  ]

  // Computed properties
  const numericColumns = computed(() => {
    if (!currentDataset.value || !currentDataset.value.columnTypes) return []
    return currentDataset.value.columnTypes
      .filter((col: any) => col.type === 'numeric')
      .map((col: any) => ({ label: col.name, value: col.name }))
  })

  const availableTargets = computed(() => {
    if (!currentDataset.value || !currentDataset.value.columnTypes) return []
    return currentDataset.value.columnTypes.map((col: any) => ({
      label: col.name,
      value: col.name,
    }))
  })

  const engineeredFeatures = ref([
    { name: 'spec_density', type: 'numeric' },
    { name: 'temporal_decay', type: 'numeric' },
    { name: 'battery_weight_ratio', type: 'numeric' },
  ])

  const insights = ref([
    {
      id: 1,
      title: 'High Correlation Detected',
      description: 'RAM and price show strong positive correlation (ρ = 0.78)',
      icon: 'i-heroicons-arrow-trending-up',
    },
    {
      id: 2,
      title: 'Outlier Detection',
      description: 'Found 15 potential outliers in price distribution',
      icon: 'i-heroicons-exclamation-triangle',
    },
    {
      id: 3,
      title: 'Feature Importance',
      description: 'Battery capacity is the most predictive feature (32% importance)',
      icon: 'i-heroicons-light-bulb',
    },
  ])

  const dataQuality = ref({
    completeness: 94,
    consistency: 87,
    accuracy: 92,
  })

  // Methods
  const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    uploading.value = true

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate API call - in real implementation, this would call your backend
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock dataset analysis result
      currentDataset.value = {
        name: file.name,
        size: file.size,
        rows: 1000,
        columns: 12,
        missingValues: 45,
        columnTypes: [
          { name: 'brand', type: 'categorical', unique: 15, missing: 0 },
          { name: 'model', type: 'text', unique: 950, missing: 0 },
          { name: 'price', type: 'numeric', unique: 234, missing: 12 },
          { name: 'ram', type: 'numeric', unique: 8, missing: 5 },
          { name: 'battery', type: 'numeric', unique: 156, missing: 8 },
          { name: 'screen_size', type: 'numeric', unique: 67, missing: 3 },
          { name: 'weight', type: 'numeric', unique: 89, missing: 7 },
          { name: 'year', type: 'numeric', unique: 6, missing: 0 },
        ],
        preview: {
          columns: ['brand', 'model', 'price', 'ram', 'battery'],
          data: [
            ['Apple', 'iPhone 15 Pro', 1199, 8, 3274],
            ['Samsung', 'Galaxy S24', 899, 8, 4000],
            ['Google', 'Pixel 8', 699, 8, 4575],
            ['OnePlus', '12', 899, 12, 5000],
          ],
        },
      }

      // Show success message
      // console.log('Dataset uploaded and analyzed successfully')
    } catch (error) {
      console.error('Upload failed:', error)
      // Show error message
    } finally {
      uploading.value = false
    }
  }

  const applyFeatureEngineering = async () => {
    processing.value = true

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Add new features
      engineeredFeatures.value.push(
        { name: 'ram_battery_ratio', type: 'numeric' },
        { name: 'price_per_gb_ram', type: 'numeric' },
        { name: 'brand_encoded', type: 'categorical' }
      )

      // console.log('Feature engineering completed')
    } catch (error) {
      console.error('Feature engineering failed:', error)
    } finally {
      processing.value = false
    }
  }

  const trainModel = async () => {
    if (!targetVariable.value || !selectedAlgorithm.value) return

    training.value = true

    try {
      // Simulate training
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock training results
      trainingResults.value = {
        r2: 0.8456,
        rmse: 156.78,
        featureImportance: [
          { name: 'ram', importance: 0.32 },
          { name: 'battery', importance: 0.28 },
          { name: 'brand_encoded', importance: 0.18 },
          { name: 'screen_size', importance: 0.12 },
          { name: 'weight', importance: 0.1 },
        ],
      }

      // console.log('Model training completed')
    } catch (error) {
      console.error('Training failed:', error)
    } finally {
      training.value = false
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'numeric':
        return 'green'
      case 'categorical':
        return 'blue'
      case 'text':
        return 'orange'
      default:
        return 'gray'
    }
  }

  const handleFileSelect = () => {
    fileInput.value?.click()
  }
</script>
