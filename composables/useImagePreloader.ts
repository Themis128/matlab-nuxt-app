/**
 * Composable for preloading images in the background
 * Improves perceived performance by loading images ahead of time
 */

export const useImagePreloader = () => {
  const imageCache = useImageCacheStore();
  const { normalizeImageUrl } = useAlgoliaImage();

  /**
   * Preload images from search results
   */
  const preloadSearchResults = async (records: any[]) => {
    if (!records || records.length === 0) return;

    // Extract image URLs
    const urls = records
      .map((record) => normalizeImageUrl(record))
      .filter((url) => !imageCache.isPreloaded(url) && !imageCache.isCached(url));

    if (urls.length > 0) {
      // Preload in background (don't block UI)
      imageCache.preloadImages(urls).catch((error: unknown) => {
        console.warn('Image preloading error:', error);
      });
    }
  };

  /**
   * Preload next page images
   */
  const preloadNextPage = async (records: any[], currentPage: number, totalPages: number) => {
    if (currentPage < totalPages - 1) {
      // Preload images for next page
      await preloadSearchResults(records);
    }
  };

  /**
   * Preload images on hover (for better UX)
   */
  const preloadOnHover = (record: any) => {
    const url = normalizeImageUrl(record);
    if (!imageCache.isPreloaded(url) && !imageCache.isCached(url)) {
      imageCache.preloadImage(url);
    }
  };

  return {
    preloadSearchResults,
    preloadNextPage,
    preloadOnHover,
  };
};
