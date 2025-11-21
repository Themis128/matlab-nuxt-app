% Predict Mobile Phone Price
% This function uses the trained model to predict prices for new phones
%
% Usage:
%   price = predict_price(ram, battery, screenSize, weight, year, company)
%
% Inputs:
%   ram - RAM in GB (e.g., 6, 8, 12)
%   battery - Battery capacity in mAh (e.g., 4000, 5000)
%   screenSize - Screen size in inches (e.g., 6.1, 6.7)
%   weight - Weight in grams (e.g., 174, 203)
%   year - Launch year (e.g., 2024, 2023)
%   company - Company name as string (e.g., 'Apple', 'Samsung')
%
% Output:
%   price - Predicted price in USD

function price = predict_price(ram, battery, screenSize, weight, year, company)

    % Load model and normalization parameters
    modelPath = 'trained_models/price_predictor.mat';
    if ~exist(modelPath, 'file')
        error('Model not found. Please train the model first using train_price_prediction_model.m');
    end

    load(modelPath, 'net', 'normalizationParams', 'uniqueCompanies');

    % Encode company
    companyIdx = find(strcmpi(uniqueCompanies, company));
    if isempty(companyIdx)
        warning('Company "%s" not found in training data. Using first company.', company);
        companyIdx = 1;
    end
    companyEncoded = zeros(1, length(uniqueCompanies));
    companyEncoded(companyIdx) = 1;

    % Prepare feature vector
    features = [ram, battery, screenSize, weight, year, companyEncoded];

    % Normalize features
    X_mean = normalizationParams.X_mean;
    X_std = normalizationParams.X_std;
    y_mean = normalizationParams.y_mean;
    y_std = normalizationParams.y_std;

    features_normalized = (features - X_mean) ./ (X_std + eps);

    % Predict
    price_normalized = predict(net, features_normalized');

    % Denormalize
    price = price_normalized * y_std + y_mean;

    % Ensure positive price
    price = max(0, price);

end
