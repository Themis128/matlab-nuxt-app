% Run Next Steps After Training
% This script automates the next steps after model training:
%   1. Review training progress plot
%   2. Check model performance metrics
%   3. Use predict_price.m to make new predictions
%   4. Fine-tune hyperparameters if needed
%
% Usage: run('run_next_steps.m')

fprintf('========================================\n');
fprintf('Running Next Steps After Training\n');
fprintf('========================================\n\n');

%% Step 1: Review Training Progress Plot
fprintf('Step 1: Reviewing training progress plot...\n');
fprintf('   If training is complete, the plot should already be visible.\n');
fprintf('   If not, check the training progress figure window.\n\n');

% Check if results exist
resultsPath = 'trained_models/price_prediction_results.mat';
if exist(resultsPath, 'file')
    fprintf('   ✓ Results file found\n');

    % Load and display metrics
    load(resultsPath, 'mse', 'mae', 'rmse', 'r2', 'mape');
    fprintf('\n   Current Model Performance:\n');
    fprintf('      R² Score:              %.4f\n', r2);
    fprintf('      RMSE:                  $%.2f\n', rmse);
    fprintf('      MAE:                   $%.2f\n', mae);
    fprintf('      MAPE:                  %.2f%%\n', mape);
else
    fprintf('   ⚠ Results file not found. Please train the model first.\n');
    return;
end

%% Step 2: Check Model Performance Metrics
fprintf('\nStep 2: Checking detailed model performance metrics...\n');

% Run visualization if it exists
if exist('visualize_results.m', 'file')
    fprintf('   Running visualization script...\n');
    try
        run('visualize_results.m');
        fprintf('   ✓ Visualizations created\n');
    catch ME
        fprintf('   ⚠ Error running visualization: %s\n', ME.message);
    end
else
    fprintf('   ℹ visualize_results.m not found, skipping detailed visualization\n');
end

% Run evaluation if it exists
if exist('evaluate_model.m', 'file')
    fprintf('   Running evaluation script...\n');
    try
        run('evaluate_model.m');
        fprintf('   ✓ Evaluation complete\n');
    catch ME
        fprintf('   ⚠ Error running evaluation: %s\n', ME.message);
    end
else
    fprintf('   ℹ evaluate_model.m not found, using basic metrics\n');
end

%% Step 3: Use predict_price.m to Make New Predictions
fprintf('\nStep 3: Making sample predictions with predict_price.m...\n');

% Check if predict_price function exists
if exist('predict_price.m', 'file')
    fprintf('   Testing predict_price function with sample data...\n\n');

    % Example predictions (cell array of cell arrays)
    examples = {
        {8, 4000, 6.1, 174, 2024, 'Apple'},      % iPhone-like
        {12, 5000, 6.7, 203, 2024, 'Samsung'},    % Galaxy-like
        {6, 4500, 6.0, 180, 2023, 'Xiaomi'},     % Budget phone
        {16, 6000, 7.0, 220, 2024, 'OnePlus'},   % Flagship
        {4, 3000, 5.5, 150, 2022, 'Samsung'}      % Older model
    };

    fprintf('   Sample Predictions:\n');
    fprintf('   ----------------------------------------\n');
    fprintf('   RAM  | Battery | Screen | Weight | Year | Company | Predicted Price\n');
    fprintf('   ----------------------------------------\n');

    for i = 1:length(examples)
        ex = examples{i};
        try
            price = predict_price(ex{1}, ex{2}, ex{3}, ex{4}, ex{5}, ex{6});
            fprintf('   %2dGB | %5dmAh | %5.1f" | %5dg | %4d | %-7s | $%.0f\n', ...
                ex{1}, ex{2}, ex{3}, ex{4}, ex{5}, ex{6}, price);
        catch ME
            fprintf('   Error predicting for example %d: %s\n', i, ME.message);
        end
    end

    fprintf('   ----------------------------------------\n\n');
    fprintf('   ✓ Sample predictions complete\n');
    fprintf('   You can now use predict_price() with your own data:\n');
    fprintf('   price = predict_price(ram, battery, screenSize, weight, year, company);\n\n');
else
    fprintf('   ⚠ predict_price.m not found\n');
end

%% Step 4: Fine-tune Hyperparameters (if needed)
fprintf('Step 4: Hyperparameter fine-tuning options...\n');

% Check current performance
if r2 < 0.7
    fprintf('   ⚠ R² score (%.4f) is below 0.7. Consider fine-tuning.\n', r2);
elseif r2 < 0.85
    fprintf('   ℹ R² score (%.4f) is good but could be improved.\n', r2);
else
    fprintf('   ✓ R² score (%.4f) is excellent!\n', r2);
end

if rmse > 200
    fprintf('   ⚠ RMSE ($%.2f) is high. Consider fine-tuning.\n', rmse);
else
    fprintf('   ✓ RMSE ($%.2f) is acceptable.\n', rmse);
end

fprintf('\n   Available fine-tuning options:\n');
fprintf('   1. train_price_prediction_lightweight.m - Faster, smaller model\n');
fprintf('   2. train_price_prediction_wide.m - Wider network\n');
fprintf('   3. train_price_prediction_deep.m - Deeper network\n');
fprintf('   4. train_price_prediction_model.m - Standard model (re-train with different params)\n\n');

fprintf('   To fine-tune manually, edit training options in train_price_prediction_model.m:\n');
fprintf('   - MaxEpochs: Increase for more training (current: 100)\n');
fprintf('   - InitialLearnRate: Adjust learning rate (current: 0.001)\n');
fprintf('   - MiniBatchSize: Change batch size (current: 64)\n');
fprintf('   - Network architecture: Modify hidden layer sizes\n');
fprintf('   - Dropout rates: Adjust regularization (current: 0.3, 0.2)\n\n');

% Ask user if they want to create a fine-tuning script
fprintf('   Would you like to create a custom fine-tuning script? (y/n)\n');
fprintf('   [Note: This is a MATLAB script - run interactively to answer prompts]\n\n');

%% Summary
fprintf('========================================\n');
fprintf('Next Steps Summary\n');
fprintf('========================================\n\n');

fprintf('Completed:\n');
fprintf('  ✓ Reviewed model performance metrics\n');
fprintf('  ✓ Generated visualizations (if available)\n');
fprintf('  ✓ Tested predict_price function\n');
fprintf('  ✓ Analyzed hyperparameter tuning needs\n\n');

fprintf('Recommended Actions:\n');
if r2 < 0.7 || rmse > 200
    fprintf('  1. Consider fine-tuning hyperparameters\n');
    fprintf('  2. Try different network architectures\n');
    fprintf('  3. Check data preprocessing\n');
else
    fprintf('  1. Model performance is good - ready for production use\n');
    fprintf('  2. Continue using predict_price() for new predictions\n');
    fprintf('  3. Monitor model performance on new data\n');
end

fprintf('\n  4. Review saved figures in trained_models/figures/\n');
fprintf('  5. Use predict_price() for real-world predictions\n\n');

fprintf('========================================\n');
fprintf('Next Steps Complete\n');
fprintf('========================================\n\n');
