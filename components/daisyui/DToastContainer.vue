<!-- components/daisyui/DToastContainer.vue -->
<template>
  <div class="toast toast-top toast-end z-50">
    <div v-for="toast in toasts" :key="toast.id" :class="`alert ${alertClass(toast.color)}`">
      <Icon :name="toast.icon || getIcon(toast.color)" class="w-5 h-5" />
      <div>
        <p v-if="toast.title" class="font-semibold">{{ toast.title }}</p>
        <p class="text-sm">{{ toast.description }}</p>
      </div>
      <button class="btn btn-sm btn-circle btn-ghost" @click="remove(toast.id)">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast();

const alertClass = (color?: string) => {
  switch (color) {
    case 'success':
      return 'alert-success';
    case 'error':
      return 'alert-error';
    case 'warning':
      return 'alert-warning';
    case 'info':
      return 'alert-info';
    default:
      return 'alert-info';
  }
};

const getIcon = (color?: string) => {
  const icons: Record<string, string> = {
    success: 'heroicons:check-circle',
    error: 'heroicons:x-circle',
    info: 'heroicons:information-circle',
    warning: 'heroicons:exclamation-triangle',
  };
  return icons[color ?? ''] || icons.info;
};
</script>
