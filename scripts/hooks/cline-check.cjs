const { spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')

/**
 * Cross-platform wrapper to run cline --check if available, otherwise skip.
 * This helps avoid lint-staged failing on Windows when 'cline' is not supported.
 */

function hasBinary (bin) {
  try {
    if (process.platform === 'win32') {
      const p = path.join(__dirname, '../../node_modules/.bin', `${bin}.cmd`)
      return fs.existsSync(p)
    }
    const p = path.join(__dirname, '../../node_modules/.bin', bin)
    return fs.existsSync(p)
  } catch (e) {
    return false
  }
}

function runClineCheck () {
  // Prefer platform-specific local binary if available - otherwise try npx variants
  if (process.platform === 'win32') {
    const winPkg = '@involvex/cline-cli-win'
    // try local binary for '@involvex/cline-cli-win' first
    if (hasBinary('cline-cli-win') || hasBinary('cline')) {
      const cmdName = hasBinary('cline-cli-win') ? 'cline-cli-win' : 'cline'
      const cmd = `${cmdName}.cmd`
      const res = spawnSync(cmd, ['--check'], { stdio: 'inherit', cwd: process.cwd() })
      if (res.status === 0) return true
    }

    // fallback to npx @involvex/cline-cli-win
    const resWin = spawnSync('npx', [winPkg, '--check'], { stdio: 'inherit', cwd: process.cwd() })
    if (resWin.status === 0) return true
  }

  // Non-Windows or fallback: prefer cline
  if (hasBinary('cline')) {
    const cmd = process.platform === 'win32' ? 'cline.cmd' : 'cline'
    const res = spawnSync(cmd, ['--check'], { stdio: 'inherit', cwd: process.cwd() })
    if (res.status === 0) return true
  }
  const res = spawnSync('npx', ['cline', '--check'], { stdio: 'inherit', cwd: process.cwd() })
  return res.status === 0
}

const ok = runClineCheck()
if (!ok) {
  console.log('Skipping cline check (binary not available or check failed)')
  process.exit(0)
}
process.exit(0)
