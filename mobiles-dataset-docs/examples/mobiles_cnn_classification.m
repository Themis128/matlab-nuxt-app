% CNN for Mobile Phone Image Classification
% This example shows how to create a CNN for classifying mobile phone images

fprintf('=== Mobile Phone Image Classification CNN ===\n\n');

%% 1. Network Architecture for Mobile Phone Classification
fprintf('1. Creating CNN architecture for mobile phone classification...\n');

% Assuming classification task (e.g., brand, model, or category)
numClasses = 10;  % Adjust based on your dataset (e.g., number of brands)

layers = [
    % Input layer for mobile phone images
    % Adjust size based on your images (e.g., 224x224x3 for RGB)
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

    % Fourth convolutional block (deeper network for better features)
    convolution2dLayer(3, 256, 'Padding', 'same', 'Name', 'conv4')
    batchNormalizationLayer('Name', 'bn4')
    reluLayer('Name', 'relu4')
    maxPooling2dLayer(2, 'Stride', 2, 'Name', 'pool4')

    % Fully connected layers
    fullyConnectedLayer(512, 'Name', 'fc1')
    reluLayer('Name', 'relu5')
    dropoutLayer(0.5, 'Name', 'dropout1')

    fullyConnectedLayer(256, 'Name', 'fc2')
    reluLayer('Name', 'relu6')
    dropoutLayer(0.3, 'Name', 'dropout2')

    % Output layer
    fullyConnectedLayer(numClasses, 'Name', 'fc3')
    softmaxLayer('Name', 'softmax')
    classificationLayer('Name', 'output')
];

lgraph = layerGraph(layers);

fprintf('   CNN created with %d layers\n', numel(layers));
fprintf('   Input: 224x224x3 RGB images\n');
fprintf('   Output: %d classes\n', numClasses);
fprintf('\n');

% Analyze network
analyzeNetwork(lgraph);

%% 2. Data Preparation Example
fprintf('2. Data preparation example:\n');
fprintf('   \n');
fprintf('   % Load images from folder structure\n');
fprintf('   imds = imageDatastore(''mobiles_dataset/images'', ...\n');
fprintf('       ''IncludeSubfolders'', true, ...\n');
fprintf('       ''LabelSource'', ''foldernames'');  % Labels from folder names\n');
fprintf('   \n');
fprintf('   % Split into training and validation\n');
fprintf('   [imdsTrain, imdsValidation] = splitEachLabel(imds, 0.7, ''randomized'');\n');
fprintf('   \n');
fprintf('   % Augment training data (optional but recommended)\n');
fprintf('   augmenter = imageDataAugmenter(...\n');
fprintf('       ''RandRotation'', [-20 20], ...\n');
fprintf('       ''RandXReflection'', true, ...\n');
fprintf('       ''RandScale'', [0.8 1.2]);\n');
fprintf('   augimdsTrain = augmentedImageDatastore([224 224], imdsTrain, ...\n');
fprintf('       ''DataAugmentation'', augmenter);\n');
fprintf('\n');

%% 3. Training Options
fprintf('3. Training options:\n');
try
    gpuInfo = gpuDevice;
    executionEnvironment = 'gpu';
    fprintf('   GPU detected: %s (%.2f GB)\n', gpuInfo.Name, gpuInfo.AvailableMemory / 1e9);
catch
    executionEnvironment = 'cpu';
    fprintf('   Using CPU\n');
end

fprintf('   \n');
fprintf('   options = trainingOptions(''adam'', ...\n');
fprintf('       ''MaxEpochs'', 50, ...\n');
fprintf('       ''InitialLearnRate'', 0.001, ...\n');
fprintf('       ''MiniBatchSize'', 32, ...\n');
fprintf('       ''ValidationData'', augimdsValidation, ...\n');
fprintf('       ''ValidationFrequency'', 10, ...\n');
fprintf('       ''ExecutionEnvironment'', ''%s'', ...\n', executionEnvironment);
fprintf('       ''Plots'', ''training-progress'');\n');
fprintf('\n');

%% 4. Transfer Learning Alternative
fprintf('4. Transfer Learning Alternative (Recommended):\n');
fprintf('   \n');
fprintf('   % Use pretrained network (faster, often better)\n');
fprintf('   net = resnet50;  % or mobilenetv2, efficientnet, etc.\n');
fprintf('   \n');
fprintf('   % Modify for your number of classes\n');
fprintf('   numClasses = 10;  % Your number of phone categories\n');
fprintf('   lgraph = layerGraph(net);\n');
fprintf('   newLayers = [\n');
fprintf('       fullyConnectedLayer(numClasses, ''Name'', ''fc_new'')\n');
fprintf('       softmaxLayer(''Name'', ''softmax_new'')\n');
fprintf('       classificationLayer(''Name'', ''output_new'')];\n');
fprintf('   lgraph = replaceLayer(lgraph, ''fc1000'', newLayers(1));\n');
fprintf('   lgraph = replaceLayer(lgraph, ''fc1000_softmax'', newLayers(2));\n');
fprintf('   lgraph = replaceLayer(lgraph, ''ClassificationLayer_fc1000'', newLayers(3));\n');
fprintf('   \n');
fprintf('   % Freeze early layers, train only new layers\n');
fprintf('   layers = lgraph.Layers;\n');
fprintf('   for i = 1:length(layers)\n');
fprintf('       if isa(layers(i), ''nnet.cnn.layer.Convolution2DLayer'')\n');
fprintf('           layers(i).WeightLearnRateFactor = 0;  % Freeze\n');
fprintf('       end\n');
fprintf('   end\n');
fprintf('\n');

fprintf('=== CNN Setup Complete ===\n');
fprintf('Ready to train on mobile phone images!\n\n');
