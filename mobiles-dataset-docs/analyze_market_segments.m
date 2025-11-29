% Market Segmentation Analysis
% Clusters phones into market segments (Budget, Mid-range, Premium)
% Usage: segments = analyze_market_segments()
%
% Output:
%   segments - Structure with segment information and phone assignments

function segments = analyze_market_segments()
    fprintf('=== Market Segmentation Analysis ===\n\n');

    % Load preprocessed data
    if exist('preprocessed/preprocessed_data.mat', 'file')
        load('preprocessed/preprocessed_data.mat');
    else
        error('Preprocessed data not found. Please run preprocess_dataset.m first.');
    end

    % Prepare features for clustering
    % Use: Price, RAM, Battery, Screen Size, Year
    features = [priceUSD_clean, ram_clean, battery_clean, screenSize_clean, double(year_clean)];

    % Normalize features
    featureMeans = mean(features, 1);
    featureStds = std(features, 1);
    featuresNormalized = (features - featureMeans) ./ (featureStds + eps);

    fprintf('Step 1: Performing K-means clustering...\n');

    % K-means clustering with 3 segments
    k = 3;
    rng(42);  % For reproducibility
    [idx, centroids] = kmeans(featuresNormalized, k, 'Replicates', 10, 'MaxIter', 1000);

    % Denormalize centroids for interpretation
    centroidsDenorm = centroids .* featureStds + featureMeans;

    % Identify segments by average price
    segmentPrices = zeros(k, 1);
    for i = 1:k
        segmentPrices(i) = mean(priceUSD_clean(idx == i));
    end
    [~, segmentOrder] = sort(segmentPrices);

    % Assign segment names
    segmentNames = {'Budget', 'Mid-Range', 'Premium'};
    segmentNamesOrdered = segmentNames(segmentOrder);

    fprintf('   ✓ Clustering complete\n\n');

    % Analyze each segment
    fprintf('Step 2: Analyzing segments...\n\n');

    segments = struct();
    for i = 1:k
        segIdx = find(segmentOrder == i);
        actualIdx = idx == segIdx;

        segmentName = segmentNamesOrdered{i};
        fprintf('--- %s Segment ---\n', segmentName);
        fprintf('   Phones: %d (%.1f%%)\n', sum(actualIdx), sum(actualIdx)/length(idx)*100);
        fprintf('   Average Price: $%.0f\n', mean(priceUSD_clean(actualIdx)));
        fprintf('   Price Range: $%.0f - $%.0f\n', ...
            min(priceUSD_clean(actualIdx)), max(priceUSD_clean(actualIdx)));
        fprintf('   Average RAM: %.1f GB\n', mean(ram_clean(actualIdx)));
        fprintf('   Average Battery: %.0f mAh\n', mean(battery_clean(actualIdx)));
        fprintf('   Average Screen: %.1f"\n', mean(screenSize_clean(actualIdx)));
        fprintf('   Average Year: %.0f\n', mean(year_clean(actualIdx)));

        % Top brands in segment
        segmentCompanies = companies_clean(actualIdx);
        [uniqueCompanies, ~, companyIdx] = unique(segmentCompanies);
        companyCounts = accumarray(companyIdx, 1);
        [sortedCounts, sortIdx] = sort(companyCounts, 'descend');
        topBrands = uniqueCompanies(sortIdx(1:min(3, length(uniqueCompanies))));
        fprintf('   Top Brands: %s\n', strjoin(string(topBrands), ', '));
        fprintf('\n');

        % Store segment info
        segments.(segmentName) = struct();
        segments.(segmentName).indices = find(actualIdx);
        segments.(segmentName).count = sum(actualIdx);
        segments.(segmentName).avgPrice = mean(priceUSD_clean(actualIdx));
        segments.(segmentName).priceRange = [min(priceUSD_clean(actualIdx)), max(priceUSD_clean(actualIdx))];
        segments.(segmentName).avgRAM = mean(ram_clean(actualIdx));
        segments.(segmentName).avgBattery = mean(battery_clean(actualIdx));
        segments.(segmentName).avgScreen = mean(screenSize_clean(actualIdx));
        segments.(segmentName).avgYear = mean(year_clean(actualIdx));
        segments.(segmentName).topBrands = topBrands;
        segments.(segmentName).centroid = centroidsDenorm(segIdx, :);
    end

    % Create assignment vector
    segmentAssignments = categorical(repmat({'Unknown'}, length(idx), 1));
    for i = 1:k
        segIdx = find(segmentOrder == i);
        actualIdx = idx == segIdx;
        segmentAssignments(actualIdx) = segmentNamesOrdered{i};
    end

    segments.assignments = segmentAssignments;
    segments.clusterIndices = idx;

    fprintf('=== Market Segmentation Complete ===\n\n');

    % Save results
    if ~exist('analysis_results', 'dir')
        mkdir('analysis_results');
    end
    save('analysis_results/market_segments.mat', 'segments');
    fprintf('   ✓ Results saved to: analysis_results/market_segments.mat\n\n');
end
