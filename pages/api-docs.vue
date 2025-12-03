<template>
  <div class="min-h-screen bg-background">
    <section class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl sm:text-5xl font-bold mb-4">API Documentation</h1>
        <p class="text-xl text-emerald-100 max-w-2xl mx-auto">
          Complete reference for MATLAB Deep Learning Platform APIs and integration endpoints
        </p>
      </div>
    </section>

    <section class="py-12">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <div class="flex flex-wrap gap-3 justify-center">
            <UButton
              v-for="cat in apiCategories"
              :key="cat.id"
              @click="selectedCategory = cat.id"
              :color="selectedCategory === cat.id ? 'emerald' : 'gray'"
              variant="outline"
            >
              <UIcon :name="cat.icon" class="w-4 h-4 mr-2" />
              {{ cat.name }}
            </UButton>
          </div>
        </div>

        <!-- Selected Category APIs -->
        <div class="space-y-8">
          <UCard v-for="api in filteredAPIs" :key="api.id" class="overflow-hidden">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                  <UBadge :color="api.methodColor" variant="solid" size="lg">
                    {{ api.method }}
                  </UBadge>
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                      {{ api.name }}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-300">{{ api.description }}</p>
                  </div>
                </div>
                <UButton size="sm" variant="outline" @click="toggleExpanded(api.id)">
                  <UIcon
                    :name="
                      expandedAPIs.has(api.id)
                        ? 'i-heroicons-chevron-up'
                        : 'i-heroicons-chevron-down'


                        <div class="min-h-screen bg-background">
                          <section class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
                            <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                              <h1 class="text-4xl sm:text-5xl font-bold mb-4">API Documentation</h1>
                              <p class="text-xl text-emerald-100 max-w-2xl mx-auto">
                                Complete reference for MATLAB Deep Learning Platform APIs and integration endpoints
                              </p>
                            </div>
                          </section>

                          <section class="py-12">
                            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                              <div class="mb-8">
                                <div class="flex flex-wrap gap-3 justify-center">
                                  <UButton
                                    v-for="cat in apiCategories"
                                    :key="cat.id"
                                    @click="selectedCategory = cat.id"
                                    :color="selectedCategory === cat.id ? 'emerald' : 'gray'"
                                    variant="outline"
                                  >
                                    <UIcon :name="cat.icon" class="w-4 h-4 mr-2" />
                                    {{ cat.name }}
                                  </UButton>
                                </div>
                              </div>

                              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <UCard v-for="api in filteredAPIs" :key="api.id" class="p-4">
                                  <div class="flex items-center justify-between mb-2">
                                    <div>
                                      <h3 class="font-semibold text-gray-900 dark:text-white">{{ api.name }}</h3>
                                      <div class="text-xs text-gray-500">{{ api.endpoint }}</div>
                                    </div>
                                    <UBadge :color="api.methodColor" variant="soft">{{ api.method }}</UBadge>
                                  </div>
                                  <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">{{ api.description }}</p>
                                  <div v-if="api.examples && api.examples.length">
                                    <h4 class="text-sm font-medium mb-2">Examples</h4>
                                    <div v-for="ex in api.examples" :key="ex.language" class="mb-2">
                                      <div class="text-xs text-gray-400 mb-1">{{ ex.language }}</div>
                                      <pre class="text-xs bg-gray-900 text-green-400 p-2 rounded"><code>{{ ex.code }}</code></pre>
                                    </div>
                                  </div>
                                </UCard>
                              </div>

                              <div class="mt-12">
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">SDKs</h2>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <UCard v-for="sdk in sdks" :key="sdk.language" class="p-4 text-center">
                                    <div class="mb-3">
                                      <div :style="{ backgroundColor: sdk.color }" class="w-12 h-12 mx-auto rounded flex items-center justify-center mb-2">
                                        <UIcon :name="sdk.icon" class="w-5 h-5 text-white" />
                                      </div>
                                      <div class="font-semibold">{{ sdk.language }}</div>
                                    </div>

                                      <div class="min-h-screen bg-background">
                                        <section class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
                                          <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                            <h1 class="text-4xl sm:text-5xl font-bold mb-4">API Documentation</h1>
                                            <p class="text-xl text-emerald-100 max-w-2xl mx-auto">
                                              Complete reference for MATLAB Deep Learning Platform APIs and integration endpoints
                                            </p>
                                          </div>
                                        </section>

                                        <section class="py-12">
                                          <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                                            <div class="mb-8">
                                              <div class="flex flex-wrap gap-3 justify-center">
                                                <UButton
                                                  v-for="cat in apiCategories"
                                                  :key="cat.id"
                                                  @click="selectedCategory = cat.id"
                                                  :color="selectedCategory === cat.id ? 'emerald' : 'gray'"
                                                  variant="outline"
                                                >
                                                  <UIcon :name="cat.icon" class="w-4 h-4 mr-2" />
                                                  {{ cat.name }}
                                                </UButton>
                                              </div>
                                            </div>

                                            <!-- Selected Category APIs -->
                                            <div class="space-y-8">
                                              <UCard v-for="api in filteredAPIs" :key="api.id" class="overflow-hidden">
                                                <div class="p-6">
                                                  <div class="flex items-center justify-between mb-4">
                                                    <div class="flex items-center gap-4">
                                                      <UBadge :color="api.methodColor" variant="solid" size="lg">
                                                        {{ api.method }}
                                                      </UBadge>
                                                      <div>
                                                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ api.name }}</h3>
                                                        <p class="text-gray-600 dark:text-gray-300">{{ api.description }}</p>
                                                      </div>
                                                    </div>
                                                    <UButton size="sm" variant="outline" @click="toggleExpanded(api.id)">
                                                      <UIcon :name="expandedAPIs.has(api.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4" />
                                                    </UButton>
                                                  </div>

                                                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                                                    <code class="text-sm text-gray-800 dark:text-gray-200">{{ api.endpoint }}</code>
                                                  </div>

                                                  <!-- Expanded Details -->
                                                  <div v-if="expandedAPIs.has(api.id)" class="space-y-6">
                                                    <div v-if="api.parameters && api.parameters.length > 0">
                                                      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Parameters</h4>
                                                      <div class="overflow-x-auto">
                                                        <table class="w-full text-sm">
                                                          <thead>
                                                            <tr class="border-b border-gray-200 dark:border-gray-600">
                                                              <th class="text-left py-2 font-semibold text-gray-900 dark:text-white">Name</th>
                                                              <th class="text-left py-2 font-semibold text-gray-900 dark:text-white">Type</th>
                                                              <th class="text-left py-2 font-semibold text-gray-900 dark:text-white">Required</th>
                                                              <th class="text-left py-2 font-semibold text-gray-900 dark:text-white">Description</th>
                                                            </tr>
                                                          </thead>
                                                          <tbody>
                                                            <tr v-for="param in api.parameters" :key="param.name" class="border-b border-gray-100 dark:border-gray-700">
                                                              <td class="py-2 font-mono text-gray-800 dark:text-gray-200">{{ param.name }}</td>
                                                              <td class="py-2">
                                                                <UBadge :color="getTypeColor(param.type)" variant="soft" size="sm">{{ param.type }}</UBadge>
                                                              </td>
                                                              <td class="py-2">
                                                                <UIcon :name="param.required ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" :class="param.required ? 'text-green-500' : 'text-gray-400'" class="w-4 h-4" />
                                                              </td>
                                                              <td class="py-2 text-gray-600 dark:text-gray-300">{{ param.description }}</td>
                                                            </tr>
                                                          </tbody>
                                                        </table>
                                                      </div>
                                                    </div>

                                                    <div v-if="api.requestBody">
                                                      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Request Body</h4>
                                                      <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                                        <pre class="text-green-400 text-sm"><code>{{ JSON.stringify(api.requestBody, null, 2) }}</code></pre>
                                                      </div>
                                                    </div>

                                                    <div v-if="api.response">
                                                      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Response</h4>
                                                      <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                                        <pre class="text-green-400 text-sm"><code>{{ JSON.stringify(api.response, null, 2) }}</code></pre>
                                                      </div>
                                                    </div>

                                                    <div v-if="api.examples && api.examples.length > 0">
                                                      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Examples</h4>
                                                      <div class="space-y-4">
                                                        <div v-for="example in api.examples" :key="example.language" class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                                          <div class="flex items-center justify-between mb-2">
                                                            <span class="text-gray-400 text-sm">{{ example.language }}</span>
                                                            <UButton size="xs" variant="outline" @click="copyToClipboard(example.code)">
                                                              <UIcon name="i-heroicons-document-duplicate" class="w-3 h-3 mr-1" />
                                                              Copy
                                                            </UButton>
                                                          </div>
                                                          <pre class="text-green-400 text-sm"><code>{{ example.code }}</code></pre>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </UCard>
                                            </div>

                                            <!-- SDKs -->
                                            <div class="mt-12">
                                              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">SDKs</h2>
                                              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <UCard v-for="sdk in sdks" :key="sdk.language" class="p-4 text-center">
                                                  <div class="mb-3">
                                                    <div :style="{ backgroundColor: sdk.color }" class="w-12 h-12 mx-auto rounded flex items-center justify-center mb-2">
                                                      <UIcon :name="sdk.icon" class="w-5 h-5 text-white" />
                                                    </div>
                                                    <div class="font-semibold">{{ sdk.language }}</div>
                                                  </div>
                                                  <pre class="text-xs bg-gray-900 text-green-400 p-2 rounded">{{ sdk.installCommand }}</pre>
                                                </UCard>
                                              </div>
                                            </div>
                                          </div>
                                        </section>

                                        <div class="min-h-screen bg-background">
                                          <section class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
                                            <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                              <h1 class="text-4xl sm:text-5xl font-bold mb-4">API Documentation</h1>
                                              <p class="text-xl text-emerald-100 max-w-2xl mx-auto">
                                                Complete reference for MATLAB Deep Learning Platform APIs and integration endpoints
                                              </p>
                                            </div>
                                          </section>

                                          <section class="py-12">
                                            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                                              <div class="mb-8">
                                                <div class="flex flex-wrap gap-3 justify-center">
                                                  <UButton
                                                    v-for="cat in apiCategories"
                                                    :key="cat.id"
                                                    @click="selectedCategory = cat.id"
                                                    :color="selectedCategory === cat.id ? 'emerald' : 'gray'"
                                                    variant="outline"
                                                  >
                                                    <UIcon :name="cat.icon" class="w-4 h-4 mr-2" />
                                                    {{ cat.name }}
                                                  </UButton>
                                                </div>
                                              </div>

                                              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <UCard v-for="api in filteredAPIs" :key="api.id" class="p-4">
                                                  <div class="flex items-center justify-between mb-2">
                                                    <div>
                                                      <h3 class="font-semibold text-gray-900 dark:text-white">{{ api.name }}</h3>
                                                      <div class="text-xs text-gray-500">{{ api.endpoint }}</div>
                                                    </div>
                                                    <UBadge :color="api.methodColor" variant="soft">{{ api.method }}</UBadge>
                                                  </div>
                                                  <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">{{ api.description }}</p>
                                                  <div v-if="api.examples && api.examples.length">
                                                    <h4 class="text-sm font-medium mb-2">Examples</h4>
                                                    <div v-for="ex in api.examples" :key="ex.language" class="mb-2">
                                                      <div class="text-xs text-gray-400 mb-1">{{ ex.language }}</div>
                                                      <pre class="text-xs bg-gray-900 text-green-400 p-2 rounded"><code>{{ ex.code }}</code></pre>
                                                    </div>
                                                  </div>
                                                  <UButton size="sm" variant="outline" @click="toggleExpanded(api.id)">
                                                    <UIcon :name="expandedAPIs.has(api.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4" />
                                                  </UButton>
                                                  <div v-if="expandedAPIs.has(api.id)" class="space-y-6 mt-4">
                                                    <div v-if="api.parameters && api.parameters.length > 0">
                                                      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Parameters</h4>
                                                      <div class="overflow-x-auto">
                                                        <table class="w-full text-sm">
                                                          <thead>
                                                            <tr class="border-b border-gray-200 dark:border-gray-600">
                                                              <th class="text-left py-2 font-semibold text-gray-900 dark:text-white">Name</th>
                                                              <th class="text-left py-2 font-semibold text-gray-900 dark:text-white">Type</th>
                                                              <th class="text-left py-2 font-semibold text-gray-900 dark:text-white">Required</th>
                                                              <th class="text-left py-2 font-semibold text-gray-900 dark:text-white">Description</th>
                                                            </tr>
                                                          </thead>
                                                          <tbody>
                                                            <tr v-for="param in api.parameters" :key="param.name" class="border-b border-gray-100 dark:border-gray-700">
                                                              <td class="py-2 font-mono text-gray-800 dark:text-gray-200">{{ param.name }}</td>
                                                              <td class="py-2">
                                                                <UBadge :color="getTypeColor(param.type)" variant="soft" size="sm">{{ param.type }}</UBadge>
                                                              </td>
                                                              <td class="py-2">
                                                                <UIcon :name="param.required ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" :class="param.required ? 'text-green-500' : 'text-gray-400'" class="w-4 h-4" />
                                                              </td>
                                                              <td class="py-2 text-gray-600 dark:text-gray-300">{{ param.description }}</td>
                                                            </tr>
                                                          </tbody>
                                                        </table>
                                                      </div>
                                                    </div>
                                                    <div v-if="api.requestBody">
                                                      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Request Body</h4>
                                                      <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                                        <pre class="text-green-400 text-sm"><code>{{ JSON.stringify(api.requestBody, null, 2) }}</code></pre>
                                                      </div>
                                                    </div>
                                                    <div v-if="api.response">
                                                      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Response</h4>
                                                      <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                                        <pre class="text-blue-400 text-sm"><code>{{ JSON.stringify(api.response, null, 2) }}</code></pre>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </UCard>
                                              </div>

                                              <div class="mt-12">
                                                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">SDKs</h2>
                                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                  <UCard v-for="sdk in sdks" :key="sdk.language" class="p-4 text-center">
                                                    <div class="mb-3">
                                                      <div :style="{ backgroundColor: sdk.color }" class="w-12 h-12 mx-auto rounded flex items-center justify-center mb-2">
                                                        <UIcon :name="sdk.icon" class="w-5 h-5 text-white" />
                                                      </div>
                                                      <div class="font-semibold">{{ sdk.language }}</div>
                                                    </div>
                                                    <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">{{ sdk.description }}</div>
                                                    <UButton size="sm" variant="outline" @click="copyToClipboard(sdk.install)">
                                                      <UIcon name="i-heroicons-clipboard" class="w-4 h-4 mr-1" />
                                                      Copy Install
                                                    </UButton>
                                                  </UCard>
                                                </div>
                                              </div>
                                            </div>
                                          </section>
                                        </div>



                                    <script setup lang="ts">
                                    import { ref, computed, onMounted } from 'vue'

                                    onMounted(() => {
                                      document.title = 'API Documentation - MATLAB Deep Learning Platform'
                                    })

                                    const selectedCategory = ref<string>('models')
                                    const expandedAPIs = ref(new Set<string>())

                                    const apiCategories = [
                                      { id: 'models', name: 'Models', icon: 'i-heroicons-cpu-chip' },
                                      { id: 'inference', name: 'Inference', icon: 'i-heroicons-bolt' },
                                      { id: 'datasets', name: 'Datasets', icon: 'i-heroicons-database' },
                                    ]

                                    const apiDocumentation = [
                                      {
                                        id: 'get-models',
                                        category: 'models',
                                        name: 'List Models',
                                        description: 'Retrieve all available machine learning models',
                                        method: 'GET',
                                        methodColor: 'blue',
                                        endpoint: 'GET /api/v1/models',
                                        parameters: [
                                          { name: 'limit', type: 'integer', required: false, description: 'Maximum number of models' },
                                          { name: 'offset', type: 'integer', required: false, description: 'Number of models to skip' },
                                        ],
                                        response: { models: [], total: 0 },
                                      },
                                      {
                                        id: 'post-predict',
                                        category: 'inference',
                                        name: 'Model Prediction',
                                        description: 'Run inference on a trained model',
                                        method: 'POST',
                                        methodColor: 'green',
                                        endpoint: 'POST /api/v1/predict',
                                        requestBody: { model_id: 'string', input_data: {} },
                                        response: { prediction: {} },
                                        examples: [
                                          { language: 'cURL', code: "curl -X POST 'https://api.example.com/v1/predict' -d '{}'" },
                                        ],
                                      },
                                    ]

                                    const sdks = [
                                      { language: 'JavaScript', icon: 'i-heroicons-code-bracket', color: '#F97316', installCommand: 'npm install @matlab/sdk' },
                                      { language: 'Python', icon: 'i-heroicons-terminal', color: '#2563EB', installCommand: 'pip install matlab_sdk' },
                                    ]

                                    const filteredAPIs = computed(() => apiDocumentation.filter(a => !selectedCategory.value || a.category === selectedCategory.value))

                                    function toggleExpanded(id: string) {
                                      if (expandedAPIs.value.has(id)) expandedAPIs.value.delete(id)
                                      else expandedAPIs.value.add(id)
                                    }

                                    function getTypeColor(type: string) {
                                      const map: Record<string, string> = { integer: 'purple', string: 'blue', object: 'teal' }
                                      return map[type] || 'gray'
                                    }

                                    function copyToClipboard(text: string) {
                                      try {
                                        navigator.clipboard?.writeText(text)
                                      } catch (e) {
                                        // no-op
                                      }
                                    }
                                    </script>
                          <td class="py-2">
