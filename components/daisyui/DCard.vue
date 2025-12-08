<!-- components/daisyui/DCard.vue -->
<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h2 v-if="title" class="card-title">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-sm opacity-70">
          {{ subtitle }}
        </p>
      </slot>
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
  bordered?: boolean;
  image?: string;
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none';
  bg?: 'base-100' | 'base-200' | 'base-300';
}

const props = withDefaults(defineProps<Props>(), {
  bordered: false,
  shadow: 'xl',
  bg: 'base-100',
});

const cardClasses = computed(() => [
  'card',
  `bg-${props.bg}`,
  {
    'card-bordered': props.bordered,
    [`shadow-${props.shadow}`]: props.shadow !== 'none',
  },
]);
</script>
