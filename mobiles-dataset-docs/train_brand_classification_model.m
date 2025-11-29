% Complete Training Pipeline for Brand Classification
% This script loads the dataset, preprocesses data, builds a neural network,
% trains it, and evaluates performance for classifying mobile phone brands.
%
% Usage: run('train_brand_classification_model.m')

fprintf('=== Mobile Phone Brand Classification Model Training ===\n\n');

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

%% Step 1: Prepare Features and Target
fprintf('\nStep 1: Preparing features and target...\n');

% For classification, we use: RAM, Battery, Screen Size, Weight, Year, Price
% Target: Company/Brand name (categorical)
X = [ram_clean, battery_clean, screenSize_clean, weight_clean, ...
     double(year_clean), priceUSD_clean];
y = companies_clean;  % Categorical target

numFeatures = size(X, 2);
numClasses = length(categories(y));
uniqueCompanies = categories(y);

fprintf('   ✓ Feature matrix: %d samples × %d features\n', size(X, 1), numFeatures);
fprintf('   ✓ Target classes: %d brands\n', numClasses);
fprintf('   ✓ Brands: %s\n', strjoin(uniqueCompanies, ', '));

% Check class distribution
fprintf('\n   Class distribution:\n');
for i = 1:numClasses
    count = sum(y == uniqueCompanies(i));
    percentage = count / length(y) * 100;
    fprintf('      %s: %d samples (%.1f%%)\n', string(uniqueCompanies(i)), count, percentage);
end

% Check for class imbalance
minSamples = min(countcats(y));
maxSamples = max(countcats(y));
if maxSamples / minSamples > 5
    warning('Significant class imbalance detected. Consider using class weights.');
end

%% Step 2: Normalize Features
fprintf('\nStep 2: Normalizing features...\n');

% Normalize features (z-score normalization)
X_mean = mean(X, 1);
X_std = std(X, 1);
X_normalized = (X - X_mean) ./ (X_std + eps);

fprintf('   ✓ Features normalized (z-score)\n');

% Save normalization parameters for prediction
normalizationParams.X_mean = X_mean;
normalizationParams.X_std = X_std;

%% Step 3: Encode Target Labels
fprintf('\nStep 3: Encoding target labels...\n');

% Convert categorical to numeric labels (1 to numClasses)
y_numeric = zeros(length(y), 1);
for i = 1:length(y)
    y_numeric(i) = find(strcmp(uniqueCompanies, string(y(i))));
end

% Convert to one-hot encoding for classification
y_onehot = zeros(length(y), numClasses);
for i = 1:length(y)
    y_onehot(i, y_numeric(i)) = 1;
end

fprintf('   ✓ Labels encoded (one-hot)\n');

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

% Stratified split to maintain class distribution
rng(42);  % For reproducibility
idx = randperm(n);

trainIdx = idx(1:nTrain);
valIdx = idx(nTrain+1:nTrain+nVal);
testIdx = idx(nTrain+nVal+1:end);

XTrain = X_normalized(trainIdx, :);
YTrain = y_onehot(trainIdx, :);
XVal = X_normalized(valIdx, :);
YVal = y_onehot(valIdx, :);
XTest = X_normalized(testIdx, :);
YTest = y_onehot(testIdx, :);

% Also keep original test labels for evaluation
YTest_original = y(testIdx);

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

    fullyConnectedLayer(numClasses, 'Name', 'fc_output')
    softmaxLayer('Name', 'softmax')
    classificationLayer('Name', 'output')
];

fprintf('   ✓ Network architecture created:\n');
fprintf('      Input: %d features\n', numFeatures);
fprintf('      Hidden layers: %d → %d → %d neurons\n', ...
    numHiddenUnits1, numHiddenUnits2, numHiddenUnits3);
fprintf('      Output: %d classes (brands)\n', numClasses);

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

% Prepare validation labels
YVal_categorical = categorical(y(valIdx));

options = trainingOptions('adam', ...
    'MaxEpochs', 100, ...
    'InitialLearnRate', 0.001, ...
    'MiniBatchSize', 64, ...
    'ValidationData', {XVal, YVal_categorical}, ...
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

% Convert training data to appropriate format
YTrain_categorical = categorical(y(trainIdx));

tic;
net = trainNetwork(XTrain, YTrain_categorical, layers, options);
trainingTime = toc;

fprintf('\n   ✓ Training completed in %.2f seconds\n', trainingTime);

%% Step 8: Evaluate Model
fprintf('\nStep 8: Evaluating model...\n');

% Predict on test set
YTest_categorical = categorical(YTest_original);
YPred_categorical = classify(net, XTest);
YPred_numeric = zeros(length(YPred_categorical), 1);
for i = 1:length(YPred_categorical)
    YPred_numeric(i) = find(strcmp(uniqueCompanies, string(YPred_categorical(i))));
end

YTest_numeric = zeros(length(YTest_categorical), 1);
for i = 1:length(YTest_categorical)
    YTest_numeric(i) = find(strcmp(uniqueCompanies, string(YTest_categorical(i))));
end

% Calculate overall accuracy
accuracy = sum(YPred_numeric == YTest_numeric) / length(YTest_numeric) * 100;

% Calculate per-class metrics
precision = zeros(numClasses, 1);
recall = zeros(numClasses, 1);
f1_score = zeros(numClasses, 1);
support = zeros(numClasses, 1);

for i = 1:numClasses
    true_positives = sum((YPred_numeric == i) & (YTest_numeric == i));
    false_positives = sum((YPred_numeric == i) & (YTest_numeric ~= i));
    false_negatives = sum((YPred_numeric ~= i) & (YTest_numeric == i));

    support(i) = sum(YTest_numeric == i);

    if (true_positives + false_positives) > 0
        precision(i) = true_positives / (true_positives + false_positives);
    end

    if (true_positives + false_negatives) > 0
        recall(i) = true_positives / (true_positives + false_negatives);
    end

    if (precision(i) + recall(i)) > 0
        f1_score(i) = 2 * (precision(i) * recall(i)) / (precision(i) + recall(i));
    end
end

% Macro-averaged metrics
macro_precision = mean(precision);
macro_recall = mean(recall);
macro_f1 = mean(f1_score);

% Weighted-averaged metrics (weighted by support)
weighted_precision = sum(precision .* support) / sum(support);
weighted_recall = sum(recall .* support) / sum(support);
weighted_f1 = sum(f1_score .* support) / sum(support);

fprintf('\n   Test Set Performance:\n');
fprintf('      Overall Accuracy: %.2f%%\n', accuracy);
fprintf('      Macro-averaged Precision: %.4f\n', macro_precision);
fprintf('      Macro-averaged Recall: %.4f\n', macro_recall);
fprintf('      Macro-averaged F1-Score: %.4f\n', macro_f1);
fprintf('      Weighted-averaged Precision: %.4f\n', weighted_precision);
fprintf('      Weighted-averaged Recall: %.4f\n', weighted_recall);
fprintf('      Weighted-averaged F1-Score: %.4f\n', weighted_f1);

fprintf('\n   Per-Class Performance:\n');
fprintf('   Brand              |  Precision  |  Recall     |  F1-Score   |  Support\n');
fprintf('   -------------------|-------------|-------------|-------------|----------\n');
for i = 1:numClasses
    fprintf('   %-17s |  %9.4f  |  %9.4f  |  %9.4f  |  %8d\n', ...
        string(uniqueCompanies(i)), precision(i), recall(i), f1_score(i), support(i));
end

%% Step 9: Confusion Matrix
fprintf('\nStep 9: Generating confusion matrix...\n');

% Create confusion matrix
confusion_mat = zeros(numClasses, numClasses);
for i = 1:length(YTest_numeric)
    confusion_mat(YTest_numeric(i), YPred_numeric(i)) = ...
        confusion_mat(YTest_numeric(i), YPred_numeric(i)) + 1;
end

fprintf('   ✓ Confusion matrix created\n');

%% Step 10: Save Model and Results
fprintf('\nStep 10: Saving model and results...\n');

% Create directory for saved models
if ~exist('trained_models', 'dir')
    mkdir('trained_models');
end

% Save model
modelPath = 'trained_models/brand_classifier.mat';
save(modelPath, 'net', 'normalizationParams', 'uniqueCompanies', ...
     'accuracy', 'macro_precision', 'macro_recall', 'macro_f1', ...
     'weighted_precision', 'weighted_recall', 'weighted_f1', ...
     'precision', 'recall', 'f1_score', 'support', ...
     'confusion_mat', 'trainingTime');
fprintf('   ✓ Model saved to: %s\n', modelPath);

% Save evaluation results
resultsPath = 'trained_models/brand_classification_results.mat';
save(resultsPath, 'YPred_categorical', 'YTest_original', 'testIdx', ...
     'accuracy', 'precision', 'recall', 'f1_score', 'support', ...
     'macro_precision', 'macro_recall', 'macro_f1', ...
     'weighted_precision', 'weighted_recall', 'weighted_f1', ...
     'confusion_mat');
fprintf('   ✓ Results saved to: %s\n', resultsPath);

%% Step 11: Display Sample Predictions
fprintf('\nStep 11: Sample predictions:\n');
fprintf('   ----------------------------------------\n');
fprintf('   Actual Brand    |  Predicted Brand    |  Correct\n');
fprintf('   ----------------------------------------\n');

nSamples = min(15, length(YPred_categorical));
for i = 1:nSamples
    actual = string(YTest_categorical(i));
    predicted = string(YPred_categorical(i));
    correct = actual == predicted;
    if correct
        correctStr = '✓';
    else
        correctStr = '✗';
    end
    fprintf('   %-15s |  %-18s |  %s\n', actual, predicted, correctStr);
end

%% Summary
fprintf('\n=== Training Complete ===\n');
fprintf('\nModel Performance Summary:\n');
fprintf('  Overall Accuracy: %.2f%%\n', accuracy);
fprintf('  Weighted F1-Score: %.4f\n', weighted_f1);
fprintf('\nNext steps:\n');
fprintf('  1. Review confusion matrix for class-specific performance\n');
fprintf('  2. Analyze misclassifications\n');
fprintf('  3. Fine-tune hyperparameters if needed\n');
fprintf('  4. Use the model for brand prediction\n\n');
