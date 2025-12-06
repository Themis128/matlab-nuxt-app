# Training ALL Your Models

## Current Status

You have **41 models** total, but currently only **4 basic sklearn models** are automatically trained.

## Model Breakdown

- ✅ **4 Basic Sklearn Models** - Auto-trained (price, ram, battery, brand)
- ✅ **20 Auto-Trainable Models** - Can be added to pipeline (ensemble, xgboost, multi-currency)
- ❌ **17 Manual Models** - Require separate training scripts (distilled, multitask, segmentation)

## Quick Start

### Train Only Basic Models (Default)

```bash
cd python_api
python create_price_db.py
```

This trains the 4 basic sklearn models automatically.

### Train Basic + Extended Models

**Windows (PowerShell):**
```powershell
$env:TRAIN_EXTENDED_MODELS="true"
cd python_api
python create_price_db.py
```

**Linux/macOS:**
```bash
export TRAIN_EXTENDED_MODELS=true
cd python_api
python create_price_db.py
```

This will train:
- ✅ 4 Basic sklearn models
- ✅ Ensemble models (stacking, neural variants)
- ✅ XGBoost models (conservative, aggressive, deep)
- ✅ Multi-currency models (USD, EUR, INR)

### List All Available Models

```bash
cd python_api
python train_all_available_models.py --list-only
```

This shows:
- ✅ Auto-trainable models
- ❌ Models requiring manual training

## Model Categories

### Auto-Trainable Models (24 total)

#### Basic Sklearn (4)
- `price_predictor_sklearn`
- `ram_predictor_sklearn`
- `battery_predictor_sklearn`
- `brand_classifier_sklearn`

#### Ensemble Models (14)
- `ensemble_stacking_model`
- `clean_ensemble_model`
- `ensemble_base_*` (elasticnet, gradient_boosting, lightgbm, random_forest)
- `ensemble_meta_learner`
- `ensemble_neural_*` (gradient_boosting, lightgbm, meta_learner, mlp, mlp_deep, random_forest)
- `ensemble_neural_scaler`

#### XGBoost Models (3)
- `xgboost_conservative`
- `xgboost_aggressive`
- `xgboost_deep`

#### Multi-Currency Models (3)
- `price_usd_model`
- `price_eur_model`
- `price_inr_model`

### Manual Training Required (17 models)

These require running specific training scripts:

- **Distilled Models**: `distilled_price_model`
- **Multitask Models**: `multitask_model`, `multitask_auxiliary_model`
- **Segmentation Models**: `price_segment_*`, `price_refined_segment_*`, `price_residual_*`
- **Other**: `clean_gbm_model`, `xgboost_scaler`

## Training Scripts

### Basic Models
```bash
python create_price_db.py  # Trains 4 basic models
```

### Extended Models
```bash
python train_extended_models.py  # Trains ensemble, xgboost, multi-currency
```

### All Auto-Trainable
```bash
python train_all_available_models.py  # Detects and trains all auto-trainable models
```

## Adding More Models to Auto-Training

To add more models to automatic training, update `MODEL_DEFINITIONS` in:
- `python_api/automated_training_pipeline.py` - For basic models
- `python_api/train_extended_models.py` - For extended models

## Next Steps

1. **Current**: 4 basic models are auto-trained ✅
2. **Next**: Enable extended models with `TRAIN_EXTENDED_MODELS=true`
3. **Future**: Add manual models to pipeline if needed

## Model Files Location

All trained models are saved in:
```
python_api/trained_models/
```

Version backups are in:
```
python_api/trained_models/versions/
```
