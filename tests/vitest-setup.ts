import { vi, expect } from 'vitest'

// Mock $fetch globally for tests
const mockFetch = vi.fn()
;(globalThis as any).$fetch = mockFetch

// Mock Nuxt composables if needed
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $fetch: mockFetch,
  }),
}))

// Extend expect with custom matchers if needed
// expect.extend({ ... })
