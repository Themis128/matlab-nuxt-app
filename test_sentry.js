// Simple script to test Sentry integration
const puppeteer = require('puppeteer')

async function testSentry() {
  console.warn('🚀 Starting Sentry test...')

  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  } catch (error) {
    console.error('❌ Failed to launch browser:', error.message)
    return
  }

  try {
    const page = await browser.newPage()

    // Set up console logging to capture Sentry messages
    page.on('console', msg => {
      if (msg.text().includes('Sentry')) {
        console.warn('📊 Sentry:', msg.text())
      }
    })

    console.warn('🌐 Navigating to Sentry test page...')
    await page.goto('http://localhost:3000/sentry-example-page', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    console.warn('✅ Page loaded successfully')

    // Wait for page to be fully interactive
    await page.waitForSelector('#errorBtn', { timeout: 10000 })
    console.warn('🎯 Found error button')

    // Click the first error button to trigger a test error
    console.warn('🚨 Clicking error button to trigger test error...')
    await page.click('#errorBtn')

    // Wait a bit for Sentry to process the error
    await new Promise(resolve => setTimeout(resolve, 3000))

    console.warn('✅ Test error triggered successfully')
    console.warn(
      '📋 Check your Sentry dashboard at: https://sentry.io/organizations/baltzakisthemiscom/issues/'
    )
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await browser.close()
  }
}

testSentry().catch(console.error)
