% Example: Building an LSTM Network from Scratch
% This example shows how to create an LSTM for sequence classification

% Define the network architecture
numFeatures = 12;  % Number of input features
numHiddenUnits = 100;  % Number of LSTM hidden units
numClasses = 5;  % Number of output classes

layers = [
    % Input layer for sequences
    sequenceInputLayer(numFeatures, 'Name', 'input')

    % LSTM layer
    lstmLayer(numHiddenUnits, 'OutputMode', 'last', 'Name', 'lstm1')

    % Optional: Add more LSTM layers
    % lstmLayer(50, 'OutputMode', 'last', 'Name', 'lstm2')

    % Dropout for regularization
    dropoutLayer(0.3, 'Name', 'dropout1')

    % Fully connected layer
    fullyConnectedLayer(64, 'Name', 'fc1')
    reluLayer('Name', 'relu1')

    % Output layer
    fullyConnectedLayer(numClasses, 'Name', 'fc2')
    softmaxLayer('Name', 'softmax')
    classificationLayer('Name', 'output')
];

% Create the layer graph
lgraph = layerGraph(layers);

% Visualize the network
plot(lgraph);
title('Custom LSTM Architecture');

% Display network summary
analyzeNetwork(lgraph);

fprintf('LSTM architecture created successfully!\n');
fprintf('Network has %d layers\n', numel(layers));
fprintf('Input features: %d\n', numFeatures);
fprintf('LSTM hidden units: %d\n', numHiddenUnits);
fprintf('Output classes: %d\n', numClasses);

% Note: To train this network, you would need:
% 1. Sequence data (cell array of sequences)
% 2. Labels (categorical array)
% 3. Training options
% 4. Call: net = trainNetwork(sequences, labels, lgraph, options);
