/**
 * Setup Dashboard Images
 *
 * This script copies visualization images from docs/images/ to public/images/
 * for use in the Nuxt.js dashboard.
 */

/* eslint-disable no-console */

import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs'
import { join } from 'path'

const sourceDir = 'docs/images'
const targetDir = 'public/images'

// Images needed for the dashboard
const requiredImages = [
  'enhanced-models-comparison.png',
  'model-improvements.png',
  'performance-dashboard.png',
  'enhanced-price-prediction.png',
  'network-visualization.png',
  'training-progress.png',
  'dataset-analysis.png',
  'model-comparison.png',
  'price-prediction.png',
]

console.log('🖼️  Setting up dashboard images...\n')

// Create target directory if it doesn't exist
if (!existsSync(targetDir)) {
  console.log(`📁 Creating directory: ${targetDir}`)
  mkdirSync(targetDir, { recursive: true })
}

// Check if source directory exists
if (!existsSync(sourceDir)) {
  console.error(`❌ Source directory not found: ${sourceDir}`)
  console.log('Please ensure the docs/images/ directory exists with your visualization images.')
  process.exit(1)
}

// Get all PNG files from source directory
const sourceFiles = readdirSync(sourceDir).filter(file => file.endsWith('.png'))

if (sourceFiles.length === 0) {
  console.warn('⚠️  No PNG files found in source directory.')
  console.log(`Source directory: ${sourceDir}`)
  process.exit(1)
}

console.log(`📂 Found ${sourceFiles.length} image(s) in source directory\n`)

// Copy images
let copied = 0
let skipped = 0
let missing = []

for (const image of requiredImages) {
  const sourcePath = join(sourceDir, image)
  const targetPath = join(targetDir, image)

  if (existsSync(sourcePath)) {
    try {
      copyFileSync(sourcePath, targetPath)
      console.log(`✅ Copied: ${image}`)
      copied++
    } catch (error) {
      console.error(`❌ Error copying ${image}:`, error.message)
    }
  } else {
    if (sourceFiles.includes(image)) {
      // File exists but path might be different
      console.log(`⚠️  Not found: ${image} (but similar files exist)`)
    } else {
      missing.push(image)
    }
    skipped++
  }
}

// Copy any additional images
for (const file of sourceFiles) {
  if (!requiredImages.includes(file)) {
    const sourcePath = join(sourceDir, file)
    const targetPath = join(targetDir, file)
    try {
      copyFileSync(sourcePath, targetPath)
      console.log(`✅ Copied (additional): ${file}`)
      copied++
    } catch (error) {
      console.error(`❌ Error copying ${file}:`, error.message)
    }
  }
}

console.log('\n📊 Summary:')
console.log(`   ✅ Copied: ${copied} image(s)`)
console.log(`   ⚠️  Skipped: ${skipped} image(s)`)

if (missing.length > 0) {
  console.log('\n⚠️  Missing required images:')
  missing.forEach(img => console.log(`   - ${img}`))
  console.log('\n💡 Tip: Generate missing images using:')
  console.log('   cd mobiles-dataset-docs')
  console.log("   run('generate_enhanced_visualizations.m')")
}

console.log(`\n🎉 Dashboard images setup complete!`)
console.log(`📁 Images are now in: ${targetDir}`)
console.log(`\n🚀 Next steps:`)
console.log(`   1. Start dev server: npm run dev`)
console.log(`   2. Visit: http://localhost:3000/dashboard`)
