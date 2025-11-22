% Complete All Steps - Finish All Remaining Tasks
% This script will complete all missing steps
% Usage: run('COMPLETE_ALL_STEPS.m')

fprintf('=== Completing All Remaining Steps ===\n\n');

%% Ensure we're in the right directory
if ~contains(pwd, 'mobiles-dataset-docs')
    if exist('mobiles-dataset-docs', 'dir')
        cd('mobiles-dataset-docs');
    end
end

%% Step 1: Market Segmentation (Quick - ~1-2 minutes)
fprintf('Step 1: Running Market Segmentation...\n');
if ~exist('analysis_results/market_segments.mat', 'file')
    try
        segments = analyze_market_segments();
        fprintf('   ✓ Market segmentation COMPLETE\n');
        fprintf('      Budget: %d phones\n', segments.Budget.count);
        fprintf('      Mid-Range: %d phones\n', segments.('Mid-Range').count);
        fprintf('      Premium: %d phones\n', segments.Premium.count);
    catch ME
        fprintf('   ✗ Error: %s\n', ME.message);
        fprintf('      Stack trace:\n');
        for i = 1:length(ME.stack)
            fprintf('        %s (line %d)\n', ME.stack(i).file, ME.stack(i).line);
        end
    end
else
    fprintf('   ✓ Market segmentation already exists\n');
end

%% Step 2: Regional Price Analysis (Quick - ~1-2 minutes)
fprintf('\nStep 2: Running Regional Price Analysis...\n');
if ~exist('analysis_results/regional_price_analysis.mat', 'file')
    try
        regional = analyze_regional_prices();
        fprintf('   ✓ Regional price analysis COMPLETE\n');
        if isfield(regional, 'USA') && isfield(regional.USA, 'mean')
            fprintf('      USA average price: $%.2f\n', regional.USA.mean);
        end
    catch ME
        fprintf('   ✗ Error: %s\n', ME.message);
        fprintf('      Stack trace:\n');
        for i = 1:length(ME.stack)
            fprintf('        %s (line %d)\n', ME.stack(i).file, ME.stack(i).line);
        end
    end
else
    fprintf('   ✓ Regional analysis already exists\n');
end

%% Step 3: Train Camera Models (Long - ~20-60 minutes each)
fprintf('\nStep 3: Training Camera Models...\n');
fprintf('   ⚠ This will take 20-60 minutes per model\n');
fprintf('   You can skip this if you only need market analysis\n\n');

% Front Camera
if ~exist('trained_models/front_camera_predictor.mat', 'file')
    fprintf('   Training Front Camera Model...\n');
    try
        run('train_front_camera_prediction_model.m');
        if exist('trained_models/front_camera_predictor.mat', 'file')
            fprintf('   ✓ Front camera model TRAINED\n');
            load('trained_models/front_camera_prediction_results.mat', 'r2', 'rmse');
            fprintf('      R² = %.4f, RMSE = %.2f MP\n', r2, rmse);
        end
    catch ME
        fprintf('   ✗ Error training front camera: %s\n', ME.message);
        fprintf('      This might be due to insufficient camera data in dataset\n');
    end
else
    fprintf('   ✓ Front camera model already trained\n');
end

% Back Camera
if ~exist('trained_models/back_camera_predictor.mat', 'file')
    fprintf('\n   Training Back Camera Model...\n');
    try
        run('train_back_camera_prediction_model.m');
        if exist('trained_models/back_camera_predictor.mat', 'file')
            fprintf('   ✓ Back camera model TRAINED\n');
            load('trained_models/back_camera_prediction_results.mat', 'r2', 'rmse');
            fprintf('      R² = %.4f, RMSE = %.2f MP\n', r2, rmse);
        end
    catch ME
        fprintf('   ✗ Error training back camera: %s\n', ME.message);
        fprintf('      This might be due to insufficient camera data in dataset\n');
    end
else
    fprintf('   ✓ Back camera model already trained\n');
end

%% Step 4: Generate All Visualizations
fprintf('\nStep 4: Generating All Visualizations...\n');
try
    run('visualize_new_features.m');
    fprintf('   ✓ Visualizations generated\n');

    % Check what was created
    if exist('visualizations', 'dir')
        pngFiles = dir('visualizations/*.png');
        fprintf('      Created %d screenshot(s):\n', length(pngFiles));
        for i = 1:length(pngFiles)
            fprintf('        - %s\n', pngFiles(i).name);
        end
    end
catch ME
    fprintf('   ✗ Error: %s\n', ME.message);
end

%% Step 5: Test Similar Phone Finder
fprintf('\nStep 5: Testing Similar Phone Finder...\n');
try
    if exist('preprocessed/preprocessed_data.mat', 'file')
        similar = find_similar_phones(8, 5000, 6.7, 200, 2024, 899, 'Samsung', 3);
        fprintf('   ✓ Similar phone finder works\n');
        fprintf('      Found %d similar phones\n', height(similar));
    else
        fprintf('   ⏳ Preprocessed data not found\n');
    end
catch ME
    fprintf('   ✗ Error: %s\n', ME.message);
end

%% Final Summary
fprintf('\n=== Final Status ===\n\n');

% Check what's complete
completed = 0;
total = 5;

if exist('analysis_results/market_segments.mat', 'file')
    completed = completed + 1;
    fprintf('✓ Market Segmentation\n');
else
    fprintf('✗ Market Segmentation\n');
end

if exist('analysis_results/regional_price_analysis.mat', 'file')
    completed = completed + 1;
    fprintf('✓ Regional Price Analysis\n');
else
    fprintf('✗ Regional Price Analysis\n');
end

if exist('trained_models/front_camera_predictor.mat', 'file')
    completed = completed + 1;
    fprintf('✓ Front Camera Model\n');
else
    fprintf('✗ Front Camera Model (optional - requires camera data)\n');
end

if exist('trained_models/back_camera_predictor.mat', 'file')
    completed = completed + 1;
    fprintf('✓ Back Camera Model\n');
else
    fprintf('✗ Back Camera Model (optional - requires camera data)\n');
end

if exist('visualizations', 'dir')
    pngFiles = dir('visualizations/*.png');
    if length(pngFiles) >= 2
        completed = completed + 1;
        fprintf('✓ Visualizations (%d screenshots)\n', length(pngFiles));
    else
        fprintf('⚠ Visualizations (partial - %d of 6)\n', length(pngFiles));
    end
else
    fprintf('✗ Visualizations\n');
end

fprintf('\nCompletion: %d/%d core features\n', completed, total);
fprintf('(Camera models are optional if dataset lacks camera data)\n\n');

fprintf('All files are in:\n');
fprintf('  - visualizations/ (screenshots)\n');
fprintf('  - analysis_results/ (market segments, regional analysis)\n');
fprintf('  - trained_models/ (camera prediction models)\n\n');
