/**
 * Cache Initialization Plugin
 * Initializes Redis cache on server startup
 */
import { initCache } from '../utils/cache';

export default defineNitroPlugin(async () => {
  await initCache();
});
