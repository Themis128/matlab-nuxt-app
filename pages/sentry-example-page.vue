<template>
  <div class="container mx-auto p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Sentry Error Tracking Test</h1>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-3">✅ Sentry Configured Successfully</h2>
        <p class="text-gray-700 mb-4">
          Your application is now configured with Sentry error tracking. Click the button below to
          trigger a test error.
        </p>

        <div class="space-y-4">
          <div>
            <button
              id="errorBtn"
              class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              @click="triggerError"
            >
              🚨 Trigger Test Error
            </button>
          </div>

          <div>
            <button
              class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              @click="triggerAsyncError"
            >
              ⏱️ Trigger Async Error
            </button>
          </div>

          <div>
            <button
              class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              @click="triggerHandledError"
            >
              🔍 Trigger Handled Error
            </button>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-3">Sentry Configuration Details</h3>
        <ul class="space-y-2 text-sm text-gray-700">
          <li><strong>Organization:</strong> baltzakisthemiscom</li>
          <li><strong>Project:</strong> matlab</li>
          <li><strong>Environment:</strong> {{ environment }}</li>
          <li><strong>Traces Sample Rate:</strong> 100%</li>
          <li><strong>Replays Sample Rate:</strong> 10%</li>
          <li><strong>Replays on Error:</strong> 100%</li>
        </ul>
      </div>

      <div class="mt-6">
        <NuxtLink to="/" class="text-blue-600 hover:text-blue-800 underline">
          ← Back to Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import * as Sentry from '@sentry/nuxt'

  const environment = process.env.NODE_ENV || 'development'

  const triggerError = () => {
    throw new Error('Nuxt Button Error - Test from /sentry-example-page')
  }

  const triggerAsyncError = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    throw new Error('Async Error - Test from Sentry Example Page')
  }

  const triggerHandledError = () => {
    try {
      throw new Error('Handled Error - Manually captured')
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          type: 'manual-capture',
          page: 'sentry-example-page',
        },
        level: 'warning',
      })
      alert('Error captured and sent to Sentry! Check your Sentry dashboard.')
    }
  }
</script>
