% Setup MATLAB Environment
% This script configures MATLAB paths and checks for required toolboxes
%
% Usage: run('setup_matlab_env.m')

fprintf('========================================\n');
fprintf('MATLAB Environment Setup\n');
fprintf('========================================\n\n');

%% Add Project Paths
fprintf('Step 1: Adding project paths...\n');
projectRoot = fileparts(mfilename('fullpath'));
addpath(projectRoot);
addpath(fullfile(projectRoot, 'mobiles-dataset-docs'));
addpath(fullfile(projectRoot, 'mobiles-dataset-docs', 'examples'));
addpath(fullfile(projectRoot, 'examples'));

fprintf('   ✓ Project root: %s\n', projectRoot);
fprintf('   ✓ Added project directories to MATLAB path\n\n');

%% Check Required Toolboxes
fprintf('Step 2: Checking required toolboxes...\n');

requiredToolboxes = {
    'Deep Learning Toolbox', 'deeplearning';
    'Statistics and Machine Learning Toolbox', 'stats';
    'Neural Network Toolbox', 'nnet'  % Older name
};

availableToolboxes = ver;
toolboxNames = {availableToolboxes.Name};

fprintf('   Required toolboxes:\n');
for i = 1:size(requiredToolboxes, 1)
    toolboxName = requiredToolboxes{i, 1};
    toolboxKeyword = requiredToolboxes{i, 2};

    % Check if toolbox is available
    isAvailable = any(contains(toolboxNames, toolboxName, 'IgnoreCase', true)) || ...
                  any(contains(toolboxNames, toolboxKeyword, 'IgnoreCase', true));

    if isAvailable
        fprintf('   ✓ %s - Available\n', toolboxName);
    else
        fprintf('   ✗ %s - NOT AVAILABLE\n', toolboxName);
        warning('Required toolbox "%s" is not available. Some features may not work.', toolboxName);
    end
end

%% Check GPU Support
fprintf('\nStep 3: Checking GPU support...\n');
try
    gpuInfo = gpuDevice;
    fprintf('   ✓ GPU detected: %s\n', gpuInfo.Name);
    fprintf('   ✓ GPU Memory: %.2f GB\n', gpuInfo.AvailableMemory / 1e9);
    fprintf('   ✓ GPU Compute Capability: %s\n', gpuInfo.ComputeCapability);
catch
    fprintf('   ℹ No GPU detected - will use CPU\n');
end

%% Check MATLAB Version
fprintf('\nStep 4: MATLAB version information...\n');
matlabVersion = version;
fprintf('   MATLAB Version: %s\n', matlabVersion);

% Check if version is recent enough (R2018b+ for Deep Learning Toolbox)
versionParts = strsplit(matlabVersion, '.');
majorVersion = str2double(versionParts{1});
minorVersion = str2double(versionParts{2});

if majorVersion >= 9 && minorVersion >= 5  % R2018b = 9.5
    fprintf('   ✓ MATLAB version is compatible\n');
else
    warning('MATLAB version may be too old. Deep Learning Toolbox requires R2018b or later.');
end

%% Create Environment File
fprintf('\nStep 5: Creating environment configuration...\n');

envConfig = struct();
envConfig.projectRoot = projectRoot;
envConfig.matlabVersion = matlabVersion;
envConfig.paths = {projectRoot, ...
                   fullfile(projectRoot, 'mobiles-dataset-docs'), ...
                   fullfile(projectRoot, 'mobiles-dataset-docs', 'examples'), ...
                   fullfile(projectRoot, 'examples')};

% Check GPU
try
    gpuInfo = gpuDevice;
    envConfig.gpuAvailable = true;
    envConfig.gpuName = gpuInfo.Name;
    envConfig.gpuMemory = gpuInfo.AvailableMemory;
else
    envConfig.gpuAvailable = false;
end

% Save configuration
configFile = fullfile(projectRoot, 'matlab_env_config.mat');
save(configFile, 'envConfig');
fprintf('   ✓ Environment configuration saved to: %s\n', configFile);

%% Display Summary
fprintf('\n========================================\n');
fprintf('Setup Complete!\n');
fprintf('========================================\n\n');

fprintf('Environment configured:\n');
fprintf('  Project root: %s\n', projectRoot);
fprintf('  MATLAB version: %s\n', matlabVersion);
if envConfig.gpuAvailable
    fprintf('  GPU: %s (%.2f GB)\n', envConfig.gpuName, envConfig.gpuMemory / 1e9);
else
    fprintf('  GPU: Not available\n');
end

fprintf('\nNext steps:\n');
fprintf('  1. Run preprocessing: run(''mobiles-dataset-docs/preprocess_dataset.m'')\n');
fprintf('  2. Extract insights: run(''mobiles-dataset-docs/extract_all_insights.m'')\n');
fprintf('  3. Train model: run(''mobiles-dataset-docs/train_price_prediction_model.m'')\n');
fprintf('  4. View .mat files: view_mat_file(''path/to/file.mat'')\n\n');

fprintf('To reload this configuration later:\n');
fprintf('  load(''matlab_env_config.mat'');\n');
fprintf('  addpath(envConfig.paths{:});\n\n');
