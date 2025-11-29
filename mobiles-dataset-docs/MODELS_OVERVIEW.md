# Available Models Overview

This document provides an overview of all available trained models in the project.

## Price Prediction Models

### 1. Standard Price Prediction (`train_price_prediction_model.m`)

- **Architecture:** 128 → 64 → 32 neurons (3 hidden layers)
- **Use Case:** General price prediction
- **Performance:** R² = 0.7754, MAE = $119.73
- **Model File:** `trained_models/price_predictor.mat`
- **Prediction Function:** `predict_price(ram, battery, screenSize, weight, year, company)`

### 2. Deep Price Prediction (`train_price_prediction_deep.m`)

- **Architecture:** 256 → 128 → 64 → 32 → 16 neurons (5 hidden layers)
- **Use Case:** Complex price relationships, better accuracy potential
- **Characteristics:** Deeper network, more parameters, longer training time
- **Model File:** `trained_models/price_predictor_deep.mat`

### 3. Wide Price Prediction (`train_price_prediction_wide.m`)

- **Architecture:** 512 → 256 → 128 neurons (3 hidden layers, wider)
- **Use Case:** Capturing more feature interactions
- **Characteristics:** More neurons per layer, higher capacity
- **Model File:** `trained_models/price_predictor_wide.mat`

### 4. Lightweight Price Prediction (`train_price_prediction_lightweight.m`)

- **Architecture:** 64 → 32 neurons (2 hidden layers)
- **Use Case:** Fast inference, mobile/edge deployment
- **Characteristics:** Fewer parameters, faster training and prediction
- **Model File:** `trained_models/price_predictor_lightweight.mat`

## Classification Models

### 5. Brand Classification (`train_brand_classification_model.m`)

- **Architecture:** 128 → 64 → 32 neurons
- **Input:** RAM, Battery, Screen Size, Weight, Year, Price
- **Output:** Brand name (19 classes)
- **Performance:** 56.52% accuracy
- **Model File:** `trained_models/brand_classifier.mat`
- **Prediction Function:** `predict_brand(ram, battery, screenSize, weight, year, price)`

## Feature Prediction Models

### 6. RAM Prediction (`train_ram_prediction_model.m`)

- **Architecture:** 128 → 64 → 32 neurons
- **Input:** Battery, Screen Size, Weight, Year, Price, Company
- **Output:** RAM in GB
- **Use Case:** Predict RAM when missing from specifications
- **Model File:** `trained_models/ram_predictor.mat`
- **Prediction Function:** `predict_ram(battery, screenSize, weight, year, price, company)`

### 7. Battery Capacity Prediction (`train_battery_prediction_model.m`)

- **Architecture:** 128 → 64 → 32 neurons
- **Input:** RAM, Screen Size, Weight, Year, Price, Company
- **Output:** Battery Capacity in mAh
- **Use Case:** Predict battery capacity when missing
- **Model File:** `trained_models/battery_predictor.mat`
- **Prediction Function:** `predict_battery(ram, screenSize, weight, year, price, company)`

## Training All Models

To train all models at once:

```matlab
cd mobiles-dataset-docs
run('train_all_models.m')
```

This will train all 7 models sequentially and provide a summary.

## Model Comparison

| Model                | Type           | Layers | Neurons          | Use Case              |
| -------------------- | -------------- | ------ | ---------------- | --------------------- |
| Standard Price       | Regression     | 3      | 128→64→32        | General purpose       |
| Deep Price           | Regression     | 5      | 256→128→64→32→16 | Complex relationships |
| Wide Price           | Regression     | 3      | 512→256→128      | Feature interactions  |
| Lightweight Price    | Regression     | 2      | 64→32            | Fast inference        |
| Brand Classification | Classification | 3      | 128→64→32        | Brand identification  |
| RAM Prediction       | Regression     | 3      | 128→64→32        | Missing RAM           |
| Battery Prediction   | Regression     | 3      | 128→64→32        | Missing battery       |

## Usage Examples

### Price Prediction

```matlab
% Standard model
price = predict_price(6, 4000, 6.1, 174, 2024, 'Apple');

% Load and use other models
load('trained_models/price_predictor_deep.mat');
% ... use net for prediction
```

### Brand Classification

```matlab
brand = predict_brand(6, 4000, 6.1, 174, 2024, 999);
```

### Feature Prediction

```matlab
ram = predict_ram(4000, 6.1, 174, 2024, 999, 'Apple');
battery = predict_battery(6, 6.1, 174, 2024, 999, 'Apple');
```

## Model Selection Guide

- **Best Accuracy:** Deep Price Prediction (more layers)
- **Fastest Inference:** Lightweight Price Prediction
- **Most Features:** Wide Price Prediction
- **Balanced:** Standard Price Prediction
- **Brand ID:** Brand Classification
- **Missing Data:** RAM/Battery Prediction models

## Notes

- All models use the same preprocessing pipeline
- Models are saved with normalization parameters for consistent predictions
- GPU acceleration is automatically used if available
- Training progress is displayed for all models
