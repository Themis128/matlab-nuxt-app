/* eslint-disable no-console */
import type { FullConfig } from '@playwright/test';

async function waitFor(url: string, timeoutMs: number, intervalMs = 500) {
  const start = Date.now();
  const maxRetries = Math.floor(timeoutMs / intervalMs);
  let attempt = 0;

  while (Date.now() - start < timeoutMs) {
    attempt++;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), intervalMs - 50);

      const res = await fetch(url, {
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        console.log(`[Global Setup] ✓ ${url} healthy after ${attempt} attempt(s)`);
        return true;
      }
    } catch (e) {
      // Log only on significant milestones to avoid spam
      if (attempt === 1 || attempt % 10 === 0) {
        console.log(`[Global Setup] ⏳ Waiting for ${url}... (attempt ${attempt}/${maxRetries})`);
      }
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return false;
}

export default async function globalSetup(_config: FullConfig) {
  console.log('[Global Setup] 🚀 Checking server availability...');

  // Check Python API with generous timeout
  const pythonHealthUrl = 'http://localhost:8000/health';
  const pythonHealthy = await waitFor(pythonHealthUrl, 60_000);

  if (!pythonHealthy) {
    console.log('[Global Setup] ⚠️  Python API not available on http://localhost:8000');
    console.log('[Global Setup] 💡 Start manually: npm run test:servers:start');
    console.log('[Global Setup] ⏭️  Continuing - some tests may fail');
  }

  // Check Nuxt dev server with generous timeout
  const nuxtHealthUrl = 'http://localhost:3000';
  const nuxtHealthy = await waitFor(nuxtHealthUrl, 60_000);

  if (!nuxtHealthy) {
    console.log('[Global Setup] ⚠️  Nuxt dev server not available on http://localhost:3000');
    console.log('[Global Setup] 💡 Start manually: npm run test:servers:start');
    console.log('[Global Setup] ⏭️  Continuing - tests will likely fail');
  }

  if (pythonHealthy && nuxtHealthy) {
    console.log('[Global Setup] ✅ Both servers are healthy - ready to test!');
  } else {
    console.log('[Global Setup] ⚠️  Server health check summary:');
    console.log(`[Global Setup]    - Python API (8000): ${pythonHealthy ? '✓' : '✗'}`);
    console.log(`[Global Setup]    - Nuxt dev (3000):   ${nuxtHealthy ? '✓' : '✗'}`);
  }
}
