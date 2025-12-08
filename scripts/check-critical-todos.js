#!/usr/bin/env node
/*
 * Simple Node script that scans the repository for critical TODO tags (FIXME, BUG, etc.)
 * and exits with non-zero code if any are found. Designed for CI and local checks.
 */

import { execFileSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const DEFAULT_TAGS = ['FIXME', 'BUG'];

const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  '.output',
  'venv',
  '.venv',
  '__pycache__',
  'dist',
  'playwright-report',
  '.parcel-cache',
  'python_api/trained_models',
];

const TEXT_FILE_EXTENSIONS = [
  '.js',
  '.ts',
  '.vue',
  '.m',
  '.py',
  '.ps1',
  '.sh',
  '.bash',
  '.json',
  '.yaml',
  '.yml',
  '.md',
  '.html',
  '.css',
  '.scss',
  '.txt',
  '.cjs',
  '.mjs',
  '.tsx',
  '.jsx',
  '.sql',
];

async function walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.some((d) => fullPath.includes(path.normalize(d)))) continue;
      files.push(...(await walkDir(fullPath)));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (TEXT_FILE_EXTENSIONS.includes(ext)) files.push(fullPath);
    }
  }
  return files;
}

/**
 * Validate and sanitize file path to prevent path traversal
 * Returns the resolved path if valid, null otherwise
 */
function validateFilePath(filePath, rootDir) {
  try {
    const resolved = path.resolve(filePath);
    const resolvedRoot = path.resolve(rootDir);

    // Ensure the resolved path is within the root directory
    if (!resolved.startsWith(resolvedRoot + path.sep) && resolved !== resolvedRoot) {
      return null;
    }

    // Additional check: ensure no path traversal sequences in the original path
    if (filePath.includes('..')) {
      return null;
    }

    return resolved;
  } catch {
    return null;
  }
}

async function scanFiles(root, tags, files = null) {
  const nodePathFilter = (p) => {
    // ignore binary or paths in EXCLUDE_DIRS
    return !EXCLUDE_DIRS.some((d) => p.includes(path.normalize(d)));
  };
  const fileList = files || (await walkDir(root)).filter(nodePathFilter);
  const results = [];
  const tagsRegex = tags.join('|');
  // allow patterns like: FIXME, FIXME(@owner), FIXME(@owner): msg, FIXME @owner: msg
  const re = new RegExp(
    `(?:(?:\\/\\/|#|<!--|\\/\\*|\\*|%|;|--)\\s*)(?:${
      tagsRegex
    })(?:\\([^)]*\\))?(?:\\s*@\\w+)?[:\\s-]*(.*)`,
    'i'
  );
  // SECURITY: Validate all file paths before reading to prevent path traversal
  for (const f of fileList) {
    try {
      // SECURITY: Validate file path to prevent path traversal attacks
      const validatedPath = validateFilePath(f, root);
      if (!validatedPath) {
        console.warn(`Security: Skipping invalid file path: ${f}`);
        continue;
      }
      const content = await fs.readFile(validatedPath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const m = re.exec(line);
        if (m) {
          // If this is a Markdown file, ignore matches inside code fences or inline code
          if (f.endsWith('.md')) {
            // If line is not an HTML comment and not in a code fence or inline backticks, skip
            if (!line.trim().startsWith('<!--')) {
              continue;
            }
            // Count code fences up to this line (``` or ~~~)
            const upToLine = lines.slice(0, i + 1).join('\n');
            const fenceMatches = (upToLine.match(/(^|\n)(```|~~~)/g) || []).length;
            if (fenceMatches % 2 === 1) {
              // Inside a code fence; skip to avoid code examples being treated as TODOs
              continue;
            }
            // More robust inline backtick detection: check if the match index falls between backticks
            const matchIndex = m.index || line.toLowerCase().indexOf(m[0].toLowerCase());
            const prefix = line.slice(0, matchIndex);
            const suffix = line.slice(matchIndex + (m[0] || '').length);
            const prevBacktick = prefix.lastIndexOf('`');
            const nextBacktick = suffix.indexOf('`');
            if (prevBacktick !== -1 && nextBacktick !== -1) continue;
          }
          // find which tag - case-insensitive
          const tag = (line.match(new RegExp(tagsRegex, 'i')) || [])[0];
          const msg = m[1] || '';
          results.push({ file: validatedPath, line: i + 1, tag, message: msg.trim() });
        }
      }
    } catch {
      // ignore read errors
    }
  }
  return results;
}

async function main() {
  const root = process.cwd();
  const argv = process.argv.slice(2);
  const staged = argv.includes('--staged') || false;
  const filesArg = argv.find((a) => a.startsWith('--files='));
  const baseArgRaw = (argv.find((a) => a.startsWith('--base=')) || '').replace('--base=', '');
  // SECURITY: Sanitize baseArg to prevent command injection
  // Only allow alphanumeric, dash, underscore, slash, and dot characters for git refs
  const baseArg = baseArgRaw && /^[a-zA-Z0-9\-_./]+$/.test(baseArgRaw) ? baseArgRaw : '';
  let targetFiles = null;
  if (staged) {
    try {
      // SECURITY: Use execFileSync with array arguments instead of execSync
      const out = execFileSync('git', ['diff', '--staged', '--name-only'], { encoding: 'utf8' });
      const rawFiles = out.split(/\r?\n/).filter(Boolean);
      // SECURITY: Validate all file paths from git output to prevent path traversal
      targetFiles = rawFiles
        .map((p) => {
          const resolved = path.resolve(root, p);
          const resolvedRoot = path.resolve(root);
          // Ensure the resolved path is within the root directory
          if (!resolved.startsWith(resolvedRoot + path.sep) && resolved !== resolvedRoot) {
            console.warn(`Security: Skipping file path outside working directory: ${p}`);
            return null;
          }
          return resolved;
        })
        .filter(Boolean);
    } catch {
      // ignore
    }
  }
  if (filesArg) {
    const val = filesArg.replace('--files=', '');
    targetFiles = val
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      // SECURITY: Validate file paths BEFORE calling path.resolve() to prevent path traversal
      .map((p) => {
        // First validate the string input for path traversal sequences
        if (p.includes('..')) {
          console.error(`Security: Path traversal detected in file path: ${p}`);
          return null;
        }

        // Now safe to resolve the path
        const cwd = process.cwd();
        const resolvedCwd = path.resolve(cwd);
        const resolved = path.resolve(p);

        // Ensure the resolved path is within the current working directory
        if (!resolved.startsWith(resolvedCwd)) {
          console.error(`Security: File path outside working directory: ${p}`);
          return null;
        }

        return resolved;
      })
      .filter(Boolean); // Remove null values
  }
  if (baseArg) {
    try {
      // SECURITY: Sanitize baseArg to prevent command injection - only allow alphanumeric, dash, underscore, slash, and dot
      if (!/^[a-zA-Z0-9._\/-]+$/.test(baseArg)) {
        console.error(`Invalid base argument: ${baseArg}`);
        process.exit(1);
      }
      // Additional sanitization: remove any remaining unsafe characters
      const sanitizedBase = baseArg.replace(/[^a-zA-Z0-9._\/-]/g, '');
      if (sanitizedBase !== baseArg) {
        console.error(`Security: Invalid characters in base argument: ${baseArg}`);
        process.exit(1);
      }
      // SECURITY: Fetch base and diff using execFileSync with array arguments
      execFileSync('git', ['fetch', 'origin', sanitizedBase], { stdio: 'ignore' });
      let out;
      try {
        // SECURITY: Use separate arguments instead of string interpolation for ref pattern
        // Additional validation: ensure base ref is safe
        if (!/^[a-zA-Z0-9._\/-]+$/.test(sanitizedBase)) {
          throw new Error('Invalid base ref');
        }
        // SECURITY: Construct ref pattern safely after validation
        // Use two-dot notation with separate arguments (safer than three-dot notation)
        // This compares origin/branch to HEAD
        const baseRef = `origin/${sanitizedBase}`;
        // Additional validation: ensure constructed ref is safe
        if (!/^origin\/[a-zA-Z0-9._\/-]+$/.test(baseRef)) {
          throw new Error('Invalid constructed ref');
        }
        // SECURITY: Pass refs as separate arguments using two-dot notation
        out = execFileSync('git', ['diff', '--name-only', baseRef, 'HEAD'], {
          encoding: 'utf8',
        });
      } catch {
        // Fallback to HEAD~1 if branch comparison fails
        out = execFileSync('git', ['diff', '--name-only', 'HEAD~1..HEAD'], { encoding: 'utf8' });
      }
      const rawFiles = out.split(/\r?\n/).filter(Boolean);
      // SECURITY: Validate all file paths from git output to prevent path traversal
      targetFiles = rawFiles
        .map((p) => {
          const resolved = path.resolve(root, p);
          const resolvedRoot = path.resolve(root);
          // Ensure the resolved path is within the root directory
          if (!resolved.startsWith(resolvedRoot + path.sep) && resolved !== resolvedRoot) {
            console.warn(`Security: Skipping file path outside working directory: ${p}`);
            return null;
          }
          return resolved;
        })
        .filter(Boolean);
    } catch {
      // ignore
    }
  }
  const envTags = process.env.CRITICAL_TAGS;
  const tags = (envTags ? envTags.split(',') : DEFAULT_TAGS).map((t) => t.trim()).filter(Boolean);
  const matches = await scanFiles(root, tags, targetFiles);
  if (matches.length === 0) {
    console.warn('✅ No critical TODOs found.');
    process.exit(0);
  }
  console.error(`⚠️  Found ${matches.length} critical TODO(s):`);
  for (const m of matches) {
    console.error(`${m.file}:${m.line} [${m.tag}] ${m.message}`);
  }
  process.exit(1);
}

main();
