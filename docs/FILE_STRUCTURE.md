# Required File Structure

> **Complete file structure that the application must have to run properly**

## Overview

This document describes the **required** file structure for the application. Files are categorized as:

- **Required** - Must exist for the app to run
- **Optional** - Enhances functionality but not required
- **Generated** - Created during build/runtime (not in repository)

---

## Root Directory Structure

```
matlab-nuxt-app/
├── 📄 REQUIRED FILES
│   ├── app.vue                    # Root Vue component (REQUIRED)
│   ├── nuxt.config.ts             # Nuxt configuration (REQUIRED)
│   ├── package.json               # Node.js dependencies (REQUIRED)
│   ├── tsconfig.json              # TypeScript configuration (REQUIRED)
│   └── .gitignore                 # Git ignore rules (REQUIRED)
│
├── 📁 REQUIRED DIRECTORIES
│   ├── pages/                     # Nuxt pages (REQUIRED)
│   ├── layouts/                   # Layout components (REQUIRED)
│   ├── components/                # Vue components (REQUIRED)
│   ├── composables/               # Vue composables (REQUIRED)
│   ├── stores/                    # Pinia stores (REQUIRED)
│   ├── server/                    # Nitro server routes (REQUIRED)
│   ├── plugins/                   # Nuxt plugins (REQUIRED)
│   ├── assets/                    # Static assets (CSS, etc.) (REQUIRED)
│   ├── public/                    # Public static files (REQUIRED)
│   ├── python_api/                  # Python FastAPI backend (REQUIRED)
│   └── data/                      # Dataset files (REQUIRED)
│
├── 📁 OPTIONAL DIRECTORIES
│   ├── types/                     # TypeScript type definitions (OPTIONAL)
│   ├── infrastructure/            # Deployment configs (OPTIONAL)
│   ├── scripts/                   # Automation scripts (OPTIONAL)
│   ├── matlab/                    # MATLAB training scripts (OPTIONAL)
│   ├── examples/                  # Example MATLAB scripts (OPTIONAL)
│   ├── tests/                     # Test files (OPTIONAL)
│   └── docs/                      # Documentation (OPTIONAL)
│
└── 📁 GENERATED DIRECTORIES (Not in repo)
    ├── node_modules/              # npm packages (GENERATED)
    ├── .nuxt/                     # Nuxt build cache (GENERATED)
    ├── .output/                   # Production build (GENERATED)
    ├── venv/                      # Python virtual environment (GENERATED)
    └── python_api/lancedb_data/   # LanceDB data (GENERATED)
```

---

## Required Files (Must Exist)

### Root Level

| File                | Purpose                           | Required                     |
| ------------------- | --------------------------------- | ---------------------------- |
| `app.vue`           | Root Vue component                | ✅ **YES**                   |
| `nuxt.config.ts`    | Nuxt framework configuration      | ✅ **YES**                   |
| `package.json`      | Node.js dependencies and scripts  | ✅ **YES**                   |
| `tsconfig.json`     | TypeScript compiler configuration | ✅ **YES**                   |
| `.gitignore`        | Git ignore patterns               | ✅ **YES**                   |
| `package-lock.json` | Locked dependency versions        | ✅ **YES** (for consistency) |

### Configuration Files

| File                      | Purpose                       | Required                          |
| ------------------------- | ----------------------------- | --------------------------------- |
| `eslint.config.cjs`       | ESLint linting rules          | ✅ **YES**                        |
| `playwright.config.ts`    | Playwright test configuration | ⚠️ **OPTIONAL** (if testing)      |
| `sentry.client.config.ts` | Sentry client config          | ⚠️ **OPTIONAL** (if using Sentry) |
| `sentry.server.config.ts` | Sentry server config          | ⚠️ **OPTIONAL** (if using Sentry) |
| `jsconfig.json`           | JavaScript project config     | ⚠️ **OPTIONAL**                   |

---

## Required Directories

### 1. `pages/` - Nuxt Pages (REQUIRED)

**Purpose:** Auto-routed Vue pages

**Required Files:**

```
pages/
├── index.vue              # Home page (REQUIRED)
└── [other-pages].vue      # Additional pages (OPTIONAL)
```

**Minimum:** At least `index.vue` must exist

---

### 2. `layouts/` - Layout Components (REQUIRED)

**Purpose:** Page layout templates

**Required Files:**

```
layouts/
└── default.vue            # Default layout (REQUIRED)
```

**Minimum:** At least `default.vue` must exist

---

### 3. `components/` - Vue Components (REQUIRED)

**Purpose:** Reusable Vue components (auto-imported by Nuxt)

**Structure:**

```
components/
├── EnhancedNavigation.vue      # Main navigation (RECOMMENDED)
├── OptimizedImage.vue          # Image component (OPTIONAL)
└── [other-components].vue      # Additional components (OPTIONAL)
```

**Minimum:** Directory must exist (can be empty)

---

### 4. `composables/` - Vue Composables (REQUIRED)

**Purpose:** Reusable composition functions (auto-imported by Nuxt)

**Required Files:**

```
composables/
├── useApiConfig.ts        # API configuration (REQUIRED)
└── [other-composables].ts # Additional composables (OPTIONAL)
```

**Minimum:** `useApiConfig.ts` is required for API connection

---

### 5. `stores/` - Pinia Stores (REQUIRED)

**Purpose:** State management stores

**Structure:**

```
stores/
├── [store-name].ts       # Pinia stores (OPTIONAL but recommended)
```

**Minimum:** Directory must exist (can be empty if not using stores)

---

### 6. `server/` - Nitro Server Routes (REQUIRED)

**Purpose:** Server-side API routes

**Required Structure:**

```
server/
├── api/
│   ├── health.get.ts     # Health check endpoint (RECOMMENDED)
│   └── [other-routes].ts # Additional API routes (OPTIONAL)
└── utils/
    └── get-python-api-url.ts  # API URL utility (REQUIRED)
```

**Minimum:** `server/utils/get-python-api-url.ts` is required

---

### 7. `plugins/` - Nuxt Plugins (REQUIRED)

**Purpose:** Plugins that run on app initialization

**Required Files:**

```
plugins/
├── pinia-init.ts         # Pinia initialization (REQUIRED if using Pinia)
└── [other-plugins].ts    # Additional plugins (OPTIONAL)
```

**Minimum:** Directory must exist (can be empty if no plugins)

---

### 8. `assets/` - Static Assets (REQUIRED)

**Purpose:** CSS, images, fonts processed by Vite

**Required Structure:**

```
assets/
└── css/
    └── main.css          # Main stylesheet (REQUIRED if using CSS)
```

**Minimum:** Directory must exist (can be empty if using only Tailwind)

---

### 9. `public/` - Public Static Files (REQUIRED)

**Purpose:** Files served directly (not processed)

**Required Structure:**

```
public/
├── [static-files]       # Images, fonts, etc. (OPTIONAL)
└── mobile_images/       # Mobile phone images (OPTIONAL)
```

**Minimum:** Directory must exist (can be empty)

---

### 10. `python_api/` - Python Backend (REQUIRED)

**Purpose:** FastAPI backend for ML predictions

**Required Files:**

```
python_api/
├── api.py                      # Main FastAPI app (REQUIRED)
├── requirements.txt            # Python dependencies (REQUIRED)
├── predictions_sklearn.py      # Sklearn models (REQUIRED)
├── predictions_mock.py         # Mock predictions (REQUIRED - fallback)
├── price_apis.py              # Price database (REQUIRED)
├── create_price_db.py         # Database creation script (REQUIRED)
├── trained_models/            # ML model files (REQUIRED)
│   ├── price_predictor_sklearn.pkl
│   ├── ram_predictor_sklearn.pkl
│   ├── battery_predictor_sklearn.pkl
│   ├── brand_classifier_sklearn.pkl
│   └── [other-models].pkl
└── price_database.db          # SQLite database (GENERATED but required)
```

**Minimum Required:**

- `api.py` - Main application
- `requirements.txt` - Dependencies
- `predictions_mock.py` - Fallback predictions
- At least one model file in `trained_models/`

---

### 11. `data/` - Dataset Files (REQUIRED)

**Purpose:** CSV datasets for training and reference

**Required Files:**

```
data/
└── Mobiles Dataset (2025).csv  # Main dataset (REQUIRED)
```

**Minimum:** Main CSV dataset must exist for database creation

---

## Optional Directories

### `types/` - TypeScript Types (OPTIONAL)

```
types/
└── [type-definitions].ts
```

**Purpose:** Custom TypeScript type definitions

---

### `infrastructure/` - Deployment Configs (OPTIONAL)

```
infrastructure/
├── nginx/
│   └── nginx.conf
├── systemd/
│   ├── python-api.service
│   └── nuxt-app.service
└── scripts/
    └── deploy_production.sh
```

**Purpose:** Production deployment configurations

---

### `scripts/` - Automation Scripts (OPTIONAL)

```
scripts/
├── [automation-scripts].js
├── [automation-scripts].py
└── [automation-scripts].bat
```

**Purpose:** Build, deployment, and utility scripts

---

### `matlab/` - MATLAB Scripts (OPTIONAL)

```
matlab/
└── [matlab-scripts].m
```

**Purpose:** MATLAB model training scripts (not required for app to run)

---

### `tests/` - Test Files (OPTIONAL)

```
tests/
└── playwright/
    └── [test-files].ts
```

**Purpose:** E2E and unit tests

---

### `docs/` - Documentation (OPTIONAL)

```
docs/
├── README.md
├── SETUP_GUIDE.md
└── [other-docs].md
```

**Purpose:** Project documentation

---

## Generated Files & Directories (Not in Repository)

These are created during setup/build and should be in `.gitignore`:

```
# Node.js
node_modules/          # npm packages
.nuxt/                 # Nuxt build cache
.output/               # Production build output
.nitro/                # Nitro build cache
.cache/                # Build cache

# Python
venv/                 # Python virtual environment
__pycache__/          # Python bytecode
*.pyc                 # Compiled Python files

# Databases
python_api/price_database.db    # SQLite database (generated)
python_api/lancedb_data/        # LanceDB data (generated)

# Logs
*.log                 # Log files
debug.log             # Debug logs

# Environment
.env                  # Environment variables
.env.local            # Local environment variables
```

---

## File Structure Validation

### Minimum Required Structure

For the app to run, you need at minimum:

```
matlab-nuxt-app/
├── app.vue
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── pages/
│   └── index.vue
├── layouts/
│   └── default.vue
├── components/          # (can be empty)
├── composables/
│   └── useApiConfig.ts
├── stores/              # (can be empty)
├── server/
│   └── utils/
│       └── get-python-api-url.ts
├── plugins/             # (can be empty)
├── assets/
│   └── css/
│       └── main.css
├── public/              # (can be empty)
├── python_api/
│   ├── api.py
│   ├── requirements.txt
│   ├── predictions_mock.py
│   └── trained_models/
│       └── [at least one model file]
└── data/
    └── Mobiles Dataset (2025).csv
```

---

## File Descriptions

### Core Application Files

#### `app.vue`

- **Purpose:** Root Vue component
- **Required:** ✅ Yes
- **Content:** Main app template with `<NuxtPage />` or `<NuxtLayout>`

#### `nuxt.config.ts`

- **Purpose:** Nuxt framework configuration
- **Required:** ✅ Yes
- **Key Settings:**
  - Modules (`@nuxt/ui`, `@pinia/nuxt`)
  - Runtime config (API URLs)
  - TypeScript settings
  - Build configuration

#### `package.json`

- **Purpose:** Node.js project configuration
- **Required:** ✅ Yes
- **Contains:**
  - Dependencies
  - Scripts (dev, build, etc.)
  - Project metadata

#### `tsconfig.json`

- **Purpose:** TypeScript compiler configuration
- **Required:** ✅ Yes
- **Extends:** Nuxt TypeScript config

---

### Python Backend Files

#### `python_api/api.py`

- **Purpose:** Main FastAPI application
- **Required:** ✅ Yes
- **Contains:**
  - FastAPI app initialization
  - CORS configuration
  - Route registration
  - Health check endpoint

#### `python_api/requirements.txt`

- **Purpose:** Python dependencies
- **Required:** ✅ Yes
- **Key Dependencies:**
  - `fastapi`
  - `uvicorn`
  - `scikit-learn`
  - `pandas`
  - `numpy`

#### `python_api/predictions_sklearn.py`

- **Purpose:** Scikit-learn model predictions
- **Required:** ✅ Yes (for production)
- **Fallback:** `predictions_mock.py` if sklearn unavailable

#### `python_api/price_apis.py`

- **Purpose:** SQLite database interface
- **Required:** ✅ Yes (for product data)

#### `python_api/create_price_db.py`

- **Purpose:** Database initialization script
- **Required:** ✅ Yes (to create database)

---

### Data Files

#### `data/Mobiles Dataset (2025).csv`

- **Purpose:** Main mobile phone dataset
- **Required:** ✅ Yes
- **Used For:**
  - Database population
  - Model training reference
  - Product listings

---

## Directory Permissions

### Required Permissions

- **Read:** All directories
- **Write:**
  - `python_api/` (for database creation)
  - `public/` (for generated files)
  - Generated directories (`.output`, `node_modules`, etc.)

---

## File Size Considerations

### Large Files (May Need Git LFS)

- `python_api/trained_models/*.pkl` - Model files (can be large)
- `data/*.csv` - Dataset files
- `public/mobile_images/*` - Image files

**Recommendation:** Use Git LFS for files > 100MB

---

## Missing File Detection

### Check Script

Create a script to verify required files:

```bash
#!/bin/bash
# verify_structure.sh

REQUIRED_FILES=(
  "app.vue"
  "nuxt.config.ts"
  "package.json"
  "tsconfig.json"
  "pages/index.vue"
  "layouts/default.vue"
  "python_api/api.py"
  "python_api/requirements.txt"
  "data/Mobiles Dataset (2025).csv"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
  else
    echo "✅ Found: $file"
  fi
done
```

---

## Common Issues

### Issue: Missing `pages/index.vue`

**Error:** Nuxt can't find default route
**Solution:** Create `pages/index.vue` with basic content

### Issue: Missing `layouts/default.vue`

**Error:** No layout found
**Solution:** Create `layouts/default.vue` with `<slot />`

### Issue: Missing `python_api/api.py`

**Error:** Backend not available
**Solution:** Ensure Python API file exists and is executable

### Issue: Missing `data/Mobiles Dataset (2025).csv`

**Error:** Database creation fails
**Solution:** Ensure CSV file exists in `data/` directory

---

## File Structure Best Practices

1. **Keep structure flat** - Don't nest too deeply
2. **Use consistent naming** - kebab-case for files, PascalCase for components
3. **Separate concerns** - Keep pages, components, stores separate
4. **Document structure** - Update this file when adding new directories
5. **Version control** - Don't commit generated files (use `.gitignore`)

---

## Quick Reference

### Minimum Files to Run App

```
✅ app.vue
✅ nuxt.config.ts
✅ package.json
✅ tsconfig.json
✅ pages/index.vue
✅ layouts/default.vue
✅ composables/useApiConfig.ts
✅ server/utils/get-python-api-url.ts
✅ python_api/api.py
✅ python_api/requirements.txt
✅ python_api/predictions_mock.py
✅ data/Mobiles Dataset (2025).csv
```

### Files Created During Setup

```
📦 node_modules/        (npm install)
📦 venv/                (python -m venv)
📦 python_api/price_database.db  (python create_price_db.py)
📦 .nuxt/               (nuxt dev)
📦 .output/             (nuxt build)
```

---

**Last Updated:** December 2025
**Version:** 1.0.0
