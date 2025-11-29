% View Results - Quick script to view all generated results
% Usage: run('VIEW_RESULTS.m')

fprintf('=== Viewing Generated Results ===\n\n');

%% Check Visualizations
fprintf('1. Visualizations (Screenshots):\n');
if exist('visualizations', 'dir')
    pngFiles = dir('visualizations/*.png');
    if ~isempty(pngFiles)
        fprintf('   ✓ Found %d screenshot(s):\n', length(pngFiles));
        for i = 1:length(pngFiles)
            fprintf('      - %s\n', pngFiles(i).name);
        end
        fprintf('\n   To view: open visualizations/%s\n', pngFiles(1).name);
    else
        fprintf('   ⏳ No PNG files found\n');
    end
else
    fprintf('   ⏳ Visualizations folder not found\n');
end

%% Check Analysis Results
fprintf('\n2. Analysis Results:\n');
if exist('analysis_results', 'dir')
    matFiles = dir('analysis_results/*.mat');
    if ~isempty(matFiles)
        fprintf('   ✓ Found %d analysis file(s):\n', length(matFiles));
        for i = 1:length(matFiles)
            fprintf('      - %s\n', matFiles(i).name);
        end

        % Try to load and display market segments
        if exist('analysis_results/market_segments.mat', 'file')
            fprintf('\n   Loading market segments...\n');
            load('analysis_results/market_segments.mat');
            if exist('segments', 'var')
                fprintf('      Budget: %d phones (avg price: $%.0f)\n', ...
                    segments.Budget.count, segments.Budget.avgPrice);
                fprintf('      Mid-Range: %d phones (avg price: $%.0f)\n', ...
                    segments.('Mid-Range').count, segments.('Mid-Range').avgPrice);
                fprintf('      Premium: %d phones (avg price: $%.0f)\n', ...
                    segments.Premium.count, segments.Premium.avgPrice);
            end
        end
    else
        fprintf('   ⏳ No analysis files found\n');
    end
else
    fprintf('   ⏳ Analysis results folder not found\n');
    fprintf('      Run: analyze_market_segments()\n');
    fprintf('      Run: analyze_regional_prices()\n');
end

%% Check Trained Models
fprintf('\n3. Trained Models:\n');
if exist('trained_models/front_camera_predictor.mat', 'file')
    fprintf('   ✓ Front camera model: READY\n');
    load('trained_models/front_camera_prediction_results.mat', 'r2', 'rmse');
    fprintf('      R² = %.4f, RMSE = %.2f MP\n', r2, rmse);
else
    fprintf('   ⏳ Front camera model: NOT TRAINED\n');
    fprintf('      Run: train_front_camera_prediction_model.m\n');
end

if exist('trained_models/back_camera_predictor.mat', 'file')
    fprintf('   ✓ Back camera model: READY\n');
    load('trained_models/back_camera_prediction_results.mat', 'r2', 'rmse');
    fprintf('      R² = %.4f, RMSE = %.2f MP\n', r2, rmse);
else
    fprintf('   ⏳ Back camera model: NOT TRAINED\n');
    fprintf('      Run: train_back_camera_prediction_model.m\n');
end

%% Summary
fprintf('\n=== Summary ===\n');
fprintf('To view screenshots:\n');
fprintf('  1. Navigate to: visualizations/\n');
fprintf('  2. Open the PNG files\n');
fprintf('\nTo run missing analyses:\n');
fprintf('  - Market Segmentation: analyze_market_segments()\n');
fprintf('  - Regional Prices: analyze_regional_prices()\n');
fprintf('  - Camera Models: run(''train_all_new_models.m'')\n');
fprintf('\n');
