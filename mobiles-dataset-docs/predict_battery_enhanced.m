% Predict Battery Using Enhanced Model
% This function uses the enhanced model with interaction features
%
% Usage: battery = predict_battery_enhanced(ram, screenSize, weight, year, price, company)

function battery = predict_battery_enhanced(ram, screenSize, weight, year, price, company)

    modelPath = 'trained_models/battery_predictor_enhanced.mat';
    if ~exist(modelPath, 'file')
        error('Enhanced battery model not found. Please train using train_all_models_enhanced.m');
    end

    load(modelPath, 'net_enhanced', 'normalizationParams', 'uniqueCompanies');

    % Encode company
    companyStr = string(company);
    companyIdx = find(strcmpi(uniqueCompanies, companyStr));
    if isempty(companyIdx)
        companyIdx = 1;
    end
    companyEncoded = zeros(1, length(uniqueCompanies));
    companyEncoded(companyIdx) = 1;

    % Base features
    base_features = [ram, screenSize, weight, year, price, companyEncoded];

    % Calculate enhanced features
    price_per_ram = price / (ram + eps);
    price_per_battery_est = price / 4000;  % Estimate
    price_per_screen = price / (screenSize + eps);

    % Brand segments
    premium_brands = {'Apple', 'Samsung', 'Google', 'Sony'};
    mid_range_brands = {'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo', 'Honor', 'Huawei'};
    budget_brands = {'Infinix', 'Tecno', 'POCO', 'Motorola', 'Lenovo', 'Nokia'};

    is_premium = any(strcmpi(premium_brands, company));
    is_mid_range = any(strcmpi(mid_range_brands, company));
    is_budget = any(strcmpi(budget_brands, company));

    % Temporal features
    years_since_2020 = year - 2020;
    is_recent = year >= 2023;

    % Feature ratios
    ram_battery_est = ram / 4000;  % Estimate
    screen_weight_ratio = screenSize / (weight + eps);

    % Combine all features
    enhanced_features_vec = [price_per_ram, price_per_battery_est, price_per_screen, ...
                            double(is_premium), double(is_mid_range), double(is_budget), ...
                            years_since_2020, double(is_recent), ...
                            ram_battery_est, screen_weight_ratio];

    features = [base_features, enhanced_features_vec];

    % Normalize
    if size(features, 1) > size(features, 2)
        features = features';
    end

    X_mean = normalizationParams.X_mean;
    X_std = normalizationParams.X_std;
    y_mean = normalizationParams.y_mean;
    y_std = normalizationParams.y_std;

    features_normalized = (features - X_mean) ./ (X_std + eps);

    % Predict
    battery_normalized = predict(net_enhanced, features_normalized);
    battery = battery_normalized * y_std + y_mean;
    battery = max(1000, round(battery));

end
