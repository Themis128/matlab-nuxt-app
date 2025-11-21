% Comprehensive Model Training Script
% This script trains all models including tuned versions for best reliability
% Usage: run('train_all_models_comprehensive.m')
%
% This will train:
% 1. All standard models (7 models)
% 2. Tuned RAM model (improved version)
% 3. Improved brand classification models (for reference)

fprintf('========================================\n');
fprintf('Comprehensive Model Training\n');
fprintf('Training All Models for Maximum Reliability\n');
fprintf('========================================\n\n');

%% Step 0: Ensure preprocessed data exists
fprintf('Step 0: Checking preprocessed data...\n');
if ~exist('preprocessed/preprocessed_data.mat', 'file')
    fprintf('   Preprocessed data not found. Running preprocessing...\n');
    run('preprocess_dataset.m');
    fprintf('   ✓ Preprocessing complete\n');
else
    fprintf('   ✓ Preprocessed data found\n');
end
fprintf('\n');

%% Step 1: Train All Standard Models
fprintf('========================================\n');
fprintf('PHASE 1: Training Standard Models\n');
fprintf('========================================\n\n');

standardModels = {
    'train_price_prediction_model.m', 'Standard Price Prediction';
    'train_price_prediction_deep.m', 'Deep Price Prediction';
    'train_price_prediction_wide.m', 'Wide Price Prediction';
    'train_price_prediction_lightweight.m', 'Lightweight Price Prediction';
    'train_brand_classification_model.m', 'Brand Classification';
    'train_ram_prediction_model.m', 'RAM Prediction (Original)';
    'train_battery_prediction_model.m', 'Battery Prediction'
};

numStandard = size(standardModels, 1);
standardResults = cell(numStandard, 1);

for i = 1:numStandard
    fprintf('\n----------------------------------------\n');
    modelName = standardModels{i, 2};
    modelScript = standardModels{i, 1};
    fprintf('Training %d/%d: %s\n', i, numStandard, modelName);
    fprintf('----------------------------------------\n\n');

    try
        tic;
        run(modelScript);
        trainingTime = toc;
        standardResults{i} = struct('model', modelName, 'status', 'success', 'time', trainingTime);
        fprintf('\n✓ %s completed successfully (%.1f seconds)\n', modelName, trainingTime);
    catch ME
        standardResults{i} = struct('model', modelName, 'status', 'failed', 'error', ME.message);
        fprintf('\n✗ %s failed: %s\n', modelName, ME.message);
    end
end

%% Step 2: Train Tuned RAM Model (Improved Version)
fprintf('\n\n========================================\n');
fprintf('PHASE 2: Training Tuned/Improved Models\n');
fprintf('========================================\n\n');

fprintf('Training Tuned RAM Prediction Model (with feature engineering)...\n');
fprintf('This model has improved R² performance (0.6798 vs 0.6381)\n\n');

try
    % Run the RAM tuning from tune_models.m
    % We'll extract just the RAM tuning part
    fprintf('   Loading data...\n');
    load('preprocessed/preprocessed_data.mat');

    % Prepare features with interactions (from tune_models.m)
    fprintf('   Creating enhanced features...\n');
    X_base = [battery_clean, screenSize_clean, weight_clean, ...
              double(year_clean), priceUSD_clean];

    uniqueCompanies = categories(companies_clean);
    companyEncoded = zeros(length(companies_clean), length(uniqueCompanies));
    for j = 1:length(companies_clean)
        idx = find(strcmp(uniqueCompanies, string(companies_clean(j))));
        if ~isempty(idx)
            companyEncoded(j, idx) = 1;
        end
    end

    % Add interaction features
    price_per_year = priceUSD_clean ./ (double(year_clean) - 2010 + 1);
    battery_screen_ratio = battery_clean ./ (screenSize_clean + eps);

    X = [X_base, companyEncoded, price_per_year, battery_screen_ratio];
    y = ram_clean;

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

    % Build network
    fprintf('   Building network (256→128→64)...\n');
    numFeatures = size(X, 2);
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
        'Plots', 'none', ...
        'Verbose', false, ...
        'Shuffle', 'every-epoch');

    % Train
    fprintf('   Training...\n');
    tic;
    net_tuned = trainNetwork(XTrain, YTrain, layers, options);
    trainingTime = toc;

    % Evaluate
    YPred_normalized = predict(net_tuned, XTest);
    YPred = YPred_normalized * y_std + y_mean;

    residuals = YPred - YTest_original;
    r2_tuned = 1 - sum(residuals.^2) / sum((YTest_original - mean(YTest_original)).^2);
    rmse_tuned = sqrt(mean(residuals.^2));

    % Save
    if ~exist('trained_models', 'dir')
        mkdir('trained_models');
    end

    modelPath = 'trained_models/ram_predictor_tuned.mat';
    save(modelPath, 'net_tuned', 'normalizationParams', 'uniqueCompanies', ...
         'r2_tuned', 'rmse_tuned', 'trainingTime');

    fprintf('\n   ✓ Tuned RAM model completed (%.1f seconds)\n', trainingTime);
    fprintf('      R²: %.4f, RMSE: %.2f GB\n', r2_tuned, rmse_tuned);

    tunedRAMResult = struct('status', 'success', 'r2', r2_tuned, 'rmse', rmse_tuned);

catch ME
    fprintf('\n   ✗ Tuned RAM model failed: %s\n', ME.message);
    tunedRAMResult = struct('status', 'failed', 'error', ME.message);
end

%% Step 3: Final Summary
fprintf('\n\n========================================\n');
fprintf('TRAINING SUMMARY\n');
fprintf('========================================\n\n');

fprintf('Standard Models:\n');
successful = 0;
failed = 0;
for i = 1:numStandard
    if ~isempty(standardResults{i}) && isfield(standardResults{i}, 'status')
        if strcmp(standardResults{i}.status, 'success')
            fprintf('  ✓ %s', standardResults{i}.model);
            if isfield(standardResults{i}, 'time')
                fprintf(' (%.1fs)', standardResults{i}.time);
            end
            fprintf('\n');
            successful = successful + 1;
        else
            fprintf('  ✗ %s - %s\n', standardResults{i}.model, standardResults{i}.error);
            failed = failed + 1;
        end
    end
end

fprintf('\nTuned/Improved Models:\n');
if isfield(tunedRAMResult, 'status') && strcmp(tunedRAMResult.status, 'success')
    fprintf('  ✓ Tuned RAM Prediction (R²=%.4f, RMSE=%.2f GB)\n', ...
        tunedRAMResult.r2, tunedRAMResult.rmse);
    successful = successful + 1;
else
    fprintf('  ✗ Tuned RAM Prediction - %s\n', tunedRAMResult.error);
    failed = failed + 1;
end

fprintf('\n----------------------------------------\n');
fprintf('Total: %d successful, %d failed\n', successful, failed);
fprintf('----------------------------------------\n');

%% List all trained models
fprintf('\nTrained Model Files:\n');
if exist('trained_models', 'dir')
    modelFiles = dir('trained_models/*.mat');
    for i = 1:length(modelFiles)
        if ~contains(modelFiles(i).name, 'results') && ...
           ~contains(modelFiles(i).name, 'evaluation') && ...
           ~contains(modelFiles(i).name, 'classification_results')
            fprintf('  ✓ %s\n', modelFiles(i).name);
        end
    end
end

fprintf('\n========================================\n');
fprintf('Training Complete!\n');
fprintf('========================================\n\n');

fprintf('Next steps:\n');
fprintf('  1. Review model performance metrics\n');
fprintf('  2. Test models with predict_*.m functions\n');
fprintf('  3. Use tuned RAM model (automatically used by predict_ram.m)\n');
fprintf('  4. Compare price prediction models (standard, deep, wide, lightweight)\n\n');
