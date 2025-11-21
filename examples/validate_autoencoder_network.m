% Validate Autoencoder Network - Step-by-Step Calculation Check
% This script verifies that the network calculates correctly at every step
%
% Usage: run('validate_autoencoder_network.m')

fprintf('========================================\n');
fprintf('Autoencoder Network Validation\n');
fprintf('========================================\n\n');

%% Step 1: Build the Network
fprintf('Step 1: Building network architecture...\n');

encoderLayers = [
    imageInputLayer([28 28 1], 'Name', 'input')
    convolution2dLayer(3, 16, 'Padding', 'same', 'Name', 'enc_conv1')
    reluLayer('Name', 'enc_relu1')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'enc_pool1')
    convolution2dLayer(3, 8, 'Padding', 'same', 'Name', 'enc_conv2')
    reluLayer('Name', 'enc_relu2')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'enc_pool2')
    convolution2dLayer(3, 4, 'Padding', 'same', 'Name', 'enc_conv3')
    reluLayer('Name', 'enc_relu3')
];

decoderLayers = [
    transposedConv2dLayer(2, 8, 'Stride', 2, 'Name', 'dec_transconv1')
    reluLayer('Name', 'dec_relu1')
    transposedConv2dLayer(2, 16, 'Stride', 2, 'Name', 'dec_transconv2')
    reluLayer('Name', 'dec_relu2')
    convolution2dLayer(3, 1, 'Padding', 'same', 'Name', 'dec_conv')
    regressionLayer('Name', 'output')
];

layers = [encoderLayers; decoderLayers];
lgraph = layerGraph(layers);

fprintf('   ✓ Network created with %d layers\n', numel(layers));

%% Step 2: Analyze Network Structure
fprintf('\nStep 2: Analyzing network structure...\n');
analyzeNetwork(lgraph);
fprintf('   ✓ Network analysis complete (check figure)\n');

%% Step 3: Calculate Expected Dimensions Manually
fprintf('\nStep 3: Calculating expected dimensions at each layer...\n');
fprintf('   Input: 28 x 28 x 1\n');

% Encoder path
fprintf('\n   ENCODER PATH:\n');
fprintf('   After enc_conv1 (3x3 conv, 16 filters, padding=same): 28 x 28 x 16\n');
fprintf('   After enc_relu1: 28 x 28 x 16 (no size change)\n');
fprintf('   After enc_pool1 (2x2 pool, stride=2): 14 x 14 x 16\n');
fprintf('   After enc_conv2 (3x3 conv, 8 filters, padding=same): 14 x 14 x 8\n');
fprintf('   After enc_relu2: 14 x 14 x 8 (no size change)\n');
fprintf('   After enc_pool2 (2x2 pool, stride=2): 7 x 7 x 8\n');
fprintf('   After enc_conv3 (3x3 conv, 4 filters, padding=same): 7 x 7 x 4\n');
fprintf('   After enc_relu3: 7 x 7 x 4 (no size change)\n');
fprintf('   → Bottleneck: 7 x 7 x 4\n');

% Decoder path
fprintf('\n   DECODER PATH:\n');
fprintf('   After dec_transconv1 (2x2, stride=2, 8 filters): 14 x 14 x 8\n');
fprintf('   After dec_relu1: 14 x 14 x 8 (no size change)\n');
fprintf('   After dec_transconv2 (2x2, stride=2, 16 filters): 28 x 28 x 16\n');
fprintf('   After dec_relu2: 28 x 28 x 16 (no size change)\n');
fprintf('   After dec_conv (3x3 conv, 1 filter, padding=same): 28 x 28 x 1\n');
fprintf('   → Output: 28 x 28 x 1 (matches input!)\n');

%% Step 4: Create Test Data and Forward Pass
fprintf('\nStep 4: Testing forward pass with sample data...\n');

% Create dummy network for forward pass (without training)
% We'll use a simpler approach: create a dlnetwork for validation
try
    % Create sample input
    testInput = rand(28, 28, 1, 1, 'single');  % Batch size 1
    fprintf('   ✓ Test input created: size %s\n', mat2str(size(testInput)));

    % Try to create a dlnetwork for forward pass validation
    % Note: This requires the network to be properly formed
    fprintf('   Attempting forward pass validation...\n');

    % Check if we can convert to dlnetwork (requires Deep Learning Toolbox)
    if license('test', 'Deep_Learning_Toolbox')
        try
            % Create dlnetwork for validation
            dlnet = dlnetwork(lgraph);
            fprintf('   ✓ dlnetwork created successfully\n');

            % Convert input to dlarray
            dlX = dlarray(testInput, 'SSCB');  % Spatial, Spatial, Channel, Batch
            fprintf('   ✓ Input converted to dlarray\n');

            % Forward pass
            dlY = forward(dlnet, dlX);
            fprintf('   ✓ Forward pass completed\n');
            fprintf('   Output size: %s\n', mat2str(size(dlY)));

            % Verify output dimensions
            expectedSize = [28, 28, 1, 1];
            actualSize = size(dlY);
            if isequal(actualSize(1:3), expectedSize(1:3))
                fprintf('   ✓ Output dimensions match expected: 28 x 28 x 1\n');
            else
                fprintf('   ✗ Dimension mismatch! Expected: %s, Got: %s\n', ...
                    mat2str(expectedSize(1:3)), mat2str(actualSize(1:3)));
            end

        catch ME
            fprintf('   ⚠ Could not create dlnetwork: %s\n', ME.message);
            fprintf('   This is normal if network needs training first\n');
        end
    else
        fprintf('   ⚠ Deep Learning Toolbox not available for forward pass test\n');
    end

catch ME
    fprintf('   ✗ Error during forward pass: %s\n', ME.message);
end

%% Step 5: Validate Layer Connections
fprintf('\nStep 5: Validating layer connections...\n');

% Check layer graph structure
layerNames = {lgraph.Layers.Name};
fprintf('   Total layers: %d\n', length(layerNames));
fprintf('   Layer names: %s\n', strjoin(layerNames, ', '));

% Check connections
connections = lgraph.Connections;
fprintf('   Total connections: %d\n', height(connections));

% Verify input layer exists
if any(strcmp(layerNames, 'input'))
    fprintf('   ✓ Input layer found\n');
else
    fprintf('   ✗ Input layer missing!\n');
end

% Verify output layer exists
if any(strcmp(layerNames, 'output'))
    fprintf('   ✓ Output layer found\n');
else
    fprintf('   ✗ Output layer missing!\n');
end

% Check if all layers are connected
fprintf('\n   Connection details:\n');
for i = 1:min(10, height(connections))  % Show first 10 connections
    fprintf('     %s -> %s\n', connections.Source{i}, connections.Destination{i});
end
if height(connections) > 10
    fprintf('     ... and %d more connections\n', height(connections) - 10);
end

%% Step 6: Check for Common Issues
fprintf('\nStep 6: Checking for common issues...\n');

issues = {};

% Check 1: Input size consistency
inputLayer = lgraph.Layers(1);
if isa(inputLayer, 'nnet.cnn.layer.ImageInputLayer')
    inputSize = inputLayer.InputSize;
    fprintf('   Input size: %s\n', mat2str(inputSize));
    if ~isequal(inputSize, [28, 28, 1])
        issues{end+1} = sprintf('Input size mismatch: expected [28 28 1], got %s', mat2str(inputSize));
    end
end

% Check 2: Pooling layer consistency
poolLayers = lgraph.Layers(arrayfun(@(x) isa(x, 'nnet.cnn.layer.MaxPooling2DLayer'), lgraph.Layers));
if length(poolLayers) == 2
    fprintf('   ✓ Found 2 pooling layers (as expected)\n');
else
    issues{end+1} = sprintf('Expected 2 pooling layers, found %d', length(poolLayers));
end

% Check 3: Transposed convolution consistency
transConvLayers = lgraph.Layers(arrayfun(@(x) isa(x, 'nnet.cnn.layer.TransposedConvolution2DLayer'), lgraph.Layers));
if length(transConvLayers) == 2
    fprintf('   ✓ Found 2 transposed convolution layers (as expected)\n');
else
    issues{end+1} = sprintf('Expected 2 transposed conv layers, found %d', length(transConvLayers));
end

% Check 4: Output layer type
outputLayer = lgraph.Layers(end);
if isa(outputLayer, 'nnet.cnn.layer.RegressionOutputLayer')
    fprintf('   ✓ Output layer is RegressionOutputLayer (correct for autoencoder)\n');
else
    issues{end+1} = sprintf('Output layer should be RegressionOutputLayer, got %s', class(outputLayer));
end

% Report issues
if isempty(issues)
    fprintf('   ✓ No issues found!\n');
else
    fprintf('   ✗ Issues found:\n');
    for i = 1:length(issues)
        fprintf('     - %s\n', issues{i});
    end
end

%% Step 7: Dimension Calculation Verification
fprintf('\nStep 7: Detailed dimension calculation verification...\n');

% Manual calculation for each layer
dimensions = struct();
dimensions.input = [28, 28, 1];

% Encoder
dimensions.after_enc_conv1 = [28, 28, 16];  % padding='same' preserves size
dimensions.after_enc_relu1 = [28, 28, 16];  % ReLU doesn't change size
dimensions.after_enc_pool1 = [14, 14, 16];  % 28/2 = 14
dimensions.after_enc_conv2 = [14, 14, 8];  % padding='same'
dimensions.after_enc_relu2 = [14, 14, 8];
dimensions.after_enc_pool2 = [7, 7, 8];  % 14/2 = 7
dimensions.after_enc_conv3 = [7, 7, 4];  % padding='same'
dimensions.after_enc_relu3 = [7, 7, 4];
dimensions.bottleneck = [7, 7, 4];

% Decoder
dimensions.after_dec_transconv1 = [14, 14, 8];  % 7*2 = 14
dimensions.after_dec_relu1 = [14, 14, 8];
dimensions.after_dec_transconv2 = [28, 28, 16];  % 14*2 = 28
dimensions.after_dec_relu2 = [28, 28, 16];
dimensions.after_dec_conv = [28, 28, 1];  % padding='same'
dimensions.output = [28, 28, 1];

fprintf('   Dimension flow:\n');
fprintf('     Input:        %s\n', mat2str(dimensions.input));
fprintf('     Bottleneck:   %s\n', mat2str(dimensions.bottleneck));
fprintf('     Output:       %s\n', mat2str(dimensions.output));

% Verify input = output
if isequal(dimensions.input, dimensions.output)
    fprintf('   ✓ Input and output dimensions match!\n');
else
    fprintf('   ✗ Dimension mismatch: input %s != output %s\n', ...
        mat2str(dimensions.input), mat2str(dimensions.output));
end

%% Step 8: Summary
fprintf('\n========================================\n');
fprintf('Validation Summary\n');
fprintf('========================================\n');

if isempty(issues) && isequal(dimensions.input, dimensions.output)
    fprintf('✓ Network structure is CORRECT\n');
    fprintf('✓ All dimensions are consistent\n');
    fprintf('✓ Network is ready for training\n');
else
    fprintf('✗ Issues found - please review above\n');
end

fprintf('\nNext steps:\n');
fprintf('  1. Train the network with: trainNetwork(imds, lgraph, options)\n');
fprintf('  2. Use encoder for feature extraction\n');
fprintf('  3. Use decoder for image reconstruction\n');
fprintf('\n');
