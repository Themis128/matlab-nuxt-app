<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <section class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl sm:text-5xl font-bold mb-4">API Documentation</h1>
        <p class="text-xl text-emerald-100 max-w-2xl mx-auto">
          Complete reference for MATLAB Deep Learning Platform APIs and integration endpoints
        </p>
      </div>
    </section>

    <!-- Category Filter -->
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

        <!-- API Cards -->
        <div class="space-y-8">
          <UCard v-for="api in filteredAPIs" :key="api.id" class="overflow-hidden">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                  <UBadge color="emerald" variant="solid" size="lg">
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
                    "
                    class="w-4 h-4"
                  />
                </UButton>
              </div>
              <div v-if="expandedAPIs.has(api.id)" class="space-y-6">
                <div class="mb-2">
                  <span class="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{{
                    api.endpoint
                  }}</span>
                </div>
                <div v-if="api.parameters && api.parameters.length">
                  <h4 class="font-semibold text-sm mb-1">Parameters</h4>
                  <ul class="list-disc ml-6 mb-2">
                    <li v-for="param in api.parameters" :key="param.name">
                      <span class="font-mono text-xs">{{ param.name }}</span
                      >: {{ param.type
                      }}<span v-if="param.required" class="text-red-500 ml-1">*</span>
                      <span class="text-gray-500">- {{ param.description }}</span>
                    </li>
                  </ul>
                </div>
                <div v-if="api.responses && api.responses.length">
                  <h4 class="font-semibold text-sm mb-1">Responses</h4>
                  <ul class="list-disc ml-6 mb-2">
                    <li v-for="resp in api.responses" :key="resp.code">
                      <span class="font-mono text-xs">{{ resp.code }}</span
                      >: {{ resp.description }}
                    </li>
                  </ul>
                </div>
                <div v-if="api.examples && api.examples.length">
                  <h4 class="font-semibold text-sm mb-1">Examples</h4>
                  <div class="bg-gray-100 dark:bg-gray-900 rounded p-3 mb-2">
                    <pre class="text-xs whitespace-pre-wrap">{{ api.examples.join('\n\n') }}</pre>
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
                <div
                  :style="{ backgroundColor: sdk.color }"
                  class="w-12 h-12 mx-auto rounded flex items-center justify-center mb-2"
                >
                  <UIcon :name="sdk.icon" class="w-5 h-5 text-white" />
                </div>
                <div class="font-semibold">{{ sdk.language }}</div>
              </div>
              <pre class="text-xs bg-gray-900 text-green-400 p-2 rounded">{{
                sdk.installCommand
              }}</pre>
            </UCard>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  const apiCategories = ref([
    { id: 'core', name: 'Core', icon: 'i-heroicons-cube-transparent' },
    { id: 'ml', name: 'ML', icon: 'i-heroicons-cog-6-tooth' },
    { id: 'data', name: 'Data', icon: 'i-heroicons-table-cells' },
    { id: 'utils', name: 'Utils', icon: 'i-heroicons-wrench-screwdriver' },
  ])

  const selectedCategory = ref(apiCategories.value[0]?.id || 'core')

  const apis = ref([
    {
      id: 'predict',
      name: 'Predict',
      description: 'Run predictions on mobile dataset.',
      method: 'POST',
      methodColor: 'emerald',
      endpoint: '/api/predict',
      category: 'core',
      parameters: [
        { name: 'ram', type: 'number', required: true, description: 'RAM in GB' },
        { name: 'battery', type: 'number', required: true, description: 'Battery in mAh' },
      ],
      responses: [{ code: '200', description: 'Success' }],
      examples: ['POST /api/predict\n{\n  "ram": 8,\n  "battery": 4000\n}'],
    },
    {
      id: 'train',
      name: 'Train Model',
      description: 'Train a new deep learning model.',
      method: 'POST',
      methodColor: 'teal',
      endpoint: '/api/train',
      category: 'ml',
      parameters: [
        { name: 'epochs', type: 'number', required: true, description: 'Number of epochs' },
      ],
      responses: [{ code: '200', description: 'Training started' }],
      examples: ['POST /api/train\n{\n  "epochs": 100\n}'],
    },
  ])

  const filteredAPIs = computed(() =>
    apis.value.filter(api => api.category === selectedCategory.value)
  )

  const expandedAPIs = ref(new Set<string>())

  function toggleExpanded(id: string) {
    if (expandedAPIs.value.has(id)) {
      expandedAPIs.value.delete(id)
    } else {
      expandedAPIs.value.add(id)
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'string':
        return 'blue'
      case 'number':
        return 'green'
      case 'boolean':
        return 'yellow'
      default:
        return 'gray'
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  const sdks = ref([
    {
      language: 'Python',
      icon: 'i-heroicons-code-bracket',
      color: '#3776AB',
      installCommand: 'pip install matlab-dl-sdk',
    },
    {
      language: 'JavaScript',
      icon: 'i-heroicons-code-bracket-square',
      color: '#F7DF1E',
      installCommand: 'npm install matlab-dl-sdk',
    },
    {
      language: 'MATLAB',
      icon: 'i-heroicons-cpu-chip',
      color: '#0076A8',
      installCommand: "addpath(genpath('matlab-dl-sdk'))",
    },
  ])
</script>
