% Neural Network for Mobile Phone Tabular Data
% This example shows how to create a network for tabular data (price prediction, etc.)

fprintf('=== Mobile Phone Tabular Data Network ===\n\n');

%% 1. Network Architecture for Tabular Data
fprintf('1. Creating network for tabular data...\n');

% Assuming you have features like: RAM, Storage, Screen Size, Camera, etc.
numFeatures = 10;  % Adjust based on your dataset columns
numHiddenUnits1 = 128;
numHiddenUnits2 = 64;
numHiddenUnits3 = 32;

% For Regression (e.g., price prediction)
layers_regression = [
    featureInputLayer(numFeatures, 'Name', 'input', 'Normalization', 'zscore')

    % Hidden layers
    fullyConnectedLayer(numHiddenUnits1, 'Name', 'fc1')
    batchNormalizationLayer('Name', 'bn1')
    reluLayer('Name', 'relu1')
    dropoutLayer(0.3, 'Name', 'dropout1')

    fullyConnectedLayer(numHiddenUnits2, 'Name', 'fc2')
    batchNormalizationLayer('Name', 'bn2')
    reluLayer('Name', 'relu2')
    dropoutLayer(0.2, 'Name', 'dropout2')

    fullyConnectedLayer(numHiddenUnits3, 'Name', 'fc3')
    reluLayer('Name', 'relu3')

    % Output layer for regression
    fullyConnectedLayer(1, 'Name', 'fc_output')
    regressionLayer('Name', 'output')
];

% For Classification (e.g., brand classification)
numClasses = 10;  % Number of brands/categories
layers_classification = [
    featureInputLayer(numFeatures, 'Name', 'input', 'Normalization', 'zscore')

    fullyConnectedLayer(numHiddenUnits1, 'Name', 'fc1')
    batchNormalizationLayer('Name', 'bn1')
    reluLayer('Name', 'relu1')
    dropoutLayer(0.3, 'Name', 'dropout1')

    fullyConnectedLayer(numHiddenUnits2, 'Name', 'fc2')
    batchNormalizationLayer('Name', 'bn2')
    reluLayer('Name', 'relu2')
    dropoutLayer(0.2, 'Name', 'dropout2')

    fullyConnectedLayer(numHiddenUnits3, 'Name', 'fc3')
    reluLayer('Name', 'relu3')

    % Output layer for classification
    fullyConnectedLayer(numClasses, 'Name', 'fc_output')
    softmaxLayer('Name', 'softmax')
    classificationLayer('Name', 'output')
];

fprintf('   Regression network: %d layers\n', numel(layers_regression));
fprintf('   Classification network: %d layers\n', numel(layers_classification));
fprintf('   Input features: %d\n', numFeatures);
fprintf('\n');

%% 2. Data Preparation Example
fprintf('2. Data preparation example:\n');
fprintf('   \n');
fprintf('   % Load CSV data\n');
fprintf('   data = readtable(''mobiles_dataset/mobiles.csv'');\n');
fprintf('   \n');
fprintf('   % Extract features (e.g., RAM, Storage, Screen Size, etc.)\n');
fprintf('   features = [data.RAM, data.Storage, data.ScreenSize, ...];\n');
fprintf('   \n');
fprintf('   % Extract target (e.g., Price for regression, Brand for classification)\n');
fprintf('   target = data.Price;  % For regression\n');
fprintf('   % or\n');
fprintf('   target = categorical(data.Brand);  % For classification\n');
fprintf('   \n');
fprintf('   % Normalize features\n');
fprintf('   features_normalized = normalize(features);\n');
fprintf('   \n');
fprintf('   % Split into train/validation/test\n');
fprintf('   [trainInd, valInd, testInd] = dividerand(height(data), 0.7, 0.15, 0.15);\n');
fprintf('   \n');
fprintf('   XTrain = features_normalized(trainInd, :);\n');
fprintf('   YTrain = target(trainInd);\n');
fprintf('   XVal = features_normalized(valInd, :);\n');
fprintf('   YVal = target(valInd);\n');
fprintf('\n');

%% 3. Training Options
fprintf('3. Training options:\n');
try
    gpuInfo = gpuDevice;
    executionEnvironment = 'gpu';
    fprintf('   GPU detected: %s\n', gpuInfo.Name);
catch
    executionEnvironment = 'cpu';
    fprintf('   Using CPU\n');
end

fprintf('   \n');
fprintf('   options = trainingOptions(''adam'', ...\n');
fprintf('       ''MaxEpochs'', 100, ...\n');
fprintf('       ''InitialLearnRate'', 0.001, ...\n');
fprintf('       ''MiniBatchSize'', 64, ...\n');
fprintf('       ''ValidationData'', {XVal, YVal}, ...\n');
fprintf('       ''ValidationFrequency'', 10, ...\n');
fprintf('       ''ExecutionEnvironment'', ''%s'', ...\n', executionEnvironment);
fprintf('       ''Plots'', ''training-progress'');\n');
fprintf('\n');

%% 4. Example Tasks
fprintf('4. Possible tasks with tabular data:\n');
fprintf('   \n');
fprintf('   a) Price Prediction (Regression)\n');
fprintf('      - Input: RAM, Storage, Screen Size, Camera, etc.\n');
fprintf('      - Output: Price\n');
fprintf('      - Network: Use layers_regression\n');
fprintf('   \n');
fprintf('   b) Brand Classification\n');
fprintf('      - Input: Phone specifications\n');
fprintf('      - Output: Brand (Samsung, Apple, etc.)\n');
fprintf('      - Network: Use layers_classification\n');
fprintf('   \n');
fprintf('   c) Feature Prediction\n');
fprintf('      - Input: Some specifications\n');
fprintf('      - Output: Missing specification (e.g., predict RAM from other features)\n');
fprintf('   \n');
fprintf('   d) Rating Prediction\n');
fprintf('      - Input: Specifications\n');
fprintf('      - Output: User rating or score\n');
fprintf('\n');

fprintf('=== Tabular Network Setup Complete ===\n');
