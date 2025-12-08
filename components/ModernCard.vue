<template>
  <div
    :class="[
      'card bg-base-100 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl',
      hoverColorClass,
      $attrs.class,
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  hoverColor?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
}

const props = withDefaults(defineProps<Props>(), {
  hoverColor: 'primary',
});

// Use daisyUI semantic color names
const hoverColorMap = {
  primary: 'hover:border-primary',
  secondary: 'hover:border-secondary',
  accent: 'hover:border-accent',
  info: 'hover:border-info',
  success: 'hover:border-success',
  warning: 'hover:border-warning',
  error: 'hover:border-error',
};

const hoverColorClass = hoverColorMap[props.hoverColor];
</script>
