% Regional Price Analysis
% Analyzes price differences across regions (Pakistan, India, China, USA, Dubai)
% Usage: regional_analysis = analyze_regional_prices()
%
% Output:
%   regional_analysis - Structure with regional price analysis

function regional_analysis = analyze_regional_prices()
    fprintf('=== Regional Price Analysis ===\n\n');

    % Load dataset
    try
        data = readtable('Mobiles Dataset (2025).csv');
        fprintf('   ✓ Dataset loaded: %d rows\n', height(data));
    catch ME
        error('Failed to load dataset: %s', ME.message);
    end

    % Find regional price columns
    colNames = data.Properties.VariableNames;
    regions = {'Pakistan', 'India', 'China', 'USA', 'Dubai'};
    regionCols = {};
    regionData = {};

    for i = 1:length(regions)
        region = regions{i};
        % Try different column name formats
        possibleNames = {
            sprintf('LaunchedPrice_%s', region),
            sprintf('Launched_Price_%s', region),
            sprintf('Price_%s', region),
            sprintf('Launched Price (%s)', region)
        };

        found = false;
        for j = 1:length(possibleNames)
            if ismember(possibleNames{j}, colNames)
                regionCols{i} = possibleNames{j};
                found = true;
                break;
            end
        end

        if ~found
            % Try case-insensitive search
            for j = 1:length(colNames)
                if contains(colNames{j}, region, 'IgnoreCase', true) && ...
                   (contains(colNames{j}, 'Price', 'IgnoreCase', true) || ...
                    contains(colNames{j}, 'Pakistan', 'IgnoreCase', true))
                    regionCols{i} = colNames{j};
                    found = true;
                    break;
                end
            end
        end

        if found
            % Parse prices
            priceCol = data.(regionCols{i});
            prices = zeros(height(data), 1);
            for k = 1:height(data)
                if iscell(priceCol(k))
                    priceStr = priceCol{k};
                else
                    priceStr = string(priceCol(k));
                end
                % Remove currency symbols and extract number
                priceStr = strrep(priceStr, ',', '');
                priceNum = regexp(priceStr, '([\d.]+)', 'match', 'once');
                if ~isempty(priceNum)
                    prices(k) = str2double(priceNum);
                end
            end
            regionData{i} = prices;
            fprintf('   ✓ %s prices parsed: %d valid values\n', region, sum(prices > 0));
        else
            warning('Price column for %s not found', region);
            regionData{i} = [];
        end
    end

    % Analyze regional differences
    fprintf('\nStep 2: Analyzing regional price differences...\n\n');

    regional_analysis = struct();
    regional_analysis.regions = regions;
    regional_analysis.regionData = regionData;

    % Calculate statistics for each region
    for i = 1:length(regions)
        if ~isempty(regionData{i})
            prices = regionData{i}(regionData{i} > 0);
            if ~isempty(prices)
                fprintf('--- %s ---\n', regions{i});
                fprintf('   Valid prices: %d\n', length(prices));
                fprintf('   Mean: %.2f\n', mean(prices));
                fprintf('   Median: %.2f\n', median(prices));
                fprintf('   Min: %.2f\n', min(prices));
                fprintf('   Max: %.2f\n', max(prices));
                fprintf('   Std Dev: %.2f\n\n', std(prices));

                regional_analysis.(regions{i}) = struct();
                regional_analysis.(regions{i}).mean = mean(prices);
                regional_analysis.(regions{i}).median = median(prices);
                regional_analysis.(regions{i}).min = min(prices);
                regional_analysis.(regions{i}).max = max(prices);
                regional_analysis.(regions{i}).std = std(prices);
                regional_analysis.(regions{i}).count = length(prices);
            end
        end
    end

    % Calculate conversion factors (relative to USA)
    if ~isempty(regionData{4}) && sum(regionData{4} > 0) > 0
        usaPrices = regionData{4}(regionData{4} > 0);
        fprintf('--- Conversion Factors (relative to USA) ---\n');
        for i = 1:length(regions)
            if i ~= 4 && ~isempty(regionData{i})
                regionPrices = regionData{i}(regionData{i} > 0);
                if ~isempty(regionPrices)
                    % Find common phones (same indices)
                    commonIdx = (regionData{4} > 0) & (regionData{i} > 0);
                    if sum(commonIdx) > 10
                        usaCommon = regionData{4}(commonIdx);
                        regionCommon = regionData{i}(commonIdx);
                        conversionFactor = mean(regionCommon ./ usaCommon);
                        fprintf('   %s: %.4f (1 USD = %.4f %s)\n', ...
                            regions{i}, conversionFactor, conversionFactor, regions{i});
                        regional_analysis.(regions{i}).conversionFactor = conversionFactor;
                    end
                end
            end
        end
        fprintf('\n');
    end

    % Create visualization
    fprintf('Step 3: Creating visualization...\n');

    figure('Position', [100, 100, 1400, 600], 'Color', 'white');

    % Box plot of prices by region
    subplot(1, 2, 1);
    priceData = {};
    regionLabels = {};
    for i = 1:length(regions)
        if ~isempty(regionData{i})
            prices = regionData{i}(regionData{i} > 0);
            if ~isempty(prices)
                priceData{end+1} = prices;
                regionLabels{end+1} = regions{i};
            end
        end
    end

    if ~isempty(priceData)
        boxplot(cell2mat(priceData'), regionLabels);
        ylabel('Price', 'FontSize', 12, 'FontWeight', 'bold');
        title('Price Distribution by Region', 'FontSize', 13, 'FontWeight', 'bold');
        grid on;
        xtickangle(45);
    end

    % Average price comparison
    subplot(1, 2, 2);
    avgPrices = [];
    regionNames = {};
    for i = 1:length(regions)
        if isfield(regional_analysis, regions{i}) && ...
           isfield(regional_analysis.(regions{i}), 'mean')
            avgPrices(end+1) = regional_analysis.(regions{i}).mean;
            regionNames{end+1} = regions{i};
        end
    end

    if ~isempty(avgPrices)
        bar(avgPrices, 'FaceColor', '#4ECDC4', 'EdgeColor', 'black');
        set(gca, 'XTickLabel', regionNames);
        ylabel('Average Price', 'FontSize', 12, 'FontWeight', 'bold');
        title('Average Price by Region', 'FontSize', 13, 'FontWeight', 'bold');
        grid on;
        xtickangle(45);
    end

    sgtitle('Regional Price Analysis', 'FontSize', 16, 'FontWeight', 'bold');

    % Save visualization
    if ~exist('visualizations', 'dir')
        mkdir('visualizations');
    end
    filename = 'visualizations/regional_price_analysis.png';
    saveas(gcf, filename);
    fprintf('   ✓ Saved: %s\n', filename);
    close(gcf);

    % Save results
    if ~exist('analysis_results', 'dir')
        mkdir('analysis_results');
    end
    save('analysis_results/regional_price_analysis.mat', 'regional_analysis');
    fprintf('   ✓ Results saved to: analysis_results/regional_price_analysis.mat\n');

    fprintf('\n=== Regional Price Analysis Complete ===\n\n');
end
