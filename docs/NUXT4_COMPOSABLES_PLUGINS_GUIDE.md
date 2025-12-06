# Nuxt 4 Composables & Plugins Implementation Guide

## 🎯 Nuxt 4 Native Composables for Your Mobile Dataset Analytics App

### Core Data Fetching Composables

#### 1. `useFetch` - For API Endpoints

**Best for:** Fetching data from your server API routes

```typescript
// composables/useDatasetStatistics.ts
export const useDatasetStatistics = () => {
  const { data, pending, error, refresh, status } = await useFetch('/api/dataset/statistics', {
    key: 'dataset-statistics',
    // Transform response
    transform: (data: any) => ({
      ...data,
      totalModels: data.totalRecords,
      brands: data.companies,
    }),
    // Default value while loading
    default: () => ({
      totalRecords: 0,
      columns: [],
      companies: [],
      yearRange: { min: 2020, max: 2025 },
      priceRange: { min: 0, max: 0, avg: 0 },
    }),
    // Server-side fetch
    server: true,
    // Lazy loading (non-blocking)
    lazy: false,
  });

  return {
    statistics: data,
    isLoading: pending,
    error,
    refresh,
    status,
  };
};
```

#### 2. `useAsyncData` - For Custom Data Fetching

**Best for:** Complex data fetching with custom logic

```typescript
// composables/useModelPredictions.ts
export const useModelPredictions = () => {
  const { data, pending, error, refresh } = await useAsyncData(
    'model-predictions',
    async (nuxtApp, { signal }) => {
      const { pythonApiUrl } = useApiConfig();

      // Use AbortSignal for cancellation
      const response = await $fetch('/api/predict/price', {
        method: 'POST',
        body: predictionData,
        signal, // Supports cancellation
      });

      return response;
    },
    {
      server: true,
      lazy: true,
      watch: [predictionData], // Auto-refresh when data changes
    }
  );

  return { predictions: data, pending, error, refresh };
};
```

#### 3. `useLazyFetch` - Non-Blocking Data Fetching

**Best for:** Secondary data that doesn't block page load

```typescript
// composables/useDatasetFilters.ts
export const useDatasetFilters = () => {
  const filters = ref({ brand: '', priceRange: [0, 1000] });

  const { data, pending } = await useLazyFetch('/api/dataset/search', {
    query: filters, // Reactive query params
    watch: [filters], // Auto-refetch when filters change
    key: 'dataset-search',
  });

  return { results: data, isLoading: pending, filters };
};
```

#### 4. `useLazyAsyncData` - Non-Blocking Custom Fetching

**Best for:** Background data loading

```typescript
// composables/useRecommendations.ts
export const useRecommendations = () => {
  const route = useRoute();
  const modelId = computed(() => route.params.id);

  const { data } = await useLazyAsyncData(
    () => `recommendations-${modelId.value}`,
    async () => {
      return await $fetch(`/api/dataset/similar`, {
        method: 'POST',
        body: { modelId: modelId.value },
      });
    },
    {
      watch: [modelId], // Refetch when route changes
    }
  );

  return { recommendations: data };
};
```

---

### State Management Composables

#### 5. `useState` - Shared Reactive State

**Best for:** Global state that persists across components

```typescript
// composables/useAppState.ts
export const useAppState = () => {
  // Global app state
  const isChristmasMode = useState('christmas-mode', () => false);
  const selectedModel = useState('selected-model', () => null);
  const comparisonModels = useState('comparison-models', () => []);

  const toggleChristmasMode = () => {
    isChristmasMode.value = !isChristmasMode.value;
    // Apply theme changes
    if (process.client) {
      document.documentElement.classList.toggle('christmas-theme', isChristmasMode.value);
    }
  };

  return {
    isChristmasMode,
    selectedModel,
    comparisonModels,
    toggleChristmasMode,
  };
};
```

#### 6. `useCookie` - SSR-Friendly Cookies

**Best for:** User preferences, theme settings

```typescript
// composables/useThemePreferences.ts
export const useThemePreferences = () => {
  const theme = useCookie('app-theme', {
    default: () => 'normal',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });

  const christmasMode = useCookie('christmas-mode', {
    default: () => false,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  const toggleTheme = (newTheme: 'normal' | 'christmas') => {
    theme.value = newTheme;
    christmasMode.value = newTheme === 'christmas';
  };

  return { theme, christmasMode, toggleTheme };
};
```

---

### Runtime & Configuration Composables

#### 7. `useRuntimeConfig` - Access Configuration

**Best for:** API URLs, environment variables

```typescript
// composables/useAppConfig.ts (enhance existing)
export const useAppConfig = () => {
  const config = useRuntimeConfig();

  return {
    apiBase: config.public.apiBase,
    isPythonApiDisabled: config.public.pyApiDisabled,
    // Add more config access
    isDev: process.dev,
    isProd: process.prod,
  };
};
```

#### 8. `useRequestHeaders` - Access Request Headers

**Best for:** Server-side API calls with headers

```typescript
// composables/useServerApi.ts
export const useServerApi = () => {
  const headers = useRequestHeaders(['cookie', 'authorization']);

  const fetchWithAuth = async (url: string) => {
    return await $fetch(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
  };

  return { fetchWithAuth };
};
```

---

### Navigation & Routing Composables

#### 9. `useRoute` & `useRouter` - Navigation

**Best for:** Route-based data fetching

```typescript
// composables/useRouteData.ts
export const useRouteData = () => {
  const route = useRoute();
  const router = useRouter();

  // Fetch data based on route params
  const { data: modelData } = await useFetch(() => `/api/dataset/model/${route.params.name}`, {
    key: `model-${route.params.name}`,
    watch: [() => route.params.name], // Refetch on param change
  });

  const navigateToModel = (modelName: string) => {
    router.push(`/model/${modelName}`);
  };

  return { modelData, navigateToModel };
};
```

---

### Head & SEO Composables

#### 10. `useHead` - Dynamic Head Management

**Best for:** Page-specific meta tags, titles

```typescript
// composables/usePageMeta.ts
export const usePageMeta = (title: string, description?: string) => {
  useHead({
    title: `${title} - MATLAB Deep Learning`,
    meta: [
      { name: 'description', content: description || '' },
      { property: 'og:title', content: title },
    ],
  });
};
```

---

## 🎄 Christmas Theme Composables (Nuxt 4)

### 11. `useChristmasTheme` - Theme Management

```typescript
// composables/useChristmasTheme.ts
export const useChristmasTheme = () => {
  const isActive = useCookie('christmas-theme', {
    default: () => false,
    maxAge: 60 * 60 * 24 * 30,
  });

  const theme = computed(() => ({
    colors: {
      primary: isActive.value ? '#059669' : '#9333ea', // Green for Christmas
      secondary: isActive.value ? '#dc2626' : '#2563eb', // Red for Christmas
      accent: isActive.value ? '#fbbf24' : '#f59e0b', // Gold for Christmas
    },
    isActive: isActive.value,
  }));

  const toggle = () => {
    isActive.value = !isActive.value;

    if (process.client) {
      document.documentElement.classList.toggle('christmas-theme', isActive.value);

      // Trigger theme change event
      window.dispatchEvent(
        new CustomEvent('theme-changed', {
          detail: { isChristmas: isActive.value },
        })
      );
    }
  };

  // Auto-enable during December
  if (process.client) {
    const month = new Date().getMonth();
    if (month === 11 && !isActive.value) {
      // December
      isActive.value = true;
    }
  }

  return { theme, isActive, toggle };
};
```

### 12. `useChristmasAnimations` - Festive Animations

```typescript
// composables/useChristmasAnimations.ts
export const useChristmasAnimations = () => {
  const showSnowflakes = useState('snowflakes', () => false);
  const showTwinkles = useState('twinkles', () => false);

  const enableSnowflakes = () => {
    if (process.client) {
      showSnowflakes.value = true;
      // Add snowflake animation logic
    }
  };

  const enableTwinkles = () => {
    if (process.client) {
      showTwinkles.value = true;
    }
  };

  return { showSnowflakes, showTwinkles, enableSnowflakes, enableTwinkles };
};
```

---

## 🔌 Nuxt 4 Plugins

### 1. Analytics Plugin

```typescript
// plugins/analytics.client.ts
export default defineNuxtPlugin({
  name: 'analytics',
  setup(nuxtApp) {
    // Initialize analytics
    if (process.client) {
      // Google Analytics, Plausible, etc.
      console.log('Analytics initialized');
    }
  },
});
```

### 2. Christmas Theme Plugin

```typescript
// plugins/christmas-theme.client.ts
export default defineNuxtPlugin({
  name: 'christmas-theme',
  setup(nuxtApp) {
    const christmasMode = useCookie('christmas-theme', {
      default: () => false,
    });

    if (process.client && christmasMode.value) {
      document.documentElement.classList.add('christmas-theme');

      // Add snowflake animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes snowfall {
          to { transform: translateY(100vh) rotate(360deg); }
        }
        .snowflake {
          position: fixed;
          animation: snowfall linear infinite;
        }
      `;
      document.head.appendChild(style);
    }
  },
});
```

### 3. Error Handler Plugin

```typescript
// plugins/error-handler.client.ts
export default defineNuxtPlugin({
  name: 'error-handler',
  setup(nuxtApp) {
    nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
      // Log to Sentry
      const logger = useSentryLogger();
      logger.logError('Vue Error', error, {
        component: instance?.$options.name,
        info,
      });
    };

    // Global error handler
    if (process.client) {
      window.addEventListener('error', (event) => {
        const logger = useSentryLogger();
        logger.logError('Global Error', event.error);
      });
    }
  },
});
```

### 4. Performance Monitoring Plugin

```typescript
// plugins/performance.client.ts
export default defineNuxtPlugin({
  name: 'performance',
  parallel: true, // Don't block other plugins
  setup(nuxtApp) {
    if (process.client) {
      // Track Web Vitals
      const metrics = useSentryMetrics();

      // Track page load
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (perfData) {
          metrics.distribution('page_load_time', perfData.loadEventEnd - perfData.fetchStart, {
            unit: 'millisecond',
          });
        }
      });
    }
  },
});
```

---

## 📊 Specific Composables for Your App

### Dataset Management

#### `useDatasetSearch.ts`

```typescript
export const useDatasetSearch = () => {
  const searchQuery = ref('');
  const filters = ref({
    brand: '',
    priceRange: [0, 5000],
    yearRange: [2020, 2025],
  });

  const { data, pending, refresh } = await useFetch('/api/dataset/search', {
    method: 'POST',
    body: computed(() => ({
      query: searchQuery.value,
      filters: filters.value,
    })),
    watch: [searchQuery, filters], // Auto-refetch on change
    key: 'dataset-search',
  });

  return { results: data, isLoading: pending, searchQuery, filters, refresh };
};
```

#### `useModelComparison.ts`

```typescript
export const useModelComparison = () => {
  const modelsToCompare = useState('comparison-models', () => []);

  const { data, pending } = await useFetch('/api/dataset/compare', {
    method: 'POST',
    body: computed(() => ({ models: modelsToCompare.value })),
    watch: [modelsToCompare],
    key: 'model-comparison',
    lazy: true,
  });

  const addModel = (model: any) => {
    if (modelsToCompare.value.length < 3) {
      modelsToCompare.value.push(model);
    }
  };

  const removeModel = (index: number) => {
    modelsToCompare.value.splice(index, 1);
  };

  return { comparison: data, isLoading: pending, addModel, removeModel };
};
```

#### `usePredictionHistory.ts` (Enhance existing)

```typescript
export const usePredictionHistory = () => {
  const history = useState('prediction-history', () => []);

  // Save to localStorage
  const savePrediction = (prediction: any) => {
    history.value.push({
      ...prediction,
      timestamp: new Date().toISOString(),
    });

    if (process.client) {
      localStorage.setItem('prediction-history', JSON.stringify(history.value));
    }
  };

  // Load from localStorage
  if (process.client) {
    const stored = localStorage.getItem('prediction-history');
    if (stored) {
      history.value = JSON.parse(stored);
    }
  }

  return { history, savePrediction };
};
```

---

## 🎨 Christmas UI Composables

#### `useChristmasColors.ts`

```typescript
export const useChristmasColors = () => {
  const colors = computed(() => ({
    primary: '#059669', // Deep green
    secondary: '#dc2626', // Crimson red
    accent: '#fbbf24', // Gold
    background: '#fefefe',
    text: '#1f2937',
  }));

  const getCardVariant = (index: number) => {
    const variants = ['green', 'red', 'gold'];
    return variants[index % 3];
  };

  return { colors, getCardVariant };
};
```

#### `useChristmasDecorations.ts`

```typescript
export const useChristmasDecorations = () => {
  const decorations = useState('christmas-decorations', () => ({
    snowflakes: false,
    twinkles: false,
    ornaments: true,
  }));

  const toggleDecoration = (type: keyof typeof decorations.value) => {
    decorations.value[type] = !decorations.value[type];
  };

  return { decorations, toggleDecoration };
};
```

---

## 🔧 Utility Composables

#### `useDebounce.ts`

```typescript
export const useDebounce = <T>(value: Ref<T>, delay = 500) => {
  const debounced = ref(value.value) as Ref<T>;

  let timeout: ReturnType<typeof setTimeout>;

  watch(value, (newValue) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debounced.value = newValue;
    }, delay);
  });

  return debounced;
};
```

#### `useLocalStorage.ts`

```typescript
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const stored = useState<T>(`local-${key}`, () => {
    if (process.client) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    return defaultValue;
  });

  watch(
    stored,
    (newValue) => {
      if (process.client) {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    },
    { deep: true }
  );

  return stored;
};
```

---

## 📝 Implementation Checklist

### High Priority

- [ ] Create `useDatasetSearch` with `useFetch`
- [ ] Create `useModelComparison` with reactive state
- [ ] Create `useChristmasTheme` with `useCookie`
- [ ] Enhance `usePredictionHistory` with localStorage

### Medium Priority

- [ ] Create `useDatasetFilters` with `useLazyFetch`
- [ ] Create `useChartConfig` for ApexCharts
- [ ] Create `useChristmasAnimations`
- [ ] Add error handler plugin

### Low Priority

- [ ] Create `usePerformanceMonitoring` plugin
- [ ] Create `useDataExport` composable
- [ ] Create `useRealTimeUpdates` with WebSocket

---

## 🎯 Usage Examples

### In a Page Component

```vue
<script setup lang="ts">
// Auto-imported composables
const { statistics, isLoading } = useDatasetStatistics();
const { theme, toggle } = useChristmasTheme();
const { results, searchQuery, filters } = useDatasetSearch();

// Set page meta
usePageMeta('Analytics Dashboard', 'View comprehensive mobile dataset analytics');
</script>

<template>
  <div :class="{ 'christmas-theme': theme.isActive }">
    <UCard v-if="!isLoading">
      <template #header>
        <h2>Dataset Statistics</h2>
      </template>
      <div>Total Models: {{ statistics?.totalRecords }}</div>
    </UCard>
  </div>
</template>
```

---

## 🔗 Nuxt 4 Resources

- [Nuxt 4 Composables API](https://nuxt.com/docs/4.x/api/composables)
- [Nuxt 4 Data Fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching)
- [Nuxt 4 Plugins](https://nuxt.com/docs/4.x/directory-structure/app/plugins)
