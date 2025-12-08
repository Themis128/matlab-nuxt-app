import { algoliasearch } from 'algoliasearch';
import type { AlgoliaRecord } from '../../../types/algolia';

interface AlgoliaSearchResponse {
  hits: AlgoliaRecord[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
  query: string;
  params: string;
}

export default defineEventHandler(async (event: any): Promise<AlgoliaSearchResponse> => {
  const config = useRuntimeConfig();
  const query = getQuery(event);

  // Get Algolia credentials with preference for runtime config (more secure)
  const appId = config.ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
  const apiKey = config.ALGOLIA_ADMIN_API_KEY || process.env.ALGOLIA_ADMIN_API_KEY;
  const indexName = config.ALGOLIA_INDEX || process.env.ALGOLIA_INDEX || 'phones_index';

  // Validate credentials are present and properly formatted
  if (!appId || !apiKey) {
    console.error('[Algolia Search] Missing credentials');
    throw createError({
      statusCode: 500,
      statusMessage: 'Algolia credentials not configured on server',
    });
  }

  // Basic validation of credential format
  if (typeof appId !== 'string' || appId.length < 8) {
    console.error('[Algolia Search] Invalid App ID format');
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid Algolia App ID configuration',
    });
  }

  if (typeof apiKey !== 'string' || apiKey.length < 32) {
    console.error('[Algolia Search] Invalid API key format');
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid Algolia API key configuration',
    });
  }

  // Validate index name to prevent unauthorized access
  const ALLOWED_INDICES = ['phones_index', 'mobiles_index', 'products_index', 'movies_index'];
  if (!ALLOWED_INDICES.includes(indexName)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid index name. Allowed indices: ${ALLOWED_INDICES.join(', ')}`,
    });
  }

  // Initialize Algolia client (v5 API)
  const client = algoliasearch(String(appId), String(apiKey));

  // Parse and validate search parameters
  const searchQuery = (query.q as string) || (query.query as string) || '';
  const searchPage = Math.max(0, parseInt((query.page as string) || '0'));
  const searchHitsPerPage = Math.min(
    100,
    Math.max(1, parseInt((query.hitsPerPage as string) || '20'))
  );

  // Validate search query length to prevent abuse
  if (searchQuery.length > 200) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Search query too long (max 200 characters)',
    });
  }

  // Build search params for v5 API
  const searchParams: any = {
    query: searchQuery,
    page: searchPage,
    hitsPerPage: searchHitsPerPage,
  };

  // Add filters if provided
  if (query.filters) {
    searchParams.filters = String(query.filters);
  }

  if (query.facetFilters) {
    const facetFilters = Array.isArray(query.facetFilters)
      ? query.facetFilters.map((f: any) => String(f))
      : [String(query.facetFilters)];
    searchParams.facetFilters = facetFilters;
  }

  if (query.numericFilters) {
    const numericFilters = Array.isArray(query.numericFilters)
      ? query.numericFilters.map((f: any) => String(f))
      : [String(query.numericFilters)];
    searchParams.numericFilters = numericFilters;
  }

  try {
    // Perform search using v5 API - searchSingleIndex method
    // In Algolia v5, searchSingleIndex is a method on the client
    const result = await client.searchSingleIndex({
      indexName: String(indexName),
      searchParams,
    });

    // Extract results from v5 API response structure
    const hits = result.hits || [];
    const nbHits = result.nbHits || 0;
    const page = result.page || searchPage;
    const nbPages = result.nbPages || 0;
    const hitsPerPage = result.hitsPerPage || searchHitsPerPage;
    const processingTimeMS = result.processingTimeMS || 0;

    // Normalize image URLs in hits to ensure correct paths
    const normalizedHits = hits.map((hit: any) => {
      // Normalize image URLs - ensure they're valid paths
      const imageFields = ['image_url', 'image', 'photo'];
      const normalizedHit = { ...hit };

      for (const field of imageFields) {
        if (normalizedHit[field] && typeof normalizedHit[field] === 'string') {
          let url = normalizedHit[field].trim();

          // Skip if already a full URL
          if (url.startsWith('http://') || url.startsWith('https://')) {
            continue;
          }

          // Ensure relative paths start with /
          if (!url.startsWith('/')) {
            url = `/${url}`;
          }

          // Remove duplicate slashes and validate
          url = url.replace(/\/+/g, '/');

          // Reject dangerous paths
          if (!url.includes('..') && !url.includes('//')) {
            normalizedHit[field] = url;
          } else {
            // Use default if path is invalid
            normalizedHit[field] = '/mobile_images/default-phone.png';
          }
        }
      }

      // Ensure at least one image field exists
      if (!normalizedHit.image_url && !normalizedHit.image && !normalizedHit.photo) {
        normalizedHit.image_url = '/mobile_images/default-phone.png';
        normalizedHit.image = '/mobile_images/default-phone.png';
      }

      return normalizedHit;
    });

    return {
      hits: normalizedHits as AlgoliaRecord[],
      nbHits,
      page,
      nbPages,
      hitsPerPage,
      processingTimeMS,
      query: searchQuery,
      params: JSON.stringify(searchParams),
    };
  } catch (error: unknown) {
    console.error('Algolia search error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Algolia search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
