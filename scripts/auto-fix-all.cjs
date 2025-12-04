#!/usr/bin/env node

/**
 * Comprehensive Auto-Fix Script
 * Automatically fixes linting and formatting issues across all file types
 * Supports integration with Cursor AI and file watchers
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

class AutoFixer {
  constructor () {
    this.logs = []
    this.fixedFiles = []
    this.failedFiles = []
  }

  log (message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`)
    this.logs.push({ message, color, timestamp: new Date().toISOString() })
  }

  executeCommand (command, description) {
    try {
      this.log(`🔧 ${description}...`, 'cyan')
      execSync(command, { stdio: 'inherit' })
      this.log(`✅ ${description} completed`, 'green')
      return true
    } catch (error) {
      this.log(`❌ ${description} failed`, 'red')
      this.log(error.message, 'red')
      return false
    }
  }

  fixJavaScriptTypeScript () {
    this.log('📝 Fixing JavaScript/TypeScript files...', 'blue')

    const jsTsFiles = 'components/**/*.{js,ts,vue,jsx,tsx} composables/**/*.{js,ts,vue,jsx,tsx} pages/**/*.{js,ts,vue,jsx,tsx} plugins/**/*.{js,ts,vue,jsx,tsx} server/**/*.{js,ts,vue,jsx,tsx}'

    const commands = [
      { cmd: `npx eslint --fix ${jsTsFiles}`, desc: 'ESLint auto-fix' },
      { cmd: `npx prettier --write ${jsTsFiles}`, desc: 'Prettier formatting' },
      { cmd: 'npx tsc --noEmit --skipLibCheck', desc: 'TypeScript check' }
    ]

    commands.forEach(cmd => this.executeCommand(cmd.cmd, cmd.desc))
  }

  fixPython () {
    this.log('🐍 Fixing Python files...', 'blue')

    const pyFiles = 'python_api/**/*.py scripts/**/*.py'

    const commands = [
      { cmd: 'cd python_api && ..\\venv\\Scripts\\black --line-length=88 .', desc: 'Black formatting' },
      { cmd: 'cd python_api && ..\\venv\\Scripts\\isort --profile black .', desc: 'Import sorting' },
      { cmd: 'cd python_api && ..\\venv\\Scripts\\autopep8 --max-line-length=88 --in-place --recursive .', desc: 'AutoPEP8 formatting' }
    ]

    commands.forEach(cmd => this.executeCommand(cmd.cmd, cmd.desc))
  }

  fixJSONHTML () {
    this.log('📄 Fixing JSON/HTML files...', 'blue')

    const jsonHtmlFiles = '*.{json,html,htm} components/**/*.{json,html,htm} pages/**/*.{json,html,htm}'

    const commands = [
      { cmd: 'npx prettier --parser json --write **/*.{json}', desc: 'JSON formatting' },
      { cmd: 'npx prettier --parser html --write **/*.{html,htm}', desc: 'HTML formatting' }
    ]

    commands.forEach(cmd => this.executeCommand(cmd.cmd, cmd.desc))
  }

  fixYAML () {
    this.log('📋 Fixing YAML files...', 'blue')

    const yamlFiles = '*.{yml,yaml} .github/**/*.{yml,yaml} deployment/**/*.{yml,yaml}'

    const commands = [
      { cmd: 'npx prettier --parser yaml --write **/*.{yml,yaml}', desc: 'YAML formatting' },
      { cmd: 'yamllint --fix **/*.{yml,yaml}', desc: 'YAML linting' }
    ]

    commands.forEach(cmd => this.executeCommand(cmd.cmd, cmd.desc))
  }

  fixCSSStyles () {
    this.log('🎨 Fixing CSS/Styles files...', 'blue')

    const cssFiles = '*.{css,scss,sass,less,styl} assets/**/*.{css,scss,sass,less,styl} components/**/*.{css,scss,sass,less,styl}'

    const commands = [
      { cmd: 'npx prettier --parser css --write **/*.{css,scss,sass,less,styl}', desc: 'CSS formatting' }
    ]

    commands.forEach(cmd => this.executeCommand(cmd.cmd, cmd.desc))
  }

  fixMarkdown () {
    this.log('📖 Fixing Markdown files...', 'blue')

    const mdFiles = '*.md docs/**/*.md pages/**/*.md'

    const commands = [
      { cmd: 'npx prettier --parser markdown --write **/*.md', desc: 'Markdown formatting' }
    ]

    commands.forEach(cmd => this.executeCommand(cmd.cmd, cmd.desc))
  }

  fixShellScripts () {
    this.log('🐚 Fixing Shell scripts...', 'blue')

    const shellFiles = '*.{sh,bash,zsh,fish} scripts/**/*.{sh,bash,zsh,fish}'

    const commands = [
      { cmd: 'npx shfmt -i 2 -ci -w **/*.{sh,bash,zsh,fish}', desc: 'Shell script formatting' }
    ]

    commands.forEach(cmd => this.executeCommand(cmd.cmd, cmd.desc))
  }

  fixConfigFiles () {
    this.log('⚙️ Fixing Configuration files...', 'blue')

    const configFiles = '*.{toml,ini,cfg,conf,properties}'

    const commands = [
      { cmd: 'npx prettier --parser ini --write **/*.{toml,ini,cfg,conf,properties}', desc: 'Config file formatting' }
    ]

    commands.forEach(cmd => this.executeCommand(cmd.cmd, cmd.desc))
  }

  runTypeScriptCheck () {
    this.log('🔍 Running TypeScript checks...', 'blue')

    const commands = [
      { cmd: 'npx vue-tsc --project tsconfig.ci.json --noEmit', desc: 'Vue TypeScript check' },
      { cmd: 'npx tsc -p tsconfig.ci.json --noEmit', desc: 'General TypeScript check' }
    ]

    commands.forEach(cmd => this.executeCommand(cmd.cmd, cmd.desc))
  }

  generateReport () {
    this.log('📊 Generating auto-fix report...', 'yellow')

    const report = {
      timestamp: new Date().toISOString(),
      fixedFiles: this.fixedFiles,
      failedFiles: this.failedFiles,
      logs: this.logs
    }

    const reportPath = 'auto-fix-report.json'
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    this.log(`📄 Report saved to: ${reportPath}`, 'green')
    this.log(`📊 Total logs: ${this.logs.length}`, 'cyan')
  }

  async runAll () {
    this.log('🚀 Starting comprehensive auto-fix process...', 'bright')

    const startTime = Date.now()

    // Fix all file types
    this.fixJavaScriptTypeScript()
    this.fixPython()
    this.fixJSONHTML()
    this.fixYAML()
    this.fixCSSStyles()
    this.fixMarkdown()
    this.fixShellScripts()
    this.fixConfigFiles()

    // Run type checking
    this.runTypeScriptCheck()

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    this.log(`🎉 Auto-fix process completed in ${duration}s`, 'green')
    this.generateReport()
  }
}

// CLI interface
if (require.main === module) {
  const fixer = new AutoFixer()
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Comprehensive Auto-Fix Script

Usage: node auto-fix-all.js [options]

Options:
  --js, --typescript    Fix JavaScript/TypeScript files only
  --python              Fix Python files only  
  --json, --html        Fix JSON/HTML files only
  --yaml                Fix YAML files only
  --css                 Fix CSS/Styles files only
  --md, --markdown      Fix Markdown files only
  --shell               Fix Shell scripts only
  --config              Fix Configuration files only
  --check               Run type checks only
  --all, --everything   Fix all file types (default)
  --help, -h            Show this help message

Integration:
  Can be called from file watchers, pre-commit hooks, or Cursor AI extensions
    `)
    process.exit(0)
  }

  if (args.includes('--js') || args.includes('--typescript')) {
    fixer.fixJavaScriptTypeScript()
  } else if (args.includes('--python')) {
    fixer.fixPython()
  } else if (args.includes('--json') || args.includes('--html')) {
    fixer.fixJSONHTML()
  } else if (args.includes('--yaml')) {
    fixer.fixYAML()
  } else if (args.includes('--css')) {
    fixer.fixCSSStyles()
  } else if (args.includes('--md') || args.includes('--markdown')) {
    fixer.fixMarkdown()
  } else if (args.includes('--shell')) {
    fixer.fixShellScripts()
  } else if (args.includes('--config')) {
    fixer.fixConfigFiles()
  } else if (args.includes('--check')) {
    fixer.runTypeScriptCheck()
  } else {
    // Default: fix everything
    fixer.runAll()
  }
}

module.exports = AutoFixer
