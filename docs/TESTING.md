# Testing Guide

Comprehensive guide for running and writing E2E tests with Playwright.

## Overview

The project uses **Playwright** for end-to-end testing across multiple browsers and devices.

**Test Stats:**

- **Test Files**: 15+
- **Test Cases**: 150+
- **Browsers**: Chromium, Firefox, WebKit, Mobile (Chrome/Safari)
- **Coverage**: Prediction forms, API integration, dashboard, search, compare, recommendations

## Quick Start

```powershell
# Run all tests
npm test

# Interactive UI mode
npm run test:ui

# View last test report
npm run test:report

# Run specific test file
npx playwright test tests/dashboard.spec.ts

# Run with browser visible
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

## Test Structure

### Test Organization

```
tests/
├── prediction-api-integration.spec.ts    # API integration
├── dashboard.spec.ts                     # Dashboard page
├── compare.spec.ts                       # Model comparison
├── search.spec.ts                        # Search & filter
├── explore.spec.ts                       # Dataset exploration
├── recommendations.spec.ts               # AI recommendations
├── demo.spec.ts                          # Demo functionality
├── helpers/
│   └── test-utils.ts                     # Shared utilities
└── README.md
```

### Configuration

**`playwright.config.ts`**:

```typescript
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],

  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

## Writing Tests

### Basic Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Navigate
    await page.goto('/page-path');

    // Interact
    await page.fill('input[name="field"]', 'value');
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('.result')).toBeVisible();
    await expect(page.locator('.result')).toContainText('Expected');
  });
});
```

### Page Object Pattern

```typescript
// helpers/page-objects.ts
export class PredictionPage {
  constructor(private page: Page) {}

  async fillForm(data: PredictionInput) {
    await this.page.fill('[name="ram"]', data.ram.toString());
    await this.page.fill('[name="battery"]', data.battery.toString());
    // ... more fields
  }

  async submitForm() {
    await this.page.click('button[type="submit"]');
  }

  async getResult() {
    return await this.page.locator('.prediction-result').textContent();
  }
}

// In test
test('predict price', async ({ page }) => {
  const predictionPage = new PredictionPage(page);
  await page.goto('/predict/price');

  await predictionPage.fillForm({
    ram: 8,
    battery: 5000,
    // ...
  });

  await predictionPage.submitForm();
  const result = await predictionPage.getResult();
  expect(result).toMatch(/\d+/);
});
```

### API Testing

```typescript
test('API returns valid prediction', async ({ request }) => {
  const response = await request.post('http://localhost:8000/api/predict/price', {
    data: {
      ram: 8,
      battery: 5000,
      screen: 6.5,
      weight: 180,
      year: 2024,
      company: 'Samsung',
    },
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data).toHaveProperty('price');
  expect(data.price).toBeGreaterThan(0);
});
```

### Common Assertions

```typescript
// Visibility
await expect(page.locator('.element')).toBeVisible();
await expect(page.locator('.element')).toBeHidden();

// Text content
await expect(page.locator('.element')).toHaveText('Exact text');
await expect(page.locator('.element')).toContainText('Partial');

// Attributes
await expect(page.locator('input')).toHaveAttribute('type', 'text');
await expect(page.locator('button')).toBeDisabled();
await expect(page.locator('button')).toBeEnabled();

// Count
await expect(page.locator('.item')).toHaveCount(5);

// URL
await expect(page).toHaveURL('/expected-path');
await expect(page).toHaveURL(/pattern/);
```

### Waiting Strategies

```typescript
// Wait for element
await page.waitForSelector('.element');

// Wait for network
await page.waitForResponse((resp) => resp.url().includes('/api/predict') && resp.status() === 200);

// Wait for load state
await page.waitForLoadState('networkidle');
await page.waitForLoadState('domcontentloaded');

// Custom timeout
await page.waitForSelector('.slow-element', { timeout: 60000 });
```

## Running Tests

### Development

```powershell
# Start servers (Terminal 1)
npm run dev:all

# Run tests (Terminal 2)
npm test
```

### CI/CD

Tests run automatically on GitHub Actions:

```yaml
# .github/workflows/test.yml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Start servers
  run: npm run dev:all &

- name: Run tests
  run: npm test
```

### Selective Testing

```powershell
# Run by file
npx playwright test dashboard

# Run by grep pattern
npx playwright test -g "price prediction"

# Run specific project
npx playwright test --project=chromium

# Run in parallel
npx playwright test --workers=4
```

## Debugging Tests

### Interactive Mode

```powershell
# Launch UI mode
npm run test:ui
```

Features:

- Step through tests
- Inspect DOM
- View network requests
- Time-travel debugging

### Debug Mode

```powershell
# Step-by-step execution
npx playwright test --debug

# Debug specific test
npx playwright test dashboard.spec.ts:23 --debug
```

### Screenshots & Videos

Automatically captured on failure (configured in `playwright.config.ts`).

**Manual capture**:

```typescript
test('example', async ({ page }) => {
  await page.screenshot({ path: 'screenshot.png' });
  // Or full page
  await page.screenshot({ path: 'full.png', fullPage: true });
});
```

### Console Logs

```typescript
// Listen to console
page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

// Listen to errors
page.on('pageerror', (err) => console.log('PAGE ERROR:', err));
```

## Test Fixtures

### Custom Fixtures

```typescript
// test-fixtures.ts
import { test as base } from '@playwright/test';

type MyFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<MyFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: login
    await page.goto('/login');
    await page.fill('[name="username"]', 'test-user');
    await page.fill('[name="password"]', 'test-pass');
    await page.click('button[type="submit"]');

    // Use page
    await use(page);

    // Teardown
    await page.goto('/logout');
  },
});

// In test
import { test } from './test-fixtures';

test('protected route', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  // Already logged in
});
```

## Best Practices

### 1. Use Data-Testid for Stable Selectors

```vue
<!-- In component -->
<button data-testid="submit-prediction">Submit</button>
```

```typescript
// In test
await page.click('[data-testid="submit-prediction"]');
```

### 2. Avoid Hardcoded Waits

❌ **Bad**:

```typescript
await page.waitForTimeout(3000); // Flaky!
```

✅ **Good**:

```typescript
await page.waitForSelector('.result');
await page.waitForLoadState('networkidle');
```

### 3. Use Locators Over Selectors

```typescript
// Locators are more resilient
const button = page.locator('button').filter({ hasText: 'Submit' });
await button.click();

// Chaining
await page.locator('.form').locator('input[name="price"]').fill('500');
```

### 4. Test User Flows, Not Implementation

❌ **Bad** (testing implementation):

```typescript
test('sets state correctly', async ({ page }) => {
  // Don't test internal state
});
```

✅ **Good** (testing user experience):

```typescript
test('user can submit form and see result', async ({ page }) => {
  await page.goto('/predict');
  await page.fill('[name="ram"]', '8');
  await page.click('button[type="submit"]');
  await expect(page.locator('.result')).toBeVisible();
});
```

### 5. Parallelize When Possible

```typescript
// Allow tests in this file to run in parallel
test.describe.configure({ mode: 'parallel' });

test.describe('Independent tests', () => {
  test('test 1', async ({ page }) => {
    /* ... */
  });
  test('test 2', async ({ page }) => {
    /* ... */
  });
});
```

## Troubleshooting

### Tests Timeout

**Increase timeout**:

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Element Not Found

**Check selector in browser**:

```powershell
# Open browser with inspector
npx playwright test --debug
```

**Add explicit wait**:

```typescript
await page.waitForSelector('.element', { state: 'visible' });
```

### Port Already in Use

```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Tests Pass Locally, Fail on CI

- Check `retries: 2` for CI in config
- Ensure webServer starts properly
- Add screenshots/videos to CI artifacts
- Check for timing issues (use waitFor\*)

## Coverage

### Generate Coverage Report

```powershell
# Run with coverage
npx playwright test --reporter=html,json

# View report
npx playwright show-report
```

### Coverage Areas

- ✅ Prediction forms (price, RAM, battery, brand)
- ✅ API integration (Python FastAPI)
- ✅ Dashboard rendering
- ✅ Search & filter functionality
- ✅ Model comparison
- ✅ Dataset exploration
- ✅ Form validation
- ⚠️ Partial: Authentication flows
- ❌ Missing: Admin features (if any)

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Start servers
        run: npm run dev:all &

      - name: Wait for servers
        run: npx wait-on http://localhost:3000 http://localhost:8000

      - name: Run tests
        run: npm test

      - name: Upload artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## See Also

- [Playwright Documentation](https://playwright.dev)
- [Test Utils](../tests/helpers/test-utils.ts)
- [CI/CD Configuration](../.github/workflows/)

---

**Last Updated**: November 29, 2025
