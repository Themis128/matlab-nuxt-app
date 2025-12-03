#!/usr/bin/env node
/*
 * Simple Node script that scans the repository for critical TODO tags (FIXME, BUG, etc.)
 * and exits with non-zero code if any are found. Designed for CI and local checks.
 */

import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'

const DEFAULT_TAGS = ['FIXME', 'BUG']

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
]

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
]

async function walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.some(d => fullPath.includes(path.normalize(d)))) continue
      files.push(...(await walkDir(fullPath)))
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (TEXT_FILE_EXTENSIONS.includes(ext)) files.push(fullPath)
    }
  }
  return files
}

async function scanFiles(root, tags, files = null) {
  const util = await import('util')
  const nodePathFilter = p => {
    // ignore binary or paths in EXCLUDE_DIRS
    return !EXCLUDE_DIRS.some(d => p.includes(path.normalize(d)))
  }
  const fileList = files || (await walkDir(root)).filter(nodePathFilter)
  const results = []
  const tagsRegex = tags.join('|')
  // allow patterns like: FIXME, FIXME(@owner), FIXME(@owner): msg, FIXME @owner: msg
  const re = new RegExp(
    '(?:(?:\\/\\/|#|<!--|\\/\\*|\\*|%|;|--)\\s*)(?:' +
      tagsRegex +
      ')(?:\\([^)]*\\))?(?:\\s*@\\w+)?[:\\s-]*(.*)',
    'i'
  )
  for (const f of fileList) {
    try {
      const content = await fs.readFile(f, 'utf8')
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const m = re.exec(line)
        if (m) {
          // If this is a Markdown file, ignore matches inside code fences or inline code
          if (f.endsWith('.md')) {
            // If line is not an HTML comment and not in a code fence or inline backticks, skip
            if (!line.trim().startsWith('<!--')) {
              continue
            }
            // Count code fences up to this line (``` or ~~~)
            const upToLine = lines.slice(0, i + 1).join('\n')
            const fenceMatches = (upToLine.match(/(^|\n)(```|~~~)/g) || []).length
            if (fenceMatches % 2 === 1) {
              // Inside a code fence; skip to avoid code examples being treated as TODOs
              continue
            }
            // More robust inline backtick detection: check if the match index falls between backticks
            const matchIndex = m.index || line.toLowerCase().indexOf(m[0].toLowerCase())
            const prefix = line.slice(0, matchIndex)
            const suffix = line.slice(matchIndex + (m[0] || '').length)
            const prevBacktick = prefix.lastIndexOf('`')
            const nextBacktick = suffix.indexOf('`')
            if (prevBacktick !== -1 && nextBacktick !== -1) continue
          }
          // find which tag - case-insensitive
          const tag = (line.match(new RegExp(tagsRegex, 'i')) || [])[0]
          const msg = m[1] || ''
          results.push({ file: f, line: i + 1, tag: tag, message: msg.trim() })
        }
      }
    } catch (err) {
      // ignore read errors
    }
  }
  return results
}

async function main() {
  const root = process.cwd()
  const argv = process.argv.slice(2)
  const staged = argv.includes('--staged') || false
  const filesArg = argv.find(a => a.startsWith('--files='))
  const baseArg = (argv.find(a => a.startsWith('--base=')) || '').replace('--base=', '')
  let targetFiles = null
  if (staged) {
    try {
      const out = execSync('git diff --staged --name-only', { encoding: 'utf8' })
      targetFiles = out.split(/\r?\n/).filter(Boolean)
    } catch (e) {
      // ignore
    }
  }
  if (filesArg) {
    const val = filesArg.replace('--files=', '')
    targetFiles = val
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
  }
  if (baseArg) {
    try {
      // Fetch base and diff
      execSync(`git fetch origin ${baseArg}`, { stdio: 'ignore' })
      const out = execSync(
        `git diff --name-only origin/${baseArg}...HEAD || git diff --name-only HEAD~1..HEAD`,
        { encoding: 'utf8' }
      )
      targetFiles = out.split(/\r?\n/).filter(Boolean)
    } catch (e) {
      // ignore
    }
  }
  const envTags = process.env.CRITICAL_TAGS
  const tags = (envTags ? envTags.split(',') : DEFAULT_TAGS).map(t => t.trim()).filter(Boolean)
  const matches = await scanFiles(root, tags, targetFiles)
  if (matches.length === 0) {
    console.warn('✅ No critical TODOs found.')
    process.exit(0)
  }
  console.error(`⚠️  Found ${matches.length} critical TODO(s):`)
  for (const m of matches) {
    console.error(`${m.file}:${m.line} [${m.tag}] ${m.message}`)
  }
  process.exit(1)
}

main()
