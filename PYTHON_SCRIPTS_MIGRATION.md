# Python Scripts Migration Guide

## What Changed?

All Python ML scripts have been reorganized from the project root into a structured `scripts/ml_pipeline/` directory.

## New Organization

Scripts are now organized by functionality:

### Before (Root Directory)

```
MatLab/
├── clean_and_retrain.py
├── ensemble_stacking.py
├── dataset_exploration.py
├── drift_anomaly_monitoring.py
├── ... (20+ scripts)
```

### After (Organized Structure)

```
MatLab/
└── scripts/
    └── ml_pipeline/
        ├── preprocessing/
        ├── model_training/
        ├── ensemble_methods/
        ├── analysis/
        ├── monitoring/
        └── orchestration/
```

## Script Mapping

### Preprocessing

| Old Path                                 | New Path                                                                   |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| `clean_dataset.py`                       | `scripts/ml_pipeline/preprocessing/clean_dataset.py`                       |
| `comprehensive_preprocessing.py`         | `scripts/ml_pipeline/preprocessing/comprehensive_preprocessing.py`         |
| `comprehensive_dataset_preprocessing.py` | `scripts/ml_pipeline/preprocessing/comprehensive_dataset_preprocessing.py` |
| `feature_engineering_extended.py`        | `scripts/ml_pipeline/preprocessing/feature_engineering_extended.py`        |
| `fix_dataset_issues.py`                  | `scripts/ml_pipeline/preprocessing/fix_dataset_issues.py`                  |
| `preprocess_dataset.py`                  | `scripts/ml_pipeline/preprocessing/preprocess_dataset.py`                  |
| `target_normalization.py`                | `scripts/ml_pipeline/preprocessing/target_normalization.py`                |

### Model Training

| Old Path                            | New Path                                                               |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `clean_and_retrain.py`              | `scripts/ml_pipeline/model_training/clean_and_retrain.py`              |
| `multitask_auxiliary.py`            | `scripts/ml_pipeline/model_training/multitask_auxiliary.py`            |
| `multitask_training.py`             | `scripts/ml_pipeline/model_training/multitask_training.py`             |
| `price_prediction_models.py`        | `scripts/ml_pipeline/model_training/price_prediction_models.py`        |
| `refine_segmentation.py`            | `scripts/ml_pipeline/model_training/refine_segmentation.py`            |
| `residual_based_segmentation.py`    | `scripts/ml_pipeline/model_training/residual_based_segmentation.py`    |
| `segmentation_specialist_models.py` | `scripts/ml_pipeline/model_training/segmentation_specialist_models.py` |

### Ensemble Methods

| Old Path                  | New Path                                                       |
| ------------------------- | -------------------------------------------------------------- |
| `catboost_ensemble.py`    | `scripts/ml_pipeline/ensemble_methods/catboost_ensemble.py`    |
| `ensemble_stacking.py`    | `scripts/ml_pipeline/ensemble_methods/ensemble_stacking.py`    |
| `ensemble_with_neural.py` | `scripts/ml_pipeline/ensemble_methods/ensemble_with_neural.py` |
| `xgboost_ensemble.py`     | `scripts/ml_pipeline/ensemble_methods/xgboost_ensemble.py`     |

### Analysis

| Old Path                      | New Path                                                   |
| ----------------------------- | ---------------------------------------------------------- |
| `dataset_audit_refresh.py`    | `scripts/ml_pipeline/analysis/dataset_audit_refresh.py`    |
| `dataset_exploration.py`      | `scripts/ml_pipeline/analysis/dataset_exploration.py`      |
| `european_market_analysis.py` | `scripts/ml_pipeline/analysis/european_market_analysis.py` |
| `explainability_pipeline.py`  | `scripts/ml_pipeline/analysis/explainability_pipeline.py`  |

### Monitoring

| Old Path                            | New Path                                                           |
| ----------------------------------- | ------------------------------------------------------------------ |
| `diagnose_models.py`                | `scripts/ml_pipeline/monitoring/diagnose_models.py`                |
| `drift_anomaly_monitoring.py`       | `scripts/ml_pipeline/monitoring/drift_anomaly_monitoring.py`       |
| `model_compression_distillation.py` | `scripts/ml_pipeline/monitoring/model_compression_distillation.py` |

### Orchestration

| Old Path                   | New Path                                                     |
| -------------------------- | ------------------------------------------------------------ |
| `run_all_analysis.py`      | `scripts/ml_pipeline/orchestration/run_all_analysis.py`      |
| `run_complete_analysis.py` | `scripts/ml_pipeline/orchestration/run_complete_analysis.py` |
| `run_preprocessing.py`     | `scripts/ml_pipeline/orchestration/run_preprocessing.py`     |

## How to Update Your Workflows

### Command Line

**Old:**

```powershell
python clean_and_retrain.py
python ensemble_stacking.py
python dataset_exploration.py
```

**New:**

```powershell
python scripts/ml_pipeline/model_training/clean_and_retrain.py
python scripts/ml_pipeline/ensemble_methods/ensemble_stacking.py
python scripts/ml_pipeline/analysis/dataset_exploration.py
```

### Batch Files / Shell Scripts

Update any references in your automation scripts:

**Old:**

```powershell
python clean_and_retrain.py
python drift_anomaly_monitoring.py
```

**New:**

```powershell
python scripts/ml_pipeline/model_training/clean_and_retrain.py
python scripts/ml_pipeline/monitoring/drift_anomaly_monitoring.py
```

### Python Imports

All scripts still work from the project root. No import changes needed since scripts use relative paths to `data/` and `python_api/` directories.

## Benefits of New Structure

✅ **Better Organization**: Scripts grouped by functionality  
✅ **Easier Navigation**: Find scripts faster  
✅ **Cleaner Root**: Less clutter in project root  
✅ **Professional Structure**: Industry-standard organization  
✅ **Code Quality**: All scripts linted and formatted with `ruff`  
✅ **Documentation**: Each module has clear purpose and usage

## Functionality Preserved

- ✅ All file paths to `data/` and `python_api/` still work
- ✅ All model outputs go to same locations
- ✅ All scripts run from project root
- ✅ No changes to model files or data files
- ✅ No changes to Python API

## Need Help?

See `scripts/ml_pipeline/README.md` for detailed documentation on each module.
