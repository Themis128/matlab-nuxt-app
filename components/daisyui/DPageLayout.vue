<!-- components/daisyui/DPageLayout.vue -->
<template>
  <div :class="layoutClasses">
    <!-- Hero Section -->
    <section v-if="showHero" class="hero bg-base-200 py-12">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 v-if="title" class="mb-5 text-5xl font-bold text-base-content">
            {{ title }}
          </h1>
          <p v-if="description" class="mb-5 text-base-content/70">
            {{ description }}
          </p>
          <slot name="hero-actions" />
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div :class="containerClasses">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  showHero?: boolean;
  bg?: 'base-100' | 'base-200' | 'base-300';
  containerClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showHero: false,
  bg: 'base-200',
  containerClass: '',
});

const layoutClasses = computed(() => ['min-h-screen', `bg-${props.bg}`]);

const containerClasses = computed(() => ['container mx-auto px-4 py-8', props.containerClass]);
</script>
