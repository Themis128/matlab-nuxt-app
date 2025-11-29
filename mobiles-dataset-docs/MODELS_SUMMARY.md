# Trained Models Summary

This document provides a summary of all trained models and their performance metrics.

## ✅ All Models Successfully Trained

All 7 model variants have been trained and are ready for use.

## Price Prediction Models

### 1. Standard Price Prediction

- **File:** `trained_models/price_predictor.mat`
- **Architecture:** 128 → 64 → 32 neurons (3 hidden layers)
- **Performance:**
  - R²: 0.7754
  - RMSE: $167.83
  - MAE: $119.73
  - MAPE: 31.41%
- **Use Case:** General purpose price prediction
- **Prediction:** `predict_price(ram, battery, screenSize, weight, year, company)`

### 2. Deep Price Prediction

- **File:** `trained_models/price_predictor_deep.mat`
- **Architecture:** 256 → 128 → 64 → 32 → 16 neurons (5 hidden layers)
- **Use Case:** Complex price relationships, potentially better accuracy
- **Characteristics:** Deeper network, more parameters, longer training time

### 3. Wide Price Prediction

- **File:** `trained_models/price_predictor_wide.mat`
- **Architecture:** 512 → 256 → 128 neurons (3 hidden layers, wider)
- **Use Case:** Capturing more feature interactions
- **Characteristics:** More neurons per layer, higher capacity

### 4. Lightweight Price Prediction

- **File:** `trained_models/price_predictor_lightweight.mat`
- **Architecture:** 64 → 32 neurons (2 hidden layers)
- **Use Case:** Fast inference, mobile/edge deployment
- **Characteristics:** Fewer parameters, faster training and prediction

## Classification Models

### 5. Brand Classification

- **File:** `trained_models/brand_classifier.mat`
- **Architecture:** 128 → 64 → 32 neurons
- **Input:** RAM, Battery, Screen Size, Weight, Year, Price
- **Output:** Brand name (19 classes)
- **Performance:**
  - Accuracy: 56.52%
  - Weighted F1-Score: 0.5398
  - Best performing brands: Apple (100% recall), Sony (100% precision/recall)
- **Prediction:** `predict_brand(ram, battery, screenSize, weight, year, price)`

## Feature Prediction Models

### 6. RAM Prediction

- **File:** `trained_models/ram_predictor.mat`
- **Architecture:** 128 → 64 → 32 neurons
- **Input:** Battery, Screen Size, Weight, Year, Price, Company
- **Output:** RAM in GB
- **Performance:**
  - R²: 0.6381
  - RMSE: 1.64 GB
  - MAE: 1.28 GB
  - MAPE: 20.86%
- **Use Case:** Predict RAM when missing from specifications
- **Prediction:** `predict_ram(battery, screenSize, weight, year, price, company)`

### 7. Battery Capacity Prediction

- **File:** `trained_models/battery_predictor.mat`
- **Architecture:** 128 → 64 → 32 neurons
- **Input:** RAM, Screen Size, Weight, Year, Price, Company
- **Output:** Battery Capacity in mAh
- **Performance:**
  - R²: 0.7489
  - RMSE: 310.97 mAh
  - MAE: 224.18 mAh
  - MAPE: 5.08% (excellent!)
- **Use Case:** Predict battery capacity when missing
- **Prediction:** `predict_battery(ram, screenSize, weight, year, price, company)`

## Model Performance Comparison

| Model                | Type           | R²/Accuracy | RMSE/MAE         | Best For              |
| -------------------- | -------------- | ----------- | ---------------- | --------------------- |
| Standard Price       | Regression     | R²: 0.7754  | RMSE: $167.83    | General purpose       |
| Deep Price           | Regression     | -           | -                | Complex relationships |
| Wide Price           | Regression     | -           | -                | Feature interactions  |
| Lightweight Price    | Regression     | -           | -                | Fast inference        |
| Brand Classification | Classification | 56.52%      | F1: 0.5398       | Brand identification  |
| RAM Prediction       | Regression     | R²: 0.6381  | RMSE: 1.64 GB    | Missing RAM           |
| Battery Prediction   | Regression     | R²: 0.7489  | RMSE: 310.97 mAh | Missing battery       |

## Usage Examples

### Price Prediction

```matlab
% Standard model
price = predict_price(6, 4000, 6.1, 174, 2024, 'Apple');
fprintf('Predicted price: $%.0f\n', price);

% Load and use other models
load('trained_models/price_predictor_deep.mat');
% ... use net for prediction
```

### Brand Classification

```matlab
brand = predict_brand(6, 4000, 6.1, 174, 2024, 999);
fprintf('Predicted brand: %s\n', brand);
```

### Feature Prediction

```matlab
ram = predict_ram(4000, 6.1, 174, 2024, 999, 'Apple');
battery = predict_battery(6, 6.1, 174, 2024, 999, 'Apple');
fprintf('Predicted RAM: %.0f GB\n', ram);
fprintf('Predicted Battery: %.0f mAh\n', battery);
```

## Model Files Location

All models are saved in: `mobiles-dataset-docs/trained_models/`

- Model files: `*_predictor.mat`, `*_classifier.mat`
- Results files: `*_results.mat`
- Evaluation reports: `evaluation_report.mat`

## Training Date

All models were trained on: November 21, 2025

## Next Steps

1. ✅ All models trained successfully
2. ✅ Evaluation scripts created
3. ✅ Visualization scripts created
4. ✅ Prediction functions available
5. 🔲 Compare model performances
6. 🔲 Fine-tune best performing models
7. 🔲 Create ensemble models
8. 🔲 Deploy models for production use
