<!-- components/daisyui/DButton.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loading loading-spinner loading-sm" />
    <Icon v-else-if="icon" :name="icon" class="w-5 h-5" />
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'ghost'
    | 'outline'
    | 'info'
    | 'success'
    | 'warning'
    | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  circle?: boolean;
  square?: boolean;
  wide?: boolean;
  block?: boolean;
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
  loading: false,
  circle: false,
  square: false,
  wide: false,
  block: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  return [
    'btn',
    `btn-${props.variant}`,
    `btn-${props.size}`,
    {
      'btn-disabled': props.disabled,
      loading: props.loading,
      'btn-circle': props.circle,
      'btn-square': props.square,
      'btn-wide': props.wide,
      'btn-block': props.block,
    },
  ];
});
</script>
