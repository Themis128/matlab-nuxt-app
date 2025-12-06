# Training ALL Models

## Overview

You have many more models beyond the basic 4 sklearn models. This guide shows how to train them all.

## Available Models

### Basic Models (Always Trained)
- ✅ `price_predictor_sklearn` - Price prediction
- ✅ `ram_predictor_sklearn` - RAM prediction
- ✅ `battery_predictor_sklearn` - Battery prediction
- ✅ `brand_classifier_sklearn` - Brand classification

### Extended Models (Optional)
- **XGBoost Models**: `xgboost_conservative`, `xgboost_aggressive`, `xgboost_deep`
- **Ensemble Models**: `ensemble_stacking_model`, `clean_ensemble_model`
- **Multi-Currency**: `price_usd_model`, `price_eur_model`, `price_inr_model`
- **Multitask**: `multitask_model`
- **Distilled**: `distilled_price_model`
- **Segmentation**: Various segment-specific models

## Training Options

### Option 1: Train Only Basic Models (Default)

```bash
cd python_api
python create_price_db.py
```

This trains the 4 basic sklearn models automatically.

### Option 2: Train ALL Models

Set environment variable to train all models:

**Windows (PowerShell):**
```powershell
$env:TRAIN_ALL_MODELS="true"
cd python_api
python create_price_db.py
```

**Linux/macOS:**
```bash
export TRAIN_ALL_MODELS=true
cd python_api
python create_price_db.py
```

### Option 3: Use Extended Training Script

```bash
cd python_api
python train_all_models.py
```

Or train only basic models:
```bash
python train_all_models.py --basic-only
```

## Model Training Status

To check which models have been trained:

```bash
cd python_api
python -c "import json; f = open('trained_models/versions/version_metadata.json'); d = json.load(f); print('Trained models:'); [print(f'  - {k}') for k in d.keys()]; f.close()"
```

## Notes

- **Basic models** are always trained and work reliably
- **Extended models** may require:
  - Additional dependencies (lightgbm, catboost, etc.)
  - Different data formats
  - Manual configuration
- Some models are trained via separate scripts in `scripts/ml_pipeline/`
- Check individual training scripts for specific requirements

## Current Status

Based on your model files, you have **47 model files** total, but only **4 basic sklearn models** are currently in the automated pipeline.

To add more models to automatic training, update `MODEL_DEFINITIONS` in `automated_training_pipeline.py` or use the extended training script.
