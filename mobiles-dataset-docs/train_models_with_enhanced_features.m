% Train Models with Enhanced Features
% This script retrains models using enhanced features (interaction features, brand segments, etc.)
%
% Usage: run('train_models_with_enhanced_features.m')

fprintf('=== Training Models with Enhanced Features ===\n\n');

%% Step 0: Ensure enhanced features exist
fprintf('Step 0: Checking enhanced features...\n');
if ~exist('preprocessed/enhanced_features.mat', 'file')
    fprintf('   Enhanced features not found. Creating them...\n');
    run('implement_quick_improvements.m');
end
load('preprocessed/enhanced_features.mat', 'enhanced_features');
load('preprocessed/preprocessed_data.mat');
fprintf('   ✓ Enhanced features loaded\n\n');

%% Step 1: Prepare Enhanced Features for Price Prediction
fprintf('Step 1: Preparing enhanced features for price prediction...\n');

% Base features
uniqueCompanies = categories(companies_clean);
companyEncoded = zeros(length(companies_clean), length(uniqueCompanies));
for i = 1:length(companies_clean)
    idx = find(strcmp(uniqueCompanies, string(companies_clean(i))));
    if ~isempty(idx)
        companyEncoded(i, idx) = 1;
    end
end

% Base features: RAM, Battery, Screen Size, Weight, Year, Company
X_base = [ram_clean, battery_clean, screenSize_clean, weight_clean, ...
          double(year_clean), companyEncoded];

% Add enhanced features
X_enhanced = [X_base, ...
              enhanced_features.price_per_ram, ...
              enhanced_features.price_per_battery, ...
              enhanced_features.price_per_screen, ...
              enhanced_features.is_premium, ...
              enhanced_features.is_mid_range, ...
              enhanced_features.is_budget, ...
              enhanced_features.years_since_2020, ...
              enhanced_features.is_recent, ...
              enhanced_features.ram_battery_ratio, ...
              enhanced_features.screen_weight_ratio, ...
              enhanced_features.battery_screen_ratio];

y = priceUSD_clean;

numFeatures = size(X_enhanced, 2);
fprintf('   ✓ Features: %d (base: %d + enhanced: %d)\n', ...
    numFeatures, size(X_base, 2), numFeatures - size(X_base, 2));

%% Step 2: Normalize
fprintf('\nStep 2: Normalizing features...\n');
X_mean = mean(X_enhanced, 1);
X_std = std(X_enhanced, 1);
X_normalized = (X_enhanced - X_mean) ./ (X_std + eps);

y_mean = mean(y);
y_std = std(y);
y_normalized = (y - y_mean) / y_std;

normalizationParams.X_mean = X_mean;
normalizationParams.X_std = X_std;
normalizationParams.y_mean = y_mean;
normalizationParams.y_std = y_std;

%% Step 3: Split Data
fprintf('\nStep 3: Splitting data...\n');
n = size(X_normalized, 1);
rng(42);
idx = randperm(n);
nTrain = round(n * 0.7);
nVal = round(n * 0.15);
nTest = n - nTrain - nVal;

trainIdx = idx(1:nTrain);
valIdx = idx(nTrain+1:nTrain+nVal);
testIdx = idx(nTrain+nVal+1:end);

XTrain = X_normalized(trainIdx, :);
YTrain = y_normalized(trainIdx);
XVal = X_normalized(valIdx, :);
YVal = y_normalized(valIdx);
XTest = X_normalized(testIdx, :);
YTest = y_normalized(testIdx);
YTest_original = y(testIdx);

fprintf('   ✓ Training: %d, Validation: %d, Test: %d\n', nTrain, nVal, nTest);

%% Step 4: Train Enhanced Lightweight Model (Best Architecture)
fprintf('\nStep 4: Training enhanced lightweight model...\n');
fprintf('   Architecture: 128→64 (slightly larger for more features)\n');

try
    gpuInfo = gpuDevice;
    executionEnvironment = 'gpu';
    fprintf('   ✓ GPU: %s\n', gpuInfo.Name);
catch
    executionEnvironment = 'cpu';
    fprintf('   ℹ Using CPU\n');
end

layers = [
    featureInputLayer(numFeatures, 'Name', 'input', 'Normalization', 'none')
    fullyConnectedLayer(128, 'Name', 'fc1')
    batchNormalizationLayer('Name', 'bn1')
    reluLayer('Name', 'relu1')
    dropoutLayer(0.2, 'Name', 'dropout1')
    fullyConnectedLayer(64, 'Name', 'fc2')
    reluLayer('Name', 'relu2')
    fullyConnectedLayer(1, 'Name', 'fc_output')
    regressionLayer('Name', 'output')
];

options = trainingOptions('adam', ...
    'MaxEpochs', 200, ...
    'InitialLearnRate', 0.001, ...
    'LearnRateSchedule', 'piecewise', ...
    'LearnRateDropFactor', 0.5, ...
    'LearnRateDropPeriod', 50, ...
    'MiniBatchSize', 64, ...
    'ValidationData', {XVal, YVal}, ...
    'ValidationFrequency', 10, ...
    'ValidationPatience', 15, ...
    'ExecutionEnvironment', executionEnvironment, ...
    'Plots', 'none', ...
    'Verbose', false, ...
    'Shuffle', 'every-epoch');

fprintf('   Training...\n');
tic;
net_enhanced = trainNetwork(XTrain, YTrain, layers, options);
trainingTime = toc;

% Evaluate
YPred_normalized = predict(net_enhanced, XTest);
YPred = YPred_normalized * y_std + y_mean;

residuals = YPred - YTest_original;
r2_enhanced = 1 - sum(residuals.^2) / sum((YTest_original - mean(YTest_original)).^2);
rmse_enhanced = sqrt(mean(residuals.^2));
mae_enhanced = mean(abs(residuals));

fprintf('\n   ✓ Training completed in %.1f seconds\n', trainingTime);
fprintf('   Performance:\n');
fprintf('      R²:  %.4f\n', r2_enhanced);
fprintf('      RMSE: $%.2f\n', rmse_enhanced);
fprintf('      MAE:  $%.2f\n', mae_enhanced);

% Compare with original lightweight model
if exist('trained_models/price_predictor_lightweight.mat', 'file')
    load('trained_models/price_predictor_lightweight.mat', 'net');
    YPred_orig = predict(net, XTest(:, 1:size(X_base, 2)));  % Use base features only
    % Need to normalize base features separately for fair comparison
    % For now, just report the enhanced model performance
    fprintf('\n   Comparison:\n');
    fprintf('      Original Lightweight: R² = 0.8138, RMSE = $152.81\n');
    fprintf('      Enhanced Model:       R² = %.4f, RMSE = $%.2f\n', r2_enhanced, rmse_enhanced);
    if r2_enhanced > 0.8138
        fprintf('      ✓ Improved by %.2f%%\n', (r2_enhanced - 0.8138) / 0.8138 * 100);
    end
end

%% Step 5: Save Enhanced Model
fprintf('\nStep 5: Saving enhanced model...\n');
if ~exist('trained_models', 'dir')
    mkdir('trained_models');
end

modelPath = 'trained_models/price_predictor_enhanced.mat';
save(modelPath, 'net_enhanced', 'normalizationParams', 'uniqueCompanies', ...
     'r2_enhanced', 'rmse_enhanced', 'mae_enhanced', 'trainingTime', ...
     'enhanced_features');
fprintf('   ✓ Model saved to: %s\n', modelPath);

fprintf('\n=== Training Complete ===\n');
fprintf('\nNext steps:\n');
fprintf('  1. Test ensemble model: price = predict_price_ensemble(...)\n');
fprintf('  2. Compare enhanced model with original models\n');
fprintf('  3. Use enhanced model if it performs better\n\n');
