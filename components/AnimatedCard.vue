<template>
  <div ref="cardRef" :class="cardClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { usePageMotion } from '~/composables/useMotion';

interface Props {
  animation?: 'fade' | 'slide' | 'scale' | 'card';
  delay?: number;
  index?: number;
  hover?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  animation: 'card',
  delay: 0,
  index: 0,
  hover: true,
});

const cardRef = ref<HTMLElement>();
const { fadeIn, slideUp, scaleIn, cardEntrance, hoverScale } = usePageMotion();

const cardClasses = computed(() => [
  'transition-all duration-300',
  {
    'cursor-pointer': props.hover,
  },
]);

onMounted(() => {
  if (!cardRef.value) return;

  // Apply entrance animation
  switch (props.animation) {
    case 'fade':
      fadeIn(cardRef.value, { delay: props.delay });
      break;
    case 'slide':
      slideUp(cardRef.value, { delay: props.delay });
      break;
    case 'scale':
      scaleIn(cardRef.value, { delay: props.delay });
      break;
    case 'card':
    default:
      cardEntrance(cardRef.value, props.index);
      break;
  }

  // Apply hover effect if enabled
  if (props.hover) {
    hoverScale(cardRef.value);
  }
});
</script>
