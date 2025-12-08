#!/usr/bin/env node
/**
 * Sync phone data with images to Algolia
 * This script fetches phone data from the API and indexes it with proper image URLs
 */

import { algoliasearch } from 'algoliasearch';
import { existsSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

// Load .env file if it exists
function loadEnvFile() {
  const envPath = join(projectRoot, '.env');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

// Load environment variables from .env
loadEnvFile();

// Parse command line arguments
const args = process.argv.slice(2);
const opts = {};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--dry-run' || a === '-d') {
    opts.dryRun = true;
  } else if (a === '--index' || a === '-i') {
    opts.index = args[++i];
  } else if (a === '--appId') {
    opts.appId = args[++i];
  } else if (a === '--apiKey') {
    opts.apiKey = args[++i];
  } else if (a === '--base-url') {
    opts.baseURL = args[++i];
  } else if (a === '--help' || a === '-h') {
    console.log('Usage: npm run algolia:sync-phones [options]');
    console.log('\nOptions:');
    console.log(
      '  --dry-run, -d     Validate and show what would be indexed without actually indexing'
    );
    console.log('  --index, -i       Algolia index name (default: phones_index)');
    console.log('  --appId           Algolia Application ID');
    console.log('  --apiKey          Algolia Admin API Key');
    console.log('  --base-url        Base URL for API (default: http://localhost:3000)');
    console.log('  --help, -h        Show this help message');
    console.log('\nEnvironment variables:');
    console.log('  ALGOLIA_APP_ID           Algolia Application ID');
    console.log('  ALGOLIA_ADMIN_API_KEY     Algolia Admin API Key');
    console.log('  ALGOLIA_INDEX             Algolia index name (default: phones_index)');
    console.log('  NUXT_PUBLIC_API_URL       Base URL for API (default: http://localhost:3000)');
    process.exit(0);
  }
}

// Get Algolia credentials
// SECURITY: Credentials should be provided via environment variables in production.
// Command-line arguments are visible to other users on the system (process listing, shell history).
// Prefer environment variables (ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY) for security.
const appId = opts.appId || process.env.ALGOLIA_APP_ID;
const apiKey = opts.apiKey || process.env.ALGOLIA_ADMIN_API_KEY;

// Warn if credentials are passed via command line (less secure)
if (opts.apiKey && process.env.NODE_ENV === 'production') {
  console.warn(
    '⚠️  WARNING: API key passed via command line. This may be visible in process listing.'
  );
  console.warn('   Use environment variables (ALGOLIA_ADMIN_API_KEY) instead.');
}

// Warn if credentials are missing and not in dry-run mode
if (!opts.dryRun && !apiKey) {
  console.warn('⚠️  WARNING: ALGOLIA_ADMIN_API_KEY not found in environment variables.');
  console.warn('   Ensure secrets are not committed to source control.');
}
const indexName = opts.index || process.env.ALGOLIA_INDEX || 'phones_index';
const baseURL = opts.baseURL || process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000';

if (!opts.dryRun && (!appId || !apiKey)) {
  console.error(
    'Missing Algolia credentials. Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY environment variables.'
  );
  console.error('Or use --dry-run to test without credentials.');
  process.exit(1);
}

/**
 * Validate and normalize image path
 */
function normalizeImagePath(path) {
  if (!path || typeof path !== 'string') return null;

  let normalized = path.trim();

  // If it's already a full URL, return as-is
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  // Ensure relative paths start with /
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  // Remove duplicate slashes
  normalized = normalized.replace(/\/+/g, '/');

  // Reject dangerous paths
  if (normalized.includes('..') || normalized.includes('//')) {
    return null;
  }

  return normalized;
}

/**
 * Get image file stats if available
 */
function getImageStats(imagePath) {
  try {
    const fullPath = join(projectRoot, 'public', imagePath.replace(/^\//, ''));
    if (existsSync(fullPath)) {
      const stats = statSync(fullPath);
      return {
        exists: true,
        size: stats.size,
        path: imagePath,
      };
    }
  } catch {
    // Ignore errors
  }
  return { exists: false, path: imagePath };
}

/**
 * Find image path for a phone model with validation
 */
function findImagePath(company, modelName) {
  if (!company || !modelName) return null;

  // Sanitize model name for file system
  const sanitizedName = `${company}_${modelName}`
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 100);

  const imageDir = join(projectRoot, 'public', 'mobile_images');
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  // Try different naming patterns
  const patterns = [
    sanitizedName,
    `${company}_${modelName.replace(/\s+/g, '_')}`,
    modelName.replace(/\s+/g, '_'),
  ];

  // Try flat file pattern first
  for (const pattern of patterns) {
    for (const ext of imageExtensions) {
      const imagePath = join(imageDir, `${pattern}${ext}`);
      if (existsSync(imagePath)) {
        const normalized = normalizeImagePath(`/mobile_images/${pattern}${ext}`);
        if (normalized) return normalized;
      }
    }
  }

  // Try subdirectory pattern (e.g., Apple_iPhone_15_Pro/Apple_iPhone_15_Pro_1.jpg)
  for (const pattern of patterns) {
    const subDir = join(imageDir, pattern);
    if (existsSync(subDir)) {
      for (const ext of imageExtensions) {
        const imagePath = join(subDir, `${pattern}_1${ext}`);
        if (existsSync(imagePath)) {
          const normalized = normalizeImagePath(`/mobile_images/${pattern}/${pattern}_1${ext}`);
          if (normalized) return normalized;
        }
      }
    }
  }

  return null;
}

/**
 * Fetch products from API
 */
async function fetchProducts(limit = 1000) {
  try {
    const url = `${baseURL}/api/products?limit=${limit}`;
    console.log(`Fetching products from ${url}...`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Transform product to Algolia record
 */
function transformToAlgoliaRecord(product, index) {
  const modelName = product.model || 'Unknown Model';
  const company = product.company || 'Unknown Brand';

  // Find and validate image path
  let imageUrl = findImagePath(company, modelName) || product.image_url || null;

  // Normalize and validate the image URL
  if (imageUrl) {
    imageUrl = normalizeImagePath(imageUrl);
  }

  // Use default if no valid image found
  if (!imageUrl) {
    imageUrl = '/mobile_images/default-phone.png';
  }

  // Validate the final path exists (for local paths)
  if (imageUrl.startsWith('/mobile_images/') && !imageUrl.includes('default-phone')) {
    const imageStats = getImageStats(imageUrl);
    if (!imageStats.exists) {
      console.warn(`Image not found: ${imageUrl}, using default for ${company} ${modelName}`);
      imageUrl = '/mobile_images/default-phone.png';
    }
  }

  // Get price (prefer USA, fallback to others)
  const price =
    product.price_usa || product.price_dubai || product.price_india || product.price || 0;

  // Parse numeric fields
  const ram = parseInt(product.ram) || 0;
  const battery = parseInt(product.battery) || 0;
  const screen = parseFloat(product.screen_size) || 0;
  const storage = parseInt(product.storage) || 0;
  const year = parseInt(product.launched_year) || new Date().getFullYear();

  // Create searchable text
  const searchableText =
    `${company} ${modelName} ${product.processor || ''} ${product.display_type || ''}`.trim();

  return {
    objectID: String(product.id || `phone-${index}`),
    title: modelName,
    model_name: modelName,
    brand: company,
    company,
    price,
    ram,
    battery,
    screen,
    screen_size: screen,
    storage,
    processor: product.processor || '',
    year,
    launched_year: year,
    weight: parseFloat(product.weight) || 0,
    front_camera: product.front_camera || '',
    back_camera: product.back_camera || '',
    display_type: product.display_type || '',
    image_url: imageUrl,
    image: imageUrl,
    photo: imageUrl,
    _tags: ['phone', 'mobile', company.toLowerCase()],
    _searchableText: searchableText,
  };
}

/**
 * Main sync function
 */
async function syncPhonesToAlgolia() {
  console.log('Starting Algolia phone sync with images...');
  if (opts.dryRun) {
    console.log('🔍 DRY RUN MODE - No actual indexing will be performed');
  }
  console.log(`Index: ${indexName}`);
  console.log(`Base URL: ${baseURL}`);

  try {
    // Initialize Algolia client (only if not dry run)
    const client = opts.dryRun ? null : algoliasearch(appId, apiKey);

    // Fetch products
    const products = await fetchProducts(10000); // Fetch up to 10k products
    console.log(`Fetched ${products.length} products from API`);

    if (products.length === 0) {
      console.error('No products found to index');
      process.exit(1);
    }

    // Transform products to Algolia records
    console.log('Transforming products to Algolia records...');
    const records = products.map((product, index) => transformToAlgoliaRecord(product, index));

    // Count records with images
    const recordsWithImages = records.filter(
      (r) => r.image_url && !r.image_url.includes('default-phone')
    );
    console.log(`Records with images: ${recordsWithImages.length} / ${records.length}`);

    // Show sample records
    console.log('\nSample records:');
    records.slice(0, 5).forEach((record, i) => {
      console.log(`  ${i + 1}. ${record.brand} ${record.title}`);
      console.log(`     Image: ${record.image_url}`);
      console.log(
        `     Price: $${record.price}, RAM: ${record.ram}GB, Battery: ${record.battery}mAh`
      );
    });

    if (opts.dryRun) {
      console.log(`\n🔍 DRY RUN: Would index ${records.length} records into index '${indexName}'`);
      console.log(`📊 Records with images: ${recordsWithImages.length}`);
      console.log(`📊 Records with default image: ${records.length - recordsWithImages.length}`);
      console.log('\nDRY RUN: No actual indexing performed');
      return;
    }

    // Index records in batches
    const batchSize = 1000;
    console.log(`\nIndexing ${records.length} records in batches of ${batchSize}...`);

    let pos = 0;
    while (pos < records.length) {
      const chunk = records.slice(pos, pos + batchSize);
      console.log(`Uploading records ${pos} - ${pos + chunk.length - 1}...`);

      try {
        const res = await client.saveObjects({ indexName, objects: chunk });
        const resAny = res;

        // Wait for indexing to complete
        if (typeof client.waitForTask === 'function') {
          if (Array.isArray(resAny)) {
            for (const r of resAny) {
              if (r?.taskID) {
                await client.waitForTask({ indexName, taskID: r.taskID });
              }
            }
          } else if (resAny?.taskID) {
            await client.waitForTask({ indexName, taskID: resAny.taskID });
          }
        }

        console.log(`✓ Indexed batch ${Math.floor(pos / batchSize) + 1}`);
      } catch (error) {
        console.error(`Error indexing batch ${Math.floor(pos / batchSize) + 1}:`, error);
        throw error;
      }

      pos += batchSize;
    }

    console.log(`\n✅ Successfully indexed ${records.length} phone records with images!`);
    console.log(`📊 Records with images: ${recordsWithImages.length}`);
    console.log(`📊 Records with default image: ${records.length - recordsWithImages.length}`);

    // Update index settings for better search
    console.log('\nUpdating index settings...');
    await client.setSettings({
      indexName,
      indexSettings: {
        searchableAttributes: [
          'title',
          'model_name',
          'brand',
          'company',
          'processor',
          '_searchableText',
        ],
        attributesForFaceting: [
          'brand',
          'company',
          'ram',
          'battery',
          'year',
          'price',
          'filterOnly(processor)',
        ],
        customRanking: ['desc(year)', 'desc(price)'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      },
    });

    console.log('✅ Index settings updated!');
  } catch (error) {
    console.error('Error syncing to Algolia:', error);
    process.exit(1);
  }
}

// Run sync
syncPhonesToAlgolia().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(99);
});
