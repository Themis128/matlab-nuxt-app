% Predict Price Using Enhanced Model
% This function uses the enhanced model with interaction features
%
% Usage: price = predict_price_enhanced(ram, battery, screenSize, weight, year, company)

function price = predict_price_enhanced(ram, battery, screenSize, weight, year, company)

    modelPath = 'trained_models/price_predictor_enhanced.mat';
    if ~exist(modelPath, 'file')
        error('Enhanced model not found. Please train using train_models_with_enhanced_features.m');
    end

    load(modelPath, 'net_enhanced', 'normalizationParams', 'uniqueCompanies', 'enhanced_features');

    % Encode company
    companyStr = string(company);
    companyIdx = find(strcmpi(uniqueCompanies, companyStr));
    if isempty(companyIdx)
        companyIdx = 1;
    end
    companyEncoded = zeros(1, length(uniqueCompanies));
    companyEncoded(companyIdx) = 1;

    % Base features
    base_features = [ram, battery, screenSize, weight, year, companyEncoded];

    % Calculate enhanced features
    % For price ratios, we need an estimate. Use ensemble or standard model first
    if exist('trained_models/price_predictor_ensemble.mat', 'file') || ...
       exist('trained_models/price_predictor_lightweight.mat', 'file')
        % Use best available model for initial estimate
        try
            price_estimate = predict_price_ensemble(ram, battery, screenSize, weight, year, company);
        catch
            price_estimate = predict_price(ram, battery, screenSize, weight, year, company);
        end
    else
        % Fallback: rough estimate
        price_estimate = ram * 100 + battery * 0.1 + screenSize * 50;
    end

    price_per_ram = price_estimate / (ram + eps);
    price_per_battery = price_estimate / (battery + eps);
    price_per_screen = price_estimate / (screenSize + eps);

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
    y_mean = normalizationParams.y_mean;
    y_std = normalizationParams.y_std;

    features_normalized = (features - X_mean) ./ (X_std + eps);

    % Predict
    price_normalized = predict(net_enhanced, features_normalized);
    price = price_normalized * y_std + y_mean;
    price = max(0, price);

end
