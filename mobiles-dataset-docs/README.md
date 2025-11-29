# Mobile Phones Dataset Documentation

This directory contains all documentation, scripts, and resources related to the Mobile Phones Dataset (2025).

## Contents

### 📊 Dataset
- **`Mobiles Dataset (2025).csv`** - The main dataset file containing mobile phone specifications and pricing data

### 📚 Documentation
- **`MOBILES_DATASET_GUIDE.md`** - Comprehensive guide on choosing neural network architectures for the dataset
- **`INSIGHTS_EXTRACTION_GUIDE.md`** - Detailed guide on extracting insights from the dataset
- **`QUICK_START.md`** - Quick start guide for getting started with the dataset
- **`ALL_MODELS_IMPROVEMENTS.md`** - Complete summary of all model improvements
- **`FINAL_IMPROVEMENTS_COMPLETE.md`** - Final performance results and improvements
- **`IMPROVING_MODEL_ACCURACY.md`** - Guide to improving model accuracy
- **`PERFORMANCE_ANALYSIS.md`** - Detailed performance analysis
- **`TUNING_RESULTS.md`** - Model tuning results and recommendations
- **`TUNING_COMPLETE.md`** - Summary of tuning completion
- **`FINAL_MODEL_PERFORMANCE.md`** - Final model performance metrics
- **`ACCURACY_COMPARISON.md`** - Accuracy comparison between models
- **`MODELS_OVERVIEW.md`** - Overview of all available models
- **`MODELS_SUMMARY.md`** - Summary of model capabilities
- **`PRESENTATION_GUIDE.md`** - Guide for presenting results
- **`NEXT_STEPS.md`** - Recommended next steps for improvement
- **`NEW_FEATURES_GUIDE.md`** - ⭐ NEW: Comprehensive guide to all new features (camera prediction, similar phones, market segments, regional analysis)
- **`ADDITIONAL_POSSIBILITIES.md`** - Complete list of additional possibilities with the dataset
- **`IMPLEMENTATION_SUMMARY.md`** - Summary of newly implemented features

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
  - `train_models_with_enhanced_features.m` - Enhanced model with feature engineering
- **Classification Models:**
  - `train_brand_classification_model.m` - Brand classification
  - `tune_brand_classification_improved.m` - Improved brand classification with tuning
- **Feature Prediction Models:**
  - `train_ram_prediction_model.m` - RAM prediction (original)
  - `train_battery_prediction_model.m` - Battery capacity prediction
  - `train_front_camera_prediction_model.m` - ⭐ NEW: Front camera MP prediction
  - `train_back_camera_prediction_model.m` - ⭐ NEW: Back camera MP prediction
  - `train_all_new_models.m` - ⭐ NEW: Train all new models at once
  - `tune_models.m` - Tuned RAM prediction with enhanced features
- **Utility Scripts:**
  - `train_all_models.m` - Train all standard models
  - `train_all_models_comprehensive.m` - Train all models including tuned versions
  - `train_all_models_enhanced.m` - Train all enhanced models
  - `evaluate_model.m` - Comprehensive model evaluation
  - `visualize_results.m` - Visualization script
  - `test_all_models.m` - Test all trained models
- **Prediction Functions:**
  - `predict_price.m` - Price prediction (standard)
  - `predict_price_enhanced.m` - Enhanced price prediction
  - `predict_price_ensemble.m` - Ensemble price prediction
  - `predict_brand.m` - Brand prediction
  - `predict_brand_enhanced.m` - Enhanced brand prediction
  - `predict_ram.m` - RAM prediction (supports both original and tuned)
  - `predict_ram_enhanced.m` - Enhanced RAM prediction
  - `predict_battery.m` - Battery prediction
  - `predict_battery_enhanced.m` - Enhanced battery prediction
  - `predict_front_camera.m` - ⭐ NEW: Front camera prediction
  - `predict_back_camera.m` - ⭐ NEW: Back camera prediction
- **Feature Engineering:**
  - `add_enhanced_features.m` - Add enhanced features to dataset
  - `implement_quick_improvements.m` - Implement quick model improvements
- **⭐ NEW: Advanced Analysis Scripts:**
  - `find_similar_phones.m` - Find phones with similar specifications
  - `analyze_market_segments.m` - Market segmentation (Budget/Mid-Range/Premium)
  - `analyze_regional_prices.m` - Regional price analysis across 5 regions
  - `visualize_new_features.m` - Generate all visualizations for screenshots

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

3. **Train Models:**
   ```matlab
   % Train all standard models
   run('train_all_models_comprehensive.m')

   % Or train enhanced models (recommended for best accuracy)
   run('train_all_models_enhanced.m')
   ```

4. **Evaluate and Visualize:**
   ```matlab
   run('evaluate_model.m')
   run('visualize_results.m')
   ```

5. **Test All Models:**
   ```matlab
   run('test_all_models.m')
   ```

6. **Make Predictions:**
   ```matlab
   % Price prediction (standard)
   price = predict_price(6, 4000, 6.1, 174, 2024, 'Apple');
   fprintf('Predicted price: $%.0f\n', price);

   % Enhanced price prediction (best accuracy)
   price_enhanced = predict_price_enhanced(6, 4000, 6.1, 174, 2024, 'Apple');
   fprintf('Enhanced predicted price: $%.0f\n', price_enhanced);

   % Ensemble prediction (combines multiple models)
   price_ensemble = predict_price_ensemble(6, 4000, 6.1, 174, 2024, 'Apple');
   fprintf('Ensemble predicted price: $%.0f\n', price_ensemble);

   % Brand classification
   brand = predict_brand(6, 4000, 6.1, 174, 2024, 999);
   fprintf('Predicted brand: %s\n', brand);

   % RAM prediction (uses tuned model if available)
   ram = predict_ram(4000, 6.1, 174, 2024, 999, 'Apple');
   fprintf('Predicted RAM: %d GB\n', ram);

   % ⭐ NEW: Camera predictions
   front_cam = predict_front_camera(6, 4000, 6.1, 174, 2024, 999, 'Apple');
   back_cam = predict_back_camera(6, 4000, 6.1, 174, 2024, 999, 'Apple');
   fprintf('Predicted cameras: Front=%d MP, Back=%d MP\n', front_cam, back_cam);

   % ⭐ NEW: Find similar phones
   similar = find_similar_phones(6, 4000, 6.1, 174, 2024, 999, 'Apple', 5);
   fprintf('Found %d similar phones\n', height(similar));

   % ⭐ NEW: Market segmentation
   segments = analyze_market_segments();

   % ⭐ NEW: Regional price analysis
   regional = analyze_regional_prices();
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

## ⭐ New Features (Latest Update)

### Camera Prediction Models
- Predict front and back camera MP from phone specifications
- High accuracy neural network models
- Usage: `predict_front_camera()`, `predict_back_camera()`

### Similar Phone Finder
- Find phones with similar specifications
- Uses cosine similarity and weighted distance
- Usage: `find_similar_phones()`

### Market Segmentation
- Automatic clustering into Budget/Mid-Range/Premium segments
- K-means analysis with detailed statistics
- Usage: `analyze_market_segments()`

### Regional Price Analysis
- Compare prices across 5 regions (Pakistan, India, China, USA, Dubai)
- Calculate conversion factors
- Usage: `analyze_regional_prices()`

### Visualizations
- Comprehensive visualization script for all features
- Screenshot-ready PNG files
- Usage: `visualize_new_features.m`

**See `NEW_FEATURES_GUIDE.md` for complete documentation!**

## Notes

- All scripts are designed to work with MATLAB
- The dataset requires preprocessing (handled automatically by scripts)
- Results are saved to MATLAB workspace variables for further analysis
- GPU acceleration is supported for neural network training

## Enhanced Models

This directory includes enhanced models with significant accuracy improvements:

- **Enhanced Price Prediction**: R² = 0.9824 (vs 0.95 original)
- **Enhanced RAM Prediction**: R² = 0.9516 (vs 0.89 original)
- **Enhanced Battery Prediction**: R² = 0.9477 (vs 0.88 original)
- **Enhanced Brand Classification**: 65.22% accuracy (vs 58% original)

See `ALL_MODELS_IMPROVEMENTS.md` and `FINAL_IMPROVEMENTS_COMPLETE.md` for details.

## Related Files

For general MATLAB deep learning examples and guides, see:
- `../deep-learning-networks-guide.md` - Comprehensive deep learning guide
- `../MOBILES_DATASET_GUIDE.md` - Network architecture selection guide
- `../time_series_forecasting_guide.md` - Time series forecasting guide
- `../EXAMPLES_SUMMARY.md` - Examples execution summary
- `../examples/` directory - Deep learning examples
- `../README.md` - Main project README
