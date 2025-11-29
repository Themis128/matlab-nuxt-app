% Battery Capacity Prediction Model Training
% This script trains a model to predict battery capacity from other phone specifications
% Input: RAM, Screen Size, Weight, Year, Price, Company
% Output: Battery Capacity in mAh
%
% Usage: run('train_battery_prediction_model.m')

fprintf('=== Battery Capacity Prediction Model Training ===\n\n');

%% Step 0: Preprocess Data
fprintf('Step 0: Loading data...\n');
if exist('preprocessed/preprocessed_data.mat', 'file')
    load('preprocessed/preprocessed_data.mat');
    fprintf('   ✓ Data loaded\n');
else
    run('preprocess_dataset.m');
    load('preprocessed/preprocessed_data.mat');
end

%% Step 1: Prepare Features and Target
fprintf('\nStep 1: Preparing features and target...\n');

% Features: RAM, Screen Size, Weight, Year, Price, Company
% Target: Battery Capacity
uniqueCompanies = categories(companies_clean);
companyEncoded = zeros(length(companies_clean), length(uniqueCompanies));
for i = 1:length(companies_clean)
    idx = find(strcmp(uniqueCompanies, string(companies_clean(i))));
    if ~isempty(idx)
        companyEncoded(i, idx) = 1;
    end
end

X = [ram_clean, screenSize_clean, weight_clean, ...
     double(year_clean), priceUSD_clean, companyEncoded];
y = battery_clean;  % Target: Battery Capacity

numFeatures = size(X, 2);
fprintf('   ✓ Features: %d samples × %d features\n', size(X, 1), numFeatures);
fprintf('   ✓ Battery range: %.0f - %.0f mAh\n', min(y), max(y));

%% Step 2: Normalize
fprintf('\nStep 2: Normalizing...\n');

X_mean = mean(X, 1);
X_std = std(X, 1);
X_normalized = (X - X_mean) ./ (X_std + eps);

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

fprintf('   ✓ Split: Train=%d, Val=%d, Test=%d\n', nTrain, nVal, nTest);

%% Step 4: Build Network
fprintf('\nStep 4: Building network...\n');

layers = [
    featureInputLayer(numFeatures, 'Name', 'input', 'Normalization', 'none')

    fullyConnectedLayer(128, 'Name', 'fc1')
    batchNormalizationLayer('Name', 'bn1')
    reluLayer('Name', 'relu1')
    dropoutLayer(0.3, 'Name', 'dropout1')

    fullyConnectedLayer(64, 'Name', 'fc2')
    batchNormalizationLayer('Name', 'bn2')
    reluLayer('Name', 'relu2')
    dropoutLayer(0.2, 'Name', 'dropout2')

    fullyConnectedLayer(32, 'Name', 'fc3')
    reluLayer('Name', 'relu3')

    fullyConnectedLayer(1, 'Name', 'fc_output')
    regressionLayer('Name', 'output')
];

fprintf('   ✓ Network: 128 → 64 → 32 neurons\n');

%% Step 5: Training Options
fprintf('\nStep 5: Setting up training...\n');

try
    gpuInfo = gpuDevice;
    executionEnvironment = 'gpu';
    fprintf('   ✓ GPU: %s\n', gpuInfo.Name);
catch
    executionEnvironment = 'cpu';
    fprintf('   ℹ Using CPU\n');
end

options = trainingOptions('adam', ...
    'MaxEpochs', 100, ...
    'InitialLearnRate', 0.001, ...
    'MiniBatchSize', 64, ...
    'ValidationData', {XVal, YVal}, ...
    'ValidationFrequency', 10, ...
    'ValidationPatience', 10, ...
    'ExecutionEnvironment', executionEnvironment, ...
    'Plots', 'training-progress', ...
    'Verbose', true, ...
    'Shuffle', 'every-epoch');

%% Step 6: Train
fprintf('\nStep 6: Training battery prediction model...\n\n');

tic;
net = trainNetwork(XTrain, YTrain, layers, options);
trainingTime = toc;

fprintf('\n   ✓ Training completed in %.2f seconds\n', trainingTime);

%% Step 7: Evaluate
fprintf('\nStep 7: Evaluating...\n');

YPred_normalized = predict(net, XTest);
YPred = YPred_normalized * y_std + y_mean;
YPred = YPred(:);
YTest_original = YTest_original(:);

mse = mean((YPred - YTest_original).^2, 'all');
mae = mean(abs(YPred - YTest_original), 'all');
rmse = sqrt(mse);
ss_res = sum((YTest_original - YPred).^2);
ss_tot = sum((YTest_original - mean(YTest_original)).^2);
r2 = 1 - (ss_res / ss_tot);
mape = mean(abs((YTest_original - YPred) ./ YTest_original), 'all') * 100;

fprintf('   Test Set Performance:\n');
fprintf('      MSE:  %.2f\n', mse);
fprintf('      RMSE: %.2f mAh\n', rmse);
fprintf('      MAE:  %.2f mAh\n', mae);
fprintf('      R²:   %.4f\n', r2);
fprintf('      MAPE: %.2f%%\n', mape);

%% Step 8: Save
fprintf('\nStep 8: Saving model...\n');

if ~exist('trained_models', 'dir')
    mkdir('trained_models');
end

modelPath = 'trained_models/battery_predictor.mat';
save(modelPath, 'net', 'normalizationParams', 'uniqueCompanies', ...
     'mse', 'mae', 'rmse', 'r2', 'mape', 'trainingTime');
fprintf('   ✓ Model saved to: %s\n', modelPath);

resultsPath = 'trained_models/battery_prediction_results.mat';
save(resultsPath, 'YPred', 'YTest_original', 'testIdx', ...
     'mse', 'mae', 'rmse', 'r2', 'mape');
fprintf('   ✓ Results saved to: %s\n', resultsPath);

fprintf('\n=== Battery Prediction Model Training Complete ===\n\n');
