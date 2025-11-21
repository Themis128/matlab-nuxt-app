# Mobile Phones Dataset Documentation

This directory contains all documentation, scripts, and resources related to the Mobile Phones Dataset (2025).

## Contents

### 📊 Dataset
- **`Mobiles Dataset (2025).csv`** - The main dataset file containing mobile phone specifications and pricing data

### 📚 Documentation
- **`MOBILES_DATASET_GUIDE.md`** - Comprehensive guide on choosing neural network architectures for the dataset
- **`INSIGHTS_EXTRACTION_GUIDE.md`** - Detailed guide on extracting insights from the dataset

### 🔧 Analysis Scripts
- **`preprocess_dataset.m`** - Comprehensive data preprocessing, cleaning, and preparation
- **`extract_all_insights.m`** - Main script to extract all 5 categories of insights:
  - Price Drivers Analysis
  - Market Trends Analysis
  - Competitive Analysis
  - Recommendation Systems
  - Anomaly Detection
- **`analyze_mobiles_dataset.m`** - Script to analyze dataset structure and suggest appropriate networks
- **`test_column_names.m`** - Helper script to verify CSV column names
- **`run_all_steps.m`** - Complete pipeline: preprocessing → insights → training

### 💻 Example Scripts
Located in the `examples/` subdirectory:
- **`mobiles_tabular_regression.m`** - Neural network for tabular data (price prediction, brand classification)
- **`mobiles_hybrid_network.m`** - Hybrid network combining image and tabular data
- **`mobiles_cnn_classification.m`** - CNN for mobile phone image classification

### 📥 Download Script
- **`download_mobiles_dataset.sh`** - Shell script to download the dataset from Kaggle

### 🚀 Training Scripts
- **Price Prediction Models:**
  - `train_price_prediction_model.m` - Standard model (128→64→32)
  - `train_price_prediction_deep.m` - Deep model (256→128→64→32→16)
  - `train_price_prediction_wide.m` - Wide model (512→256→128)
  - `train_price_prediction_lightweight.m` - Lightweight model (64→32)
- **Classification Models:**
  - `train_brand_classification_model.m` - Brand classification
- **Feature Prediction Models:**
  - `train_ram_prediction_model.m` - RAM prediction
  - `train_battery_prediction_model.m` - Battery capacity prediction
- **Utility Scripts:**
  - `train_all_models.m` - Train all models at once
  - `evaluate_model.m` - Comprehensive model evaluation
  - `visualize_results.m` - Visualization script
- **Prediction Functions:**
  - `predict_price.m` - Price prediction
  - `predict_brand.m` - Brand prediction
  - `predict_ram.m` - RAM prediction
  - `predict_battery.m` - Battery prediction

## Quick Start

### Option 1: Run Complete Pipeline (Recommended)
Run all steps in sequence:
```matlab
cd mobiles-dataset-docs
run('run_all_steps.m')
```

This will:
1. Preprocess the dataset
2. Extract insights
3. Train the price prediction model

### Option 2: Run Steps Individually

1. **Preprocess Dataset:**
   ```matlab
   cd mobiles-dataset-docs
   run('preprocess_dataset.m')
   ```

2. **Extract Insights:**
   ```matlab
   run('extract_all_insights.m')
   ```

3. **Train Price Prediction Model:**
   ```matlab
   run('train_price_prediction_model.m')
   ```

4. **Evaluate and Visualize:**
   ```matlab
   run('evaluate_model.m')
   run('visualize_results.m')
   ```

5. **Train Brand Classification Model:**
   ```matlab
   run('train_brand_classification_model.m')
   ```

6. **Make Predictions:**
   ```matlab
   % Price prediction
   price = predict_price(6, 4000, 6.1, 174, 2024, 'Apple');
   fprintf('Predicted price: $%.0f\n', price);

   % Brand classification
   brand = predict_brand(6, 4000, 6.1, 174, 2024, 999);
   fprintf('Predicted brand: %s\n', brand);
   ```

### Other Scripts

- **Analyze Dataset:**
   ```matlab
   run('analyze_mobiles_dataset.m')
   ```

- **Test Column Names:**
   ```matlab
   run('test_column_names.m')
   ```

## Dataset Information

- **Source:** Kaggle - abdulmalik1518/mobiles-dataset-2025
- **Format:** CSV
- **Columns:** Company Name, Model Name, Mobile Weight, RAM, Front Camera, Back Camera, Processor, Battery Capacity, Screen Size, Regional Prices (Pakistan, India, China, USA, Dubai), Launched Year

## Network Architectures Supported

- **Fully Connected Neural Network (FCN)** - For tabular data (price prediction, classification)
- **Convolutional Neural Network (CNN)** - For image classification
- **Hybrid Network** - Combining image and tabular data
- **Transfer Learning** - Using pretrained models (ResNet, MobileNet, etc.)

## Insights Available

1. **Price Drivers** - Feature correlations, regional differences, brand premiums
2. **Market Trends** - Technology evolution, adoption patterns, price trends
3. **Competitive Analysis** - Brand positioning, value-for-money, market gaps
4. **Recommendations** - Similar phone finder, budget-based suggestions
5. **Anomaly Detection** - Overpriced/underpriced phones, data quality issues

## Notes

- All scripts are designed to work with MATLAB
- The dataset requires preprocessing (handled automatically by scripts)
- Results are saved to MATLAB workspace variables for further analysis
- GPU acceleration is supported for neural network training

## Related Files

For general MATLAB deep learning examples and guides, see:
- `../deep-learning-networks-guide.md`
- `../examples/` directory
- `../README.md`
