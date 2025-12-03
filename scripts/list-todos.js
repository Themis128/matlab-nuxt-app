#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'

const DEFAULT_TAGS = ['TODO','FIXME','HACK','BUG','OPTIMIZE','NOTE','REVIEW','DEPRECATED','QUESTION']
const EXCLUDE_DIRS = [
  'node_modules', '.git', '.output', 'venv', '.venv', '__pycache__', 'dist', 'playwright-report', '.parcel-cache'
]
const TEXT_FILE_EXTENSIONS = [
  '.js', '.ts', '.vue', '.m', '.py', '.ps1', '.sh', '.bash', '.json', '.yaml', '.yml', '.md', '.html', '.css', '.scss', '.txt', '.cjs', '.mjs', '.tsx', '.jsx', '.sql'
]

async function walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.some((d) => fullPath.includes(path.normalize(d)))) continue
      files.push(...(await walkDir(fullPath)))
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (TEXT_FILE_EXTENSIONS.includes(ext)) files.push(fullPath)
    }
  }
  return files
}

async function scanFiles(root, tags=DEFAULT_TAGS) {
  const files = await walkDir(root)
  const results = []
  const tagsRegex = tags.join('|')
  const re = new RegExp("(?:(?:\\/\\/|#|<!--|\\/\\*|\\*|%|;|--)\\s*)(?:" + tagsRegex + ")(?:\\([^)]*\\))?(?:\\s*@\\w+)?[:\\s-]*(.*)", 'i')
  for (const f of files) {
    try {
      const content = await fs.readFile(f, 'utf8')
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const m = re.exec(line)
        if (m) {
          const tagMatch = (line.match(new RegExp(tagsRegex, 'i')) || [])[0]
          const msg = m[1] || ''
          results.push({ file: f, line: i + 1, tag: tagMatch, message: msg.trim() })
        }
      }
    } catch (err) {
      // ignore
    }
  }
  return results
}

async function main() {
  const root = process.cwd()
  const args = process.argv.slice(2)
  const filterTagsArg = args.find(a => a.startsWith('--tags='))
  const tags = filterTagsArg ? filterTagsArg.replace('--tags=', '').split(',') : DEFAULT_TAGS
  const matches = await scanFiles(root, tags)
  if (matches.length === 0) {
    console.log('No TODOs found for tags: ' + tags.join(','))
    return process.exit(0)
  }
  for (const m of matches) {
    console.log(`${m.file}:${m.line} [${m.tag}] ${m.message}`)
  }
  process.exit(0)
}

main()
