<template>
  <div class="min-h-screen bg-background">
    <!-- Header Section -->
    <section class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold mb-4">
            API Documentation
          </h1>
          <p class="text-xl text-emerald-100 max-w-2xl mx-auto">
            Complete reference for MATLAB Deep Learning Platform APIs and integration endpoints
          </p>
        </div>
      </div>
    </section>

    <!-- API Navigation -->
    <section class="py-20">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Quick Links -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-16">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            API Quick Access
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UCard v-for=" endpoint in quickEndpoints " :key=" endpoint.id "
              class="p-6 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div class="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                :class=" endpoint.colorClass ">
                <UIcon :name=" endpoint.icon " class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ endpoint.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">{{ endpoint.description }}</p>
              <div class="flex items-center justify-center gap-2">
                <UBadge :color=" endpoint.methodColor " variant="soft">{{ endpoint.method }}</UBadge>
                <span class="text-xs text-gray-500">{{ endpoint.path }}</span>
              </div>
            </UCard>
          </div>
        </div>

        <!-- API Categories -->
        <div class="mb-16">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            API Categories
          </h2>

          <div class="flex flex-wrap justify-center gap-4 mb-8">
            <UButton v-for=" category in apiCategories " :key=" category.id "
              :color=" selectedCategory === category.id ? 'emerald' : 'gray' " variant="outline"
              @click="selectedCategory = category.id">
              <UIcon :name=" category.icon " class="w-4 h-4 mr-2" />
              {{ category.name }}
            </UButton>
          </div>
        </div>

        <!-- Selected Category APIs -->
        <div class="space-y-8">
          <UCard v-for=" api in filteredAPIs " :key=" api.id " class="overflow-hidden">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                  <UBadge :color=" api.methodColor " variant="solid" size="lg">
                    {{ api.method }}
                  </UBadge>
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ api.name }}</h3>
                    <p class="text-gray-600 dark:text-gray-300">{{ api.description }}</p>
                  </div>
                </div>
                <UButton size="sm" variant="outline" @click="toggleExpanded( api.id )">
                  <UIcon :name=" expandedAPIs.has( api.id ) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down' "
                    class="w-4 h-4" />
                </UButton>
              </div>

              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <code class="text-sm text-gray-800 dark:text-gray-200">{{ api.endpoint }}</code>
              </div>

              <!-- Expanded Details -->
              <div v-if=" expandedAPIs.has( api.id ) " class="space-y-6">
                <!-- Parameters -->
                <div v-if=" api.parameters && api.parameters.length > 0 ">
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
                        <tr v-for=" param in api.parameters " :key=" param.name "
                          class="border-b border-gray-100 dark:border-gray-700">
                          <td class="py-2 font-mono text-gray-800 dark:text-gray-200">{{ param.name }}</td>
                          <td class="py-2">
                            <UBadge :color=" getTypeColor( param.type ) " variant="soft" size="sm">{{ param.type }}</UBadge>
                          </td>
                          <td class="py-2">
                            <UIcon :name=" param.required ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle' "
                              :class=" param.required ? 'text-green-500' : 'text-gray-400' " class="w-4 h-4" />
                          </td>
                          <td class="py-2 text-gray-600 dark:text-gray-300">{{ param.description }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Request Body -->
                <div v-if=" api.requestBody ">
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Request Body</h4>
                  <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre
                      class="text-green-400 text-sm"><code>{{ JSON.stringify( api.requestBody, null, 2 ) }}</code></pre>
                  </div>
                </div>

                <!-- Response -->
                <div v-if=" api.response ">
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Response</h4>
                  <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre class="text-green-400 text-sm"><code>{{ JSON.stringify( api.response, null, 2 ) }}</code></pre>
                  </div>
                </div>

                <!-- Examples -->
                <div v-if=" api.examples && api.examples.length > 0 ">
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Examples</h4>
                  <div class="space-y-4">
                    <div v-for=" example in api.examples " :key=" example.language "
                      class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-400 text-sm">{{ example.language }}</span>
                        <UButton size="xs" variant="outline" @click="copyToClipboard( example.code )">
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

        <!-- Authentication Section -->
        <div
          class="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-8 mt-16">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Authentication
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UCard class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Key Authentication</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key Header
                  </label>
                  <div class="bg-gray-900 rounded-lg p-3">
                    <code class="text-green-400 text-sm">X-API-Key: your-api-key-here</code>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Authorization Header (Alternative)
                  </label>
                  <div class="bg-gray-900 rounded-lg p-3">
                    <code class="text-green-400 text-sm">Authorization: Bearer your-api-key-here</code>
                  </div>
                </div>
              </div>
            </UCard>

            <UCard class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rate Limiting</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-300">Requests per minute</span>
                  <span class="font-semibold text-gray-900 dark:text-white">1000</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-300">Requests per day</span>
                  <span class="font-semibold text-gray-900 dark:text-white">50,000</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-300">Burst limit</span>
                  <span class="font-semibold text-gray-900 dark:text-white">100</span>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- SDK Installation -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mt-16">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            SDK Installation
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UCard v-for=" sdk in sdks " :key=" sdk.language " class="p-6">
              <div class="text-center mb-4">
                <div class="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center"
                  :style=" { backgroundColor: sdk.color } ">
                  <UIcon :name=" sdk.icon " class="w-6 h-6 text-white" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ sdk.language }}</h3>
              </div>

              <div class="bg-gray-900 rounded-lg p-4 mb-4">
                <pre class="text-green-400 text-sm"><code>{{ sdk.installCommand }}</code></pre>
              </div>

              <div class="space-y-2">
                <UButton size="sm" variant="outline" class="w-full">
                  Download SDK
                </UButton>
                <UButton size="sm" variant="outline" class="w-full">
                  View Examples
                </UButton>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  // Page meta
  useHead( {
    title: 'API Documentation - MATLAB Deep Learning Platform',
    meta: [
      {
        name: 'description',
        content: 'Complete API documentation for MATLAB Deep Learning Platform integration and development'
      }
    ]
  } )

  // Selected category
  const selectedCategory = ref( 'models' )

  // Expanded APIs
  const expandedAPIs = ref( new Set() )

  // API Categories
  const apiCategories = ref( [
    { id: 'models', name: 'Models', icon: 'i-heroicons-cpu-chip' },
    { id: 'datasets', name: 'Datasets', icon: 'i-heroicons-database' },
    { id: 'training', name: 'Training', icon: 'i-heroicons-academic-cap' },
    { id: 'inference', name: 'Inference', icon: 'i-heroicons-bolt' },
    { id: 'analytics', name: 'Analytics', icon: 'i-heroicons-chart-bar' }
  ] )

  // Quick Access Endpoints
  const quickEndpoints = ref( [
    {
      id: 'predict',
      name: 'Model Prediction',
      description: 'Run inference on trained models',
      method: 'POST',
      path: '/api/v1/predict',
      colorClass: 'bg-emerald-500',
      methodColor: 'green'
    },
    {
      id: 'train',
      name: 'Model Training',
      description: 'Start training jobs',
      method: 'POST',
      path: '/api/v1/train',
      colorClass: 'bg-blue-500',
      methodColor: 'blue'
    },
    {
      id: 'models',
      name: 'List Models',
      description: 'Get all available models',
      method: 'GET',
      path: '/api/v1/models',
      colorClass: 'bg-purple-500',
      methodColor: 'purple'
    },
    {
      id: 'datasets',
      name: 'Dataset Info',
      description: 'Access dataset metadata',
      method: 'GET',
      path: '/api/v1/datasets',
      colorClass: 'bg-orange-500',
      methodColor: 'orange'
    }
  ] )

  // Complete API Documentation
  const apiDocumentation = ref( [
    {
      id: 'get-models',
      category: 'models',
      name: 'List Models',
      description: 'Retrieve all available machine learning models',
      method: 'GET',
      methodColor: 'purple',
      endpoint: 'GET /api/v1/models',
      parameters: [
        { name: 'limit', type: 'integer', required: false, description: 'Maximum number of models to return (default: 50)' },
        { name: 'offset', type: 'integer', required: false, description: 'Number of models to skip (default: 0)' },
        { name: 'category', type: 'string', required: false, description: 'Filter by model category' }
      ],
      response: {
        models: [
          {
            id: "mobilenet-v2",
            name: "MobileNet V2",
            category: "computer-vision",
            accuracy: 94.7,
            created_at: "2024-01-15T10:30:00Z"
          }
        ],
        total: 1,
        limit: 50,
        offset: 0
      },
      examples: [
        {
          language: 'cURL',
          code: `curl -X GET "https://api.matlab-ml.com/v1/models?limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
        },
        {
          language: 'JavaScript',
          code: `const response = await fetch('https://api.matlab-ml.com/v1/models', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();`
        }
      ]
    },
    {
      id: 'post-predict',
      category: 'inference',
      name: 'Model Prediction',
      description: 'Run inference on a trained model with input data',
      method: 'POST',
      methodColor: 'green',
      endpoint: 'POST /api/v1/predict',
      parameters: [
        { name: 'model_id', type: 'string', required: true, description: 'ID of the model to use for prediction' },
        { name: 'input_data', type: 'object', required: true, description: 'Input data for prediction' }
      ],
      requestBody: {
        model_id: "mobilenet-v2",
        input_data: {
          image: "base64_encoded_image_data",
          format: "jpeg"
        }
      },
      response: {
        prediction: {
          class: "smartphone",
          confidence: 0.95,
          processing_time_ms: 45
        },
        metadata: {
          model_version: "2.1.0",
          timestamp: "2024-01-15T10:30:00Z"
        }
      },
      examples: [
        {
          language: 'cURL',
          code: `curl -X POST "https://api.matlab-ml.com/v1/predict" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_id": "mobilenet-v2",
    "input_data": {
      "image": "base64_image_data",
      "format": "jpeg"
    }
  }'`
        },
        {
          language: 'Python',
          code: `import requests

response = requests.post(
    'https://api.matlab-ml.com/v1/predict',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'model_id': 'm
