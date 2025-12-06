# Pinia Stores Reference

> **Total Stores**: 6
> **Auto-Import**: Yes (Nuxt 4 auto-imports stores)

## Store Overview

All stores use **Pinia** with **Composition API** style (setup stores).

---

## Store: `abTestingStore`

**File**: `stores/abTestingStore.ts`
**Store ID**: `'abTesting'`

### Purpose

Manage A/B test configurations, execution, and results for ML model comparison.

### State

```typescript
interface State {
  currentTest: ABTestConfig | null; // Current test configuration
  testResult: ABTestResult | null; // Latest test result
  isRunningTest: boolean; // Test execution status
  testHistory: ABTestResult[]; // Test history (max 10)
  availableModels: string[]; // Available models for testing
}
```

### Getters

```typescript
testTypes: ComputedRef<Array<{ value: string; label: string }>>;
// Available test types: accuracy, performance, robustness

confidenceLevels: ComputedRef<Array<{ value: number; label: string }>>;
// Confidence levels: 90%, 95%, 99%

isTestReady: ComputedRef<boolean>;
// Check if test can be executed

recentTests: ComputedRef<ABTestResult[]>;
// Last 5 test results
```

### Actions

```typescript
// Initialize store and fetch available models
await initialize()

// Fetch available models from API
await fetchAvailableModels()

// Create new test configuration
createTest(config: Partial<ABTestConfig>)

// Load example test configuration
loadExampleTest()

// Run A/B test (with API fallback)
await runABTest(testRequest?: ABTestRequest): Promise<ABTestResult | null>

// Reset current test
resetTest()

// Clear test history
clearHistory()
```

### Usage Example

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';

const abTestingStore = useABTestingStore();

// Reactive state
const { currentTest, testResult, isRunningTest, isTestReady } = storeToRefs(abTestingStore);

// Actions
const { runABTest, createTest, initialize } = abTestingStore;

onMounted(async () => {
  await initialize();
});

const handleRunTest = async () => {
  if (isTestReady.value) {
    await runABTest();
  }
};
</script>
```

### API Integration

- **Endpoint**: `/api/advanced/compare`
- **Fallback**: Calculated result if API unavailable
- **Error Handling**: Uses `useSentryLogger` for errors

---

## Store: `predictionHistoryStore`

**File**: `stores/predictionHistoryStore.ts`
**Store ID**: `'predictionHistory'`

### Purpose

Store and persist prediction history in localStorage.

### State

```typescript
interface State {
  history: PredictionHistoryItem[]; // Prediction history (max 50)
}

interface PredictionHistoryItem {
  id: string;
  model: 'price' | 'brand' | 'ram' | 'battery';
  input: Record<string, any>;
  result: number | string;
  timestamp: number;
  predictionTime: number;
  source: 'api' | 'fallback';
  error?: string;
}
```

### Getters

```typescript
getAllHistory(): PredictionHistoryItem[]
// Get all history items

getHistoryByModel(model: string): PredictionHistoryItem[]
// Filter history by model type
```

### Actions

```typescript
// Load history from localStorage
loadHistory()

// Save new prediction
savePrediction(item: Omit<PredictionHistoryItem, 'id' | 'timestamp'>)

// Clear all history
clearHistory()
```

### Persistence

- **Storage**: localStorage
- **Key**: `'mobile-prediction-history'`
- **Max Items**: 50 (oldest removed automatically)

### Usage Example

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';

const predictionStore = usePredictionHistoryStore();
const { history } = storeToRefs(predictionStore);

// Save prediction
predictionStore.savePrediction({
  model: 'price',
  input: { ram: 8, battery: 4000 },
  result: 699.99,
  predictionTime: 150,
  source: 'api',
});

// Load on mount
onMounted(() => {
  predictionStore.loadHistory();
});
</script>
```

---

## Store: `userPreferencesStore`

**File**: `stores/userPreferencesStore.ts`
**Store ID**: `'userPreferences'`

### Purpose

Manage user preferences and settings.

### State

User preference settings (theme, animations, etc.)

### Actions

Preference management methods

### Usage

Works with `useUserPreferences` composable.

---

## Store: `advancedModelsStore`

**File**: `stores/advancedModelsStore.ts`
**Store ID**: `'advancedModels'`

### Purpose

Manage advanced ML model state and training metrics.

### State

- Model configurations
- Training metrics
- Model performance data

### Actions

- Model management
- Training metrics updates
- Model comparison

### Usage Example

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';

const advancedStore = useAdvancedModelsStore();
const { trainingMetrics } = storeToRefs(advancedStore);

// Update metrics
advancedStore.updateTrainingMetrics({
  currentEpoch: 127,
  totalEpochs: 200,
  currentLoss: 0.234,
  currentAccuracy: 94.7,
});
</script>
```

---

## Store: `apiStore`

**File**: `stores/apiStore.ts`
**Store ID**: `'api'`

### Purpose

Track Python API health status and availability.

### State

- API status (healthy/unhealthy)
- Health check state
- Last check timestamp

### Actions

```typescript
// Check API health status
checkApiStatus();
```

### Usage Example

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';

const apiStore = useApiStore();
const { apiStatus } = storeToRefs(apiStore);

onMounted(() => {
  apiStore.checkApiStatus();
});
</script>
```

---

## Store: `predictionValidationStore`

**File**: `stores/predictionValidationStore.ts`
**Store ID**: `'predictionValidation'`

### Purpose

Validate prediction inputs before API calls.

### State

- Validation rules
- Error messages
- Validation state

### Actions

- Input validation methods
- Error management

### Usage

Used by prediction forms to validate inputs.

---

## Store Initialization

### Plugin: `plugins/pinia-init.ts`

**Purpose**: Initialize all stores on app startup

**Features:**

- Loads persisted state from localStorage
- Sets up store watchers
- Initializes store dependencies

**Code:**

```typescript
export default defineNuxtPlugin({
  setup() {
    // Stores are auto-initialized by Pinia
    // This plugin can add custom initialization logic
  },
});
```

---

## Store Patterns

### Reactive State Access

**✅ Correct (Reactive):**

```typescript
import { storeToRefs } from 'pinia';

const store = useABTestingStore();
const { currentTest, testResult } = storeToRefs(store);
// These are reactive refs
```

**❌ Incorrect (Not Reactive):**

```typescript
const store = useABTestingStore();
const { currentTest, testResult } = store;
// These are NOT reactive (direct destructuring loses reactivity)
```

### Actions Access

**✅ Correct:**

```typescript
const store = useABTestingStore();
const { runABTest, createTest } = store;
// Actions can be destructured directly (they're not reactive)
```

### Store Usage in Components

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';

// Auto-imported store
const abTestingStore = useABTestingStore();

// Reactive state
const { currentTest, isRunningTest } = storeToRefs(abTestingStore);

// Actions
const { runABTest } = abTestingStore;

// Use in template
</script>

<template>
  <div v-if="currentTest">
    {{ currentTest.name }}
  </div>
  <UButton @click="runABTest" :loading="isRunningTest"> Run Test </UButton>
</template>
```

---

## Store Persistence

### Persisted Stores

**Plugin**: `pinia-plugin-persistedstate`

**Stores with Persistence:**

- `predictionHistoryStore` - localStorage
- `userPreferencesStore` - localStorage (likely)

### Persistence Configuration

Stores can be configured for persistence in their definition:

```typescript
export const useMyStore = defineStore('myStore', {
  persist: {
    storage: persistedState.localStorage,
    paths: ['stateToPersist'],
  },
});
```

---

## Store Best Practices

### ✅ DO:

- Use `storeToRefs()` for reactive state
- Destructure actions directly
- Initialize stores in `onMounted()`
- Use TypeScript interfaces for state
- Handle errors with `useSentryLogger`
- Use computed getters for derived state

### ❌ DON'T:

- Don't destructure state directly (loses reactivity)
- Don't mutate state outside actions
- Don't call actions in store getters
- Don't use stores in server-side code (SSR)

---

## Store Testing

### Unit Testing

Stores can be tested with Vitest:

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useABTestingStore } from '@/stores/abTestingStore';

test('store initializes correctly', () => {
  setActivePinia(createPinia());
  const store = useABTestingStore();
  expect(store.currentTest).toBeNull();
});
```

---

## Store Integration Status

### Currently Used

- **None** - Stores exist but not integrated into pages

### Integration Opportunities

1. **`abTestingStore`** → `pages/ab-testing.vue`
2. **`predictionHistoryStore`** → `pages/ai-demo.vue`
3. **`userPreferencesStore`** → `pages/recommendations.vue`
4. **`advancedModelsStore`** → `pages/advanced.vue`
5. **`apiStore`** → Any page making API calls
6. **`predictionValidationStore`** → Prediction forms

---

## Store Dependencies

### External Dependencies

- **Pinia** - State management core
- **Vue** - Reactivity system

### Internal Dependencies

- **Composables** - `useSentryLogger` for error logging
- **API** - Store actions call API endpoints

---

## Future Store Enhancements

1. **Caching**: Add response caching to stores
2. **Optimistic Updates**: Update UI before API response
3. **Offline Support**: Queue actions when offline
4. **Store Devtools**: Enhanced Pinia devtools integration
5. **Store Testing**: Expand unit test coverage
