% Lightweight Price Prediction Model Training
% This script trains a smaller, faster model with fewer parameters
% Architecture: Compact network for faster inference
%
% Usage: run('train_price_prediction_lightweight.m')

fprintf('=== Lightweight Price Prediction Model Training ===\n\n');

%% Step 0: Preprocess Data
fprintf('Step 0: Loading data...\n');
if exist('preprocessed/preprocessed_data.mat', 'file')
    load('preprocessed/preprocessed_data.mat');
    fprintf('   ✓ Data loaded\n');
else
    run('preprocess_dataset.m');
    load('preprocessed/preprocessed_data.mat');
end

%% Step 1: Prepare Features
fprintf('\nStep 1: Preparing features...\n');

uniqueCompanies = categories(companies_clean);
companyEncoded = zeros(length(companies_clean), length(uniqueCompanies));
for i = 1:length(companies_clean)
    idx = find(strcmp(uniqueCompanies, string(companies_clean(i))));
    if ~isempty(idx)
        companyEncoded(i, idx) = 1;
    end
end

X = [ram_clean, battery_clean, screenSize_clean, weight_clean, ...
     double(year_clean), companyEncoded];
y = priceUSD_clean;

numFeatures = size(X, 2);

%% Step 2: Normalize
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
fprintf('\nStep 2: Splitting data...\n');

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

%% Step 4: Build Lightweight Network
fprintf('\nStep 3: Building lightweight network...\n');

% Compact architecture: Small but efficient
layers = [
    featureInputLayer(numFeatures, 'Name', 'input', 'Normalization', 'none')

    fullyConnectedLayer(64, 'Name', 'fc1')
    batchNormalizationLayer('Name', 'bn1')
    reluLayer('Name', 'relu1')
    dropoutLayer(0.2, 'Name', 'dropout1')

    fullyConnectedLayer(32, 'Name', 'fc2')
    reluLayer('Name', 'relu2')

    fullyConnectedLayer(1, 'Name', 'fc_output')
    regressionLayer('Name', 'output')
];

fprintf('   ✓ Lightweight network: 64 → 32 neurons\n');

%% Step 5: Training Options
fprintf('\nStep 4: Setting up training...\n');

try
    gpuInfo = gpuDevice;
    executionEnvironment = 'gpu';
catch
    executionEnvironment = 'cpu';
end

options = trainingOptions('adam', ...
    'MaxEpochs', 80, ...
    'InitialLearnRate', 0.002, ...
    'MiniBatchSize', 128, ...
    'ValidationData', {XVal, YVal}, ...
    'ValidationFrequency', 10, ...
    'ValidationPatience', 10, ...
    'ExecutionEnvironment', executionEnvironment, ...
    'Plots', 'training-progress', ...
    'Verbose', true, ...
    'Shuffle', 'every-epoch');

%% Step 6: Train
fprintf('\nStep 5: Training lightweight model...\n\n');

tic;
net = trainNetwork(XTrain, YTrain, layers, options);
trainingTime = toc;

fprintf('\n   ✓ Training completed in %.2f seconds\n', trainingTime);

%% Step 7: Evaluate
fprintf('\nStep 6: Evaluating...\n');

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

fprintf('   Performance:\n');
fprintf('      MSE:  %.2f\n', mse);
fprintf('      RMSE: $%.2f\n', rmse);
fprintf('      MAE:  $%.2f\n', mae);
fprintf('      R²:   %.4f\n', r2);
fprintf('      MAPE: %.2f%%\n', mape);

%% Step 8: Save
fprintf('\nStep 7: Saving...\n');

if ~exist('trained_models', 'dir')
    mkdir('trained_models');
end

modelPath = 'trained_models/price_predictor_lightweight.mat';
save(modelPath, 'net', 'normalizationParams', 'uniqueCompanies', ...
     'mse', 'mae', 'rmse', 'r2', 'mape', 'trainingTime');
fprintf('   ✓ Saved: %s\n', modelPath);

resultsPath = 'trained_models/price_prediction_lightweight_results.mat';
save(resultsPath, 'YPred', 'YTest_original', 'testIdx', ...
     'mse', 'mae', 'rmse', 'r2', 'mape');
fprintf('   ✓ Saved: %s\n', resultsPath);

fprintf('\n=== Lightweight Model Training Complete ===\n\n');
