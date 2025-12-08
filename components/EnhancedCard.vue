<template>
  <DCard
    :class="cardClasses"
    :title="title"
    :subtitle="subtitle"
    :bordered="variant === 'bordered'"
    :shadow="shadowValue"
    @click="handleClick"
  >
    <!-- Header -->
    <template v-if="$slots.header || (title && icon)" #header>
      <slot name="header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div v-if="icon" :class="iconClasses">
              <Icon :name="icon" class="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 :class="titleClasses">
                {{ title }}
              </h3>
              <p v-if="subtitle" :class="subtitleClasses">
                {{ subtitle }}
              </p>
            </div>
          </div>
          <slot name="actions" />
        </div>
      </slot>
    </template>

    <!-- Content -->
    <div :class="contentClasses">
      <slot />
    </div>

    <!-- Footer -->
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>

    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center rounded-xl bg-base-100/80 backdrop-blur-sm dark:bg-base-300/80 z-10"
    >
      <span class="loading loading-spinner loading-lg text-primary" />
    </div>
  </DCard>
</template>

<script setup lang="ts">
import { useSlots } from 'vue';

interface Props {
  title?: string;
  subtitle?: string;
  icon?: string;
  variant?: 'default' | 'modern' | 'glass' | 'gradient' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  loading?: boolean;
  color?: 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'gray';
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  icon: undefined,
  variant: 'modern',
  size: 'md',
  hover: true,
  clickable: false,
  loading: false,
  color: 'purple',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

// Computed classes
const cardClasses = computed(() => [
  'relative overflow-hidden transition-all duration-300 ease-out',
  ...variantClasses.value,
  {
    // Interactive states
    'hover:shadow-lg hover:-translate-y-1': props.hover && !props.loading,
    'cursor-pointer': props.clickable && !props.loading,
    'cursor-not-allowed opacity-75': props.loading,
  },
]);

const shadowValue = computed(() => {
  if (props.variant === 'glass') return 'none';
  return 'xl';
});

const variantClasses = computed(() => {
  const classes: string[] = [];

  if (props.variant === 'glass') {
    classes.push('bg-base-100/10 backdrop-blur-xl ring-1 ring-base-content/20');
  } else if (props.variant === 'gradient') {
    classes.push('bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-primary/50');
  } else if (props.variant === 'bordered') {
    classes.push('ring-2 ring-base-300');
  }

  return classes;
});

const iconClasses = computed(() => [
  'p-2 rounded-lg flex items-center justify-center',
  {
    'bg-blue-500': props.color === 'blue',
    'bg-purple-500': props.color === 'purple',
    'bg-green-500': props.color === 'green',
    'bg-red-500': props.color === 'red',
    'bg-yellow-500': props.color === 'yellow',
    'bg-gray-500': props.color === 'gray',
  },
]);

const titleClasses = computed(() => [
  'font-semibold text-base-content',
  {
    'text-lg': props.size === 'sm',
    'text-xl': props.size === 'md',
    'text-2xl': props.size === 'lg',
  },
]);

const subtitleClasses = computed(() => [
  'text-base-content/60 mt-1',
  {
    'text-sm': props.size === 'sm',
    'text-base': props.size === 'md',
    'text-lg': props.size === 'lg',
  },
]);

const slots = useSlots();

const contentClasses = computed(() => [
  {
    'mt-4': props.title || slots.header,
  },
]);

const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
/* Enhanced hover effects and custom variants are applied via computed classes */
</style>
