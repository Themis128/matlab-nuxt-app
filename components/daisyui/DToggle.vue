<!-- components/daisyui/DToggle.vue -->
<template>
  <input
    type="checkbox"
    :checked="modelValue"
    :disabled="disabled"
    class="toggle"
    :class="[`toggle-${color}`, size ? `toggle-${size}` : '', { 'toggle-disabled': disabled }]"
    @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  color: 'primary',
  size: 'md',
});

defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>
