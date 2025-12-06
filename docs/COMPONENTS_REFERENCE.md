# Components Reference

> **Total Components**: 15
> **Auto-Import**: Yes (Nuxt 4 auto-imports all components)

## Component Overview

All components are located in `components/` and are automatically imported by Nuxt 4.

---

## Navigation & Layout Components

### `EnhancedNavigation.vue`

**Purpose**: Main application navigation bar

**Features:**

- Responsive navigation menu
- Dark mode support
- Active route highlighting
- Mobile hamburger menu
- Accessibility features

**Usage:**

```vue
<template>
  <EnhancedNavigation />
</template>
```

**Location**: Used in `layouts/default.vue`

---

### `DashboardSidebar.vue`

**Purpose**: Sidebar navigation for dashboard

**Features:**

- Collapsible sidebar
- Navigation links
- Active state management

**Usage:**

```vue
<template>
  <DashboardSidebar />
</template>
```

---

## UI Components

### `ThemeToggle.vue`

**Purpose**: Dark/light theme switcher

**Features:**

- Toggle between light/dark/system themes
- Persists preference to localStorage
- Smooth transitions

**Usage:**

```vue
<template>
  <ThemeToggle />
</template>
```

**Props**: None (uses `useUserPreferences` composable)

---

### `UserPreferencesDialog.vue`

**Purpose**: User preferences dialog/modal

**Features:**

- Theme selection
- Animation preferences
- Compact mode toggle
- Auto-refresh settings
- Language selection

**Usage:**

```vue
<template>
  <UserPreferencesDialog />
</template>
```

**Props**: None (uses `useUserPreferencesStore`)

---

### `OptimizedImage.vue`

**Purpose**: Optimized image component with WebP support

**Features:**

- Automatic WebP conversion
- Lazy loading
- Responsive images (srcset)
- Loading skeleton
- Error handling
- Performance indicators
- Quality badges

**Props:**

```typescript
interface Props {
  src: string; // Image source path
  alt?: string; // Alt text
  class?: string; // CSS classes
  lazy?: boolean; // Lazy load (default: true)
  showPerformanceIndicator?: boolean; // Show performance badge
  showQualityIndicator?: boolean; // Show quality badge
  showImageInfo?: boolean; // Show image info overlay
  responsiveSizes?: string; // Responsive sizes
  decodingMode?: 'sync' | 'async' | 'auto'; // Decoding mode
}
```

**Events:**

- `@load` - Image loaded successfully
- `@error` - Image failed to load

**Usage:**

```vue
<template>
  <OptimizedImage
    src="phone-image.jpg"
    alt="Samsung Galaxy S24"
    :lazy="true"
    :show-performance-indicator="true"
    @load="handleImageLoad"
    @error="handleImageError"
  />
</template>
```

**Recommended For:**

- Phone images in search results
- Product images in recommendations
- Model showcase images

---

## Dashboard Components

### `DashboardContent.vue`

**Purpose**: Main dashboard content container

**Features:**

- Activity feed
- Recent predictions
- Quick stats
- API integration ready

**Usage:**

```vue
<template>
  <DashboardContent />
</template>
```

**State**: Uses API to fetch activities (see `fetchActivities()`)

---

### `PerformanceMetrics.vue`

**Purpose**: Display performance metrics and charts

**Features:**

- Training metrics display
- Real-time updates
- Chart visualization
- Multiple metric types

**Props:**

```typescript
interface Props {
  metrics?: TrainingMetrics;
  showCharts?: boolean;
}
```

**Usage:**

```vue
<template>
  <PerformanceMetrics :metrics="trainingMetrics" :show-charts="true" />
</template>
```

**Recommended For:**

- `pages/advanced.vue` - Training progress
- Dashboard pages

---

### `MagicUIDashboard.vue`

**Purpose**: Magic UI dashboard component

**Features:**

- Modern UI patterns
- Interactive elements

**Usage:**

```vue
<template>
  <MagicUIDashboard />
</template>
```

---

## Analytics Chart Components

### `AnalyticsAccuracyChart.vue`

**Purpose**: Display accuracy metrics chart

**Usage:**

```vue
<template>
  <AnalyticsAccuracyChart />
</template>
```

---

### `AnalyticsTopBrandsChart.vue`

**Purpose**: Display top brands chart

**Usage:**

```vue
<template>
  <AnalyticsTopBrandsChart />
</template>
```

---

### `AnalyticsGeographicalChart.vue`

**Purpose**: Display geographical distribution chart

**Usage:**

```vue
<template>
  <AnalyticsGeographicalChart />
</template>
```

---

### `AnalyticsFeatureImportanceChart.vue`

**Purpose**: Display feature importance chart

**Usage:**

```vue
<template>
  <AnalyticsFeatureImportanceChart />
</template>
```

---

### `AnalyticsYearlyTrendsChart.vue`

**Purpose**: Display yearly trends chart

**Usage:**

```vue
<template>
  <AnalyticsYearlyTrendsChart />
</template>
```

**Recommended For:**

- Analytics dashboard pages
- Data visualization pages

---

## System Management Components

### `MCPServerManager.vue`

**Purpose**: Manage MCP (Model Context Protocol) servers

**Features:**

- Server status monitoring
- Start/stop controls
- Response time tracking
- Server metrics display

**Usage:**

```vue
<template>
  <MCPServerManager />
</template>
```

**State**: Calculates average response time from server metrics

---

## Demo Components

### `ImageOptimizationDemo.vue`

**Purpose**: Demo component for image optimization features

**Usage:**

```vue
<template>
  <ImageOptimizationDemo />
</template>
```

---

## Component Usage Statistics

### Currently Used in Pages

- **`EnhancedNavigation`** - Used in `layouts/default.vue` ✅

### Available but Unused

- All other components (14 components) - Available but not integrated into pages

### Integration Recommendations

1. **`OptimizedImage`** → Use in:
   - `pages/search.vue` - Phone images
   - `pages/recommendations.vue` - Recommendation cards
   - `pages/compare.vue` - Comparison images
   - `pages/model-showcase.vue` - Model previews

2. **`ThemeToggle`** → Add to:
   - `EnhancedNavigation` component
   - Or create a settings menu

3. **`UserPreferencesDialog`** → Add to:
   - Navigation menu
   - Settings page

4. **`PerformanceMetrics`** → Use in:
   - `pages/advanced.vue` - Training metrics
   - Dashboard pages

5. **Analytics Charts** → Use in:
   - Analytics dashboard
   - Data visualization pages

---

## Component Patterns

### Standard Component Structure

```vue
<template>
  <!-- Component markup -->
</template>

<script setup lang="ts">
// Imports (if needed)
// Props definition
// State management
// Methods
// Lifecycle hooks
</script>

<style scoped>
/* Component styles */
</style>
```

### Auto-Import Pattern

**No imports needed:**

```vue
<script setup lang="ts">
// Components are auto-imported!
// Just use them in template
</script>

<template>
  <OptimizedImage src="..." />
</template>
```

### Props Definition

```vue
<script setup lang="ts">
interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
});
</script>
```

### Events Definition

```vue
<script setup lang="ts">
const emit = defineEmits<{
  click: [id: number];
  update: [value: string];
}>();
</script>
```

---

## Component Dependencies

### External Dependencies

- **Nuxt UI** (`@nuxt/ui`) - UI components (UButton, UCard, etc.)
- **Heroicons** (`@heroicons/vue`) - Icons
- **ApexCharts** - Chart components (some components)

### Internal Dependencies

- **Composables** - `useSentryLogger`, `useUserPreferences`, etc.
- **Stores** - Pinia stores for state management

---

## Component Best Practices

### ✅ DO:

- Use TypeScript for props and events
- Handle loading and error states
- Support dark mode
- Make components accessible
- Use composables for reusable logic
- Emit events for parent communication

### ❌ DON'T:

- Don't import components manually (auto-import)
- Don't use `console.log` (use `useSentryLogger`)
- Don't hardcode API URLs (use `useApiConfig`)
- Don't mutate props directly

---

## Component Testing

### E2E Tests

Components can be tested with Playwright:

```typescript
test('OptimizedImage loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('img')).toBeVisible();
});
```

### Unit Tests

Components can be unit tested with Vitest (configured but minimal usage).

---

## Component Development Guidelines

1. **Naming**: Use PascalCase (e.g., `OptimizedImage.vue`)
2. **Location**: Place in `components/` directory
3. **Auto-Import**: No manual imports needed
4. **TypeScript**: Use TypeScript for type safety
5. **Props**: Define props with TypeScript interfaces
6. **Events**: Define events with TypeScript
7. **Styling**: Use scoped styles or Tailwind classes
8. **Accessibility**: Include ARIA labels and keyboard support

---

## Future Component Ideas

1. **PhoneCard** - Reusable phone card component
2. **PredictionForm** - Unified prediction input form
3. **ModelComparisonTable** - Model comparison table
4. **SearchFilters** - Advanced search filters component
5. **LoadingSkeleton** - Reusable loading skeleton
6. **ErrorBoundary** - Error boundary component
7. **ToastNotification** - Toast notification component
