<template>
  <DCard>
    <div class="card-body space-y-4">
      <div v-if="showHeader" class="flex items-center justify-between">
        <div class="h-6 w-1/3 animate-pulse rounded bg-base-300" />
        <div class="h-4 w-20 animate-pulse rounded bg-base-300" />
      </div>
      <div v-if="showContent" class="space-y-3">
        <div
          v-for="i in lines"
          :key="i"
          class="h-4 animate-pulse rounded bg-base-300"
          :class="lineWidthClass"
        />
      </div>
      <div
        v-if="showFooter"
        class="flex items-center justify-between border-t border-base-300 pt-4"
      >
        <div class="h-4 w-24 animate-pulse rounded bg-base-300" />
        <div class="h-4 w-16 animate-pulse rounded bg-base-300" />
      </div>
    </div>
  </DCard>
</template>

<script setup lang="ts">
interface Props {
  lines?: number;
  showHeader?: boolean;
  showContent?: boolean;
  showFooter?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  lines: 3,
  showHeader: true,
  showContent: true,
  showFooter: false,
  size: 'md',
});

const _paddingClass = computed(() => {
  const classes: Record<string, string> = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  return classes[props.size];
});

const lineWidthClass = computed(() => {
  // Vary line widths for more realistic skeleton
  const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-3/4'];
  return widths[Math.floor(Math.random() * widths.length)];
});
</script>
