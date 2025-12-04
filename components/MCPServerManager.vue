<template>
  <div class="mcp-server-manager">
    <!-- MCP Server Status Panel -->
    <div class="space-y-4">
      <!-- Ready-to-Use Servers -->
      <div class="server-group">
        <h3
          class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          <UIcon name="i-heroicons-check-circle" class="h-4 w-4 text-green-500" />
          Ready to Use
        </h3>
        <div class="space-y-2">
          <div
            v-for="server in readyServers"
            :key="server.id"
            class="server-item"
            :class="`server-${server.status}`"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <UIcon
                    :name="server.icon"
                    class="h-5 w-5"
                    :class="server.status === 'running' ? 'text-green-500' : 'text-gray-400'"
                  />
                  <div
                    class="absolute -bottom-1 -right-1 h-3 w-3 rounded-full"
                    :class="
                      server.status === 'running' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                    "
                  ></div>
                </div>
                <div class="text-left">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ server.name }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ server.description }}
                  </div>
                </div>
              </div>
              <UButton
                :variant="server.status === 'running' ? 'ghost' : 'solid'"
                :color="server.status === 'running' ? 'green' : 'blue'"
                size="sm"
                :icon="server.status === 'running' ? 'i-heroicons-stop' : 'i-heroicons-play'"
                @click="toggleServer(server)"
                :aria-label="`${server.status === 'running' ? 'Stop' : 'Start'} ${server.name}`"
              />
            </div>
            <div
              v-if="server.status === 'running'"
              class="mt-2 text-xs text-green-600 dark:text-green-400"
            >
              • Active and ready for use
            </div>
          </div>
        </div>
      </div>

      <!-- Servers Requiring Setup -->
      <div class="server-group">
        <h3
          class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="h-4 w-4 text-yellow-500" />
          Need Setup
        </h3>
        <div class="space-y-2">
          <div v-for="server in setupServers" :key="server.id" class="server-item server-pending">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon :name="server.icon" class="h-5 w-5 text-gray-400" />
                <div class="text-left">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ server.name }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ server.description }}
                  </div>
                  <div class="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                    {{ server.setupRequirement }}
                  </div>
                </div>
              </div>
              <UButton
                variant="outline"
                color="yellow"
                size="sm"
                icon="i-heroicons-wrench-screwdriver"
                @click="configureServer(server)"
                :aria-label="`Configure ${server.name}`"
              >
                Setup
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Complex Setup Servers -->
      <div class="server-group">
        <h3
          class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          <UIcon name="i-heroicons-shield-exclamation" class="h-4 w-4 text-red-500" />
          Admin Required
        </h3>
        <div class="space-y-2">
          <div v-for="server in adminServers" :key="server.id" class="server-item server-admin">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon :name="server.icon" class="h-5 w-5 text-red-400" />
                <div class="text-left">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ server.name }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ server.description }}
                  </div>
                  <div class="mt-1 text-xs text-red-600 dark:text-red-400">
                    {{ server.adminRequirement }}
                  </div>
                </div>
              </div>
              <UButton
                variant="ghost"
                color="red"
                size="sm"
                icon="i-heroicons-cog-6-tooth"
                @click="openAdminPanel(server)"
                :aria-label="`Open admin panel for ${server.name}`"
              >
                Admin
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- MCP Server Health Monitoring -->
      <div class="server-group">
        <h3
          class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          <UIcon name="i-heroicons-heart" class="h-4 w-4 text-pink-500" />
          System Health
        </h3>
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Active Servers</span>
            <span class="font-medium text-green-600 dark:text-green-400"
              >{{ activeServersCount }}/{{ totalServers }}</span
            >
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Response Time</span>
            <span class="font-medium text-blue-600 dark:text-blue-400"
              >{{ avgResponseTime }}ms</span
            >
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Last Check</span>
            <span class="font-medium text-gray-900 dark:text-gray-100">{{ lastHealthCheck }}</span>
          </div>
        </div>
      </div>

      <!-- MCP Setup Guide Link -->
      <div class="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
        <UButton
          variant="ghost"
          color="gray"
          size="sm"
          block
          icon="i-heroicons-book-open"
          @click="openSetupGuide"
        >
          MCP Server Setup Guide
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

// Type definitions
interface MCPServer {
  id: string;
  name: string;
  description: string;
  icon: string;
  status?: 'running' | 'stopped' | 'starting';
  setupRequirement?: string;
  adminRequirement?: string;
}

// Server data
const readyServers = ref<MCPServer[]>([
  {
    id: 'dataset-validation',
    name: 'Dataset Validation',
    description: 'CSV parsing, data quality checks, missing value analysis',
    icon: 'i-heroicons-document-check',
    status: 'running',
  },
  {
    id: 'matlab-integration',
    name: 'MATLAB Integration',
    description: 'Script execution, workspace management, command execution',
    icon: 'i-heroicons-cpu-chip',
    status: 'running',
  },
  {
    id: 'prediction-analysis',
    name: 'Prediction Analysis',
    description: 'Model performance analysis, metrics calculation, visualization',
    icon: 'i-heroicons-chart-bar-square',
    status: 'running',
  },
]);

const setupServers = ref<MCPServer[]>([
  {
    id: 'algolia-search',
    name: 'Algolia Search',
    description: 'Search operations, analytics, index management',
    icon: 'i-heroicons-magnifying-glass',
    setupRequirement: 'Requires API credentials',
  },
  {
    id: 'official-tools',
    name: 'Official MCP Tools',
    description: 'Core MCP server implementations',
    icon: 'i-heroicons-wrench-screwdriver',
    setupRequirement: 'Needs workspace installation',
  },
]);

const adminServers = ref<MCPServer[]>([
  {
    id: 'sentry-error-tracking',
    name: 'Sentry Error Tracking',
    description: 'Error monitoring and performance tracking',
    icon: 'i-heroicons-exclamation-triangle',
    adminRequirement: 'Complex monorepo setup required',
  },
  {
    id: 'snyk-security-scanning',
    name: 'Snyk Security Scanning',
    description: 'Security vulnerability assessment',
    icon: 'i-heroicons-shield-check',
    adminRequirement: 'Go build process required',
  },
]);

// Computed properties
const totalServers = computed(
  () => readyServers.value.length + setupServers.value.length + adminServers.value.length
);

const activeServersCount = computed(
  () => readyServers.value.filter((server) => server.status === 'running').length
);

const avgResponseTime = ref(45); // Mock data
const lastHealthCheck = ref(new Date().toLocaleTimeString());

// Methods
const toggleServer = async (server: any) => {
  if (server.status === 'running') {
    server.status = 'stopped';
  } else {
    // Simulate starting server
    server.status = 'starting';
    setTimeout(() => {
      server.status = 'running';
    }, 2000);
  }
};

const configureServer = (server: any) => {
  // Open configuration dialog or navigate to setup
  console.log(`Configuring ${server.name}`);
};

const openAdminPanel = (server: any) => {
  // Open admin panel for complex servers
  console.log(`Opening admin panel for ${server.name}`);
};

const openSetupGuide = () => {
  // Open GitHub MCP server setup guide
  window.open('/github-mcp-setup-guide.md', '_blank');
};

// Health monitoring
const updateHealthMetrics = () => {
  lastHealthCheck.value = new Date().toLocaleTimeString();
  // In real implementation, this would check actual server health
};

onMounted(() => {
  // Update health metrics every 30 seconds
  setInterval(updateHealthMetrics, 30000);
});
</script>

<style scoped>
/* eslint-disable */
.mcp-server-manager {
  @apply w-full max-w-sm;
}

.server-group {
  @apply space-y-3;
}

.server-item {
  @apply p-3 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200;
}

.server-item:hover {
  @apply shadow-sm;
}

.server-running {
  @apply bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800;
}

.server-pending {
  @apply bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800;
}

.server-admin {
  @apply bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800;
}
/* eslint-enable */
</style>
