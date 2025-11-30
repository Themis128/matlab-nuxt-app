# ML Pipeline - Organized Python Scripts

This directory contains a well-organized machine learning pipeline for mobile dataset analysis and prediction.

## Directory Structure

```
ml_pipeline/
├── preprocessing/           # Data cleaning and feature engineering
│   ├── clean_dataset.py
│   ├── comprehensive_dataset_preprocessing.py
│   ├── comprehensive_preprocessing.py
│   ├── feature_engineering_extended.py
│   ├── fix_dataset_issues.py
│   ├── preprocess_dataset.py
│   └── target_normalization.py
│
├── model_training/          # Model training for predictions
│   ├── clean_and_retrain.py
│   ├── multitask_auxiliary.py
│   ├── multitask_training.py
│   ├── price_prediction_models.py
│   ├── refine_segmentation.py
│   ├── residual_based_segmentation.py
│   └── segmentation_specialist_models.py
│
├── ensemble_methods/        # Ensemble and stacking techniques
│   ├── catboost_ensemble.py
│   ├── ensemble_stacking.py
│   ├── ensemble_with_neural.py
│   └── xgboost_ensemble.py
│
├── analysis/               # Dataset exploration and insights
│   ├── dataset_audit_refresh.py
│   ├── dataset_exploration.py
│   ├── european_market_analysis.py
│   └── explainability_pipeline.py
│
├── monitoring/             # Model monitoring and diagnostics
│   ├── diagnose_models.py
│   ├── drift_anomaly_monitoring.py
│   └── model_compression_distillation.py
│
└── orchestration/          # Complete pipeline runners
    ├── run_all_analysis.py
    ├── run_complete_analysis.py
    └── run_preprocessing.py
```

## Module Descriptions

### 📊 Preprocessing
Scripts for data cleaning, feature engineering, and dataset preparation:

- **clean_dataset.py**: Basic dataset cleaning and validation
- **comprehensive_dataset_preprocessing.py**: Full preprocessing pipeline with feature engineering
- **comprehensive_preprocessing.py**: Advanced preprocessing with multiple strategies
- **feature_engineering_extended.py**: Extended feature creation (ratios, interactions, temporal)
- **fix_dataset_issues.py**: Fixes specific data quality issues
- **preprocess_dataset.py**: Standard preprocessing workflow
- **target_normalization.py**: Target variable normalization and transformation

### 🎯 Model Training
Scripts for training various prediction models:

- **clean_and_retrain.py**: Remove data leakage and retrain production models
- **multitask_auxiliary.py**: Multi-task learning with auxiliary tasks (brand tier, market segment)
- **multitask_training.py**: Multi-task neural network for price, RAM, battery prediction
- **price_prediction_models.py**: Core price prediction models (Random Forest, Gradient Boosting)
- **refine_segmentation.py**: Refined market segmentation with clustering
- **residual_based_segmentation.py**: Segmentation based on model residuals
- **segmentation_specialist_models.py**: Specialist models for each market segment

### 🔗 Ensemble Methods
Scripts for combining multiple models:

- **catboost_ensemble.py**: CatBoost-based ensemble models
- **ensemble_stacking.py**: Stacking ensemble with diverse base learners
- **ensemble_with_neural.py**: Neural network ensemble integration
- **xgboost_ensemble.py**: XGBoost-based ensemble models

### 📈 Analysis
Scripts for dataset exploration and insights:

- **dataset_audit_refresh.py**: Dataset quality audit and validation
- **dataset_exploration.py**: Comprehensive exploratory data analysis
- **european_market_analysis.py**: European market-specific analysis
- **explainability_pipeline.py**: Model explainability (SHAP, PDP, ICE, counterfactuals)

### 🔍 Monitoring
Scripts for model monitoring and diagnostics:

- **diagnose_models.py**: Model diagnostics and health checks
- **drift_anomaly_monitoring.py**: Data drift detection and anomaly monitoring (PSI, KS tests)
- **model_compression_distillation.py**: Model compression via knowledge distillation

### ⚙️ Orchestration
Scripts to run complete pipelines:

- **run_all_analysis.py**: Run full dataset analysis pipeline
- **run_complete_analysis.py**: Complete end-to-end ML pipeline
- **run_preprocessing.py**: Run all preprocessing steps

## Usage

### Running Individual Modules

Navigate to the project root and run:

```powershell
# Preprocessing
python scripts/ml_pipeline/preprocessing/comprehensive_dataset_preprocessing.py

# Model Training
python scripts/ml_pipeline/model_training/clean_and_retrain.py

# Ensemble Methods
python scripts/ml_pipeline/ensemble_methods/ensemble_stacking.py

# Analysis
python scripts/ml_pipeline/analysis/dataset_exploration.py

# Monitoring
python scripts/ml_pipeline/monitoring/drift_anomaly_monitoring.py

# Full Pipeline
python scripts/ml_pipeline/orchestration/run_complete_analysis.py
```

### Typical Workflow

1. **Preprocess Data**: Run preprocessing scripts to clean and engineer features
2. **Train Models**: Train base models and ensemble methods
3. **Analyze Results**: Generate insights and visualizations
4. **Monitor Performance**: Track drift and model health
5. **Deploy**: Use trained models from `python_api/trained_models/`

## Code Quality Standards

All scripts have been:
- ✅ Organized by functionality
- ✅ Checked with `ruff` linter (F, E, W, I, N rules)
- ✅ Fixed for code quality issues
- ✅ Formatted consistently
- ✅ Documented with docstrings

## Data Flow

```
data/Mobiles Dataset (2025).csv
    ↓
[Preprocessing] → data/Mobiles_Dataset_Feature_Engineered.csv
    ↓
[Model Training] → python_api/trained_models/*.pkl
    ↓
[Analysis] → data/*_insights.json, data/*_dashboard.png
    ↓
[Monitoring] → data/*_monitoring_report.json
```

## Output Files

Scripts generate outputs in the `data/` directory:
- `data/*_metrics.json` - Model performance metrics
- `data/*_insights.json` - Analysis insights
- `data/*_report.json` - Monitoring reports
- `data/*_dashboard.png` - Visualizations

Models are saved to:
- `python_api/trained_models/*.pkl` - Scikit-learn models
- `python_api/trained_models/*.h5` - TensorFlow models (if applicable)

## Dependencies

See `requirements.txt` in project root. Key dependencies:
- pandas, numpy - Data manipulation
- scikit-learn - Machine learning
- lightgbm, xgboost, catboost - Gradient boosting
- shap - Model explainability
- matplotlib, seaborn - Visualization

## Notes

- All scripts run from project root directory
- Paths are relative to project root
- Python virtual environment recommended: `venv\Scripts\activate`
- GPU support available for TensorFlow/PyTorch models (RTX 3070)

## Author

Machine Learning Improvement Initiative
Last Updated: 2025-11-30
