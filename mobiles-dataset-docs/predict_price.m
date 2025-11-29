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

    % Input validation
    if nargin < 6
        error('predict_price requires 6 inputs: ram, battery, screenSize, weight, year, company');
    end

    % Validate numeric inputs
    if ~isnumeric(ram) || ~isscalar(ram) || ram <= 0
        error('RAM must be a positive numeric value (in GB)');
    end
    if ~isnumeric(battery) || ~isscalar(battery) || battery <= 0
        error('Battery must be a positive numeric value (in mAh)');
    end
    if ~isnumeric(screenSize) || ~isscalar(screenSize) || screenSize <= 0
        error('Screen size must be a positive numeric value (in inches)');
    end
    if ~isnumeric(weight) || ~isscalar(weight) || weight <= 0
        error('Weight must be a positive numeric value (in grams)');
    end
    if ~isnumeric(year) || ~isscalar(year) || year < 2000 || year > 2100
        error('Year must be a numeric value between 2000 and 2100');
    end
    if ~ischar(company) && ~isstring(company)
        error('Company must be a string or character array');
    end

    % Load model and normalization parameters
    modelPath = 'trained_models/price_predictor.mat';
    if ~exist(modelPath, 'file')
        error('Model not found at %s. Please train the model first using train_price_prediction_model.m', modelPath);
    end

    load(modelPath, 'net', 'normalizationParams', 'uniqueCompanies');

    % Encode company
    companyStr = string(company);
    companyIdx = find(strcmpi(uniqueCompanies, companyStr));
    if isempty(companyIdx)
        availableCompanies = strjoin(uniqueCompanies, ', ');
        warning('Company "%s" not found in training data. Available companies: %s. Using first company.', ...
            company, availableCompanies);
        companyIdx = 1;
    end
    companyEncoded = zeros(1, length(uniqueCompanies));
    companyEncoded(companyIdx) = 1;

    % Prepare feature vector (row vector: 1 x numFeatures)
    % Features: RAM, Battery, Screen Size, Weight, Year, Company (one-hot encoded)
    features = [ram, battery, screenSize, weight, year, companyEncoded];

    % Ensure features is a row vector
    if size(features, 1) > size(features, 2)
        features = features';
    end

    % Normalize features
    X_mean = normalizationParams.X_mean;
    X_std = normalizationParams.X_std;
    y_mean = normalizationParams.y_mean;
    y_std = normalizationParams.y_std;

    % Normalize: features should be 1x24, X_mean and X_std are 1x24
    features_normalized = (features - X_mean) ./ (X_std + eps);

    % Predict: net expects features as rows (samples x features)
    % For single prediction: 1 x 24
    price_normalized = predict(net, features_normalized);

    % Denormalize
    price = price_normalized * y_std + y_mean;

    % Ensure positive price
    price = max(0, price);

end
