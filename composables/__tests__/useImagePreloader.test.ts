import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useImagePreloader } from '../useImagePreloader';

// Mock stores and composables
const mockImageCacheStore = {
  isPreloaded: vi.fn(() => false),
  isCached: vi.fn(() => false),
  preloadImages: vi.fn().mockResolvedValue(undefined),
  preloadImage: vi.fn().mockResolvedValue(undefined),
};

const mockNormalizeImageUrl = vi.fn((record: any) => record.image_url || '/default.jpg');

vi.mock('~/stores/imageCacheStore', () => ({
  useImageCacheStore: () => mockImageCacheStore,
}));

vi.mock('~/composables/useAlgoliaImage', () => ({
  useAlgoliaImage: () => ({
    normalizeImageUrl: mockNormalizeImageUrl,
  }),
}));

describe('useImagePreloader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return preloader methods', () => {
    const preloader = useImagePreloader();

    expect(preloader).toHaveProperty('preloadSearchResults');
    expect(preloader).toHaveProperty('preloadNextPage');
    expect(preloader).toHaveProperty('preloadOnHover');
  });

  it('should preload search result images', async () => {
    const preloader = useImagePreloader();
    const records = [{ image_url: '/image1.jpg' }, { image_url: '/image2.jpg' }];

    await preloader.preloadSearchResults(records);

    expect(mockNormalizeImageUrl).toHaveBeenCalledTimes(2);
    expect(mockImageCacheStore.preloadImages).toHaveBeenCalledWith(['/image1.jpg', '/image2.jpg']);
  });

  it('should skip already preloaded images', async () => {
    mockImageCacheStore.isPreloaded.mockReturnValueOnce(true);
    const preloader = useImagePreloader();
    const records = [{ image_url: '/image1.jpg' }, { image_url: '/image2.jpg' }];

    await preloader.preloadSearchResults(records);

    expect(mockImageCacheStore.preloadImages).toHaveBeenCalledWith(['/image2.jpg']);
  });

  it('should skip already cached images', async () => {
    mockImageCacheStore.isCached.mockReturnValueOnce(true);
    const preloader = useImagePreloader();
    const records = [{ image_url: '/image1.jpg' }, { image_url: '/image2.jpg' }];

    await preloader.preloadSearchResults(records);

    expect(mockImageCacheStore.preloadImages).toHaveBeenCalledWith(['/image2.jpg']);
  });

  it('should handle empty records array', async () => {
    const preloader = useImagePreloader();

    await preloader.preloadSearchResults([]);

    expect(mockImageCacheStore.preloadImages).not.toHaveBeenCalled();
  });

  it('should handle null records', async () => {
    const preloader = useImagePreloader();

    await preloader.preloadSearchResults(null as any);

    expect(mockImageCacheStore.preloadImages).not.toHaveBeenCalled();
  });

  it('should preload next page images', async () => {
    const preloader = useImagePreloader();
    const records = [{ image_url: '/image1.jpg' }];

    await preloader.preloadNextPage(records, 0, 5);

    expect(mockImageCacheStore.preloadImages).toHaveBeenCalled();
  });

  it('should not preload if on last page', async () => {
    const preloader = useImagePreloader();
    const records = [{ image_url: '/image1.jpg' }];

    await preloader.preloadNextPage(records, 4, 5);

    expect(mockImageCacheStore.preloadImages).not.toHaveBeenCalled();
  });

  it('should preload on hover', () => {
    const preloader = useImagePreloader();
    const record = { image_url: '/image1.jpg' };

    preloader.preloadOnHover(record);

    expect(mockNormalizeImageUrl).toHaveBeenCalledWith(record);
    expect(mockImageCacheStore.preloadImage).toHaveBeenCalledWith('/image1.jpg');
  });

  it('should not preload on hover if already preloaded', () => {
    mockImageCacheStore.isPreloaded.mockReturnValue(true);
    const preloader = useImagePreloader();
    const record = { image_url: '/image1.jpg' };

    preloader.preloadOnHover(record);

    expect(mockImageCacheStore.preloadImage).not.toHaveBeenCalled();
  });

  it('should not preload on hover if already cached', () => {
    mockImageCacheStore.isCached.mockReturnValue(true);
    const preloader = useImagePreloader();
    const record = { image_url: '/image1.jpg' };

    preloader.preloadOnHover(record);

    expect(mockImageCacheStore.preloadImage).not.toHaveBeenCalled();
  });

  it('should handle preload errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockImageCacheStore.preloadImages.mockRejectedValue(new Error('Preload error'));
    const preloader = useImagePreloader();
    const records = [{ image_url: '/image1.jpg' }];

    await preloader.preloadSearchResults(records);

    expect(consoleSpy).toHaveBeenCalledWith('Image preloading error:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});
