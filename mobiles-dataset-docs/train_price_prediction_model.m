% Complete Training Pipeline for Price Prediction
% This script loads the dataset, preprocesses data, builds a neural network,
% trains it, and evaluates performance for predicting mobile phone prices.

fprintf('=== Mobile Phone Price Prediction Model Training ===\n\n');

%% Step 0: Preprocess Data (if not already done)
fprintf('Step 0: Checking for preprocessed data...\n');
if exist('preprocessed/preprocessed_data.mat', 'file')
    fprintf('   ✓ Preprocessed data found, loading...\n');
    load('preprocessed/preprocessed_data.mat');
    fprintf('   ✓ Preprocessed data loaded\n');
else
    fprintf('   ℹ Preprocessed data not found, running preprocessing...\n');
    run('preprocess_dataset.m');
    % Load the preprocessed data
    load('preprocessed/preprocessed_data.mat');
    fprintf('   ✓ Preprocessing complete\n');
end

%% Step 1: Use Preprocessed Data
fprintf('Step 1: Using preprocessed data...\n');
fprintf('   ✓ Data already preprocessed and cleaned\n');

%% Step 2: Prepare Features and Target
fprintf('\nStep 2: Preparing features and target...\n');

% Encode company names as numerical (one-hot or numeric encoding)
uniqueCompanies = categories(companies_clean);
companyEncoded = zeros(length(companies_clean), length(uniqueCompanies));
for i = 1:length(companies_clean)
    idx = find(strcmp(uniqueCompanies, string(companies_clean(i))));
    if ~isempty(idx)
        companyEncoded(i, idx) = 1;
    end
end

% Combine all features
% Features: RAM, Battery, Screen Size, Weight, Year, Company (encoded)
X = [ram_clean, battery_clean, screenSize_clean, weight_clean, ...
     double(year_clean), companyEncoded];
y = priceUSD_clean;

numFeatures = size(X, 2);
fprintf('   ✓ Feature matrix: %d samples × %d features\n', size(X, 1), numFeatures);
fprintf('   ✓ Target vector: %d samples\n', length(y));
fprintf('   ✓ Price range: $%.0f - $%.0f\n', min(y), max(y));

%% Step 3: Normalize Features
fprintf('\nStep 3: Normalizing features...\n');

% Normalize features (z-score normalization)
X_mean = mean(X, 1);
X_std = std(X, 1);
X_normalized = (X - X_mean) ./ (X_std + eps);

% Normalize target (optional, but can help training)
y_mean = mean(y);
y_std = std(y);
y_normalized = (y - y_mean) / y_std;

fprintf('   ✓ Features normalized (z-score)\n');
fprintf('   ✓ Target normalized (for training)\n');

% Save normalization parameters for prediction
normalizationParams.X_mean = X_mean;
normalizationParams.X_std = X_std;
normalizationParams.y_mean = y_mean;
normalizationParams.y_std = y_std;

%% Step 4: Split Data
fprintf('\nStep 4: Splitting data...\n');

% Split: 70% train, 15% validation, 15% test
n = size(X_normalized, 1);
trainRatio = 0.7;
valRatio = 0.15;
testRatio = 0.15;

nTrain = round(n * trainRatio);
nVal = round(n * valRatio);
nTest = n - nTrain - nVal;

% Random permutation
rng(42);  % For reproducibility
idx = randperm(n);

trainIdx = idx(1:nTrain);
valIdx = idx(nTrain+1:nTrain+nVal);
testIdx = idx(nTrain+nVal+1:end);

% For featureInputLayer with trainNetwork:
% X: numSamples x numFeatures (samples in rows, features in columns)
% Y: numSamples x numResponses (for regression: numSamples x 1)
XTrain = X_normalized(trainIdx, :);  % nTrain x numFeatures
YTrain = y_normalized(trainIdx);      % nTrain x 1
XVal = X_normalized(valIdx, :);      % nVal x numFeatures
YVal = y_normalized(valIdx);          % nVal x 1
XTest = X_normalized(testIdx, :);     % nTest x numFeatures
YTest = y_normalized(testIdx);        % nTest x 1

% Verify dimensions
fprintf('   Data dimensions:\n');
fprintf('      XTrain: %d samples x %d features\n', size(XTrain, 1), size(XTrain, 2));
fprintf('      YTrain: %d samples x %d responses\n', size(YTrain, 1), size(YTrain, 2));

% Also keep original test targets for evaluation
YTest_original = y(testIdx)';

fprintf('   ✓ Training set: %d samples\n', nTrain);
fprintf('   ✓ Validation set: %d samples\n', nVal);
fprintf('   ✓ Test set: %d samples\n', nTest);

%% Step 5: Build Neural Network
fprintf('\nStep 5: Building neural network...\n');

numHiddenUnits1 = 128;
numHiddenUnits2 = 64;
numHiddenUnits3 = 32;

layers = [
    featureInputLayer(numFeatures, 'Name', 'input', 'Normalization', 'none')

    fullyConnectedLayer(numHiddenUnits1, 'Name', 'fc1')
    batchNormalizationLayer('Name', 'bn1')
    reluLayer('Name', 'relu1')
    dropoutLayer(0.3, 'Name', 'dropout1')

    fullyConnectedLayer(numHiddenUnits2, 'Name', 'fc2')
    batchNormalizationLayer('Name', 'bn2')
    reluLayer('Name', 'relu2')
    dropoutLayer(0.2, 'Name', 'dropout2')

    fullyConnectedLayer(numHiddenUnits3, 'Name', 'fc3')
    reluLayer('Name', 'relu3')

    fullyConnectedLayer(1, 'Name', 'fc_output')
    regressionLayer('Name', 'output')
];

fprintf('   ✓ Network architecture created:\n');
fprintf('      Input: %d features\n', numFeatures);
fprintf('      Hidden layers: %d → %d → %d neurons\n', ...
    numHiddenUnits1, numHiddenUnits2, numHiddenUnits3);
fprintf('      Output: 1 (price)\n');

%% Step 6: Training Options
fprintf('\nStep 6: Setting up training options...\n');

% Check for GPU
try
    gpuInfo = gpuDevice;
    executionEnvironment = 'gpu';
    fprintf('   ✓ GPU detected: %s\n', gpuInfo.Name);
catch
    executionEnvironment = 'cpu';
    fprintf('   ℹ Using CPU (GPU not available)\n');
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

fprintf('   ✓ Training options configured\n');
fprintf('      Optimizer: Adam\n');
fprintf('      Max epochs: 100\n');
fprintf('      Learning rate: 0.001\n');
fprintf('      Batch size: 64\n');

%% Step 7: Train Model
fprintf('\nStep 7: Training model...\n');
fprintf('   This may take several minutes. Training progress will be displayed.\n\n');

tic;
net = trainNetwork(XTrain, YTrain, layers, options);
trainingTime = toc;

fprintf('\n   ✓ Training completed in %.2f seconds\n', trainingTime);

%% Step 8: Evaluate Model
fprintf('\nStep 8: Evaluating model...\n');

% Predict on test set
YPred_normalized = predict(net, XTest);
YPred = YPred_normalized * y_std + y_mean;  % Denormalize

% Ensure column vectors
YPred = YPred(:);
YTest_original = YTest_original(:);

% Calculate metrics
mse = mean((YPred - YTest_original).^2, 'all');
mae = mean(abs(YPred - YTest_original), 'all');
rmse = sqrt(mse);

% R-squared
ss_res = sum((YTest_original - YPred).^2);
ss_tot = sum((YTest_original - mean(YTest_original)).^2);
r2 = 1 - (ss_res / ss_tot);

% Mean Absolute Percentage Error
mape = mean(abs((YTest_original - YPred) ./ YTest_original), 'all') * 100;

fprintf('   Test Set Performance:\n');
fprintf('      Mean Squared Error (MSE): %.2f\n', mse);
fprintf('      Root Mean Squared Error (RMSE): $%.2f\n', rmse);
fprintf('      Mean Absolute Error (MAE): $%.2f\n', mae);
fprintf('      Mean Absolute Percentage Error (MAPE): %.2f%%\n', mape);
fprintf('      R-squared (R²): %.4f\n', r2);

%% Step 9: Save Model and Results
fprintf('\nStep 9: Saving model and results...\n');

% Create directory for saved models
if ~exist('trained_models', 'dir')
    mkdir('trained_models');
end

% Save model
modelPath = 'trained_models/price_predictor.mat';
save(modelPath, 'net', 'normalizationParams', 'uniqueCompanies', ...
     'mse', 'mae', 'rmse', 'r2', 'mape', 'trainingTime');
fprintf('   ✓ Model saved to: %s\n', modelPath);

% Save evaluation results
resultsPath = 'trained_models/price_prediction_results.mat';
save(resultsPath, 'YPred', 'YTest_original', 'testIdx', ...
     'mse', 'mae', 'rmse', 'r2', 'mape');
fprintf('   ✓ Results saved to: %s\n', resultsPath);

%% Step 10: Display Sample Predictions
fprintf('\nStep 10: Sample predictions:\n');
fprintf('   ----------------------------------------\n');
fprintf('   Actual Price  |  Predicted Price  |  Error\n');
fprintf('   ----------------------------------------\n');

nSamples = min(10, length(YPred));
for i = 1:nSamples
    actual = YTest_original(i);
    predicted = YPred(i);
    error = abs(actual - predicted);
    fprintf('   $%8.0f     |  $%8.0f      |  $%.0f\n', actual, predicted, error);
end

fprintf('\n=== Training Complete ===\n');
fprintf('\nNext steps:\n');
fprintf('  1. Review training progress plot\n');
fprintf('  2. Check model performance metrics\n');
fprintf('  3. Use predict_price.m to make new predictions\n');
fprintf('  4. Fine-tune hyperparameters if needed\n\n');
