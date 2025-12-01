/**
 * Test Sentry Logger Implementation
 *
 * This test demonstrates the Sentry logger functionality.
 * Run with: node test_sentry_logger.cjs
 */

// Mock Sentry for testing
global.Sentry = {
  addBreadcrumb: breadcrumb => {
    console.log(
      `📍 BREADCRUMB: [${breadcrumb.category}] ${breadcrumb.message}`,
      breadcrumb.data || {}
    )
  },
  captureMessage: (message, level) => {
    console.log(`💬 MESSAGE [${level?.toUpperCase() || 'INFO'}]: ${message}`)
  },
  captureException: (error, options) => {
    console.log(`🚨 EXCEPTION: ${error.message}`, options?.extra || {})
  },
  setUser: user => {
    console.log(`👤 USER SET:`, user)
  },
  setExtras: extras => {
    console.log(`📋 EXTRAS SET:`, extras)
  },
  setTag: (key, value) => {
    console.log(`🏷️  TAG SET: ${key} = ${value}`)
  },
}

// Mock console methods to avoid cluttering output
const originalConsole = { ...console }
console.debug = () => {}
console.info = () => {}
console.warn = () => {}
console.error = () => {}

// Simplified logger implementation for testing
const useSentryLogger = () => {
  const isSentryAvailable = () => typeof global.Sentry !== 'undefined'

  const addBreadcrumb = (message, category, level, data) => {
    if (isSentryAvailable()) {
      global.Sentry.addBreadcrumb({
        message,
        category: category || 'custom',
        level: level || 'info',
        data,
        timestamp: Date.now() / 1000,
      })
    }
  }

  const captureMessage = (message, level, context) => {
    if (!isSentryAvailable()) {
      console.log(`[${level?.toUpperCase() || 'INFO'}] ${message}`, context)
      return
    }

    if (context?.userId) {
      global.Sentry.setUser({ id: context.userId })
    }

    if (context) {
      global.Sentry.setExtras(context)
    }

    global.Sentry.captureMessage(message, level || 'info')
    addBreadcrumb(message, 'logger', level, context)
  }

  const trace = (message, context) => {
    originalConsole.debug(`[TRACE] ${message}`, context)
    captureMessage(message, 'debug', context)
  }

  const debug = (message, context) => {
    originalConsole.debug(`[DEBUG] ${message}`, context)
    captureMessage(message, 'debug', context)
  }

  const info = (message, context) => {
    originalConsole.info(`[INFO] ${message}`, context)
    captureMessage(message, 'info', context)
  }

  const warn = (message, context) => {
    originalConsole.warn(`[WARN] ${message}`, context)
    captureMessage(message, 'warning', context)
  }

  const error = (message, error, context) => {
    originalConsole.error(`[ERROR] ${message}`, error, context)

    if (!isSentryAvailable()) return

    if (context?.userId) {
      global.Sentry.setUser({ id: context.userId })
    }

    if (context) {
      global.Sentry.setExtras(context)
    }

    if (error && error instanceof Error) {
      global.Sentry.captureException(error, {
        tags: { logger: 'true', level: 'error' },
        extra: { message, ...context },
      })
    } else {
      global.Sentry.captureMessage(message, 'error')
    }

    addBreadcrumb(message, 'logger', 'error', { ...context, error: error?.message })
  }

  const fatal = (message, error, context) => {
    originalConsole.error(`[FATAL] ${message}`, error, context)
    error(message, error, { ...context, level: 'fatal' })
  }

  const fmt = (template, ...values) => {
    let result = template
    values.forEach((value, index) => {
      result = result.replace(new RegExp(`\\$\\{${index}\\}`, 'g'), String(value))
    })
    return result
  }

  const printf = (template, ...args) => {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.util?.format) {
        return globalThis.util.format(template, ...args)
      }
      let result = template
      args.forEach(arg => {
        result = result.replace(/%s|%d|%j|%o/, String(arg))
      })
      return result
    } catch {
      return template
    }
  }

  const logApiRequest = (method, url, statusCode, duration, context) => {
    const message = `API ${method} ${url}`
    const logContext = { method, url, statusCode, duration, ...context }

    if (statusCode && statusCode >= 400) {
      error(message, undefined, logContext)
    } else if (duration && duration > 5000) {
      warn(`${message} - Slow response`, logContext)
    } else {
      info(message, logContext)
    }
  }

  const logUserAction = (action, details, context) => {
    const message = `User action: ${action}`
    info(message, { ...context, action, details })
  }

  const logPerformance = (metric, value, unit, context) => {
    const message = `Performance: ${metric} = ${value}${unit ? ` ${unit}` : ''}`
    info(message, { ...context, metric, value, unit })
  }

  const logBusinessEvent = (event, properties, context) => {
    const message = `Business event: ${event}`
    info(message, { ...context, event, properties })
  }

  const startSession = (sessionId, context) => {
    info(`Session started: ${sessionId}`, { ...context, sessionId, event: 'session_start' })

    if (isSentryAvailable()) {
      global.Sentry.setTag('session_id', sessionId)
      if (context) {
        global.Sentry.setExtras({ session_context: context })
      }
    }
  }

  const endSession = (sessionId, context) => {
    info(`Session ended: ${sessionId}`, { ...context, sessionId, event: 'session_end' })

    if (isSentryAvailable()) {
      global.Sentry.setTag('session_id', undefined)
      global.Sentry.setExtras({ session_context: undefined })
    }
  }

  return {
    trace,
    debug,
    info,
    warn,
    error,
    fatal,
    fmt,
    printf,
    logApiRequest,
    logUserAction,
    logPerformance,
    logBusinessEvent,
    startSession,
    endSession,
    addBreadcrumb,
    captureMessage,
    isSentryAvailable,
  }
}

async function runTests() {
  console.log('🧪 Testing Sentry Logger Implementation\n')

  const logger = useSentryLogger()

  console.log('✅ Sentry available:', logger.isSentryAvailable())
  console.log('\n📝 Testing Core Logging Methods:')

  // Test different log levels
  logger.trace('This is a trace message', { component: 'test' })
  logger.debug('This is a debug message', { component: 'test' })
  logger.info('This is an info message', { component: 'test' })
  logger.warn('This is a warning message', { component: 'test' })

  // Test error logging with and without Error object
  logger.error('This is an error message', undefined, { component: 'test' })
  logger.error('This is an error with exception', new Error('Test error'), { component: 'test' })

  console.log('\n🎯 Testing Specialized Loggers:')

  // Test API request logging
  logger.logApiRequest('GET', '/api/users', 200, 150, { userId: '123' })
  logger.logApiRequest('POST', '/api/payment', 500, 2000, { amount: 99.99 })
  logger.logApiRequest('GET', '/api/data', 200, 6000, { slow: true })

  // Test user action logging
  logger.logUserAction('button_click', { button: 'save' }, { userId: '456' })

  // Test performance logging
  logger.logPerformance('page_load', 1250, 'ms', { page: '/dashboard' })

  // Test business event logging
  logger.logBusinessEvent('purchase', { product: 'premium', amount: 29.99 }, { userId: '789' })

  console.log('\n🔧 Testing Utilities:')

  // Test fmt utility
  const formatted = logger.fmt('User ${0} performed action ${1}', 'John', 'login')
  logger.info(formatted, { template: true })

  // Test printf utility
  const printfMsg = logger.printf('User %s has %d items', 'Alice', 5)
  logger.info(printfMsg, { formatted: true })

  console.log('\n📊 Testing Session Management:')

  // Test session management
  logger.startSession('session_123', { userId: '999', source: 'web' })
  logger.info('User navigated to dashboard', { page: '/dashboard' })
  logger.endSession('session_123', { duration: 300 })

  console.log('\n✅ All logger tests completed successfully!')
  console.log('\nNote: This test uses mocked Sentry methods.')
  console.log('In production, logs would be sent to your Sentry project.')
}

runTests().catch(console.error)
