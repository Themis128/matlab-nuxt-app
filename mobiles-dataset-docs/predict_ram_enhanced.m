% Predict RAM Using Enhanced Model
% This function uses the enhanced model with interaction features
%
% Usage: ram = predict_ram_enhanced(battery, screenSize, weight, year, price, company)

function ram = predict_ram_enhanced(battery, screenSize, weight, year, price, company)

    modelPath = 'trained_models/ram_predictor_enhanced.mat';
    if ~exist(modelPath, 'file')
        error('Enhanced RAM model not found. Please train using train_all_models_enhanced.m');
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
    base_features = [battery, screenSize, weight, year, price, companyEncoded];

    % Calculate enhanced features
    price_per_ram_est = price / 8;  % Estimate (will be refined)
    price_per_battery = price / (battery + eps);
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
    screen_weight_ratio = screenSize / (weight + eps);
    battery_screen_ratio = battery / (screenSize + eps);

    % Combine all features
    enhanced_features_vec = [price_per_ram_est, price_per_battery, price_per_screen, ...
                            double(is_premium), double(is_mid_range), double(is_budget), ...
                            years_since_2020, double(is_recent), ...
                            screen_weight_ratio, battery_screen_ratio];

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
    ram_normalized = predict(net_enhanced, features_normalized);
    ram = ram_normalized * y_std + y_mean;
    ram = max(1, round(ram));

end
