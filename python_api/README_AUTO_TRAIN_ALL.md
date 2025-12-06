# Automatic Training of ALL 41 Models

## Overview

When you push CSV data, **ALL 41 models are automatically trained** without any manual intervention.

## How It Works

1. **Load CSV Data** → SQLite database
2. **Load Images** → LanceDB vector database
3. **Train ALL 41 Models Automatically**:
   - ✅ 4 Basic Sklearn models
   - ✅ 14 Ensemble models
   - ✅ 3 XGBoost models
   - ✅ 3 Multi-currency models
   - ✅ 2 Multitask models
   - ✅ 9+ Segmentation models
   - ✅ 1 Distilled model
   - ✅ 5+ Other models

## Usage

### Default: Train ALL 41 Models

```bash
cd python_api
python create_price_db.py
```

This automatically trains **ALL 41 models** when CSV data is loaded.

### Train Only Basic 4 Models

If you want to train only the basic 4 sklearn models:

**Windows (PowerShell):**
```powershell
$env:TRAIN_ALL_41_MODELS="false"
cd python_api
python create_price_db.py
```

**Linux/macOS:**
```bash
export TRAIN_ALL_41_MODELS=false
cd python_api
python create_price_db.py
```

## Training Order

Models are trained in this order (dependencies first):

1. **Basic Sklearn** (4 models) - Foundation models
2. **Ensemble** (14 models) - Uses basic models
3. **XGBoost** (3 models) - Independent
4. **Multi-Currency** (3 models) - Price variants
5. **Multitask** (2 models) - Joint training
6. **Segmentation** (9+ models) - Segment-specific
7. **Distilled** (1 model) - Model compression

## Model Categories

### Basic Sklearn (4 models)
- `price_predictor_sklearn`
- `ram_predictor_sklearn`
- `battery_predictor_sklearn`
- `brand_classifier_sklearn`

### Ensemble (14 models)
- `ensemble_stacking_model`
- `clean_ensemble_model`
- `ensemble_base_*` (4 models)
- `ensemble_meta_learner`
- `ensemble_neural_*` (6 models)

### XGBoost (3 models)
- `xgboost_conservative`
- `xgboost_aggressive`
- `xgboost_deep`

### Multi-Currency (3 models)
- `price_usd_model`
- `price_eur_model`
- `price_inr_model`

### Multitask (2 models)
- `multitask_model`
- `multitask_auxiliary_model`

### Segmentation (9+ models)
- `price_segment_0_model`
- `price_segment_1_model`
- `price_segment_2_model`
- `price_refined_segment_*` (3 models)
- `price_residual_*` (3 models)

### Distilled (1 model)
- `distilled_price_model`

## Training Scripts

The unified trainer automatically calls these scripts:

- `scripts/ml_pipeline/ensemble_methods/ensemble_stacking.py`
- `scripts/ml_pipeline/ensemble_methods/ensemble_with_neural.py`
- `scripts/ml_pipeline/ensemble_methods/xgboost_ensemble.py`
- `scripts/ml_pipeline/model_training/clean_and_retrain.py`
- `scripts/ml_pipeline/model_training/price_prediction_models.py`
- `scripts/ml_pipeline/model_training/multitask_training.py`
- `scripts/ml_pipeline/model_training/multitask_auxiliary.py`
- `scripts/ml_pipeline/model_training/segmentation_specialist_models.py`
- `scripts/ml_pipeline/model_training/residual_based_segmentation.py`
- `scripts/ml_pipeline/model_training/refine_segmentation.py`
- `scripts/ml_pipeline/monitoring/model_compression_distillation.py`

## Versioning & Rollback

All models are automatically:
- ✅ Backed up before training
- ✅ Versioned with scores
- ✅ Rolled back if new score is worse
- ✅ Notifications sent for each model

## Output

After training, you'll see:

```
============================================================
UNIFIED MODEL TRAINING - ALL 41 MODELS
============================================================
CSV Path: data/Mobiles Dataset (2025).csv
============================================================

Training Basic Sklearn Models (4 models)
...
Training Ensemble Models
...
Training XGBoost Models
...
Training Multi-Currency Models
...
Training Multitask Models
...
Training Segmentation Models
...
Training Distilled Models
...

============================================================
TRAINING SUMMARY
============================================================
Total Models: 41
Success: 38
Failed: 3

By Category:
  basic              :   4 success,   0 failed
  ensemble           :  12 success,   2 failed
  xgboost            :   3 success,   0 failed
  multi_currency     :   3 success,   0 failed
  multitask          :   2 success,   0 failed
  segmentation       :   9 success,   0 failed
  distilled          :   1 success,   0 failed
============================================================
```

## Troubleshooting

### Some Models Failed

If some models fail, check:
1. Dependencies installed (lightgbm, catboost, etc.)
2. Feature engineering completed
3. CSV format correct
4. Sufficient memory/disk space

### Skip Failed Models

The pipeline continues even if some models fail. Only successful models are kept.

### Manual Training

If you need to train specific models manually:

```bash
# Train specific category
python train_all_models_unified.py --csv "path/to/data.csv"
```

## Configuration

Set environment variables to control training:

- `TRAIN_ALL_41_MODELS=true` (default) - Train all 41 models
- `TRAIN_ALL_41_MODELS=false` - Train only basic 4 models

## Notes

- Training all 41 models may take 30-60 minutes depending on your hardware
- Each model is trained independently, so failures don't affect others
- All models are versioned and can be rolled back
- Notifications are sent for each model's status
