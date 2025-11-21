% Deep Price Prediction Model Training
% This script trains a deeper neural network (more layers) for price prediction
% Architecture: 5 hidden layers with deeper structure
%
% Usage: run('train_price_prediction_deep.m')

fprintf('=== Deep Price Prediction Model Training ===\n\n');

%% Step 0: Preprocess Data (if not already done)
fprintf('Step 0: Checking for preprocessed data...\n');
if exist('preprocessed/preprocessed_data.mat', 'file')
    fprintf('   ✓ Preprocessed data found, loading...\n');
    load('preprocessed/preprocessed_data.mat');
    fprintf('   ✓ Preprocessed data loaded\n');
else
    fprintf('   ℹ Preprocessed data not found, running preprocessing...\n');
    run('preprocess_dataset.m');
    load('preprocessed/preprocessed_data.mat');
    fprintf('   ✓ Preprocessing complete\n');
end

%% Step 1: Prepare Features and Target
fprintf('\nStep 1: Preparing features and target...\n');

% Encode company names
uniqueCompanies = categories(companies_clean);
companyEncoded = zeros(length(companies_clean), length(uniqueCompanies));
for i = 1:length(companies_clean)
    idx = find(strcmp(uniqueCompanies, string(companies_clean(i))));
    if ~isempty(idx)
        companyEncoded(i, idx) = 1;
    end
end

% Combine all features
X = [ram_clean, battery_clean, screenSize_clean, weight_clean, ...
     double(year_clean), companyEncoded];
y = priceUSD_clean;

numFeatures = size(X, 2);
fprintf('   ✓ Feature matrix: %d samples × %d features\n', size(X, 1), numFeatures);
fprintf('   ✓ Price range: $%.0f - $%.0f\n', min(y), max(y));

%% Step 2: Normalize Features
fprintf('\nStep 2: Normalizing features...\n');

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

fprintf('   ✓ Features normalized\n');

%% Step 3: Split Data
fprintf('\nStep 3: Splitting data...\n');

n = size(X_normalized, 1);
trainRatio = 0.7;
valRatio = 0.15;
testRatio = 0.15;

nTrain = round(n * trainRatio);
nVal = round(n * valRatio);
nTest = n - nTrain - nVal;

rng(42);
idx = randperm(n);

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

%% Step 4: Build Deep Neural Network
fprintf('\nStep 4: Building deep neural network...\n');

% Deep architecture: 5 hidden layers
layers = [
    featureInputLayer(numFeatures, 'Name', 'input', 'Normalization', 'none')

    fullyConnectedLayer(256, 'Name', 'fc1')
    batchNormalizationLayer('Name', 'bn1')
    reluLayer('Name', 'relu1')
    dropoutLayer(0.4, 'Name', 'dropout1')

    fullyConnectedLayer(128, 'Name', 'fc2')
    batchNormalizationLayer('Name', 'bn2')
    reluLayer('Name', 'relu2')
    dropoutLayer(0.3, 'Name', 'dropout2')

    fullyConnectedLayer(64, 'Name', 'fc3')
    batchNormalizationLayer('Name', 'bn3')
    reluLayer('Name', 'relu3')
    dropoutLayer(0.2, 'Name', 'dropout3')

    fullyConnectedLayer(32, 'Name', 'fc4')
    batchNormalizationLayer('Name', 'bn4')
    reluLayer('Name', 'relu4')

    fullyConnectedLayer(16, 'Name', 'fc5')
    reluLayer('Name', 'relu5')

    fullyConnectedLayer(1, 'Name', 'fc_output')
    regressionLayer('Name', 'output')
];

fprintf('   ✓ Deep network: 256 → 128 → 64 → 32 → 16 neurons\n');

%% Step 5: Training Options
fprintf('\nStep 5: Setting up training options...\n');

try
    gpuInfo = gpuDevice;
    executionEnvironment = 'gpu';
    fprintf('   ✓ GPU: %s\n', gpuInfo.Name);
catch
    executionEnvironment = 'cpu';
    fprintf('   ℹ Using CPU\n');
end

options = trainingOptions('adam', ...
    'MaxEpochs', 150, ...
    'InitialLearnRate', 0.0005, ...
    'MiniBatchSize', 32, ...
    'ValidationData', {XVal, YVal}, ...
    'ValidationFrequency', 10, ...
    'ValidationPatience', 15, ...
    'ExecutionEnvironment', executionEnvironment, ...
    'Plots', 'training-progress', ...
    'Verbose', true, ...
    'Shuffle', 'every-epoch', ...
    'LearnRateSchedule', 'piecewise', ...
    'LearnRateDropFactor', 0.5, ...
    'LearnRateDropPeriod', 50);

fprintf('   ✓ Training options configured\n');

%% Step 6: Train Model
fprintf('\nStep 6: Training deep model...\n');
fprintf('   This may take longer due to deeper architecture.\n\n');

tic;
net = trainNetwork(XTrain, YTrain, layers, options);
trainingTime = toc;

fprintf('\n   ✓ Training completed in %.2f seconds\n', trainingTime);

%% Step 7: Evaluate Model
fprintf('\nStep 7: Evaluating model...\n');

YPred_normalized = predict(net, XTest);
YPred = YPred_normalized * y_std + y_mean;

% Ensure column vectors
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
fprintf('      RMSE: $%.2f\n', rmse);
fprintf('      MAE:  $%.2f\n', mae);
fprintf('      R²:   %.4f\n', r2);
fprintf('      MAPE: %.2f%%\n', mape);

%% Step 8: Save Model
fprintf('\nStep 8: Saving model...\n');

if ~exist('trained_models', 'dir')
    mkdir('trained_models');
end

modelPath = 'trained_models/price_predictor_deep.mat';
save(modelPath, 'net', 'normalizationParams', 'uniqueCompanies', ...
     'mse', 'mae', 'rmse', 'r2', 'mape', 'trainingTime');
fprintf('   ✓ Model saved to: %s\n', modelPath);

resultsPath = 'trained_models/price_prediction_deep_results.mat';
save(resultsPath, 'YPred', 'YTest_original', 'testIdx', ...
     'mse', 'mae', 'rmse', 'r2', 'mape');
fprintf('   ✓ Results saved to: %s\n', resultsPath);

fprintf('\n=== Deep Model Training Complete ===\n\n');
