# Quick Start - Train ALL 41 Models

## One Command to Train Everything

```bash
cd python_api
python create_price_db.py
```

That's it! This single command will:

1. ✅ Load CSV data → SQLite database
2. ✅ Load images → LanceDB vector database
3. ✅ Train **ALL 41 models** automatically
4. ✅ Version and backup all models
5. ✅ Rollback if scores are worse
6. ✅ Show notifications for each model

## What Gets Trained

- **4 Basic Sklearn** models (price, RAM, battery, brand)
- **14 Ensemble** models (stacking, neural variants)
- **3 XGBoost** models (conservative, aggressive, deep)
- **3 Multi-currency** models (USD, EUR, INR)
- **2 Multitask** models
- **9+ Segmentation** models
- **1 Distilled** model
- **5+ Other** models

**Total: 41 models** - All trained automatically!

## Training Time

- Basic 4 models: ~2-5 minutes
- All 41 models: ~30-60 minutes (depending on hardware)

## Output

You'll see progress for each model category:

```
============================================================
UNIFIED MODEL TRAINING - ALL 41 MODELS
============================================================

Training Basic Sklearn Models (4 models)
[SUCCESS] price_predictor_sklearn: Training successful! Score: 0.9234
...

Training Ensemble Models
[SUCCESS] ensemble_stacking: Training successful
...

Training XGBoost Models
[SUCCESS] xgboost_conservative: Training successful
...

============================================================
TRAINING SUMMARY
============================================================
Total Models: 41
Success: 38
Failed: 3
============================================================
```

## Configuration

### Train Only Basic 4 Models

```bash
# Windows
$env:TRAIN_ALL_41_MODELS="false"
python create_price_db.py

# Linux/macOS
export TRAIN_ALL_41_MODELS=false
python create_price_db.py
```

### Train ALL 41 Models (Default)

```bash
# No configuration needed - this is the default!
python create_price_db.py
```

## Troubleshooting

### Some Models Failed?

That's OK! The pipeline continues even if some models fail. Only successful models are kept.

### Check Model Status

```bash
# List all trained models
python -c "import os; [print(f) for f in os.listdir('trained_models') if f.endswith('.pkl')]"
```

### View Notifications

Check the console output for notifications, or use the API:

```bash
GET /api/pipeline/notifications
```

## Next Steps

1. ✅ Run `python create_price_db.py` - Train all models
2. ✅ Check console output - See training progress
3. ✅ Verify models - Check `trained_models/` directory
4. ✅ Use models - Models are ready for predictions!

## Need Help?

- See `README_AUTO_TRAIN_ALL.md` for detailed documentation
- See `docs/DATA_PIPELINE.md` for pipeline architecture
- Check console logs for specific errors
