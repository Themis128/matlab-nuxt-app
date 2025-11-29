% Run All Steps: Complete Pipeline for Mobile Phones Dataset
% This script runs all steps in sequence:
% 1. Preprocess dataset
% 2. Extract insights
% 3. Train price prediction model
%
% Usage: run('run_all_steps.m')

fprintf('========================================\n');
fprintf('Mobile Phones Dataset - Complete Pipeline\n');
fprintf('========================================\n\n');

%% Step 1: Preprocess Dataset
fprintf('STEP 1: PREPROCESSING DATASET\n');
fprintf('========================================\n');
try
    run('preprocess_dataset.m');
    fprintf('\n✓ Step 1 Complete: Dataset preprocessed\n\n');
catch ME
    fprintf('\n✗ Step 1 Failed: %s\n', ME.message);
    error('Preprocessing failed. Please check the dataset file.');
end

%% Step 2: Extract Insights
fprintf('\nSTEP 2: EXTRACTING INSIGHTS\n');
fprintf('========================================\n');
try
    run('extract_all_insights.m');
    fprintf('\n✓ Step 2 Complete: Insights extracted\n\n');
catch ME
    fprintf('\n⚠ Step 2 Warning: %s\n', ME.message);
    fprintf('Continuing with training...\n\n');
end

%% Step 3: Train Price Prediction Model
fprintf('\nSTEP 3: TRAINING PRICE PREDICTION MODEL\n');
fprintf('========================================\n');
try
    run('train_price_prediction_model.m');
    fprintf('\n✓ Step 3 Complete: Model trained\n\n');
catch ME
    fprintf('\n✗ Step 3 Failed: %s\n', ME.message);
    error('Training failed. Please check the error message above.');
end

%% Summary
fprintf('========================================\n');
fprintf('PIPELINE COMPLETE\n');
fprintf('========================================\n\n');
fprintf('All steps completed successfully!\n\n');
fprintf('Next steps:\n');
fprintf('  1. Review training results and metrics\n');
fprintf('  2. Test predictions using predict_price.m\n');
fprintf('  3. Evaluate model performance\n');
fprintf('  4. Fine-tune hyperparameters if needed\n\n');
fprintf('Example prediction:\n');
fprintf('  price = predict_price(6, 4000, 6.1, 174, 2024, ''Apple'');\n\n');
