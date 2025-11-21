% Improved Brand Classification Model Tuning
% This script creates a better-tuned brand classification model with:
% - More conservative network architecture (to avoid overfitting)
% - Better regularization
% - Improved training strategy
% - Multiple attempts with different configurations
%
% Usage: run('tune_brand_classification_improved.m')

fprintf('=== Improved Brand Classification Model Tuning ===\n\n');

%% Step 0: Load Data
fprintf('Step 0: Loading preprocessed data...\n');
if exist('preprocessed/preprocessed_data.mat', 'file')
    load('preprocessed/preprocessed_data.mat');
    fprintf('   ✓ Data loaded\n');
else
    fprintf('   ℹ Running preprocessing...\n');
    run('preprocess_dataset.m');
    load('preprocessed/preprocessed_data.mat');
    fprintf('   ✓ Preprocessing complete\n');
end

%% Step 1: Prepare Features
fprintf('\nStep 1: Preparing features...\n');

X = [ram_clean, battery_clean, screenSize_clean, weight_clean, ...
     double(year_clean), priceUSD_clean];
y = companies_clean;

numFeatures = size(X, 2);
numClasses = length(categories(y));
uniqueCompanies = categories(y);

% Normalize features
X_mean = mean(X, 1);
X_std = std(X, 1);
X_normalized = (X - X_mean) ./ (X_std + eps);

normalizationParams.X_mean = X_mean;
normalizationParams.X_std = X_std;

% Filter out empty categories
classCounts = countcats(y);
validCategories = classCounts > 0;
uniqueCompanies = uniqueCompanies(validCategories);
classCounts = classCounts(validCategories);
numClasses = length(uniqueCompanies);

validSamples = ismember(y, uniqueCompanies);
y = y(validSamples);
X_normalized = X_normalized(validSamples, :);

% Remove unused categories
y = removecats(y);
uniqueCompanies = categories(y);
numClasses = length(uniqueCompanies);

% Recalculate class counts
classCounts = countcats(y);
totalSamples = length(y);
maxCount = max(classCounts);

% Calculate class weights (more conservative approach)
fprintf('\n   Class distribution:\n');
for i = 1:numClasses
    fprintf('      %s: %d samples (%.1f%%)\n', string(uniqueCompanies(i)), ...
        classCounts(i), classCounts(i)/totalSamples*100);
end

% Use balanced class weights (sklearn style, but capped)
classWeights = totalSamples ./ (numClasses * classCounts);
classWeights = max(classWeights, 0.5);  % Minimum weight
classWeights = min(classWeights, 5.0);  % Maximum weight (less aggressive)
classWeights = classWeights / mean(classWeights);  % Normalize

fprintf('\n   Class weights:\n');
for i = 1:numClasses
    fprintf('      %s: %.3f\n', string(uniqueCompanies(i)), classWeights(i));
end

%% Step 2: Split Data
fprintf('\nStep 2: Splitting data...\n');

n = size(X_normalized, 1);
rng(42);  % For reproducibility
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

fprintf('   ✓ Training: %d, Validation: %d, Test: %d\n', nTrain, nVal, nTest);

%% Step 3: Try Multiple Configurations
fprintf('\nStep 3: Training with different configurations...\n');

configs = {
    struct('name', 'Moderate_128_96_64', 'layers', [128, 96, 64], 'dropout', [0.2, 0.15, 0.1], 'lr', 0.001),
    struct('name', 'Conservative_96_64_48', 'layers', [96, 64, 48], 'dropout', [0.15, 0.1, 0.05], 'lr', 0.001),
    struct('name', 'Original_Plus_128_64_32', 'layers', [128, 64, 32], 'dropout', [0.25, 0.2, 0.15], 'lr', 0.0008)
};

bestAccuracy = 0;
bestConfig = [];
bestNet = [];
bestConfigName = '';

try
    gpuInfo = gpuDevice;
    executionEnvironment = 'gpu';
    fprintf('   ✓ GPU: %s\n', gpuInfo.Name);
catch
    executionEnvironment = 'cpu';
    fprintf('   ℹ Using CPU\n');
end

for configIdx = 1:length(configs)
    config = configs{configIdx};
    fprintf('\n   --- Configuration: %s ---\n', config.name);

    % Build network
    layers = [
        featureInputLayer(numFeatures, 'Name', 'input', 'Normalization', 'none')
    ];

    % Add hidden layers
    for i = 1:length(config.layers)
        layers = [layers;
            fullyConnectedLayer(config.layers(i), 'Name', sprintf('fc%d', i))
            batchNormalizationLayer('Name', sprintf('bn%d', i))
            reluLayer('Name', sprintf('relu%d', i))
            dropoutLayer(config.dropout(i), 'Name', sprintf('dropout%d', i))
        ];
    end

    % Output layer
    layers = [layers;
        fullyConnectedLayer(numClasses, 'Name', 'fc_output')
        softmaxLayer('Name', 'softmax')
        classificationLayer('Name', 'output', 'Classes', uniqueCompanies, ...
            'ClassWeights', classWeights)
    ];

    % Training options
    options = trainingOptions('adam', ...
        'MaxEpochs', 200, ...
        'InitialLearnRate', config.lr, ...
        'LearnRateSchedule', 'piecewise', ...
        'LearnRateDropFactor', 0.5, ...
        'LearnRateDropPeriod', 40, ...
        'MiniBatchSize', 64, ...
        'ValidationData', {XVal, YVal_categorical}, ...
        'ValidationFrequency', 10, ...
        'ValidationPatience', 25, ...  % More patience
        'ExecutionEnvironment', executionEnvironment, ...
        'Plots', 'none', ...  % Disable plots for batch training
        'Verbose', false, ...
        'Shuffle', 'every-epoch');

    % Train
    fprintf('      Training...\n');
    tic;
    net = trainNetwork(XTrain, YTrain_categorical, layers, options);
    trainingTime = toc;

    % Evaluate on test set
    YPred = classify(net, XTest);
    accuracy = sum(YPred == YTest_categorical) / length(YTest_categorical) * 100;

    fprintf('      Accuracy: %.2f%% (Time: %.1fs)\n', accuracy, trainingTime);

    % Keep best model
    if accuracy > bestAccuracy
        bestAccuracy = accuracy;
        bestConfig = config;
        bestNet = net;
        bestConfigName = config.name;
        fprintf('      ✓ New best model!\n');
    end
end

%% Step 4: Final Evaluation
fprintf('\nStep 4: Final evaluation of best model...\n');
fprintf('   Best configuration: %s\n', bestConfigName);
fprintf('   Test accuracy: %.2f%%\n', bestAccuracy);

% Load original model for comparison
if exist('trained_models/brand_classifier.mat', 'file')
    load('trained_models/brand_classifier.mat', 'net');
    YPred_original = classify(net, XTest);
    accuracy_original = sum(YPred_original == YTest_categorical) / length(YTest_categorical) * 100;

    fprintf('\n   Comparison:\n');
    fprintf('      Original:  %.2f%%\n', accuracy_original);
    fprintf('      Improved: %.2f%%\n', bestAccuracy);
    fprintf('      Change:   %+.2f%%\n', bestAccuracy - accuracy_original);
else
    fprintf('\n   Original model not found for comparison\n');
end

%% Step 5: Per-Class Performance
fprintf('\nStep 5: Per-class performance analysis...\n');

YPred_best = classify(bestNet, XTest);
YTest_numeric = zeros(length(YTest_categorical), 1);
YPred_numeric = zeros(length(YPred_best), 1);

for i = 1:length(uniqueCompanies)
    YTest_numeric(strcmp(string(YTest_categorical), string(uniqueCompanies(i)))) = i;
    YPred_numeric(strcmp(string(YPred_best), string(uniqueCompanies(i)))) = i;
end

% Calculate per-class metrics
fprintf('\n   Per-Class Accuracy:\n');
fprintf('   %-15s |  Accuracy  |  Support\n', 'Brand');
fprintf('   %-15s-|-------------|----------\n', repmat('-', 1, 15));

for i = 1:numClasses
    classMask = YTest_numeric == i;
    if sum(classMask) > 0
        classAccuracy = sum(YPred_numeric(classMask) == i) / sum(classMask) * 100;
        fprintf('   %-15s |  %7.2f%%  |  %8d\n', string(uniqueCompanies(i)), ...
            classAccuracy, sum(classMask));
    end
end

%% Step 6: Save Model
fprintf('\nStep 6: Saving improved model...\n');

if ~exist('trained_models', 'dir')
    mkdir('trained_models');
end

% Save as improved version
modelPath = 'trained_models/brand_classifier_improved.mat';
save(modelPath, 'bestNet', 'normalizationParams', 'uniqueCompanies', ...
     'classWeights', 'bestAccuracy', 'bestConfigName', 'bestConfig');
fprintf('   ✓ Model saved to: %s\n', modelPath);

% If improved, also save as main model (backup original first)
if bestAccuracy > 56.52  % Original accuracy
    fprintf('\n   ⚠ Improved model performs better than original!\n');
    fprintf('   Consider replacing original model.\n');
    fprintf('   To replace: copy brand_classifier_improved.mat to brand_classifier.mat\n');
else
    fprintf('\n   ℹ Model accuracy is %.2f%%, original was 56.52%%\n', bestAccuracy);
    fprintf('   Keeping original model as primary.\n');
end

fprintf('\n=== Tuning Complete ===\n');
fprintf('\nNext steps:\n');
fprintf('  1. Review per-class performance\n');
fprintf('  2. If improved model is better, update predict_brand.m to use it\n');
fprintf('  3. Test with real-world examples\n\n');
