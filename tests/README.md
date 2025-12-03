# Playwright Tests for Mobile Finder Application

This directory contains end-to-end tests for the Mobile Finder application using Playwright. These tests verify that the application works correctly, with a focus on the Python API integration for predictions and page functionality.

## Quick Start

**For detailed server orchestration and troubleshooting, see [SERVER_ORCHESTRATION.md](./SERVER_ORCHESTRATION.md)**

### Option 1: Automatic (Recommended for CI)

```powershell
# Windows (PowerShell)
npm run test:with-dev  # Starts servers automatically using PowerShell scripts, runs tests, cleans up

# Linux / CI (Bash)
npm run test:ci:e2e  # Cross-platform helper for CI that starts servers, runs Playwright, cleans up
```

### Option 2: Manual (Recommended for Development)

```powershell
# Start servers once
npm run test:servers:start

# Run tests repeatedly
npm run test:manual

# Stop servers when done
npm run test:servers:stop
```

## Test Environment Setup

Following the project's dual-service architecture:

```powershell
# Terminal 1: Start Python API (required for API integration tests)
cd python_api
python api.py  # Runs on http://localhost:8000

# Terminal 2: Start Nuxt dev server
npm run dev  # Runs on http://localhost:3000

# Terminal 3: Run tests
npm run test:manual  # Runs with pre-started servers
```

## Test Categories

### 1. API Integration Tests

- **`prediction-api-integration.spec.ts`**: Tests the Python prediction API endpoints directly
  - Health endpoint verification
  - Price, RAM, battery, and brand prediction endpoints
  - Error handling for invalid inputs
  - Dataset find-closest-model endpoint

- **`api-endpoints.spec.ts`**: Tests all Nuxt server API endpoints
  - Health endpoint (`/api/health`)
  - Prediction endpoints (`/api/predict/*`)
  - Dataset endpoints (`/api/dataset/*`)
  - Find closest model endpoint (`/api/find-closest-model`)
  - CORS handling
  - Error handling and validation
  - Performance benchmarks

### 2. Page-Specific Tests

- **`index.spec.ts`**: Tests home page features and navigation
- **`dashboard.spec.ts`**: Tests AI model dashboard with performance metrics
- **`explore.spec.ts`**: Tests dataset exploration features and statistics
- **`search.spec.ts`**: Tests search functionality
- **`compare.spec.ts`**: Tests phone comparison functionality
- **`recommendations.spec.ts`**: Tests recommendation engine
- **`api-docs.spec.ts`**: Tests API documentation page

## Running Tests

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Python API running (for API integration tests)

### Running All Tests

```bash
# Install dependencies if not already installed
npm install

# Install Playwright browsers (first time only)
npx playwright install

# Start both services using the convenience command
npm run dev:all

# Run all tests (in a separate terminal)
npm test
```

### Running Specific Test Files

```bash
# Run specific test file
npx playwright test tests/prediction-api-integration.spec.ts

# Run specific test file with headed browser (visible)
npx playwright test tests/dashboard.spec.ts --headed

# Run specific test with debug mode
npx playwright test tests/explore.spec.ts --debug

# Run tests in UI mode (interactive debugging)
npm run test:ui
```

## Test Configuration

The tests are configured in `playwright.config.ts` to:

- Run on `http://localhost:3000` (Nuxt dev server)
- Support multiple browsers (Chromium, Firefox, WebKit)
- Retry failed tests on CI (2 retries)
- Capture screenshots on failure
- Record videos on failure
- Generate HTML reports

## Test Patterns

Following project conventions from `copilot-instructions.md`:

```typescript
// Pattern 1: Page navigation with loading state
await page.goto('/dashboard')
await expect(page.locator('text=AI Model Dashboard')).toBeVisible({ timeout: 10000 })

// Pattern 2: API endpoint testing (validates Python API)
const response = await request.get('http://localhost:8000/health')
expect(response.ok()).toBeTruthy()

// Pattern 3: Error state handling
await context.route('**/api/predict/**', route => route.abort())
await expect(page.locator('text=/error|failed/i')).toBeVisible()

// Pattern 4: Dark mode support verification
const darkElements = page.locator('.dark\\:bg-gray-900')
expect(await darkElements.count()).toBeGreaterThan(0)
```

## Debugging Failed Tests

When tests fail, Playwright generates:

- Screenshots for failing tests (in `test-results/`)
- Traces for debugging
- HTML report with details

To view the HTML report:

```bash
npx playwright show-report
```

To view traces:

```bash
npx playwright show-trace test-results/trace.zip
```

## Writing New Tests

When writing new tests:

1. Use existing tests as templates
2. Make selectors resilient (use text content or multiple patterns)
3. Add appropriate timeouts for API-dependent assertions (10000ms)
4. Use try/catch for optional features
5. Follow the pattern: setup → action → assertion
6. Support both light and dark modes
7. Handle graceful degradation when APIs are unavailable

Example:

```typescript
test.describe('Your Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page')
  })

  test('should load data', async ({ page }) => {
    await expect(page.locator('text=Expected Content')).toBeVisible({ timeout: 10000 })
  })
})
```

## CI/CD Integration

Tests run automatically on GitHub Actions:

- Retries: 2 attempts per test (handles flakiness)
- Screenshots: Captured on failure
- Videos: Recorded for failed tests
- Artifacts: Uploaded to GitHub for debugging

## Test Data

Tests use the main dataset:

- **Path**: `data/Mobiles Dataset (2025).csv` or `mobiles-dataset-docs/Mobiles Dataset (2025).csv`
- **Records**: 930+ mobile phones
- **Features**: Base features + enhanced features (if available)

## Troubleshooting

**Tests fail with "Target closed" errors:**

```powershell
# Ensure Python API is running and healthy
curl http://localhost:8000/health
```

**Tests timeout waiting for page load:**

```powershell
# Ensure Nuxt dev server is running
curl http://localhost:3000
```

**API integration tests fail:**

```powershell
# Verify Python dependencies and models
cd python_api
pip list | findstr "scikit-learn pandas numpy"
ls trained_models/*.pkl
```

**Browsers not installed:**

```powershell
npx playwright install
```

## Test Coverage

Current E2E test coverage:

- ✅ **API Integration**
  - Python API endpoints (`prediction-api-integration.spec.ts`)
  - Nuxt server API endpoints (`api-endpoints.spec.ts`)
- ✅ **Pages**
  - Home page (`index.spec.ts`)
  - Dashboard (`dashboard.spec.ts`)
  - Explore page (`explore.spec.ts`)
  - Search page (`search.spec.ts`)
  - Compare page (`compare.spec.ts`)
  - Recommendations (`recommendations.spec.ts`)
  - API documentation (`api-docs.spec.ts`)

## Known Issues

- Line ending warnings (CRLF vs LF) are cosmetic and can be ignored
- Some tests may timeout on slower environments (increase timeouts if needed)
- API response times may vary based on server load
- Dark mode tests verify class presence, not actual theme switching
