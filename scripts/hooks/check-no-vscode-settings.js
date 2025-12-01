#!/usr/bin/env node
/*
Checks for accidentally staged per-user VS Code settings and blocks the commit.
Intended to run as a pre-commit hook via simple-git-hooks.
*/

const { execSync } = require('child_process')
const path = require('path')

function main() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim()
    if (!output) return 0 // nothing staged

    const staged = output
      .split(/\r?\n/)
      .map(p => p.trim())
      .filter(Boolean)
    const blockedFiles = [
      path.posix.normalize('.vscode/settings.json'),
      path.posix.normalize('.vscode/settings.json.bak'),
    ]

    // Normalize paths to posix for cross-platform comparison
    const matches = staged.filter(s => {
      const p = s.replace(/\\/g, '/')
      return blockedFiles.some(b => p === b || p.startsWith(b + '/'))
    })

    if (matches.length > 0) {
      console.error(
        '\nCommit blocked: Detected per-developer workspace settings staged for commit:'
      )
      matches.forEach(f => console.error(' - ' + f))
      console.error(
        `\nPlease unstage these files first, e.g. \`git restore --staged .vscode/settings.json\``
      )
      console.error(
        'If you intentionally need to add a shared editor configuration file, add it to the repo (and update .gitignore) or use a tracked template in .vscode/settings-controls/'
      )
      console.error('\nSee docs/WORKSPACE_SETUP.md for usage and how to toggle settings.')
      process.exit(1)
    }
    return 0
  } catch (err) {
    console.error('Error checking staged files:', err.message || err)
    return 1
  }
}

if (require.main === module) {
  process.exit(main())
}
