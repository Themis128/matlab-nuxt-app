% Predict Mobile Phone Prices (Batch)
% This function predicts prices for multiple phones at once
%
% Usage:
%   prices = predict_price_batch(specs)
%
% Input:
%   specs - Nx6 matrix or table where each row contains:
%          [ram, battery, screenSize, weight, year, company]
%          OR cell array of cell arrays: {{ram, battery, screenSize, weight, year, company}, ...}
%
% Output:
%   prices - Nx1 vector of predicted prices in USD
%
% Example:
%   specs = [8, 4000, 6.1, 174, 2024, 'Apple'; ...
%            12, 5000, 6.7, 203, 2024, 'Samsung'];
%   prices = predict_price_batch(specs);
%
%   OR using cell array:
%   specs = {{8, 4000, 6.1, 174, 2024, 'Apple'}, ...
%            {12, 5000, 6.7, 203, 2024, 'Samsung'}};
%   prices = predict_price_batch(specs);

function prices = predict_price_batch(specs)

    % Validate input
    if isempty(specs)
        error('Input specs cannot be empty');
    end

    % Convert input to consistent format
    if istable(specs)
        % Convert table to cell array
        specs = table2cell(specs);
    end

    % Determine number of samples and format
    if iscell(specs) && length(specs) > 0 && iscell(specs{1})
        % Cell array of cell arrays: {{ram, battery, ...}, ...}
        nSamples = length(specs);
        isCellArray = true;
    elseif isnumeric(specs)
        % Numeric matrix - convert to cell array for easier handling
        nSamples = size(specs, 1);
        isCellArray = false;
        % Convert numeric matrix to cell array (assuming last column is company name)
        temp = cell(nSamples, 6);
        for i = 1:nSamples
            for j = 1:5
                temp{i, j} = specs(i, j);
            end
            temp{i, 6} = char(specs(i, 6)); % Convert to char if needed
        end
        specs = temp;
    elseif iscell(specs)
        % Cell array (matrix form)
        nSamples = size(specs, 1);
        isCellArray = false;
    else
        error('Input must be a matrix, table, or cell array');
    end

    % Initialize output
    prices = zeros(nSamples, 1);

    % Load model once (more efficient for batch)
    modelPath = 'trained_models/price_predictor.mat';
    if ~exist(modelPath, 'file')
        error('Model not found at %s. Please train the model first using train_price_prediction_model.m', modelPath);
    end

    load(modelPath, 'net', 'normalizationParams', 'uniqueCompanies');

    % Prepare all features at once
    allFeatures = zeros(nSamples, 5 + length(uniqueCompanies));

    for i = 1:nSamples
        if isCellArray
            % Cell array of cell arrays
            ram = specs{i}{1};
            battery = specs{i}{2};
            screenSize = specs{i}{3};
            weight = specs{i}{4};
            year = specs{i}{5};
            company = specs{i}{6};
        else
            % Matrix or cell array
            ram = specs{i, 1};
            battery = specs{i, 2};
            screenSize = specs{i, 3};
            weight = specs{i, 4};
            year = specs{i, 5};
            company = specs{i, 6};
        end

        % Encode company
        companyStr = string(company);
        companyIdx = find(strcmpi(uniqueCompanies, companyStr));
        if isempty(companyIdx)
            warning('Company "%s" not found for sample %d. Using first company.', company, i);
            companyIdx = 1;
        end
        companyEncoded = zeros(1, length(uniqueCompanies));
        companyEncoded(companyIdx) = 1;

        % Prepare feature vector
        allFeatures(i, :) = [ram, battery, screenSize, weight, year, companyEncoded];
    end

    % Normalize all features at once
    X_mean = normalizationParams.X_mean;
    X_std = normalizationParams.X_std;
    y_mean = normalizationParams.y_mean;
    y_std = normalizationParams.y_std;

    allFeatures_normalized = (allFeatures - X_mean) ./ (X_std + eps);

    % Predict all at once (more efficient)
    prices_normalized = predict(net, allFeatures_normalized);

    % Denormalize
    prices = prices_normalized * y_std + y_mean;

    % Ensure positive prices
    prices = max(0, prices);

end
