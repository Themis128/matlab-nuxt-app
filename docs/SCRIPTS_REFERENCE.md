# Scripts Reference

> **Complete reference for all npm scripts in package.json**

## Overview

This document describes all available npm scripts for development, building, testing, and maintenance.

---

## Development Scripts

### `npm run dev`

**Purpose:** Start Nuxt development server
**Command:** `nuxt dev`
**Port:** 3000 (default)
**Usage:** Development with hot module replacement

### `npm run dev:python`

**Purpose:** Start Python FastAPI backend
**Command:** `cd python_api && ..\\venv\\Scripts\\python api.py`
**Port:** 8000
**Usage:** Run Python API separately

### `npm run dev:all`

**Purpose:** Start both Nuxt and Python API concurrently
**Command:** Concurrent execution of both services
**Usage:** Full-stack development with both services running

### `npm run dev:health`

**Purpose:** Check health of both services
**Command:** PowerShell health check script
**Usage:** Verify both services are running correctly

### `npm run dev:all:ensure`

**Purpose:** Clear ports and start all services
**Command:** Clears ports then starts services
**Usage:** When ports are blocked or services won't start

---

## Type Checking Scripts

### `npm run typecheck`

**Purpose:** Run TypeScript type checking (CI mode)
**Command:** `npm run typecheck:ci`
**Usage:** Standard type checking

### `npm run typecheck:ci`

**Purpose:** Type checking optimized for CI
**Command:** `vue-tsc` + `tsc` with memory limits
**Memory:** 8192 MB
**Usage:** CI/CD pipelines

### `npm run typecheck:local`

**Purpose:** Type checking for local development
**Command:** Same as `typecheck:ci`
**Usage:** Local development type checking

### `npm run typecheck:mem`

**Purpose:** Type checking with high memory allocation
**Command:** `vue-tsc` + `tsc` with 16384 MB memory
**Usage:** Large projects or complex type inference

---

## Linting Scripts

### `npm run lint`

**Purpose:** Check code for linting errors
**Command:** ESLint on all source files
**Files:** `components/`, `composables/`, `pages/`, `plugins/`, `server/`, `scripts/`
**Extensions:** `.js`, `.ts`, `.vue`
**Usage:** Pre-commit checks, CI validation

### `npm run lint:fix`

**Purpose:** Auto-fix linting errors
**Command:** ESLint with `--fix` flag
**Usage:** Automatically fix fixable linting issues

### `npm run lint:yaml`

**Purpose:** Lint YAML files
**Command:** `yamllint` on GitHub workflows
**Usage:** Validate YAML configuration files

---

## Formatting Scripts

### `npm run format`

**Purpose:** Format all files with Prettier
**Command:** `prettier --write .`
**Usage:** Format code to match style guide

### `npm run format:check`

**Purpose:** Check if files are formatted correctly
**Command:** `prettier --check .`
**Usage:** CI checks without modifying files

---

## Style Checking Scripts

### `npm run style:check`

**Purpose:** Check both formatting and linting
**Command:** Prettier check + ESLint with zero warnings
**Usage:** Comprehensive style validation

### `npm run style:fix`

**Purpose:** Fix both formatting and linting issues
**Command:** Prettier format + ESLint fix
**Usage:** Auto-fix all style issues

---

## JavaScript Checking Scripts

### `npm run check:js`

**Purpose:** Lint JavaScript/TypeScript files in scripts directory
**Command:** ESLint on `scripts/**/*.{js,ts}`
**Usage:** Validate build and utility scripts

### `npm run check:js:fix`

**Purpose:** Auto-fix JavaScript/TypeScript in scripts
**Command:** ESLint with `--fix` on scripts
**Usage:** Fix script files automatically

---

## Comprehensive Checking Scripts

### `npm run check:all`

**Purpose:** Run all checks (type, lint, format)
**Command:** `typecheck && lint && format:check`
**Usage:** Pre-commit or pre-push validation

### `npm run check:all:fix`

**Purpose:** Fix all issues (lint, format) then typecheck
**Command:** `lint:fix && format && typecheck`
**Usage:** Auto-fix everything then verify types

---

## Build Scripts

### `npm run build`

**Purpose:** Build production bundle
**Command:** `nuxt build`
**Output:** `.output/` directory
**Usage:** Production deployment

### `npm run generate`

**Purpose:** Generate static site
**Command:** `nuxt generate`
**Usage:** Static site generation (SSG)

### `npm run preview`

**Purpose:** Preview production build
**Command:** `nuxt preview`
**Usage:** Test production build locally

---

## Testing Scripts

### `npm run test:e2e`

**Purpose:** Run Playwright end-to-end tests
**Command:** `playwright test`
**Usage:** Full application testing

### `npm run test:e2e:ui`

**Purpose:** Run E2E tests with UI
**Command:** `playwright test --ui`
**Usage:** Interactive test debugging

### `npm run test:e2e:debug`

**Purpose:** Debug E2E tests
**Command:** `playwright test --debug`
**Usage:** Step-through test debugging

### `npm run test:e2e:headed`

**Purpose:** Run E2E tests in headed mode
**Command:** `playwright test --headed`
**Usage:** See browser during tests

### `npm run test:e2e:install`

**Purpose:** Install Playwright browsers
**Command:** `playwright install --with-deps`
**Usage:** First-time setup

### `npm run test:e2e:report`

**Purpose:** Show test report
**Command:** `playwright show-report`
**Usage:** View test results

---

## Utility Scripts

### `npm run prepare`

**Purpose:** Prepare Nuxt (runs on install)
**Command:** `nuxt prepare`
**Usage:** Automatic setup

### `npm run postinstall`

**Purpose:** Post-installation setup
**Command:** `nuxt prepare`
**Usage:** Automatic after `npm install`

### `npm run check`

**Purpose:** Check MATLAB capabilities
**Command:** Node.js capability checker
**Usage:** Verify MATLAB setup

### `npm run check:matlab`

**Purpose:** Check MATLAB capabilities (alias)
**Command:** Same as `check`
**Usage:** MATLAB verification

---

## Pre-commit Scripts

### `npm run precommit:check`

**Purpose:** Pre-commit validation
**Command:** Check for VSCode settings
**Usage:** Git pre-commit hook

### `npm run precommit:cline`

**Purpose:** Cline pre-commit check
**Command:** `npx cline --check`
**Usage:** AI code review

---

## Script Categories Summary

### Quick Commands

```bash
# Development
npm run dev              # Start Nuxt
npm run dev:all          # Start both services

# Checking
npm run check:all        # All checks
npm run typecheck        # TypeScript
npm run lint             # Linting
npm run format:check     # Formatting

# Fixing
npm run check:all:fix    # Fix everything
npm run lint:fix         # Fix linting
npm run format           # Format code
npm run style:fix        # Fix style issues
```

### Workflow Examples

**Before Committing:**

```bash
npm run check:all:fix    # Fix all issues
npm run typecheck        # Verify types
```

**CI/CD Pipeline:**

```bash
npm run typecheck:ci    # Type checking
npm run lint            # Linting
npm run format:check    # Format check
npm run test:e2e        # E2E tests
```

**Development:**

```bash
npm run dev:all         # Start everything
npm run lint:fix        # Fix linting on save
```

---

## Script Configuration

### ESLint Configuration

- **File:** `eslint.config.cjs`
- **Type:** Flat config (ESLint 9+)
- **Plugins:** Vue, TypeScript, Prettier, TailwindCSS

### Prettier Configuration

- **File:** `.prettierrc.cjs`
- **Settings:**
  - Single quotes
  - Semicolons
  - 2-space indentation
  - 100 character line width

### TypeScript Configuration

- **File:** `tsconfig.json` (base)
- **File:** `tsconfig.ci.json` (CI)
- **Settings:** Strict mode enabled

---

## Common Issues & Solutions

### Issue: Type checking too slow

**Solution:** Use `typecheck:mem` for more memory

### Issue: Linting errors

**Solution:** Run `npm run lint:fix` to auto-fix

### Issue: Formatting inconsistencies

**Solution:** Run `npm run format` to format all files

### Issue: Type errors in CI

**Solution:** Check `tsconfig.ci.json` excludes

---

## Recommended Workflow

1. **Development:**

   ```bash
   npm run dev:all
   ```

2. **Before Committing:**

   ```bash
   npm run check:all:fix
   ```

3. **CI/CD:**
   ```bash
   npm run typecheck:ci
   npm run lint
   npm run format:check
   npm run test:e2e
   ```

---

**Last Updated:** December 2025
**Version:** 1.0.0
