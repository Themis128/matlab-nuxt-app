# New Features Guide - Additional Capabilities

This guide documents all the new features and capabilities added to the Mobile Phones Dataset project.

## 📋 Table of Contents

1. [Camera Prediction Models](#camera-prediction-models)
2. [Similar Phone Finder](#similar-phone-finder)
3. [Market Segmentation Analysis](#market-segmentation-analysis)
4. [Regional Price Analysis](#regional-price-analysis)
5. [Visualizations](#visualizations)
6. [Quick Start](#quick-start)
7. [Usage Examples](#usage-examples)

---

## 📸 Camera Prediction Models

### Overview

Two new neural network models that predict front and back camera megapixels from other phone specifications.

### Features

- **Front Camera Prediction**: Predicts front camera MP from RAM, Battery, Screen Size, Weight, Year, Price, and Company
- **Back Camera Prediction**: Predicts back camera MP from the same features
- **High Accuracy**: Both models use the same architecture as existing models (128→64→32 neurons)

### Training

```matlab
% Train front camera model
run('train_front_camera_prediction_model.m')

% Train back camera model
run('train_back_camera_prediction_model.m')

% Or train both at once
run('train_all_new_models.m')
```

### Usage

```matlab
% Predict front camera
front_cam = predict_front_camera(8, 5000, 6.7, 200, 2024, 899, 'Samsung');
fprintf('Predicted front camera: %d MP\n', front_cam);

% Predict back camera
back_cam = predict_back_camera(8, 5000, 6.7, 200, 2024, 899, 'Samsung');
fprintf('Predicted back camera: %d MP\n', back_cam);
```

### Model Files

- `trained_models/front_camera_predictor.mat` - Front camera model
- `trained_models/back_camera_predictor.mat` - Back camera model
- `trained_models/front_camera_prediction_results.mat` - Evaluation results
- `trained_models/back_camera_prediction_results.mat` - Evaluation results

### Performance Metrics

After training, check the results files for:

- **R² Score**: How well the model explains variance
- **RMSE**: Root Mean Squared Error (in MP)
- **MAE**: Mean Absolute Error (in MP)
- **MAPE**: Mean Absolute Percentage Error

---

## 🔍 Similar Phone Finder

### Overview

A recommendation system that finds phones with similar specifications to a target phone.

### Features

- **Cosine Similarity**: Uses normalized feature vectors for accurate similarity
- **Weighted Distance**: Considers price more heavily in similarity calculation
- **Comprehensive Results**: Returns top N similar phones with similarity scores

### Usage

```matlab
% Find 5 similar phones
similar_phones = find_similar_phones(8, 5000, 6.7, 200, 2024, 899, 'Samsung', 5);

% Find 10 similar phones (default is 5)
similar_phones = find_similar_phones(8, 5000, 6.7, 200, 2024, 899, 'Samsung', 10);
```

### Output

Returns a table with:

- RAM, Battery, Screen Size, Weight, Price, Year, Company
- Similarity Score (0-1, higher is more similar)
- Camera information (if available)

### Example Output

```
Top 5 Similar Phones:

1. Samsung Phone (2024)
   Specs: 8GB RAM, 5000mAh, 6.7", 200g, $899
   Similarity: 95.23%

2. Samsung Phone (2023)
   Specs: 8GB RAM, 4800mAh, 6.6", 195g, $849
   Similarity: 87.45%
...
```

### Algorithm

1. Normalizes all features (RAM, Battery, Screen, Weight, Year, Price)
2. Calculates cosine similarity between target and all phones
3. Calculates weighted Euclidean distance
4. Combines both metrics (70% cosine, 30% distance)
5. Returns top N most similar phones

---

## 📊 Market Segmentation Analysis

### Overview

Automatically clusters phones into market segments (Budget, Mid-Range, Premium) using K-means clustering.

### Features

- **Automatic Clustering**: Uses K-means with 3 segments
- **Segment Characteristics**: Analyzes average specs for each segment
- **Brand Analysis**: Identifies top brands in each segment
- **Visualization**: Creates charts showing segment distribution

### Usage

```matlab
% Run market segmentation
segments = analyze_market_segments();
```

### Output Structure

The function returns a structure with:

```matlab
segments.Budget
  - indices: Phone indices in this segment
  - count: Number of phones
  - avgPrice: Average price
  - priceRange: [min, max] prices
  - avgRAM: Average RAM
  - avgBattery: Average battery
  - avgScreen: Average screen size
  - avgYear: Average year
  - topBrands: Top 3 brands
  - centroid: Cluster center

segments.('Mid-Range')  % Same structure
segments.Premium        % Same structure

segments.assignments    % Categorical array with segment for each phone
segments.clusterIndices % Numeric cluster indices
```

### Example Output

```
--- Budget Segment ---
   Phones: 245 (32.5%)
   Average Price: $289
   Price Range: $89 - $499
   Average RAM: 4.2 GB
   Average Battery: 4234 mAh
   Average Screen: 6.1"
   Average Year: 2022
   Top Brands: Xiaomi, Realme, Samsung

--- Mid-Range Segment ---
   Phones: 312 (41.4%)
   Average Price: $649
   Price Range: $500 - $799
   Average RAM: 6.8 GB
   Average Battery: 4789 mAh
   Average Screen: 6.4"
   Average Year: 2023
   Top Brands: Samsung, OnePlus, Xiaomi

--- Premium Segment ---
   Phones: 196 (26.1%)
   Average Price: $1099
   Price Range: $800 - $1599
   Average RAM: 8.5 GB
   Average Battery: 5123 mAh
   Average Screen: 6.7"
   Average Year: 2024
   Top Brands: Apple, Samsung, OnePlus
```

### Saved Files

- `analysis_results/market_segments.mat` - Complete segmentation results

---

## 🌍 Regional Price Analysis

### Overview

Analyzes price differences across 5 regions: Pakistan, India, China, USA, and Dubai.

### Features

- **Multi-Regional Analysis**: Compares prices across all regions
- **Conversion Factors**: Calculates price conversion factors relative to USA
- **Statistical Analysis**: Mean, median, min, max, standard deviation for each region
- **Visualization**: Box plots and bar charts showing regional differences

### Usage

```matlab
% Analyze regional prices
regional_analysis = analyze_regional_prices();
```

### Output Structure

```matlab
regional_analysis.regions        % Cell array of region names
regional_analysis.regionData     % Cell array of price vectors

regional_analysis.Pakistan
  - mean: Average price
  - median: Median price
  - min: Minimum price
  - max: Maximum price
  - std: Standard deviation
  - count: Number of valid prices
  - conversionFactor: Relative to USA (if available)

% Same for India, China, USA, Dubai
```

### Example Output

```
--- Pakistan ---
   Valid prices: 753
   Mean: 45234.50
   Median: 38900.00
   Min: 8900.00
   Max: 189900.00
   Std Dev: 32456.78

--- Conversion Factors (relative to USA) ---
   Pakistan: 0.0034 (1 USD = 0.0034 PKR)
   India: 0.0120 (1 USD = 0.0120 INR)
   China: 0.1400 (1 USD = 0.1400 CNY)
   Dubai: 0.2723 (1 USD = 0.2723 AED)
```

### Saved Files

- `analysis_results/regional_price_analysis.mat` - Complete analysis results
- `visualizations/regional_price_analysis.png` - Visualization charts

---

## 📈 Visualizations

### Overview

Comprehensive visualization script that generates screenshot-ready plots for all new features.

### Usage

```matlab
% Generate all visualizations
run('visualize_new_features.m')
```

### Generated Visualizations

1. **Camera Prediction Performance** (`camera_prediction_performance.png`)

   - Scatter plots showing predicted vs actual for front and back cameras
   - Includes R² and RMSE metrics

2. **Market Segmentation** (`market_segmentation.png`)

   - Price vs RAM colored by segment
   - Pie chart showing segment distribution

3. **Segment Characteristics** (`segment_characteristics.png`)

   - Bar chart comparing normalized characteristics across segments

4. **Dataset Overview** (`dataset_overview.png`)

   - 6-panel dashboard showing:
     - Price distribution
     - RAM distribution
     - Battery distribution
     - Price trends over time
     - RAM vs Battery (colored by price)
     - Top 10 brands

5. **Model Performance Comparison** (`model_performance_comparison.png`)

   - R² scores for all models
   - Normalized RMSE comparison

6. **Regional Price Analysis** (`regional_price_analysis.png`)
   - Box plots of price distributions by region
   - Average price comparison bar chart

### Output Location

All visualizations are saved to: `visualizations/`

---

## 🚀 Quick Start

### Step 1: Preprocess Data (if not done)

```matlab
cd mobiles-dataset-docs
run('preprocess_dataset.m')
```

### Step 2: Train All New Models

```matlab
run('train_all_new_models.m')
```

This will:

- Train front camera prediction model
- Train back camera prediction model
- Run market segmentation analysis
- Generate all visualizations

### Step 3: Use the Features

```matlab
% Predict cameras
front_cam = predict_front_camera(8, 5000, 6.7, 200, 2024, 899, 'Samsung');
back_cam = predict_back_camera(8, 5000, 6.7, 200, 2024, 899, 'Samsung');

% Find similar phones
similar = find_similar_phones(8, 5000, 6.7, 200, 2024, 899, 'Samsung', 5);

% Analyze market segments
segments = analyze_market_segments();

% Analyze regional prices
regional = analyze_regional_prices();
```

---

## 💡 Usage Examples

### Example 1: Complete Phone Specification Prediction

```matlab
% Given: RAM, Battery, Screen Size, Weight, Year, Price, Company
ram = 8;
battery = 5000;
screenSize = 6.7;
weight = 200;
year = 2024;
price = 899;
company = 'Samsung';

% Predict all features
predicted_ram = predict_ram(battery, screenSize, weight, year, price, company);
predicted_battery = predict_battery(ram, screenSize, weight, year, price, company);
predicted_front_cam = predict_front_camera(ram, battery, screenSize, weight, year, price, company);
predicted_back_cam = predict_back_camera(ram, battery, screenSize, weight, year, price, company);
predicted_price = predict_price(ram, battery, screenSize, weight, year, company);

fprintf('Complete Phone Specifications:\n');
fprintf('  RAM: %d GB\n', ram);
fprintf('  Battery: %d mAh\n', battery);
fprintf('  Screen: %.1f"\n', screenSize);
fprintf('  Weight: %d g\n', weight);
fprintf('  Year: %d\n', year);
fprintf('  Price: $%d\n', price);
fprintf('  Front Camera: %d MP\n', predicted_front_cam);
fprintf('  Back Camera: %d MP\n', predicted_back_cam);
```

### Example 2: Find Budget Alternatives

```matlab
% Find phones similar to an expensive phone but cheaper
target_ram = 8;
target_battery = 5000;
target_screen = 6.7;
target_weight = 200;
target_year = 2024;
target_price = 1299;  % Expensive phone
target_company = 'Apple';

% Find similar phones
similar = find_similar_phones(target_ram, target_battery, target_screen, ...
                              target_weight, target_year, target_price, ...
                              target_company, 10);

% Filter for cheaper alternatives
cheaper = similar(similar.Price_USD < target_price, :);
fprintf('Found %d cheaper alternatives:\n', height(cheaper));
disp(cheaper);
```

### Example 3: Market Analysis

```matlab
% Analyze market segments
segments = analyze_market_segments();

% Find phones in premium segment
premium_indices = segments.Premium.indices;
load('preprocessed/preprocessed_data.mat');

fprintf('Premium Segment Phones:\n');
fprintf('  Count: %d\n', segments.Premium.count);
fprintf('  Average Price: $%.0f\n', segments.Premium.avgPrice);
fprintf('  Top Brands: %s\n', strjoin(string(segments.Premium.topBrands), ', '));

% Get specific premium phones
premium_phones = summaryTable(premium_indices(1:5), :);
disp(premium_phones);
```

### Example 4: Regional Price Comparison

```matlab
% Analyze regional prices
regional = analyze_regional_prices();

% Compare prices for a specific phone across regions
fprintf('Price Comparison Across Regions:\n');
for i = 1:length(regional.regions)
    region = regional.regions{i};
    if isfield(regional, region) && isfield(regional.(region), 'mean')
        fprintf('  %s: Average $%.2f\n', region, regional.(region).mean);
    end
end

% Get conversion factors
if isfield(regional.Pakistan, 'conversionFactor')
    fprintf('\nConversion Factors (relative to USA):\n');
    fprintf('  Pakistan: %.4f\n', regional.Pakistan.conversionFactor);
    fprintf('  India: %.4f\n', regional.India.conversionFactor);
    fprintf('  China: %.4f\n', regional.China.conversionFactor);
    fprintf('  Dubai: %.4f\n', regional.Dubai.conversionFactor);
end
```

---

## 📁 File Structure

```
mobiles-dataset-docs/
├── train_front_camera_prediction_model.m    # Front camera training
├── train_back_camera_prediction_model.m     # Back camera training
├── train_all_new_models.m                    # Train all at once
├── predict_front_camera.m                    # Front camera prediction
├── predict_back_camera.m                     # Back camera prediction
├── find_similar_phones.m                     # Similar phone finder
├── analyze_market_segments.m                # Market segmentation
├── analyze_regional_prices.m                 # Regional price analysis
├── visualize_new_features.m                  # Visualization script
├── trained_models/
│   ├── front_camera_predictor.mat
│   ├── back_camera_predictor.mat
│   └── *_prediction_results.mat
├── analysis_results/
│   ├── market_segments.mat
│   └── regional_price_analysis.mat
└── visualizations/
    ├── camera_prediction_performance.png
    ├── market_segmentation.png
    ├── segment_characteristics.png
    ├── dataset_overview.png
    ├── model_performance_comparison.png
    └── regional_price_analysis.png
```

---

## 🎯 Key Features Summary

| Feature                     | Purpose                        | Output                        |
| --------------------------- | ------------------------------ | ----------------------------- |
| **Camera Prediction**       | Predict front/back camera MP   | MP values                     |
| **Similar Phone Finder**    | Find phones with similar specs | Table of similar phones       |
| **Market Segmentation**     | Cluster phones into segments   | Segment assignments & stats   |
| **Regional Price Analysis** | Compare prices across regions  | Regional statistics & factors |

---

## 🔧 Troubleshooting

### Camera Models Not Training

**Issue**: "Insufficient camera data"

**Solution**:

- Check that camera columns exist in the dataset
- Ensure preprocessing parsed camera data correctly
- Run `preprocess_dataset.m` again to update data

### Similar Phone Finder Returns Empty

**Issue**: No similar phones found

**Solution**:

- Check that preprocessed data exists
- Verify input parameters are within valid ranges
- Try increasing `numResults` parameter

### Market Segmentation Errors

**Issue**: Clustering fails

**Solution**:

- Ensure at least 50 phones in dataset
- Check that price data is valid
- Verify preprocessing completed successfully

---

## 📚 Related Documentation

- `ADDITIONAL_POSSIBILITIES.md` - Complete list of possible features
- `README.md` - Main project documentation
- `QUICK_START.md` - Quick start guide
- `MOBILES_DATASET_GUIDE.md` - Dataset and network guide

---

## 🎉 Next Steps

After using these new features, consider:

1. **Enhancing Models**: Add more features or tune hyperparameters
2. **Creating Dashboards**: Build interactive interfaces
3. **API Integration**: Deploy models as web services
4. **Advanced Analytics**: Time series forecasting, trend analysis
5. **Production Deployment**: Optimize models for real-time use

---

**Happy Analyzing!** 🚀
