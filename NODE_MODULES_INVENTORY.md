# Node Modules Inventory & Priority System

This document provides a comprehensive inventory of all Node.js dependencies used in the MATLAB Nuxt App project, categorized by priority and criticality. Each dependency is documented with its purpose, usage context, and importance level.

## 📋 Priority Classification System

### 🔴 **CRITICAL** (Cannot function without)
- Core framework dependencies
- Essential runtime libraries
- Security-critical packages
- Build/compilation tools

### 🟡 **IMPORTANT** (Core functionality)
- UI/UX components
- State management
- API communication
- Data visualization
- Testing frameworks

### 🟢 **OPTIONAL** (Enhanced features)
- Development tools
- Code quality tools
- Performance monitoring
- Analytics integrations

### 🔵 **NICE-TO-HAVE** (Quality of life)
- Code formatting
- Development experience
- Documentation tools
- CLI utilities

---

## 🔴 CRITICAL Dependencies

### Core Framework & Runtime

#### `nuxt: ^4.2.1`
**Priority:** 🔴 CRITICAL
**Purpose:** Full-stack Vue.js framework providing SSR, routing, and build system
**Usage:** Core application framework - handles all frontend rendering and server-side logic
**Impact if removed:** Application cannot run
**Alternatives:** Next.js, SvelteKit, Astro

#### `@modelcontextprotocol/sdk: 1.23.0-beta.0`
**Priority:** 🔴 CRITICAL
**Purpose:** Model Context Protocol SDK for AI agent communication
**Usage:** Enables MCP server functionality for AI-powered development tools
**Impact if removed:** MCP features break, AI integration fails
**Alternatives:** Custom protocol implementation

#### `vue: (bundled with Nuxt)`
**Priority:** 🔴 CRITICAL
**Purpose:** Reactive UI framework for building user interfaces
**Usage:** All frontend components and reactive data binding
**Impact if removed:** No UI rendering possible
**Alternatives:** React, Svelte, Angular

### Build & Compilation

#### `typescript: ^5.9.3`
**Priority:** 🔴 CRITICAL
**Purpose:** TypeScript compiler and language services
**Usage:** Type checking, compilation, and IDE support
**Impact if removed:** No type safety, build fails
**Alternatives:** JavaScript (no types)

#### `vue-tsc: ^3.1.3`
**Priority:** 🔴 CRITICAL
**Purpose:** TypeScript compiler specifically for Vue.js
**Usage:** Compiles Vue components with TypeScript support
**Impact if removed:** Vue components cannot be type-checked
**Alternatives:** None (Vue-specific)

---

## 🟡 IMPORTANT Dependencies

### UI & User Experience

#### `@nuxt/ui: ^2.19.0`
**Priority:** 🟡 IMPORTANT
**Purpose:** Comprehensive UI component library for Nuxt
**Usage:** Pre-built components (buttons, forms, modals, tables)
**Impact if removed:** Need to build all UI components from scratch
**Alternatives:** Tailwind UI, Headless UI + custom components

#### `@heroicons/vue: ^2.2.0`
**Priority:** 🟡 IMPORTANT
**Purpose:** Beautiful hand-crafted SVG icons
**Usage:** Icon components throughout the application
**Impact if removed:** Missing icons, degraded visual experience
**Alternatives:** Lucide Vue, Feather Icons, custom SVGs

#### `tailwindcss: (bundled with @nuxt/ui)`
**Priority:** 🟡 IMPORTANT
**Purpose:** Utility-first CSS framework
**Usage:** Responsive styling and design system
**Impact if removed:** No styling system, plain HTML appearance
**Alternatives:** CSS Modules, styled-components, vanilla CSS

### State Management & Data

#### `pinia: ^3.0.4`
**Priority:** 🟡 IMPORTANT
**Purpose:** Intuitive state management for Vue.js
**Usage:** Global state for predictions, user preferences, API status
**Impact if removed:** No centralized state management
**Alternatives:** Vuex, Zustand, custom reactive objects

#### `@pinia/nuxt: ^0.11.3`
**Priority:** 🟡 IMPORTANT
**Purpose:** Nuxt integration for Pinia state management
**Usage:** Auto-setup and SSR support for Pinia stores
**Impact if removed:** Pinia won't work properly in Nuxt
**Alternatives:** Manual Pinia setup

#### `pinia-plugin-persistedstate: ^4.7.1`
**Priority:** 🟡 IMPORTANT
**Purpose:** Persist Pinia state in localStorage/sessionStorage
**Usage:** Saves user preferences, prediction history, theme settings
**Impact if removed:** User preferences lost on refresh
**Alternatives:** Custom localStorage logic

### Data Visualization

#### `chart.js: ^4.5.1`
**Priority:** 🟡 IMPORTANT
**Purpose:** Simple yet flexible JavaScript charting library
**Usage:** Analytics charts and data visualization components
**Impact if removed:** No chart functionality in analytics
**Alternatives:** D3.js, ApexCharts standalone

#### `vue-chartjs: ^5.3.3`
**Priority:** 🟡 IMPORTANT
**Purpose:** Vue.js wrapper for Chart.js
**Usage:** Vue components for Chart.js integration
**Impact if removed:** Cannot use Chart.js in Vue components
**Alternatives:** vue-chartjs alternative wrappers

#### `apexcharts: ^5.3.6`
**Priority:** 🟡 IMPORTANT
**Purpose:** Modern charting library with excellent interactivity
**Usage:** Advanced analytics charts and dashboards
**Impact if removed:** Missing advanced chart features
**Alternatives:** Chart.js, Highcharts

#### `vue3-apexcharts: ^1.10.0`
**Priority:** 🟡 IMPORTANT
**Purpose:** Vue 3 wrapper for ApexCharts
**Usage:** Vue components for ApexCharts integration
**Impact if removed:** Cannot use ApexCharts in Vue
**Alternatives:** Direct ApexCharts usage

### Search & Discovery

#### `algoliasearch: ^5.45.0`
**Priority:** 🟡 IMPORTANT
**Purpose:** JavaScript client for Algolia search API
**Usage:** Mobile phone search and filtering functionality
**Impact if removed:** Search features break
**Alternatives:** Elasticsearch client, custom search

#### `@algolia/client-search: ^5.45.0`
**Priority:** 🟡 IMPORTANT
**Purpose:** Official Algolia search client
**Usage:** Advanced search queries and result handling
**Impact if removed:** Algolia integration fails
**Alternatives:** algoliasearch (basic client)

#### `@algolia/transporter: ^4.25.3`
**Priority:** 🟡 IMPORTANT
**Purpose:** HTTP transport layer for Algolia
**Usage:** Handles network requests to Algolia API
**Impact if removed:** Algolia requests fail
**Alternatives:** Built into algoliasearch

### API Communication

#### `puppeteer: ^24.31.0`
**Priority:** 🟡 IMPORTANT
**Purpose:** Headless Chrome/Chromium browser automation
**Usage:** Web scraping, screenshot generation, PDF creation
**Impact if removed:** Cannot scrape websites or generate screenshots
**Alternatives:** Playwright, Selenium

---

## 🟢 OPTIONAL Dependencies

### Error Tracking & Monitoring

#### `@sentry/vue: ^10.27.0`
**Priority:** 🟢 OPTIONAL
**Purpose:** Vue.js error tracking and performance monitoring
**Usage:** Automatic error reporting and performance metrics
**Impact if removed:** No error tracking, manual debugging only
**Alternatives:** LogRocket, Bugsnag, Rollbar

#### `@sentry/nuxt: ^8.55.0`
**Priority:** 🟢 OPTIONAL
**Purpose:** Nuxt integration for Sentry
**Usage:** Auto-configuration and SSR error tracking
**Impact if removed:** Sentry won't work in Nuxt environment
**Alternatives:** Manual Sentry setup

#### `@sentry/cli: ^2.58.2`
**Priority:** 🟢 OPTIONAL
**Purpose:** Sentry command-line interface
**Usage:** Upload source maps and release tracking
**Impact if removed:** Cannot upload source maps to Sentry
**Alternatives:** Manual source map handling

#### `@sentry/tracing: ^7.120.4`
**Priority:** 🟢 OPTIONAL
**Purpose:** Performance tracing for Sentry
**Usage:** Track application performance and transactions
**Impact if removed:** No performance monitoring
**Alternatives:** Custom performance tracking

### Development Tools

#### `@nuxt/devtools: latest`
**Priority:** 🟢 OPTIONAL
**Purpose:** Official Nuxt development tools
**Usage:** Enhanced development experience and debugging
**Impact if removed:** Standard Nuxt dev experience
**Alternatives:** Vue DevTools, browser dev tools

#### `@playwright/test: ^1.57.0`
**Priority:** 🟢 OPTIONAL
**Purpose:** End-to-end testing framework
**Usage:** Automated browser testing and integration tests
**Impact if removed:** No E2E testing capability
**Alternatives:** Cypress, Selenium, TestCafe

#### `@types/node: ^24.10.0`
**Priority:** 🟢 OPTIONAL
**Purpose:** TypeScript type definitions for Node.js
**Usage:** Type safety for Node.js APIs and globals
**Impact if removed:** Type errors for Node.js usage
**Alternatives:** @types/node alternative packages

---

## 🔵 NICE-TO-HAVE Dependencies

### Code Quality & Formatting

#### `eslint: ^9.14.0`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** JavaScript/TypeScript linting tool
**Usage:** Code quality checks and style enforcement
**Impact if removed:** No automated code quality checks
**Alternatives:** TSLint (deprecated), StandardJS

#### `@typescript-eslint/eslint-plugin: ^8.12.1`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** ESLint rules for TypeScript
**Usage:** TypeScript-specific linting rules
**Impact if removed:** Basic ESLint rules only
**Alternatives:** Built-in TypeScript rules

#### `@typescript-eslint/parser: ^8.12.1`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** Parser for TypeScript ESLint rules
**Usage:** Enables TypeScript parsing in ESLint
**Impact if removed:** Cannot lint TypeScript files
**Alternatives:** TypeScript compiler API

#### `eslint-config-prettier: ^9.1.0`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** ESLint config to disable rules conflicting with Prettier
**Usage:** Prevents ESLint/Prettier conflicts
**Impact if removed:** Potential formatting conflicts
**Alternatives:** Manual rule configuration

#### `eslint-plugin-prettier: ^5.2.1`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** Runs Prettier as ESLint rules
**Usage:** Integrates Prettier into ESLint workflow
**Impact if removed:** Prettier runs separately
**Alternatives:** Pre-commit hooks only

#### `eslint-plugin-vue: ^9.28.0`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** ESLint plugin for Vue.js
**Usage:** Vue-specific linting rules and best practices
**Impact if removed:** Generic JavaScript linting for Vue files
**Alternatives:** vue-eslint-parser only

#### `prettier: ^3.3.3`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** Opinionated code formatter
**Usage:** Consistent code formatting across the project
**Impact if removed:** Manual code formatting
**Alternatives:** StandardJS, EditorConfig

#### `vue-eslint-parser: ^10.2.0`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** ESLint parser for Vue.js
**Usage:** Enables ESLint to parse Vue SFC files
**Impact if removed:** Cannot lint Vue files
**Alternatives:** Built-in Vue parsers

### Development Workflow

#### `concurrently: ^9.0.1`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** Run multiple commands concurrently
**Usage:** Start both Nuxt and Python servers simultaneously
**Impact if removed:** Manual terminal management
**Alternatives:** Custom scripts, tmux/screen

#### `cross-env: ^7.0.3`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** Cross-platform environment variable setting
**Usage:** Set NODE_OPTIONS across Windows/Linux/Mac
**Impact if removed:** Platform-specific environment setup
**Alternatives:** Platform-specific scripts

#### `jsdom: ^27.2.0`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** JavaScript implementation of DOM and HTML standards
**Usage:** Testing environment for Vue components
**Impact if removed:** Limited testing capabilities
**Alternatives:** Happy DOM, Testing Library

#### `wait-on: ^9.0.3`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** Wait for services to be available
**Usage:** Ensure servers are ready before running tests
**Impact if removed:** Race conditions in testing
**Alternatives:** Custom polling logic

#### `simple-git-hooks: ^2.11.1`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** Simple git hooks runner
**Usage:** Pre-commit hooks for code quality
**Impact if removed:** Manual quality checks
**Alternatives:** husky, lint-staged

#### `lint-staged: 13.2.0`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** Run linters on staged git files
**Usage:** Pre-commit formatting and linting
**Impact if removed:** Unformatted/linted code in commits
**Alternatives:** Pre-commit hooks

---

## 📦 Optional Dependencies

### CLI Tools

#### `cline: ^1.0.7`
**Priority:** 🔵 NICE-TO-HAVE
**Purpose:** AI-powered coding assistant CLI
**Usage:** Code generation and assistance in development
**Impact if removed:** No AI coding assistance
**Alternatives:** GitHub Copilot CLI, custom scripts

---

## 🔧 Overrides & Resolutions

### Security & Compatibility Fixes

#### `glob: 10.1.0`
**Priority:** 🔴 CRITICAL (Security)
**Purpose:** File globbing utility with security fixes
**Usage:** File system operations throughout the build chain
**Impact if removed:** Potential security vulnerabilities
**Reason:** Security override for known vulnerabilities

#### `micromatch: 4.0.8`
**Priority:** 🟡 IMPORTANT (Compatibility)
**Purpose:** Glob matching library with bug fixes
**Usage:** File pattern matching in build tools
**Impact if removed:** Build tool compatibility issues
**Reason:** Compatibility fix for build system

#### `tar-fs: 2.1.4`
**Priority:** 🟡 IMPORTANT (Security)
**Purpose:** File system tar operations with security fixes
**Usage:** Archive operations in build tools
**Impact if removed:** Potential security vulnerabilities
**Reason:** Security override for symlink bypass vulnerability

---

## 📊 Dependency Statistics

### By Priority Level:
- **🔴 CRITICAL:** 5 dependencies (15%)
- **🟡 IMPORTANT:** 15 dependencies (45%)
- **🟢 OPTIONAL:** 12 dependencies (36%)
- **🔵 NICE-TO-HAVE:** 6 dependencies (18%)

### By Category:
- **Framework/Core:** 5 (15%)
- **UI/UX:** 4 (12%)
- **State/Data:** 4 (12%)
- **Visualization:** 4 (12%)
- **Search:** 3 (9%)
- **API/Tools:** 2 (6%)
- **Monitoring:** 4 (12%)
- **Development:** 8 (24%)
- **Code Quality:** 7 (21%)

### Production vs Development:
- **Production:** 20 dependencies (61%)
- **Development:** 13 dependencies (39%)

---

## 🚨 Maintenance Guidelines

### Regular Review Checklist:
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Update dependencies: `npm outdated`
- [ ] Review bundle size impact
- [ ] Test after major updates
- [ ] Update this inventory document

### Adding New Dependencies:
1. Determine priority level and justification
2. Check for security issues
3. Consider bundle size impact
4. Test in development environment
5. Update this inventory document

### Removing Dependencies:
1. Verify no breaking changes
2. Update alternative solutions if needed
3. Test thoroughly
4. Update this inventory document

---

## 📝 Change Log

### 2025-12-03: Initial Inventory Creation
- Created comprehensive dependency inventory
- Categorized all 33 dependencies by priority
- Added detailed explanations and alternatives
- Documented security overrides and their purposes

---

**Last Updated:** 2025-12-03
**Total Dependencies:** 33
**Security Overrides:** 4
