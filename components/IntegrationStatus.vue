<template>
  <div class="space-y-4">
    <!-- Performance Status -->
    <div v-if="currentWebVitals || performanceScore !== null" class="card bg-base-100 shadow-xl">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <h3 class="card-title">Performance Metrics</h3>
          <div class="flex items-center gap-2">
            <span
              v-if="performanceGrade"
              :class="['badge badge-lg', getGradeColor(performanceGrade)]"
            >
              Grade: {{ performanceGrade }}
            </span>
            <span v-if="performanceScore !== null" class="text-sm opacity-70">
              Score: {{ performanceScore }}/100
            </span>
          </div>
        </div>
      </div>

      <div v-if="currentWebVitals" class="card-body space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">LCP (Largest Contentful Paint)</span>
          <span class="font-medium">{{ formatMetric(currentWebVitals.lcp, 'ms') }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">FID (First Input Delay)</span>
          <span class="font-medium">{{ formatMetric(currentWebVitals.fid, 'ms') }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">CLS (Cumulative Layout Shift)</span>
          <span class="font-medium">{{ formatMetric(currentWebVitals.cls, 'score') }}</span>
        </div>
      </div>
    </div>

    <!-- Analytics Status -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-header">
        <h3 class="card-title">Analytics</h3>
      </div>

      <div class="card-body space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">Session ID</span>
          <span class="font-mono text-xs">{{ sessionInfo.sessionId }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">Session Duration</span>
          <span class="font-medium">{{ formatDuration(sessionInfo.duration) }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">Total Events</span>
          <span class="font-medium">{{ sessionInfo.eventCount }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">Page Views</span>
          <span class="font-medium">{{ sessionInfo.pageViewCount }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">Tracking Enabled</span>
          <Icon
            :name="canTrack ? 'heroicons:check-circle' : 'heroicons:x-circle'"
            :class="canTrack ? 'text-success' : 'text-error'"
            class="h-5 w-5"
          />
        </div>
      </div>
    </div>

    <!-- Sentry Status -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <h3 class="card-title">Error Tracking</h3>
          <div class="flex items-center gap-2">
            <span v-if="errorCount > 0" class="badge badge-error">
              {{ errorCount }} Error{{ errorCount !== 1 ? 's' : '' }}
            </span>
            <Icon
              :name="isConnected ? 'heroicons:check-circle' : 'heroicons:x-circle'"
              :class="isConnected ? 'text-success' : 'opacity-40'"
              class="h-5 w-5"
            />
          </div>
        </div>
      </div>

      <div class="card-body space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">Status</span>
          <span class="font-medium">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">Error Count</span>
          <span class="font-medium">{{ errorCount }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">Critical Errors</span>
          <span class="font-medium">{{ criticalErrorsCount }}</span>
        </div>
        <div v-if="userContext" class="flex items-center justify-between text-sm">
          <span class="opacity-70">User ID</span>
          <span class="font-medium">{{ userContext.id || 'N/A' }}</span>
        </div>
      </div>
    </div>

    <!-- Chrome DevTools Status -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <h3 class="card-title">Chrome DevTools MCP</h3>
          <div class="flex items-center gap-2">
            <span :class="['badge', getConnectionStatusBadge(connectionStatus.status)]">
              {{ connectionStatus.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="card-body space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">Connection</span>
          <span class="font-medium">{{ connectionStatus.message }}</span>
        </div>
        <div v-if="browserUrl" class="flex items-center justify-between text-sm">
          <span class="opacity-70">Browser URL</span>
          <span class="font-mono text-xs">{{ browserUrl }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">Debug Port</span>
          <span class="font-medium">{{ debugPort }}</span>
        </div>
        <div v-if="lastConnectedAt" class="flex items-center justify-between text-sm">
          <span class="opacity-70">Last Connected</span>
          <span class="font-medium">{{ formatTime(lastConnectedAt) }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="opacity-70">Monitoring</span>
          <Icon
            :name="isMonitoring ? 'heroicons:play-circle' : 'heroicons:pause-circle'"
            :class="isMonitoring ? 'text-success' : 'opacity-40'"
            class="h-5 w-5"
          />
        </div>
      </div>

      <div class="card-footer">
        <div class="flex gap-2">
          <DButton
            v-if="!isConnected && canConnect"
            variant="primary"
            size="sm"
            :loading="isConnecting"
            @click="handleConnect"
          >
            Connect
          </DButton>
          <DButton v-if="isConnected" variant="error" size="sm" @click="handleDisconnect">
            Disconnect
          </DButton>
          <DButton
            v-if="isConnected && !isMonitoring"
            variant="outline"
            size="sm"
            @click="handleStartMonitoring"
          >
            Start Monitoring
          </DButton>
          <DButton v-if="isMonitoring" variant="warning" size="sm" @click="handleStopMonitoring">
            Stop Monitoring
          </DButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

// Mock data for stores that don't exist yet
const currentWebVitals = ref({
  lcp: 2.5,
  fid: 100,
  cls: 0.1,
});
const performanceScore = ref(85);
const performanceGrade = ref('B');

const canTrack = ref(true);
const sessionInfo = ref({
  sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
  duration: Date.now() - (Date.now() - 1000 * 60 * 15), // 15 minutes
  eventCount: 42,
  pageViewCount: 8,
});

const errorCount = ref(0);
const criticalErrorsCount = ref(0);
const userContext = ref({ id: 'user_123' });

const isConnected = ref(false);
const isConnecting = ref(false);
const connectionStatus = ref({ status: 'disconnected', message: 'Not connected' });
const browserUrl = ref('');
const debugPort = ref(9222);
const lastConnectedAt = ref<number | null>(null);
const isMonitoring = ref(false);
const canConnect = ref(true);

// Helper functions
const formatMetric = (value: number | null, unit: string) => {
  if (value === null || value === undefined) return 'N/A';
  if (unit === 'ms') return `${Math.round(value)}ms`;
  if (unit === 'score') return value.toFixed(3);
  return `${value}${unit}`;
};

const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

// Using DaisyUI semantic colors
const getGradeColor = (grade: string) => {
  const colors: Record<string, string> = {
    A: 'badge-success',
    B: 'badge-info',
    C: 'badge-warning',
    D: 'badge-warning',
    F: 'badge-error',
  };
  return colors[grade] || 'badge-ghost';
};

const getConnectionStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    connected: 'badge-success',
    connecting: 'badge-info',
    error: 'badge-error',
    disconnected: 'badge-ghost',
  };
  return badges[status] || badges.disconnected;
};

// Actions (mock implementations)
const handleConnect = async () => {
  isConnecting.value = true;
  // Simulate connection attempt
  await new Promise((resolve) => setTimeout(resolve, 1000));
  isConnected.value = true;
  isConnecting.value = false;
  connectionStatus.value = { status: 'connected', message: 'Successfully connected' };
  browserUrl.value = 'http://127.0.0.1:9222';
  lastConnectedAt.value = Date.now();
};

const handleDisconnect = () => {
  isConnected.value = false;
  isMonitoring.value = false;
  connectionStatus.value = { status: 'disconnected', message: 'Disconnected' };
  browserUrl.value = '';
};

const handleStartMonitoring = () => {
  isMonitoring.value = true;
};

const handleStopMonitoring = () => {
  isMonitoring.value = false;
};

// Initialize on mount
onMounted(async () => {
  // Track page view if available
  try {
    const { trackView } = useUserActivity?.() || { trackView: () => {} };
    await trackView('integration-status');
  } catch {
    console.debug('Analytics tracking not available');
  }
});
</script>
