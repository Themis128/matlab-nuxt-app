# Quick Start Guide - Mobile Phones Dataset

## Prerequisites

- MATLAB installed with Deep Learning Toolbox
- Dataset file: `Mobiles Dataset (2025).csv` in the `mobiles-dataset-docs` directory

## Fastest Way to Get Started

### Run Everything at Once

```matlab
cd mobiles-dataset-docs
run('run_all_steps.m')
```

This single command will:

1. ✅ Preprocess and clean the dataset
2. ✅ Extract all insights (price drivers, trends, etc.)
3. ✅ Train a neural network to predict prices
4. ✅ Save the trained model

**Time:** ~15-30 minutes (depending on GPU availability)

---

## Step-by-Step Guide

### Step 1: Preprocess Data (2-5 minutes)

```matlab
cd mobiles-dataset-docs
run('preprocess_dataset.m')
```

**What it does:**

- Parses all numerical features (RAM, Battery, Screen Size, etc.)
- Cleans invalid data
- Removes outliers
- Creates a clean dataset ready for training

**Output:**

- `preprocessed/preprocessed_data.mat` - Clean dataset
- `preprocessed/preprocessed_data.csv` - Clean dataset (CSV format)
- Workspace variables with cleaned data

---

### Step 2: Extract Insights (2-5 minutes)

```matlab
run('extract_all_insights.m')
```

**What it does:**

- Analyzes price drivers (which features affect price most)
- Identifies market trends over years
- Performs competitive analysis
- Finds anomalies and data quality issues

**Output:**

- Comprehensive analysis report in command window
- Workspace variables with all insights (prefixed with `insights_`)

---

### Step 3: Train Model (10-30 minutes)

```matlab
run('train_price_prediction_model.m')
```

**What it does:**

- Builds a neural network (128→64→32 neurons)
- Trains on 70% of data
- Validates on 15% of data
- Tests on 15% of data
- Saves trained model

**Output:**

- `trained_models/price_predictor.mat` - Trained model
- `trained_models/price_prediction_results.mat` - Evaluation results
- Training progress plot
- Performance metrics (MSE, MAE, R²)

---

### Step 4: Make Predictions

```matlab
% Predict price for a phone
price = predict_price(6, 4000, 6.1, 174, 2024, 'Apple');
fprintf('Predicted price: $%.0f\n', price);

% Example: iPhone 16 with 6GB RAM, 4000mAh battery, 6.1" screen, 174g weight, 2024
```

---

## Expected Results

After running all steps, you should have:

### Preprocessing Results

- ✅ Clean dataset with ~800-900 valid phone entries
- ✅ All features parsed and normalized
- ✅ Outliers removed

### Insights Results

- ✅ Feature correlations with price
- ✅ Market trends by year
- ✅ Brand value rankings
- ✅ Anomaly detection results

### Training Results

- ✅ Trained neural network model
- ✅ Test set performance:
  - RMSE: ~$100-200 (typical)
  - MAE: ~$80-150 (typical)
  - R²: 0.7-0.9 (typical)
- ✅ Sample predictions vs actual prices

---

## Troubleshooting

### Error: "Dataset not found"

- Ensure `Mobiles Dataset (2025).csv` is in the `mobiles-dataset-docs` directory
- Check file name matches exactly (case-sensitive)

### Error: "GPU not available"

- This is normal - training will use CPU (slower but works)
- GPU is optional but recommended for faster training

### Error: "Out of memory"

- Reduce batch size in `train_price_prediction_model.m`
- Change `MiniBatchSize` from 64 to 32 or 16

### Poor Model Performance

- Try increasing training epochs (MaxEpochs)
- Adjust learning rate (InitialLearnRate)
- Add more hidden layers or neurons
- Check data quality (run preprocessing again)

---

## Next Steps After Training

1. **Evaluate Model:**

   - Review training progress plot
   - Check test set metrics
   - Compare predictions vs actual prices

2. **Improve Model:**

   - Fine-tune hyperparameters
   - Try different architectures
   - Add more features

3. **Use Model:**
   - Make predictions for new phones
   - Integrate into applications
   - Build recommendation systems

---

## File Structure After Running

```
mobiles-dataset-docs/
├── preprocessed/
│   ├── preprocessed_data.mat
│   └── preprocessed_data.csv
├── trained_models/
│   ├── price_predictor.mat
│   └── price_prediction_results.mat
└── [all original scripts and data]
```

---

## Need Help?

- Check `NEXT_STEPS.md` for detailed roadmap
- Review `MOBILES_DATASET_GUIDE.md` for network architecture info
- See `INSIGHTS_EXTRACTION_GUIDE.md` for insights explanation

---

**Ready to start? Run:**

```matlab
cd mobiles-dataset-docs
run('run_all_steps.m')
```
