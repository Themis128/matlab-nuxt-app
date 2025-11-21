% Generate Visualizations for GitHub README
% This script helps create screenshots and visualizations for the project documentation
%
% Usage:
%   run('docs/generate_visualizations.m')  % Executes automatically
%   generate_visualizations_impl()          % Or call the function directly

% Auto-execute when run as a script
% This allows the script to work with: run('docs/generate_visualizations.m')
generate_visualizations_impl();

% Local function (must have different name than script file)
function generate_visualizations_impl()
    % Create output directory if it doesn't exist
    outputDir = 'docs/images';
    if ~exist(outputDir, 'dir')
        mkdir(outputDir);
    end

    fprintf('Generating visualizations for GitHub README...\n\n');

    % 1. Network Architecture Visualization
    fprintf('1. Generating network architecture visualization...\n');
    try
        fig1 = figure('Position', [100, 100, 1200, 800], 'Visible', 'off');

        % Create a sample CNN network for visualization
        layers = [
            imageInputLayer([224 224 3], 'Name', 'input')
            convolution2dLayer(3, 16, 'Padding', 'same', 'Name', 'conv1')
            batchNormalizationLayer('Name', 'bn1')
            reluLayer('Name', 'relu1')
            maxPooling2dLayer(2, 'Stride', 2, 'Name', 'pool1')
            convolution2dLayer(3, 32, 'Padding', 'same', 'Name', 'conv2')
            batchNormalizationLayer('Name', 'bn2')
            reluLayer('Name', 'relu2')
            maxPooling2dLayer(2, 'Stride', 2, 'Name', 'pool2')
            fullyConnectedLayer(10, 'Name', 'fc')
            softmaxLayer('Name', 'softmax')
            classificationLayer('Name', 'output')
        ];

        lgraph = layerGraph(layers);
        plot(lgraph);
        title('Sample CNN Architecture', 'FontSize', 16, 'FontWeight', 'bold');

        % Export as PNG
        filename = fullfile(outputDir, 'network-visualization.png');
        exportgraphics(fig1, filename, 'Resolution', 300);
        fprintf('   ✓ Saved: %s\n', filename);
        close(fig1);
    catch ME
        fprintf('   ✗ Error: %s\n', ME.message);
    end

    % 2. Training Progress Visualization
    fprintf('2. Generating training progress visualization...\n');
    try
        fig2 = figure('Position', [100, 100, 1200, 800], 'Visible', 'off');

        % Simulate training progress data
        epochs = 1:50;
        trainLoss = 2.5 * exp(-epochs/15) + 0.1 + 0.05*rand(1, 50);
        trainAcc = 100 * (1 - trainLoss/2.5) + 5*rand(1, 50);
        trainAcc = min(trainAcc, 100);

        subplot(2, 1, 1);
        plot(epochs, trainLoss, 'b-', 'LineWidth', 2);
        xlabel('Epoch');
        ylabel('Loss');
        title('Training Loss', 'FontSize', 14, 'FontWeight', 'bold');
        grid on;

        subplot(2, 1, 2);
        plot(epochs, trainAcc, 'g-', 'LineWidth', 2);
        xlabel('Epoch');
        ylabel('Accuracy (%)');
        title('Training Accuracy', 'FontSize', 14, 'FontWeight', 'bold');
        ylim([0, 100]);
        grid on;

        sgtitle('Training Progress', 'FontSize', 16, 'FontWeight', 'bold');

        filename = fullfile(outputDir, 'training-progress.png');
        exportgraphics(fig2, filename, 'Resolution', 300);
        fprintf('   ✓ Saved: %s\n', filename);
        close(fig2);
    catch ME
        fprintf('   ✗ Error: %s\n', ME.message);
    end

    % 3. Dataset Analysis Visualization
    fprintf('3. Generating dataset analysis visualization...\n');
    try
        fig3 = figure('Position', [100, 100, 1280, 720], 'Visible', 'off');

        % Sample data analysis visualization
        brands = {'Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Google'};
        avgPrices = [899, 649, 399, 549, 699];
        marketShare = [25, 22, 18, 12, 8];

        subplot(1, 2, 1);
        bar(avgPrices, 'FaceColor', [0.2 0.6 0.8]);
        set(gca, 'XTickLabel', brands);
        xtickangle(45);
        ylabel('Average Price ($)');
        title('Average Price by Brand', 'FontSize', 14, 'FontWeight', 'bold');
        grid on;

        subplot(1, 2, 2);
        pie(marketShare, brands);
        title('Market Share Distribution', 'FontSize', 14, 'FontWeight', 'bold');

        sgtitle('Mobile Phones Dataset Analysis', 'FontSize', 16, 'FontWeight', 'bold');

        filename = fullfile(outputDir, 'dataset-analysis.png');
        exportgraphics(fig3, filename, 'Resolution', 300);
        fprintf('   ✓ Saved: %s\n', filename);
        close(fig3);
    catch ME
        fprintf('   ✗ Error: %s\n', ME.message);
    end

    % 4. Price Prediction Visualization
    fprintf('4. Generating price prediction visualization...\n');
    try
        fig4 = figure('Position', [100, 100, 1200, 800], 'Visible', 'off');

        % Sample price prediction data
        actualPrices = [299, 499, 699, 899, 1099, 1299];
        predictedPrices = [285, 512, 687, 915, 1085, 1312];
        models = {'Budget', 'Mid-Range', 'Premium', 'Flagship', 'Ultra', 'Pro'};

        x = 1:length(actualPrices);
        plot(x, actualPrices, 'o-', 'LineWidth', 2, 'MarkerSize', 10, 'DisplayName', 'Actual');
        hold on;
        plot(x, predictedPrices, 's-', 'LineWidth', 2, 'MarkerSize', 10, 'DisplayName', 'Predicted');
        set(gca, 'XTick', x, 'XTickLabel', models);
        xtickangle(45);
        ylabel('Price ($)');
        title('Price Prediction Model Performance', 'FontSize', 16, 'FontWeight', 'bold');
        legend('Location', 'northwest');
        grid on;

        filename = fullfile(outputDir, 'price-prediction.png');
        exportgraphics(fig4, filename, 'Resolution', 300);
        fprintf('   ✓ Saved: %s\n', filename);
        close(fig4);
    catch ME
        fprintf('   ✗ Error: %s\n', ME.message);
    end

    fprintf('\n✓ Visualization generation complete!\n');
    fprintf('  All images saved to: %s\n', outputDir);
    fprintf('\nNote: You still need to manually capture:\n');
    fprintf('  - web-interface-screenshot.png (from browser)\n');
    fprintf('  - capabilities-results.png (from web interface)\n');
    fprintf('  - quick-start-demo.gif (optional, screen recording)\n');
end
