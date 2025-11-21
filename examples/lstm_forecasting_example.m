% LSTM Time Series Forecasting Example
% This example shows how to create and train an LSTM for time series forecasting

fprintf('=== LSTM Time Series Forecasting ===\n\n');

%% 1. First, prepare the data (run data preparation script)
fprintf('1. Preparing time series data...\n');
run('examples/time_series_data_preparation.m');

% Note: The data preparation script creates:
% - XTrain, XVal, XTest (cell arrays of input sequences)
% - YTrain, YVal, YTest (cell arrays of output sequences)

%% 2. Define LSTM Network Architecture
fprintf('\n2. Creating LSTM network architecture...\n');

% Network parameters
numFeatures = 1;  % Number of input features
numHiddenUnits = 128;  % Number of LSTM hidden units
forecastHorizon = 7;  % Number of steps to predict ahead

% Create layers
layers = [
    % Input layer for sequences
    sequenceInputLayer(numFeatures, 'Name', 'input')

    % LSTM layers
    lstmLayer(numHiddenUnits, 'OutputMode', 'sequence', 'Name', 'lstm1')
    dropoutLayer(0.2, 'Name', 'dropout1')

    % Optional: Add another LSTM layer
    % lstmLayer(64, 'OutputMode', 'sequence', 'Name', 'lstm2')
    % dropoutLayer(0.2, 'Name', 'dropout2')

    % Fully connected layer to output forecast horizon
    fullyConnectedLayer(forecastHorizon, 'Name', 'fc')

    % Regression output (for forecasting numeric values)
    regressionLayer('Name', 'output')
];

lgraph = layerGraph(layers);

fprintf('   Network created with %d layers\n', numel(layers));
fprintf('   LSTM hidden units: %d\n', numHiddenUnits);
fprintf('   Forecast horizon: %d steps\n', forecastHorizon);
fprintf('\n');

% Analyze network
analyzeNetwork(lgraph);

%% 3. Set Up Training Options
fprintf('3. Setting up training options...\n');

% Check GPU availability
try
    gpuInfo = gpuDevice;
    executionEnvironment = 'gpu';
    fprintf('   GPU detected: %s (%.2f GB)\n', gpuInfo.Name, gpuInfo.AvailableMemory / 1e9);
catch
    executionEnvironment = 'cpu';
    fprintf('   Using CPU (GPU not available)\n');
end

% Training options
options = trainingOptions('adam', ...
    'MaxEpochs', 100, ...
    'MiniBatchSize', 32, ...
    'InitialLearnRate', 0.001, ...
    'GradientThreshold', 1, ...
    'Shuffle', 'never', ...  % Don't shuffle for time series
    'Verbose', true, ...
    'Plots', 'training-progress', ...
    'ValidationData', {XVal, YVal}, ...
    'ValidationFrequency', 10, ...
    'ExecutionEnvironment', executionEnvironment, ...
    'LearnRateSchedule', 'piecewise', ...
    'LearnRateDropPeriod', 30, ...
    'LearnRateDropFactor', 0.2);

fprintf('   Training options configured:\n');
fprintf('     - Optimizer: Adam\n');
fprintf('     - Max Epochs: 100\n');
fprintf('     - Learning Rate: 0.001 (with schedule)\n');
fprintf('     - Mini Batch Size: 32\n');
fprintf('     - Execution: %s\n', upper(executionEnvironment));
fprintf('\n');

%% 4. Train the Network
fprintf('4. Training LSTM network...\n');
fprintf('   This may take several minutes depending on data size and GPU...\n\n');

% Uncomment to actually train (commented out to avoid long execution)
% net = trainNetwork(XTrain, YTrain, lgraph, options);

fprintf('   [Training code ready - uncomment to train]\n');
fprintf('   net = trainNetwork(XTrain, YTrain, lgraph, options);\n\n');

%% 5. Make Predictions (Example)
fprintf('5. Example prediction workflow:\n');
fprintf('   After training, you can predict:\n');
fprintf('   \n');
fprintf('   % Make predictions on test set\n');
fprintf('   YPred = predict(net, XTest);\n');
fprintf('   \n');
fprintf('   % Denormalize predictions (if you normalized data)\n');
fprintf('   % Convert cell array to numeric for denormalization\n');
fprintf('   YPred_numeric = cell2mat(YPred'');\n');
fprintf('   YTest_numeric = cell2mat(YTest'');\n');
fprintf('   YPred_original = YPred_numeric * data_std + data_mean;\n');
fprintf('   YTest_original = YTest_numeric * data_std + data_mean;\n');
fprintf('   \n');
fprintf('   % Calculate metrics\n');
fprintf('   rmse = sqrt(mean((YPred_original - YTest_original).^2, ''all''));\n');
fprintf('   mae = mean(abs(YPred_original - YTest_original), ''all'');\n');
fprintf('   \n');
fprintf('   % Visualize predictions\n');
fprintf('   plot(YTest_original(1,:)); hold on; plot(YPred_original(1,:));\n');
fprintf('\n');

%% 6. Forecast Future Values
fprintf('6. Forecasting future values:\n');
fprintf('   To forecast beyond your data:\n');
fprintf('   \n');
fprintf('   % Use last sequence from your data\n');
fprintf('   lastSequence = XTest{end};  % Last known sequence\n');
fprintf('   \n');
fprintf('   % Predict next steps\n');
fprintf('   futureForecast = predict(net, {lastSequence});\n');
fprintf('   \n');
fprintf('   % Denormalize\n');
fprintf('   futureForecast_original = futureForecast * data_std + data_mean;\n');
fprintf('\n');

%% Summary
fprintf('=== LSTM Forecasting Setup Complete ===\n\n');
fprintf('Network Architecture:\n');
fprintf('  - Input: Sequences of %d time steps\n', sequenceLength);
fprintf('  - LSTM: %d hidden units\n', numHiddenUnits);
fprintf('  - Output: %d future time steps\n', forecastHorizon);
fprintf('\n');
fprintf('Ready to train and forecast!\n');
fprintf('Uncomment the training line to start training.\n\n');

if strcmp(executionEnvironment, 'gpu')
    fprintf('✓ Your RTX 3070 GPU will accelerate training!\n');
end
