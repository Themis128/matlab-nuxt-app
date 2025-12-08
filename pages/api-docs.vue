<template>
  <DPageLayout
    :show-hero="true"
    title="API Documentation"
    description="Complete reference for MATLAB Deep Learning Platform APIs and integration endpoints"
    bg="base-100"
  >
    <template #hero-actions>
      <span class="badge badge-success badge-lg mb-4">
        <Icon name="heroicons:document-text" class="h-3 w-3" />
        API Reference
      </span>
    </template>

    <!-- Category Filter -->
    <section class="py-12">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <div class="flex flex-wrap justify-center gap-3">
            <DButton
              v-for="cat in apiCategories"
              :key="cat.id"
              :variant="selectedCategory === cat.id ? 'success' : 'outline'"
              @click="selectedCategory = cat.id"
            >
              <Icon :name="cat.icon" class="mr-2 h-4 w-4" />
              {{ cat.name }}
            </DButton>
          </div>
        </div>

        <!-- API Cards -->
        <div class="space-y-8">
          <DCard v-for="api in filteredAPIs" :key="api.id" class="overflow-hidden">
            <div class="card-body">
              <div class="mb-4 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="badge badge-success badge-lg">
                    {{ api.method }}
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                      {{ api.name }}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-300">
                      {{ api.description }}
                    </p>
                  </div>
                </div>
                <DButton size="sm" variant="outline" @click="toggleExpanded(api.id)">
                  <Icon
                    :name="
                      expandedAPIs.has(api.id)
                        ? 'i-heroicons-chevron-up'
                        : 'i-heroicons-chevron-down'
                    "
                    class="h-4 w-4"
                  />
                </DButton>
              </div>
              <div v-if="expandedAPIs.has(api.id)" class="space-y-6">
                <div class="mb-2">
                  <span class="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-800">{{
                    api.endpoint
                  }}</span>
                </div>
                <div v-if="api.parameters && api.parameters.length">
                  <h4 class="mb-1 text-sm font-semibold">Parameters</h4>
                  <ul class="mb-2 ml-6 list-disc">
                    <li v-for="param in api.parameters" :key="param.name">
                      <span class="font-mono text-xs">{{ param.name }}</span
                      >: {{ param.type
                      }}<span v-if="param.required" class="ml-1 text-red-500">*</span>
                      <span class="text-gray-500">- {{ param.description }}</span>
                    </li>
                  </ul>
                </div>
                <div v-if="api.responses && api.responses.length">
                  <h4 class="mb-1 text-sm font-semibold">Responses</h4>
                  <ul class="mb-2 ml-6 list-disc">
                    <li v-for="resp in api.responses" :key="resp.code">
                      <span class="font-mono text-xs">{{ resp.code }}</span
                      >: {{ resp.description }}
                    </li>
                  </ul>
                </div>
                <div v-if="api.examples && api.examples.length">
                  <h4 class="mb-1 text-sm font-semibold">Examples</h4>
                  <div class="mb-2 rounded bg-gray-100 p-3 dark:bg-gray-900">
                    <pre class="whitespace-pre-wrap text-xs">{{ api.examples.join('\n\n') }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </DCard>
        </div>

        <!-- SDKs -->
        <div class="mt-12">
          <h2 class="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">SDKs</h2>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <DCard v-for="sdk in sdks" :key="sdk.language" class="p-4 text-center">
              <div class="mb-3">
                <div
                  :style="{ backgroundColor: sdk.color }"
                  class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded"
                >
                  <UIcon :name="sdk.icon" class="h-5 w-5 text-white" />
                </div>
                <div class="font-semibold">
                  {{ sdk.language }}
                </div>
              </div>
              <pre class="rounded bg-gray-900 p-2 text-xs text-green-400">{{
                sdk.installCommand
              }}</pre>
            </DCard>
          </div>
        </div>
      </div>
    </section>
  </DPageLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const apiCategories = ref([
  { id: 'core', name: 'Core', icon: 'i-heroicons-cube-transparent' },
  { id: 'ml', name: 'ML', icon: 'i-heroicons-cog-6-tooth' },
  { id: 'data', name: 'Data', icon: 'i-heroicons-table-cells' },
  { id: 'utils', name: 'Utils', icon: 'i-heroicons-wrench-screwdriver' },
]);

const selectedCategory = ref(apiCategories.value[0]?.id || 'core');

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
]);

const filteredAPIs = computed(() =>
  apis.value.filter((api) => api.category === selectedCategory.value)
);

const expandedAPIs = ref(new Set<string>());

function toggleExpanded(id: string) {
  if (expandedAPIs.value.has(id)) {
    expandedAPIs.value.delete(id);
  } else {
    expandedAPIs.value.add(id);
  }
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
]);
</script>
