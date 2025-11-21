% Run All Deep Learning Network Examples
% This script runs all example networks and displays their architectures

fprintf('=== Running All Deep Learning Network Examples ===\n\n');

% Add examples directory to path
addpath('examples');

%% 1. CNN Example
fprintf('1. CONVOLUTIONAL NEURAL NETWORK (CNN)\n');
fprintf('   ------------------------------------\n');
try
    run('examples/cnn_example.m');
    fprintf('   ✓ CNN created successfully\n\n');
catch ME
    fprintf('   ✗ Error: %s\n\n', ME.message);
end

%% 2. LSTM Example
fprintf('2. LSTM NETWORK\n');
fprintf('   -------------\n');
try
    run('examples/lstm_example.m');
    fprintf('   ✓ LSTM created successfully\n\n');
catch ME
    fprintf('   ✗ Error: %s\n\n', ME.message);
end

%% 3. Autoencoder Example
fprintf('3. AUTOENCODER\n');
fprintf('   ------------\n');
try
    run('examples/autoencoder_example.m');
    fprintf('   ✓ Autoencoder created successfully\n\n');
catch ME
    fprintf('   ✗ Error: %s\n\n', ME.message);
end

%% 4. ResNet-style Example
fprintf('4. RESNET-STYLE NETWORK\n');
fprintf('   --------------------\n');
try
    run('examples/resnet_style_example.m');
    fprintf('   ✓ ResNet-style created successfully\n\n');
catch ME
    fprintf('   ✗ Error: %s\n\n', ME.message);
end

%% Summary
fprintf('=== Summary ===\n');
fprintf('All network examples have been executed.\n');
fprintf('You can now:\n');
fprintf('  - Modify these examples for your specific use case\n');
fprintf('  - Add your own training data\n');
fprintf('  - Train the networks using trainNetwork()\n');
fprintf('  - Use GPU acceleration with your RTX 3070\n\n');

% Check GPU availability
fprintf('GPU Status:\n');
try
    gpuInfo = gpuDevice;
    fprintf('  ✓ GPU Available: %s\n', gpuInfo.Name);
    fprintf('  ✓ GPU Memory: %.2f GB\n', gpuInfo.AvailableMemory / 1e9);
    fprintf('  ✓ You can use GPU for training these networks!\n');
catch
    fprintf('  ✗ GPU not available\n');
end

fprintf('\n=== All Examples Completed ===\n');
