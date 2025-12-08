import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLazyComponent } from '../useLazyComponent';

// Mock Vue
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    defineAsyncComponent: vi.fn((options) => options),
  };
});

describe('useLazyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return lazyLoad function', () => {
    const lazy = useLazyComponent();

    expect(lazy).toHaveProperty('lazyLoad');
    expect(typeof lazy.lazyLoad).toBe('function');
  });

  it('should return pre-configured components', () => {
    const lazy = useLazyComponent();

    expect(lazy).toHaveProperty('AnalyticsAccuracyChart');
    expect(lazy).toHaveProperty('AnalyticsTopBrandsChart');
    expect(lazy).toHaveProperty('UserPreferencesDialog');
  });

  it('should create lazy component with default options', () => {
    const lazy = useLazyComponent();
    const importFn = vi.fn(() => Promise.resolve({ default: {} }));

    const component = lazy.lazyLoad(importFn);

    expect(component).toBeDefined();
  });

  it('should create lazy component with custom options', () => {
    const lazy = useLazyComponent();
    const importFn = vi.fn(() => Promise.resolve({ default: {} }));
    const loadingComponent = {};
    const errorComponent = {};

    const component = lazy.lazyLoad(importFn, {
      loadingComponent,
      errorComponent,
      delay: 300,
      timeout: 60000,
    });

    expect(component).toBeDefined();
  });
});
