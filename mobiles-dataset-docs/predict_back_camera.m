% Predict Back Camera MP
% Usage: back_cam = predict_back_camera(ram, battery, screenSize, weight, year, price, company)

function back_cam = predict_back_camera(ram, battery, screenSize, weight, year, price, company)
    modelPath = 'trained_models/back_camera_predictor.mat';
    if ~exist(modelPath, 'file')
        error('Model not found. Please train using train_back_camera_prediction_model.m');
    end

    load(modelPath, 'net', 'normalizationParams', 'uniqueCompanies');

    % Encode company
    companyIdx = find(strcmpi(uniqueCompanies, company));
    if isempty(companyIdx)
        warning('Company "%s" not found. Using first company.', company);
        companyIdx = 1;
    end
    companyEncoded = zeros(1, length(uniqueCompanies));
    companyEncoded(companyIdx) = 1;

    % Prepare features
    features = [ram, battery, screenSize, weight, year, price, companyEncoded];

    % Normalize
    X_mean = normalizationParams.X_mean;
    X_std = normalizationParams.X_std;
    y_mean = normalizationParams.y_mean;
    y_std = normalizationParams.y_std;

    % Ensure features is a row vector
    if size(features, 1) > size(features, 2)
        features = features';
    end

    features_normalized = (features - X_mean) ./ (X_std + eps);

    % Predict
    back_cam_normalized = predict(net, features_normalized);
    back_cam = back_cam_normalized * y_std + y_mean;

    % Ensure positive and round
    back_cam = max(1, round(back_cam));
end
