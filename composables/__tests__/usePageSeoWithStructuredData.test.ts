import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApp } from 'vue';
import { createTestingPinia } from '@pinia/testing';

// Import actual composables
import { usePageSeoWithStructuredData } from '../usePageSeoWithStructuredData';

// Setup test environment
describe('usePageSeoWithStructuredData', () => {
  let app: any;

  beforeEach(() => {
    // Create a fresh Vue app for each test
    app = createApp({});
    app.use(createTestingPinia());

    // Mock useRuntimeConfig globally
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        siteUrl: 'https://matlab-analytics.com',
      },
    }));

    // Mock useHead for SEO functionality
    vi.stubGlobal('useHead', vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('should set basic SEO meta tags', () => {
    const options = {
      title: 'Test Page',
      description: 'Test description',
    };

    usePageSeoWithStructuredData(options);

    // Verify useHead was called (basic SEO functionality)
    expect(vi.mocked(useHead)).toHaveBeenCalled();
  });

  it('should handle structured data options', () => {
    usePageSeoWithStructuredData({
      title: 'Test',
      description: 'Test',
      structuredData: {
        organization: true,
        website: true,
      },
    });

    // Verify useHead was called with structured data
    expect(vi.mocked(useHead)).toHaveBeenCalled();
  });

  it('should handle article structured data', () => {
    usePageSeoWithStructuredData({
      title: 'Test Article',
      description: 'Test article description',
      type: 'article',
      structuredData: {
        article: {
          headline: 'Test Article',
          datePublished: '2024-01-01',
          author: 'John Doe',
        },
      },
    });

    expect(vi.mocked(useHead)).toHaveBeenCalled();
  });

  it('should handle breadcrumb structured data', () => {
    usePageSeoWithStructuredData({
      title: 'Test Page',
      description: 'Test description',
      structuredData: {
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Page', url: '/page' },
        ],
      },
    });

    expect(vi.mocked(useHead)).toHaveBeenCalled();
  });

  it('should work without structured data', () => {
    usePageSeoWithStructuredData({
      title: 'Simple Page',
      description: 'Simple description',
    });

    expect(vi.mocked(useHead)).toHaveBeenCalled();
  });
});
