/**
 * Setup Vue globals for Vitest tests
 * Ensures Vue reactivity functions are available globally
 */
import { ref, computed, readonly, reactive, watch, onMounted, onUnmounted } from 'vue';

// Make Vue reactivity functions available globally for auto-imports
(globalThis as any).ref = ref;
(globalThis as any).computed = computed;
(globalThis as any).readonly = readonly;
(globalThis as any).reactive = reactive;
(globalThis as any).watch = watch;
(globalThis as any).onMounted = onMounted;
(globalThis as any).onUnmounted = onUnmounted;

// Mock import.meta.client for client-side code
// Note: import.meta is a special object that may not be easily modifiable
// We try to set it, but it may not work in all cases
try {
  Object.defineProperty(import.meta, 'client', {
    value: true,
    writable: true,
    configurable: true,
  });
} catch (_e) {
  // If we can't modify import.meta.client, that's okay
  // Some tests may need to handle this differently
}
