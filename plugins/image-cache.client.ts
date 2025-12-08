/**
 * Client-side plugin for image cache management
 * Initializes cache cleanup on app start
 */

export default defineNuxtPlugin(() => {
  const imageCache = useImageCacheStore();

  // Clear expired cache entries on app start
  imageCache.clearExpired();

  // Set up periodic cache cleanup (every hour)
  if (process.client) {
    setInterval(
      () => {
        imageCache.clearExpired();
      },
      60 * 60 * 1000
    ); // 1 hour
  }
});
