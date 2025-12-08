<!-- components/daisyui/DAlert.vue -->
<template>
  <div :class="alertClasses" role="alert">
    <Icon v-if="icon" :name="icon" class="h-6 w-6 shrink-0" />
    <div>
      <h3 v-if="title" class="font-bold">
        {{ title }}
      </h3>
      <div v-if="$slots.default || message">
        <slot>{{ message }}</slot>
      </div>
    </div>
    <button v-if="dismissible" class="btn btn-sm btn-circle" @click="$emit('dismiss')">
      <Icon name="heroicons:x-mark" class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message?: string;
  icon?: string;
  dismissible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  dismissible: false,
});

defineEmits<{
  dismiss: [];
}>();

const alertClasses = computed(() => ['alert', `alert-${props.variant}`]);

const defaultIcons: Record<string, string> = {
  info: 'heroicons:information-circle',
  success: 'heroicons:check-circle',
  warning: 'heroicons:exclamation-triangle',
  error: 'heroicons:x-circle',
};

const icon = computed(() => props.icon || defaultIcons[props.variant]);
</script>
