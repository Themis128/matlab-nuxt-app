% Predict Brand Using Enhanced Model
% This function uses the enhanced model with interaction features
%
% Usage: brand = predict_brand_enhanced(ram, battery, screenSize, weight, year, price)

function brand = predict_brand_enhanced(ram, battery, screenSize, weight, year, price)

    modelPath = 'trained_models/brand_classifier_enhanced.mat';
    if ~exist(modelPath, 'file')
        error('Enhanced brand model not found. Please train using train_all_models_enhanced.m');
    end

    load(modelPath, 'net_enhanced', 'normalizationParams', 'uniqueCompanies');

    % Base features
    base_features = [ram, battery, screenSize, weight, year, price];

    % Calculate enhanced features
    price_per_ram = price / (ram + eps);
    price_per_battery = price / (battery + eps);
    price_per_screen = price / (screenSize + eps);

    % Brand segments (we don't know brand yet, so use price-based estimate)
    is_premium = price > 800;
    is_mid_range = price >= 300 && price <= 800;
    is_budget = price < 300;

    % Temporal features
    years_since_2020 = year - 2020;
    is_recent = year >= 2023;

    % Feature ratios
    ram_battery_ratio = ram / (battery + eps);
    screen_weight_ratio = screenSize / (weight + eps);
    battery_screen_ratio = battery / (screenSize + eps);

    % Combine all features
    enhanced_features_vec = [price_per_ram, price_per_battery, price_per_screen, ...
                            double(is_premium), double(is_mid_range), double(is_budget), ...
                            years_since_2020, double(is_recent), ...
                            ram_battery_ratio, screen_weight_ratio, battery_screen_ratio];

    features = [base_features, enhanced_features_vec];

    % Normalize
    if size(features, 1) > size(features, 2)
        features = features';
    end

    X_mean = normalizationParams.X_mean;
    X_std = normalizationParams.X_std;

    features_normalized = (features - X_mean) ./ (X_std + eps);

    % Predict
    brand_categorical = classify(net_enhanced, features_normalized);
    brand = string(brand_categorical);

end
