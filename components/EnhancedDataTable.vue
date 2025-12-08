<template>
  <div class="card bg-base-100 shadow-xl">
    <div v-if="title || description || searchable || exportable" class="card-header">
      <div class="flex items-center justify-between">
        <div>
          <h3 v-if="title" class="card-title">
            {{ title }}
          </h3>
          <p v-if="description" class="text-sm opacity-70 mt-1">
            {{ description }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div v-if="searchable" class="form-control">
            <div class="input-group">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search..."
                class="input input-bordered input-sm w-64"
                @input="handleSearch"
              />
              <button class="btn btn-square btn-sm">
                <Icon name="heroicons:magnifying-glass" class="h-4 w-4" />
              </button>
            </div>
          </div>
          <button v-if="exportable" class="btn btn-ghost btn-sm" @click="handleExport">
            <Icon name="heroicons:arrow-down-tray" class="h-4 w-4" />
            Export
          </button>
        </div>
      </div>
    </div>

    <div class="card-body">
      <div v-if="error" class="alert alert-error">
        <Icon name="heroicons:exclamation-triangle" class="h-6 w-6" />
        <div>
          <h3 class="font-bold">Error</h3>
          <div class="text-sm">
            {{ error }}
          </div>
        </div>
        <button class="btn btn-sm btn-ghost" @click="$emit('refresh')">Try Again</button>
      </div>

      <DTable
        v-else
        :rows="paginatedRows"
        :columns="columns"
        :loading="loading"
        :empty-message="emptyState?.label || 'No data available'"
      >
        <!-- Custom slot support for columns -->
        <template v-for="(_, slot) in $slots" #[slot]="scope">
          <slot :name="slot" v-bind="scope" />
        </template>
      </DTable>

      <!-- Pagination - DaisyUI pattern -->
      <div v-if="paginated && totalPages > 1" class="flex items-center justify-between mt-4">
        <div class="text-sm opacity-70">
          Showing
          <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
          to
          <span class="font-medium">{{ Math.min(currentPage * pageSize, totalRows) }}</span>
          of
          <span class="font-medium">{{ totalRows }}</span>
          results
        </div>
        <div class="join">
          <button
            class="join-item btn btn-sm"
            :disabled="currentPage === 1"
            @click="currentPage = Math.max(1, currentPage - 1)"
          >
            «
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            class="join-item btn btn-sm"
            :class="{ 'btn-active': currentPage === page }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button
            class="join-item btn btn-sm"
            :disabled="currentPage === totalPages"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
          >
            »
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface _Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface Props {
  title?: string;
  description?: string;
  columns: any[]; // Use any[] to match TableColumn type
  rows: any[];
  loading?: boolean;
  error?: string | null;
  searchable?: boolean;
  exportable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  emptyState?: {
    label?: string;
    description?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Data Table',
  description: 'View and manage your data',
  loading: false,
  error: null,
  searchable: true,
  exportable: true,
  paginated: true,
  pageSize: 10,
  emptyState: () => ({
    label: 'No data available',
    description: 'There are no records to display.',
  }),
});

const emit = defineEmits<{
  refresh: [];
  export: [data: any[]];
  search: [query: string];
}>();

// Search
const searchQuery = ref('');
const filteredRows = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.rows;
  }
  const query = searchQuery.value.toLowerCase();
  return props.rows.filter((row) => {
    return props.columns.some((col) => {
      const value = row[col.key];
      return value && String(value).toLowerCase().includes(query);
    });
  });
});

// Pagination
const currentPage = ref(1);
const totalRows = computed(() => filteredRows.value.length);
const totalPages = computed(() => Math.ceil(totalRows.value / props.pageSize));
const paginatedRows = computed(() => {
  if (!props.paginated) {
    return filteredRows.value;
  }
  const start = (currentPage.value - 1) * props.pageSize;
  const end = start + props.pageSize;
  return filteredRows.value.slice(start, end);
});

// Visible pages for pagination (max 7 pages shown)
const visiblePages = computed(() => {
  const maxVisible = 7;
  const pages: number[] = [];

  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    const start = Math.max(1, currentPage.value - 3);
    const end = Math.min(totalPages.value, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});

// Watch for data changes to reset pagination
watch(
  () => props.rows,
  () => {
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = 1;
    }
  }
);

// Methods
const handleSearch = () => {
  currentPage.value = 1; // Reset to first page on search
  emit('search', searchQuery.value);
};

const handleExport = () => {
  emit('export', filteredRows.value);
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
