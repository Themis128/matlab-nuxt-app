import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: isCI ? [['html']] : [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PW_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot only when test fails */
    screenshot: 'only-on-failure',

    /* Record video only when test fails */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Auto-start both Python API and Nuxt dev server before tests */
  webServer: [
    {
      command: isCI
        ? 'cd python_api && python api.py'
        : 'pwsh -NoProfile -Command "& .\\venv\\Scripts\\Activate.ps1; cd python_api; python api.py"',
      url: 'http://localhost:8000/health',
      timeout: 180 * 1000, // 3 minutes for Python API startup
      reuseExistingServer: !isCI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // Delay Nuxt startup to allow Python API to initialize first
      command: isCI
        ? 'npm run dev'
        : 'pwsh -NoProfile -Command "Start-Sleep -Seconds 3; npm run dev"',
      // Use PW_BASE_URL if provided so tests can reuse an already-running dev server on a different port
      url: process.env.PW_BASE_URL
        ? `${process.env.PW_BASE_URL.replace(/\/$/, '')}/api/health`
        : 'http://localhost:3000/api/health',
      timeout: 180 * 1000, // 3 minutes for Nuxt dev server
      reuseExistingServer: !isCI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],

  globalSetup: './tests/global-setup.ts',

  /* Global test timeout */
  timeout: 90 * 1000,

  /* Expect timeout */
  expect: {
    timeout: 15 * 1000,
  },

  outputDir: 'test-results',
})
