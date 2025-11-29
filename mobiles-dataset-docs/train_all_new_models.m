% Train All New Models
% Trains camera prediction models and prepares data for other analyses
% Usage: run('train_all_new_models.m')

fprintf('=== Training All New Models ===\n\n');

%% Step 1: Ensure data is preprocessed
fprintf('Step 1: Checking data preprocessing...\n');
if ~exist('preprocessed/preprocessed_data.mat', 'file')
    fprintf('   Preprocessing data...\n');
    run('preprocess_dataset.m');
else
    fprintf('   ✓ Preprocessed data found\n');
end

%% Step 2: Train Front Camera Model
fprintf('\n=== Training Front Camera Model ===\n');
try
    run('train_front_camera_prediction_model.m');
    fprintf('   ✓ Front camera model trained successfully\n');
catch ME
    fprintf('   ✗ Error training front camera model: %s\n', ME.message);
end

%% Step 3: Train Back Camera Model
fprintf('\n=== Training Back Camera Model ===\n');
try
    run('train_back_camera_prediction_model.m');
    fprintf('   ✓ Back camera model trained successfully\n');
catch ME
    fprintf('   ✗ Error training back camera model: %s\n', ME.message);
end

%% Step 4: Run Market Segmentation
fprintf('\n=== Running Market Segmentation ===\n');
try
    analyze_market_segments();
    fprintf('   ✓ Market segmentation complete\n');
catch ME
    fprintf('   ✗ Error in market segmentation: %s\n', ME.message);
end

%% Step 5: Generate Visualizations
fprintf('\n=== Generating Visualizations ===\n');
try
    run('visualize_new_features.m');
    fprintf('   ✓ Visualizations generated\n');
catch ME
    fprintf('   ✗ Error generating visualizations: %s\n', ME.message);
end

fprintf('\n=== All New Models Training Complete ===\n\n');
fprintf('Next steps:\n');
fprintf('  1. Review model performance in trained_models/\n');
fprintf('  2. Check visualizations in visualizations/\n');
fprintf('  3. Use prediction functions:\n');
fprintf('     - predict_front_camera()\n');
fprintf('     - predict_back_camera()\n');
fprintf('     - find_similar_phones()\n');
fprintf('  4. Review market segmentation in analysis_results/\n\n');
