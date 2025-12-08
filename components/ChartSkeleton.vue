<template>
  <DCard>
    <template v-if="showHeader" #header>
      <div class="flex items-center justify-between">
        <div class="h-6 w-1/3 animate-pulse rounded bg-base-300" />
        <div class="h-4 w-20 animate-pulse rounded bg-base-300" />
      </div>
    </template>
    <div class="card-body p-0">
      <div class="h-[350px] w-full">
        <div class="h-full w-full animate-pulse rounded bg-base-300" />
      </div>
    </div>
  </DCard>
</template>

<script setup lang="ts">
interface Props {
  showHeader?: boolean;
}

withDefaults(defineProps<Props>(), {
  showHeader: true,
});
</script>
