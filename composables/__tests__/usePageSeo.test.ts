import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Nuxt composables before importing
const mockUseSeoMeta = vi.fn();
const mockUseHead = vi.fn();
const mockUseRoute = vi.fn(() => ({
  path: '/test-page',
}));
const mockUseRuntimeConfig = vi.fn(() => ({
  public: {
    siteUrl: 'https://matlab-analytics.com',
  },
}));

// Mock #app module
vi.mock('#app', () => ({
  useRuntimeConfig: () => mockUseRuntimeConfig(),
  useSeoMeta: (...args: any[]) => mockUseSeoMeta(...args),
  useHead: (...args: any[]) => mockUseHead(...args),
}));

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => mockUseRoute(),
}));

// Stub globals for auto-imported composables
vi.stubGlobal('useRuntimeConfig', () => mockUseRuntimeConfig());
vi.stubGlobal('useRoute', () => mockUseRoute());
vi.stubGlobal('useSeoMeta', (...args: any[]) => mockUseSeoMeta(...args));
vi.stubGlobal('useHead', (...args: any[]) => mockUseHead(...args));

// Import after mocks
import { usePageSeo } from '../usePageSeo';

describe('usePageSeo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRoute.mockReturnValue({ path: '/test-page' });
    mockUseRuntimeConfig.mockReturnValue({
      public: {
        siteUrl: 'https://matlab-analytics.com',
      },
    });
  });

  it('should set SEO meta tags with basic options', () => {
    const result = usePageSeo({
      title: 'Test Page',
      description: 'Test description',
    });

    expect(mockUseSeoMeta).toHaveBeenCalled();
    expect(mockUseHead).toHaveBeenCalled();
    expect(result.title).toBe('Test Page - MATLAB Analytics');
    expect(result.description).toBe('Test description');
  });

  it('should not add site name if title already contains it', () => {
    const result = usePageSeo({
      title: 'Test Page - MATLAB Analytics',
      description: 'Test description',
    });

    expect(result.title).toBe('Test Page - MATLAB Analytics');
  });

  it('should construct full URL from route path', () => {
    mockUseRoute.mockReturnValue({ path: '/products' });

    const result = usePageSeo({
      title: 'Products',
      description: 'Product page',
    });

    expect(result.url).toBe('https://matlab-analytics.com/products');
  });

  it('should use provided URL if given', () => {
    const result = usePageSeo({
      title: 'Test',
      description: 'Test',
      url: 'https://example.com/custom',
    });

    expect(result.url).toBe('https://example.com/custom');
  });

  it('should construct image URL from relative path', () => {
    const result = usePageSeo({
      title: 'Test',
      description: 'Test',
      image: '/images/test.jpg',
    });

    expect(result.image).toBe('https://matlab-analytics.com/images/test.jpg');
  });

  it('should use absolute image URL as-is', () => {
    const result = usePageSeo({
      title: 'Test',
      description: 'Test',
      image: 'https://example.com/image.jpg',
    });

    expect(result.image).toBe('https://example.com/image.jpg');
  });

  it('should use default image if not provided', () => {
    const result = usePageSeo({
      title: 'Test',
      description: 'Test',
    });

    expect(result.image).toBe('https://matlab-analytics.com/og-image.jpg');
  });

  it('should include keywords in meta tags', () => {
    usePageSeo({
      title: 'Test',
      description: 'Test',
      keywords: ['keyword1', 'keyword2'],
    });

    const call = mockUseSeoMeta.mock.calls[0]![0];
    expect(call.keywords).toBe('keyword1, keyword2');
  });

  it('should set article-specific tags for article type', () => {
    usePageSeo({
      title: 'Article',
      description: 'Article description',
      type: 'article',
      author: 'John Doe',
      publishedTime: '2024-01-01',
      modifiedTime: '2024-01-02',
    });

    const call = mockUseSeoMeta.mock.calls[0]![0];
    expect(call.articleAuthor).toBe('John Doe');
    expect(call.articlePublishedTime).toBe('2024-01-01');
    expect(call.articleModifiedTime).toBe('2024-01-02');
  });

  it('should set Open Graph and Twitter Card tags', () => {
    usePageSeo({
      title: 'Test',
      description: 'Test description',
    });

    const call = mockUseSeoMeta.mock.calls[0]![0];
    expect(call.ogTitle).toBe('Test - MATLAB Analytics');
    expect(call.ogDescription).toBe('Test description');
    expect(call.twitterCard).toBe('summary_large_image');
    expect(call.twitterTitle).toBe('Test - MATLAB Analytics');
  });
});
