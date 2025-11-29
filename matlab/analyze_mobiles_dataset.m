% Analyze Mobiles Dataset
% This script analyzes the dataset structure and suggests appropriate networks

fprintf('=== Mobiles Dataset Analysis ===\n\n');

%% 1. Check Dataset Structure
fprintf('1. Checking dataset structure...\n');

datasetPath = 'mobiles_dataset';
if ~exist(datasetPath, 'dir')
    fprintf('   Dataset folder not found. Please download the dataset first.\n');
    fprintf('   Run: kaggle datasets download abdulmalik1518/mobiles-dataset-2025\n');
    return;
end

% List files in dataset
files = dir(datasetPath);
fprintf('   Files in dataset:\n');
for i = 1:length(files)
    if ~files(i).isdir
        fprintf('     - %s\n', files(i).name);
    end
end
fprintf('\n');

%% 2. Check for Images
fprintf('2. Checking for image data...\n');
imageExtensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'};
imageFiles = [];
for i = 1:length(files)
    [~, ~, ext] = fileparts(files(i).name);
    if any(strcmpi(ext, imageExtensions))
        imageFiles = [imageFiles; files(i)];
    end
end

if ~isempty(imageFiles)
    fprintf('   ✓ Found %d image files\n', length(imageFiles));
    fprintf('   Image-based tasks possible:\n');
    fprintf('     - Image classification (phone brand/model)\n');
    fprintf('     - Object detection (phone features)\n');
    fprintf('     - Image similarity (find similar phones)\n');
else
    fprintf('   ✗ No image files found\n');
end
fprintf('\n');

%% 3. Check for CSV/Tabular Data
fprintf('3. Checking for tabular data...\n');
csvFiles = dir(fullfile(datasetPath, '*.csv'));
if ~isempty(csvFiles)
    fprintf('   ✓ Found %d CSV file(s)\n', length(csvFiles));
    for i = 1:length(csvFiles)
        fprintf('     - %s\n', csvFiles(i).name);

        % Try to read and analyze CSV
        try
            data = readtable(fullfile(datasetPath, csvFiles(i).name));
            fprintf('       Rows: %d, Columns: %d\n', height(data), width(data));
            fprintf('       Column names:\n');
            for j = 1:min(10, width(data))
                fprintf('         - %s\n', data.Properties.VariableNames{j});
            end
            if width(data) > 10
                fprintf('         ... and %d more columns\n', width(data) - 10);
            end
        catch ME
            fprintf('       Could not read CSV: %s\n', ME.message);
        end
    end
    fprintf('   Tabular data tasks possible:\n');
    fprintf('     - Price prediction (regression)\n');
    fprintf('     - Brand classification\n');
    fprintf('     - Feature prediction\n');
else
    fprintf('   ✗ No CSV files found\n');
end
fprintf('\n');

%% 4. Suggest Network Architectures
fprintf('4. Suggested Network Architectures:\n');
fprintf('   ---------------------------------\n\n');

if ~isempty(imageFiles)
    fprintf('   FOR IMAGE DATA:\n');
    fprintf('   ---------------\n');
    fprintf('   a) Convolutional Neural Network (CNN)\n');
    fprintf('      - Use: Image classification (brand/model)\n');
    fprintf('      - Architecture: Conv layers → Pooling → FC → Classification\n');
    fprintf('      - Example: See cnn_example.m\n\n');

    fprintf('   b) Transfer Learning (Pretrained Networks)\n');
    fprintf('      - Use: Quick training with limited data\n');
    fprintf('      - Models: ResNet, MobileNet, EfficientNet\n');
    fprintf('      - Advantage: Pretrained on ImageNet, fine-tune for phones\n\n');

    fprintf('   c) Siamese Network\n');
    fprintf('      - Use: Find similar phones by image\n');
    fprintf('      - Architecture: Twin CNNs with similarity layer\n\n');
end

if ~isempty(csvFiles)
    fprintf('   FOR TABULAR DATA:\n');
    fprintf('   -----------------\n');
    fprintf('   a) Fully Connected Neural Network (FCN)\n');
    fprintf('      - Use: Price prediction, feature prediction\n');
    fprintf('      - Architecture: Input → Hidden layers → Output\n');
    fprintf('      - Good for: Regression and classification\n\n');

    fprintf('   b) Deep Neural Network (DNN)\n');
    fprintf('      - Use: Complex feature relationships\n');
    fprintf('      - Architecture: Multiple hidden layers with dropout\n\n');

    fprintf('   c) TabNet or Tabular Networks\n');
    fprintf('      - Use: Structured tabular data\n');
    fprintf('      - Advantage: Designed specifically for tabular data\n\n');
end

fprintf('   HYBRID APPROACH:\n');
fprintf('   ---------------\n');
fprintf('   If dataset has both images and metadata:\n');
fprintf('   - Multi-input network: Image CNN + Tabular FCN → Fusion → Output\n');
fprintf('   - Use: Combine visual and specification features\n\n');

%% 5. Next Steps
fprintf('5. Next Steps:\n');
fprintf('   -----------\n');
fprintf('   1. Examine the actual data structure\n');
fprintf('   2. Identify your prediction task:\n');
fprintf('      - Classification: Brand, model, category\n');
fprintf('      - Regression: Price, rating, specifications\n');
fprintf('      - Similarity: Find similar phones\n');
fprintf('   3. Choose appropriate network architecture\n');
fprintf('   4. Prepare and preprocess data\n');
fprintf('   5. Train the network\n\n');

fprintf('=== Analysis Complete ===\n');
