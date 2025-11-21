% Train All Models with Enhanced Features
% Applies enhanced features to RAM, Battery, and Brand models
%
% Usage: run('train_all_models_enhanced.m')

fprintf('=== Training All Models with Enhanced Features ===\n\n');

%% Step 0: Load Data and Enhanced Features
fprintf('Step 0: Loading data and enhanced features...\n');
if ~exist('preprocessed/enhanced_features.mat', 'file')
    fprintf('   Creating enhanced features...\n');
    run('implement_quick_improvements.m');
end
load('preprocessed/enhanced_features.mat', 'enhanced_features');
load('preprocessed/preprocessed_data.mat');
fprintf('   ✓ Data loaded\n\n');

%% ========================================================================
%% 1. ENHANCED RAM PREDICTION MODEL
%% ========================================================================
fprintf('========================================\n');
fprintf('1. Enhanced RAM Prediction Model\n');
fprintf('========================================\n\n');

% Base features: Battery, Screen Size, Weight, Year, Price, Company
uniqueCompanies = categories(companies_clean);
companyEncoded = zeros(length(companies_clean), length(uniqueCompanies));
for i = 1:length(companies_clean)
    idx = find(strcmp(uniqueCompanies, string(companies_clean(i))));
    if ~isempty(idx)
        companyEncoded(i, idx) = 1;
    end
end

X_base = [battery_clean, screenSize_clean, weight_clean, ...
          double(year_clean), priceUSD_clean, companyEncoded];

% Add enhanced features (price ratios, brand segments, temporal, interactions)
X_enhanced = [X_base, ...
              enhanced_features.price_per_ram, ...  % Note: uses price/ram ratio
              enhanced_features.price_per_battery, ...
              enhanced_features.price_per_screen, ...
              enhanced_features.is_premium, ...
              enhanced_features.is_mid_range, ...
              enhanced_features.is_budget, ...
              enhanced_features.years_since_2020, ...
              enhanced_features.is_recent, ...
              enhanced_features.screen_weight_ratio, ...
              enhanced_features.battery_screen_ratio];

y = ram_clean;

% Normalize
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

% Split
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

% Build network
fprintf('   Building network (256→128→64)...\n');
numFeatures = size(X_enhanced, 2);
layers = [
    featureInputLayer(numFeatures, 'Name', 'input', 'Normalization', 'none')
    fullyConnectedLayer(256, 'Name', 'fc1')
    batchNormalizationLayer('Name', 'bn1')
    reluLayer('Name', 'relu1')
    dropoutLayer(0.3, 'Name', 'dropout1')
    fullyConnectedLayer(128, 'Name', 'fc2')
    batchNormalizationLayer('Name', 'bn2')
    reluLayer('Name', 'relu2')
    dropoutLayer(0.2, 'Name', 'dropout2')
    fullyConnectedLayer(64, 'Name', 'fc3')
    reluLayer('Name', 'relu3')
    fullyConnectedLayer(1, 'Name', 'fc_output')
    regressionLayer('Name', 'output')
];

try
    gpuInfo = gpuDevice;
    executionEnvironment = 'gpu';
catch
    executionEnvironment = 'cpu';
end

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
fprintf('      RMSE: %.2f GB\n', rmse_enhanced);
fprintf('      MAE:  %.2f GB\n', mae_enhanced);

% Compare
fprintf('\n   Comparison:\n');
fprintf('      Original Tuned: R² = 0.6629, RMSE = 1.58 GB\n');
fprintf('      Enhanced Model:  R² = %.4f, RMSE = %.2f GB\n', r2_enhanced, rmse_enhanced);
if r2_enhanced > 0.6629
    fprintf('      ✓ Improved by %.2f%%\n', (r2_enhanced - 0.6629) / 0.6629 * 100);
end

% Save
if ~exist('trained_models', 'dir')
    mkdir('trained_models');
end
save('trained_models/ram_predictor_enhanced.mat', 'net_enhanced', 'normalizationParams', ...
     'uniqueCompanies', 'r2_enhanced', 'rmse_enhanced', 'mae_enhanced', 'trainingTime');
fprintf('   ✓ Model saved\n\n');

%% ========================================================================
%% 2. ENHANCED BATTERY PREDICTION MODEL
%% ========================================================================
fprintf('========================================\n');
fprintf('2. Enhanced Battery Prediction Model\n');
fprintf('========================================\n\n');

% Base features: RAM, Screen Size, Weight, Year, Price, Company
X_base = [ram_clean, screenSize_clean, weight_clean, ...
          double(year_clean), priceUSD_clean, companyEncoded];

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
              enhanced_features.screen_weight_ratio];

y = battery_clean;

% Normalize
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

% Split (same indices)
XTrain = X_normalized(trainIdx, :);
YTrain = y_normalized(trainIdx);
XVal = X_normalized(valIdx, :);
YVal = y_normalized(valIdx);
XTest = X_normalized(testIdx, :);
YTest = y_normalized(testIdx);
YTest_original = y(testIdx);

% Build network
fprintf('   Building network (256→128→64)...\n');
numFeatures = size(X_enhanced, 2);
layers = [
    featureInputLayer(numFeatures, 'Name', 'input', 'Normalization', 'none')
    fullyConnectedLayer(256, 'Name', 'fc1')
    batchNormalizationLayer('Name', 'bn1')
    reluLayer('Name', 'relu1')
    dropoutLayer(0.3, 'Name', 'dropout1')
    fullyConnectedLayer(128, 'Name', 'fc2')
    batchNormalizationLayer('Name', 'bn2')
    reluLayer('Name', 'relu2')
    dropoutLayer(0.2, 'Name', 'dropout2')
    fullyConnectedLayer(64, 'Name', 'fc3')
    reluLayer('Name', 'relu3')
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
mape_enhanced = mean(abs(residuals ./ YTest_original)) * 100;

fprintf('\n   ✓ Training completed in %.1f seconds\n', trainingTime);
fprintf('   Performance:\n');
fprintf('      R²:  %.4f\n', r2_enhanced);
fprintf('      RMSE: %.2f mAh\n', rmse_enhanced);
fprintf('      MAE:  %.2f mAh\n', mae_enhanced);
fprintf('      MAPE: %.2f%%\n', mape_enhanced);

% Compare
fprintf('\n   Comparison:\n');
fprintf('      Original: R² = 0.7489, RMSE = 310.97 mAh, MAPE = 5.08%%\n');
fprintf('      Enhanced:  R² = %.4f, RMSE = %.2f mAh, MAPE = %.2f%%\n', ...
    r2_enhanced, rmse_enhanced, mape_enhanced);
if r2_enhanced > 0.7489
    fprintf('      ✓ Improved by %.2f%%\n', (r2_enhanced - 0.7489) / 0.7489 * 100);
end

% Save
save('trained_models/battery_predictor_enhanced.mat', 'net_enhanced', 'normalizationParams', ...
     'uniqueCompanies', 'r2_enhanced', 'rmse_enhanced', 'mae_enhanced', 'mape_enhanced', 'trainingTime');
fprintf('   ✓ Model saved\n\n');

%% ========================================================================
%% 3. ENHANCED BRAND CLASSIFICATION MODEL
%% ========================================================================
fprintf('========================================\n');
fprintf('3. Enhanced Brand Classification Model\n');
fprintf('========================================\n\n');

% Base features: RAM, Battery, Screen Size, Weight, Year, Price
X_base = [ram_clean, battery_clean, screenSize_clean, weight_clean, ...
          double(year_clean), priceUSD_clean];

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

y = companies_clean;

% Filter empty categories
classCounts = countcats(y);
validCategories = classCounts > 0;
uniqueCompanies = categories(y);
uniqueCompanies = uniqueCompanies(validCategories);
validSamples = ismember(y, uniqueCompanies);
y = y(validSamples);
X_enhanced = X_enhanced(validSamples, :);
y = removecats(y);
uniqueCompanies = categories(y);
numClasses = length(uniqueCompanies);

% Normalize
X_mean = mean(X_enhanced, 1);
X_std = std(X_enhanced, 1);
X_normalized = (X_enhanced - X_mean) ./ (X_std + eps);

normalizationParams.X_mean = X_mean;
normalizationParams.X_std = X_std;

% Calculate class weights
classCounts = countcats(y);
totalSamples = length(y);
maxCount = max(classCounts);
classWeights = maxCount ./ classCounts;
classWeights = max(classWeights, 0.5);
classWeights = min(classWeights, 5.0);
classWeights = classWeights / mean(classWeights);

% Split
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
XVal = X_normalized(valIdx, :);
XTest = X_normalized(testIdx, :);

YTrain_categorical = categorical(y(trainIdx));
YVal_categorical = categorical(y(valIdx));
YTest_categorical = categorical(y(testIdx));

% Build network
fprintf('   Building network (192→96→48)...\n');
numFeatures = size(X_enhanced, 2);
layers = [
    featureInputLayer(numFeatures, 'Name', 'input', 'Normalization', 'none')
    fullyConnectedLayer(192, 'Name', 'fc1')
    batchNormalizationLayer('Name', 'bn1')
    reluLayer('Name', 'relu1')
    dropoutLayer(0.3, 'Name', 'dropout1')
    fullyConnectedLayer(96, 'Name', 'fc2')
    batchNormalizationLayer('Name', 'bn2')
    reluLayer('Name', 'relu2')
    dropoutLayer(0.2, 'Name', 'dropout2')
    fullyConnectedLayer(48, 'Name', 'fc3')
    reluLayer('Name', 'relu3')
    fullyConnectedLayer(numClasses, 'Name', 'fc_output')
    softmaxLayer('Name', 'softmax')
    classificationLayer('Name', 'output', 'Classes', uniqueCompanies, ...
        'ClassWeights', classWeights)
];

options = trainingOptions('adam', ...
    'MaxEpochs', 250, ...
    'InitialLearnRate', 0.001, ...
    'LearnRateSchedule', 'piecewise', ...
    'LearnRateDropFactor', 0.5, ...
    'LearnRateDropPeriod', 50, ...
    'MiniBatchSize', 64, ...
    'ValidationData', {XVal, YVal_categorical}, ...
    'ValidationFrequency', 10, ...
    'ValidationPatience', 25, ...
    'ExecutionEnvironment', executionEnvironment, ...
    'Plots', 'none', ...
    'Verbose', false, ...
    'Shuffle', 'every-epoch');

fprintf('   Training...\n');
tic;
net_enhanced = trainNetwork(XTrain, YTrain_categorical, layers, options);
trainingTime = toc;

% Evaluate
YPred = classify(net_enhanced, XTest);
accuracy_enhanced = sum(YPred == YTest_categorical) / length(YTest_categorical) * 100;

fprintf('\n   ✓ Training completed in %.1f seconds\n', trainingTime);
fprintf('   Performance:\n');
fprintf('      Accuracy: %.2f%%\n', accuracy_enhanced);

% Compare
fprintf('\n   Comparison:\n');
fprintf('      Original: 55.65%% accuracy\n');
fprintf('      Enhanced: %.2f%% accuracy\n', accuracy_enhanced);
if accuracy_enhanced > 55.65
    fprintf('      ✓ Improved by %.2f%%\n', accuracy_enhanced - 55.65);
end

% Save
save('trained_models/brand_classifier_enhanced.mat', 'net_enhanced', 'normalizationParams', ...
     'uniqueCompanies', 'classWeights', 'accuracy_enhanced', 'trainingTime');
fprintf('   ✓ Model saved\n\n');

%% Summary
fprintf('========================================\n');
fprintf('TRAINING SUMMARY\n');
fprintf('========================================\n\n');

fprintf('All enhanced models trained successfully!\n\n');
fprintf('Models saved:\n');
fprintf('  1. trained_models/ram_predictor_enhanced.mat\n');
fprintf('  2. trained_models/battery_predictor_enhanced.mat\n');
fprintf('  3. trained_models/brand_classifier_enhanced.mat\n\n');

fprintf('Next steps:\n');
fprintf('  1. Create prediction functions for enhanced models\n');
fprintf('  2. Test enhanced models\n');
fprintf('  3. Compare with original models\n\n');
