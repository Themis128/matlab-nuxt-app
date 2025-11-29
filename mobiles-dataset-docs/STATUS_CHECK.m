% Quick Status Check
% Usage: run('STATUS_CHECK.m')

fprintf('=== Quick Status Check ===\n\n');

completed = 0;
total = 5;

% Market Segmentation
if exist('analysis_results/market_segments.mat', 'file')
    fprintf('✓ Market Segmentation\n');
    completed = completed + 1;
else
    fprintf('✗ Market Segmentation - Run: analyze_market_segments()\n');
end

% Regional Analysis
if exist('analysis_results/regional_price_analysis.mat', 'file')
    fprintf('✓ Regional Price Analysis\n');
    completed = completed + 1;
else
    fprintf('✗ Regional Analysis - Run: analyze_regional_prices()\n');
end

% Front Camera
if exist('trained_models/front_camera_predictor.mat', 'file')
    fprintf('✓ Front Camera Model\n');
    completed = completed + 1;
else
    fprintf('✗ Front Camera Model - Run: train_front_camera_prediction_model.m\n');
end

% Back Camera
if exist('trained_models/back_camera_predictor.mat', 'file')
    fprintf('✓ Back Camera Model\n');
    completed = completed + 1;
else
    fprintf('✗ Back Camera Model - Run: train_back_camera_prediction_model.m\n');
end

% Visualizations
if exist('visualizations', 'dir')
    pngFiles = dir('visualizations/*.png');
    if length(pngFiles) >= 2
        fprintf('✓ Visualizations (%d screenshots)\n', length(pngFiles));
        completed = completed + 1;
    else
        fprintf('⚠ Visualizations (partial - %d created)\n', length(pngFiles));
    end
else
    fprintf('✗ Visualizations - Run: visualize_new_features.m\n');
end

fprintf('\nStatus: %d/%d complete\n\n', completed, total);

if completed < total
    fprintf('To complete everything, run:\n');
    fprintf('  run(''COMPLETE_ALL_STEPS.m'')\n\n');
end
