% Demo All Models - Presentation Script
% This script creates an interactive demonstration of all trained models
% Perfect for showcasing to an audience
%
% Usage: run('demo_all_models.m')

fprintf('========================================\n');
fprintf('Mobile Phones Dataset - Model Demo\n');
fprintf('========================================\n\n');

%% Demo Configuration
fprintf('Setting up demo...\n\n');

% Example phones to demonstrate
demoPhones = {
    struct('name', 'iPhone 15 Pro', 'ram', 8, 'battery', 3274, 'screen', 6.1, 'weight', 187, 'year', 2023, 'company', 'Apple');
    struct('name', 'Samsung Galaxy S24', 'ram', 8, 'battery', 4000, 'screen', 6.2, 'weight', 167, 'year', 2024, 'company', 'Samsung');
    struct('name', 'OnePlus 12', 'ram', 12, 'battery', 5400, 'screen', 6.82, 'weight', 220, 'year', 2024, 'company', 'OnePlus');
    struct('name', 'Xiaomi 14', 'ram', 12, 'battery', 4610, 'screen', 6.36, 'weight', 193, 'year', 2024, 'company', 'Xiaomi');
    struct('name', 'Google Pixel 8', 'ram', 8, 'battery', 4575, 'screen', 6.2, 'weight', 187, 'year', 2023, 'company', 'Google');
};

fprintf('Demo phones prepared: %d examples\n\n', length(demoPhones));

%% 1. Price Prediction Models Demo
fprintf('========================================\n');
fprintf('1. PRICE PREDICTION MODELS\n');
fprintf('========================================\n\n');

% Load standard price model
if exist('trained_models/price_predictor.mat', 'file')
    load('trained_models/price_predictor.mat');
    fprintf('✓ Standard Price Model loaded\n\n');

    fprintf('Price Predictions for Demo Phones:\n');
    fprintf('%-25s |  Predicted Price |  Model\n', 'Phone');
    fprintf('%-25s-|-----------------|-------------------\n', repmat('-', 1, 25));

    for i = 1:length(demoPhones)
        phone = demoPhones{i};
        try
            price = predict_price(phone.ram, phone.battery, phone.screen, ...
                                  phone.weight, phone.year, phone.company);
            fprintf('%-25s |  $%13.0f |  Standard\n', phone.name, price);
        catch
            fprintf('%-25s |  Error          |  Standard\n', phone.name);
        end
    end
    fprintf('\n');
else
    fprintf('⚠ Standard price model not found\n\n');
end

% Try other price models
priceModels = {
    'price_predictor_deep.mat', 'Deep';
    'price_predictor_wide.mat', 'Wide';
    'price_predictor_lightweight.mat', 'Lightweight'
};

for m = 1:length(priceModels)
    modelPath = fullfile('trained_models', priceModels{m, 1});
    if exist(modelPath, 'file')
        load(modelPath, 'net', 'normalizationParams', 'uniqueCompanies');
        fprintf('✓ %s Price Model loaded\n', priceModels{m, 2});

        % Predict for first demo phone
        phone = demoPhones{1};
        try
            % Encode company
            companyIdx = find(strcmpi(uniqueCompanies, phone.company));
            if isempty(companyIdx), companyIdx = 1; end
            companyEncoded = zeros(1, length(uniqueCompanies));
            companyEncoded(companyIdx) = 1;

            % Prepare features
            X = [phone.ram, phone.battery, phone.screen, phone.weight, ...
                 phone.year, companyEncoded];
            X_norm = (X - normalizationParams.X_mean) ./ (normalizationParams.X_std + eps);

            % Predict
            y_pred_norm = predict(net, X_norm');
            price = y_pred_norm * normalizationParams.y_std + normalizationParams.y_mean;
            price = max(0, price);

            fprintf('  %s: $%.0f\n', phone.name, price);
        catch
            fprintf('  Prediction failed\n');
        end
        fprintf('\n');
    end
end

%% 2. Brand Classification Demo
fprintf('========================================\n');
fprintf('2. BRAND CLASSIFICATION MODEL\n');
fprintf('========================================\n\n');

if exist('trained_models/brand_classifier.mat', 'file')
    load('trained_models/brand_classifier.mat');
    fprintf('✓ Brand Classification Model loaded\n\n');

    fprintf('Brand Predictions for Demo Phones:\n');
    fprintf('%-25s |  Actual Brand  |  Predicted Brand\n', 'Phone');
    fprintf('%-25s-|----------------|-----------------\n', repmat('-', 1, 25));

    for i = 1:length(demoPhones)
        phone = demoPhones{i};
        try
            % Estimate price first (use standard model if available)
            if exist('trained_models/price_predictor.mat', 'file')
                estPrice = predict_price(phone.ram, phone.battery, phone.screen, ...
                                        phone.weight, phone.year, phone.company);
            else
                estPrice = 500; % Default estimate
            end

            brand = predict_brand(phone.ram, phone.battery, phone.screen, ...
                                 phone.weight, phone.year, estPrice);

            correct = strcmpi(brand, phone.company);
            status = '✓' if correct else '✗';
            fprintf('%-25s |  %-13s |  %-15s %s\n', ...
                phone.name, phone.company, brand, status);
        catch
            fprintf('%-25s |  %-13s |  Error\n', phone.name, phone.company);
        end
    end
    fprintf('\n');
else
    fprintf('⚠ Brand classification model not found\n\n');
end

%% 3. Feature Prediction Models Demo
fprintf('========================================\n');
fprintf('3. FEATURE PREDICTION MODELS\n');
fprintf('========================================\n\n');

% RAM Prediction
if exist('trained_models/ram_predictor.mat', 'file')
    fprintf('RAM Prediction:\n');
    phone = demoPhones{1};
    try
        ram = predict_ram(phone.battery, phone.screen, phone.weight, ...
                          phone.year, 999, phone.company);
        fprintf('  Phone: %s\n', phone.name);
        fprintf('  Actual RAM: %d GB\n', phone.ram);
        fprintf('  Predicted RAM: %.0f GB\n', ram);
        fprintf('  Error: %.1f GB\n\n', abs(ram - phone.ram));
    catch
        fprintf('  Prediction failed\n\n');
    end
end

% Battery Prediction
if exist('trained_models/battery_predictor.mat', 'file')
    fprintf('Battery Capacity Prediction:\n');
    phone = demoPhones{1};
    try
        battery = predict_battery(phone.ram, phone.screen, phone.weight, ...
                                 phone.year, 999, phone.company);
        fprintf('  Phone: %s\n', phone.name);
        fprintf('  Actual Battery: %d mAh\n', phone.battery);
        fprintf('  Predicted Battery: %.0f mAh\n', battery);
        fprintf('  Error: %.0f mAh (%.1f%%)\n\n', ...
            abs(battery - phone.battery), ...
            abs(battery - phone.battery) / phone.battery * 100);
    catch
        fprintf('  Prediction failed\n\n');
    end
end

%% 4. Model Performance Summary
fprintf('========================================\n');
fprintf('4. MODEL PERFORMANCE SUMMARY\n');
fprintf('========================================\n\n');

% Load performance metrics
performance = struct();

% Price models
if exist('trained_models/price_prediction_results.mat', 'file')
    load('trained_models/price_prediction_results.mat', 'r2', 'mae', 'rmse');
    performance.standard_price = struct('r2', r2, 'mae', mae, 'rmse', rmse);
end

if exist('trained_models/price_prediction_deep_results.mat', 'file')
    load('trained_models/price_prediction_deep_results.mat', 'r2', 'mae', 'rmse');
    performance.deep_price = struct('r2', r2, 'mae', mae, 'rmse', rmse);
end

if exist('trained_models/price_prediction_wide_results.mat', 'file')
    load('trained_models/price_prediction_wide_results.mat', 'r2', 'mae', 'rmse');
    performance.wide_price = struct('r2', r2, 'mae', mae, 'rmse', rmse);
end

if exist('trained_models/price_prediction_lightweight_results.mat', 'file')
    load('trained_models/price_prediction_lightweight_results.mat', 'r2', 'mae', 'rmse');
    performance.lightweight_price = struct('r2', r2, 'mae', mae, 'rmse', rmse);
end

% Brand classification
if exist('trained_models/brand_classification_results.mat', 'file')
    load('trained_models/brand_classification_results.mat', 'accuracy', 'weighted_f1');
    performance.brand = struct('accuracy', accuracy, 'f1', weighted_f1);
end

% RAM prediction
if exist('trained_models/ram_prediction_results.mat', 'file')
    load('trained_models/ram_prediction_results.mat', 'r2', 'mae', 'rmse');
    performance.ram = struct('r2', r2, 'mae', mae, 'rmse', rmse);
end

% Battery prediction
if exist('trained_models/battery_prediction_results.mat', 'file')
    load('trained_models/battery_prediction_results.mat', 'r2', 'mae', 'rmse');
    performance.battery = struct('r2', r2, 'mae', mae, 'rmse', rmse);
end

% Display performance table
fprintf('Model Performance Metrics:\n\n');
fprintf('%-25s |  R²/Accuracy  |  RMSE/MAE\n', 'Model');
fprintf('%-25s-|----------------|-------------------\n', repmat('-', 1, 25));

if isfield(performance, 'standard_price')
    fprintf('%-25s |  R²: %.4f     |  RMSE: $%.0f\n', ...
        'Standard Price', performance.standard_price.r2, performance.standard_price.rmse);
end

if isfield(performance, 'deep_price')
    fprintf('%-25s |  R²: %.4f     |  RMSE: $%.0f\n', ...
        'Deep Price', performance.deep_price.r2, performance.deep_price.rmse);
end

if isfield(performance, 'wide_price')
    fprintf('%-25s |  R²: %.4f     |  RMSE: $%.0f\n', ...
        'Wide Price', performance.wide_price.r2, performance.wide_price.rmse);
end

if isfield(performance, 'lightweight_price')
    fprintf('%-25s |  R²: %.4f     |  RMSE: $%.0f\n', ...
        'Lightweight Price', performance.lightweight_price.r2, performance.lightweight_price.rmse);
end

if isfield(performance, 'brand')
    fprintf('%-25s |  Accuracy: %.1f%% |  F1: %.4f\n', ...
        'Brand Classification', performance.brand.accuracy, performance.brand.f1);
end

if isfield(performance, 'ram')
    fprintf('%-25s |  R²: %.4f     |  RMSE: %.2f GB\n', ...
        'RAM Prediction', performance.ram.r2, performance.ram.rmse);
end

if isfield(performance, 'battery')
    fprintf('%-25s |  R²: %.4f     |  RMSE: %.0f mAh\n', ...
        'Battery Prediction', performance.battery.r2, performance.battery.rmse);
end

fprintf('\n');

%% 5. Interactive Demo
fprintf('========================================\n');
fprintf('5. INTERACTIVE DEMO\n');
fprintf('========================================\n\n');

fprintf('Try your own predictions:\n\n');
fprintf('Example 1: Predict price for a new phone\n');
fprintf('  price = predict_price(8, 4500, 6.5, 180, 2024, ''Samsung'');\n');
fprintf('  fprintf(''Predicted price: $%%.0f\\n'', price);\n\n');

fprintf('Example 2: Predict brand from specifications\n');
fprintf('  brand = predict_brand(12, 5000, 6.7, 200, 2024, 1200);\n');
fprintf('  fprintf(''Predicted brand: %%s\\n'', brand);\n\n');

fprintf('Example 3: Predict missing RAM\n');
fprintf('  ram = predict_ram(4000, 6.1, 175, 2024, 800, ''Apple'');\n');
fprintf('  fprintf(''Predicted RAM: %%.0f GB\\n'', ram);\n\n');

%% Summary
fprintf('========================================\n');
fprintf('Demo Complete!\n');
fprintf('========================================\n\n');

fprintf('All models are ready for use.\n');
fprintf('For visualizations, run: visualize_results.m\n');
fprintf('For comprehensive analysis, run: evaluate_model.m\n\n');
