% Train All Models
% This script trains all available model variants
% Usage: run('train_all_models.m')

fprintf('========================================\n');
fprintf('Training All Model Variants\n');
fprintf('========================================\n\n');

models = {
    'train_price_prediction_model.m', 'Standard Price Prediction';
    'train_price_prediction_deep.m', 'Deep Price Prediction';
    'train_price_prediction_wide.m', 'Wide Price Prediction';
    'train_price_prediction_lightweight.m', 'Lightweight Price Prediction';
    'train_brand_classification_model.m', 'Brand Classification';
    'train_ram_prediction_model.m', 'RAM Prediction';
    'train_battery_prediction_model.m', 'Battery Prediction'
};

numModels = size(models, 1);

fprintf('Models to train:\n');
for i = 1:numModels
    fprintf('  %d. %s\n', i, models{i, 2});
end
fprintf('\n');

% Initialize results - use persistent variable name
modelResults = cell(numModels, 1);

for i = 1:numModels
    fprintf('\n========================================\n');
    modelName = models{i, 2};
    modelScript = models{i, 1};
    fprintf('Training Model %d/%d: %s\n', i, numModels, modelName);
    fprintf('========================================\n\n');

    % Save current result index before running script
    currentIdx = i;
    currentModelName = modelName;

    try
        % Run the training script
        run(modelScript);
        % Immediately save result after script completes
        modelResults{currentIdx} = struct('model', currentModelName, 'status', 'success');
        fprintf('\n✓ %s completed successfully\n', currentModelName);
    catch ME
        errorMsg = ME.message;
        modelResults{currentIdx} = struct('model', currentModelName, 'status', 'failed', 'error', errorMsg);
        fprintf('\n✗ %s failed: %s\n', currentModelName, errorMsg);
    end

    fprintf('\n');
end

%% Summary
fprintf('\n========================================\n');
fprintf('Training Summary\n');
fprintf('========================================\n\n');

successful = 0;
failed = 0;

for i = 1:numModels
    if i <= length(modelResults) && ~isempty(modelResults{i})
        if isstruct(modelResults{i}) && isfield(modelResults{i}, 'status')
            if strcmp(modelResults{i}.status, 'success')
                fprintf('✓ %s\n', modelResults{i}.model);
                successful = successful + 1;
            else
                if isfield(modelResults{i}, 'error')
                    fprintf('✗ %s - %s\n', modelResults{i}.model, modelResults{i}.error);
                else
                    fprintf('✗ %s - Unknown error\n', modelResults{i}.model);
                end
                failed = failed + 1;
            end
        else
            fprintf('⚠ %s - Invalid result structure\n', models{i, 2});
            failed = failed + 1;
        end
    else
        fprintf('⚠ %s - No result recorded\n', models{i, 2});
        failed = failed + 1;
    end
end

fprintf('\nTotal: %d successful, %d failed\n', successful, failed);
fprintf('\nAll trained models saved in: trained_models/\n\n');

% List all trained model files
fprintf('Trained Model Files:\n');
modelFiles = dir('trained_models/*.mat');
for i = 1:length(modelFiles)
    if ~contains(modelFiles(i).name, 'results') && ~contains(modelFiles(i).name, 'evaluation')
        fprintf('  ✓ %s\n', modelFiles(i).name);
    end
end
fprintf('\n');
