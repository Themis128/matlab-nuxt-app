% Example: Building an Autoencoder from Scratch
% This example shows how to create an autoencoder for dimensionality reduction

% Define encoder architecture
encoderLayers = [
    imageInputLayer([28 28 1], 'Name', 'input')  % Example: 28x28 grayscale images

    % Encoder: compress the input
    convolution2dLayer(3, 16, 'Padding', 'same', 'Name', 'enc_conv1')
    reluLayer('Name', 'enc_relu1')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'enc_pool1')

    convolution2dLayer(3, 8, 'Padding', 'same', 'Name', 'enc_conv2')
    reluLayer('Name', 'enc_relu2')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'enc_pool2')

    convolution2dLayer(3, 4, 'Padding', 'same', 'Name', 'enc_conv3')
    reluLayer('Name', 'enc_relu3')
    % Bottleneck: compressed representation
];

% Define decoder architecture
decoderLayers = [
    % Decoder: reconstruct from compressed representation
    transposedConv2dLayer(2, 8, 'Stride', 2, 'Name', 'dec_transconv1')
    reluLayer('Name', 'dec_relu1')

    transposedConv2dLayer(2, 16, 'Stride', 2, 'Name', 'dec_transconv2')
    reluLayer('Name', 'dec_relu2')

    convolution2dLayer(3, 1, 'Padding', 'same', 'Name', 'dec_conv')
    % Output should match input size: 28x28x1

    % Add regression output layer for autoencoder (reconstruction task)
    regressionLayer('Name', 'output')
];

% Combine encoder and decoder
layers = [encoderLayers; decoderLayers];

% Create the layer graph
lgraph = layerGraph(layers);

% Visualize the network
plot(lgraph);
title('Autoencoder Architecture');

% Display network summary
analyzeNetwork(lgraph);

fprintf('Autoencoder architecture created successfully!\n');
fprintf('Encoder compresses 28x28 images to 7x7x4 representation\n');
fprintf('Decoder reconstructs back to 28x28 images\n');

% Note: To train this autoencoder, you would need:
% 1. Training images (no labels needed - unsupervised)
% 2. Training options
% 3. Call: net = trainNetwork(imds, lgraph, options);
% 4. Use the encoder part for feature extraction
% 5. Use the decoder part for reconstruction/denoising
