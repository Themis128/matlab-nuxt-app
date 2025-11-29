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
  // Ensure Python API is healthy before tests begin
  const pythonHealthUrl = 'http://localhost:8000/health'
  await waitFor(pythonHealthUrl, 60_000)
}
