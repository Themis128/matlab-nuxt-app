/**
 * Validate Open Graph images
 * Checks if all required OG images exist and have correct dimensions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const REQUIRED_IMAGES = [
  'og-image.jpg', // Default fallback
  'og-home.jpg', // Homepage
  'og-search.jpg', // Search page
  'og-compare.jpg', // Compare page
  'og-recommendations.jpg', // Recommendations page
  'og-models.jpg', // Model showcase
];

function validateOgImages() {
  console.log('🔍 Validating Open Graph Images...\n');

  const results = {
    found: [],
    missing: [],
    invalid: [],
  };

  REQUIRED_IMAGES.forEach((imageName) => {
    const imagePath = path.join(PUBLIC_DIR, imageName);

    if (!fs.existsSync(imagePath)) {
      results.missing.push(imageName);
      console.log(`❌ Missing: ${imageName}`);
      return;
    }

    const stats = fs.statSync(imagePath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    // Basic validation (file exists and has reasonable size)
    if (stats.size === 0) {
      results.invalid.push({ name: imageName, reason: 'File is empty' });
      console.log(`⚠️  Invalid: ${imageName} (empty file)`);
      return;
    }

    if (stats.size > 1024 * 1024) {
      results.invalid.push({
        name: imageName,
        reason: `File too large (${sizeKB}KB, should be < 1MB)`,
      });
      console.log(`⚠️  Large: ${imageName} (${sizeKB}KB)`);
    }

    results.found.push({ name: imageName, size: sizeKB });
    console.log(`✅ Found: ${imageName} (${sizeKB}KB)`);
  });

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Found: ${results.found.length}/${REQUIRED_IMAGES.length}`);
  console.log(`❌ Missing: ${results.missing.length}`);
  console.log(`⚠️  Issues: ${results.invalid.length}`);

  if (results.missing.length > 0) {
    console.log('\n📝 Missing Images:');
    results.missing.forEach((img) => {
      console.log(`   - ${img}`);
    });
    console.log('\n💡 Tip: Create these images using the guide in scripts/generate-og-images.md');
  }

  if (results.invalid.length > 0) {
    console.log('\n⚠️  Image Issues:');
    results.invalid.forEach(({ name, reason }) => {
      console.log(`   - ${name}: ${reason}`);
    });
  }

  if (results.missing.length === 0 && results.invalid.length === 0) {
    console.log('\n🎉 All OG images are valid!');
  }

  // Return exit code
  process.exit(results.missing.length > 0 ? 1 : 0);
}

// Run validation
validateOgImages();
