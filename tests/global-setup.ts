import type { FullConfig } from '@playwright/test'

async function waitFor(url: string, timeoutMs: number, intervalMs = 500) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) return
    } catch {
      // ignore
    }
    await new Promise(r => setTimeout(r, intervalMs))
  }
  throw new Error(`Timeout waiting for ${url} after ${timeoutMs}ms`)
}

export default async function globalSetup(_config: FullConfig) {
  // Try to wait for Python API, but don't fail if it's not available
  const pythonHealthUrl = 'http://localhost:8000/health'
  try {
    await waitFor(pythonHealthUrl, 30_000)
    console.log('[Global Setup] ✓ Python API is healthy')
  } catch (e) {
    console.log('[Global Setup] ⚠ Python API not available, some tests may fail')
  }
}
