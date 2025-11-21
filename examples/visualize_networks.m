% Visualize Deep Learning Networks
% This script creates and visualizes different network architectures

fprintf('=== Visualizing Deep Learning Networks ===\n\n');

%% 1. Create and Visualize CNN
fprintf('1. Creating CNN Network...\n');
layers_cnn = [
    imageInputLayer([224 224 3], 'Name', 'input')
    convolution2dLayer(3, 32, 'Padding', 'same', 'Name', 'conv1')
    batchNormalizationLayer('Name', 'bn1')
    reluLayer('Name', 'relu1')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'pool1')
    convolution2dLayer(3, 64, 'Padding', 'same', 'Name', 'conv2')
    batchNormalizationLayer('Name', 'bn2')
    reluLayer('Name', 'relu2')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'pool2')
    fullyConnectedLayer(256, 'Name', 'fc1')
    reluLayer('Name', 'relu3')
    dropoutLayer(0.5, 'Name', 'dropout1')
    fullyConnectedLayer(10, 'Name', 'fc2')
    softmaxLayer('Name', 'softmax')
    classificationLayer('Name', 'output')
];

lgraph_cnn = layerGraph(layers_cnn);
fprintf('   CNN created with %d layers\n', numel(layers_cnn));

% Analyze network
fprintf('   Analyzing CNN architecture...\n');
analyzeNetwork(lgraph_cnn);
fprintf('   ✓ CNN network analyzed (check the figure)\n\n');

%% 2. Create and Visualize LSTM
fprintf('2. Creating LSTM Network...\n');
layers_lstm = [
    sequenceInputLayer(12, 'Name', 'input')
    lstmLayer(100, 'OutputMode', 'last', 'Name', 'lstm1')
    dropoutLayer(0.3, 'Name', 'dropout1')
    fullyConnectedLayer(64, 'Name', 'fc1')
    reluLayer('Name', 'relu1')
    fullyConnectedLayer(5, 'Name', 'fc2')
    softmaxLayer('Name', 'softmax')
    classificationLayer('Name', 'output')
];

lgraph_lstm = layerGraph(layers_lstm);
fprintf('   LSTM created with %d layers\n', numel(layers_lstm));

% Analyze network
fprintf('   Analyzing LSTM architecture...\n');
analyzeNetwork(lgraph_lstm);
fprintf('   ✓ LSTM network analyzed (check the figure)\n\n');

%% 3. Create and Visualize Autoencoder
fprintf('3. Creating Autoencoder Network...\n');
layers_ae = [
    imageInputLayer([28 28 1], 'Name', 'input')
    convolution2dLayer(3, 16, 'Padding', 'same', 'Name', 'enc_conv1')
    reluLayer('Name', 'enc_relu1')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'enc_pool1')
    convolution2dLayer(3, 8, 'Padding', 'same', 'Name', 'enc_conv2')
    reluLayer('Name', 'enc_relu2')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'enc_pool2')
    convolution2dLayer(3, 4, 'Padding', 'same', 'Name', 'enc_conv3')
    reluLayer('Name', 'enc_relu3')
    transposedConv2dLayer(2, 8, 'Stride', 2, 'Name', 'dec_transconv1')
    reluLayer('Name', 'dec_relu1')
    transposedConv2dLayer(2, 16, 'Stride', 2, 'Name', 'dec_transconv2')
    reluLayer('Name', 'dec_relu2')
    convolution2dLayer(3, 1, 'Padding', 'same', 'Name', 'dec_conv')
    % Add regression output layer for autoencoder (reconstruction task)
    regressionLayer('Name', 'output')
];

lgraph_ae = layerGraph(layers_ae);
fprintf('   Autoencoder created with %d layers\n', numel(layers_ae));

% Analyze network
fprintf('   Analyzing Autoencoder architecture...\n');
analyzeNetwork(lgraph_ae);
fprintf('   ✓ Autoencoder network analyzed (check the figure)\n\n');

%% Summary
fprintf('=== Summary ===\n');
fprintf('All networks have been created and analyzed.\n');
fprintf('Network architecture diagrams should be displayed in separate figures.\n');
fprintf('You can see:\n');
fprintf('  - Layer connections\n');
fprintf('  - Layer types and sizes\n');
fprintf('  - Number of learnable parameters\n');
fprintf('  - Input/output sizes\n\n');

% Display network statistics
fprintf('Network Statistics:\n');
fprintf('  CNN: %d layers, input: 224x224x3, output: 10 classes\n', numel(layers_cnn));
fprintf('  LSTM: %d layers, input: sequences of 12 features, output: 5 classes\n', numel(layers_lstm));
fprintf('  Autoencoder: %d layers, input: 28x28x1, output: 28x28x1\n', numel(layers_ae));

fprintf('\n=== Visualization Complete ===\n');
