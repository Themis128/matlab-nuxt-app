% Ensemble Price Prediction
% Combines predictions from all trained price models using weighted average
%
% Usage: price = predict_price_ensemble(ram, battery, screenSize, weight, year, company)
%
% This function combines predictions from:
% - Standard model (20% weight)
% - Lightweight model (35% weight - best R²)
% - Wide model (25% weight)
% - Deep model (20% weight)

function price = predict_price_ensemble(ram, battery, screenSize, weight, year, company)

    predictions = [];
    weights = [];

    % Helper function to make prediction from a model
    function pred = predict_from_model(modelPath, ram, battery, screenSize, weight, year, company)
        if ~exist(modelPath, 'file')
            pred = [];
            return;
        end

        load(modelPath, 'net', 'normalizationParams', 'uniqueCompanies');

        % Encode company
        companyStr = string(company);
        companyIdx = find(strcmpi(uniqueCompanies, companyStr));
        if isempty(companyIdx)
            companyIdx = 1;
        end
        companyEncoded = zeros(1, length(uniqueCompanies));
        companyEncoded(companyIdx) = 1;

        % Prepare features
        features = [ram, battery, screenSize, weight, year, companyEncoded];
        if size(features, 1) > size(features, 2)
            features = features';
        end

        % Normalize
        X_mean = normalizationParams.X_mean;
        X_std = normalizationParams.X_std;
        y_mean = normalizationParams.y_mean;
        y_std = normalizationParams.y_std;

        features_normalized = (features - X_mean) ./ (X_std + eps);

        % Predict
        price_normalized = predict(net, features_normalized);
        pred = price_normalized * y_std + y_mean;
        pred = max(0, pred);
    end

    % Standard Model (20% weight)
    modelPath = 'trained_models/price_predictor.mat';
    if exist(modelPath, 'file')
        pred = predict_from_model(modelPath, ram, battery, screenSize, weight, year, company);
        if ~isempty(pred)
            predictions = [predictions, pred];
            weights = [weights, 0.20];
        end
    end

    % Lightweight Model (35% weight - best R² = 0.8138)
    modelPath = 'trained_models/price_predictor_lightweight.mat';
    if exist(modelPath, 'file')
        pred = predict_from_model(modelPath, ram, battery, screenSize, weight, year, company);
        if ~isempty(pred)
            predictions = [predictions, pred];
            weights = [weights, 0.35];
        end
    end

    % Wide Model (25% weight)
    modelPath = 'trained_models/price_predictor_wide.mat';
    if exist(modelPath, 'file')
        pred = predict_from_model(modelPath, ram, battery, screenSize, weight, year, company);
        if ~isempty(pred)
            predictions = [predictions, pred];
            weights = [weights, 0.25];
        end
    end

    % Deep Model (20% weight)
    modelPath = 'trained_models/price_predictor_deep.mat';
    if exist(modelPath, 'file')
        pred = predict_from_model(modelPath, ram, battery, screenSize, weight, year, company);
        if ~isempty(pred)
            predictions = [predictions, pred];
            weights = [weights, 0.20];
        end
    end

    % Weighted average
    if isempty(predictions)
        error('No price prediction models found. Please train models first.');
    end

    % Normalize weights
    weights = weights / sum(weights);

    % Weighted average prediction
    price = sum(predictions .* weights);

    % Ensure positive
    price = max(0, price);

end
