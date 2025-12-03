<script setup lang="ts">
  interface Props {
    src: string // base filename with extension (e.g. 'network-visualization.png')
    alt?: string
    class?: string
    lazy?: boolean
  }
  const props = defineProps<Props>()

  // Derive webp variant (assumes optimize_images.py produced .webp next to original)
  const webpSrc = computed(() => props.src.replace(/\.(png|jpg|jpeg)$/i, '.webp'))
</script>

<template>
  <picture>
    <source :srcset="`/images/${webpSrc}`" type="image/webp" />
    <img
      :src="`/images/${props.src}`"
      :alt="props.alt || ''"
      :class="props.class"
      :loading="props.lazy ? 'lazy' : 'eager'"
      decoding="async"
    />
  </picture>
</template>

<style scoped>
  img {
    display: block;
    max-width: 100%;
    height: auto;
  }
</style>
