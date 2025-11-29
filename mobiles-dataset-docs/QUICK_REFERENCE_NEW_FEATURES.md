# Quick Reference - New Features

## 🚀 Quick Start

```matlab
cd mobiles-dataset-docs
run('train_all_new_models.m')  % Train everything at once
```

---

## 📸 Camera Prediction

```matlab
% Predict cameras
front_cam = predict_front_camera(ram, battery, screenSize, weight, year, price, company);
back_cam = predict_back_camera(ram, battery, screenSize, weight, year, price, company);
```

**Example:**

```matlab
front = predict_front_camera(8, 5000, 6.7, 200, 2024, 899, 'Samsung');
back = predict_back_camera(8, 5000, 6.7, 200, 2024, 899, 'Samsung');
```

---

## 🔍 Similar Phone Finder

```matlab
% Find similar phones
similar = find_similar_phones(ram, battery, screenSize, weight, year, price, company, numResults);
```

**Example:**

```matlab
similar = find_similar_phones(8, 5000, 6.7, 200, 2024, 899, 'Samsung', 5);
disp(similar);
```

---

## 📊 Market Segmentation

```matlab
% Analyze market segments
segments = analyze_market_segments();
```

**Access Results:**

```matlab
segments.Budget.avgPrice      % Average price in budget segment
segments.('Mid-Range').count  % Number of mid-range phones
segments.Premium.topBrands    % Top brands in premium segment
```

---

## 🌍 Regional Price Analysis

```matlab
% Analyze regional prices
regional = analyze_regional_prices();
```

**Access Results:**

```matlab
regional.Pakistan.mean              % Average price in Pakistan
regional.India.conversionFactor      % Conversion factor vs USA
regional.China.median                % Median price in China
```

---

## 📈 Visualizations

```matlab
% Generate all visualizations
run('visualize_new_features.m')
```

**Output Location:** `visualizations/` folder

**Generated Files:**

- `camera_prediction_performance.png`
- `market_segmentation.png`
- `segment_characteristics.png`
- `dataset_overview.png`
- `model_performance_comparison.png`
- `regional_price_analysis.png`

---

## 📁 File Locations

### Models

- `trained_models/front_camera_predictor.mat`
- `trained_models/back_camera_predictor.mat`

### Results

- `analysis_results/market_segments.mat`
- `analysis_results/regional_price_analysis.mat`

### Visualizations

- `visualizations/*.png`

---

## 🔧 Training Individual Models

```matlab
% Front camera
run('train_front_camera_prediction_model.m')

% Back camera
run('train_back_camera_prediction_model.m')

% All at once
run('train_all_new_models.m')
```

---

## 📚 Documentation

- **Complete Guide**: `NEW_FEATURES_GUIDE.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **All Possibilities**: `ADDITIONAL_POSSIBILITIES.md`

---

## 💡 Common Use Cases

### 1. Complete Phone Spec Prediction

```matlab
ram = 8; battery = 5000; screen = 6.7; weight = 200; year = 2024; price = 899; company = 'Samsung';
front_cam = predict_front_camera(ram, battery, screen, weight, year, price, company);
back_cam = predict_back_camera(ram, battery, screen, weight, year, price, company);
```

### 2. Find Budget Alternatives

```matlab
similar = find_similar_phones(8, 5000, 6.7, 200, 2024, 1299, 'Apple', 10);
cheaper = similar(similar.Price_USD < 1299, :);
```

### 3. Market Analysis

```matlab
segments = analyze_market_segments();
fprintf('Premium phones: %d\n', segments.Premium.count);
fprintf('Avg premium price: $%.0f\n', segments.Premium.avgPrice);
```

---

## ⚠️ Prerequisites

1. **Preprocess data first:**

   ```matlab
   run('preprocess_dataset.m')
   ```

2. **Train models:**
   ```matlab
   run('train_all_new_models.m')
   ```

---

## 🎯 All-in-One Example

```matlab
% Setup
cd mobiles-dataset-docs
run('preprocess_dataset.m')
run('train_all_new_models.m')

% Use features
ram = 8; battery = 5000; screen = 6.7; weight = 200; year = 2024; price = 899; company = 'Samsung';

% Predict cameras
front = predict_front_camera(ram, battery, screen, weight, year, price, company);
back = predict_back_camera(ram, battery, screen, weight, year, price, company);

% Find similar
similar = find_similar_phones(ram, battery, screen, weight, year, price, company, 5);

% Analyze market
segments = analyze_market_segments();

% Regional analysis
regional = analyze_regional_prices();

% Generate visualizations
run('visualize_new_features.m')
```

---

**For detailed documentation, see `NEW_FEATURES_GUIDE.md`**
