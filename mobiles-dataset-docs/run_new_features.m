% Run New Features - Quick Start Script
% This script helps you quickly test all the new features
% Usage: run('run_new_features.m')

fprintf('=== Running New Features Demo ===\n\n');

%% Change to correct directory
if ~contains(pwd, 'mobiles-dataset-docs')
    if exist('mobiles-dataset-docs', 'dir')
        cd('mobiles-dataset-docs');
        fprintf('   ✓ Changed to mobiles-dataset-docs directory\n\n');
    else
        warning('mobiles-dataset-docs directory not found. Please navigate to it first.');
        return;
    end
end

%% Step 1: Check if models are trained
fprintf('Step 1: Checking trained models...\n');
frontCamTrained = exist('trained_models/front_camera_predictor.mat', 'file');
backCamTrained = exist('trained_models/back_camera_predictor.mat', 'file');

if frontCamTrained
    fprintf('   ✓ Front camera model: READY\n');
else
    fprintf('   ⏳ Front camera model: NOT TRAINED YET\n');
    fprintf('      Run: train_front_camera_prediction_model.m\n');
end

if backCamTrained
    fprintf('   ✓ Back camera model: READY\n');
else
    fprintf('   ⏳ Back camera model: NOT TRAINED YET\n');
    fprintf('      Run: train_back_camera_prediction_model.m\n');
end

%% Step 2: Train models if needed
if ~frontCamTrained || ~backCamTrained
    fprintf('\nStep 2: Training models...\n');
    fprintf('   This will take 20-60 minutes. Starting training...\n\n');

    if ~frontCamTrained
        try
            run('train_front_camera_prediction_model.m');
        catch ME
            fprintf('   ✗ Error training front camera: %s\n', ME.message);
        end
    end

    if ~backCamTrained
        try
            run('train_back_camera_prediction_model.m');
        catch ME
            fprintf('   ✗ Error training back camera: %s\n', ME.message);
        end
    end
end

%% Step 3: Run Market Segmentation
fprintf('\nStep 3: Running Market Segmentation...\n');
try
    segments = analyze_market_segments();
    fprintf('   ✓ Market segmentation complete\n');
catch ME
    fprintf('   ✗ Error: %s\n', ME.message);
end

%% Step 4: Run Regional Price Analysis
fprintf('\nStep 4: Running Regional Price Analysis...\n');
try
    regional = analyze_regional_prices();
    fprintf('   ✓ Regional analysis complete\n');
catch ME
    fprintf('   ✗ Error: %s\n', ME.message);
end

%% Step 5: Generate Visualizations
fprintf('\nStep 5: Generating Visualizations...\n');
try
    run('visualize_new_features.m');
    fprintf('   ✓ Visualizations generated\n');
catch ME
    fprintf('   ✗ Error: %s\n', ME.message);
end

%% Step 6: Demo Predictions
fprintf('\nStep 6: Testing Predictions...\n');

if frontCamTrained || exist('trained_models/front_camera_predictor.mat', 'file')
    try
        fprintf('   Testing front camera prediction...\n');
        front_cam = predict_front_camera(8, 5000, 6.7, 200, 2024, 899, 'Samsung');
        fprintf('      Predicted Front Camera: %d MP\n', front_cam);
    catch ME
        fprintf('      ✗ Error: %s\n', ME.message);
    end
end

if backCamTrained || exist('trained_models/back_camera_predictor.mat', 'file')
    try
        fprintf('   Testing back camera prediction...\n');
        back_cam = predict_back_camera(8, 5000, 6.7, 200, 2024, 899, 'Samsung');
        fprintf('      Predicted Back Camera: %d MP\n', back_cam);
    catch ME
        fprintf('      ✗ Error: %s\n', ME.message);
    end
end

%% Step 7: Demo Similar Phone Finder
fprintf('\nStep 7: Testing Similar Phone Finder...\n');
try
    if exist('preprocessed/preprocessed_data.mat', 'file')
        similar = find_similar_phones(8, 5000, 6.7, 200, 2024, 899, 'Samsung', 3);
        fprintf('   ✓ Found %d similar phones\n', height(similar));
    else
        fprintf('   ⏳ Preprocessed data not found. Run preprocess_dataset.m first.\n');
    end
catch ME
    fprintf('   ✗ Error: %s\n', ME.message);
end

%% Summary
fprintf('\n=== Summary ===\n');
fprintf('All new features have been tested!\n\n');
fprintf('Next steps:\n');
fprintf('  1. Check visualizations in: visualizations/\n');
fprintf('  2. Review market segments: analysis_results/market_segments.mat\n');
fprintf('  3. Review regional analysis: analysis_results/regional_price_analysis.mat\n');
fprintf('  4. Use prediction functions for your own data\n\n');

fprintf('Documentation:\n');
fprintf('  - NEW_FEATURES_GUIDE.md - Complete guide\n');
fprintf('  - QUICK_REFERENCE_NEW_FEATURES.md - Quick reference\n');
fprintf('  - IMPLEMENTATION_SUMMARY.md - Technical details\n\n');
