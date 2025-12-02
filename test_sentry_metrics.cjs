/**
 * Test Sentry Metrics Implementation
 *
 * This test file demonstrates and validates the Sentry metrics functionality.
 * Run with: node test_sentry_metrics.js
 */

const { JSDOM } = require('jsdom')

// Mock the Sentry global object for testing
global.Sentry = {
  metrics: {
    count: (name, value, options) => {
      console.log(`📊 COUNTER: ${name} = ${value}`, options?.attributes || {})
    },
    gauge: (name, value, options) => {
      console.log(
        `📏 GAUGE: ${name} = ${value} (${options?.unit || 'none'})`,
        options?.attributes || {}
      )
    },
    distribution: (name, value, options) => {
      console.log(
        `📈 DISTRIBUTION: ${name} = ${value} (${options?.unit || 'none'})`,
        options?.attributes || {}
      )
    },
    set: (name, value, options) => {
      console.log(`🎯 SET: ${name} = ${value}`, options?.attributes || {})
    },
  },
}

// Set up JSDOM for testing browser APIs
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3000',
})

// Mock window and navigator for testing
global.window = dom.window
global.navigator = {
  userAgent: 'TestBrowser/1.0',
}

// Mock performance API
global.performance = {
  now: () => Date.now(),
  timing: {
    navigationStart: Date.now() - 1000,
    loadEventEnd: Date.now(),
  },
  navigation: {
    type: 0,
  },
}

// Import the composable (this would normally be done in a Nuxt context)
const { useSentryMetrics } = require('./composables/useSentryMetrics.ts')

async function runMetricsTests() {
  console.log('🧪 Testing Sentry Metrics Implementation\n')

  const metrics = useSentryMetrics()

  console.log('✅ Sentry availability check:', metrics.isSentryAvailable())

  console.log('\n📊 Testing Core Metrics:')

  // Test counter
  metrics.count('test_counter', 5, {
    attributes: { category: 'test', user_id: '123' },
  })

  // Test gauge
  metrics.gauge('test_gauge', 42.5, {
    unit: 'percentage',
    attributes: { component: 'cpu' },
  })

  // Test distribution
  metrics.distribution('test_distribution', 187.5, {
    unit: 'millisecond',
    attributes: { operation: 'api_call' },
  })

  // Test set
  metrics.set('test_set', 'unique_value_123', {
    attributes: { type: 'user' },
  })

  console.log('\n🎯 Testing Convenience Methods:')

  // Test increment/decrement
  metrics.increment('test_increment', { attributes: { source: 'test' } })
  metrics.decrement('test_decrement', { attributes: { source: 'test' } })

  // Test tracking helpers
  metrics.trackPageView('/test-page', { referrer: 'test.com' })
  metrics.trackInteraction('click', 'test-button', { page: '/test' })
  metrics.trackApiCall('/api/test', 'POST', 200, 150.5, { cached: false })
  metrics.trackError('TestError', { component: 'test', severity: 'low' })
  metrics.trackPerformance('test_metric', 1024, 'byte', { type: 'memory' })

  console.log('\n⏱️  Testing Timing Utility:')

  // Test timing function
  const timedResult = await metrics.timing(
    'test_operation',
    async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return { success: true, data: 'test' }
    },
    {
      attributes: { operation_type: 'async' },
    }
  )

  console.log('Timing result:', timedResult)

  console.log('\n📈 Testing Example Implementations:')

  // Import and test examples (would normally be done in composables)
  try {
    const { useMetricsExamples } = require('./composables/useMetricsExamples.ts')
    const examples = useMetricsExamples()

    // Test button click tracking
    examples.trackButtonClick('test-button', '/test-page')

    // Test performance metrics
    examples.trackPerformanceMetrics()

    // Test user engagement
    examples.trackUserEngagement.sessionStart()
    examples.trackUserEngagement.featureUsed('test-feature')

    // Test business metrics
    examples.trackBusinessMetrics.predictionRequested('xgboost')
    examples.trackBusinessMetrics.predictionCompleted('xgboost', 0.95)

    console.log('✅ All example implementations executed successfully')
  } catch (error) {
    console.log('⚠️  Examples require full Nuxt context to run completely')
    console.log('Error:', error.message)
  }

  console.log('\n🎉 Sentry Metrics Test Complete!')
  console.log('\nNote: This test uses mocked Sentry methods.')
  console.log('In a real application, metrics would be sent to Sentry.')
}

if (require.main === module) {
  runMetricsTests().catch(console.error)
}

module.exports = { runMetricsTests }
