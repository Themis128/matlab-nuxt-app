<template>
  <DPageLayout>
    <div class="container mx-auto p-8">
      <DPageHeader
        title="Sentry Dashboard"
        description="Monitor error tracking and application health"
        icon="heroicons:exclamation-triangle"
        icon-bg="error"
      />

      <SentryDashboard />
    </div>
  </DPageLayout>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Sentry Dashboard',
  layout: 'default',
});
</script>
