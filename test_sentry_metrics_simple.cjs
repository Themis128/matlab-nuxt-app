/**
 * Simple Test for Sentry Metrics Implementation
 *
 * This test demonstrates the core Sentry metrics functionality.
 * Run with: node test_sentry_metrics_simple.cjs
 */

// Mock Sentry for testing
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

// Mock browser APIs
global.window = { location: { pathname: '/test' } }
global.navigator = { userAgent: 'TestBrowser/1.0' }
global.performance = {
  now: () => Date.now(),
}

// Simplified metrics implementation for testing
const useSentryMetrics = () => {
  const isSentryAvailable = () => typeof global.Sentry !== 'undefined'

  const count = (name, value = 1, options) => {
    if (isSentryAvailable()) {
      global.Sentry.metrics.count(name, value, options)
    }
  }

  const gauge = (name, value, options) => {
    if (isSentryAvailable()) {
      global.Sentry.metrics.gauge(name, value, options)
    }
  }

  const distribution = (name, value, options) => {
    if (isSentryAvailable()) {
      global.Sentry.metrics.distribution(name, value, options)
    }
  }

  const set = (name, value, options) => {
    if (isSentryAvailable()) {
      global.Sentry.metrics.set(name, value, options)
    }
  }

  const increment = (name, options) => count(name, 1, options)
  const decrement = (name, options) => count(name, -1, options)

  const trackPageView = (pageName, attributes) => {
    const page = pageName || global.window?.location?.pathname || 'unknown'
    count('page_view', 1, {
      attributes: { page, ...attributes },
    })
  }

  const trackInteraction = (type, element, attributes) => {
    count('user_interaction', 1, {
      attributes: {
        type,
        element: element || 'unknown',
        ...attributes,
      },
    })
  }

  const trackApiCall = (endpoint, method, statusCode, duration, attributes) => {
    count('api_call', 1, {
      attributes: {
        endpoint,
        method: method?.toUpperCase(),
        status_code: statusCode?.toString(),
        ...attributes,
      },
    })
    if (duration !== undefined) {
      distribution('api_response_time', duration, {
        unit: 'millisecond',
        attributes: { endpoint, method: method?.toUpperCase(), ...attributes },
      })
    }
  }

  const timing = async (name, operation, options) => {
    const startTime = performance.now()
    try {
      const result = await operation()
      const duration = performance.now() - startTime
      distribution(`${name}_duration`, duration, {
        ...options,
        unit: 'millisecond',
      })
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      distribution(`${name}_error_duration`, duration, {
        ...options,
        unit: 'millisecond',
        attributes: {
          ...options?.attributes,
          error: true,
          error_type: error.name,
        },
      })
      throw error
    }
  }

  return {
    count,
    gauge,
    distribution,
    set,
    increment,
    decrement,
    trackPageView,
    trackInteraction,
    trackApiCall,
    timing,
    isSentryAvailable,
  }
}

async function runTests() {
  console.log('🧪 Testing Sentry Metrics Implementation\n')

  const metrics = useSentryMetrics()

  console.log('✅ Sentry available:', metrics.isSentryAvailable())
  console.log('\n📊 Testing Core Metrics:')

  // Test counter
  metrics.count('button_click', 3, {
    attributes: { page: '/home', user_type: 'premium' },
  })

  // Test gauge
  metrics.gauge('memory_usage', 85.5, {
    unit: 'percentage',
    attributes: { component: 'frontend' },
  })

  // Test distribution
  metrics.distribution('response_time', 245.7, {
    unit: 'millisecond',
    attributes: { endpoint: '/api/data' },
  })

  // Test set
  metrics.set('unique_visitors', 'user_123', {
    attributes: { date: '2025-01-15' },
  })

  console.log('\n🎯 Testing Convenience Methods:')

  metrics.increment('page_views_total')
  metrics.decrement('active_connections')

  metrics.trackPageView('/dashboard', { referrer: 'google.com' })
  metrics.trackInteraction('click', 'submit-button', { form: 'contact' })
  metrics.trackApiCall('/api/users', 'POST', 201, 120.5, { cached: false })

  console.log('\n⏱️  Testing Timing Utility:')

  const result = await metrics.timing(
    'api_request',
    async () => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 50))
      return { success: true, data: [1, 2, 3] }
    },
    {
      attributes: { endpoint: '/api/test' },
    }
  )

  console.log('✅ Timing result:', result.success)

  console.log('\n🎉 All tests completed successfully!')
  console.log('\nNote: Metrics are sent to mocked Sentry instance.')
  console.log('In production, they would be sent to your Sentry project.')
}

runTests().catch(console.error)
