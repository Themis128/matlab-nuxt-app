% Predict Front Camera MP
% Usage: front_cam = predict_front_camera(ram, battery, screenSize, weight, year, price, company)

function front_cam = predict_front_camera(ram, battery, screenSize, weight, year, price, company)
    modelPath = 'trained_models/front_camera_predictor.mat';
    if ~exist(modelPath, 'file')
        error('Model not found. Please train using train_front_camera_prediction_model.m');
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
    front_cam_normalized = predict(net, features_normalized);
    front_cam = front_cam_normalized * y_std + y_mean;

    % Ensure positive and round
    front_cam = max(1, round(front_cam));
end
