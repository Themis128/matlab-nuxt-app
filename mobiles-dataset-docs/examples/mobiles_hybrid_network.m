% Hybrid Network for Mobile Phones
% Combines image and tabular data for better predictions

fprintf('=== Hybrid Network: Images + Tabular Data ===\n\n');

%% 1. Architecture Overview
fprintf('1. Hybrid Network Architecture:\n');
fprintf('   \n');
fprintf('   Input 1: Phone Image → CNN → Image Features\n');
fprintf('   Input 2: Specifications → FCN → Tabular Features\n');
fprintf('   Fusion: Concatenate → Combined Features → Output\n');
fprintf('   \n');

%% 2. Image Branch (CNN)
fprintf('2. Image Branch (CNN):\n');
imageLayers = [
    imageInputLayer([224 224 3], 'Name', 'image_input')
    convolution2dLayer(3, 32, 'Padding', 'same', 'Name', 'img_conv1')
    batchNormalizationLayer('Name', 'img_bn1')
    reluLayer('Name', 'img_relu1')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'img_pool1')
    convolution2dLayer(3, 64, 'Padding', 'same', 'Name', 'img_conv2')
    batchNormalizationLayer('Name', 'img_bn2')
    reluLayer('Name', 'img_relu2')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'img_pool2')
    globalAveragePooling2dLayer('Name', 'img_gap')  % Reduces to feature vector
    fullyConnectedLayer(128, 'Name', 'img_fc')  % Image features
];

fprintf('   Image branch: %d layers\n', numel(imageLayers));
fprintf('   Output: 128-dimensional feature vector\n');
fprintf('\n');

%% 3. Tabular Branch (FCN)
fprintf('3. Tabular Branch (FCN):\n');
numFeatures = 10;  % Number of specification features
tabularLayers = [
    featureInputLayer(numFeatures, 'Name', 'tabular_input', 'Normalization', 'zscore')
    fullyConnectedLayer(64, 'Name', 'tab_fc1')
    batchNormalizationLayer('Name', 'tab_bn1')
    reluLayer('Name', 'tab_relu1')
    dropoutLayer(0.3, 'Name', 'tab_dropout1')
    fullyConnectedLayer(32, 'Name', 'tab_fc2')  % Tabular features
];

fprintf('   Tabular branch: %d layers\n', numel(tabularLayers));
fprintf('   Output: 32-dimensional feature vector\n');
fprintf('\n');

%% 4. Fusion and Output
fprintf('4. Fusion Layer:\n');
numClasses = 10;  % For classification (e.g., brand)
fusionLayers = [
    % Concatenate image and tabular features
    concatenationLayer(2, 2, 'Name', 'concat')  % Concatenates along dimension 2

    % Combined processing
    fullyConnectedLayer(128, 'Name', 'fusion_fc1')
    batchNormalizationLayer('Name', 'fusion_bn1')
    reluLayer('Name', 'fusion_relu1')
    dropoutLayer(0.4, 'Name', 'fusion_dropout1')

    fullyConnectedLayer(64, 'Name', 'fusion_fc2')
    reluLayer('Name', 'fusion_relu2')

    % Output
    fullyConnectedLayer(numClasses, 'Name', 'output_fc')
    softmaxLayer('Name', 'softmax')
    classificationLayer('Name', 'output')
];

fprintf('   Fusion layers: %d layers\n', numel(fusionLayers));
fprintf('   Combined features: 128 (image) + 32 (tabular) = 160 features\n');
fprintf('\n');

%% 5. Complete Network Assembly
fprintf('5. Assembling complete network:\n');
fprintf('   \n');
fprintf('   % Create layer graph\n');
fprintf('   lgraph = layerGraph(imageLayers);\n');
fprintf('   lgraph = addLayers(lgraph, tabularLayers);\n');
fprintf('   lgraph = addLayers(lgraph, fusionLayers);\n');
fprintf('   \n');
fprintf('   % Connect branches to fusion\n');
fprintf('   lgraph = connectLayers(lgraph, ''img_fc'', ''concat/in1'');\n');
fprintf('   lgraph = connectLayers(lgraph, ''tab_fc2'', ''concat/in2'');\n');
fprintf('   \n');
fprintf('   % Connect fusion to output\n');
fprintf('   lgraph = connectLayers(lgraph, ''concat'', ''fusion_fc1'');\n');
fprintf('\n');

%% 6. Data Preparation
fprintf('6. Data preparation:\n');
fprintf('   \n');
fprintf('   % Prepare image data\n');
fprintf('   imds = imageDatastore(''mobiles_dataset/images'', ...\n');
fprintf('       ''IncludeSubfolders'', true, ...\n');
fprintf('       ''LabelSource'', ''foldernames'');\n');
fprintf('   \n');
fprintf('   % Prepare tabular data\n');
fprintf('   data = readtable(''mobiles_dataset/mobiles.csv'');\n');
fprintf('   features = [data.RAM, data.Storage, data.ScreenSize, ...];\n');
fprintf('   \n');
fprintf('   % Create combined datastore\n');
fprintf('   % Note: You need to align images with tabular data by ID\n');
fprintf('   combinedDS = combine(imds, arrayDatastore(features));\n');
fprintf('\n');

%% 7. Training
fprintf('7. Training:\n');
fprintf('   \n');
fprintf('   options = trainingOptions(''adam'', ...\n');
fprintf('       ''MaxEpochs'', 50, ...\n');
fprintf('       ''InitialLearnRate'', 0.001, ...\n');
fprintf('       ''MiniBatchSize'', 16, ...  % Smaller batch for hybrid\n');
fprintf('       ''ExecutionEnvironment'', ''gpu'', ...\n');
fprintf('       ''Plots'', ''training-progress'');\n');
fprintf('   \n');
fprintf('   net = trainNetwork(combinedDS, lgraph, options);\n');
fprintf('\n');

fprintf('=== Hybrid Network Setup Complete ===\n');
fprintf('This network uses both visual and specification features!\n\n');
