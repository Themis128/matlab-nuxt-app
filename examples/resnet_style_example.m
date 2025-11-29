% Example: Building a ResNet-style Network from Scratch
% This example shows how to create a network with residual connections

% Helper function to create a residual block
function layers = residualBlock(numFilters, blockName)
    layers = [
        convolution2dLayer(3, numFilters, 'Padding', 'same', 'Name', [blockName '_conv1'])
        batchNormalizationLayer('Name', [blockName '_bn1'])
        reluLayer('Name', [blockName '_relu1'])

        convolution2dLayer(3, numFilters, 'Padding', 'same', 'Name', [blockName '_conv2'])
        batchNormalizationLayer('Name', [blockName '_bn2'])

        % Addition layer for residual connection
        additionLayer(2, 'Name', [blockName '_add'])
        reluLayer('Name', [blockName '_relu2'])
    ];
end

% Main network architecture
layers = [
    % Input
    imageInputLayer([224 224 3], 'Name', 'input')

    % Initial convolution
    convolution2dLayer(7, 64, 'Stride', 2, 'Padding', 'same', 'Name', 'conv_init')
    batchNormalizationLayer('Name', 'bn_init')
    reluLayer('Name', 'relu_init')
    maxPooling2dLayer(3, 'Stride', 2, 'Padding', 'same', 'Name', 'pool_init')

    % Residual blocks
    % Block 1
    convolution2dLayer(1, 64, 'Padding', 'same', 'Name', 'res1_skip')
    % ... (simplified - full ResNet has many blocks)

    % Global average pooling
    globalAveragePooling2dLayer('Name', 'gap')

    % Classification head
    fullyConnectedLayer(1000, 'Name', 'fc')
    softmaxLayer('Name', 'softmax')
    classificationLayer('Name', 'output')
];

% Note: Full ResNet implementation would include:
% - Multiple residual blocks with skip connections
% - Proper handling of dimension changes
% - Bottleneck blocks (1x1, 3x3, 1x1 convolutions)

fprintf('ResNet-style architecture example created!\n');
fprintf('This is a simplified version - full ResNet has 50-152+ layers\n');
