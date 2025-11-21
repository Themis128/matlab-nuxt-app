% Model Tuning Script
% This script implements improvements for all models based on performance analysis
%
% Usage: run('tune_models.m')
%
% This will create improved versions of the models with:
% - Better hyperparameters
% - Class weights for classification
% - Feature engineering
% - Extended training

fprintf('=== Model Tuning Script ===\n\n');

%% Configuration
TUNE_BRAND = true;      % Highest priority
TUNE_RAM = true;        % High priority
TUNE_PRICE = false;     % Medium priority (already decent)
TUNE_BATTERY = false;   % Low priority (already good)

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

%% ========================================================================
%% 1. TUNE BRAND CLASSIFICATION MODEL (Highest Priority)
%% ========================================================================
if TUNE_BRAND
    fprintf('\n=== Tuning Brand Classification Model ===\n\n');

    % Prepare features
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

    % Calculate class weights (inverse frequency weighting)
    fprintf('   Calculating class weights...\n');
    classCounts = countcats(y);

    % Filter out empty categories
    validCategories = classCounts > 0;
    uniqueCompanies = uniqueCompanies(validCategories);
    classCounts = classCounts(validCategories);
    numClasses = length(uniqueCompanies);

    % Remove samples with empty categories
    validSamples = ismember(y, uniqueCompanies);
    y = y(validSamples);
    X_normalized = X_normalized(validSamples, :);

    % Remove unused categories from categorical array
    y = removecats(y);
    uniqueCompanies = categories(y);  % Update to only include used categories
    numClasses = length(uniqueCompanies);

    % Recalculate class counts after filtering
    classCounts = countcats(y);
    totalSamples = length(y);
    maxCount = max(classCounts);

    % Calculate class weights using balanced approach
    % Formula: weight = max_count / class_count (gives higher weight to minority classes)
    % This ensures all weights are >= 1.0
    classWeights = maxCount ./ classCounts;

    % Alternative: sklearn-style balanced weights
    % classWeights = totalSamples ./ (numClasses * classCounts);
    % But the max_count approach is more stable

    % Ensure all weights are positive and reasonable (between 0.1 and 10.0)
    classWeights = max(classWeights, 0.1);
    classWeights = min(classWeights, 10.0);

    % Verify no NaN or Inf values
    classWeights(isnan(classWeights) | isinf(classWeights)) = 1.0;

    fprintf('   Class weights (after filtering empty categories):\n');
    for i = 1:numClasses
        fprintf('      %s: %.3f (count: %d)\n', string(uniqueCompanies(i)), ...
            classWeights(i), classCounts(i));
    end

    % Verify weights are valid
    if any(classWeights <= 0) || any(isnan(classWeights)) || any(isinf(classWeights))
        error('Invalid class weights detected. Check class distribution.');
    end

    % Split data (stratified)
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

    % Build improved network (larger capacity)
    fprintf('\n   Building improved network (256→128→64→32)...\n');
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
        reluLayer('Name', 'relu4')

        fullyConnectedLayer(numClasses, 'Name', 'fc_output')
        softmaxLayer('Name', 'softmax')
        classificationLayer('Name', 'output', 'Classes', uniqueCompanies, ...
            'ClassWeights', classWeights)
    ];

    % Training options with learning rate scheduling
    try
        gpuInfo = gpuDevice;
        executionEnvironment = 'gpu';
        fprintf('   ✓ GPU: %s\n', gpuInfo.Name);
    catch
        executionEnvironment = 'cpu';
        fprintf('   ℹ Using CPU\n');
    end

    options = trainingOptions('adam', ...
        'MaxEpochs', 250, ...
        'InitialLearnRate', 0.001, ...
        'LearnRateSchedule', 'piecewise', ...
        'LearnRateDropFactor', 0.5, ...
        'LearnRateDropPeriod', 50, ...
        'MiniBatchSize', 64, ...
        'ValidationData', {XVal, YVal_categorical}, ...
        'ValidationFrequency', 10, ...
        'ValidationPatience', 15, ...
        'ExecutionEnvironment', executionEnvironment, ...
        'Plots', 'training-progress', ...
        'Verbose', true, ...
        'Shuffle', 'every-epoch');

    % Train model
    fprintf('\n   Training improved brand classification model...\n');
    tic;
    net_tuned = trainNetwork(XTrain, YTrain_categorical, layers, options);
    trainingTime = toc;

    fprintf('\n   ✓ Training completed in %.2f seconds\n', trainingTime);

    % Evaluate
    YPred_tuned = classify(net_tuned, XTest);
    accuracy_tuned = sum(YPred_tuned == YTest_categorical) / length(YTest_categorical) * 100;

    fprintf('\n   Performance Comparison:\n');
    fprintf('      Original: 56.52%%\n');
    fprintf('      Tuned:    %.2f%%\n', accuracy_tuned);
    fprintf('      Improvement: +%.2f%%\n', accuracy_tuned - 56.52);

    % Save tuned model
    if ~exist('trained_models', 'dir')
        mkdir('trained_models');
    end

    modelPath = 'trained_models/brand_classifier_tuned.mat';
    save(modelPath, 'net_tuned', 'normalizationParams', 'uniqueCompanies', ...
         'classWeights', 'accuracy_tuned', 'trainingTime');
    fprintf('\n   ✓ Tuned model saved to: %s\n', modelPath);
end

%% ========================================================================
%% 2. TUNE RAM PREDICTION MODEL
%% ========================================================================
if TUNE_RAM
    fprintf('\n=== Tuning RAM Prediction Model ===\n\n');

    % Prepare features with interactions
    fprintf('   Creating enhanced features...\n');

    % Base features
    X_base = [battery_clean, screenSize_clean, weight_clean, ...
              double(year_clean), priceUSD_clean];

    % Encode company
    uniqueCompanies = categories(companies_clean);
    companyEncoded = zeros(length(companies_clean), length(uniqueCompanies));
    for i = 1:length(companies_clean)
        idx = find(strcmp(uniqueCompanies, string(companies_clean(i))));
        if ~isempty(idx)
            companyEncoded(i, idx) = 1;
        end
    end

    % Add interaction features
    price_per_year = priceUSD_clean ./ (double(year_clean) - 2010 + 1);  % Normalize year
    battery_screen_ratio = battery_clean ./ (screenSize_clean + eps);

    % Combine all features
    X = [X_base, companyEncoded, price_per_year, battery_screen_ratio];
    y = ram_clean;

    numFeatures = size(X, 2);
    fprintf('   ✓ Features: %d (including interactions)\n', numFeatures);

    % Normalize
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

    % Build improved network (wider)
    fprintf('\n   Building improved network (256→128→64)...\n');
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

    % Training options
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
        'Plots', 'training-progress', ...
        'Verbose', true, ...
        'Shuffle', 'every-epoch');

    % Train
    fprintf('\n   Training improved RAM prediction model...\n');
    tic;
    net_tuned = trainNetwork(XTrain, YTrain, layers, options);
    trainingTime = toc;

    fprintf('\n   ✓ Training completed in %.2f seconds\n', trainingTime);

    % Evaluate
    YPred_normalized = predict(net_tuned, XTest);
    YPred = YPred_normalized * y_std + y_mean;

    % Calculate metrics
    residuals = YPred - YTest_original;
    r2_tuned = 1 - sum(residuals.^2) / sum((YTest_original - mean(YTest_original)).^2);
    rmse_tuned = sqrt(mean(residuals.^2));

    fprintf('\n   Performance Comparison:\n');
    fprintf('      Original R²:  0.6381\n');
    fprintf('      Tuned R²:     %.4f\n', r2_tuned);
    fprintf('      Improvement:  +%.4f\n', r2_tuned - 0.6381);
    fprintf('      Original RMSE: 1.64 GB\n');
    fprintf('      Tuned RMSE:     %.2f GB\n', rmse_tuned);

    % Save
    if ~exist('trained_models', 'dir')
        mkdir('trained_models');
    end

    modelPath = 'trained_models/ram_predictor_tuned.mat';
    save(modelPath, 'net_tuned', 'normalizationParams', 'uniqueCompanies', ...
         'r2_tuned', 'rmse_tuned', 'trainingTime');
    fprintf('\n   ✓ Tuned model saved to: %s\n', modelPath);
end

%% ========================================================================
%% 3. TUNE PRICE PREDICTION MODEL (Optional)
%% ========================================================================
if TUNE_PRICE
    fprintf('\n=== Tuning Price Prediction Model ===\n');
    fprintf('   (Using existing deep/wide models - see train_price_prediction_deep.m)\n');
    fprintf('   Run train_price_prediction_deep.m or train_price_prediction_wide.m\n');
end

%% ========================================================================
%% 4. TUNE BATTERY PREDICTION MODEL (Optional)
%% ========================================================================
if TUNE_BATTERY
    fprintf('\n=== Tuning Battery Prediction Model ===\n');
    fprintf('   (Model already performing well - R² = 0.7489, MAPE = 5.08%%)\n');
    fprintf('   Optional: Try deeper architecture for marginal improvement\n');
end

%% Summary
fprintf('\n=== Tuning Complete ===\n');
fprintf('\nNext steps:\n');
if TUNE_BRAND
    fprintf('  1. Test tuned brand classifier: load(''trained_models/brand_classifier_tuned.mat'')\n');
end
if TUNE_RAM
    fprintf('  2. Test tuned RAM predictor: load(''trained_models/ram_predictor_tuned.mat'')\n');
end
fprintf('  3. Compare performance with original models\n');
fprintf('  4. If improved, replace original models with tuned versions\n');
fprintf('  5. Update API endpoints to use tuned models\n\n');
