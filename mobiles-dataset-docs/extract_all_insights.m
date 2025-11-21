% Extract All Insights from Mobile Phones Dataset
% This script performs comprehensive analysis to extract:
% 1. Price Drivers Analysis
% 2. Market Trends Analysis
% 3. Competitive Analysis
% 4. Recommendation Systems
% 5. Anomaly Detection

fprintf('=== Comprehensive Mobile Phones Dataset Insights Extraction ===\n\n');

%% Load Dataset
fprintf('Loading dataset...\n');
try
    data = readtable('Mobiles Dataset (2025).csv');
    fprintf('   ✓ Dataset loaded: %d rows, %d columns\n\n', height(data), width(data));
catch ME
    fprintf('   ✗ Error loading dataset: %s\n', ME.message);
    fprintf('   Please ensure the CSV file is in the current directory.\n');
    return;
end

%% Data Preprocessing
fprintf('Preprocessing data...\n');

% Extract numerical features
% Note: MATLAB readtable converts spaces to underscores in variable names
% Parse RAM (remove 'GB' and convert to number)
ram = zeros(height(data), 1);
ramCol = data.RAM;
for i = 1:height(data)
    if iscell(ramCol(i))
        ramStr = ramCol{i};
    else
        ramStr = string(ramCol(i));
    end
    ramNum = regexp(ramStr, '(\d+)', 'match');
    if ~isempty(ramNum)
        ram(i) = str2double(ramNum{1});
    end
end

% Parse Battery Capacity (remove 'mAh' and convert)
battery = zeros(height(data), 1);
batColName = 'BatteryCapacity';
if ~ismember(batColName, data.Properties.VariableNames)
    batColName = 'Battery_Capacity';
end
batCol = data.(batColName);
for i = 1:height(data)
    if iscell(batCol(i))
        batStr = batCol{i};
    else
        batStr = string(batCol(i));
    end
    batNum = regexp(batStr, '([\d,]+)', 'match');
    if ~isempty(batNum)
        batClean = strrep(batNum{1}, ',', '');
        battery(i) = str2double(batClean);
    end
end

% Parse Screen Size (extract number)
screenSize = zeros(height(data), 1);
screenColName = 'ScreenSize';
if ~ismember(screenColName, data.Properties.VariableNames)
    screenColName = 'Screen_Size';
end
screenCol = data.(screenColName);
for i = 1:height(data)
    if iscell(screenCol(i))
        screenStr = screenCol{i};
    else
        screenStr = string(screenCol(i));
    end
    screenNum = regexp(screenStr, '(\d+\.?\d*)', 'match');
    if ~isempty(screenNum)
        screenSize(i) = str2double(screenNum{1});
    end
end

% Parse Weight (remove 'g' and convert)
weight = zeros(height(data), 1);
weightCol = data.('Mobile_Weight');
for i = 1:height(data)
    if iscell(weightCol(i))
        weightStr = weightCol{i};
    else
        weightStr = string(weightCol(i));
    end
    weightNum = regexp(weightStr, '(\d+)', 'match');
    if ~isempty(weightNum)
        weight(i) = str2double(weightNum{1});
    end
end

% Parse Prices (remove currency symbols and convert)
priceUSD = zeros(height(data), 1);
priceColName = 'LaunchedPrice_USA_';
if ~ismember(priceColName, data.Properties.VariableNames)
    if ismember('Launched_Price_USA', data.Properties.VariableNames)
        priceColName = 'Launched_Price_USA';
    else
        priceColName = 'LaunchedPriceUSA';
    end
end
priceCol = data.(priceColName);
for i = 1:height(data)
    if iscell(priceCol(i))
        priceStr = priceCol{i};
    else
        priceStr = string(priceCol(i));
    end
    % Remove currency symbols and extract number
    priceStr = strrep(priceStr, 'USD', '');
    priceStr = strrep(priceStr, '$', '');
    priceNum = regexp(priceStr, '([\d,]+)', 'match');
    if ~isempty(priceNum)
        priceClean = strrep(priceNum{1}, ',', '');
        priceUSD(i) = str2double(priceClean);
    end
end

% Extract year
yearColName = 'LaunchedYear';
if ~ismember(yearColName, data.Properties.VariableNames)
    yearColName = 'Launched_Year';
end
year = data.(yearColName);

% Extract company names
companyColName = 'CompanyName';
if ~ismember(companyColName, data.Properties.VariableNames)
    companyColName = 'Company_Name';
end
companyCol = data.(companyColName);
if iscell(companyCol)
    companies = categorical(companyCol);
else
    companies = categorical(companyCol);
end

fprintf('   ✓ Data preprocessing complete\n\n');

%% ========================================================================
% INSIGHT 1: PRICE DRIVERS ANALYSIS
% ========================================================================
fprintf('=================================================================\n');
fprintf('INSIGHT 1: PRICE DRIVERS ANALYSIS\n');
fprintf('=================================================================\n\n');

% Remove rows with missing critical data
validIdx = ~isnan(ram) & ~isnan(battery) & ~isnan(screenSize) & ...
           ~isnan(weight) & ~isnan(priceUSD) & priceUSD > 0;
ram_clean = ram(validIdx);
battery_clean = battery(validIdx);
screenSize_clean = screenSize(validIdx);
weight_clean = weight(validIdx);
priceUSD_clean = priceUSD(validIdx);
year_clean = year(validIdx);
companies_clean = companies(validIdx);

% Feature importance using correlation
features = [ram_clean, battery_clean, screenSize_clean, weight_clean];
featureNames = {'RAM (GB)', 'Battery (mAh)', 'Screen Size (inches)', 'Weight (g)'};

fprintf('1.1 Feature Correlation with Price:\n');
fprintf('   ---------------------------------\n');
correlations = zeros(1, size(features, 2));
for i = 1:size(features, 2)
    validCorr = ~isnan(features(:, i)) & ~isnan(priceUSD_clean);
    if sum(validCorr) > 10
        corrVal = corrcoef(features(validCorr, i), priceUSD_clean(validCorr));
        correlations(i) = corrVal(1, 2);
        fprintf('   %s: %.4f\n', featureNames{i}, correlations(i));
    end
end

% Sort by absolute correlation
[~, sortIdx] = sort(abs(correlations), 'descend');
fprintf('\n   Ranked by impact on price:\n');
for i = 1:length(sortIdx)
    fprintf('   %d. %s (correlation: %.4f)\n', i, featureNames{sortIdx(i)}, correlations(sortIdx(i)));
end

% Regional pricing differences
fprintf('\n1.2 Regional Pricing Differences:\n');
fprintf('   ---------------------------------\n');

% Parse all regional prices
regions = {'Pakistan', 'India', 'China', 'USA', 'Dubai'};
regionColumns = {'LaunchedPrice_Pakistan_', 'LaunchedPrice_India_', ...
                 'LaunchedPrice_China_', 'LaunchedPrice_USA_', 'LaunchedPrice_Dubai_'};
% Try alternative names if not found
altRegionColumns = {'Launched_Price_Pakistan', 'Launched_Price_India', ...
                    'Launched_Price_China', 'Launched_Price_USA', 'Launched_Price_Dubai'};
regionPrices = zeros(height(data), length(regions));

for r = 1:length(regions)
    colName = regionColumns{r};
    % Try alternative name if primary not found
    if ~ismember(colName, data.Properties.VariableNames) && r <= length(altRegionColumns)
        colName = altRegionColumns{r};
    end
    if ismember(colName, data.Properties.VariableNames)
        priceCol = data.(colName);
        for i = 1:height(data)
            if iscell(priceCol(i))
                priceStr = priceCol{i};
            else
                priceStr = string(priceCol(i));
            end
            % Remove currency symbols
            priceStr = regexprep(priceStr, '[A-Z]{3}\s*', '');  % Remove currency codes
            priceStr = regexprep(priceStr, '[^\d,]', '');  % Keep only digits and commas
            priceNum = regexp(priceStr, '([\d,]+)', 'match');
            if ~isempty(priceNum)
                priceClean = strrep(priceNum{1}, ',', '');
                regionPrices(i, r) = str2double(priceClean);
            end
        end
    end
end

% Calculate average prices by region (normalize to USD for comparison)
fprintf('   Average prices (first 100 phones):\n');
for r = 1:length(regions)
    validPrices = regionPrices(1:min(100, height(data)), r);
    validPrices = validPrices(validPrices > 0);
    if ~isempty(validPrices)
        avgPrice = mean(validPrices);
        fprintf('   %s: %.2f (local currency)\n', regions{r}, avgPrice);
    end
end

% Price premium analysis by brand
fprintf('\n1.3 Price Premium by Brand:\n');
fprintf('   ---------------------------------\n');
uniqueCompanies = categories(companies_clean);
brandAvgPrices = zeros(length(uniqueCompanies), 1);
for i = 1:length(uniqueCompanies)
    brandIdx = companies_clean == uniqueCompanies{i};
    if sum(brandIdx) > 0
        brandAvgPrices(i) = mean(priceUSD_clean(brandIdx));
    end
end
[~, brandSortIdx] = sort(brandAvgPrices, 'descend');
fprintf('   Top 10 brands by average price:\n');
for i = 1:min(10, length(uniqueCompanies))
    idx = brandSortIdx(i);
    fprintf('   %d. %s: $%.2f\n', i, uniqueCompanies{idx}, brandAvgPrices(idx));
end

fprintf('\n');

%% ========================================================================
% INSIGHT 2: MARKET TRENDS ANALYSIS
% ========================================================================
fprintf('=================================================================\n');
fprintf('INSIGHT 2: MARKET TRENDS ANALYSIS\n');
fprintf('=================================================================\n\n');

% Technology evolution over years
fprintf('2.1 Technology Evolution Over Years:\n');
fprintf('   ---------------------------------\n');
uniqueYears = unique(year_clean);
uniqueYears = sort(uniqueYears(~isnan(uniqueYears)));

avgRAMByYear = zeros(length(uniqueYears), 1);
avgBatteryByYear = zeros(length(uniqueYears), 1);
avgScreenByYear = zeros(length(uniqueYears), 1);
avgPriceByYear = zeros(length(uniqueYears), 1);

for i = 1:length(uniqueYears)
    yearIdx = year_clean == uniqueYears(i);
    if sum(yearIdx) > 0
        avgRAMByYear(i) = mean(ram_clean(yearIdx));
        avgBatteryByYear(i) = mean(battery_clean(yearIdx));
        avgScreenByYear(i) = mean(screenSize_clean(yearIdx));
        avgPriceByYear(i) = mean(priceUSD_clean(yearIdx));
    end
end

fprintf('   Year | Avg RAM | Avg Battery | Avg Screen | Avg Price\n');
fprintf('   -----|---------|--------------|------------|----------\n');
for i = 1:length(uniqueYears)
    fprintf('   %d  | %.1f GB  | %.0f mAh     | %.1f"      | $%.0f\n', ...
        uniqueYears(i), avgRAMByYear(i), avgBatteryByYear(i), ...
        avgScreenByYear(i), avgPriceByYear(i));
end

% Technology adoption patterns
fprintf('\n2.2 Technology Adoption Patterns:\n');
fprintf('   ---------------------------------\n');

% RAM trends
ramIncrease = (avgRAMByYear(end) - avgRAMByYear(1)) / avgRAMByYear(1) * 100;
fprintf('   RAM: Increased by %.1f%% from %d to %d\n', ...
    ramIncrease, uniqueYears(1), uniqueYears(end));

% Battery trends
batteryIncrease = (avgBatteryByYear(end) - avgBatteryByYear(1)) / avgBatteryByYear(1) * 100;
fprintf('   Battery: Increased by %.1f%% from %d to %d\n', ...
    batteryIncrease, uniqueYears(1), uniqueYears(end));

% Screen size trends
screenIncrease = (avgScreenByYear(end) - avgScreenByYear(1)) / avgScreenByYear(1) * 100;
fprintf('   Screen Size: Increased by %.1f%% from %d to %d\n', ...
    screenIncrease, uniqueYears(1), uniqueYears(end));

% Price trends
priceChange = (avgPriceByYear(end) - avgPriceByYear(1)) / avgPriceByYear(1) * 100;
fprintf('   Price: Changed by %.1f%% from %d to %d\n', ...
    priceChange, uniqueYears(1), uniqueYears(end));

% Price trends by region
fprintf('\n2.3 Price Trends by Region:\n');
fprintf('   ---------------------------------\n');
fprintf('   (Analyzing first 100 phones for trend analysis)\n');
% This would require more detailed analysis with full dataset

fprintf('\n');

%% ========================================================================
% INSIGHT 3: COMPETITIVE ANALYSIS
% ========================================================================
fprintf('=================================================================\n');
fprintf('INSIGHT 3: COMPETITIVE ANALYSIS\n');
fprintf('=================================================================\n\n');

fprintf('3.1 Brand Positioning by Specifications:\n');
fprintf('   ---------------------------------\n');

% Calculate average specs by brand
brandStats = struct();
for i = 1:length(uniqueCompanies)
    brandIdx = companies_clean == uniqueCompanies{i};
    if sum(brandIdx) > 5  % Only brands with sufficient data
        brandStats(i).name = uniqueCompanies{i};
        brandStats(i).avgRAM = mean(ram_clean(brandIdx));
        brandStats(i).avgBattery = mean(battery_clean(brandIdx));
        brandStats(i).avgScreen = mean(screenSize_clean(brandIdx));
        brandStats(i).avgPrice = mean(priceUSD_clean(brandIdx));
        brandStats(i).count = sum(brandIdx);
    end
end

% Value-for-money analysis (specs per dollar)
fprintf('\n3.2 Value-for-Money Analysis:\n');
fprintf('   ---------------------------------\n');
fprintf('   (Higher score = better value)\n\n');

valueScores = zeros(length(uniqueCompanies), 1);
for i = 1:length(uniqueCompanies)
    brandIdx = companies_clean == uniqueCompanies{i};
    if sum(brandIdx) > 5 && mean(priceUSD_clean(brandIdx)) > 0
        % Calculate value score: (RAM + Battery/100 + Screen*10) / Price
        valueScore = (mean(ram_clean(brandIdx)) + ...
                     mean(battery_clean(brandIdx))/100 + ...
                     mean(screenSize_clean(brandIdx))*10) / ...
                     mean(priceUSD_clean(brandIdx));
        valueScores(i) = valueScore;
    end
end

[~, valueSortIdx] = sort(valueScores, 'descend');
fprintf('   Top 10 brands by value-for-money:\n');
for i = 1:min(10, length(uniqueCompanies))
    idx = valueSortIdx(i);
    if valueScores(idx) > 0
        fprintf('   %d. %s: %.4f (value score)\n', i, uniqueCompanies{idx}, valueScores(idx));
    end
end

% Market gaps identification
fprintf('\n3.3 Market Gaps Identification:\n');
fprintf('   ---------------------------------\n');
fprintf('   Analyzing specification combinations...\n');

% Find phones with unusual spec combinations
% High RAM + Low Price
highRAMLowPrice = ram_clean > prctile(ram_clean, 75) & ...
                  priceUSD_clean < prctile(priceUSD_clean, 25);
if sum(highRAMLowPrice) > 0
    fprintf('   Found %d phones with high RAM but low price (potential value)\n', sum(highRAMLowPrice));
end

% High Battery + Low Price
highBatteryLowPrice = battery_clean > prctile(battery_clean, 75) & ...
                      priceUSD_clean < prctile(priceUSD_clean, 25);
if sum(highBatteryLowPrice) > 0
    fprintf('   Found %d phones with high battery but low price (potential value)\n', sum(highBatteryLowPrice));
end

fprintf('\n');

%% ========================================================================
% INSIGHT 4: RECOMMENDATION SYSTEMS
% ========================================================================
fprintf('=================================================================\n');
fprintf('INSIGHT 4: RECOMMENDATION SYSTEMS\n');
fprintf('=================================================================\n\n');

fprintf('4.1 Similar Phone Finder:\n');
fprintf('   ---------------------------------\n');
fprintf('   (Finding phones with similar specifications)\n\n');

% Normalize features for similarity calculation
features_normalized = [ram_clean, battery_clean, screenSize_clean, weight_clean];
for i = 1:size(features_normalized, 2)
    col = features_normalized(:, i);
    features_normalized(:, i) = (col - min(col)) / (max(col) - min(col) + eps);
end

% Example: Find phones similar to the first phone
exampleIdx = 1;
exampleFeatures = features_normalized(exampleIdx, :);

% Calculate Euclidean distance
distances = zeros(length(ram_clean), 1);
for i = 1:length(ram_clean)
    if i ~= exampleIdx
        distances(i) = sqrt(sum((features_normalized(i, :) - exampleFeatures).^2));
    else
        distances(i) = inf;
    end
end

% Find top 5 similar phones
[~, similarIdx] = sort(distances);
fprintf('   Example: Finding phones similar to phone #%d\n', exampleIdx);
fprintf('   Top 5 most similar phones:\n');
for i = 1:min(5, length(similarIdx))
    idx = similarIdx(i);
    fprintf('   %d. Phone #%d (distance: %.4f)\n', i, idx, distances(idx));
    fprintf('      RAM: %.0fGB, Battery: %.0fmAh, Screen: %.1f", Price: $%.0f\n', ...
        ram_clean(idx), battery_clean(idx), screenSize_clean(idx), priceUSD_clean(idx));
end

% Budget-based recommendations
fprintf('\n4.2 Budget-Based Recommendations:\n');
fprintf('   ---------------------------------\n');
budget = 500;  % Example budget
budgetPhones = priceUSD_clean <= budget;
if sum(budgetPhones) > 0
    budgetFeatures = features_normalized(budgetPhones, :);
    budgetPrices = priceUSD_clean(budgetPhones);

    % Find best value phones within budget
    valueScores_budget = zeros(sum(budgetPhones), 1);
    for i = 1:sum(budgetPhones)
        if budgetPrices(i) > 0
            valueScores_budget(i) = (sum(budgetFeatures(i, :))) / budgetPrices(i);
        end
    end

    [~, bestValueIdx] = sort(valueScores_budget, 'descend');
    budgetIndices = find(budgetPhones);

    fprintf('   Top 5 best value phones under $%d:\n', budget);
    for i = 1:min(5, length(bestValueIdx))
        idx = budgetIndices(bestValueIdx(i));
        fprintf('   %d. Phone #%d: $%.0f\n', i, idx, priceUSD_clean(idx));
        fprintf('      RAM: %.0fGB, Battery: %.0fmAh, Screen: %.1f"\n', ...
            ram_clean(idx), battery_clean(idx), screenSize_clean(idx));
    end
end

fprintf('\n');

%% ========================================================================
% INSIGHT 5: ANOMALY DETECTION
% ========================================================================
fprintf('=================================================================\n');
fprintf('INSIGHT 5: ANOMALY DETECTION\n');
fprintf('=================================================================\n\n');

fprintf('5.1 Overpriced/Underpriced Phone Detection:\n');
fprintf('   ---------------------------------\n');

% Build a simple price prediction model (linear regression)
% Use features to predict price
validModelIdx = ~isnan(features_normalized(:, 1)) & ~isnan(priceUSD_clean);
X = features_normalized(validModelIdx, :);
y = priceUSD_clean(validModelIdx);

% Simple linear regression
X_with_bias = [ones(size(X, 1), 1), X];
coefficients = (X_with_bias' * X_with_bias) \ (X_with_bias' * y);
predictedPrices = X_with_bias * coefficients;
actualPrices = y;

% Calculate residuals
residuals = actualPrices - predictedPrices;
residualStd = std(residuals);

% Find outliers (more than 2 standard deviations)
overpriced = residuals > 2 * residualStd;
underpriced = residuals < -2 * residualStd;

fprintf('   Found %d potentially overpriced phones\n', sum(overpriced));
fprintf('   Found %d potentially underpriced phones\n', sum(underpriced));

if sum(overpriced) > 0
    fprintf('\n   Top 5 potentially overpriced phones:\n');
    overpricedIdx = find(overpriced);
    [~, sortIdx] = sort(residuals(overpricedIdx), 'descend');
    for i = 1:min(5, length(sortIdx))
        idx = overpricedIdx(sortIdx(i));
        validIdx_all = find(validModelIdx);
        phoneIdx = validIdx_all(idx);
        fprintf('   %d. Phone #%d: Actual $%.0f, Predicted $%.0f (diff: $%.0f)\n', ...
            i, phoneIdx, actualPrices(idx), predictedPrices(idx), residuals(idx));
    end
end

if sum(underpriced) > 0
    fprintf('\n   Top 5 potentially underpriced phones (good deals):\n');
    underpricedIdx = find(underpriced);
    [~, sortIdx] = sort(residuals(underpricedIdx), 'ascend');
    for i = 1:min(5, length(sortIdx))
        idx = underpricedIdx(sortIdx(i));
        validIdx_all = find(validModelIdx);
        phoneIdx = validIdx_all(idx);
        fprintf('   %d. Phone #%d: Actual $%.0f, Predicted $%.0f (diff: $%.0f)\n', ...
            i, phoneIdx, actualPrices(idx), predictedPrices(idx), residuals(idx));
    end
end

% Unusual specification combinations
fprintf('\n5.2 Unusual Specification Combinations:\n');
fprintf('   ---------------------------------\n');

% Z-score normalization for outlier detection
zRAM = (ram_clean - mean(ram_clean)) / std(ram_clean);
zBattery = (battery_clean - mean(battery_clean)) / std(battery_clean);
zScreen = (screenSize_clean - mean(screenSize_clean)) / std(screenSize_clean);
zWeight = (weight_clean - mean(weight_clean)) / std(weight_clean);

% Find phones with extreme values in any dimension
extremeSpecs = abs(zRAM) > 2 | abs(zBattery) > 2 | abs(zScreen) > 2 | abs(zWeight) > 2;
fprintf('   Found %d phones with unusual specification combinations\n', sum(extremeSpecs));

% Data quality issues
fprintf('\n5.3 Data Quality Issues:\n');
fprintf('   ---------------------------------\n');

missingRAM = sum(isnan(ram) | ram == 0);
missingBattery = sum(isnan(battery) | battery == 0);
missingScreen = sum(isnan(screenSize) | screenSize == 0);
missingPrice = sum(isnan(priceUSD) | priceUSD == 0);

fprintf('   Missing/Invalid RAM: %d entries\n', missingRAM);
fprintf('   Missing/Invalid Battery: %d entries\n', missingBattery);
fprintf('   Missing/Invalid Screen Size: %d entries\n', missingScreen);
fprintf('   Missing/Invalid Price: %d entries\n', missingPrice);

% Inconsistent data
fprintf('\n   Data consistency checks:\n');
% Check for phones with 0 price but valid specs
zeroPriceValidSpecs = (priceUSD == 0 | isnan(priceUSD)) & ...
                      ~isnan(ram) & ~isnan(battery) & ~isnan(screenSize);
fprintf('   Phones with valid specs but missing price: %d\n', sum(zeroPriceValidSpecs));

% Check for unrealistic values
unrealisticRAM = ram > 32;  % More than 32GB RAM is unusual
unrealisticBattery = battery > 10000;  % More than 10000mAh is unusual
unrealisticPrice = priceUSD > 5000;  % More than $5000 is unusual

fprintf('   Phones with potentially unrealistic RAM (>32GB): %d\n', sum(unrealisticRAM));
fprintf('   Phones with potentially unrealistic Battery (>10000mAh): %d\n', sum(unrealisticBattery));
fprintf('   Phones with potentially unrealistic Price (>$5000): %d\n', sum(unrealisticPrice));

fprintf('\n');

%% ========================================================================
% SUMMARY
% ========================================================================
fprintf('=================================================================\n');
fprintf('SUMMARY OF EXTRACTED INSIGHTS\n');
fprintf('=================================================================\n\n');

fprintf('✓ Price Drivers: Identified feature correlations and regional differences\n');
fprintf('✓ Market Trends: Analyzed technology evolution and adoption patterns\n');
fprintf('✓ Competitive Analysis: Brand positioning and value-for-money rankings\n');
fprintf('✓ Recommendations: Similar phone finder and budget-based suggestions\n');
fprintf('✓ Anomaly Detection: Identified overpriced/underpriced phones and data issues\n\n');

fprintf('=== Insights Extraction Complete ===\n');
fprintf('\n');

%% Save Results to Workspace Variables
fprintf('Saving results to workspace...\n');
assignin('base', 'insights_ram', ram_clean);
assignin('base', 'insights_battery', battery_clean);
assignin('base', 'insights_screenSize', screenSize_clean);
assignin('base', 'insights_weight', weight_clean);
assignin('base', 'insights_priceUSD', priceUSD_clean);
assignin('base', 'insights_year', year_clean);
assignin('base', 'insights_companies', companies_clean);
assignin('base', 'insights_correlations', correlations);
assignin('base', 'insights_featureNames', featureNames);
assignin('base', 'insights_brandAvgPrices', brandAvgPrices);
assignin('base', 'insights_uniqueCompanies', uniqueCompanies);
assignin('base', 'insights_avgRAMByYear', avgRAMByYear);
assignin('base', 'insights_avgBatteryByYear', avgBatteryByYear);
assignin('base', 'insights_avgScreenByYear', avgScreenByYear);
assignin('base', 'insights_avgPriceByYear', avgPriceByYear);
assignin('base', 'insights_uniqueYears', uniqueYears);
assignin('base', 'insights_valueScores', valueScores);
assignin('base', 'insights_overpriced', overpriced);
assignin('base', 'insights_underpriced', underpriced);
assignin('base', 'insights_residuals', residuals);
assignin('base', 'insights_predictedPrices', predictedPrices);

fprintf('   ✓ Results saved to workspace variables\n');
fprintf('   Variables prefixed with "insights_" are available for further analysis\n\n');

fprintf('Next Steps:\n');
fprintf('  - Use these insights to build predictive models\n');
fprintf('  - Create visualizations for better understanding\n');
fprintf('  - Implement recommendation system in your application\n');
fprintf('  - Use anomaly detection for data quality improvement\n');
fprintf('  - Access results from workspace (e.g., insights_correlations)\n\n');
