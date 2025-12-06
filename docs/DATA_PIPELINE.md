# Automated Data Pipeline - ALL 41 Models

**NEW**: The pipeline now automatically trains **ALL 41 models** when CSV data is loaded. No manual intervention required!

## Overview

The automated data pipeline loads CSV data and images into the database, then automatically trains all ML models with versioning, rollback, and notification support.

## How It Works

### 1. Data Loading Phase

When you run `python_api/create_price_db.py`, it:

- Loads CSV data into SQLite database
- Loads images from `public/mobile_images/` directory
- Stores data in both SQLite and LanceDB (if available)

### 2. Automatic Model Training Phase

After data loading completes, the pipeline automatically:

- **Backs up** current model versions
- **Trains** ALL 41 models automatically:
  - 4 Basic Sklearn models (price, RAM, battery, brand)
  - 14 Ensemble models
  - 3 XGBoost models
  - 3 Multi-currency models
  - 2 Multitask models
  - 9+ Segmentation models
  - 1 Distilled model
  - 5+ Other models
- **Evaluates** new model scores
- **Compares** with previous scores
- **Keeps** new model if score is better
- **Rolls back** to previous version if score is worse or training fails
- **Sends notifications** with model name/ID and status

## Components

### Model Versioning (`python_api/model_versioning.py`)

Manages model versions with rollback capability:

- Backs up models before training
- Tracks scores for each version
- Compares new vs. previous scores
- Rolls back automatically on failure

### Automated Training Pipeline (`python_api/automated_training_pipeline.py`)

Orchestrates basic model training (4 sklearn models):

- Loads and preprocesses data
- Trains each model sequentially
- Integrates with versioning system
- Collects notifications

### Unified Model Trainer (`python_api/train_all_models_unified.py`)

Orchestrates ALL 41 models automatically:

- Trains basic sklearn models
- Trains ensemble models (14 models)
- Trains XGBoost models (3 models)
- Trains multi-currency models (3 models)
- Trains multitask models (2 models)
- Trains segmentation models (9+ models)
- Trains distilled models (1 model)
- Handles all training scripts automatically
- No manual intervention required

### Enhanced Data Pipeline (`python_api/enhanced_data_pipeline.py`)

Main pipeline that combines:

- Data loading (CSV + images)
- Automatic model training
- Notification collection

## Usage

### Via Script

```bash
cd python_api
python create_price_db.py
```

This automatically:

1. Loads data from `data/Mobiles Dataset (2025).csv`
2. Loads images from `public/mobile_images/`
3. Trains **ALL 41 models** automatically (no manual intervention)
4. Shows notifications for each model

**Note**: By default, ALL 41 models are trained. Set `TRAIN_ALL_41_MODELS=false` to train only the basic 4 sklearn models.

### Via API

```bash
# Load data and train models
POST /api/pipeline/load-and-train
{
  "csv_path": "data/Mobiles Dataset (2025).csv",
  "image_dir": "public/mobile_images",
  "auto_train": true
}

# Get notifications
GET /api/pipeline/notifications

# Get model versions
GET /api/models/versions

# Manually rollback a model
POST /api/models/{model_name}/rollback
```

## Model Training Flow

```
1. Backup Current Model
   ↓
2. Load & Preprocess Data
   ↓
3. Train New Model
   ↓
4. Evaluate Score
   ↓
5. Compare with Previous
   ↓
6a. Score Better → Keep New Model ✅
6b. Score Worse → Rollback ❌
6c. Training Failed → Rollback ❌
   ↓
7. Send Notification
```

## Notifications

Notifications are sent for:

- ✅ **Success**: Model trained successfully with better score
- ⚠️ **Warning**: Model trained but score worse (rolled back)
- ❌ **Error**: Training failed (rolled back)

Each notification includes:

- Model name/ID
- Status message
- Error details (if any)
- Timestamp

## Frontend Integration

Use the `useToast` composable to display notifications:

```vue
<script setup>
const { showSuccess, showError, showWarning } = useToast();

// After pipeline completes
if (result.success) {
  showSuccess('Pipeline Complete', 'All models trained successfully');
} else {
  showError('Pipeline Failed', result.error);
}
</script>
```

## Model Versioning

Models are stored with versions:

```
trained_models/
├── price_predictor_sklearn.pkl (current)
└── versions/
    └── price_predictor_sklearn/
        ├── price_predictor_sklearn_20250105_143022.pkl (backup)
        └── failed_price_predictor_sklearn_20250105_150000.pkl (failed version)
```

Version metadata includes:

- Version ID
- Score (R2, accuracy, etc.)
- Backup timestamp
- Status (active, backed_up, failed)

## Rollback Behavior

Automatic rollback occurs when:

1. **Score is worse**: New model score < previous score
2. **Training fails**: Exception during training
3. **Model breaks**: Model file corrupted or invalid

Manual rollback:

```python
from model_versioning import ModelVersionManager

manager = ModelVersionManager()
success, error = manager.rollback_model("price_predictor_sklearn")
```

## Configuration

### Disable Auto-Training

Set `auto_train=False` in API call or modify `create_price_db.py`:

```python
results = await pipeline.load_data_and_train(
    csv_path=csv_path,
    auto_train=False  # Disable automatic training
)
```

### Custom CSV Path

```python
results = await pipeline.load_data_and_train(
    csv_path="path/to/your/data.csv",
    image_base_dir="path/to/images"
)
```

## Troubleshooting

### Training Fails

1. Check logs in `data_pipeline.log`
2. Verify CSV file exists and is valid
3. Check model version metadata: `GET /api/models/versions`
4. Manually rollback if needed: `POST /api/models/{model_name}/rollback`

### No Notifications

- Check API response for `notifications` array
- Verify frontend is polling `/api/pipeline/notifications`
- Check browser console for toast messages

### Rollback Fails

- Check if backup exists in `trained_models/versions/`
- Verify model file permissions
- Check version metadata file: `trained_models/versions/version_metadata.json`

## Files Created

- `python_api/model_versioning.py` - Version management
- `python_api/automated_training_pipeline.py` - Training orchestration
- `python_api/enhanced_data_pipeline.py` - Main pipeline
- `composables/useToast.ts` - Frontend notifications
- `trained_models/versions/` - Model backups
- `trained_models/versions/version_metadata.json` - Version tracking

## Next Steps

1. Run `python_api/create_price_db.py` to test the pipeline
2. Check notifications via API or frontend
3. Monitor model versions and scores
4. Customize training parameters as needed
