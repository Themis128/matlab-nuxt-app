% Visualize New Features
% Creates comprehensive visualizations for camera prediction, similar phones, and market segments
% Usage: run('visualize_new_features.m')
%
% This script generates screenshots-ready visualizations

fprintf('=== Generating Visualizations for New Features ===\n\n');

% Create output directory
outputDir = 'visualizations';
if ~exist(outputDir, 'dir')
    mkdir(outputDir);
end

%% 1. Camera Prediction Visualizations
fprintf('1. Creating camera prediction visualizations...\n');

if exist('trained_models/front_camera_prediction_results.mat', 'file') && ...
   exist('trained_models/back_camera_prediction_results.mat', 'file')

    % Load results
    load('trained_models/front_camera_prediction_results.mat');
    frontResults = struct('YPred', YPred, 'YTest', YTest_original, 'r2', r2, 'rmse', rmse);

    load('trained_models/back_camera_prediction_results.mat');
    backResults = struct('YPred', YPred, 'YTest', YTest_original, 'r2', r2, 'rmse', rmse);

    % Create combined camera prediction plot
    figure('Position', [100, 100, 1200, 500], 'Color', 'white');

    % Front Camera
    subplot(1, 2, 1);
    scatter(frontResults.YTest, frontResults.YPred, 50, 'filled', 'MarkerFaceAlpha', 0.6);
    hold on;
    plot([min(frontResults.YTest), max(frontResults.YTest)], ...
         [min(frontResults.YTest), max(frontResults.YTest)], 'r--', 'LineWidth', 2);
    xlabel('Actual Front Camera (MP)', 'FontSize', 12, 'FontWeight', 'bold');
    ylabel('Predicted Front Camera (MP)', 'FontSize', 12, 'FontWeight', 'bold');
    title(sprintf('Front Camera Prediction\nR² = %.4f, RMSE = %.2f MP', ...
        frontResults.r2, frontResults.rmse), 'FontSize', 13, 'FontWeight', 'bold');
    grid on;
    legend('Predictions', 'Perfect Prediction', 'Location', 'northwest');

    % Back Camera
    subplot(1, 2, 2);
    scatter(backResults.YTest, backResults.YPred, 50, 'filled', 'MarkerFaceAlpha', 0.6);
    hold on;
    plot([min(backResults.YTest), max(backResults.YTest)], ...
         [min(backResults.YTest), max(backResults.YTest)], 'r--', 'LineWidth', 2);
    xlabel('Actual Back Camera (MP)', 'FontSize', 12, 'FontWeight', 'bold');
    ylabel('Predicted Back Camera (MP)', 'FontSize', 12, 'FontWeight', 'bold');
    title(sprintf('Back Camera Prediction\nR² = %.4f, RMSE = %.2f MP', ...
        backResults.r2, backResults.rmse), 'FontSize', 13, 'FontWeight', 'bold');
    grid on;
    legend('Predictions', 'Perfect Prediction', 'Location', 'northwest');

    sgtitle('Camera Prediction Models Performance', 'FontSize', 16, 'FontWeight', 'bold');

    filename = fullfile(outputDir, 'camera_prediction_performance.png');
    saveas(gcf, filename);
    fprintf('   ✓ Saved: camera_prediction_performance.png\n');
    close(gcf);
else
    fprintf('   ⚠ Camera prediction results not found. Train models first.\n');
end

%% 2. Market Segmentation Visualization
fprintf('\n2. Creating market segmentation visualization...\n');

if exist('analysis_results/market_segments.mat', 'file')
    load('analysis_results/market_segments.mat');
    load('preprocessed/preprocessed_data.mat');

    % Create segmentation plot
    figure('Position', [100, 100, 1400, 600], 'Color', 'white');

    % Price vs RAM colored by segment
    subplot(1, 2, 1);
    colors = {'#FF6B6B', '#4ECDC4', '#45B7D1'};  % Budget, Mid-range, Premium
    segmentNames = {'Budget', 'Mid-Range', 'Premium'};

    for i = 1:length(segmentNames)
        segName = segmentNames{i};
        if isfield(segments, segName)
            idx = segments.(segName).indices;
            scatter(priceUSD_clean(idx), ram_clean(idx), 80, colors{i}, ...
                'filled', 'MarkerFaceAlpha', 0.6, 'DisplayName', segName);
            hold on;
        end
    end
    xlabel('Price (USD)', 'FontSize', 12, 'FontWeight', 'bold');
    ylabel('RAM (GB)', 'FontSize', 12, 'FontWeight', 'bold');
    title('Market Segmentation: Price vs RAM', 'FontSize', 13, 'FontWeight', 'bold');
    legend('Location', 'northwest');
    grid on;

    % Segment distribution pie chart
    subplot(1, 2, 2);
    segmentCounts = [segments.Budget.count, segments.('Mid-Range').count, segments.Premium.count];
    pie(segmentCounts, segmentNames);
    title('Market Segment Distribution', 'FontSize', 13, 'FontWeight', 'bold');
    colormap([hex2rgb(colors{1}); hex2rgb(colors{2}); hex2rgb(colors{3})]);

    sgtitle('Market Segmentation Analysis', 'FontSize', 16, 'FontWeight', 'bold');

    filename = fullfile(outputDir, 'market_segmentation.png');
    saveas(gcf, filename);
    fprintf('   ✓ Saved: market_segmentation.png\n');
    close(gcf);

    % Segment characteristics bar chart
    figure('Position', [100, 100, 1400, 500], 'Color', 'white');

    segmentData = [
        segments.Budget.avgPrice, segments.('Mid-Range').avgPrice, segments.Premium.avgPrice;
        segments.Budget.avgRAM, segments.('Mid-Range').avgRAM, segments.Premium.avgRAM;
        segments.Budget.avgBattery, segments.('Mid-Range').avgBattery, segments.Premium.avgBattery;
        segments.Budget.avgScreen, segments.('Mid-Range').avgScreen, segments.Premium.avgScreen
    ];

    % Normalize for comparison (0-1 scale)
    segmentDataNorm = zeros(size(segmentData));
    for i = 1:size(segmentData, 1)
        segmentDataNorm(i, :) = (segmentData(i, :) - min(segmentData(i, :))) / ...
                                (max(segmentData(i, :)) - min(segmentData(i, :)) + eps);
    end

    bar(segmentDataNorm', 'grouped');
    set(gca, 'XTickLabel', segmentNames);
    ylabel('Normalized Value', 'FontSize', 12, 'FontWeight', 'bold');
    title('Segment Characteristics Comparison', 'FontSize', 13, 'FontWeight', 'bold');
    legend('Price', 'RAM', 'Battery', 'Screen Size', 'Location', 'best');
    grid on;

    filename = fullfile(outputDir, 'segment_characteristics.png');
    saveas(gcf, filename);
    fprintf('   ✓ Saved: segment_characteristics.png\n');
    close(gcf);
else
    fprintf('   ⚠ Market segmentation results not found. Run analyze_market_segments.m first.\n');
end

%% 3. Feature Comparison Dashboard
fprintf('\n3. Creating feature comparison dashboard...\n');

if exist('preprocessed/preprocessed_data.mat', 'file')
    load('preprocessed/preprocessed_data.mat');

    figure('Position', [100, 100, 1600, 800], 'Color', 'white');

    % Price distribution
    subplot(2, 3, 1);
    histogram(priceUSD_clean, 30, 'FaceColor', '#4ECDC4', 'EdgeColor', 'black');
    xlabel('Price (USD)', 'FontSize', 11, 'FontWeight', 'bold');
    ylabel('Frequency', 'FontSize', 11, 'FontWeight', 'bold');
    title('Price Distribution', 'FontSize', 12, 'FontWeight', 'bold');
    grid on;

    % RAM distribution
    subplot(2, 3, 2);
    histogram(ram_clean, 15, 'FaceColor', '#45B7D1', 'EdgeColor', 'black');
    xlabel('RAM (GB)', 'FontSize', 11, 'FontWeight', 'bold');
    ylabel('Frequency', 'FontSize', 11, 'FontWeight', 'bold');
    title('RAM Distribution', 'FontSize', 12, 'FontWeight', 'bold');
    grid on;

    % Battery distribution
    subplot(2, 3, 3);
    histogram(battery_clean, 30, 'FaceColor', '#FF6B6B', 'EdgeColor', 'black');
    xlabel('Battery (mAh)', 'FontSize', 11, 'FontWeight', 'bold');
    ylabel('Frequency', 'FontSize', 11, 'FontWeight', 'bold');
    title('Battery Distribution', 'FontSize', 12, 'FontWeight', 'bold');
    grid on;

    % Price vs Year
    subplot(2, 3, 4);
    scatter(year_clean, priceUSD_clean, 30, 'filled', 'MarkerFaceAlpha', 0.5);
    xlabel('Year', 'FontSize', 11, 'FontWeight', 'bold');
    ylabel('Price (USD)', 'FontSize', 11, 'FontWeight', 'bold');
    title('Price Trends Over Time', 'FontSize', 12, 'FontWeight', 'bold');
    grid on;

    % RAM vs Battery
    subplot(2, 3, 5);
    scatter(ram_clean, battery_clean, 30, priceUSD_clean, 'filled', 'MarkerFaceAlpha', 0.6);
    colorbar;
    xlabel('RAM (GB)', 'FontSize', 11, 'FontWeight', 'bold');
    ylabel('Battery (mAh)', 'FontSize', 11, 'FontWeight', 'bold');
    title('RAM vs Battery (colored by Price)', 'FontSize', 12, 'FontWeight', 'bold');
    grid on;

    % Brand distribution
    subplot(2, 3, 6);
    [uniqueCompanies, ~, companyIdx] = unique(companies_clean);
    companyCounts = accumarray(companyIdx, 1);
    [sortedCounts, sortIdx] = sort(companyCounts, 'descend');
    top10Idx = sortIdx(1:min(10, length(sortIdx)));
    barh(sortedCounts(top10Idx));
    set(gca, 'YTickLabel', string(uniqueCompanies(top10Idx)));
    xlabel('Number of Phones', 'FontSize', 11, 'FontWeight', 'bold');
    title('Top 10 Brands', 'FontSize', 12, 'FontWeight', 'bold');
    grid on;

    sgtitle('Mobile Phones Dataset Overview', 'FontSize', 16, 'FontWeight', 'bold');

    filename = fullfile(outputDir, 'dataset_overview.png');
    saveas(gcf, filename);
    fprintf('   ✓ Saved: dataset_overview.png\n');
    close(gcf);
end

%% 4. Model Performance Comparison
fprintf('\n4. Creating model performance comparison...\n');

% Collect all model performances
modelNames = {};
r2Scores = [];
rmseScores = [];

% Price model
if exist('trained_models/price_prediction_results.mat', 'file')
    load('trained_models/price_prediction_results.mat');
    modelNames{end+1} = 'Price';
    r2Scores(end+1) = r2;
    rmseScores(end+1) = rmse;
end

% RAM model
if exist('trained_models/ram_prediction_results.mat', 'file')
    load('trained_models/ram_prediction_results.mat');
    modelNames{end+1} = 'RAM';
    r2Scores(end+1) = r2;
    rmseScores(end+1) = rmse;
end

% Battery model
if exist('trained_models/battery_prediction_results.mat', 'file')
    load('trained_models/battery_prediction_results.mat');
    modelNames{end+1} = 'Battery';
    r2Scores(end+1) = r2;
    rmseScores(end+1) = rmse;
end

% Front Camera model
if exist('trained_models/front_camera_prediction_results.mat', 'file')
    load('trained_models/front_camera_prediction_results.mat');
    modelNames{end+1} = 'Front Camera';
    r2Scores(end+1) = r2;
    rmseScores(end+1) = rmse;
end

% Back Camera model
if exist('trained_models/back_camera_prediction_results.mat', 'file')
    load('trained_models/back_camera_prediction_results.mat');
    modelNames{end+1} = 'Back Camera';
    r2Scores(end+1) = r2;
    rmseScores(end+1) = rmse;
end

if ~isempty(modelNames)
    figure('Position', [100, 100, 1400, 600], 'Color', 'white');

    % R² scores
    subplot(1, 2, 1);
    bar(r2Scores, 'FaceColor', '#4ECDC4', 'EdgeColor', 'black');
    set(gca, 'XTickLabel', modelNames);
    ylabel('R² Score', 'FontSize', 12, 'FontWeight', 'bold');
    title('Model Performance (R²)', 'FontSize', 13, 'FontWeight', 'bold');
    ylim([0, 1]);
    grid on;
    for i = 1:length(r2Scores)
        text(i, r2Scores(i) + 0.02, sprintf('%.3f', r2Scores(i)), ...
            'HorizontalAlignment', 'center', 'FontWeight', 'bold');
    end

    % RMSE scores (normalized for comparison)
    subplot(1, 2, 2);
    % Normalize RMSE to 0-1 scale for comparison
    rmseNorm = 1 - (rmseScores - min(rmseScores)) / (max(rmseScores) - min(rmseScores) + eps);
    bar(rmseNorm, 'FaceColor', '#FF6B6B', 'EdgeColor', 'black');
    set(gca, 'XTickLabel', modelNames);
    ylabel('Normalized RMSE (lower is better)', 'FontSize', 12, 'FontWeight', 'bold');
    title('Model Performance (RMSE - Normalized)', 'FontSize', 13, 'FontWeight', 'bold');
    ylim([0, 1]);
    grid on;

    sgtitle('All Models Performance Comparison', 'FontSize', 16, 'FontWeight', 'bold');

    filename = fullfile(outputDir, 'model_performance_comparison.png');
    saveas(gcf, filename);
    fprintf('   ✓ Saved: model_performance_comparison.png\n');
    close(gcf);
end

fprintf('\n=== Visualization Complete ===\n');
fprintf('All visualizations saved to: %s/\n\n', outputDir);

% Helper function for hex to RGB conversion
function rgb = hex2rgb(hex)
    hex = strrep(hex, '#', '');
    rgb = [hex2dec(hex(1:2)), hex2dec(hex(3:4)), hex2dec(hex(5:6))] / 255;
end
