<template>
  <div class="sentry-dashboard">
    <div class="mb-6">
      <h2 class="mb-2 text-2xl font-bold">Sentry Error Dashboard</h2>
      <p class="text-gray-600">Monitor errors and issues from your Sentry project</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-8 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      <p class="mt-2 text-gray-600">Loading Sentry data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4">
      <p class="text-red-800">
        {{ error }}
      </p>
      <p class="mt-2 text-sm text-red-600">
        Make sure SENTRY_ORG and SENTRY_AUTH_TOKEN are configured in your environment.
      </p>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Statistics Cards -->
      <div v-if="stats" class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="mb-1 text-sm text-gray-600">Total Issues</p>
          <p class="text-2xl font-bold">
            {{ stats.totalIssues }}
          </p>
        </div>
        <div class="rounded-lg border border-red-200 bg-red-50 p-4">
          <p class="mb-1 text-sm text-red-600">Unresolved</p>
          <p class="text-2xl font-bold text-red-700">
            {{ stats.unresolvedIssues }}
          </p>
        </div>
        <div class="rounded-lg border border-green-200 bg-green-50 p-4">
          <p class="mb-1 text-sm text-green-600">Resolved</p>
          <p class="text-2xl font-bold text-green-700">
            {{ stats.resolvedIssues }}
          </p>
        </div>
        <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p class="mb-1 text-sm text-blue-600">Errors (24h)</p>
          <p class="text-2xl font-bold text-blue-700">
            {{ stats.errors24h }}
          </p>
        </div>
      </div>

      <!-- Recent Issues -->
      <div class="rounded-lg border border-gray-200 bg-white p-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">Recent Issues</h3>
          <button
            :disabled="loading"
            class="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            @click="refreshIssues"
          >
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>

        <div v-if="issues.length === 0" class="py-8 text-center text-gray-500">
          <p>No unresolved issues found</p>
          <p class="mt-2 text-sm">Great job! 🎉</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="issue in issues"
            :key="issue.id"
            class="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="mb-2 flex items-center gap-2">
                  <span
                    :class="[
                      'rounded px-2 py-1 text-xs font-medium',
                      issue.level === 'error' || issue.level === 'fatal'
                        ? 'bg-red-100 text-red-800'
                        : issue.level === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800',
                    ]"
                  >
                    {{ issue.level }}
                  </span>
                  <span
                    :class="[
                      'rounded px-2 py-1 text-xs font-medium',
                      issue.status === 'unresolved'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800',
                    ]"
                  >
                    {{ issue.status }}
                  </span>
                </div>
                <h4 class="mb-1 font-medium">
                  {{ issue.title }}
                </h4>
                <p class="mb-2 text-sm text-gray-600">
                  {{ issue.culprit }}
                </p>
                <div class="flex gap-4 text-xs text-gray-500">
                  <span>{{ t('sentry.dashboard.count') }}: {{ issue.count }}</span>
                  <span>{{ t('sentry.dashboard.users') }}: {{ issue.userCount }}</span>
                  <span
                    >{{ t('sentry.dashboard.lastSeen') }}: {{ formatDate(issue.lastSeen) }}</span
                  >
                </div>
              </div>
              <a
                :href="issue.permalink"
                target="_blank"
                rel="noopener noreferrer"
                class="ml-4 text-sm text-blue-600 hover:text-blue-800"
              >
                {{ t('sentry.dashboard.view') }} →
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Releases -->
      <div v-if="releases.length > 0" class="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <h3 class="mb-4 text-lg font-semibold">Recent Releases</h3>
        <div class="space-y-2">
          <div
            v-for="release in releases"
            :key="release.version"
            class="flex items-center justify-between rounded border border-gray-200 p-3"
          >
            <div>
              <p class="font-medium">
                {{ release.version }}
              </p>
              <p class="text-sm text-gray-600">
                {{ formatDate(release.dateCreated) }}
              </p>
            </div>
            <div class="text-right text-sm">
              <p class="text-red-600">{{ release.newIssues }} new</p>
              <p class="text-green-600">{{ release.resolvedIssues }} resolved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { SentryIssue, SentryRelease } from '~/types/sentry';
import type { SentryStats } from '~/composables/useSentryApi';

const { t } = useI18n();

// Mock Sentry API since it doesn't exist
const sentryApi = {
  getIssues: async (limit: number) => {
    // Return mock issues
    return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      id: `issue-${i + 1}`,
      title: `Sample Error ${i + 1}`,
      culprit: `app/components/Component${i + 1}.vue`,
      level: i === 0 ? 'error' : i === 1 ? 'warning' : 'info',
      status: i === 0 ? 'unresolved' : 'resolved',
      count: Math.floor(Math.random() * 100) + 1,
      userCount: Math.floor(Math.random() * 50) + 1,
      lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      permalink: `https://sentry.io/issues/issue-${i + 1}`,
    }));
  },
  getStats: async () => ({
    totalIssues: 15,
    unresolvedIssues: 3,
    resolvedIssues: 12,
    errors24h: 8,
  }),
  getReleases: async (limit: number) => {
    return Array.from({ length: Math.min(limit, 2) }, (_, i) => ({
      version: `v1.${i + 1}.0`,
      dateCreated: new Date(Date.now() - i * 86400000).toISOString(),
      newIssues: Math.floor(Math.random() * 5),
      resolvedIssues: Math.floor(Math.random() * 10) + 5,
    }));
  },
};

const loading = ref(true);
const error = ref<string | null>(null);
const issues = ref<SentryIssue[]>([]);
const stats = ref<SentryStats | null>(null);
const releases = ref<SentryRelease[]>([]);

const loadData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const [issuesData, statsData, releasesData] = await Promise.all([
      sentryApi.getIssues(10),
      sentryApi.getStats(),
      sentryApi.getReleases(5),
    ]);

    issues.value = issuesData as typeof issues.value;
    stats.value = statsData as typeof stats.value;
    releases.value = releasesData as typeof releases.value;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load Sentry data';
    const logger = useSentryLogger();
    logger.logError(
      'Error loading Sentry dashboard data',
      err instanceof Error ? err : new Error(String(err)),
      {
        component: 'SentryDashboard',
        action: 'loadData',
      }
    );
  } finally {
    loading.value = false;
  }
};

const refreshIssues = async () => {
  loading.value = true;
  try {
    issues.value = (await sentryApi.getIssues(10)) as typeof issues.value;
    stats.value = (await sentryApi.getStats()) as typeof stats.value;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to refresh data';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.sentry-dashboard {
  padding: 1.5rem; /* p-6 equivalent */
}
</style>
