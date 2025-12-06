# Composables Reference

> **Total Composables**: 13
> **Auto-Import**: Yes (Nuxt 4 auto-imports composables)

## Composable Overview

All composables are located in `composables/` and are automatically imported by Nuxt 4.

---

## User Preferences Composables

### `useUserPreferences()`

**File**: `composables/useUserPreferences.ts`

**Purpose**: Manage user preferences (theme, animations, etc.)

**Returns:**

```typescript
{
  preferences: Readonly<Ref<UserPreferences>>  // Reactive preferences
  updatePreference: (key, value) => void       // Update preference
  resetPreferences: () => void                 // Reset to defaults
  loadPreferences: () => void                  // Load from localStorage
  savePreferences: () => void                  // Save to localStorage
  getPreference: (key) => value                // Get preference value
  hasUnsavedChanges: ComputedRef<boolean>      // Check for changes
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  animations: boolean
  compactMode: boolean
  autoRefresh: boolean
  language: string
}
```

**Features:**

- Persists to localStorage
- Applies theme immediately
- Watches system theme changes
- Handles SSR safely

**Usage:**

```vue
<script setup lang="ts">
const { preferences, updatePreference } = useUserPreferences();

// Update theme
updatePreference('theme', 'dark');

// Access preference
const theme = preferences.value.theme;
</script>
```

**Storage Key**: `'mobile-finder-preferences'`

---

## API Configuration Composables

### `useApiConfig()`

**File**: `composables/useApiConfig.ts`

**Purpose**: Get Python API configuration dynamically

**Returns:**

```typescript
{
  pythonApiUrl: string; // Python API base URL
  isPythonApiDisabled: boolean; // Whether API is disabled
}
```

**Features:**

- Detects API URL from environment or browser location
- Handles cloud platform deployments
- Fallback to localhost:8000

**Usage:**

```vue
<script setup lang="ts">
const { pythonApiUrl, isPythonApiDisabled } = useApiConfig();

if (!isPythonApiDisabled) {
  const response = await $fetch(`${pythonApiUrl}/api/predict/price`, {
    method: 'POST',
    body: data,
  });
}
</script>
```

**Priority:**

1. `NUXT_PUBLIC_API_BASE` environment variable
2. Current browser hostname + port 8000
3. Fallback to `localhost:8000`

---

### `useApiStatus()`

**File**: `composables/useApiStatus.ts`

**Purpose**: Monitor Python API health with exponential backoff

**Returns:**

```typescript
{
  status: Ref<'healthy' | 'unhealthy' | 'checking' | 'unknown'>;
  lastCheck: Ref<Date | null>;
  checkHealth: () => Promise<void>;
  isHealthy: ComputedRef<boolean>;
}
```

**Features:**

- Exponential backoff on failures
- Automatic health checking
- Status caching
- Error handling

**Usage:**

```vue
<script setup lang="ts">
const { status, isHealthy, checkHealth } = useApiStatus();

onMounted(async () => {
  await checkHealth();
});

watch(isHealthy, (healthy) => {
  if (!healthy) {
    console.warn('API is unhealthy');
  }
});
</script>
```

---

## Logging Composables

### `useSentryLogger()`

**File**: `composables/useSentryLogger.ts`

**Purpose**: Centralized error and event logging with Sentry

**Returns:**

```typescript
{
  logError: (message, error, context?) => void
  logUserAction: (action, context?) => void
  warn: (message, context?) => void
  debug: (message, context?) => void
}
```

**Usage:**

```vue
<script setup lang="ts">
const logger = useSentryLogger();

try {
  await apiCall();
} catch (error) {
  logger.logError('API call failed', error, {
    component: 'MyComponent',
    action: 'fetchData',
  });
}

// Log user actions
logger.logUserAction('Button clicked', {
  button: 'submit',
  page: 'search',
});
</script>
```

**Features:**

- Sentry integration
- Contextual logging
- Error tracking
- User action tracking

---

### `useSentryMetrics()`

**File**: `composables/useSentryMetrics.ts`

**Purpose**: Track custom metrics with Sentry

**Usage:**

```vue
<script setup lang="ts">
const metrics = useSentryMetrics();

metrics.track('prediction_made', {
  model: 'price',
  duration: 150,
});
</script>
```

---

### `useSentryUtils()`

**File**: `composables/useSentryUtils.ts`

**Purpose**: Sentry utility functions

**Usage:**

```vue
<script setup lang="ts">
const sentryUtils = useSentryUtils();
// Utility functions for Sentry
</script>
```

---

## Prediction Composables

### `usePredictionHistory()`

**File**: `composables/usePredictionHistory.ts`

**Purpose**: Helper functions for prediction history

**Returns:**

```typescript
{
  addToHistory: (prediction) => void
  getHistory: () => PredictionHistoryItem[]
  clearHistory: () => void
  getHistoryByModel: (model) => PredictionHistoryItem[]
}
```

**Usage:**

```vue
<script setup lang="ts">
const { addToHistory, getHistory } = usePredictionHistory();

// Add prediction
addToHistory({
  model: 'price',
  input: { ram: 8 },
  result: 699.99,
});

// Get history
const history = getHistory();
</script>
```

**Note**: Works with `predictionHistoryStore`

---

### `usePredictionValidation()`

**File**: `composables/usePredictionValidation.ts`

**Purpose**: Validate prediction inputs

**Returns:**

```typescript
{
  validatePriceInput: (input) => ValidationResult;
  validateRamInput: (input) => ValidationResult;
  validateBatteryInput: (input) => ValidationResult;
  validateBrandInput: (input) => ValidationResult;
}
```

**Usage:**

```vue
<script setup lang="ts">
const { validatePriceInput } = usePredictionValidation();

const result = validatePriceInput({
  ram: 8,
  battery: 4000,
});

if (!result.valid) {
  console.error(result.errors);
}
</script>
```

---

## UI & UX Composables

### `useAccessibility()`

**File**: `composables/useAccessibility.ts`

**Purpose**: Accessibility utilities

**Returns:**

```typescript
{
  // Accessibility helper functions
}
```

**Usage:**

```vue
<script setup lang="ts">
const a11y = useAccessibility();
// Use accessibility helpers
</script>
```

---

### `useKeyboardShortcuts()`

**File**: `composables/useKeyboardShortcuts.ts`

**Purpose**: Keyboard shortcuts handler

**Usage:**

```vue
<script setup lang="ts">
// Auto-initialized in layout
useKeyboardShortcuts();
</script>
```

**Location**: Used in `layouts/default.vue`

---

### `useResponsive()`

**File**: `composables/useResponsive.ts`

**Purpose**: Responsive utilities and breakpoints

**Returns:**

```typescript
{
  isMobile: ComputedRef<boolean>;
  isTablet: ComputedRef<boolean>;
  isDesktop: ComputedRef<boolean>;
  breakpoint: ComputedRef<string>;
}
```

**Usage:**

```vue
<script setup lang="ts">
const { isMobile, isDesktop } = useResponsive();

if (isMobile.value) {
  // Mobile-specific logic
}
</script>
```

---

### `useMobileImage()`

**File**: `composables/useMobileImage.ts`

**Purpose**: Mobile image optimization utilities

**Returns:**

```typescript
{
  getOptimizedImageUrl: (src) => string;
  getImageSrcSet: (src) => string;
  // Image optimization helpers
}
```

**Usage:**

```vue
<script setup lang="ts">
const { getOptimizedImageUrl } = useMobileImage();

const optimizedUrl = getOptimizedImageUrl('phone.jpg');
</script>
```

---

## Utility Composables

### `useMetricsExamples()`

**File**: `composables/useMetricsExamples.ts`

**Purpose**: Example metrics data for demos

**Returns:**

```typescript
{
  getExampleMetrics: () => MetricsData;
  // Example data generators
}
```

**Usage:**

```vue
<script setup lang="ts">
const { getExampleMetrics } = useMetricsExamples();

const exampleData = getExampleMetrics();
</script>
```

---

## Composable Patterns

### Standard Composable Structure

```typescript
export function useMyComposable() {
  // State
  const state = ref(initialValue);

  // Computed
  const computed = computed(() => {
    return state.value * 2;
  });

  // Methods
  const method = () => {
    // Logic
  };

  // Lifecycle
  onMounted(() => {
    // Initialization
  });

  // Return
  return {
    state: readonly(state),
    computed,
    method,
  };
}
```

### SSR Safety

**✅ Correct (SSR Safe):**

```typescript
export function useMyComposable() {
  if (!import.meta.client)
    return {
      /* server-safe defaults */
    };

  // Client-only code
  const value = localStorage.getItem('key');
  return { value };
}
```

**❌ Incorrect (SSR Unsafe):**

```typescript
export function useMyComposable() {
  // This will error on server!
  const value = localStorage.getItem('key');
  return { value };
}
```

---

## Composable Usage Statistics

### Currently Used

- **`useKeyboardShortcuts`** - Used in `layouts/default.vue` ✅

### Available but Unused

- All other composables (12 composables) - Available but not integrated

### Integration Recommendations

1. **`useApiConfig`** → Use in all pages making API calls
2. **`useSentryLogger`** → Use for error logging in all pages
3. **`useUserPreferences`** → Use in pages with user settings
4. **`usePredictionHistory`** → Use in prediction pages
5. **`useApiStatus`** → Use in pages that depend on API
6. **`useResponsive`** → Use for responsive behavior
7. **`useMobileImage`** → Use in pages with images

---

## Composable Best Practices

### ✅ DO:

- Return reactive refs for state
- Use `readonly()` for returned state
- Handle SSR safely with `import.meta.client`
- Use TypeScript for type safety
- Document return types
- Handle errors gracefully

### ❌ DON'T:

- Don't access browser APIs without SSR checks
- Don't mutate returned state directly (use methods)
- Don't forget to cleanup watchers/listeners
- Don't use composables in server-only code

---

## Composable Dependencies

### External Dependencies

- **Vue** - Reactivity system
- **Sentry** - Error tracking (some composables)
- **Nuxt Runtime Config** - Configuration access

### Internal Dependencies

- **Stores** - Some composables use stores
- **API** - Some composables make API calls

---

## Composable Testing

### Unit Testing

Composables can be tested with Vitest:

```typescript
import { useApiConfig } from '@/composables/useApiConfig';

test('useApiConfig returns correct URL', () => {
  const { pythonApiUrl } = useApiConfig();
  expect(pythonApiUrl).toBeDefined();
});
```

---

## Future Composable Ideas

1. **`usePagination`** - Pagination logic
2. **`useSearch`** - Search functionality
3. **`useDebounce`** - Debounce utilities
4. **`useLocalStorage`** - localStorage wrapper
5. **`useWebSocket`** - WebSocket connection
6. **`useForm`** - Form handling
7. **`useAuth`** - Authentication (if added)
