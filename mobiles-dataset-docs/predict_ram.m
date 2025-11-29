% Predict RAM Capacity
% Usage: ram = predict_ram(battery, screenSize, weight, year, price, company)
%
% This function automatically uses the tuned model if available (better performance),
% otherwise falls back to the original model.
%
function ram = predict_ram(battery, screenSize, weight, year, price, company)
    % Try tuned model first (better performance: R² = 0.6798 vs 0.6381)
    tunedModelPath = 'trained_models/ram_predictor_tuned.mat';
    originalModelPath = 'trained_models/ram_predictor.mat';

    useTuned = exist(tunedModelPath, 'file');

    if useTuned
        modelPath = tunedModelPath;
    elseif exist(originalModelPath, 'file')
        modelPath = originalModelPath;
    else
        error('Model not found. Please train using train_ram_prediction_model.m');
    end

    % Load model - handle both original and tuned model variable names
    if useTuned
        % Tuned model uses 'net_tuned' variable name
        load(modelPath, 'net_tuned', 'normalizationParams', 'uniqueCompanies');
        net = net_tuned;  % Use consistent variable name
    else
        % Original model uses 'net' variable name
        load(modelPath, 'net', 'normalizationParams', 'uniqueCompanies');
    end

    % Encode company (one-hot)
    companyIdx = find(strcmpi(uniqueCompanies, company));
    if isempty(companyIdx)
        warning('Company "%s" not found. Using first company.', company);
        companyIdx = 1;
    end
    companyEncoded = zeros(1, length(uniqueCompanies));
    companyEncoded(companyIdx) = 1;

    % Prepare base features
    baseFeatures = [battery, screenSize, weight, year, price];

    % Check if this is the tuned model (has additional interaction features)
    % Tuned model has: base (5) + companyEncoded (N) + interactions (2) = 5+N+2
    % Original model has: base (5) + companyEncoded (N) = 5+N

    expectedFeaturesOriginal = 5 + length(uniqueCompanies);
    expectedFeaturesTuned = 5 + length(uniqueCompanies) + 2;

    % Determine which model we're using based on normalization params size
    numNormParams = length(normalizationParams.X_mean);

    if numNormParams == expectedFeaturesTuned
        % Tuned model: add interaction features
        price_per_year = price / (year - 2010 + 1);  % Normalize year
        battery_screen_ratio = battery / (screenSize + eps);

        % Combine all features: base + company + interactions
        features = [baseFeatures, companyEncoded, price_per_year, battery_screen_ratio];
    else
        % Original model: base + company only
        features = [baseFeatures, companyEncoded];
    end

    % Normalize
    X_mean = normalizationParams.X_mean;
    X_std = normalizationParams.X_std;
    y_mean = normalizationParams.y_mean;
    y_std = normalizationParams.y_std;

    % Ensure features is a row vector
    if size(features, 1) > size(features, 2)
        features = features';
    end

    % Verify feature dimensions match
    if length(features) ~= length(X_mean)
        error('Feature dimension mismatch. Expected %d features, got %d.', ...
            length(X_mean), length(features));
    end

    features_normalized = (features - X_mean) ./ (X_std + eps);

    % Predict: net expects features as rows (samples x features)
    ram_normalized = predict(net, features_normalized);
    ram = ram_normalized * y_std + y_mean;

    % Ensure positive and round to reasonable values
    ram = max(1, round(ram));
end
