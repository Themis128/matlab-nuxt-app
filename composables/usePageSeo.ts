interface PageSeoOptions {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Composable for setting comprehensive SEO meta tags per page.
 * Uses useSeoMeta (Nuxt 3/4 recommended) for better SEO.
 *
 * @param options SEO options for the page
 */
export const usePageSeo = (options: PageSeoOptions) => {
  const config = useRuntimeConfig();
  const route = useRoute();
  const siteUrl = (config.public?.siteUrl as string) || 'https://matlab-analytics.com';

  // Construct full URL
  const fullUrl = options.url || `${siteUrl}${route.path}`;

  // Construct full image URL
  const imageUrl = options.image
    ? options.image.startsWith('http')
      ? options.image
      : `${siteUrl}${options.image}`
    : `${siteUrl}/og-image.jpg`; // Default OG image

  // Set page title with site name
  const fullTitle = options.title.includes(' - ')
    ? options.title
    : `${options.title} - MATLAB Analytics`;

  // Build keywords string
  const keywordsString = options.keywords?.join(', ') || '';

  // Use useSeoMeta for better SEO (Nuxt 3/4 recommended)
  // useSeoMeta is auto-imported in Nuxt 3
  useSeoMeta({
    // Basic meta tags
    title: fullTitle,
    description: options.description,
    keywords: keywordsString || undefined,

    // Open Graph tags (Facebook, LinkedIn, etc.)
    ogTitle: fullTitle,
    ogDescription: options.description,
    ogImage: imageUrl,
    ogUrl: fullUrl,
    ogType: options.type === 'product' ? 'website' : options.type || 'website',
    ogSiteName: 'MATLAB Analytics',

    // Twitter Card tags
    twitterCard: 'summary_large_image',
    twitterTitle: fullTitle,
    twitterDescription: options.description,
    twitterImage: imageUrl,

    // Article-specific tags
    ...(options.type === 'article' && {
      articleAuthor: options.author ? [options.author] : undefined,
      articlePublishedTime: options.publishedTime,
      articleModifiedTime: options.modifiedTime,
    }),

    // Additional meta tags
    robots: 'index, follow',
    author: options.author || 'MATLAB Analytics',
  });

  // Also set canonical URL
  useHead({
    link: [
      {
        rel: 'canonical',
        href: fullUrl,
      },
    ],
  });

  return {
    title: fullTitle,
    description: options.description,
    image: imageUrl,
    url: fullUrl,
  };
};

/**
 * Extended SEO options with structured data support
 */
export interface PageSeoWithStructuredDataOptions extends PageSeoOptions {
  structuredData?: {
    organization?: boolean;
    website?: boolean;
    breadcrumbs?: Array<{ name: string; url: string }>;
    article?: {
      headline: string;
      datePublished?: string;
      dateModified?: string;
      author?: string;
    };
  };
}
