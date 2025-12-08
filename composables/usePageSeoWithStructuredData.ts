import type { PageSeoWithStructuredDataOptions } from './usePageSeo';
import { usePageSeo } from './usePageSeo';
import {
  useOrganizationSchema,
  useWebSiteSchema,
  useBreadcrumbSchema,
  useArticleSchema,
  useStructuredData,
} from './useStructuredData';

/**
 * Enhanced SEO composable with structured data support
 */
export const usePageSeoWithStructuredData = (options: PageSeoWithStructuredDataOptions) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public?.siteUrl as string) || 'https://matlab-analytics.com';

  // Set basic SEO meta tags
  const seoResult = usePageSeo(options);

  // Add structured data if requested
  if (options.structuredData) {
    const schemas: Record<string, any>[] = [];

    // Organization schema (default for all pages)
    if (options.structuredData.organization !== false) {
      schemas.push(
        useOrganizationSchema({
          name: 'MATLAB Analytics',
          url: siteUrl,
          logo: '/logo.png',
          description: 'Advanced AI analytics platform for mobile datasets',
        })
      );
    }

    // WebSite schema (for homepage)
    if (options.structuredData.website) {
      schemas.push(
        useWebSiteSchema({
          name: 'MATLAB Analytics',
          url: siteUrl,
          description: options.description,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        })
      );
    }

    // Breadcrumb schema
    if (options.structuredData.breadcrumbs && options.structuredData.breadcrumbs.length > 0) {
      schemas.push(useBreadcrumbSchema(options.structuredData.breadcrumbs));
    }

    // Article schema
    if (options.structuredData.article && options.type === 'article') {
      schemas.push(
        useArticleSchema({
          headline: options.title,
          description: options.description,
          image: seoResult.image,
          datePublished: options.structuredData.article.datePublished || options.publishedTime,
          dateModified: options.structuredData.article.dateModified || options.modifiedTime,
          author: options.structuredData.article.author
            ? {
                '@type': 'Person',
                name: options.structuredData.article.author,
              }
            : undefined,
          publisher: {
            '@type': 'Organization',
            name: 'MATLAB Analytics',
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/logo.png`,
            },
          },
        })
      );
    }

    // Add structured data to page
    if (schemas.length > 0) {
      useStructuredData(schemas);
    }
  }

  return seoResult;
};
