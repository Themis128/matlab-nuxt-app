% Simple Training Example
% This shows how to set up training options and prepare for training
% Note: This example shows the setup - you'll need actual data to train

fprintf('=== Simple Training Example Setup ===\n\n');

%% 1. Create a simple CNN for demonstration
fprintf('1. Creating a simple CNN network...\n');
layers = [
    imageInputLayer([28 28 1])  % 28x28 grayscale images (like MNIST)
    convolution2dLayer(3, 8, 'Padding', 'same')
    batchNormalizationLayer
    reluLayer
    maxPooling2dLayer(2, 'Stride', 2)
    convolution2dLayer(3, 16, 'Padding', 'same')
    batchNormalizationLayer
    reluLayer
    maxPooling2dLayer(2, 'Stride', 2)
    fullyConnectedLayer(10)
    softmaxLayer
    classificationLayer
];

lgraph = layerGraph(layers);
fprintf('   Network created with %d layers\n', numel(layers));

%% 2. Set up training options
fprintf('\n2. Setting up training options...\n');

% Check if GPU is available
try
    gpuInfo = gpuDevice;
    executionEnvironment = 'gpu';
    fprintf('   GPU detected: %s (%.2f GB)\n', gpuInfo.Name, gpuInfo.AvailableMemory / 1e9);
catch
    executionEnvironment = 'cpu';
    fprintf('   Using CPU (GPU not available)\n');
end

% Training options
options = trainingOptions('sgdm', ...
    'MaxEpochs', 10, ...
    'InitialLearnRate', 0.01, ...
    'MiniBatchSize', 128, ...
    'Shuffle', 'every-epoch', ...
    'Verbose', true, ...
    'Plots', 'training-progress', ...
    'ExecutionEnvironment', executionEnvironment, ...
    'ValidationFrequency', 30);

fprintf('   Training options configured:\n');
fprintf('     - Optimizer: SGD with momentum\n');
fprintf('     - Max Epochs: 10\n');
fprintf('     - Learning Rate: 0.01\n');
fprintf('     - Mini Batch Size: 128\n');
fprintf('     - Execution: %s\n', upper(executionEnvironment));

%% 3. Example data preparation (commented out - you need real data)
fprintf('\n3. Data preparation (example):\n');
fprintf('   To train this network, you would need:\n');
fprintf('   \n');
fprintf('   % Load image data\n');
fprintf('   imds = imageDatastore(''path/to/images'', ...\n');
fprintf('       ''IncludeSubfolders'', true, ...\n');
fprintf('       ''LabelSource'', ''foldernames'');\n');
fprintf('   \n');
fprintf('   % Split into training and validation\n');
fprintf('   [imdsTrain, imdsValidation] = splitEachLabel(imds, 0.7, ''randomized'');\n');
fprintf('   \n');
fprintf('   % Train the network\n');
fprintf('   net = trainNetwork(imdsTrain, lgraph, options);\n');
fprintf('   \n');

%% 4. Network summary
fprintf('4. Network Summary:\n');
analyzeNetwork(lgraph);
fprintf('   Network architecture analyzed (check the figure)\n');

%% Summary
fprintf('\n=== Summary ===\n');
fprintf('Training setup is complete!\n');
fprintf('Next steps:\n');
fprintf('  1. Prepare your training data (images, sequences, etc.)\n');
fprintf('  2. Create a datastore (imageDatastore, arrayDatastore, etc.)\n');
fprintf('  3. Call: net = trainNetwork(data, lgraph, options)\n');
fprintf('  4. Monitor training progress in the plot\n');
fprintf('  5. Use the trained network for predictions\n\n');

if strcmp(executionEnvironment, 'gpu')
    fprintf('✓ Your RTX 3070 GPU will accelerate training!\n');
end

fprintf('\n=== Example Complete ===\n');
