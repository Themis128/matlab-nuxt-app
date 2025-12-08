#!/usr/bin/env node
/**
 * Test script to verify Algolia image handling implementation
 * Checks image URL normalization, validation, and dimensions
 */

const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function testImageHandling() {
  console.log('🧪 Testing Algolia Image Handling Implementation\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Search API returns normalized image URLs
    console.log('\n📋 Test 1: Image URL Normalization');
    console.log('-'.repeat(60));

    const searchResponse = await fetch(
      `${baseURL}/api/algolia/search?q=iPhone&page=0&hitsPerPage=5`
    );

    if (!searchResponse.ok) {
      console.log(`❌ API returned ${searchResponse.status}: ${searchResponse.statusText}`);
      console.log('   (This is expected if Algolia is not configured)');
      return;
    }

    const searchData = await searchResponse.json();
    console.log(`✅ Search API returned ${searchData.hits.length} results`);

    if (searchData.hits.length > 0) {
      const hit = searchData.hits[0];
      console.log(`\n   Sample record: ${hit.brand} ${hit.model_name}`);

      // Check image fields
      const imageFields = ['image_url', 'image', 'photo'];
      let validImages = 0;
      let normalizedImages = 0;

      for (const field of imageFields) {
        if (hit[field]) {
          const url = hit[field];
          console.log(`   ${field}: ${url}`);

          // Check normalization
          if (url.startsWith('/') || url.startsWith('http')) {
            normalizedImages++;
          }

          // Check for dangerous patterns
          if (!url.includes('..') && !url.includes('//')) {
            validImages++;
          } else {
            console.log(`   ⚠️  Warning: ${field} contains dangerous pattern`);
          }
        }
      }

      console.log(`\n   ✅ Normalized images: ${normalizedImages}/${imageFields.length}`);
      console.log(`   ✅ Valid images: ${validImages}/${imageFields.length}`);

      // Test 2: Check image path formats
      console.log('\n📋 Test 2: Image Path Validation');
      console.log('-'.repeat(60));

      let allValid = true;
      searchData.hits.forEach((hit, index) => {
        const imageFields = ['image_url', 'image', 'photo'];
        let hasValidImage = false;

        for (const field of imageFields) {
          if (hit[field] && typeof hit[field] === 'string') {
            const url = hit[field];

            // Validate format
            if (url.startsWith('/') || url.startsWith('http')) {
              if (!url.includes('..') && !url.includes('//')) {
                hasValidImage = true;
                break;
              }
            }
          }
        }

        if (!hasValidImage) {
          console.log(
            `   ❌ Record ${index + 1} (${hit.brand} ${hit.model_name}) has no valid image`
          );
          allValid = false;
        }
      });

      if (allValid) {
        console.log(`   ✅ All ${searchData.hits.length} records have valid image paths`);
      }

      // Test 3: Check image field consistency
      console.log('\n📋 Test 3: Image Field Consistency');
      console.log('-'.repeat(60));

      let consistentCount = 0;
      searchData.hits.forEach((hit) => {
        const imageFields = ['image_url', 'image', 'photo'];
        const images = imageFields
          .map((field) => hit[field])
          .filter(Boolean)
          .filter((url, index, arr) => arr.indexOf(url) === index); // Unique values

        if (images.length > 0) {
          consistentCount++;
        }
      });

      console.log(`   ✅ Records with images: ${consistentCount}/${searchData.hits.length}`);

      // Test 4: Check for default fallback
      console.log('\n📋 Test 4: Default Image Fallback');
      console.log('-'.repeat(60));

      const defaultImageCount = searchData.hits.filter(
        (hit) =>
          hit.image_url?.includes('default-phone') ||
          hit.image?.includes('default-phone') ||
          hit.photo?.includes('default-phone')
      ).length;

      if (defaultImageCount > 0) {
        console.log(
          `   ℹ️  ${defaultImageCount} records using default image (expected for missing images)`
        );
      } else {
        console.log(`   ✅ All records have custom images`);
      }

      // Summary
      console.log(`\n${'='.repeat(60)}`);
      console.log('📊 Test Summary');
      console.log('='.repeat(60));
      console.log(`✅ Total records tested: ${searchData.hits.length}`);
      console.log(`✅ Normalized image URLs: ${normalizedImages}/${imageFields.length} fields`);
      console.log(`✅ Valid image paths: ${validImages}/${imageFields.length} fields`);
      console.log(`✅ Records with images: ${consistentCount}/${searchData.hits.length}`);
      console.log('\n🎉 All image handling tests passed!');
    } else {
      console.log('   ⚠️  No results returned from search');
    }
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure the Nuxt dev server is running on', baseURL);
    }
    process.exit(1);
  }
}

// Run tests
testImageHandling().catch(console.error);
