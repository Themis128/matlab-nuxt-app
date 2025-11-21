% Time Series Data Preparation for Forecasting
% This script shows how to prepare time series data for LSTM forecasting

fprintf('=== Time Series Data Preparation ===\n\n');

%% 1. Generate or Load Example Time Series Data
fprintf('1. Creating example time series data...\n');

% Example: Simulated sales data with trend and seasonality
numTimeSteps = 500;
time = (1:numTimeSteps)';

% Create synthetic data with:
% - Linear trend
% - Weekly seasonality (7-day cycle)
% - Some noise
trend = 0.1 * time;  % Upward trend
seasonality = 10 * sin(2*pi*time/7);  % Weekly pattern
noise = 2 * randn(numTimeSteps, 1);  % Random noise

% Combine components
data = 100 + trend + seasonality + noise;

fprintf('   Created time series with %d time steps\n', numTimeSteps);
fprintf('   Data range: [%.2f, %.2f]\n', min(data), max(data));
fprintf('   Features: Trend + Seasonality + Noise\n\n');

% Visualize the data
figure;
plot(time, data);
xlabel('Time Step');
ylabel('Value');
title('Example Time Series Data');
grid on;

%% 2. Handle Missing Values (if any)
fprintf('2. Handling missing values...\n');
% In real data, you might have missing values
% data_with_nans = data;
% data_with_nans(randperm(numTimeSteps, 10)) = NaN;  % Add some NaNs
% data = fillmissing(data_with_nans, 'linear');

fprintf('   No missing values detected (or already handled)\n\n');

%% 3. Normalize the Data
fprintf('3. Normalizing data...\n');

% Option 1: Standardize (zero mean, unit variance)
data_mean = mean(data);
data_std = std(data);
data_normalized = (data - data_mean) / data_std;

% Option 2: Min-Max scaling to [0, 1]
data_min = min(data);
data_max = max(data);
data_scaled = (data - data_min) / (data_max - data_min);

% Use normalized data for training
data_for_training = data_normalized;

fprintf('   Data normalized (mean=0, std=1)\n');
fprintf('   Mean: %.4f, Std: %.4f\n', mean(data_for_training), std(data_for_training));
fprintf('\n');

%% 4. Create Sequences for Forecasting
fprintf('4. Creating input-output sequences...\n');

% Parameters
sequenceLength = 30;  % Use past 30 time steps
forecastHorizon = 7;  % Predict next 7 time steps
numFeatures = 1;      % Number of features (1 for univariate)

% Create sequences
X = {};
Y = {};
numSequences = numTimeSteps - sequenceLength - forecastHorizon + 1;

for i = 1:numSequences
    % Input: past 'sequenceLength' steps
    X{i} = data_for_training(i:i+sequenceLength-1);

    % Output: next 'forecastHorizon' steps
    Y{i} = data_for_training(i+sequenceLength:i+sequenceLength+forecastHorizon-1);
end

fprintf('   Created %d sequences\n', numSequences);
fprintf('   Input shape: [%d x %d] (time steps x features)\n', sequenceLength, numFeatures);
fprintf('   Output shape: [%d x %d] (forecast horizon x features)\n', forecastHorizon, numFeatures);
fprintf('\n');

%% 5. Split into Train/Validation/Test Sets
fprintf('5. Splitting data...\n');

% Split ratios
trainRatio = 0.7;
valRatio = 0.15;
testRatio = 0.15;

numTrain = floor(trainRatio * numSequences);
numVal = floor(valRatio * numSequences);
numTest = numSequences - numTrain - numVal;

% Split sequences
XTrain = X(1:numTrain);
YTrain = Y(1:numTrain);
XVal = X(numTrain+1:numTrain+numVal);
YVal = Y(numTrain+1:numTrain+numVal);
XTest = X(numTrain+numVal+1:end);
YTest = Y(numTrain+numVal+1:end);

fprintf('   Training: %d sequences (%.1f%%)\n', numTrain, trainRatio*100);
fprintf('   Validation: %d sequences (%.1f%%)\n', numVal, valRatio*100);
fprintf('   Test: %d sequences (%.1f%%)\n', numTest, testRatio*100);
fprintf('\n');

%% 6. Convert to Appropriate Format for LSTM
fprintf('6. Formatting for LSTM network...\n');

% LSTM expects:
% - X: Cell array of sequences, each [T x N] where T=time steps, N=features
% - Y: For regression, can be cell array or numeric array

% For regression (forecasting), keep Y as cell array for LSTM
% Each cell contains the forecast horizon values
% YTrain, YVal, YTest are already in correct format (cell arrays)

% Alternative: Convert to numeric array if needed
% YTrain_numeric = cell2mat(YTrain');
% YVal_numeric = cell2mat(YVal');
% YTest_numeric = cell2mat(YTest');

fprintf('   Data formatted for LSTM training\n');
fprintf('   XTrain: %d sequences\n', length(XTrain));
fprintf('   YTrain: %d sequences (each with %d forecast steps)\n', length(YTrain), forecastHorizon);
fprintf('\n');

%% 7. Display Sample Sequence
fprintf('7. Sample sequence preview:\n');
fprintf('   Input (X) - past %d steps:\n', sequenceLength);
fprintf('     %.4f, %.4f, %.4f, ... (showing first 3 of %d)\n', ...
    XTrain{1}(1), XTrain{1}(2), XTrain{1}(3), sequenceLength);
fprintf('   Output (Y) - next %d steps:\n', forecastHorizon);
if forecastHorizon >= 3
    fprintf('     %.4f, %.4f, %.4f, ... (showing first 3 of %d)\n', ...
        YTrain{1}(1), YTrain{1}(2), YTrain{1}(3), forecastHorizon);
else
    fprintf('     %.4f (all %d steps)\n', YTrain{1}(1), forecastHorizon);
end
fprintf('\n');

%% 8. Summary
fprintf('=== Data Preparation Complete ===\n\n');
fprintf('Your data is ready for LSTM training!\n\n');
fprintf('Data Summary:\n');
fprintf('  - Total time steps: %d\n', numTimeSteps);
fprintf('  - Sequences created: %d\n', numSequences);
fprintf('  - Input length: %d time steps\n', sequenceLength);
fprintf('  - Forecast horizon: %d time steps\n', forecastHorizon);
fprintf('  - Features: %d\n', numFeatures);
fprintf('\n');
fprintf('Next steps:\n');
fprintf('  1. Create LSTM network (see lstm_forecasting_example.m)\n');
fprintf('  2. Train network: net = trainNetwork(XTrain, YTrain_numeric, layers, options)\n');
fprintf('  3. Evaluate on test set\n');
fprintf('  4. Make predictions\n\n');

% Save normalization parameters for later use (to denormalize predictions)
normalization_params = struct();
normalization_params.mean = data_mean;
normalization_params.std = data_std;
normalization_params.min = data_min;
normalization_params.max = data_max;

fprintf('Normalization parameters saved for denormalizing predictions.\n');
fprintf('Use: predictions_original = predictions * data_std + data_mean\n\n');
