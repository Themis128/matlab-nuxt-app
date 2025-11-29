# MATLAB Deep Learning & Mobile Dataset Analysis

## 📚 Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Features](#features)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Project Overview

A hybrid **MATLAB + Nuxt.js 4** application combining MATLAB's Deep Learning Toolbox for model training with a modern web interface. The system predicts mobile phone specifications (price, RAM, battery, brand) and provides comprehensive dataset exploration capabilities.

### Key Technologies

- **Backend AI**: MATLAB Deep Learning Toolbox + Python FastAPI (scikit-learn models)
- **Frontend**: Nuxt 4, Vue 3, Nuxt UI, TailwindCSS
- **State Management**: Pinia
- **Testing**: Playwright (E2E)
- **Code Quality**: ESLint 9 (flat config), Prettier, EditorConfig

## Quick Start

### Prerequisites

- **MATLAB R2026a** with Deep Learning Toolbox
- **Python 3.14+** (venv included)
- **Node.js 18+**
- **GPU**: NVIDIA RTX 3070 (7.46GB VRAM) - optional but recommended

### Installation

```powershell
# 1. Clone repository
git clone https://github.com/Themis128/matlab-nuxt-app.git
cd matlab-nuxt-app

# 2. Install Node dependencies
npm install

# 3. Setup Python environment
.\scripts\setup_python_env.bat
.\scripts\activate_python_env.bat
pip install -r requirements.txt

# 4. Setup MATLAB (in MATLAB console)
cd('matlab')
run('setup_matlab_env.m')

# 5. Start development servers
npm run dev:all  # Concurrent: Python API + Nuxt dev server
```

### Verify Installation

```powershell
npm run check        # Check MATLAB capabilities
npm run csv:validate # Validate dataset schema
```

## Architecture

### System Diagram

```
┌─────────────────┐
│  Nuxt 4 Frontend│ ← Vue 3, Nuxt UI, Pinia
│  (Port 3000)    │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│ Nitro API Routes│ ← Server middleware
│ /server/api/*   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Python FastAPI │ ← scikit-learn models
│  (Port 8000)    │ ← Fallback: TensorFlow
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Trained Models  │
│ .pkl / .joblib  │ ← Optimized with joblib compression
└─────────────────┘

┌─────────────────┐
│ MATLAB Training │
│ Pipeline        │ ← Network architecture + hyperparameter tuning
└─────────────────┘
```

### Directory Structure

```
├── matlab/                    # MATLAB training scripts
│   ├── setup_matlab_env.m
│   ├── analyze_mobiles_dataset.m
│   └── run_all_examples.m
├── python_api/                # FastAPI prediction server
│   ├── api.py                 # Main FastAPI app
│   ├── predictions_sklearn.py # scikit-learn models (primary)
│   ├── trained_models/        # .pkl, .joblib model files
│   └── TENSORFLOW_TRAINING_GUIDE.md
├── scripts/                   # Automation utilities
│   ├── utils/                 # JS/Python helpers
│   ├── optimize_models.py     # Model compression (77% reduction)
│   ├── optimize_images.py     # WebP conversion
│   └── validate_csv_schema.py # Schema enforcement
├── data/                      # Datasets
│   └── Mobiles Dataset (2025).csv
├── server/api/                # Nuxt Nitro endpoints
├── pages/                     # Vue route pages
├── components/                # Vue components
├── stores/                    # Pinia state management
├── tests/                     # Playwright E2E tests
└── docs/                      # Documentation
```

## Features

### 🤖 Prediction Models

All models trained with enhanced feature engineering (11 additional features):

| Model                 | Accuracy | Features                                                     |
| --------------------- | -------- | ------------------------------------------------------------ |
| **Price Predictor**   | 94-98%   | RAM, battery, screen, processor, brand segment, price ratios |
| **RAM Predictor**     | ~96%     | Battery, screen, price, brand, temporal features             |
| **Battery Predictor** | ~95%     | RAM, screen, price, weight, polynomial features              |
| **Brand Classifier**  | ~98%     | All specs + interaction features                             |

**Enhanced Features Include:**

- Price ratios (RAM/price, battery/price, screen/price)
- Brand segments (premium/mid/budget)
- Temporal: months_since_launch, technology_generation
- Interactions: RAM×battery, screen×weight, camera×price
- Polynomial: squared terms, square roots

### 📊 Dataset Analysis

- **930 mobile phones** (2020-2025)
- **17 columns**: specs, prices (6 regions), processor, cameras
- **Insight extraction**: price drivers, market trends, competitive analysis, recommendations, anomaly detection
- **Results**: `data/dataset_analysis_results.json`

### 🎨 Web Interface

- **Dashboard**: Performance metrics, model comparison
- **Predictions**: Interactive forms with validation
- **Compare**: Side-by-side model comparison
- **Search**: Filter by specs, price range, brand
- **Explore**: Dataset visualization with ApexCharts
- **Recommendations**: AI-powered phone suggestions

### 🚀 Optimizations

**Model Compression** (`npm run optimize:models`):

- 77.9% size reduction (13.85MB → 3.06MB)
- Format: pickle → joblib with compression=9
- No accuracy loss

**Image Optimization** (`npm run optimize:images`):

- PNG: 3.3% reduction via lossless compression
- WebP: 55.8% reduction vs original PNG
- Component: `<OptimizedImage>` with `<picture>` fallback

**CSV Compression** (`npm run optimize:csv`):

- 86.5% reduction (292KB → 40KB)
- Gzip compression, duplicate removal
- Schema validation: `npm run csv:validate`

## Development

### Available Scripts

```powershell
# Development
npm run dev              # Nuxt dev server only
npm run dev:python       # Python API only
npm run dev:all          # Both servers concurrently

# Code Quality
npm run lint             # ESLint check (max-warnings=0)
npm run lint:fix         # Auto-fix issues
npm run format           # Prettier format
npm run typecheck        # TypeScript validation

# Testing
npm test                 # Playwright E2E tests
npm run test:ui          # Playwright UI mode
npm run test:report      # View test report

# Optimization
npm run optimize         # Run all optimizations
npm run optimize:models  # Compress .pkl files
npm run optimize:images  # Generate WebP variants
npm run optimize:csv     # Compress CSV datasets

# Utilities
npm run check            # Check MATLAB/toolbox availability
npm run csv:validate     # Validate CSV schema
npm run mat:view         # View .mat file contents
```

### MATLAB Training Workflow

```matlab
% 1. Setup environment
cd('matlab')
run('setup_matlab_env.m')

% 2. Analyze dataset
run('analyze_mobiles_dataset.m')

% 3. Train models with enhanced features
cd('../mobiles-dataset-docs')
run('train_models_with_enhanced_features.m')

% 4. View results
run('VIEW_RESULTS.m')
run('visualize_results.m')
```

### Python Model Training (Alternative)

```powershell
cd python_api
python train_models_sklearn.py  # Train all models
python api.py                    # Start API server
```

### Code Style

- **EditorConfig**: LF line endings, 2-space indent (4 for MATLAB/Python)
- **ESLint**: Flat config (`eslint.config.cjs`), no legacy `.eslintrc`
- **Prettier**: Single quotes, no semicolons, trailing commas ES5
- **Pre-commit**: Format + lint via `simple-git-hooks`

## Testing

### E2E Tests (Playwright)

```powershell
npm test                      # All tests
npm run test:ui               # Interactive mode
npx playwright test --headed  # Show browser
```

**Test Coverage:**

- Prediction API integration
- Compare models functionality
- Dashboard rendering
- Search & filter
- Dataset exploration
- Form validation

**Configuration**: `playwright.config.ts`

- Multi-browser: Chromium, Firefox, WebKit, Mobile variants
- Retries: 2 (CI), 0 (local)
- Screenshots/videos on failure
- Base URL: `http://localhost:3000`

### API Testing

```powershell
npm run test:api          # Test Python API endpoints
npm run test:api:verbose  # Detailed output
```

## Deployment

### Build for Production

```powershell
npm run build        # Generate .output/ directory
npm run preview      # Preview production build
```

### Environment Variables

Create `.env`:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
PYTHON_API_URL=http://localhost:8000
```

### Python API Deployment

```powershell
# Production server (uvicorn)
cd python_api
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
```

### Static Generation

```powershell
npm run generate  # SSG to .output/public
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Run `npm run format && npm run lint` before committing
4. Write tests for new features
5. Submit pull request

### Code Standards

- **TypeScript**: Strict mode, no `any` (use sparingly)
- **Vue 3**: Composition API, `<script setup>`
- **Python**: Type hints, docstrings
- **MATLAB**: Comments for complex logic

## License

MIT License - see [LICENSE](../LICENSE)

## Support

- **Issues**: https://github.com/Themis128/matlab-nuxt-app/issues
- **Documentation**: See `/docs` directory
- **MATLAB Guides**: See `matlab/` and `mobiles-dataset-docs/`

---

**Last Updated**: November 29, 2025
