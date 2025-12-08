# DaisyUI Page Patterns - Quick Reference

Common page patterns using DaisyUI components for consistent implementation across your application.

## 1. Basic Page Layout

```vue
<template>
  <div class="min-h-screen bg-base-200">
    <div class="container mx-auto px-4 py-8">
      <h1 class="mb-6 text-4xl font-bold text-base-content">Page Title</h1>
      <slot />
    </div>
  </div>
</template>
```

## 2. Page with Hero Section

```vue
<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="hero bg-base-200 py-20">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <div class="badge badge-primary mb-4">Badge</div>
          <h1 class="mb-5 text-5xl font-bold text-base-content">Title</h1>
          <p class="mb-5 text-base-content/70">Description</p>
          <DButton variant="primary" size="lg">Get Started</DButton>
        </div>
      </div>
    </section>

    <!-- Content Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <slot />
      </div>
    </section>
  </div>
</template>
```

## 3. Settings/Form Page

```vue
<template>
  <div class="container mx-auto max-w-5xl p-6">
    <DPageHeader
      title="Settings"
      description="Configure your preferences"
      icon="heroicons:cog-6-tooth"
    />

    <DTabs v-model="activeTab" :items="tabs">
      <template #general>
        <DCard title="General Settings">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-base-content">Setting</label>
                <p class="text-xs opacity-70">Description</p>
              </div>
              <DToggle v-model="setting" />
            </div>
          </div>
        </DCard>
      </template>
    </DTabs>

    <div class="mt-6 flex justify-end">
      <DButton @click="save" :loading="saving" variant="primary">Save</DButton>
    </div>
  </div>
</template>
```

## 4. List/Grid Page

```vue
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="mb-4 text-4xl font-bold text-base-content">Items</h1>
      <div class="flex items-center justify-between">
        <p class="text-base-content/70">Total: {{ items.length }}</p>
        <DButton variant="primary" @click="addItem">Add Item</DButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <DAlert v-else-if="error" variant="error" title="Error">
      {{ error.message }}
    </DAlert>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DCard
        v-for="item in items"
        :key="item.id"
        :title="item.title"
        class="hover:shadow-xl transition-shadow"
      >
        <p class="text-base-content/70">{{ item.description }}</p>
        <template #footer>
          <DButton variant="ghost" size="sm">View</DButton>
        </template>
      </DCard>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <div class="join">
        <button
          v-for="page in totalPages"
          :key="page"
          class="join-item btn"
          :class="{ 'btn-active': currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>
```

## 5. Detail/View Page

```vue
<template>
  <div class="container mx-auto max-w-5xl p-6">
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <DAlert v-else-if="error" variant="error" title="Error">
      {{ error.message }}
    </DAlert>

    <!-- Content -->
    <div v-else>
      <!-- Header -->
      <div class="mb-8">
        <DButton variant="ghost" size="sm" @click="goBack">
          <Icon name="heroicons:arrow-left" class="h-4 w-4" />
          Back
        </DButton>
        <h1 class="mt-4 text-4xl font-bold text-base-content">{{ item.title }}</h1>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <DCard :title="item.title">
            <p class="text-base-content/70">{{ item.description }}</p>
          </DCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <DCard title="Details">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-base-content/70">Status</span>
                <span class="badge badge-success">Active</span>
              </div>
            </div>
          </DCard>

          <DCard title="Actions">
            <div class="space-y-2">
              <DButton variant="primary" block>Edit</DButton>
              <DButton variant="outline" block>Share</DButton>
            </div>
          </DCard>
        </div>
      </div>
    </div>
  </div>
</template>
```

## 6. Search/Filter Page

```vue
<template>
  <div class="min-h-screen bg-base-200">
    <!-- Search Section -->
    <section class="bg-base-100 py-12">
      <div class="container mx-auto px-4">
        <DCard>
          <div class="space-y-6">
            <!-- Search Input -->
            <div class="form-control">
              <div class="input-group">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search..."
                  class="input input-bordered w-full"
                />
                <button class="btn btn-square">
                  <Icon name="heroicons:magnifying-glass" class="h-5 w-5" />
                </button>
              </div>
            </div>

            <!-- Filters -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <DSelect
                v-model="filter1"
                label="Filter 1"
                :options="filterOptions1"
              />
              <DSelect
                v-model="filter2"
                label="Filter 2"
                :options="filterOptions2"
              />
              <DInput
                v-model="filter3"
                label="Filter 3"
                type="number"
              />
            </div>

            <!-- Actions -->
            <div class="flex gap-4">
              <DButton variant="primary" @click="search">Search</DButton>
              <DButton variant="ghost" @click="clearFilters">Clear</DButton>
            </div>
          </div>
        </DCard>
      </div>
    </section>

    <!-- Results Section -->
    <section class="py-12">
      <div class="container mx-auto px-4">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-base-content">
            Results ({{ results.length }})
          </h2>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DCard
            v-for="result in results"
            :key="result.id"
            :title="result.title"
          >
            {{ result.description }}
          </DCard>
        </div>
      </div>
    </section>
  </div>
</template>
```

## 7. Dashboard Page

```vue
<template>
  <div class="container mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="mb-2 text-4xl font-bold text-base-content">Dashboard</h1>
      <p class="text-base-content/70">Welcome back!</p>
    </div>

    <!-- Stats -->
    <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-figure text-primary">
          <Icon name="heroicons:chart-bar" class="h-8 w-8" />
        </div>
        <div class="stat-title">Total Items</div>
        <div class="stat-value text-primary">24</div>
        <div class="stat-desc">+12% from last month</div>
      </div>
      <!-- More stats... -->
    </div>

    <!-- Charts/Content Grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <DCard title="Chart 1">
        <!-- Chart content -->
      </DCard>
      <DCard title="Chart 2">
        <!-- Chart content -->
      </DCard>
    </div>
  </div>
</template>
```

## 8. Comparison Page

```vue
<template>
  <div class="container mx-auto p-6">
    <h1 class="mb-8 text-4xl font-bold text-base-content">Compare Items</h1>

    <!-- Selection -->
    <DCard class="mb-8">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DSelect
          v-for="(item, index) in selectedItems"
          :key="index"
          v-model="item"
          :label="`Item ${index + 1}`"
          :options="availableItems"
        />
      </div>
      <div class="mt-4 flex gap-4">
        <DButton variant="primary" @click="compare">Compare</DButton>
        <DButton variant="ghost" @click="clear">Clear</DButton>
      </div>
    </DCard>

    <!-- Comparison Table -->
    <DCard v-if="comparisonData">
      <DTable :data="comparisonData" :columns="columns" />
    </DCard>
  </div>
</template>
```

## 9. Profile Page

```vue
<template>
  <div class="container mx-auto max-w-5xl p-6">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <DCard title="Profile Information">
          <div class="space-y-4">
            <DInput v-model="name" label="Name" />
            <DInput v-model="email" label="Email" type="email" />
            <DButton @click="save" variant="primary">Save</DButton>
          </div>
        </DCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <DCard title="Quick Stats">
          <div class="space-y-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">24</div>
              <div class="text-sm text-base-content/70">Items</div>
            </div>
          </div>
        </DCard>
      </div>
    </div>
  </div>
</template>
```

## 10. Modal/Dialog Page Pattern

```vue
<template>
  <div>
    <DButton @click="showModal = true">Open Modal</DButton>

    <DModal v-model="showModal" title="Modal Title">
      <p>Modal content goes here</p>
      <template #footer>
        <DButton variant="ghost" @click="showModal = false">Cancel</DButton>
        <DButton variant="primary" @click="save">Save</DButton>
      </template>
    </DModal>
  </div>
</template>
```

## Common Patterns

### Loading State
```vue
<div v-if="pending" class="flex justify-center py-12">
  <span class="loading loading-spinner loading-lg"></span>
</div>
```

### Error State
```vue
<DAlert v-if="error" variant="error" title="Error">
  {{ error.message }}
</DAlert>
```

### Empty State
```vue
<div v-if="items.length === 0" class="text-center py-12">
  <Icon name="heroicons:inbox" class="mx-auto h-12 w-12 text-base-content/30" />
  <p class="mt-4 text-lg text-base-content/70">No items found</p>
  <DButton variant="primary" class="mt-4">Add Item</DButton>
</div>
```

### Success Message
```vue
<DAlert v-if="success" variant="success" title="Success">
  {{ successMessage }}
</DAlert>
```

## Best Practices

1. **Always use DaisyUI wrapper components** (`DButton`, `DCard`, etc.)
2. **Use semantic color classes** (`base-content`, `primary`, etc.)
3. **Consistent spacing** using Tailwind spacing scale
4. **Loading states** for async operations
5. **Error handling** with DaisyUI alerts
6. **Empty states** for better UX
7. **Responsive design** using Tailwind breakpoints
8. **Accessibility** with proper ARIA labels

## Component Usage Reference

- **Buttons**: `<DButton variant="primary" size="lg">`
- **Cards**: `<DCard title="Title">Content</DCard>`
- **Inputs**: `<DInput v-model="value" label="Label" />`
- **Selects**: `<DSelect v-model="value" :options="options" />`
- **Tabs**: `<DTabs v-model="activeTab" :items="tabs">`
- **Modals**: `<DModal v-model="show" title="Title">`
- **Alerts**: `<DAlert variant="success" title="Title">`
- **Badges**: `<span class="badge badge-primary">Badge</span>`
- **Loading**: `<span class="loading loading-spinner"></span>`
