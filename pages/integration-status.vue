<template>
  <DPageLayout>
    <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <DPageHeader
        title="Integration Status"
        description="Monitor and manage all your application integrations in one place"
        icon="heroicons:link"
        icon-bg="info"
      />

      <IntegrationStatus />
    </div>
  </DPageLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

// Set page meta
useHead({
  title: 'Integration Status - MATLAB Analytics',
  meta: [
    {
      name: 'description',
      content:
        'Monitor performance, analytics, error tracking, and Chrome DevTools MCP integration status',
    },
  ],
});

// Track page view if available
onMounted(async () => {
  try {
    const { trackView } = useUserActivity?.() || { trackView: () => {} };
    await trackView('integration-status', 'Integration Status');
  } catch {
    console.debug('Analytics tracking not available');
  }
});
</script>
