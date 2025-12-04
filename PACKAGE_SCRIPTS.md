# Package.json Scripts Documentation

This file documents the custom scripts in `package.json` for the MATLAB-Nuxt hybrid application.

## Development Scripts

- `dev`: Starts Nuxt dev server on port 3000
- `dev:python`: Starts Python API server (requires virtual environment)
- `dev:all`: Starts both Python API and Nuxt concurrently
- `dev:health`: Checks health of development services
- `dev:all:ensure`: Clears ports and starts all services

## Testing Scripts

- `test`: Runs Playwright E2E tests
- `test:unit`: Runs Vitest unit tests
- `test:ui`: Runs Playwright tests with UI
- `test:api`: Tests API endpoints
- `test:with-dev`: Runs tests with dev servers
- `test:servers:start/stop`: Manages test servers

## MATLAB/Python Integration Scripts

- `check`: Checks MATLAB capabilities and toolboxes
- `mat:view`: Views MATLAB .mat files
- `optimize`: Runs Python optimization scripts for models/images/CSV
- `csv:validate`: Validates CSV schema

## Build and Quality Scripts

- `build`: Builds for production and uploads sourcemaps to Sentry
- `typecheck`: Type checking with memory limits
- `lint`: ESLint checking
- `lint:fix`: Auto-fix ESLint issues
- `format`: Prettier formatting
- `audit:fix`: Fix npm audit issues

## CI/CD Scripts

- `test:ci`: CI test runner
- `check:todos`: Check critical TODOs
- `precommit:check`: Pre-commit hooks

## Utility Scripts

- `algolia:index`: Index records to Algolia
- `vscode:show/hide`: Toggle VS Code settings
- `extension:build`: Build Chrome extension
- `cli:cline`: Run Cline CLI tool

## Notes

- Many scripts integrate with MATLAB/Python workflows
- Concurrent scripts use `concurrently` for parallel execution
- Memory limits are set for type checking to prevent OOM
- Python scripts require virtual environment activation
