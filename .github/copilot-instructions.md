# MATLAB Deep Learning & Mobile Dataset Analysis Project

## Project Overview

This is a **hybrid MATLAB + Nuxt.js application** that combines MATLAB's Deep Learning Toolbox for model training with a modern web interface. The system predicts mobile phone specifications (price, RAM, battery, brand) and provides dataset exploration capabilities.

**Key Architecture:**

- **MATLAB scripts** (`.m` files) for deep learning model training and network architecture definition
- **Python API** (FastAPI) serves predictions from trained scikit-learn/TensorFlow models
- **Nuxt.js 4 frontend** with Nuxt UI, Pinia stores, and Nitro server API routes
- **Dual prediction system**: Python API (preferred) with graceful fallback to MATLAB-based endpoints

## Critical Developer Workflows

### Environment Setup

**Python environment (required for predictions):**

```powershell
# Windows
.\setup_python_env.bat
.\activate_python_env.bat

# Start Python API
cd python_api
python api.py  # Runs on http://localhost:8000
```

**MATLAB environment (for model training):**

```matlab
run('setup_matlab_env.m')  % Adds paths, checks toolboxes & GPU
```

### Running the Application

1. **Start Python API** (Terminal 1): `cd python_api && python api.py`
2. **Start Nuxt dev server** (Terminal 2): `npm run dev`
3. **Run tests**: `npm test` (requires both services running)

### Model Training & Evaluation

**Train all models with enhanced features:**

```matlab
run('mobiles-dataset-docs/train_models_with_enhanced_features.m')
```

**View model results:**

```matlab
run('mobiles-dataset-docs/VIEW_RESULTS.m')
run('mobiles-dataset-docs/visualize_results.m')
```

**Key insight:** Enhanced models use 11 additional features (price ratios, brand segments, temporal features) achieving 94-98% accuracy vs 62-81% baseline.

## Code Structure & Patterns

### MATLAB Conventions

**Network architecture patterns:**

- `examples/mobiles_tabular_regression.m` - Fully-connected networks for tabular data (price/RAM/battery prediction)
- `examples/mobiles_cnn_classification.m` - CNNs for image-based classification (if dataset has images)
- `examples/mobiles_hybrid_network.m` - Combines image features + tabular features

**Training pattern:**

```matlab
% 1. Load preprocessed data
load('mobiles-dataset-docs/preprocessed/preprocessed_data.mat');

% 2. Define network layers (always use featureInputLayer for tabular data)
layers = [
    featureInputLayer(numFeatures, 'Normalization', 'zscore')
    fullyConnectedLayer(128)
    batchNormalizationLayer
    reluLayer
    dropoutLayer(0.3)
    % ... more layers
    fullyConnectedLayer(1)  % or numClasses for classification
    regressionLayer  % or classificationLayer
];

% 3. Set training options (GPU auto-detected)
options = trainingOptions('adam', ...
    'MaxEpochs', 100, ...
    'ValidationData', {XVal, YVal}, ...
    'ExecutionEnvironment', 'auto');  % Uses GPU if available

% 4. Train
net = trainNetwork(XTrain, YTrain, layers, options);
```

**File naming:** `train_<target>_prediction_model.m` for training, `predict_<target>.m` for inference

### Nuxt/TypeScript Conventions

**API route pattern** (`server/api/predict/{model}.post.ts`):

```typescript
import { callPythonAPI } from '~/server/utils/python-api'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate required fields
  const requiredFields = ['ram', 'battery', 'screen', ...]

  // Try Python API first (returns null if unavailable)
  const result = await callPythonAPI<{ price: number }>('/api/predict/price', body)

  if (!result) {
    // Fallback logic could go here
    throw new Error('Python API is not available')
  }

  return result
})
```

**Pinia store pattern** (see `stores/apiStore.ts`, `stores/predictionValidationStore.ts`):

- `apiStore` manages Python API health checks with retry logic and connection tracking
- `predictionValidationStore` validates inputs and compares predictions
- `predictionHistoryStore` persists predictions to localStorage

**Composables** provide reusable logic:

- `useApiStatus` for API health monitoring
- `usePredictionValidation` for input validation before API calls
- `useResponsive` for mobile/desktop layouts

### Python API Structure

**Endpoint organization:**

- `api.py` - Main FastAPI app, includes routers from `api_price_endpoints.py` and `dataset_endpoints.py`
- `predictions_sklearn.py` - scikit-learn models (preferred, Python 3.14 compatible)
- `predictions_tensorflow.py` - TensorFlow models (fallback)
- `predictions.py` - Basic fallback without trained models

**Model files location:** `python_api/trained_models/*.pkl` (scikit-learn) or `.h5` (TensorFlow)

## Dataset & Features

**CSV location:** `data/Mobiles Dataset (2025).csv` or `mobiles-dataset-docs/Mobiles Dataset (2025).csv`

**Base features:** `ram`, `battery`, `screen`, `weight`, `year`, `company`, `front_camera`, `back_camera`, `processor`, `storage`

**Enhanced features** (added by `add_enhanced_features.m`):

- Price ratios: `ram_to_price`, `battery_to_price`, `screen_to_price`
- Brand segments: `brand_segment` (premium/mid/budget based on avg price)
- Temporal: `months_since_launch`, `technology_generation`
- Interactions: `ram_battery_interaction`, `screen_weight_ratio`

**Insight extraction:** Run `extract_all_insights.m` for price drivers, market trends, competitive analysis, recommendations, and anomaly detection. Results saved to `data/dataset_analysis_results.json`.

## Testing

**E2E tests** use Playwright (`tests/` directory):

- `prediction-api-integration.spec.ts` - Tests Python API integration
- `compare.spec.ts`, `dashboard.spec.ts`, `explore.spec.ts`, etc. - Page-specific tests

**Run pattern:**

```powershell
npm run dev  # Terminal 1
cd python_api && python api.py  # Terminal 2
npm test  # Terminal 3
```

**Test config:** `playwright.config.ts` - runs on `http://localhost:3000`, retries on CI, screenshots/videos on failure

## Important Files

- `MOBILES_DATASET_GUIDE.md` - Network architecture selection guide (CNN vs FCN vs Hybrid based on data type)
- `INSIGHTS_EXTRACTION_GUIDE.md` - Comprehensive guide to the 5 insight categories
- `ENVIRONMENT_SETUP.md` - Python/MATLAB setup instructions
- `mobiles-dataset-docs/TUNING_RESULTS.md` - Model hyperparameter tuning results
- `python_api/TENSORFLOW_TRAINING_GUIDE.md` - TensorFlow model architectures
- `tests/README.md` - E2E testing guide

## Common Pitfalls

1. **Missing Python venv activation** - Predictions fail silently. Always check `python_api/api.py` is running and responding on port 8000.
2. **MATLAB path issues** - Run `setup_matlab_env.m` if scripts can't find examples/functions.
3. **Enhanced features mismatch** - Trained models expect 11+ features. Use `add_enhanced_features.m` before predictions.
4. **GPU memory errors** - MATLAB auto-detects RTX 3070 (7.46GB). Reduce batch size if OOM errors occur.
5. **CSV encoding issues on Windows** - Python API uses UTF-8 reconfiguration in `api.py` for compatibility.

## Quick Reference

**View .mat files:**

```matlab
view_mat_file('path/to/file.mat')  % MATLAB
```

```powershell
python view_mat_file.py path/to/file.mat  # Python
node view_mat_file.js path/to/file.mat  # Node.js
```

**Check capabilities:**

```powershell
npm run check  # Checks MATLAB/toolbox availability
```

**Run all MATLAB examples:**

```matlab
run('run_all_examples.m')  % Runs CNN, LSTM, Autoencoder, ResNet examples
```
