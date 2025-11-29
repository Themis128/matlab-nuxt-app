% Evaluate Price Prediction Model
% This script provides comprehensive evaluation of the trained price prediction model
% including detailed metrics, error analysis, and performance breakdowns
%
% Usage: run('evaluate_model.m')

fprintf('=== Price Prediction Model Evaluation ===\n\n');

%% Step 1: Load Model and Results
fprintf('Step 1: Loading model and results...\n');

% Check if results file exists
resultsPath = 'trained_models/price_prediction_results.mat';
if ~exist(resultsPath, 'file')
    error('Results file not found. Please train the model first using train_price_prediction_model.m');
end

% Load results
load(resultsPath, 'YPred', 'YTest_original', 'testIdx', ...
     'mse', 'mae', 'rmse', 'r2', 'mape');

% Load model for additional predictions if needed
modelPath = 'trained_models/price_predictor.mat';
if exist(modelPath, 'file')
    load(modelPath, 'net', 'normalizationParams', 'uniqueCompanies');
    fprintf('   ✓ Model loaded\n');
end

fprintf('   ✓ Results loaded\n');

% Ensure both are column vectors
YPred = YPred(:);
YTest_original = YTest_original(:);

fprintf('   Test set size: %d samples\n', length(YPred));

%% Step 2: Calculate Comprehensive Metrics
fprintf('\nStep 2: Calculating comprehensive metrics...\n');

% Basic metrics (already calculated, but recalculate for consistency)
% Ensure we're calculating mean across all samples (not per-sample)
mse_calc = mean((YPred - YTest_original).^2, 'all');
mae_calc = mean(abs(YPred - YTest_original), 'all');
rmse_calc = sqrt(mse_calc);

% R-squared
ss_res = sum((YTest_original - YPred).^2);
ss_tot = sum((YTest_original - mean(YTest_original)).^2);
r2_calc = 1 - (ss_res / ss_tot);

% Mean Absolute Percentage Error
mape_calc = mean(abs((YTest_original - YPred) ./ YTest_original), 'all') * 100;

% Additional metrics
errors = abs(YPred - YTest_original);
median_ae = median(errors, 'all');
max_error = max(errors, [], 'all');
min_error = min(errors, [], 'all');

% Percentage of predictions within error thresholds
percentage_errors = abs(YPred - YTest_original) ./ YTest_original;
error_5pct = sum(percentage_errors <= 0.05) / length(YPred) * 100;
error_10pct = sum(percentage_errors <= 0.10) / length(YPred) * 100;
error_20pct = sum(percentage_errors <= 0.20) / length(YPred) * 100;

% Correlation coefficient
correlation = corrcoef(YPred, YTest_original);
corr_coef = correlation(1, 2);

fprintf('   ✓ Metrics calculated\n');

%% Step 3: Display Metrics
fprintf('\nStep 3: Model Performance Metrics\n');
fprintf('========================================\n');

fprintf('\n--- Regression Metrics ---\n');
fprintf('  Mean Squared Error (MSE):        %.2f\n', mse_calc);
fprintf('  Root Mean Squared Error (RMSE):   $%.2f\n', rmse_calc);
fprintf('  Mean Absolute Error (MAE):        $%.2f\n', mae_calc);
fprintf('  Median Absolute Error:            $%.2f\n', median_ae);
fprintf('  R-squared (R²):                  %.4f\n', r2_calc);
fprintf('  Correlation Coefficient:         %.4f\n', corr_coef);
fprintf('  Mean Absolute Percentage Error:   %.2f%%\n', mape_calc);

fprintf('\n--- Error Distribution ---\n');
fprintf('  Minimum Error:                   $%.2f\n', min_error);
fprintf('  Maximum Error:                   $%.2f\n', max_error);
fprintf('  Standard Deviation of Errors:     $%.2f\n', std(YPred - YTest_original, 0, 'all'));

fprintf('\n--- Prediction Accuracy Thresholds ---\n');
fprintf('  Within 5%% error:                 %.1f%% of predictions\n', error_5pct);
fprintf('  Within 10%% error:                %.1f%% of predictions\n', error_10pct);
fprintf('  Within 20%% error:                %.1f%% of predictions\n', error_20pct);

%% Step 4: Error Analysis by Price Range
fprintf('\nStep 4: Error Analysis by Price Range\n');
fprintf('========================================\n');

% Define price ranges
price_ranges = [0, 200, 500, 1000, 2000, inf];
range_labels = {'$0-$200', '$200-$500', '$500-$1000', '$1000-$2000', '$2000+'};

fprintf('\nPrice Range    |  Samples  |  MAE      |  RMSE     |  MAPE\n');
fprintf('---------------|-----------|-----------|-----------|--------\n');

for i = 1:length(price_ranges)-1
    range_mask = YTest_original >= price_ranges(i) & YTest_original < price_ranges(i+1);
    if sum(range_mask) > 0
        range_actual = YTest_original(range_mask);
        range_pred = YPred(range_mask);

        range_mae = mean(abs(range_pred - range_actual));
        range_rmse = sqrt(mean((range_pred - range_actual).^2));
        range_mape = mean(abs((range_actual - range_pred) ./ range_actual)) * 100;

        fprintf('%-13s |  %8d |  $%7.0f |  $%7.0f |  %5.1f%%\n', ...
            range_labels{i}, sum(range_mask), range_mae, range_rmse, range_mape);
    end
end

%% Step 5: Sample Predictions Analysis
fprintf('\nStep 5: Sample Predictions\n');
fprintf('========================================\n');

% Find best and worst predictions (errors already calculated above)
[~, best_idx] = sort(errors(:), 'ascend');
[~, worst_idx] = sort(errors(:), 'descend');

fprintf('\n--- Top 5 Best Predictions ---\n');
fprintf('Actual Price  |  Predicted Price  |  Error     |  Error %%\n');
fprintf('--------------|-------------------|------------|---------\n');
for i = 1:min(5, length(best_idx))
    idx = best_idx(i);
    actual = YTest_original(idx);
    predicted = YPred(idx);
    error_abs = errors(idx);
    error_pct = error_abs / actual * 100;
    fprintf('$%11.0f |  $%16.0f |  $%9.0f |  %6.2f%%\n', ...
        actual, predicted, error_abs, error_pct);
end

fprintf('\n--- Top 5 Worst Predictions ---\n');
fprintf('Actual Price  |  Predicted Price  |  Error     |  Error %%\n');
fprintf('--------------|-------------------|------------|---------\n');
for i = 1:min(5, length(worst_idx))
    idx = worst_idx(i);
    actual = YTest_original(idx);
    predicted = YPred(idx);
    error_abs = errors(idx);
    error_pct = error_abs / actual * 100;
    fprintf('$%11.0f |  $%16.0f |  $%9.0f |  %6.2f%%\n', ...
        actual, predicted, error_abs, error_pct);
end

%% Step 6: Statistical Summary
fprintf('\nStep 6: Statistical Summary\n');
fprintf('========================================\n');

fprintf('\nActual Prices:\n');
fprintf('  Mean:   $%.2f\n', mean(YTest_original));
fprintf('  Median: $%.2f\n', median(YTest_original));
fprintf('  Std:    $%.2f\n', std(YTest_original));
fprintf('  Min:    $%.2f\n', min(YTest_original));
fprintf('  Max:    $%.2f\n', max(YTest_original));

fprintf('\nPredicted Prices:\n');
fprintf('  Mean:   $%.2f\n', mean(YPred));
fprintf('  Median: $%.2f\n', median(YPred));
fprintf('  Std:    $%.2f\n', std(YPred));
fprintf('  Min:    $%.2f\n', min(YPred));
fprintf('  Max:    $%.2f\n', max(YPred));

fprintf('\nErrors (Predicted - Actual):\n');
residuals = YPred - YTest_original;
fprintf('  Mean:   $%.2f\n', mean(residuals));
fprintf('  Median: $%.2f\n', median(residuals));
fprintf('  Std:    $%.2f\n', std(residuals));

%% Step 7: Save Evaluation Report
fprintf('\nStep 7: Saving evaluation report...\n');

evaluationReport = struct();
evaluationReport.metrics = struct();
evaluationReport.metrics.mse = mse_calc;
evaluationReport.metrics.rmse = rmse_calc;
evaluationReport.metrics.mae = mae_calc;
evaluationReport.metrics.median_ae = median_ae;
evaluationReport.metrics.r2 = r2_calc;
evaluationReport.metrics.correlation = corr_coef;
evaluationReport.metrics.mape = mape_calc;
evaluationReport.metrics.error_5pct = error_5pct;
evaluationReport.metrics.error_10pct = error_10pct;
evaluationReport.metrics.error_20pct = error_20pct;
evaluationReport.metrics.max_error = max_error;
evaluationReport.metrics.min_error = min_error;

evaluationReport.price_ranges = struct();
for i = 1:length(price_ranges)-1
    range_mask = YTest_original >= price_ranges(i) & YTest_original < price_ranges(i+1);
    if sum(range_mask) > 0
        range_actual = YTest_original(range_mask);
        range_pred = YPred(range_mask);
        evaluationReport.price_ranges.(sprintf('range_%d', i)) = struct();
        evaluationReport.price_ranges.(sprintf('range_%d', i)).label = range_labels{i};
        evaluationReport.price_ranges.(sprintf('range_%d', i)).samples = sum(range_mask);
        evaluationReport.price_ranges.(sprintf('range_%d', i)).mae = mean(abs(range_pred - range_actual));
        evaluationReport.price_ranges.(sprintf('range_%d', i)).rmse = sqrt(mean((range_pred - range_actual).^2));
        evaluationReport.price_ranges.(sprintf('range_%d', i)).mape = mean(abs((range_actual - range_pred) ./ range_actual)) * 100;
    end
end

evaluationReport.best_predictions = struct();
evaluationReport.worst_predictions = struct();
for i = 1:min(10, length(best_idx))
    idx = best_idx(i);
    evaluationReport.best_predictions.(sprintf('pred_%d', i)) = struct();
    evaluationReport.best_predictions.(sprintf('pred_%d', i)).actual = YTest_original(idx);
    evaluationReport.best_predictions.(sprintf('pred_%d', i)).predicted = YPred(idx);
    evaluationReport.best_predictions.(sprintf('pred_%d', i)).error = errors(idx);
    evaluationReport.best_predictions.(sprintf('pred_%d', i)).error_pct = errors(idx) / YTest_original(idx) * 100;
end

for i = 1:min(10, length(worst_idx))
    idx = worst_idx(i);
    evaluationReport.worst_predictions.(sprintf('pred_%d', i)) = struct();
    evaluationReport.worst_predictions.(sprintf('pred_%d', i)).actual = YTest_original(idx);
    evaluationReport.worst_predictions.(sprintf('pred_%d', i)).predicted = YPred(idx);
    evaluationReport.worst_predictions.(sprintf('pred_%d', i)).error = errors(idx);
    evaluationReport.worst_predictions.(sprintf('pred_%d', i)).error_pct = errors(idx) / YTest_original(idx) * 100;
end

% Save report
reportPath = 'trained_models/evaluation_report.mat';
save(reportPath, 'evaluationReport', 'YPred', 'YTest_original', 'residuals');
fprintf('   ✓ Evaluation report saved to: %s\n', reportPath);

%% Summary
fprintf('\n========================================\n');
fprintf('Evaluation Complete\n');
fprintf('========================================\n\n');

fprintf('Key Findings:\n');
fprintf('  • Model R²: %.4f (%.1f%% variance explained)\n', r2_calc, r2_calc * 100);
fprintf('  • Average error: $%.0f (%.1f%% of average price)\n', mae_calc, mape_calc);
fprintf('  • %.1f%% of predictions within 10%% error\n', error_10pct);
fprintf('  • %.1f%% of predictions within 20%% error\n', error_20pct);

fprintf('\nNext steps:\n');
fprintf('  1. Run visualize_results.m to see visualizations\n');
fprintf('  2. Review error analysis by price range\n');
fprintf('  3. Consider fine-tuning if needed\n');
fprintf('  4. Test on new data\n\n');
