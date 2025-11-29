# Time Series Forecasting - Data Guide

## What Data is Appropriate for Time Series Forecasting?

Time series forecasting uses historical data to predict future values. Here's what you need:

## 1. Types of Appropriate Time Series Data

### ✅ Good for Forecasting:
- **Stock prices** - Predict future stock values
- **Weather data** - Temperature, humidity, precipitation
- **Sales data** - Daily/weekly/monthly sales figures
- **Energy consumption** - Electricity usage, power demand
- **Traffic data** - Vehicle counts, congestion levels
- **Economic indicators** - GDP, inflation rates, unemployment
- **Sensor readings** - Temperature sensors, IoT devices
- **Website traffic** - Page views, user visits
- **Production metrics** - Manufacturing output, quality metrics
- **Financial metrics** - Exchange rates, commodity prices

### ❌ Not Ideal:
- **Random data** - No patterns or trends
- **Too short sequences** - Need sufficient historical data
- **Missing too many values** - Need clean, complete data
- **Non-stationary without preprocessing** - Need trends/seasonality handled

## 2. Data Requirements

### Minimum Requirements:
- **Length**: At least 100-200 time steps (more is better)
- **Frequency**: Consistent time intervals (daily, hourly, etc.)
- **Completeness**: Minimal missing values (< 5%)
- **Patterns**: Should have some trend, seasonality, or patterns

### Ideal Characteristics:
- **Long history**: 1000+ time steps for better learning
- **Multiple features**: Can use multiple related time series
- **Seasonality**: Clear seasonal patterns (daily, weekly, yearly)
- **Trends**: Upward or downward trends
- **Cycles**: Repeating patterns

## 3. Data Format for MATLAB

### Format 1: Single Time Series (Univariate)
```matlab
% Column vector: [T x 1]
data = [100; 102; 98; 105; 103; ...];  % T time steps
```

### Format 2: Multiple Features (Multivariate)
```matlab
% Matrix: [T x N] where T = time steps, N = features
data = [
    100  50  20;  % Time step 1: feature1, feature2, feature3
    102  52  21;  % Time step 2
    98   49  19;  % Time step 3
    ...
];
```

### Format 3: Cell Array (for LSTM)
```matlab
% Cell array of sequences: {M x 1} where each cell is [T x N]
sequences = {
    [100; 102; 98; ...];      % Sequence 1
    [105; 103; 107; ...];     % Sequence 2
    ...
};
```

## 4. Data Structure for Forecasting

### Input-Output Structure:
For forecasting, you need:
- **Input (X)**: Historical values (past N time steps)
- **Output (Y)**: Future values to predict (next M time steps)

### Example:
```matlab
% If you have data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
% And want to predict 3 steps ahead using 5 past steps:

% Training samples:
X1 = [1, 2, 3, 4, 5]  → Y1 = [6, 7, 8]    % Predict steps 6-8 from 1-5
X2 = [2, 3, 4, 5, 6]  → Y2 = [7, 8, 9]    % Predict steps 7-9 from 2-6
X3 = [3, 4, 5, 6, 7]  → Y3 = [8, 9, 10]   % Predict steps 8-10 from 3-7
```

## 5. Example Datasets

### Built-in MATLAB Examples:
- **chickenpox_dataset.mat** - Monthly chickenpox cases
- **airline_dataset.mat** - Monthly airline passenger numbers
- **magic_dataset.mat** - Magic square dataset

### Real-World Examples:
- **Stock prices**: Daily closing prices
- **Weather**: Hourly temperature readings
- **Sales**: Weekly sales figures
- **Energy**: Hourly power consumption
- **Traffic**: Daily vehicle counts

## 6. Data Preprocessing Steps

### 1. Handle Missing Values
```matlab
% Fill missing values
data = fillmissing(data, 'linear');  % Linear interpolation
% or
data = fillmissing(data, 'previous');  % Forward fill
```

### 2. Normalize Data
```matlab
% Standardize (zero mean, unit variance)
data_normalized = normalize(data);

% Or min-max scaling to [0, 1]
data_scaled = (data - min(data)) / (max(data) - min(data));
```

### 3. Create Sequences
```matlab
% Create input-output pairs for forecasting
numTimeSteps = length(data);
numFeatures = size(data, 2);
sequenceLength = 10;  % Use past 10 steps
forecastHorizon = 3;  % Predict next 3 steps

% Create sequences
X = [];
Y = [];
for i = 1:(numTimeSteps - sequenceLength - forecastHorizon + 1)
    X{i} = data(i:i+sequenceLength-1, :);
    Y{i} = data(i+sequenceLength:i+sequenceLength+forecastHorizon-1, :);
end
```

### 4. Split into Train/Validation/Test
```matlab
% 70% train, 15% validation, 15% test
numTrain = floor(0.7 * length(X));
numVal = floor(0.15 * length(X));

XTrain = X(1:numTrain);
YTrain = Y(1:numTrain);
XVal = X(numTrain+1:numTrain+numVal);
YVal = Y(numTrain+1:numTrain+numVal);
XTest = X(numTrain+numVal+1:end);
YTest = Y(numTrain+numVal+1:end);
```

## 7. Data Size Guidelines

### Minimum Sizes:
- **Short sequences**: 50-100 time steps
- **Medium sequences**: 200-500 time steps
- **Long sequences**: 1000+ time steps

### For Different Forecast Horizons:
- **1-step ahead**: Need 100+ historical points
- **Multi-step (3-7 steps)**: Need 200+ historical points
- **Long-term (10+ steps)**: Need 500+ historical points

## 8. What Makes Good Forecasting Data?

### ✅ Characteristics:
1. **Clear patterns** - Trends, seasonality, cycles
2. **Consistent sampling** - Regular time intervals
3. **Sufficient length** - Enough history to learn patterns
4. **Relevant features** - Features that help predict the target
5. **Clean data** - Minimal noise, outliers handled

### ❌ Red Flags:
1. **Too noisy** - Random fluctuations dominate
2. **Too short** - Not enough data to learn patterns
3. **Missing values** - Large gaps in data
4. **Non-stationary** - Mean/variance changing over time (needs differencing)
5. **Irregular intervals** - Inconsistent time steps

## 9. Example: Preparing Your Data

See `examples/time_series_data_preparation.m` for a complete example of:
- Loading time series data
- Creating sequences
- Normalizing
- Splitting into train/val/test
- Formatting for LSTM networks

## 10. Quick Checklist

Before training, ensure your data has:
- [ ] At least 100-200 time steps (more is better)
- [ ] Consistent time intervals
- [ ] Missing values handled
- [ ] Data normalized/scaled
- [ ] Sequences created (input-output pairs)
- [ ] Train/validation/test split
- [ ] Appropriate forecast horizon (1-10 steps typical)

## Next Steps

1. **Get your time series data** (or use example datasets)
2. **Preprocess** (handle missing values, normalize)
3. **Create sequences** (input-output pairs)
4. **Train LSTM network** (see `examples/lstm_example.m`)
5. **Evaluate** on test set
6. **Forecast** future values
