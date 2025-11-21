<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            MATLAB Capabilities Checker
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Check your MATLAB installation, toolboxes, and system capabilities
          </p>
        </div>

        <!-- Action Button -->
        <div class="mb-6">
          <UButton
            @click="checkCapabilities"
            :loading="loading"
            :disabled="loading"
            size="lg"
            color="primary"
            icon="i-heroicons-cpu-chip"
          >
            {{ loading ? 'Checking...' : 'Check MATLAB Capabilities' }}
          </UButton>
        </div>

        <!-- Error Message -->
        <UAlert
          v-if="error"
          color="red"
          variant="soft"
          :title="error"
          class="mb-6"
        />

        <!-- Results -->
        <div v-if="capabilities" class="space-y-6">
          <!-- Version Information -->
          <UCard>
            <template #header>
              <h2 class="text-2xl font-semibold">Version Information</h2>
            </template>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">MATLAB Version:</span>
                <span class="font-semibold">{{ capabilities.version || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Release:</span>
                <span class="font-semibold">{{ capabilities.release || 'N/A' }}</span>
              </div>
            </div>
          </UCard>

          <!-- System Information -->
          <UCard>
            <template #header>
              <h2 class="text-2xl font-semibold">System Information</h2>
            </template>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Architecture:</span>
                <span class="font-semibold">{{ capabilities.architecture || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Available Memory:</span>
                <span class="font-semibold">{{ capabilities.availableMemory || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Total Memory:</span>
                <span class="font-semibold">{{ capabilities.totalMemory || 'N/A' }}</span>
              </div>
            </div>
          </UCard>

          <!-- GPU Information -->
          <UCard v-if="capabilities.gpu">
            <template #header>
              <h2 class="text-2xl font-semibold">GPU Information</h2>
            </template>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">GPU Name:</span>
                <span class="font-semibold">{{ capabilities.gpu.name || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">GPU Memory:</span>
                <span class="font-semibold">{{ capabilities.gpu.memory || 'N/A' }}</span>
              </div>
            </div>
          </UCard>

          <!-- Key Capabilities -->
          <UCard>
            <template #header>
              <h2 class="text-2xl font-semibold">Key Capabilities</h2>
            </template>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(enabled, capability) in capabilities.keyCapabilities"
                :key="capability"
                class="flex items-center justify-between p-3 rounded-lg"
                :class="enabled ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'"
              >
                <span class="text-gray-700 dark:text-gray-300">{{ formatCapabilityName(capability) }}</span>
                <UBadge
                  :color="enabled ? 'green' : 'gray'"
                  variant="soft"
                >
                  {{ enabled ? 'Available' : 'Not Available' }}
                </UBadge>
              </div>
            </div>
          </UCard>

          <!-- Installed Toolboxes -->
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-semibold">Installed Toolboxes</h2>
                <UBadge color="primary" variant="soft">
                  {{ capabilities.toolboxes?.length || 0 }} toolboxes
                </UBadge>
              </div>
            </template>
            <div class="max-h-96 overflow-y-auto">
              <div class="space-y-3">
                <div
                  v-for="toolbox in capabilities.toolboxes"
                  :key="toolbox.name"
                  class="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div class="flex justify-between items-start mb-1">
                    <span class="font-semibold text-gray-900 dark:text-white">{{ toolbox.name }}</span>
                    <UBadge color="gray" variant="soft" size="xs">
                      v{{ toolbox.version }}
                    </UBadge>
                  </div>
                  <p
                    v-if="toolbox.description"
                    class="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed"
                  >
                    {{ toolbox.description }}
                  </p>
                  <p
                    v-else
                    class="text-xs text-gray-400 dark:text-gray-500 italic mt-1"
                  >
                    No description available
                  </p>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Empty State -->
        <UCard v-else-if="!loading && !error">
          <div class="text-center py-12">
            <UIcon name="i-heroicons-cpu-chip" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p class="text-gray-600 dark:text-gray-400">
              Click the button above to check your MATLAB capabilities
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Toolbox {
  name: string
  version: string
}

interface GPUInfo {
  name: string
  memory: string
}

interface Capabilities {
  version?: string
  release?: string
  architecture?: string
  availableMemory?: string
  totalMemory?: string
  gpu?: GPUInfo
  keyCapabilities?: Record<string, boolean>
  toolboxes?: Toolbox[]
}

const loading = ref(false)
const error = ref<string | null>(null)
const capabilities = ref<Capabilities | null>(null)

const checkCapabilities = async () => {
  loading.value = true
  error.value = null
  capabilities.value = null

  try {
    const response = await $fetch<Capabilities>('/api/matlab/capabilities')
    capabilities.value = response
  } catch (err: any) {
    error.value = err.message || 'Failed to check MATLAB capabilities'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const formatCapabilityName = (name: string) => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}
</script>
