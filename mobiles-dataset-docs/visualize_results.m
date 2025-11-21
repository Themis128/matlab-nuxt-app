% Visualize Price Prediction Model Results
% This script creates comprehensive visualizations of model performance,
% predictions, errors, and training results
%
% Usage: run('visualize_results.m')

fprintf('=== Price Prediction Model Visualization ===\n\n');

%% Step 1: Load Data
fprintf('Step 1: Loading model results...\n');

% Load results
resultsPath = 'trained_models/price_prediction_results.mat';
if ~exist(resultsPath, 'file')
    error('Results file not found. Please train the model first using train_price_prediction_model.m');
end

load(resultsPath, 'YPred', 'YTest_original', 'testIdx');

% Try to load evaluation report if available
evalReportPath = 'trained_models/evaluation_report.mat';
if exist(evalReportPath, 'file')
    load(evalReportPath, 'evaluationReport', 'residuals');
    fprintf('   ✓ Evaluation report loaded\n');
else
    residuals = YPred - YTest_original;
    fprintf('   ℹ Evaluation report not found, calculating residuals\n');
end

% Load preprocessed data for additional context if available
preprocessedPath = 'preprocessed/preprocessed_data.mat';
if exist(preprocessedPath, 'file')
    load(preprocessedPath);
    fprintf('   ✓ Preprocessed data loaded for context\n');
end

fprintf('   ✓ Results loaded: %d test samples\n', length(YPred));

%% Step 2: Create Figure Window
fprintf('\nStep 2: Creating visualizations...\n');

% Create a figure with multiple subplots
fig = figure('Position', [100, 100, 1400, 900], 'Name', 'Price Prediction Model Results');

%% Plot 1: Prediction vs Actual (Scatter Plot)
fprintf('   Creating scatter plot: Predictions vs Actual...\n');
subplot(2, 3, 1);
% Use try-catch for Alpha property (not available in older MATLAB versions)
try
    scatter(YTest_original, YPred, 50, 'filled', 'Alpha', 0.6);
catch
    scatter(YTest_original, YPred, 50, 'filled');
end
hold on;

% Perfect prediction line (y = x)
min_price = min([YTest_original; YPred]);
max_price = max([YTest_original; YPred]);
plot([min_price, max_price], [min_price, max_price], 'r--', 'LineWidth', 2);

% Calculate and display R²
r2 = 1 - sum((YTest_original - YPred).^2) / sum((YTest_original - mean(YTest_original)).^2);
rmse = sqrt(mean((YPred - YTest_original).^2));

xlabel('Actual Price ($)', 'FontSize', 11, 'FontWeight', 'bold');
ylabel('Predicted Price ($)', 'FontSize', 11, 'FontWeight', 'bold');
title(sprintf('Predictions vs Actual\nR² = %.4f, RMSE = $%.0f', r2, rmse), ...
    'FontSize', 12, 'FontWeight', 'bold');
grid on;
axis equal;
xlim([min_price, max_price]);
ylim([min_price, max_price]);
legend('Predictions', 'Perfect Prediction', 'Location', 'northwest');

%% Plot 2: Residuals Plot
fprintf('   Creating residuals plot...\n');
subplot(2, 3, 2);
% Use try-catch for Alpha property (not available in older MATLAB versions)
try
    scatter(YTest_original, residuals, 50, 'filled', 'Alpha', 0.6);
catch
    scatter(YTest_original, residuals, 50, 'filled');
end
hold on;
plot([min(YTest_original), max(YTest_original)], [0, 0], 'r--', 'LineWidth', 2);

xlabel('Actual Price ($)', 'FontSize', 11, 'FontWeight', 'bold');
ylabel('Residual (Predicted - Actual) ($)', 'FontSize', 11, 'FontWeight', 'bold');
title('Residuals Plot', 'FontSize', 12, 'FontWeight', 'bold');
grid on;

% Add mean residual line
mean_residual = mean(residuals);
plot([min(YTest_original), max(YTest_original)], [mean_residual, mean_residual], ...
    'g--', 'LineWidth', 1.5);
legend('Residuals', 'Zero Line', sprintf('Mean: $%.0f', mean_residual), ...
    'Location', 'best');

%% Plot 3: Error Distribution (Histogram)
fprintf('   Creating error distribution histogram...\n');
subplot(2, 3, 3);
absolute_errors = abs(residuals);
histogram(absolute_errors, 30, 'FaceColor', [0.3, 0.6, 0.9], 'EdgeColor', 'black');
hold on;

% Add mean and median lines
mean_ae = mean(absolute_errors);
median_ae = median(absolute_errors);
xline(mean_ae, 'r--', 'LineWidth', 2, 'DisplayName', sprintf('Mean: $%.0f', mean_ae));
xline(median_ae, 'g--', 'LineWidth', 2, 'DisplayName', sprintf('Median: $%.0f', median_ae));

xlabel('Absolute Error ($)', 'FontSize', 11, 'FontWeight', 'bold');
ylabel('Frequency', 'FontSize', 11, 'FontWeight', 'bold');
title('Error Distribution', 'FontSize', 12, 'FontWeight', 'bold');
grid on;
legend('Location', 'northeast');

%% Plot 4: Percentage Error Distribution
fprintf('   Creating percentage error distribution...\n');
subplot(2, 3, 4);
percentage_errors = abs(residuals) ./ YTest_original * 100;
histogram(percentage_errors, 30, 'FaceColor', [0.9, 0.6, 0.3], 'EdgeColor', 'black');
hold on;

mean_pe = mean(percentage_errors);
median_pe = median(percentage_errors);
xline(mean_pe, 'r--', 'LineWidth', 2, 'DisplayName', sprintf('Mean: %.1f%%', mean_pe));
xline(median_pe, 'g--', 'LineWidth', 2, 'DisplayName', sprintf('Median: %.1f%%', median_pe));

xlabel('Percentage Error (%)', 'FontSize', 11, 'FontWeight', 'bold');
ylabel('Frequency', 'FontSize', 11, 'FontWeight', 'bold');
title('Percentage Error Distribution', 'FontSize', 12, 'FontWeight', 'bold');
grid on;
legend('Location', 'northeast');

%% Plot 5: Error by Price Range
fprintf('   Creating error by price range plot...\n');
subplot(2, 3, 5);

% Define price ranges
price_ranges = [0, 200, 500, 1000, 2000, inf];
range_labels = {'$0-$200', '$200-$500', '$500-$1000', '$1000-$2000', '$2000+'};
range_mae = zeros(length(price_ranges)-1, 1);
range_samples = zeros(length(price_ranges)-1, 1);

for i = 1:length(price_ranges)-1
    range_mask = YTest_original >= price_ranges(i) & YTest_original < price_ranges(i+1);
    if sum(range_mask) > 0
        range_errors = absolute_errors(range_mask);
        range_mae(i) = mean(range_errors);
        range_samples(i) = sum(range_mask);
    end
end

% Create bar plot
valid_ranges = range_samples > 0;
bar(range_mae(valid_ranges), 'FaceColor', [0.5, 0.7, 0.9]);
hold on;

% Add sample count labels
for i = 1:length(range_mae)
    if valid_ranges(i)
        text(i, range_mae(i) + max(range_mae) * 0.05, ...
            sprintf('n=%d', range_samples(i)), ...
            'HorizontalAlignment', 'center', 'FontSize', 9);
    end
end

set(gca, 'XTickLabel', range_labels(valid_ranges));
xlabel('Price Range', 'FontSize', 11, 'FontWeight', 'bold');
ylabel('Mean Absolute Error ($)', 'FontSize', 11, 'FontWeight', 'bold');
title('Error by Price Range', 'FontSize', 12, 'FontWeight', 'bold');
grid on;
xtickangle(45);

%% Plot 6: Q-Q Plot for Residuals (Normality Check)
fprintf('   Creating Q-Q plot for residuals...\n');
subplot(2, 3, 6);
qqplot(residuals);
xlabel('Theoretical Quantiles', 'FontSize', 11, 'FontWeight', 'bold');
ylabel('Sample Quantiles', 'FontSize', 11, 'FontWeight', 'bold');
title('Q-Q Plot (Residual Normality Check)', 'FontSize', 12, 'FontWeight', 'bold');
grid on;

%% Step 3: Create Additional Detailed Figures
fprintf('\nStep 3: Creating additional detailed visualizations...\n');

% Figure 2: Time Series of Predictions (if testIdx is ordered)
fig2 = figure('Position', [200, 200, 1200, 600], 'Name', 'Detailed Prediction Analysis');

% Plot predictions in order
subplot(1, 2, 1);
plot(1:length(YPred), YTest_original, 'b-o', 'MarkerSize', 4, 'LineWidth', 1.5, ...
    'DisplayName', 'Actual');
hold on;
plot(1:length(YPred), YPred, 'r-s', 'MarkerSize', 4, 'LineWidth', 1.5, ...
    'DisplayName', 'Predicted');
xlabel('Sample Index', 'FontSize', 11, 'FontWeight', 'bold');
ylabel('Price ($)', 'FontSize', 11, 'FontWeight', 'bold');
title('Actual vs Predicted Prices (All Test Samples)', 'FontSize', 12, 'FontWeight', 'bold');
legend('Location', 'best');
grid on;

% Error over samples
subplot(1, 2, 2);
plot(1:length(YPred), absolute_errors, 'k-', 'LineWidth', 1.5);
hold on;
plot([1, length(YPred)], [mean_ae, mean_ae], 'r--', 'LineWidth', 2, ...
    'DisplayName', sprintf('Mean: $%.0f', mean_ae));
xlabel('Sample Index', 'FontSize', 11, 'FontWeight', 'bold');
ylabel('Absolute Error ($)', 'FontSize', 11, 'FontWeight', 'bold');
title('Prediction Errors Over Test Samples', 'FontSize', 12, 'FontWeight', 'bold');
legend('Location', 'best');
grid on;

%% Step 4: Save Figures
fprintf('\nStep 4: Saving figures...\n');

% Create directory for saved figures
if ~exist('trained_models/figures', 'dir')
    mkdir('trained_models/figures');
end

% Save main figure
saveas(fig, 'trained_models/figures/model_results_main.png', 'png');
fprintf('   ✓ Main results figure saved\n');

% Save detailed figure
saveas(fig2, 'trained_models/figures/model_results_detailed.png', 'png');
fprintf('   ✓ Detailed analysis figure saved\n');

% Optionally save as .fig files for MATLAB editing
savefig(fig, 'trained_models/figures/model_results_main.fig');
savefig(fig2, 'trained_models/figures/model_results_detailed.fig');
fprintf('   ✓ Figures saved as .fig files for editing\n');

%% Step 5: Summary Statistics Display
fprintf('\nStep 5: Summary Statistics\n');
fprintf('========================================\n');

fprintf('\nOverall Performance:\n');
fprintf('  R² Score:              %.4f\n', r2);
fprintf('  RMSE:                  $%.2f\n', rmse);
fprintf('  MAE:                   $%.2f\n', mean_ae);
fprintf('  Median Absolute Error: $%.2f\n', median_ae);
fprintf('  Mean Percentage Error: %.2f%%\n', mean_pe);
fprintf('  Median Percentage Error: %.2f%%\n', median_pe);

% Calculate accuracy thresholds
error_5pct = sum(percentage_errors <= 5) / length(percentage_errors) * 100;
error_10pct = sum(percentage_errors <= 10) / length(percentage_errors) * 100;
error_20pct = sum(percentage_errors <= 20) / length(percentage_errors) * 100;

fprintf('\nPrediction Accuracy:\n');
fprintf('  Within 5%% error:       %.1f%% of predictions\n', error_5pct);
fprintf('  Within 10%% error:      %.1f%% of predictions\n', error_10pct);
fprintf('  Within 20%% error:      %.1f%% of predictions\n', error_20pct);

fprintf('\nError Statistics:\n');
fprintf('  Min Error:             $%.2f\n', min(absolute_errors));
fprintf('  Max Error:             $%.2f\n', max(absolute_errors));
fprintf('  Std Dev of Errors:     $%.2f\n', std(absolute_errors));

%% Summary
fprintf('\n========================================\n');
fprintf('Visualization Complete\n');
fprintf('========================================\n\n');

fprintf('Figures created:\n');
fprintf('  1. Main results figure (6 subplots)\n');
fprintf('  2. Detailed analysis figure (2 subplots)\n');
fprintf('\nFigures saved to: trained_models/figures/\n');
fprintf('  - model_results_main.png\n');
fprintf('  - model_results_main.fig\n');
fprintf('  - model_results_detailed.png\n');
fprintf('  - model_results_detailed.fig\n\n');

fprintf('Next steps:\n');
fprintf('  1. Review the generated figures\n');
fprintf('  2. Analyze error patterns by price range\n');
fprintf('  3. Check residual distribution for normality\n');
fprintf('  4. Consider model improvements if needed\n\n');
