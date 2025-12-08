/**
 * Test utilities and helpers for Vitest
 */

import { vi } from 'vitest';

/**
 * Mock Nuxt runtime config
 */
export const mockRuntimeConfig = (overrides = {}) => {
  return {
    public: {
      apiBase: 'http://localhost:8000',
      pyApiDisabled: false,
      ...overrides,
    },
  };
};

/**
 * Mock $fetch for API calls
 */
export const mockFetch = (response: any, shouldReject = false) => {
  if (shouldReject) {
    return vi.fn().mockRejectedValue(response);
  }
  return vi.fn().mockResolvedValue(response);
};

/**
 * Wait for next tick
 */
export const waitForNextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Create mock store
 */
export const createMockStore = (overrides = {}) => {
  return {
    state: {},
    getters: {},
    actions: {},
    ...overrides,
  };
};

/**
 * Mock Pinia store
 */
export const mockPiniaStore = (storeName: string, state = {}, actions = {}) => {
  return {
    [`use${storeName}Store`]: () => ({
      ...state,
      ...actions,
    }),
  };
};
