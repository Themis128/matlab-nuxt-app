% Predict Mobile Phone Brand
% This function uses the trained model to predict brand for new phones
%
% Usage:
%   brand = predict_brand(ram, battery, screenSize, weight, year, price)
%
% Inputs:
%   ram - RAM in GB (e.g., 6, 8, 12)
%   battery - Battery capacity in mAh (e.g., 4000, 5000)
%   screenSize - Screen size in inches (e.g., 6.1, 6.7)
%   weight - Weight in grams (e.g., 174, 203)
%   year - Launch year (e.g., 2024, 2023)
%   price - Price in USD (e.g., 999, 1299)
%
% Output:
%   brand - Predicted brand name as string

function brand = predict_brand(ram, battery, screenSize, weight, year, price)

    % Load model and normalization parameters
    modelPath = 'trained_models/brand_classifier.mat';
    if ~exist(modelPath, 'file')
        error('Model not found. Please train the model first using train_brand_classification_model.m');
    end

    load(modelPath, 'net', 'normalizationParams', 'uniqueCompanies');

    % Prepare feature vector
    features = [ram, battery, screenSize, weight, year, price];

    % Normalize features
    X_mean = normalizationParams.X_mean;
    X_std = normalizationParams.X_std;

    features_normalized = (features - X_mean) ./ (X_std + eps);

    % Predict
    brand_categorical = classify(net, features_normalized');
    brand = string(brand_categorical);

end
