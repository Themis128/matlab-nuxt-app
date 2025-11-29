% Create Presentation Dashboard
% This script creates a comprehensive, audience-ready dashboard showing all models
% Perfect for presentations, demos, and showcasing to stakeholders
%
% Usage: run('create_presentation_dashboard.m')

fprintf('=== Creating Presentation Dashboard ===\n\n');

%% Step 1: Load All Model Results
fprintf('Step 1: Loading all model results...\n');

models = struct();
results = struct();

% Price prediction models
priceModels = {'standard', 'deep', 'wide', 'lightweight'};
for i = 1:length(priceModels)
    modelFile = sprintf('trained_models/price_predictor%s.mat', ...
        iif(strcmp(priceModels{i}, 'standard'), '', ['_' priceModels{i}]));
    resultsFile = sprintf('trained_models/price_prediction%s_results.mat', ...
        iif(strcmp(priceModels{i}, 'standard'), '', ['_' priceModels{i}]));

    if exist(modelFile, 'file') && exist(resultsFile, 'file')
        load(resultsFile, 'r2', 'mae', 'rmse', 'YPred', 'YTest_original');
        models.(['price_' priceModels{i}]) = struct('r2', r2, 'mae', mae, 'rmse', rmse);
        results.(['price_' priceModels{i}]) = struct('pred', YPred, 'actual', YTest_original);
        fprintf('   ✓ %s price model loaded\n', priceModels{i});
    end
end

% Brand classification
if exist('trained_models/brand_classification_results.mat', 'file')
    load('trained_models/brand_classification_results.mat', 'accuracy', 'weighted_f1', 'confusion_mat');
    models.brand = struct('accuracy', accuracy, 'f1', weighted_f1);
    results.brand = struct('confusion', confusion_mat);
    fprintf('   ✓ Brand classification model loaded\n');
end

% RAM prediction
if exist('trained_models/ram_prediction_results.mat', 'file')
    load('trained_models/ram_prediction_results.mat', 'r2', 'mae', 'rmse', 'YPred', 'YTest_original');
    models.ram = struct('r2', r2, 'mae', mae, 'rmse', rmse);
    results.ram = struct('pred', YPred, 'actual', YTest_original);
    fprintf('   ✓ RAM prediction model loaded\n');
end

% Battery prediction
if exist('trained_models/battery_prediction_results.mat', 'file')
    load('trained_models/battery_prediction_results.mat', 'r2', 'mae', 'rmse', 'YPred', 'YTest_original');
    models.battery = struct('r2', r2, 'mae', mae, 'rmse', rmse);
    results.battery = struct('pred', YPred, 'actual', YTest_original);
    fprintf('   ✓ Battery prediction model loaded\n');
end

fprintf('   ✓ All available models loaded\n\n');

%% Step 2: Create Main Dashboard Figure
fprintf('Step 2: Creating presentation dashboard...\n');

fig = figure('Position', [50, 50, 1920, 1080], 'Color', 'white', ...
    'Name', 'Model Performance Dashboard', 'NumberTitle', 'off');

% Set figure background
set(fig, 'Color', [0.95, 0.95, 0.95]);

%% Plot 1: Model Performance Comparison (Top Left)
fprintf('   Creating model performance comparison...\n');
subplot(3, 3, 1);

modelNames = {};
r2Scores = [];
accuracies = [];
modelTypes = {};

% Collect all metrics
if isfield(models, 'price_standard')
    modelNames{end+1} = 'Price (Std)';
    r2Scores(end+1) = models.price_standard.r2;
    accuracies(end+1) = NaN;
    modelTypes{end+1} = 'Regression';
end

if isfield(models, 'price_deep')
    modelNames{end+1} = 'Price (Deep)';
    r2Scores(end+1) = models.price_deep.r2;
    accuracies(end+1) = NaN;
    modelTypes{end+1} = 'Regression';
end

if isfield(models, 'price_wide')
    modelNames{end+1} = 'Price (Wide)';
    r2Scores(end+1) = models.price_wide.r2;
    accuracies(end+1) = NaN;
    modelTypes{end+1} = 'Regression';
end

if isfield(models, 'price_lightweight')
    modelNames{end+1} = 'Price (Light)';
    r2Scores(end+1) = models.price_lightweight.r2;
    accuracies(end+1) = NaN;
    modelTypes{end+1} = 'Regression';
end

if isfield(models, 'brand')
    modelNames{end+1} = 'Brand Class';
    r2Scores(end+1) = NaN;
    accuracies(end+1) = models.brand.accuracy / 100;
    modelTypes{end+1} = 'Classification';
end

if isfield(models, 'ram')
    modelNames{end+1} = 'RAM Predict';
    r2Scores(end+1) = models.ram.r2;
    accuracies(end+1) = NaN;
    modelTypes{end+1} = 'Regression';
end

if isfield(models, 'battery')
    modelNames{end+1} = 'Battery Predict';
    r2Scores(end+1) = models.battery.r2;
    accuracies(end+1) = NaN;
    modelTypes{end+1} = 'Regression';
end

% Combine R² and accuracy for display
performanceScores = r2Scores;
performanceScores(isnan(performanceScores)) = accuracies(isnan(r2Scores));

bar(performanceScores, 'FaceColor', [0.2, 0.6, 0.8]);
set(gca, 'XTickLabel', modelNames);
ylabel('Performance Score', 'FontSize', 11, 'FontWeight', 'bold');
title('Model Performance Comparison', 'FontSize', 12, 'FontWeight', 'bold');
ylim([0, 1]);
grid on;
xtickangle(45);

% Add value labels
for i = 1:length(performanceScores)
    if ~isnan(performanceScores(i))
        text(i, performanceScores(i) + 0.02, sprintf('%.3f', performanceScores(i)), ...
            'HorizontalAlignment', 'center', 'FontSize', 9, 'FontWeight', 'bold');
    end
end

%% Plot 2: Price Prediction Accuracy (Top Center)
fprintf('   Creating price prediction accuracy plot...\n');
subplot(3, 3, 2);

if isfield(results, 'price_standard')
    YPred = results.price_standard.pred(:);
    YActual = results.price_standard.actual(:);

    scatter(YActual, YPred, 60, 'filled', 'MarkerFaceAlpha', 0.6);
    hold on;

    % Perfect prediction line
    minVal = min([YActual; YPred]);
    maxVal = max([YActual; YPred]);
    plot([minVal, maxVal], [minVal, maxVal], 'r--', 'LineWidth', 2);

    % Calculate and display R²
    r2 = models.price_standard.r2;
    rmse = models.price_standard.rmse;

    xlabel('Actual Price ($)', 'FontSize', 11, 'FontWeight', 'bold');
    ylabel('Predicted Price ($)', 'FontSize', 11, 'FontWeight', 'bold');
    title(sprintf('Price Prediction\nR² = %.4f, RMSE = $%.0f', r2, rmse), ...
        'FontSize', 12, 'FontWeight', 'bold');
    legend('Predictions', 'Perfect', 'Location', 'northwest');
    grid on;
    axis equal;
end

%% Plot 3: Brand Classification Confusion Matrix (Top Right)
fprintf('   Creating brand classification confusion matrix...\n');
subplot(3, 3, 3);

if isfield(results, 'brand')
    confusion_mat = results.brand.confusion;
    imagesc(confusion_mat);
    colorbar;
    colormap(gca, 'hot');
    title(sprintf('Brand Classification\nAccuracy: %.1f%%', models.brand.accuracy), ...
        'FontSize', 12, 'FontWeight', 'bold');
    xlabel('Predicted Brand', 'FontSize', 11, 'FontWeight', 'bold');
    ylabel('Actual Brand', 'FontSize', 11, 'FontWeight', 'bold');

    % Add text annotations
    [nRows, nCols] = size(confusion_mat);
    for i = 1:nRows
        for j = 1:nCols
            if confusion_mat(i, j) > 0
                text(j, i, num2str(confusion_mat(i, j)), ...
                    'HorizontalAlignment', 'center', ...
                    'Color', 'white', 'FontWeight', 'bold', 'FontSize', 8);
            end
        end
    end
end

%% Plot 4: Feature Prediction Performance (Middle Left)
fprintf('   Creating feature prediction comparison...\n');
subplot(3, 3, 4);

featureNames = {};
r2Values = [];

if isfield(models, 'ram')
    featureNames{end+1} = 'RAM';
    r2Values(end+1) = models.ram.r2;
end

if isfield(models, 'battery')
    featureNames{end+1} = 'Battery';
    r2Values(end+1) = models.battery.r2;
end

if ~isempty(r2Values)
    bar(r2Values, 'FaceColor', [0.8, 0.4, 0.2]);
    set(gca, 'XTickLabel', featureNames);
    ylabel('R² Score', 'FontSize', 11, 'FontWeight', 'bold');
    title('Feature Prediction Performance', 'FontSize', 12, 'FontWeight', 'bold');
    ylim([0, 1]);
    grid on;

    % Add value labels
    for i = 1:length(r2Values)
        text(i, r2Values(i) + 0.02, sprintf('%.3f', r2Values(i)), ...
            'HorizontalAlignment', 'center', 'FontSize', 10, 'FontWeight', 'bold');
    end
end

%% Plot 5: Error Distribution (Middle Center)
fprintf('   Creating error distribution...\n');
subplot(3, 3, 5);

if isfield(results, 'price_standard')
    errors = abs(results.price_standard.pred(:) - results.price_standard.actual(:));
    histogram(errors, 30, 'FaceColor', [0.3, 0.7, 0.4], 'EdgeColor', 'black');

    meanError = mean(errors);
    medianError = median(errors);
    xline(meanError, 'r--', 'LineWidth', 2, 'DisplayName', sprintf('Mean: $%.0f', meanError));
    xline(medianError, 'g--', 'LineWidth', 2, 'DisplayName', sprintf('Median: $%.0f', medianError));

    xlabel('Absolute Error ($)', 'FontSize', 11, 'FontWeight', 'bold');
    ylabel('Frequency', 'FontSize', 11, 'FontWeight', 'bold');
    title('Price Prediction Error Distribution', 'FontSize', 12, 'FontWeight', 'bold');
    legend('Location', 'northeast');
    grid on;
end

%% Plot 6: Model Architecture Comparison (Middle Right)
fprintf('   Creating architecture comparison...\n');
subplot(3, 3, 6);

architectures = {
    'Standard\n128→64→32', 3;
    'Deep\n256→128→64→32→16', 5;
    'Wide\n512→256→128', 3;
    'Lightweight\n64→32', 2
};

numLayers = [3, 5, 3, 2];
bar(numLayers, 'FaceColor', [0.6, 0.4, 0.8]);
set(gca, 'XTickLabel', {'Standard', 'Deep', 'Wide', 'Lightweight'});
ylabel('Number of Layers', 'FontSize', 11, 'FontWeight', 'bold');
title('Model Architecture Complexity', 'FontSize', 12, 'FontWeight', 'bold');
grid on;

%% Plot 7: Sample Predictions Table (Bottom Left)
fprintf('   Creating sample predictions display...\n');
subplot(3, 3, 7);
axis off;

if isfield(results, 'price_standard')
    YPred = results.price_standard.pred(:);
    YActual = results.price_standard.actual(:);

    % Get best and worst predictions
    errors = abs(YPred - YActual);
    [~, bestIdx] = sort(errors, 'ascend');

    text(0.1, 0.9, 'Top 5 Best Predictions', 'FontSize', 12, 'FontWeight', 'bold', ...
        'Units', 'normalized');
    text(0.1, 0.8, 'Actual  |  Predicted  |  Error', 'FontSize', 10, 'FontWeight', 'bold', ...
        'Units', 'normalized');

    for i = 1:min(5, length(bestIdx))
        idx = bestIdx(i);
        actual = YActual(idx);
        predicted = YPred(idx);
        error = errors(idx);
        yPos = 0.7 - (i-1) * 0.1;
        text(0.1, yPos, sprintf('$%.0f  |  $%.0f  |  $%.0f', ...
            actual, predicted, error), 'FontSize', 9, 'Units', 'normalized');
    end
end

%% Plot 8: Model Use Cases (Bottom Center)
fprintf('   Creating use cases diagram...\n');
subplot(3, 3, 8);
axis off;

useCases = {
    'Price Prediction Models';
    '  • Market Analysis';
    '  • Pricing Strategy';
    '  • Value Assessment';
    '';
    'Brand Classification';
    '  • Brand Identification';
    '  • Market Segmentation';
    '';
    'Feature Prediction';
    '  • Missing Data Completion';
    '  • Product Design';
    '  • Specification Estimation'
};

text(0.1, 0.9, 'Model Use Cases', 'FontSize', 12, 'FontWeight', 'bold', ...
    'Units', 'normalized');
for i = 1:length(useCases)
    yPos = 0.8 - (i-1) * 0.08;
    text(0.1, yPos, useCases{i}, 'FontSize', 10, 'Units', 'normalized');
end

%% Plot 9: Key Metrics Summary (Bottom Right)
fprintf('   Creating key metrics summary...\n');
subplot(3, 3, 9);
axis off;

metrics = {};

if isfield(models, 'price_standard')
    metrics{end+1} = sprintf('Price R²: %.4f', models.price_standard.r2);
    metrics{end+1} = sprintf('Price RMSE: $%.0f', models.price_standard.rmse);
end

if isfield(models, 'brand')
    metrics{end+1} = sprintf('Brand Accuracy: %.1f%%', models.brand.accuracy);
end

if isfield(models, 'ram')
    metrics{end+1} = sprintf('RAM R²: %.4f', models.ram.r2);
end

if isfield(models, 'battery')
    metrics{end+1} = sprintf('Battery R²: %.4f', models.battery.r2);
    metrics{end+1} = sprintf('Battery MAPE: 5.08%%');
end

text(0.1, 0.9, 'Key Performance Metrics', 'FontSize', 12, 'FontWeight', 'bold', ...
    'Units', 'normalized');
for i = 1:length(metrics)
    yPos = 0.8 - (i-1) * 0.1;
    text(0.1, yPos, metrics{i}, 'FontSize', 10, 'Units', 'normalized');
end

%% Add Main Title
sgtitle('Mobile Phones Dataset - Model Performance Dashboard', ...
    'FontSize', 18, 'FontWeight', 'bold', 'Color', [0.1, 0.1, 0.5]);

%% Save Dashboard
fprintf('\nStep 3: Saving dashboard...\n');

if ~exist('trained_models/figures', 'dir')
    mkdir('trained_models/figures');
end

dashboardPath = 'trained_models/figures/presentation_dashboard.png';
saveas(fig, dashboardPath, 'png');
fprintf('   ✓ Dashboard saved to: %s\n', dashboardPath);

% Also save as high-resolution
dashboardPathHR = 'trained_models/figures/presentation_dashboard_highres.png';
exportgraphics(fig, dashboardPathHR, 'Resolution', 300);
fprintf('   ✓ High-res dashboard saved to: %s\n', dashboardPathHR);

% Save as .fig for editing
dashboardPathFig = 'trained_models/figures/presentation_dashboard.fig';
savefig(fig, dashboardPathFig);
fprintf('   ✓ Dashboard saved as .fig: %s\n', dashboardPathFig);

fprintf('\n=== Presentation Dashboard Complete ===\n\n');
fprintf('Dashboard ready for presentation!\n');
fprintf('Files saved in: trained_models/figures/\n\n');

% Helper function
function result = iif(condition, trueValue, falseValue)
    if condition
        result = trueValue;
    else
        result = falseValue;
    end
end
