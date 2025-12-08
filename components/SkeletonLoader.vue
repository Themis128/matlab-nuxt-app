<template>
  <div :class="containerClass">
    <!-- Card Skeleton -->
    <div v-if="type === 'card'" class="space-y-4">
      <div class="h-6 w-3/4 animate-pulse rounded bg-base-300" />
      <div class="h-4 w-full animate-pulse rounded bg-base-300" />
      <div class="h-4 w-5/6 animate-pulse rounded bg-base-300" />
    </div>

    <!-- Table Skeleton -->
    <div v-else-if="type === 'table'" class="space-y-3">
      <div v-for="i in rows" :key="i" class="flex gap-4">
        <div v-for="j in columns" :key="j" class="h-4 flex-1 animate-pulse rounded bg-base-300" />
      </div>
    </div>

    <!-- Chart Skeleton -->
    <div v-else-if="type === 'chart'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="h-6 w-1/3 animate-pulse rounded bg-base-300" />
        <div class="h-4 w-20 animate-pulse rounded bg-base-300" />
      </div>
      <div class="h-[300px] w-full rounded-lg">
        <div class="h-full w-full animate-pulse rounded bg-base-300" />
      </div>
    </div>

    <!-- List Skeleton -->
    <div v-else-if="type === 'list'" class="space-y-3">
      <div v-for="i in rows" :key="i" class="flex items-center gap-4">
        <div class="h-10 w-10 animate-pulse rounded-full bg-base-300" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-3/4 animate-pulse rounded bg-base-300" />
          <div class="h-3 w-1/2 animate-pulse rounded bg-base-300" />
        </div>
      </div>
    </div>

    <!-- Stats Skeleton -->
    <div v-else-if="type === 'stats'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="i in 4" :key="i" class="space-y-3">
        <div class="h-4 w-1/2 animate-pulse rounded bg-base-300" />
        <div class="h-8 w-3/4 animate-pulse rounded bg-base-300" />
        <div class="h-2 w-full animate-pulse rounded bg-base-300" />
      </div>
    </div>

    <!-- Custom Skeleton -->
    <div v-else class="space-y-3">
      <div
        v-for="i in rows"
        :key="i"
        :class="[skeletonClass, 'animate-pulse rounded bg-base-300']"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'card' | 'table' | 'chart' | 'list' | 'stats' | 'custom';
  rows?: number;
  columns?: number;
  rounded?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'custom',
  rows: 3,
  columns: 4,
  rounded: 'rounded',
  class: '',
});

const containerClass = computed(() => [props.class]);

const skeletonClass = computed(() => {
  const classes: Record<string, string> = {
    card: 'h-4 w-full',
    table: 'h-4 w-full',
    chart: 'h-4 w-full',
    list: 'h-4 w-3/4',
    stats: 'h-4 w-full',
  };
  return classes[props.type] || 'h-4 w-full';
});
</script>
