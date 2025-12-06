# Automated Data Pipeline - Quick Start Guide

## Overview

The automated pipeline loads CSV data and images, then automatically trains all ML models with versioning and rollback.

## Quick Start

### Windows (PowerShell)

```powershell
cd python_api
python create_price_db.py
```

### Linux/macOS

```bash
cd python_api
python create_price_db.py
```

## What Happens

When you run `create_price_db.py`, the system will:

1. **Load CSV Data** → SQLite database (`price_database.db`)
2. **Load Images** → From `public/mobile_images/` directory
3. **Backup Current Models** → Saves existing models before training
4. **Train All Models** → Automatically trains:
   - Price Predictor
   - RAM Predictor
   - Battery Predictor
   - Brand Classifier
5. **Compare Scores** → New model vs. previous model
6. **Keep or Rollback**:
   - ✅ **Keep** if new score is better
   - ❌ **Rollback** if new score is worse or training fails
7. **Show Notifications** → Console output with model status

## Example Output

```
Database created at: python_api/price_database.db
Records inserted: 1500

============================================================
Starting automatic model training...
============================================================

[INFO] data_pipeline: Data loaded successfully: 1200 images
[INFO] price_predictor_sklearn: Backed up previous version: price_predictor_sklearn_20250105_143022
[SUCCESS] price_predictor_sklearn: Training successful! Score: 0.9234 (kept new model)
[INFO] ram_predictor_sklearn: Backed up previous version: ram_predictor_sklearn_20250105_143025
[SUCCESS] ram_predictor_sklearn: Training successful! Score: 0.8912 (kept new model)
[WARNING] battery_predictor_sklearn: Training completed but score worse (0.8543). Rolled back to previous version.
[ERROR] brand_classifier_sklearn: Training broke. Rolled back to previous version.

✓ All models trained successfully!
```

## API Usage

### Run Pipeline via API

```bash
POST http://localhost:8000/api/pipeline/load-and-train
Content-Type: application/json

{
  "csv_path": "data/Mobiles Dataset (2025).csv",
  "image_dir": "public/mobile_images",
  "auto_train": true
}
```

### Get Notifications

```bash
GET http://localhost:8000/api/pipeline/notifications
```

### View Model Versions

```bash
GET http://localhost:8000/api/models/versions
```

### Manual Rollback

```bash
POST http://localhost:8000/api/models/price_predictor_sklearn/rollback
```

## Frontend Integration

In your Vue/Nuxt pages, use the toast composable:

```vue
<script setup>
const { showSuccess, showError, showWarning } = useToast();

// After calling pipeline API
const runPipeline = async () => {
  try {
    const response = await $fetch('/api/pipeline/load-and-train', {
      method: 'POST',
      body: {
        csv_path: 'data/Mobiles Dataset (2025).csv',
        auto_train: true,
      },
    });

    // Show notifications
    for (const notification of response.notifications) {
      if (notification.status === 'success') {
        showSuccess(`${notification.model_name} trained`, notification.message);
      } else if (notification.status === 'error') {
        showError(`${notification.model_name} failed`, notification.error || notification.message);
      } else if (notification.status === 'warning') {
        showWarning(`${notification.model_name} rolled back`, notification.message);
      }
    }
  } catch (error) {
    showError('Pipeline failed', error.message);
  }
};
</script>
```

## Troubleshooting

### Import Errors

If you see `ImportError`, make sure you're in the `python_api` directory:

```bash
cd python_api
python create_price_db.py
```

### Training Fails

Check the console output for error messages. Common issues:

- CSV file not found → Check path in `create_price_db.py`
- Missing dependencies → Run `pip install -r requirements.txt`
- Insufficient data → Ensure CSV has enough records

### No Notifications

Notifications are printed to console. If using API, check the response `notifications` array.

## Files Created

- `trained_models/versions/` - Model backups
- `trained_models/versions/version_metadata.json` - Version tracking
- `price_database.db` - SQLite database

## Next Steps

1. Run the pipeline: `python create_price_db.py`
2. Check console for notifications
3. View model versions: `GET /api/models/versions`
4. Monitor training progress in console output
