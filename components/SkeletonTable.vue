<template>
  <DCard>
    <template v-if="showHeader" #header>
      <div class="flex items-center justify-between">
        <div class="h-6 w-1/4 animate-pulse rounded bg-base-300" />
        <div class="h-4 w-32 animate-pulse rounded bg-base-300" />
      </div>
    </template>
    <div class="card-body overflow-x-auto p-0">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th v-for="i in columns" :key="i" class="px-4 py-3 text-left">
              <div class="h-4 w-20 animate-pulse rounded bg-base-300" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in rows" :key="i">
            <td v-for="j in columns" :key="j" class="px-4 py-3">
              <div class="h-4 animate-pulse rounded bg-base-300" :class="getCellWidth(j)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <template v-if="showPagination" #footer>
      <div class="flex items-center justify-between">
        <div class="h-4 w-32 animate-pulse rounded bg-base-300" />
        <div class="flex gap-2">
          <div class="h-8 w-8 animate-pulse rounded bg-base-300" />
          <div class="h-8 w-8 animate-pulse rounded bg-base-300" />
          <div class="h-8 w-8 animate-pulse rounded bg-base-300" />
        </div>
      </div>
    </template>
  </DCard>
</template>

<script setup lang="ts">
interface Props {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  rows: 5,
  columns: 4,
  showHeader: true,
  showPagination: true,
});

const getCellWidth = (column: number) => {
  // Vary cell widths for more realistic skeleton
  const widths = ['w-16', 'w-24', 'w-32', 'w-20', 'w-28'];
  return widths[(column - 1) % widths.length];
};
</script>
