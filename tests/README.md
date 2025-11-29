# Playwright Tests for Mobile Finder Application

This directory contains end-to-end tests for the Mobile Finder application using Playwright. These tests verify that the application works correctly, with a special focus on the Python API integration for predictions and recommendations.

## Test Categories

### 1. API Integration Tests

- **`prediction-api-integration.spec.ts`**: Tests the integration between the frontend and Python prediction API
- **`recommendations-api.spec.ts`**: Verifies the recommendation engine works correctly with the API

### 2. Page-Specific Tests

- **`compare.spec.ts`**: Tests the comparison functionality for phone models
- **`dashboard.spec.ts`**: Tests dashboard charts and metrics display
- **`explore.spec.ts`**: Tests dataset exploration features
- **`search.spec.ts`**: Tests search functionality and filters
- **`index.spec.ts`**: Tests home page features
- **`model-detail.spec.ts`**: Tests individual model detail pages

## Running Tests

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Python API running (for API integration tests)

### Running All Tests

```bash
# Install dependencies if not already installed
npm install

# Install Playwright browsers
npx playwright install

# Start Python API in a separate terminal
cd python_api
python api.py

# Start the web app in another terminal
npm run dev

# Run all tests
npm test
```

### Running Specific Test Files

```bash
# Run specific test file
npx playwright test tests/prediction-api-integration.spec.ts

# Run specific test file with headed browser (visible)
npx playwright test tests/prediction-api-integration.spec.ts --headed

# Run specific test with debug mode
npx playwright test tests/prediction-api-integration.spec.ts --debug
```

### Running Tests on Replit

When deploying to Replit, you'll need to ensure:

1. Both Python API and Nuxt app are running
2. The `PYTHON_API_URL` environment variable is set to `http://localhost:8000`
3. Tests are run with the appropriate configuration

```bash
# On Replit, run this command in the Shell tab
npm test
```

## Test Configuration

The tests are configured in `playwright.config.ts` to:

- Automatically detect running server URL
- Support multiple browsers (Chromium, Firefox, WebKit)
- Start web server if needed
- Set appropriate timeouts for API calls

## Test Structure

Each test suite follows this structure:
1. Navigate to the relevant page
2. Verify UI elements are visible
3. Interact with the page (fill forms, click buttons)
4. Verify results and API integration
5. Test edge cases and error handling

## Debugging Failed Tests

When tests fail, Playwright generates:

- Screenshots for failing tests
- Traces for debugging
- HTML report with details

To view the HTML report:
```bash
npx playwright show-report
```

## Writing New Tests

When writing new tests:

1. Use existing tests as templates
2. Make selectors resilient (use multiple possible patterns)
3. Add appropriate waiting and timeouts
4. Use try/catch for optional features
5. Follow the pattern: setup → action → assertion

## Known Issues

- Some tests may time out on slower environments (increase timeouts if needed)
- API response times may vary based on server load
- Image comparison tests may fail due to rendering differences across browsers
