% Find Similar Phones
% Finds phones with similar specifications to the input phone
% Usage: similar_phones = find_similar_phones(ram, battery, screenSize, weight, year, price, company, numResults)
%
% Input:
%   ram, battery, screenSize, weight, year, price, company - Phone specifications
%   numResults - Number of similar phones to return (default: 5)
%
% Output:
%   similar_phones - Table with similar phones and similarity scores

function similar_phones = find_similar_phones(ram, battery, screenSize, weight, year, price, company, numResults)
    if nargin < 8
        numResults = 5;
    end

    fprintf('=== Finding Similar Phones ===\n\n');

    % Load preprocessed data
    if exist('preprocessed/preprocessed_data.mat', 'file')
        load('preprocessed/preprocessed_data.mat');
    else
        error('Preprocessed data not found. Please run preprocess_dataset.m first.');
    end

    % Create target feature vector
    targetFeatures = [ram, battery, screenSize, weight, year, price];

    % Create feature matrix from dataset
    datasetFeatures = [ram_clean, battery_clean, screenSize_clean, ...
                       weight_clean, double(year_clean), priceUSD_clean];

    % Normalize features for similarity calculation
    featureMeans = mean(datasetFeatures, 1);
    featureStds = std(datasetFeatures, 1);

    targetNormalized = (targetFeatures - featureMeans) ./ (featureStds + eps);
    datasetNormalized = (datasetFeatures - featureMeans) ./ (featureStds + eps);

    % Calculate cosine similarity
    % Cosine similarity = dot product of normalized vectors
    similarities = zeros(length(ram_clean), 1);
    for i = 1:length(ram_clean)
        dotProduct = sum(targetNormalized .* datasetNormalized(i, :));
        normTarget = sqrt(sum(targetNormalized.^2));
        normDataset = sqrt(sum(datasetNormalized(i, :).^2));
        similarities(i) = dotProduct / (normTarget * normDataset + eps);
    end

    % Also calculate weighted Euclidean distance (inverse similarity)
    weights = [1, 1, 1, 0.5, 0.5, 2];  % Price weighted more
    distances = zeros(length(ram_clean), 1);
    for i = 1:length(ram_clean)
        diff = targetFeatures - datasetFeatures(i, :);
        distances(i) = sqrt(sum((diff .* weights).^2));
    end

    % Combine similarities (cosine similarity - normalized distance)
    maxDist = max(distances);
    normalizedDist = distances / (maxDist + eps);
    combinedSimilarity = 0.7 * similarities + 0.3 * (1 - normalizedDist);

    % Sort by similarity
    [sortedSimilarity, sortIdx] = sort(combinedSimilarity, 'descend');

    % Get top results (exclude exact match if exists)
    topIdx = sortIdx(1:min(numResults+1, length(sortIdx)));

    % Create results table
    resultTable = table();
    resultTable.RAM_GB = ram_clean(topIdx);
    resultTable.Battery_mAh = battery_clean(topIdx);
    resultTable.ScreenSize_inches = screenSize_clean(topIdx);
    resultTable.Weight_g = weight_clean(topIdx);
    resultTable.Price_USD = priceUSD_clean(topIdx);
    resultTable.Year = year_clean(topIdx);
    resultTable.Company = companies_clean(topIdx);
    resultTable.Similarity_Score = sortedSimilarity(1:length(topIdx));

    % Add camera info if available
    if exist('frontCamera_clean', 'var') && exist('backCamera_clean', 'var')
        resultTable.FrontCamera_MP = frontCamera_clean(topIdx);
        resultTable.BackCamera_MP = backCamera_clean(topIdx);
    end

    % Display results
    fprintf('Top %d Similar Phones:\n\n', numResults);
    for i = 1:min(numResults, height(resultTable))
        fprintf('%d. %s Phone (%.0f)\n', i, string(resultTable.Company(i)), resultTable.Year(i));
        fprintf('   Specs: %dGB RAM, %dmAh, %.1f", %dg, $%.0f\n', ...
            resultTable.RAM_GB(i), resultTable.Battery_mAh(i), ...
            resultTable.ScreenSize_inches(i), resultTable.Weight_g(i), ...
            resultTable.Price_USD(i));
        fprintf('   Similarity: %.2f%%\n\n', resultTable.Similarity_Score(i) * 100);
    end

    similar_phones = resultTable(1:numResults, :);
end
