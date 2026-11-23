import { existsSync, readFileSync } from 'fs';
import { join, relative, sep } from 'path';

/**
 * Dataset file reader that works both locally and on Vercel.
 *
 * The dataset endpoints used to readFileSync(join(process.cwd(), ...))
 * directly. Vercel's file tracer (@vercel/nft) cannot follow the dynamic
 * candidate-path loops, so `data/**` never landed in the function bundle
 * and every dataset route 500'd with ENOENT /var/task/data/...
 *
 * Fix: nuxt.config.ts `nitro.serverAssets` bundles `./data` and the public
 * dataset CSV into the server output; this helper tries the filesystem
 * first (dev / self-hosted) and falls back to the `assets:*` storage mounts.
 */

const ASSET_MOUNTS: Array<[string, string]> = [
  ['data/', 'assets:data'],
  ['public/', 'assets:public-files'],
];

function toRepoRelative(absPath: string): string | null {
  const rel = relative(process.cwd(), absPath).split(sep).join('/');
  return rel.startsWith('..') ? null : rel;
}

async function readFromAssets(relPath: string): Promise<string | null> {
  for (const [prefix, mount] of ASSET_MOUNTS) {
    if (!relPath.startsWith(prefix)) continue;
    const key = relPath.slice(prefix.length);
    try {
      const raw = await useStorage(mount).getItemRaw(key);
      if (raw == null) return null;
      return typeof raw === 'string' ? raw : new TextDecoder().decode(raw);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Read the first candidate path that resolves, as UTF-8 text.
 * Accepts absolute paths (join(process.cwd(), ...)) or repo-relative paths.
 * Returns null when no candidate exists.
 */
export async function readDatasetFile(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    const absPath = candidate.startsWith('/') ? candidate : join(process.cwd(), candidate);
    if (existsSync(absPath)) {
      try {
        return readFileSync(absPath, 'utf-8');
      } catch {
        // fall through to asset mounts
      }
    }
    const rel = toRepoRelative(absPath);
    if (rel) {
      const fromAssets = await readFromAssets(rel);
      if (fromAssets != null) return fromAssets;
    }
  }
  return null;
}

/** Sync variant for callers that must stay sync — filesystem only. */
export function datasetFileExists(candidate: string): boolean {
  const absPath = candidate.startsWith('/') ? candidate : join(process.cwd(), candidate);
  return existsSync(absPath);
}

/** Async existence check across filesystem + asset mounts. */
export async function datasetFileAvailable(candidate: string): Promise<boolean> {
  const absPath = candidate.startsWith('/') ? candidate : join(process.cwd(), candidate);
  if (existsSync(absPath)) return true;
  const rel = toRepoRelative(absPath);
  if (!rel) return false;
  for (const [prefix, mount] of ASSET_MOUNTS) {
    if (!rel.startsWith(prefix)) continue;
    try {
      const raw = await useStorage(mount).getItemRaw(rel.slice(prefix.length));
      if (raw != null) return true;
    } catch {
      // mount missing — keep checking
    }
  }
  return false;
}
