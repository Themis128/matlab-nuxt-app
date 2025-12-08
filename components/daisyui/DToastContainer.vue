<!-- components/daisyui/DToastContainer.vue -->
<template>
  <div class="toast toast-top toast-end z-50">
    <div v-for="toast in toasts" :key="toast.id" :class="`alert alert-${toast.type}`">
      <Icon :name="getIcon(toast.type)" class="w-5 h-5" />
      <span>{{ toast.message }}</span>
      <button class="btn btn-sm btn-circle btn-ghost" @click="removeToast(toast.id)">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { toasts, removeToast } = useToast();

const getIcon = (type: string) => {
  const icons: Record<string, string> = {
    success: 'heroicons:check-circle',
    error: 'heroicons:x-circle',
    info: 'heroicons:information-circle',
    warning: 'heroicons:exclamation-triangle',
  };
  return icons[type] || icons.info;
};
</script>
