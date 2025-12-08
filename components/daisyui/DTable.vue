<!-- components/daisyui/DTable.vue -->
<!-- DaisyUI table component following migration guide pattern -->
<template>
  <div class="overflow-x-auto">
    <table :class="tableClasses">
      <thead v-if="columns && columns.length > 0">
        <tr>
          <th v-for="column in columns" :key="column.key || column.field">
            <div class="flex items-center gap-2">
              {{ column.label || column.header }}
              <button
                v-if="column.sortable !== false"
                class="btn btn-ghost btn-xs"
                @click="handleSort(column)"
              >
                <Icon name="heroicons:arrows-up-down" class="h-3 w-3" />
              </button>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns?.length || 1" class="text-center">
            <span class="loading loading-spinner loading-md" />
          </td>
        </tr>
        <tr v-else-if="rows && rows.length === 0">
          <td :colspan="columns?.length || 1" class="text-center py-12">
            <Icon name="heroicons:inbox" class="mx-auto h-12 w-12 opacity-40" />
            <p class="mt-4 text-sm opacity-70">
              {{ emptyMessage || 'No data available' }}
            </p>
          </td>
        </tr>
        <template v-else>
          <tr v-for="(row, index) in rows" :key="getRowKey(row, index)">
            <td v-for="column in columns" :key="column.key || column.field">
              <slot
                :name="`cell-${column.key || column.field}`"
                :row="row"
                :column="column"
                :value="row[column.field || column.key]"
              >
                {{ formatCellValue(row, column) }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key?: string;
  field?: string;
  label?: string;
  header?: string;
  sortable?: boolean;
  formatter?: (value: any, row: any) => string;
}

interface Props {
  rows?: any[];
  columns?: Column[];
  loading?: boolean;
  emptyMessage?: string;
  variant?: 'default' | 'zebra' | 'pin-rows' | 'pin-cols';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  rows: () => [],
  columns: () => [],
  loading: false,
  variant: 'zebra',
  size: 'md',
});

const emit = defineEmits<{
  sort: [column: Column];
}>();

const tableClasses = computed(() => [
  'table',
  `table-${props.size}`,
  {
    'table-zebra': props.variant === 'zebra',
    'table-pin-rows': props.variant === 'pin-rows',
    'table-pin-cols': props.variant === 'pin-cols',
  },
]);

const getRowKey = (row: any, index: number) => {
  return row.id || row.key || index;
};

const formatCellValue = (row: any, column: Column) => {
  const field = column.field || column.key;
  if (!field) return '';

  const value = row[field];

  if (column.formatter) {
    return column.formatter(value, row);
  }

  return value ?? '';
};

const handleSort = (column: Column) => {
  emit('sort', column);
};
</script>
