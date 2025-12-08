/**
 * Composable for generating JSON-LD structured data
 * Improves SEO by providing rich snippets to search engines
 */

interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

interface WebSiteSchema {
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': string;
    target: {
      '@type': string;
      urlTemplate: string;
    };
    'query-input': string;
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface ArticleSchema {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': string;
    name: string;
  };
  publisher?: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
}

/**
 * Generate Organization JSON-LD schema
 */
export const useOrganizationSchema = (options: OrganizationSchema) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public?.siteUrl as string) || 'https://matlab-analytics.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: options.name,
    url: options.url,
    ...(options.logo && {
      logo: options.logo.startsWith('http') ? options.logo : `${siteUrl}${options.logo}`,
    }),
    ...(options.description && { description: options.description }),
    ...(options.sameAs && options.sameAs.length > 0 && { sameAs: options.sameAs }),
  };
};

/**
 * Generate WebSite JSON-LD schema with search action
 */
export const useWebSiteSchema = (options: WebSiteSchema) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: options.name,
    url: options.url,
    ...(options.description && { description: options.description }),
    ...(options.potentialAction && {
      potentialAction: options.potentialAction,
    }),
  };
};

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export const useBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Generate Article JSON-LD schema
 */
export const useArticleSchema = (options: ArticleSchema) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public?.siteUrl as string) || 'https://matlab-analytics.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.headline,
    description: options.description,
    ...(options.image && {
      image: options.image.startsWith('http') ? options.image : `${siteUrl}${options.image}`,
    }),
    ...(options.datePublished && { datePublished: options.datePublished }),
    ...(options.dateModified && { dateModified: options.dateModified }),
    ...(options.author && { author: options.author }),
    ...(options.publisher && {
      publisher: {
        ...options.publisher,
        ...(options.publisher.logo && {
          logo: {
            ...options.publisher.logo,
            url: options.publisher.logo.url.startsWith('http')
              ? options.publisher.logo.url
              : `${siteUrl}${options.publisher.logo.url}`,
          },
        }),
      },
    }),
  };
};

/**
 * Add JSON-LD structured data to page head
 */
export const useStructuredData = (schemas: Record<string, any>[]) => {
  useHead({
    script: schemas.map((schema) => ({
      type: 'application/ld+json',
      children: JSON.stringify(schema, null, 2),
    })),
  });
};
