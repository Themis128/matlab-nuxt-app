<!-- components/daisyui/DPageHeader.vue -->
<template>
  <div class="mb-8">
    <div class="mb-4 flex items-center gap-4">
      <div v-if="icon" :class="['rounded-2xl p-3', iconBgClass]">
        <Icon :name="icon" class="h-8 w-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-bold text-base-content">
          {{ title }}
        </h1>
        <p v-if="description" class="mt-1 text-lg opacity-70">
          {{ description }}
        </p>
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
  icon?: string;
  iconBg?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
}

const props = withDefaults(defineProps<Props>(), {
  iconBg: 'primary',
});

const iconBgClass = computed(() => {
  const colorMap: Record<string, string> = {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600',
    secondary: 'bg-gradient-to-br from-purple-500 to-purple-600',
    accent: 'bg-gradient-to-br from-pink-500 to-pink-600',
    info: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    success: 'bg-gradient-to-br from-green-500 to-teal-600',
    warning: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    error: 'bg-gradient-to-br from-red-500 to-red-600',
  };
  return colorMap[props.iconBg] || colorMap.primary;
});
</script>
