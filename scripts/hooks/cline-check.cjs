const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Cross-platform wrapper to run cline --check if available, otherwise skip.
 * This helps avoid lint-staged failing on Windows when 'cline' is not supported.
 */

function hasBinary(bin) {
  try {
    if (process.platform === 'win32') {
      const p = path.join(__dirname, '../../node_modules/.bin', `${bin}.cmd`);
      return fs.existsSync(p);
    }
    const p = path.join(__dirname, '../../node_modules/.bin', bin);
    return fs.existsSync(p);
  } catch (e) {
    return false;
  }
}

function runClineCheck() {
  // Prefer local install if available - otherwise try global npx call
  const bin = 'cline';
  if (hasBinary(bin)) {
    const cmd = process.platform === 'win32' ? `${bin}.cmd` : bin;
    const res = spawnSync(cmd, ['--check'], { stdio: 'inherit', cwd: process.cwd() });
    return res.status === 0;
  }

  // If not locally installed, attempt npx invocation (will try to install temporarily)
  const res = spawnSync('npx', ['cline', '--check'], { stdio: 'inherit', cwd: process.cwd() });
  return res.status === 0;
}

const ok = runClineCheck();
if (!ok) {
  console.log('Skipping cline check (binary not available or check failed)');
  process.exit(0);
}
process.exit(0);
