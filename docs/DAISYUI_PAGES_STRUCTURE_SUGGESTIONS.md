# DaisyUI Pages Structure Suggestions

## Current Analysis

Your project has **20 pages** in the `pages/` directory, and you're actively migrating to DaisyUI. Here are comprehensive suggestions to optimize your pages structure and DaisyUI usage.

## Current Pages Structure

```
pages/
├── index.vue                    ✅ Using DaisyUI
├── search.vue                   ✅ Using DaisyUI components
├── settings.vue                 ✅ Using DaisyUI components (DTabs, DCard, DButton, etc.)
├── profile.vue                  ✅ Using DaisyUI components
├── compare.vue                  ✅ Using DaisyUI components
├── model-showcase.vue           ✅ Using DaisyUI components
├── advanced.vue                 ⚠️ Needs review
├── ai-demo.vue                  ⚠️ Needs review
├── api-docs.vue                 ⚠️ Needs review
├── datamine.vue                 ⚠️ Needs review
├── ml-comparison.vue            ⚠️ Needs review
├── notifications.vue            ⚠️ Needs review
├── query.vue                    ⚠️ Needs review
├── recommendations.vue          ⚠️ Needs review
├── sentry-dashboard.vue          ⚠️ Needs review
├── sentry-test.vue               ⚠️ Needs review
├── sentrystatus.vue              ⚠️ Needs review
├── integration-status.vue       ⚠️ Needs review
├── style-guide.vue              ⚠️ Needs review
└── ab-testing.vue                ⚠️ Needs review
```

## Key Suggestions

### 1. **Organize Pages by Feature/Module**

Consider organizing pages into subdirectories for better maintainability:

```
pages/
├── index.vue                    # Homepage
├── search/
│   ├── index.vue               # Search main page
│   └── [id].vue                # Search detail page (if needed)
├── compare/
│   └── index.vue               # Comparison page
├── models/
│   ├── showcase.vue            # Model showcase
│   └── comparison.vue          # ML comparison
├── user/
│   ├── profile.vue              # User profile
│   └── settings.vue             # User settings
├── analytics/
│   ├── datamine.vue            # Data mining
│   ├── recommendations.vue     # Recommendations
│   └── query.vue               # Query interface
├── admin/
│   ├── sentry-dashboard.vue    # Sentry dashboard
│   ├── sentry-test.vue         # Sentry testing
│   ├── sentrystatus.vue        # Sentry status
│   └── integration-status.vue  # Integration status
├── demo/
│   └── ai-demo.vue             # AI demo
├── docs/
│   └── api-docs.vue            # API documentation
└── style-guide.vue              # Style guide (dev only)
```

**Benefits:**
- Better organization and navigation
- Easier to find related pages
- Clearer URL structure (`/user/profile` vs `/profile`)
- Better code splitting and lazy loading

### 2. **Standardize DaisyUI Component Usage**

#### ✅ **DO: Use DaisyUI Wrapper Components**

```vue
<!-- ✅ Good: Using wrapper components -->
<DButton variant="primary" size="lg">Click Me</DButton>
<DCard title="Card Title">Content</DCard>
<DInput v-model="value" label="Input Label" />
<DSelect v-model="selected" :options="options" />
```

#### ❌ **DON'T: Mix Direct Classes with Wrapper Components**

```vue
<!-- ❌ Avoid: Mixing direct classes with components -->
<button class="btn btn-primary">Click Me</button>
<DButton variant="primary">Click Me</DButton>
```

#### ✅ **DO: Use DaisyUI Semantic Colors**

```vue
<!-- ✅ Good: Using semantic colors -->
<div class="bg-base-100 text-base-content">
<div class="bg-primary text-primary-content">
<div class="bg-success text-success-content">
```

#### ❌ **DON'T: Use Hard-coded Colors**

```vue
<!-- ❌ Avoid: Hard-coded colors -->
<div class="bg-blue-500 text-white">
<div class="bg-gray-800 text-gray-100">
```

### 3. **Create Page Layout Components**

Create reusable page layout components using DaisyUI:

```vue
<!-- components/daisyui/DPageLayout.vue -->
<template>
  <div class="min-h-screen bg-base-200">
    <!-- Hero Section -->
    <section v-if="showHero" class="hero bg-base-200 py-12">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="mb-5 text-5xl font-bold text-base-content">
            {{ title }}
          </h1>
          <p v-if="description" class="mb-5 text-base-content/70">
            {{ description }}
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <slot />
    </div>
  </div>
</template>
```

**Usage in pages:**
```vue
<DPageLayout title="Settings" description="Configure your preferences">
  <!-- Page content -->
</DPageLayout>
```

### 4. **Standardize Page Headers**

Create a consistent header component:

```vue
<!-- components/daisyui/DPageHeader.vue -->
<template>
  <div class="mb-8">
    <div class="mb-4 flex items-center gap-4">
      <div :class="['rounded-2xl p-3', iconBgClass]">
        <Icon :name="icon" class="h-8 w-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-bold text-base-content">{{ title }}</h1>
        <p v-if="description" class="mt-1 text-lg opacity-70">
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>
```

### 5. **Use DaisyUI Layout Components**

#### **Hero Sections**
```vue
<!-- ✅ Use DaisyUI hero component -->
<section class="hero bg-base-200 min-h-screen">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="mb-5 text-5xl font-bold">Title</h1>
      <p class="mb-5">Description</p>
      <DButton variant="primary">Get Started</DButton>
    </div>
  </div>
</section>
```

#### **Stats Sections**
```vue
<!-- ✅ Use DaisyUI stats component -->
<div class="stats stats-vertical lg:stats-horizontal shadow">
  <div class="stat">
    <div class="stat-title">Total Models</div>
    <div class="stat-value text-primary">24</div>
    <div class="stat-desc">+12% from last month</div>
  </div>
</div>
```

#### **Card Grids**
```vue
<!-- ✅ Use DaisyUI card with consistent styling -->
<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  <DCard v-for="item in items" :key="item.id" :title="item.title">
    {{ item.content }}
  </DCard>
</div>
```

### 6. **Create Page-Specific Composable Patterns**

Standardize data fetching and state management:

```typescript
// composables/usePageData.ts
export const usePageData = <T>(endpoint: string) => {
  const data = ref<T | null>(null)
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const fetchData = async () => {
    pending.value = true
    error.value = null
    try {
      data.value = await $fetch<T>(endpoint)
    } catch (e) {
      error.value = e as Error
    } finally {
      pending.value = false
    }
  }

  return { data, pending, error, fetchData }
}
```

### 7. **Standardize Error States**

Use DaisyUI alert components for errors:

```vue
<!-- ✅ Consistent error handling -->
<DAlert v-if="error" variant="error" :title="error.title">
  {{ error.message }}
</DAlert>
```

### 8. **Standardize Loading States**

Use DaisyUI loading components:

```vue
<!-- ✅ Consistent loading states -->
<div v-if="pending" class="flex justify-center py-12">
  <span class="loading loading-spinner loading-lg"></span>
</div>
```

### 9. **Use DaisyUI Navigation Components**

For pages with navigation:

```vue
<!-- ✅ Use DaisyUI tabs for page sections -->
<DTabs v-model="activeTab" :items="tabs">
  <template #tab1>Content 1</template>
  <template #tab2>Content 2</template>
</DTabs>
```

### 10. **Optimize Page Structure Template**

Create a standard page template:

```vue
<template>
  <!-- Page Layout -->
  <DPageLayout :title="pageTitle" :description="pageDescription">
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <DAlert v-else-if="error" variant="error" :title="errorTitle">
      {{ errorMessage }}
    </DAlert>

    <!-- Content -->
    <div v-else>
      <!-- Page Header (if needed) -->
      <DPageHeader
        v-if="showHeader"
        :title="headerTitle"
        :description="headerDescription"
        :icon="headerIcon"
      />

      <!-- Main Content -->
      <slot />
    </div>
  </DPageLayout>
</template>
```

## Migration Checklist for Remaining Pages

For pages marked with ⚠️, ensure they:

- [ ] Use `DButton` instead of `<button class="btn">`
- [ ] Use `DCard` instead of `<div class="card">`
- [ ] Use `DInput` instead of `<input class="input">`
- [ ] Use `DSelect` instead of `<select class="select">`
- [ ] Use `DTabs` for tabbed interfaces
- [ ] Use `DModal` for modals
- [ ] Use semantic color classes (`base-content`, `primary`, etc.)
- [ ] Remove PrimeVue/Nuxt UI components
- [ ] Use DaisyUI theme colors throughout
- [ ] Add proper loading states
- [ ] Add proper error states
- [ ] Use consistent spacing (DaisyUI spacing scale)

## Recommended File Structure Improvements

### Option A: Feature-Based (Recommended)
```
pages/
├── index.vue
├── search/
│   └── index.vue
├── compare/
│   └── index.vue
├── user/
│   ├── profile.vue
│   └── settings.vue
└── ...
```

### Option B: Keep Flat but Add Metadata
Add `definePageMeta` to all pages for better organization:

```vue
<script setup>
definePageMeta({
  title: 'Page Title',
  description: 'Page description',
  layout: 'default',
  category: 'user', // For grouping
})
</script>
```

## Additional Recommendations

1. **Create a Pages Index File**
   - Document all pages and their purposes
   - Track migration status
   - List dependencies

2. **Use Consistent Naming**
   - Use kebab-case for file names
   - Use descriptive names
   - Group related pages

3. **Implement Page Transitions**
   - Use DaisyUI-compatible transitions
   - Add loading states between pages

4. **Optimize Bundle Size**
   - Lazy load heavy pages
   - Use dynamic imports for large components

5. **Add Page Metadata**
   - SEO meta tags
   - Open Graph tags
   - Structured data

## Example: Refactored Page

**Before:**
```vue
<template>
  <div class="container mx-auto p-6">
    <h1>Settings</h1>
    <button class="btn btn-primary">Save</button>
  </div>
</template>
```

**After:**
```vue
<template>
  <DPageLayout title="Settings" description="Configure your preferences">
    <DPageHeader
      title="Settings"
      description="Configure your application preferences"
      icon="heroicons:cog-6-tooth"
    />

    <DCard title="General Settings">
      <DInput v-model="name" label="Name" />
      <DButton @click="save" variant="primary">Save</DButton>
    </DCard>
  </DPageLayout>
</template>
```

## Next Steps

1. ✅ Review all pages for DaisyUI migration status
2. ✅ Create reusable page layout components
3. ✅ Standardize error and loading states
4. ✅ Organize pages into feature-based structure (optional)
5. ✅ Document page structure and patterns
6. ✅ Create page templates for common patterns

## Resources

- [DaisyUI Components](https://daisyui.com/components/)
- [DaisyUI Themes](https://daisyui.com/docs/themes/)
- [DaisyUI Migration Guide](./DAISYUI_MIGRATION_GUIDE.md)
- [DaisyUI Component Examples](./DAISYUI_COMPONENT_EXAMPLES.md)
