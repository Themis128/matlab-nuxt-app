import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 2, // Add retries for flaky tests
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  timeout: 60000, // Increase timeout to 60s
  expect: {
    timeout: 10000, // Increase expect timeout to 10s
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // Add action timeout
    actionTimeout: 15000,
    // Add navigation timeout
    navigationTimeout: 30000,
    // Screenshot on failure
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // WebKit disabled on Windows due to stability issues (known Playwright limitation)
    // Uncomment if running on macOS/Linux:
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     actionTimeout: 20000,
    //     navigationTimeout: 40000,
    //   },
    // },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300000, // 5 minutes for server to start (increased for i18n initialization)
    stdout: 'pipe',
    stderr: 'pipe',
    // Playwright automatically performs health checks by making GET requests to the url
    // until it receives a successful response (status 200)
  },
})
