#!/usr/bin/env node

/**
 * File Watcher Auto-Fix Script
 * Watches files for changes and automatically runs appropriate fixes
 * Designed for integration with Cursor AI and development workflows
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Simple file watcher implementation
class FileWatcher {
  constructor() {
    this.watchedDirs = new Set();
    this.fileTypes = {
      js: ['js', 'jsx', 'ts', 'tsx', 'vue'],
      py: ['py', 'pyi'],
      css: ['css', 'scss', 'sass', 'less', 'styl'],
      md: ['md', 'markdown'],
      json: ['json'],
      yaml: ['yml', 'yaml'],
      html: ['html', 'htm'],
      sh: ['sh', 'bash', 'zsh', 'fish'],
    };
    this.debounceTimers = new Map();
    this.logs = [];
  }

  log(message, color = 'reset') {
    console.log(
      `\x1b[${this.getColorCode(color)}m${new Date().toLocaleTimeString()} - ${message}\x1b[0m`
    );
    this.logs.push({ message, timestamp: new Date().toISOString() });
  }

  getColorCode(color) {
    const colors = {
      reset: '0',
      red: '31',
      green: '32',
      yellow: '33',
      blue: '34',
      magenta: '35',
      cyan: '36',
    };
    return colors[color] || '0';
  }

  shouldWatchFile(filePath) {
    const ext = path.extname(filePath).slice(1).toLowerCase();

    // Skip files in these directories
    const skipDirs = [
      'node_modules',
      '.nuxt',
      '.output',
      'dist',
      'venv',
      '__pycache__',
      '.git',
      'coverage',
      'test-results',
    ];

    const relativePath = path.relative(process.cwd(), filePath);
    if (skipDirs.some((dir) => relativePath.includes(dir))) {
      return false;
    }

    // Check if file has a watched extension
    return Object.values(this.fileTypes).flat().includes(ext);
  }

  getFileType(filePath) {
    const ext = path.extname(filePath).slice(1).toLowerCase();

    for (const [type, extensions] of Object.entries(this.fileTypes)) {
      if (extensions.includes(ext)) {
        return type;
      }
    }
    return null;
  }

  debounce(key, fn, delay = 1000) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    const timer = setTimeout(() => {
      fn();
      this.debounceTimers.delete(key);
    }, delay);

    this.debounceTimers.set(key, timer);
  }

  runAutoFix(filePath) {
    const fileType = this.getFileType(filePath);
    const relativePath = path.relative(process.cwd(), filePath);

    this.log(`🔍 File changed: ${relativePath}`, 'blue');
    this.log(`📝 File type: ${fileType}`, 'cyan');

    // Debounce to avoid too many rapid fixes
    this.debounce(
      `fix-${filePath}`,
      () => {
        try {
          this.executeFix(fileType, filePath);
        } catch (error) {
          this.log(`❌ Auto-fix failed: ${error.message}`, 'red');
        }
      },
      1500
    ); // 1.5 second delay
  }

  executeFix(fileType, filePath) {
    const relativePath = path.relative(process.cwd(), filePath);

    switch (fileType) {
      case 'js':
        this.log(`🔧 Running ESLint fix for ${relativePath}...`, 'yellow');
        execSync(`npx eslint --fix "${filePath}"`, { stdio: 'pipe' });
        execSync(`npx prettier --write "${filePath}"`, { stdio: 'pipe' });
        this.log(`✅ ${relativePath} fixed`, 'green');
        break;

      case 'py':
        this.log(`🔧 Running Python format for ${relativePath}...`, 'yellow');
        const pythonDir = path.dirname(filePath);
        execSync(`cd "${pythonDir}" && ..\\venv\\Scripts\\black "${filePath}"`, { stdio: 'pipe' });
        execSync(`cd "${pythonDir}" && ..\\venv\\Scripts\\isort --profile black "${filePath}"`, {
          stdio: 'pipe',
        });
        this.log(`✅ ${relativePath} fixed`, 'green');
        break;

      case 'css':
        this.log(`🔧 Running CSS format for ${relativePath}...`, 'yellow');
        execSync(
          `npx prettier --parser ${fileType === 'scss' ? 'scss' : 'css'} --write "${filePath}"`,
          { stdio: 'pipe' }
        );
        this.log(`✅ ${relativePath} fixed`, 'green');
        break;

      case 'md':
        this.log(`🔧 Running Markdown format for ${relativePath}...`, 'yellow');
        execSync(`npx prettier --parser markdown --write "${filePath}"`, { stdio: 'pipe' });
        this.log(`✅ ${relativePath} fixed`, 'green');
        break;

      case 'json':
        this.log(`🔧 Running JSON format for ${relativePath}...`, 'yellow');
        execSync(`npx prettier --parser json --write "${filePath}"`, { stdio: 'pipe' });
        this.log(`✅ ${relativePath} fixed`, 'green');
        break;

      case 'yaml':
        this.log(`🔧 Running YAML format for ${relativePath}...`, 'yellow');
        execSync(`npx prettier --parser yaml --write "${filePath}"`, { stdio: 'pipe' });
        this.log(`✅ ${relativePath} fixed`, 'green');
        break;

      case 'html':
        this.log(`🔧 Running HTML format for ${relativePath}...`, 'yellow');
        execSync(`npx prettier --parser html --write "${filePath}"`, { stdio: 'pipe' });
        this.log(`✅ ${relativePath} fixed`, 'green');
        break;

      case 'sh':
        this.log(`🔧 Running Shell format for ${relativePath}...`, 'yellow');
        execSync(`npx shfmt -i 2 -ci -w "${filePath}"`, { stdio: 'pipe' });
        this.log(`✅ ${relativePath} fixed`, 'green');
        break;

      default:
        this.log(`⚠️ Unknown file type for ${relativePath}`, 'yellow');
    }
  }

  watchDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    try {
      fs.watch(dirPath, { persistent: true }, (eventType, filename) => {
        if (!filename) return;

        const filePath = path.join(dirPath, filename);
        const stats = fs.statSync(filePath);

        if (stats.isFile() && this.shouldWatchFile(filePath)) {
          this.runAutoFix(filePath);
        } else if (stats.isDirectory() && !this.watchedDirs.has(filePath)) {
          // Watch new subdirectories
          this.watchedDirs.add(filePath);
          this.watchDirectory(filePath);
        }
      });

      this.watchedDirs.add(dirPath);
      this.log(`👀 Watching directory: ${dirPath}`, 'green');
    } catch (error) {
      this.log(`❌ Error watching directory ${dirPath}: ${error.message}`, 'red');
    }
  }

  startWatching(directories = ['.']) {
    this.log('🚀 Starting file watcher...', 'bright');
    this.log('📁 Monitoring for file changes...', 'cyan');

    directories.forEach((dir) => {
      const fullPath = path.resolve(dir);
      this.watchDirectory(fullPath);
    });

    this.log('✅ File watcher is active! Press Ctrl+C to stop.', 'green');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.log('🛑 Shutting down file watcher...', 'yellow');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.log('🛑 Shutting down file watcher...', 'yellow');
      process.exit(0);
    });
  }

  // Cursor AI integration method
  integrateWithCursorAI() {
    this.log('🤖 Integrating with Cursor AI...', 'magenta');

    // Create a simple API endpoint that Cursor AI can call
    const apiScript = `
const http = require('http');
const { execSync } = require('child_process');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/auto-fix' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { filePath } = data;
        
        if (filePath) {
          execSync(\`node scripts/auto-fix-all.js "\${filePath}"\`, { stdio: 'inherit' });
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, message: 'File auto-fixed' }));
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, message: 'filePath required' }));
        }
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, message: error.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ success: false, message: 'Not found' }));
  }
});

const port = 3456;
server.listen(port, () => {
  console.log(\`Auto-fix API server running on port \${port}\`);
});`;

    fs.writeFileSync('scripts/cursor-ai-api.js', apiScript);
    this.log('📡 Cursor AI API server created at scripts/cursor-ai-api.js', 'green');
  }
}

// CLI interface
if (require.main === module) {
  const watcher = new FileWatcher();
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
File Watcher Auto-Fix Script

Usage: node file-watcher-auto-fix.js [options]

Options:
  --dirs <paths>        Watch specific directories (comma-separated)
  --cursor-ai          Create Cursor AI integration API
  --help, -h           Show this help message

Examples:
  node file-watcher-auto-fix.js
  node file-watcher-auto-fix.js --dirs "components,pages,composables"
  node file-watcher-auto-fix.js --cursor-ai

The watcher will automatically:
  - Detect file changes
  - Run appropriate auto-fix tools
  - Provide real-time feedback
  - Integrate with Cursor AI if requested
    `);
    process.exit(0);
  }

  if (args.includes('--cursor-ai')) {
    watcher.integrateWithCursorAI();
    process.exit(0);
  }

  // Parse directories
  const dirsIndex = args.indexOf('--dirs');
  const directories = dirsIndex !== -1 ? args[dirsIndex + 1].split(',') : ['.'];

  watcher.startWatching(directories);
}

module.exports = FileWatcher;
