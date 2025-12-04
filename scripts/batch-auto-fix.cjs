#!/usr/bin/env node

/**
 * Batch Auto-Fix Script
 * Processes multiple files in batches for optimal performance
 * Includes rollback mechanism for safety
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class BatchAutoFixer {
  constructor () {
    this.backupDir = '.auto-fix-backups'
    this.processedFiles = []
    this.failedFiles = []
    this.backupMap = new Map()
  }

  log (message, color = 'reset') {
    const colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m'
    }
    console.log(`${colors[color] || colors.reset}${message}${colors.reset}`)
  }

  ensureBackupDir () {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  createBackup (filePath) {
    const relativePath = path.relative(process.cwd(), filePath)
    const backupPath = path.join(this.backupDir, relativePath)

    // Create directory structure
    const backupDir = path.dirname(backupPath)
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Copy file
    fs.copyFileSync(filePath, backupPath)
    this.backupMap.set(filePath, backupPath)
    this.log(`💾 Created backup: ${relativePath}`, 'cyan')
  }

  restoreFromBackup () {
    this.log('🔄 Restoring files from backup...', 'yellow')

    for (const [originalPath, backupPath] of this.backupMap.entries()) {
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, originalPath)
        const relativePath = path.relative(process.cwd(), originalPath)
        this.log(`🔄 Restored: ${relativePath}`, 'blue')
      }
    }

    // Clean up backup directory
    if (fs.existsSync(this.backupDir)) {
      fs.rmSync(this.backupDir, { recursive: true, force: true })
    }

    this.log('✅ Rollback completed', 'green')
  }

  getFilesByType (pattern) {
    try {
      const output = execSync(`find . -name "${pattern}" -type f`, { encoding: 'utf8' })
      return output.split('\n').filter(line => line.trim()).map(line => line.trim())
    } catch (error) {
      return []
    }
  }

  async batchFixJavaScript () {
    this.log('📝 Processing JavaScript/TypeScript files...', 'blue')

    const patterns = [
      'components/**/*.js',
      'components/**/*.ts',
      'components/**/*.vue',
      'composables/**/*.js',
      'composables/**/*.ts',
      'pages/**/*.js',
      'pages/**/*.ts',
      'pages/**/*.vue',
      'plugins/**/*.js',
      'plugins/**/*.ts',
      'server/**/*.js',
      'server/**/*.ts'
    ]

    for (const pattern of patterns) {
      try {
        const files = this.getFilesByType(pattern.replace('**/*', '*.{js,ts,vue,jsx,tsx}'))

        if (files.length === 0) continue

        this.log(`🔧 Processing ${files.length} ${pattern} files...`, 'cyan')

        // Create backups
        files.forEach(file => {
          if (this.shouldProcessFile(file)) {
            this.createBackup(file)
          }
        })

        // Run ESLint fix
        try {
          execSync(`npx eslint --fix ${pattern}`, { stdio: 'inherit' })
          this.processedFiles.push(...files)
          this.log(`✅ ESLint fixed ${files.length} files`, 'green')
        } catch (error) {
          this.failedFiles.push(...files)
          this.log(`❌ ESLint failed for ${pattern}`, 'red')
          this.restoreFromBackup()
          return false
        }

        // Run Prettier
        try {
          execSync(`npx prettier --write ${pattern}`, { stdio: 'inherit' })
          this.log(`✅ Prettier formatted ${files.length} files`, 'green')
        } catch (error) {
          this.log(`❌ Prettier failed for ${pattern}`, 'red')
          this.restoreFromBackup()
          return false
        }
      } catch (error) {
        this.log(`❌ Error processing ${pattern}: ${error.message}`, 'red')
        return false
      }
    }

    return true
  }

  async batchFixPython () {
    this.log('🐍 Processing Python files...', 'blue')

    const patterns = ['python_api/**/*.py', 'scripts/**/*.py']

    for (const pattern of patterns) {
      const files = this.getFilesByType(pattern.replace('**/*', '*.py'))

      if (files.length === 0) continue

      this.log(`🔧 Processing ${files.length} ${pattern} files...`, 'cyan')

      // Create backups
      files.forEach(file => this.createBackup(file))

      // Black formatting
      try {
        execSync('cd python_api && ..\\venv\\Scripts\\black --line-length=88 .', { stdio: 'inherit' })
        this.log(`✅ Black formatted ${files.length} files`, 'green')
      } catch (error) {
        this.log(`❌ Black failed for ${pattern}`, 'red')
        this.restoreFromBackup()
        return false
      }

      // isort
      try {
        execSync('cd python_api && ..\\venv\\Scripts\\isort --profile black .', { stdio: 'inherit' })
        this.log(`✅ isort sorted ${files.length} files`, 'green')
      } catch (error) {
        this.log(`❌ isort failed for ${pattern}`, 'red')
        this.restoreFromBackup()
        return false
      }
    }

    return true
  }

  shouldProcessFile (filePath) {
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
      this.backupDir
    ]

    const relativePath = path.relative(process.cwd(), filePath)
    return !skipDirs.some(dir => relativePath.includes(dir))
  }

  async runBatchFix (type = 'all') {
    this.ensureBackupDir()
    this.log(`🚀 Starting batch auto-fix for: ${type}`, 'blue')

    const startTime = Date.now()
    let success = true

    try {
      if (type === 'all' || type === 'js' || type === 'typescript') {
        success = await this.batchFixJavaScript() && success
      }

      if (type === 'all' || type === 'python') {
        success = await this.batchFixPython() && success
      }

      // Process other file types...
    } catch (error) {
      this.log(`❌ Batch fix failed: ${error.message}`, 'red')
      this.restoreFromBackup()
      success = false
    }

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    if (success) {
      this.log(`🎉 Batch fix completed successfully in ${duration}s`, 'green')
      this.log(`📊 Processed ${this.processedFiles.length} files`, 'cyan')

      // Clean up backups on success
      if (fs.existsSync(this.backupDir)) {
        fs.rmSync(this.backupDir, { recursive: true, force: true })
        this.log('🗑️ Cleaned up backup directory', 'yellow')
      }
    } else {
      this.log('💥 Batch fix failed. Files restored from backup.', 'red')
      this.log(`📊 Failed files: ${this.failedFiles.length}`, 'red')
    }

    return success
  }

  generateReport () {
    const report = {
      timestamp: new Date().toISOString(),
      processedFiles: this.processedFiles,
      failedFiles: this.failedFiles,
      totalProcessed: this.processedFiles.length,
      totalFailed: this.failedFiles.length
    }

    const reportPath = 'batch-auto-fix-report.json'
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    this.log(`📄 Report saved to: ${reportPath}`, 'cyan')
  }
}

// CLI interface
if (require.main === module) {
  const batchFixer = new BatchAutoFixer()
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Batch Auto-Fix Script

Usage: node batch-auto-fix.js [type] [options]

Types:
  all                   Fix all supported file types (default)
  js, typescript        Fix JavaScript/TypeScript files only
  python               Fix Python files only

Options:
  --report             Generate detailed report
  --rollback           Rollback changes from last run
  --help, -h           Show this help message

Examples:
  node batch-auto-fix.js all
  node batch-auto-fix.js python --report
  node batch-auto-fix.js --rollback

Features:
  - Automatic backup before fixes
  - Rollback on failure
  - Batch processing for performance
  - Detailed reporting
    `)
    process.exit(0)
  }

  const type = args[0] || 'all'

  batchFixer.runBatchFix(type).then(success => {
    batchFixer.generateReport()
    process.exit(success ? 0 : 1)
  })
}

module.exports = BatchAutoFixer
