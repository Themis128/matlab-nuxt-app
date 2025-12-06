# MATLAB Nuxt App - Analytical Documentation

> **Generated:** December 2025
> **Version:** 1.0.0
> **Framework:** Nuxt 4.2.1 with Vue 3.5.25

## Table of Contents

1. [Application Overview](#application-overview)
2. [Architecture Analysis](#architecture-analysis)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Dependencies Analysis](#dependencies-analysis)
6. [API Architecture](#api-architecture)
7. [State Management](#state-management)
8. [Component Architecture](#component-architecture)
9. [Build Configuration](#build-configuration)
10. [Deployment Infrastructure](#deployment-infrastructure)

---

## Application Overview

### Purpose

A full-stack web application for mobile phone dataset analysis and machine learning predictions, combining:

- **Frontend**: Nuxt.js 4 with Vue 3 for interactive web interface
- **Backend**: Python FastAPI for ML model inference
- **ML Training**: MATLAB Deep Learning Toolbox for model training
- **Data Storage**: CSV datasets with optional LanceDB vector storage

### Core Functionality

1. **Price Prediction**: Predict mobile phone prices using trained ML models
2. **Specification Analysis**: Analyze RAM, battery, and brand classification
3. **Dataset Exploration**: Search, filter, and compare mobile phone datasets
4. **Model Comparison**: A/B testing and performance comparison of ML models
5. **Advanced Analytics**: Data mining, clustering, and pattern discovery

---

## Architecture Analysis

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                    │
│              Nuxt 4.2.1 + Vue 3.5.25 + TypeScript            │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/HTTPS
┌───────────────────────▼─────────────────────────────────────┐
│              Nuxt Nitro Server (Node.js)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Server API Routes (/server/api/*)                  │   │
│  │  - Health checks                                    │   │
│  │  - Proxy to Python API                              │   │
│  │  - Dataset queries                                  │   │
│  │  - Prediction endpoints                             │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP (Port 8000)
┌───────────────────────▼─────────────────────────────────────┐
│            Python FastAPI Backend                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ML Model Inference                                  │   │
│  │  - scikit-learn models (primary)                    │   │
│  │  - TensorFlow models (fallback)                     │   │
│  │  - Distilled models (optimized)                      │   │
│  │  - Mock predictions (development)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              Data & Model Storage                           │
│  - CSV datasets (930+ mobile phones)                      │
│  - Trained models (.pkl, .joblib files)                   │
│  - LanceDB vector database (optional)                      │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User Request** → Nuxt page component
2. **Page Component** → Calls composable or store
3. **Composable/Store** → Makes API call to `/server/api/*`
4. **Nitro Route** → Proxies to Python FastAPI (port 8000)
5. **FastAPI** → Loads model → Performs inference → Returns result
6. **Response** → Flows back through layers to UI

---

## Technology Stack

### Frontend Stack

| Technology     | Version | Purpose                             |
| -------------- | ------- | ----------------------------------- |
| **Nuxt**       | 4.2.1   | Full-stack Vue framework            |
| **Vue**        | 3.5.25  | Progressive JavaScript framework    |
| **TypeScript** | 5.9.3   | Type-safe JavaScript                |
| **Nuxt UI**    | 2.19.0  | Component library (Tailwind CSS v4) |
| **Pinia**      | 3.0.4   | State management                    |
| **Nitro**      | 2.12.9  | Server engine                       |
| **Vite**       | 7.2.6   | Build tool                          |

### Backend Stack

| Technology       | Version | Purpose                    |
| ---------------- | ------- | -------------------------- |
| **Python**       | 3.14+   | Backend runtime            |
| **FastAPI**      | 0.104+  | Web framework              |
| **Uvicorn**      | Latest  | ASGI server                |
| **scikit-learn** | Latest  | ML models (primary)        |
| **TensorFlow**   | Latest  | ML models (fallback)       |
| **LanceDB**      | Latest  | Vector database (optional) |

### Development Tools

| Tool           | Purpose                     |
| -------------- | --------------------------- |
| **ESLint 9**   | Code linting (flat config)  |
| **Prettier**   | Code formatting             |
| **Playwright** | E2E testing                 |
| **Vitest**     | Unit testing                |
| **Sentry**     | Error tracking & monitoring |
| **TypeScript** | Type checking               |

### Infrastructure

| Component          | Purpose                           |
| ------------------ | --------------------------------- |
| **Nginx**          | Reverse proxy, SSL, rate limiting |
| **Systemd**        | Service management (Linux)        |
| **Docker**         | Containerization (optional)       |
| **GitHub Actions** | CI/CD pipeline                    |

---

## Project Structure

### Directory Tree

```
matlab-nuxt-app/
├── app.vue                    # Root Vue component
├── nuxt.config.ts             # Nuxt configuration
├── package.json               # Dependencies & scripts
│
├── pages/                     # Route pages (11 pages)
│   ├── index.vue              # Home page
│   ├── search.vue             # Phone search
│   ├── compare.vue            # Phone comparison
│   ├── recommendations.vue    # Price recommendations
│   ├── ai-demo.vue            # AI predictions demo
│   ├── model-showcase.vue     # ML model showcase
│   ├── datamine.vue           # Data mining
│   ├── advanced.vue            # Advanced analytics
│   ├── ml-comparison.vue      # Model comparison
│   ├── ab-testing.vue         # A/B testing dashboard
│   └── api-docs.vue           # API documentation
│
├── layouts/
│   └── default.vue            # Default layout (navigation + footer)
│
├── components/                 # Vue components (15 components)
│   ├── EnhancedNavigation.vue      # Main navigation
│   ├── OptimizedImage.vue          # Image optimization
│   ├── ThemeToggle.vue              # Dark/light theme
│   ├── UserPreferencesDialog.vue     # User settings
│   ├── DashboardContent.vue         # Dashboard content
│   ├── MCPServerManager.vue         # MCP server management
│   ├── PerformanceMetrics.vue        # Performance display
│   └── Analytics*.vue               # 5 analytics chart components
│
├── composables/               # Vue composables (13 composables)
│   ├── useUserPreferences.ts        # User preferences
│   ├── usePredictionHistory.ts      # Prediction history
│   ├── useApiConfig.ts              # API configuration
│   ├── useSentryLogger.ts           # Error logging
│   ├── useApiStatus.ts               # API health monitoring
│   ├── useResponsive.ts              # Responsive utilities
│   └── ... (7 more)
│
├── stores/                     # Pinia stores (6 stores)
│   ├── abTestingStore.ts            # A/B testing state
│   ├── predictionHistoryStore.ts    # Prediction history
│   ├── userPreferencesStore.ts      # User preferences
│   ├── advancedModelsStore.ts        # Advanced models
│   ├── apiStore.ts                  # API status
│   └── predictionValidationStore.ts  # Input validation
│
├── server/                     # Nitro server routes
│   ├── api/
│   │   ├── health.get.ts            # Health check
│   │   ├── predict/                 # Prediction endpoints
│   │   │   ├── price.post.ts
│   │   │   ├── ram.post.ts
│   │   │   ├── battery.post.ts
│   │   │   └── brand.post.ts
│   │   ├── dataset/                 # Dataset endpoints
│   │   │   ├── statistics.get.ts
│   │   │   ├── search.get.ts
│   │   │   └── ...
│   │   └── advanced/                 # Advanced endpoints
│   │       ├── models.get.ts
│   │       └── compare.post.ts
│   └── utils/
│       └── get-python-api-url.ts    # API URL utility
│
├── plugins/                    # Nuxt plugins (2 plugins)
│   ├── pinia-init.ts                # Pinia initialization
│   └── apexcharts.client.ts         # ApexCharts (client-only)
│
├── assets/
│   └── css/
│       └── main.css                 # Global styles (Tailwind)
│
├── public/                     # Static assets
│   ├── mobile_images/               # Phone images
│   └── ... (71 files)
│
├── python_api/                 # Python FastAPI backend
│   ├── api.py                       # Main FastAPI app
│   ├── predictions_sklearn.py       # scikit-learn models
│   ├── predictions_tensorflow.py    # TensorFlow models
│   ├── predictions_distilled.py     # Distilled models
│   ├── dataset_endpoints.py         # Dataset API
│   ├── api_price_endpoints.py       # Price prediction API
│   ├── api_analytics_endpoints.py   # Analytics API
│   ├── api_advanced_endpoints.py    # Advanced ML API
│   ├── lancedb_utils.py             # LanceDB integration
│   └── trained_models/              # Model files (.pkl, .joblib)
│
├── matlab/                     # MATLAB training scripts
│   ├── analyze_mobiles_dataset.m
│   ├── check_matlab_capabilities.m
│   └── ...
│
├── data/                       # Datasets
│   └── Mobiles Dataset (2025).csv
│
├── infrastructure/             # Deployment configs
│   ├── nginx/
│   │   └── nginx.conf               # Nginx configuration
│   ├── systemd/
│   │   ├── python-api.service      # Python API service
│   │   └── nuxt-app.service        # Nuxt app service
│   └── scripts/                    # Deployment scripts
│
├── scripts/                     # Automation scripts
│   ├── optimize_models.py           # Model optimization
│   ├── optimize_images.py           # Image optimization
│   └── ... (126 files)
│
└── tests/                       # Test files
    └── playwright/                 # E2E tests
```

---

## Dependencies Analysis

### Production Dependencies

#### Core Framework

- `nuxt@^4.2.1` - Main framework
- `vue@3.5.25` (via Nuxt) - UI framework
- `@nuxt/ui@^2.19.0` - UI component library
- `@pinia/nuxt@^0.11.3` - State management
- `pinia@^3.0.4` - State management core

#### UI & Visualization

- `@heroicons/vue@^2.2.0` - Icon library
- `apexcharts@^5.3.6` - Chart library
- `vue3-apexcharts@^1.10.0` - Vue wrapper
- `chart.js@^4.5.1` - Alternative chart library
- `vue-chartjs@^5.3.3` - Vue wrapper

#### Data & Search

- `@algolia/client-search@^5.45.0` - Algolia search
- `algoliasearch@^5.45.0` - Search client

#### Monitoring & Error Tracking

- `@sentry/nuxt@^10.27.0` - Sentry integration
- `@sentry/cli@^2.58.2` - Sentry CLI tools

#### Utilities

- `@modelcontextprotocol/sdk@^1.24.3` - MCP SDK
- `@vercel/sdk@^1.18.1` - Vercel SDK
- `puppeteer@^24.31.0` - Browser automation
- `pinia-plugin-persistedstate@^4.7.1` - State persistence

### Development Dependencies

#### Type Checking & Linting

- `typescript@^5.9.3` - TypeScript compiler
- `vue-tsc@^3.1.3` - Vue TypeScript checker
- `eslint@^9.14.0` - Linter
- `@typescript-eslint/*` - TypeScript ESLint rules
- `eslint-plugin-vue@^10.6.2` - Vue linting
- `prettier@^3.2.5` - Code formatter

#### Testing

- `@playwright/test@^1.57.0` - E2E testing
- `vitest@^4.0.15` - Unit testing

#### Build Tools

- `concurrently@^9.0.1` - Run multiple commands
- `cross-env@^10.1.0` - Cross-platform env vars

### Dependency Overrides

```json
{
  "glob": "10.1.0",
  "@modelcontextprotocol/sdk": "^1.24.3"
}
```

**Reason**: Ensures consistent versions across nested dependencies.

---

## API Architecture

### Nuxt Server API Routes (`/server/api/*`)

#### Health & Status

- `GET /api/health` - Python API health check

#### Predictions

- `POST /api/predict/price` - Price prediction
- `POST /api/predict/ram` - RAM prediction
- `POST /api/predict/battery` - Battery prediction
- `POST /api/predict/brand` - Brand classification
- `POST /api/predict/advanced` - Advanced predictions

#### Dataset Operations

- `GET /api/dataset/statistics` - Dataset statistics
- `GET /api/dataset/search` - Search dataset
- `GET /api/dataset/columns` - Get column names
- `GET /api/dataset/cleaned-data` - Get cleaned data
- `POST /api/dataset/compare` - Compare phones
- `POST /api/dataset/similar` - Find similar phones
- `GET /api/dataset/quality-report` - Data quality report
- `GET /api/dataset/preprocessing-status` - Preprocessing status
- `GET /api/dataset/models-by-price` - Models by price range
- `GET /api/dataset/model/[name]` - Get specific model info

#### Advanced ML

- `GET /api/advanced/models` - List available models
- `POST /api/advanced/predict` - Advanced predictions
- `POST /api/advanced/compare` - Model comparison

#### Products

- `GET /api/products` - Get product list (with pagination, search, filters)

#### Utilities

- `POST /api/find-closest-model` - Find closest model match
- `POST /api/algolia/index` - Index to Algolia

### Python FastAPI Endpoints (`http://localhost:8000`)

#### Core Predictions

- `POST /api/predict/price` - Price prediction (multiple models)
- `POST /api/predict/ram` - RAM prediction
- `POST /api/predict/battery` - Battery prediction
- `POST /api/predict/brand` - Brand classification

#### Dataset API

- `GET /api/dataset/statistics` - Dataset statistics
- `GET /api/dataset/search` - Search dataset
- `POST /api/dataset/compare` - Compare phones

#### Analytics

- `GET /api/analytics/*` - Analytics endpoints

#### Advanced ML

- `GET /api/advanced/models` - Available models
- `POST /api/advanced/compare` - Model comparison
- `POST /api/advanced/predict` - Advanced predictions

#### LanceDB (Optional)

- `POST /api/lancedb/*` - Vector search endpoints

### API Flow Pattern

```
Client → Nuxt API Route → Python FastAPI → Model Inference → Response
         (Nitro Server)    (Port 8000)     (scikit-learn)
```

**Benefits:**

- Single entry point (Nuxt handles routing)
- Type-safe API calls (TypeScript)
- Error handling at Nuxt level
- CORS handled by Nuxt
- Health checks in Nuxt layer

---

## State Management

### Pinia Stores

#### 1. `abTestingStore` (A/B Testing)

**Purpose**: Manage A/B test configurations and results

**State:**

- `currentTest: ABTestConfig | null` - Current test configuration
- `testResult: ABTestResult | null` - Latest test result
- `isRunningTest: boolean` - Test execution status
- `testHistory: ABTestResult[]` - Test history (max 10)
- `availableModels: string[]` - Available models for testing

**Actions:**

- `initialize()` - Initialize store and fetch models
- `createTest(config)` - Create new test configuration
- `runABTest()` - Execute A/B test (API with fallback)
- `resetTest()` - Clear current test
- `clearHistory()` - Clear test history

**Getters:**

- `isTestReady` - Check if test can be run
- `recentTests` - Last 5 tests
- `testTypes` - Available test types
- `confidenceLevels` - Confidence level options

#### 2. `predictionHistoryStore` (Prediction History)

**Purpose**: Store and persist prediction history

**State:**

- `history: PredictionHistoryItem[]` - Prediction history (max 50)

**Actions:**

- `loadHistory()` - Load from localStorage
- `savePrediction(item)` - Save new prediction
- `clearHistory()` - Clear all history

**Getters:**

- `getAllHistory()` - All history items
- `getHistoryByModel(model)` - Filter by model type

**Persistence**: localStorage (`mobile-prediction-history`)

#### 3. `userPreferencesStore` (User Preferences)

**Purpose**: Manage user preferences

**State:**

- User preference settings

**Actions:**

- Preference management methods

#### 4. `advancedModelsStore` (Advanced Models)

**Purpose**: Manage advanced ML model state

**State:**

- Model configurations and training metrics

**Actions:**

- Model management methods

#### 5. `apiStore` (API Status)

**Purpose**: Track Python API health status

**State:**

- `apiStatus` - Current API status
- Health check state

**Actions:**

- `checkApiStatus()` - Check API health

#### 6. `predictionValidationStore` (Input Validation)

**Purpose**: Validate prediction inputs

**State:**

- Validation rules and errors

**Actions:**

- Input validation methods

### Store Initialization

**Plugin**: `plugins/pinia-init.ts`

- Initializes all stores on app startup
- Loads persisted state from localStorage
- Sets up store watchers

---

## Component Architecture

### Component Categories

#### 1. Navigation & Layout

- **`EnhancedNavigation.vue`** - Main navigation bar with routing
- **`DashboardSidebar.vue`** - Sidebar navigation

#### 2. User Interface

- **`ThemeToggle.vue`** - Dark/light theme switcher
- **`UserPreferencesDialog.vue`** - User settings dialog
- **`OptimizedImage.vue`** - Optimized image component with WebP support

#### 3. Dashboard & Analytics

- **`DashboardContent.vue`** - Main dashboard content
- **`PerformanceMetrics.vue`** - Performance metrics display
- **`MagicUIDashboard.vue`** - Magic UI dashboard
- **`AnalyticsAccuracyChart.vue`** - Accuracy chart
- **`AnalyticsTopBrandsChart.vue`** - Top brands chart
- **`AnalyticsGeographicalChart.vue`** - Geographical chart
- **`AnalyticsFeatureImportanceChart.vue`** - Feature importance
- **`AnalyticsYearlyTrendsChart.vue`** - Yearly trends

#### 4. System Management

- **`MCPServerManager.vue`** - MCP server management interface

#### 5. Demos & Examples

- **`ImageOptimizationDemo.vue`** - Image optimization demo

### Component Usage Pattern

**Auto-Import**: All components in `components/` are auto-imported by Nuxt

```vue
<template>
  <!-- No import needed! -->
  <EnhancedNavigation />
  <OptimizedImage src="..." />
</template>
```

**Props & Events**: Standard Vue 3 Composition API pattern

---

## Build Configuration

### Nuxt Configuration (`nuxt.config.ts`)

#### Modules

```typescript
modules: [
  '@nuxt/ui', // UI component library
  '@pinia/nuxt', // State management
];
```

#### CSS

```typescript
css: ['assets/css/main.css']; // Tailwind CSS v4
```

#### Runtime Config

```typescript
runtimeConfig: {
  apiSecret: process.env.NUXT_API_SECRET,  // Server-only
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
    pyApiDisabled: process.env.NUXT_PUBLIC_PY_API_DISABLED === '1',
  }
}
```

#### TypeScript

```typescript
typescript: {
  strict: true,
  typeCheck: false,  // Disabled in dev for speed
}
```

#### Source Maps

```typescript
sourcemap: {
  client: 'hidden',  // Generate but don't expose
  server: true,      // Enable for Sentry
}
```

### Build Scripts

| Script      | Command                  | Purpose                  |
| ----------- | ------------------------ | ------------------------ |
| `dev`       | `nuxt dev`               | Development server       |
| `build`     | `nuxt build`             | Production build         |
| `generate`  | `nuxt generate`          | Static site generation   |
| `preview`   | `nuxt preview`           | Preview production build |
| `dev:all`   | Concurrent Python + Nuxt | Run both servers         |
| `typecheck` | `vue-tsc`                | Type checking            |
| `lint`      | `eslint`                 | Code linting             |
| `format`    | `prettier`               | Code formatting          |

### Environment Variables

```bash
# Python API
NUXT_PUBLIC_API_BASE=http://localhost:8000
NUXT_PUBLIC_PY_API_DISABLED=0

# Sentry
SENTRY_DSN=...

# Node
NODE_ENV=production|development
```

---

## Deployment Infrastructure

### Nginx Configuration

**Location**: `infrastructure/nginx/nginx.conf`

**Features:**

- Reverse proxy to Nuxt (port 3000)
- Rate limiting (100 req/min per IP)
- Gzip compression
- Security headers (CSP, HSTS, etc.)
- SSL/HTTPS support
- WebSocket support
- Health check endpoint

### Systemd Services

#### Python API Service

**File**: `infrastructure/systemd/python-api.service`

**Configuration:**

- Runs FastAPI with Uvicorn
- Resource limits (memory, CPU)
- Auto-restart on failure
- Log directory: `/var/www/matlab-mobile-dataset/python_api/logs`

#### Nuxt App Service

**File**: `infrastructure/systemd/nuxt-app.service`

**Configuration:**

- Runs Nuxt production server
- Resource limits
- Output directory: `/var/www/matlab-mobile-dataset/.output`

### Deployment Scripts

**Location**: `infrastructure/scripts/`

- `deploy_production.sh` - Production deployment
- `health_check.sh` - Health check script
- `backup.sh` - Backup script

---

## Data Flow Analysis

### Prediction Flow

```
1. User Input (Page)
   ↓
2. Validation (predictionValidationStore)
   ↓
3. API Call (composable/useApiConfig)
   ↓
4. Nuxt API Route (/server/api/predict/*)
   ↓
5. Python FastAPI (/api/predict/*)
   ↓
6. Model Loading (scikit-learn/TensorFlow)
   ↓
7. Inference
   ↓
8. Response → Store → UI Update
```

### Data Storage Flow

```
CSV Dataset
   ↓
Python Preprocessing
   ↓
Trained Models (.pkl)
   ↓
FastAPI Model Loading
   ↓
Inference Cache
   ↓
Response
```

---

## Security Analysis

### Implemented Security Features

1. **CORS Protection** - Configured in FastAPI and Nuxt
2. **Rate Limiting** - Nginx and FastAPI middleware
3. **Security Headers** - Nginx configuration
4. **Input Validation** - Store-level validation
5. **Error Tracking** - Sentry integration
6. **Source Maps** - Hidden from public (Sentry only)

### Security Headers (Nginx)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- `Content-Security-Policy`

---

## Performance Analysis

### Optimization Strategies

1. **Image Optimization**
   - WebP format support
   - Lazy loading
   - Responsive images
   - Component: `OptimizedImage.vue`

2. **Model Optimization**
   - Distilled models (10x faster)
   - Model compression (77% size reduction)
   - Joblib compression

3. **Code Splitting**
   - Nuxt automatic code splitting
   - CSS code splitting (Vite)
   - Lazy component loading

4. **Caching**
   - Prediction history caching
   - API response caching
   - Static asset caching (Nginx)

---

## Development Workflow

### Local Development

```bash
# Start all services
npm run dev:all

# Start only Nuxt
npm run dev

# Start only Python API
npm run dev:python

# Type checking
npm run typecheck

# Linting
npm run lint

# Formatting
npm run format
```

### Testing

```bash
# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui

# Unit tests (Vitest)
# (configured but not actively used)
```

---

## Known Limitations

1. **Type Checking**: Disabled in dev mode for faster startup
2. **Store Usage**: Stores exist but not fully integrated in pages
3. **Component Usage**: Many components created but not used in pages
4. **Testing**: E2E tests exist but unit tests minimal
5. **Documentation**: Previously extensive, now analytical only

---

## Future Enhancements

### Recommended Improvements

1. **Store Integration**: Integrate stores into pages (see integration guide)
2. **Component Usage**: Use existing components in pages
3. **Testing**: Expand unit test coverage
4. **Performance**: Implement more aggressive caching
5. **Monitoring**: Enhanced Sentry integration
6. **Documentation**: Add API documentation generation

---

## Conclusion

This is a **production-ready** full-stack application with:

- ✅ Modern Nuxt 4 + Vue 3 architecture
- ✅ Type-safe TypeScript implementation
- ✅ Comprehensive ML prediction system
- ✅ Robust error handling and monitoring
- ✅ Scalable deployment infrastructure
- ✅ Well-structured codebase

**Current State**: Functional and deployed, with room for optimization and feature expansion.
