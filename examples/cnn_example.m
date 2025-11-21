% Example: Building a Convolutional Neural Network from Scratch
% This example shows how to create a CNN for image classification

% Define the network architecture
layers = [
    % Input layer for 224x224 RGB images
    imageInputLayer([224 224 3], 'Name', 'input')

    % First convolutional block
    convolution2dLayer(3, 32, 'Padding', 'same', 'Name', 'conv1')
    batchNormalizationLayer('Name', 'bn1')
    reluLayer('Name', 'relu1')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'pool1')

    % Second convolutional block
    convolution2dLayer(3, 64, 'Padding', 'same', 'Name', 'conv2')
    batchNormalizationLayer('Name', 'bn2')
    reluLayer('Name', 'relu2')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'pool2')

    % Third convolutional block
    convolution2dLayer(3, 128, 'Padding', 'same', 'Name', 'conv3')
    batchNormalizationLayer('Name', 'bn3')
    reluLayer('Name', 'relu3')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'pool3')

    % Fully connected layers
    fullyConnectedLayer(256, 'Name', 'fc1')
    reluLayer('Name', 'relu4')
    dropoutLayer(0.5, 'Name', 'dropout1')

    fullyConnectedLayer(10, 'Name', 'fc2')  % 10 classes
    softmaxLayer('Name', 'softmax')
    classificationLayer('Name', 'output')
];

% Create the layer graph
lgraph = layerGraph(layers);

% Visualize the network
plot(lgraph);
title('Custom CNN Architecture');

% Display network summary
analyzeNetwork(lgraph);

% Note: To train this network, you would need:
% 1. Training data (images and labels)
% 2. Training options (optimizer, learning rate, etc.)
% 3. Call: net = trainNetwork(imds, lgraph, options);

fprintf('CNN architecture created successfully!\n');
fprintf('Network has %d layers\n', numel(layers));
