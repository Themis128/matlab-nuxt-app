import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Nuxt composables
const mockUseRuntimeConfig = vi.fn(() => ({
  public: {
    siteUrl: 'https://matlab-analytics.com',
  },
}));

const mockUseHead = vi.fn();

vi.stubGlobal('useRuntimeConfig', () => mockUseRuntimeConfig());
vi.stubGlobal('useHead', (...args: any[]) => mockUseHead(...args));

// Import after mocks
import {
  useOrganizationSchema,
  useWebSiteSchema,
  useBreadcrumbSchema,
  useArticleSchema,
  useStructuredData,
} from '../useStructuredData';

describe('useStructuredData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRuntimeConfig.mockReturnValue({
      public: {
        siteUrl: 'https://matlab-analytics.com',
      },
    });
  });

  describe('useOrganizationSchema', () => {
    it('should generate organization schema', () => {
      const schema = useOrganizationSchema({
        name: 'Test Org',
        url: 'https://example.com',
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Test Org');
      expect(schema.url).toBe('https://example.com');
    });

    it('should include logo when provided', () => {
      const schema = useOrganizationSchema({
        name: 'Test Org',
        url: 'https://example.com',
        logo: '/logo.png',
      });

      expect(schema.logo).toBe('https://matlab-analytics.com/logo.png');
    });

    it('should use absolute logo URL as-is', () => {
      const schema = useOrganizationSchema({
        name: 'Test Org',
        url: 'https://example.com',
        logo: 'https://example.com/logo.png',
      });

      expect(schema.logo).toBe('https://example.com/logo.png');
    });

    it('should include description when provided', () => {
      const schema = useOrganizationSchema({
        name: 'Test Org',
        url: 'https://example.com',
        description: 'Test description',
      });

      expect(schema.description).toBe('Test description');
    });

    it('should include sameAs when provided', () => {
      const schema = useOrganizationSchema({
        name: 'Test Org',
        url: 'https://example.com',
        sameAs: ['https://twitter.com/test', 'https://facebook.com/test'],
      });

      expect(schema.sameAs).toHaveLength(2);
    });
  });

  describe('useWebSiteSchema', () => {
    it('should generate website schema', () => {
      const schema = useWebSiteSchema({
        name: 'Test Site',
        url: 'https://example.com',
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe('Test Site');
      expect(schema.url).toBe('https://example.com');
    });

    it('should include potentialAction when provided', () => {
      const schema = useWebSiteSchema({
        name: 'Test Site',
        url: 'https://example.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://example.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      });

      expect(schema.potentialAction).toBeDefined();
    });
  });

  describe('useBreadcrumbSchema', () => {
    it('should generate breadcrumb schema', () => {
      const schema = useBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
      ]);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(2);
      expect(schema.itemListElement[0]!.position).toBe(1);
      expect(schema.itemListElement[1]!.position).toBe(2);
    });

    it('should handle empty breadcrumb list', () => {
      const schema = useBreadcrumbSchema([]);

      expect(schema.itemListElement).toHaveLength(0);
    });
  });

  describe('useArticleSchema', () => {
    it('should generate article schema', () => {
      const schema = useArticleSchema({
        headline: 'Test Article',
        description: 'Test description',
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Article');
      expect(schema.headline).toBe('Test Article');
      expect(schema.description).toBe('Test description');
    });

    it('should include image when provided', () => {
      const schema = useArticleSchema({
        headline: 'Test Article',
        description: 'Test description',
        image: '/article.jpg',
      });

      expect(schema.image).toBe('https://matlab-analytics.com/article.jpg');
    });

    it('should include dates when provided', () => {
      const schema = useArticleSchema({
        headline: 'Test Article',
        description: 'Test description',
        datePublished: '2024-01-01',
        dateModified: '2024-01-02',
      });

      expect(schema.datePublished).toBe('2024-01-01');
      expect(schema.dateModified).toBe('2024-01-02');
    });

    it('should include author when provided', () => {
      const schema = useArticleSchema({
        headline: 'Test Article',
        description: 'Test description',
        author: {
          '@type': 'Person',
          name: 'John Doe',
        },
      });

      expect(schema.author).toEqual({
        '@type': 'Person',
        name: 'John Doe',
      });
    });

    it('should include publisher when provided', () => {
      const schema = useArticleSchema({
        headline: 'Test Article',
        description: 'Test description',
        publisher: {
          '@type': 'Organization',
          name: 'Test Publisher',
          logo: {
            '@type': 'ImageObject',
            url: '/logo.png',
          },
        },
      });

      expect(schema.publisher).toBeDefined();
      expect(schema.publisher!.logo!.url).toBe('https://matlab-analytics.com/logo.png');
    });
  });

  describe('useStructuredData', () => {
    it('should add structured data to page head', () => {
      const schemas = [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Test',
        },
      ];

      useStructuredData(schemas);

      expect(mockUseHead).toHaveBeenCalled();
      const call = mockUseHead.mock.calls[0]![0];
      expect(call.script).toBeDefined();
      expect(call.script[0].type).toBe('application/ld+json');
    });

    it('should handle multiple schemas', () => {
      const schemas = [
        { '@type': 'Organization', name: 'Test' },
        { '@type': 'WebSite', name: 'Test Site' },
      ];

      useStructuredData(schemas);

      const call = mockUseHead.mock.calls[0]![0];
      expect(call.script).toHaveLength(2);
    });
  });
});
