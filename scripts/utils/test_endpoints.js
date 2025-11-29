/**
 * Test Script for New API Endpoints
 * Run with: node test_endpoints.js
 */

/* eslint-disable no-console */

const BASE_URL = 'http://localhost:3000'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
}

async function testEndpoint(name, method, url, body = null) {
  process.stdout.write(`Testing ${name}... `)

  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (response.ok) {
      console.log(`${colors.green}✓ PASS${colors.reset} (HTTP ${response.status})`)
      return { success: true, data }
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} (HTTP ${response.status})`)
      console.log(`  Error: ${data.message || 'Unknown error'}`)
      return { success: false, error: data }
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} (Connection Error)`)
    console.log(`  Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('🧪 Testing API Endpoints...\n')

  const results = {
    passed: 0,
    failed: 0,
  }

  // Test 1: Advanced Search
  console.log('1. Testing Advanced Search Endpoint')
  const search1 = await testEndpoint(
    'Advanced Search (Samsung, $500-$800)',
    'GET',
    `${BASE_URL}/api/dataset/search?brand=Samsung&minPrice=500&maxPrice=800&limit=5`
  )
  if (search1.success) results.passed++
  else results.failed++

  const search2 = await testEndpoint(
    'Advanced Search (8GB+ RAM)',
    'GET',
    `${BASE_URL}/api/dataset/search?minRam=8&sortBy=price&sortOrder=asc&limit=5`
  )
  if (search2.success) results.passed++
  else results.failed++

  console.log('')

  // Test 2: Model Details
  console.log('2. Testing Model Details Endpoint')
  const details1 = await testEndpoint(
    'Model Details (iPhone 16)',
    'GET',
    `${BASE_URL}/api/dataset/model/${encodeURIComponent('iPhone 16 128GB')}`
  )
  if (details1.success) results.passed++
  else results.failed++

  console.log('')

  // Test 3: Model Comparison
  console.log('3. Testing Model Comparison Endpoint')
  const compare = await testEndpoint('Compare Models', 'POST', `${BASE_URL}/api/dataset/compare`, {
    modelNames: ['iPhone 16 128GB', 'Samsung Galaxy S24'],
  })
  if (compare.success) results.passed++
  else results.failed++

  console.log('')

  // Test 4: Similar Models
  console.log('4. Testing Similar Models Endpoint')
  const similar = await testEndpoint('Similar Models', 'POST', `${BASE_URL}/api/dataset/similar`, {
    ram: 8,
    battery: 4000,
    screenSize: 6.1,
    weight: 174,
    year: 2024,
    price: 799,
    limit: 5,
  })
  if (similar.success) results.passed++
  else results.failed++

  console.log('')

  // Test 5: Existing Endpoints
  console.log('5. Testing Existing Endpoints')
  const price = await testEndpoint(
    'Models by Price',
    'GET',
    `${BASE_URL}/api/dataset/models-by-price?price=800&tolerance=0.2&maxResults=5`
  )
  if (price.success) results.passed++
  else results.failed++

  const stats = await testEndpoint(
    'Dataset Statistics',
    'GET',
    `${BASE_URL}/api/dataset/statistics`
  )
  if (stats.success) results.passed++
  else results.failed++

  console.log('')
  console.log('='.repeat(50))
  console.log(`✅ Tests Passed: ${colors.green}${results.passed}${colors.reset}`)
  console.log(`❌ Tests Failed: ${colors.red}${results.failed}${colors.reset}`)
  console.log('='.repeat(50))

  if (results.failed === 0) {
    console.log(
      `\n${colors.green}🎉 All tests passed! Your endpoints are working correctly!${colors.reset}`
    )
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Check the errors above.${colors.reset}`)
    console.log('Make sure:')
    console.log('  1. Nuxt server is running (npm run dev)')
    console.log('  2. Dataset file exists (Mobiles Dataset (2025).csv)')
    console.log('  3. Check error messages above')
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('Error: fetch is not available. Please use Node.js 18+ or install node-fetch')
  process.exit(1)
}

runTests().catch(error => {
  console.error('Test runner error:', error)
  process.exit(1)
})
