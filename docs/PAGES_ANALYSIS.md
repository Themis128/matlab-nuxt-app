# Pages Analysis

> **Total Pages**: 11
> **Framework**: Nuxt 4.2.1 with Vue 3.5.25

## Page Overview

All pages are located in `pages/` and use Nuxt's file-based routing.

---

## Page: `index.vue` (Home)

**Route**: `/`
**Purpose**: Landing page with hero section and feature overview

**Features:**

- Hero section with gradient background
- Stats cards (Total Models, Dataset Size, Accuracy, Active Sessions)
- Feature cards (Analytics Dashboard, Model Performance, Data Visualization)
- Trust indicators (MATLAB, TensorFlow, PyTorch, Nuxt.js)

**Components Used:**

- Nuxt UI components (UButton, UIcon, UCard)
- Layout: `default.vue` (EnhancedNavigation)

**API Calls:**

- None (static content)

**State Management:**

- None

**Composables Used:**

- None

---

## Page: `search.vue` (Search)

**Route**: `/search`
**Purpose**: Advanced phone search with filters

**Features:**

- Search input (name, brand)
- Filters (Brand, Min/Max RAM)
- Search results grid
- Pagination
- Image error handling with fallback

**Components Used:**

- Nuxt UI components (UInput, USelect, UButton, UCard, UBadge)
- Layout: `default.vue`

**API Calls:**

- `GET /api/products` - Fetch phones with filters

**State Management:**

- Local state (refs for search, filters, pagination)

**Composables Used:**

- None (could use `useApiConfig`, `useSentryLogger`)

**Data Flow:**

```
User Input → Watch Filters → API Call → Update Results → Display
```

---

## Page: `compare.vue` (Compare)

**Route**: `/compare`
**Purpose**: Side-by-side phone comparison

**Features:**

- Phone selector (up to 4 phones)
- Comparison table
- Specification display
- Export comparison

**Components Used:**

- Nuxt UI components (USelect, UButton, UCard, UIcon)
- Layout: `default.vue`

**API Calls:**

- `GET /api/products?limit=100` - Fetch available phones

**State Management:**

- Local state (selected phones, comparison data)

**Composables Used:**

- None (could use `useApiConfig`, `useSentryLogger`)

**Integration Opportunity:**

- Could use `OptimizedImage` component for phone images

---

## Page: `recommendations.vue` (Recommendations)

**Route**: `/recommendations`
**Purpose**: AI-powered phone recommendations by budget

**Features:**

- Budget range slider
- Value score calculation (1-10)
- Recommendation reasons (data-driven)
- Phone cards with images

**Components Used:**

- Nuxt UI components (URange, UButton, UCard, UBadge)
- Layout: `default.vue`

**API Calls:**

- `GET /api/products?limit=50` - Fetch phones for recommendations

**State Management:**

- Local state (budget range, recommendations)

**Composables Used:**

- None (could use `useUserPreferences`, `useApiConfig`)

**Business Logic:**

- `calculateValueScore()` - Calculates value score based on specs
- `getRecommendationReason()` - Generates recommendation text

**Integration Opportunities:**

- Use `OptimizedImage` component
- Use `userPreferencesStore` for user preferences
- Use `useSentryLogger` for analytics

---

## Page: `ai-demo.vue` (AI Demo)

**Route**: `/ai-demo`
**Purpose**: Interactive AI prediction demo

**Features:**

- Prediction form (brand, model, specs)
- Real-time prediction results
- Price prediction
- Performance score calculation
- Market position analysis
- AI insights generation

**Components Used:**

- Nuxt UI components (UFormGroup, USelect, UInput, UButton, UCard, UIcon)
- Layout: `default.vue`

**API Calls:**

- `POST /api/predict/price` - Price prediction

**State Management:**

- Local state (form data, results)

**Composables Used:**

- None (could use `usePredictionHistory`, `useSentryLogger`)

**Business Logic:**

- `calculateBasePrice()` - Calculates base price from specs
- `calculatePerformanceScore()` - Calculates performance score
- `getMarketPosition()` - Determines market position
- `generateInsights()` - Generates AI insights

**Integration Opportunities:**

- Use `predictionHistoryStore` to save predictions
- Use `useSentryLogger` for error tracking
- Use `usePredictionValidation` for input validation

---

## Page: `model-showcase.vue` (Model Showcase)

**Route**: `/model-showcase`
**Purpose**: Showcase ML models with interactive demos

**Features:**

- Model categories (All, Classification, Regression, Clustering, NLP, Computer Vision)
- Model cards with previews
- Interactive demo section
- Model performance comparison
- Model details modal

**Components Used:**

- Nuxt UI components (UButton, UCard, UIcon, UModal, UTextarea, UBadge)
- Layout: `default.vue`

**API Calls:**

- None (static model data)

**State Management:**

- Local state (models, selected model, demo results)

**Composables Used:**

- None

**Data:**

- Static model definitions (5 models)
- Mock demo results

**Integration Opportunities:**

- Use `OptimizedImage` for model previews
- Fetch real model data from API
- Use `advancedModelsStore` for model state

---

## Page: `datamine.vue` (Data Mining)

**Route**: `/datamine`
**Purpose**: Data mining and pattern discovery

**Features:**

- Overview cards (Total Records, Patterns Found, Clusters, Anomalies)
- Data mining tools (Association Rules, Clustering, Outlier Detection)
- Frequent patterns display
- Association rules display
- Cluster analysis results
- Interactive data explorer

**Components Used:**

- Nuxt UI components (UCard, UIcon, UButton, USelect)
- Layout: `default.vue`

**API Calls:**

- `GET /api/dataset/statistics` - Attempts to fetch statistics (with fallback)

**State Management:**

- Local state (patterns, rules, clusters)

**Composables Used:**

- None (could use `useApiConfig`, `useSentryLogger`)

**Data:**

- Static cluster data
- API-ready structures for patterns and rules

**Integration Opportunities:**

- Fetch real data mining results from API
- Use analytics chart components
- Use `useSentryLogger` for error tracking

---

## Page: `advanced.vue` (Advanced Analytics)

**Route**: `/advanced`
**Purpose**: Advanced analytics with real-time monitoring

**Features:**

- Analytics cards (Advanced Metrics, Neural Networks, Performance)
- Model configuration (Learning Rate, Batch Size, Epochs)
- Data processing toggles (Augmentation, Normalization, Cross Validation)
- Real-time training progress
- System resource monitoring (CPU, Memory, GPU)

**Components Used:**

- Nuxt UI components (UCard, UIcon, UButton, USlider, USelect, UInput, UToggle, UProgress)
- Layout: `default.vue`

**API Calls:**

- `GET /api/dataset/preprocessing-status` - Fetches training metrics

**State Management:**

- Local state (config, metrics)
- Periodic updates (every 5 seconds)

**Composables Used:**

- None (could use `useApiConfig`, `useSentryLogger`, `useApiStatus`)

**Integration Opportunities:**

- Use `PerformanceMetrics` component
- Use `advancedModelsStore` for state management
- Use `useApiStatus` for API health monitoring
- Use `useUserPreferences` for auto-refresh setting

---

## Page: `ml-comparison.vue` (ML Comparison)

**Route**: `/ml-comparison`
**Purpose**: Compare different ML models

**Features:**

- Model selection cards (CNN, LSTM, Transformer, Ensemble)
- Performance comparison table
- Visual comparison charts
- Model recommendations

**Components Used:**

- Nuxt UI components (UCard, UIcon, UButton)
- Layout: `default.vue`

**API Calls:**

- None (static comparison data)

**State Management:**

- Local state (models, selected model, metrics)

**Composables Used:**

- None

**Data:**

- Static model comparison data (4 models)
- Static recommendations

**Integration Opportunities:**

- Use `abTestingStore` for real A/B test results
- Fetch real model comparison from API
- Use analytics chart components

---

## Page: `api-docs.vue` (API Documentation)

**Route**: `/api-docs`
**Purpose**: API documentation and reference

**Features:**

- API category filters (Core, ML, Data, Utils)
- API cards with details
- Expandable API details
- SDK installation commands
- Parameter documentation
- Response examples

**Components Used:**

- Nuxt UI components (UButton, UIcon, UCard, UBadge)
- Layout: `default.vue`

**API Calls:**

- None (static documentation)

**State Management:**

- Local state (selected category, expanded APIs)

**Composables Used:**

- None

**Data:**

- Static API documentation

---

## Page: `ab-testing.vue` (A/B Testing)

**Route**: `/ab-testing`
**Purpose**: A/B testing dashboard for ML models

**Features:**

- Overview cards (Active Tests, Total Tests, Success Rate)
- Current experiments display
- Test configuration form
- Test results summary table
- Statistical significance display

**Components Used:**

- Nuxt UI components (UCard, UIcon, UButton, UProgress, USelect, UInput, UTextarea)
- Layout: `default.vue`

**API Calls:**

- None (static test data)

**State Management:**

- Local state (tests, form data)

**Composables Used:**

- None (should use `abTestingStore`)

**Integration Opportunities:**

- **HIGH PRIORITY**: Use `abTestingStore` for all test management
- Use `useSentryLogger` for error tracking
- Use `useApiConfig` for API calls

---

## Page Analysis Summary

### API Integration Status

| Page                  | API Calls                           | Status                  |
| --------------------- | ----------------------------------- | ----------------------- |
| `index.vue`           | None                                | Static                  |
| `search.vue`          | `/api/products`                     | ✅ Active               |
| `compare.vue`         | `/api/products`                     | ✅ Active               |
| `recommendations.vue` | `/api/products`                     | ✅ Active               |
| `ai-demo.vue`         | `/api/predict/price`                | ✅ Active               |
| `model-showcase.vue`  | None                                | Static                  |
| `datamine.vue`        | `/api/dataset/statistics`           | ⚠️ Attempts (fallback)  |
| `advanced.vue`        | `/api/dataset/preprocessing-status` | ⚠️ Attempts (fallback)  |
| `ml-comparison.vue`   | None                                | Static                  |
| `api-docs.vue`        | None                                | Static                  |
| `ab-testing.vue`      | None                                | Static (should use API) |

### Store Integration Status

| Page      | Stores Used | Status            |
| --------- | ----------- | ----------------- |
| All pages | None        | ❌ Not integrated |

**Recommendation**: Integrate stores into pages (see integration guide)

### Composable Integration Status

| Page                  | Composables Used       | Status            |
| --------------------- | ---------------------- | ----------------- |
| `layouts/default.vue` | `useKeyboardShortcuts` | ✅ Used           |
| All pages             | None                   | ❌ Not integrated |

**Recommendation**: Use composables for API calls, logging, and utilities

### Component Integration Status

| Page                  | Custom Components Used | Status            |
| --------------------- | ---------------------- | ----------------- |
| `layouts/default.vue` | `EnhancedNavigation`   | ✅ Used           |
| All pages             | None                   | ❌ Not integrated |

**Recommendation**: Use `OptimizedImage` in image-heavy pages

---

## Page Patterns

### Common Patterns

#### 1. API Call Pattern

```vue
<script setup lang="ts">
const data = ref([]);
const isLoading = ref(false);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch('/api/products');
    data.value = response.products;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>
```

#### 2. Form Handling Pattern

```vue
<script setup lang="ts">
const formData = reactive({
  field1: '',
  field2: '',
});

const handleSubmit = async () => {
  const response = await $fetch('/api/endpoint', {
    method: 'POST',
    body: formData,
  });
};
</script>
```

#### 3. Watch Pattern

```vue
<script setup lang="ts">
watch(
  [searchQuery, filters],
  () => {
    fetchData();
  },
  { deep: true }
);
</script>
```

---

## Page Improvements

### High Priority

1. **`ab-testing.vue`** → Integrate `abTestingStore`
2. **`ai-demo.vue`** → Integrate `predictionHistoryStore`
3. **All API pages** → Use `useApiConfig` and `useSentryLogger`

### Medium Priority

1. **Image pages** → Use `OptimizedImage` component
2. **`recommendations.vue`** → Use `userPreferencesStore`
3. **`advanced.vue`** → Use `advancedModelsStore` and `PerformanceMetrics`

### Low Priority

1. **All pages** → Add analytics chart components where appropriate
2. **All pages** → Use `useResponsive` for responsive behavior
3. **All pages** → Use `useApiStatus` for API health monitoring

---

## Page Routing

### File-Based Routing

Nuxt automatically creates routes from page files:

| File                        | Route              |
| --------------------------- | ------------------ |
| `pages/index.vue`           | `/`                |
| `pages/search.vue`          | `/search`          |
| `pages/compare.vue`         | `/compare`         |
| `pages/recommendations.vue` | `/recommendations` |
| `pages/ai-demo.vue`         | `/ai-demo`         |
| `pages/model-showcase.vue`  | `/model-showcase`  |
| `pages/datamine.vue`        | `/datamine`        |
| `pages/advanced.vue`        | `/advanced`        |
| `pages/ml-comparison.vue`   | `/ml-comparison`   |
| `pages/api-docs.vue`        | `/api-docs`        |
| `pages/ab-testing.vue`      | `/ab-testing`      |

### Navigation

All pages use the `default.vue` layout which includes:

- `EnhancedNavigation` component
- Footer
- Keyboard shortcuts

---

## Page Metadata

### SEO & Meta Tags

Pages set metadata in `onMounted()`:

```vue
<script setup lang="ts">
onMounted(() => {
  document.title = 'Page Title';
  // Meta description handling
});
</script>
```

**Recommendation**: Use Nuxt's `useHead()` or `useSeoMeta()` for better SEO.

---

## Page Performance

### Loading Performance

- **Static Pages**: Fast (no API calls)
- **API Pages**: Depends on Python API response time
- **Image Pages**: Could benefit from `OptimizedImage` component

### Optimization Opportunities

1. **Lazy Loading**: Images should use `OptimizedImage` with lazy loading
2. **Code Splitting**: Automatic via Nuxt
3. **Caching**: API responses could be cached
4. **Prefetching**: Could prefetch data on hover

---

## Page Testing

### E2E Tests

Playwright tests exist for some pages:

- Location: `tests/playwright/`

### Test Coverage

**Status**: Minimal (E2E tests exist but not comprehensive)

**Recommendation**: Expand test coverage for critical user flows

---

## Page Accessibility

### Current Status

- ✅ Skip to main content link (layout)
- ✅ ARIA labels in navigation
- ✅ Semantic HTML
- ⚠️ Some pages may need more ARIA labels

### Improvements Needed

1. Add ARIA labels to form inputs
2. Add keyboard navigation support
3. Add focus management
4. Test with screen readers

---

## Conclusion

**Pages Status**: Functional but could benefit from:

- Store integration
- Composable usage
- Component integration
- Enhanced error handling
- Better SEO metadata

**Priority**: Start with `ab-testing.vue` and `ai-demo.vue` for store integration.
