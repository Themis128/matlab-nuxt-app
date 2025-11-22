% Preprocess Mobile Phones Dataset
% This script handles all data preprocessing, cleaning, and preparation
% Run this before training models to ensure data quality

fprintf('=== Mobile Phones Dataset Preprocessing ===\n\n');

%% Load Dataset
fprintf('Step 1: Loading dataset...\n');
try
    data = readtable('Mobiles Dataset (2025).csv');
    fprintf('   ✓ Dataset loaded: %d rows, %d columns\n', height(data), width(data));
    fprintf('   Columns: %s\n', strjoin(data.Properties.VariableNames, ', '));
catch ME
    fprintf('   ✗ Error loading dataset: %s\n', ME.message);
    error('Failed to load dataset. Please check file path and format.');
end

%% Check Column Names
fprintf('\nStep 2: Verifying column names...\n');
colNames = data.Properties.VariableNames;
fprintf('   Found %d columns\n', length(colNames));

% Display column names to verify
for i = 1:length(colNames)
    fprintf('   %d. %s\n', i, colNames{i});
end

%% Parse Numerical Features
fprintf('\nStep 3: Parsing numerical features...\n');

% Initialize arrays
nRows = height(data);
ram = zeros(nRows, 1);
battery = zeros(nRows, 1);
screenSize = zeros(nRows, 1);
weight = zeros(nRows, 1);
priceUSD = zeros(nRows, 1);
year = zeros(nRows, 1);
frontCamera = zeros(nRows, 1);
backCamera = zeros(nRows, 1);

% Helper function to extract numbers from strings
extractNumber = @(str, pattern) ...
    str2double(strrep(regexp(str, pattern, 'match', 'once'), ',', ''));

% Parse RAM
fprintf('   Parsing RAM...\n');
if ismember('RAM', colNames)
    ramCol = data.RAM;
    for i = 1:nRows
        if iscell(ramCol(i))
            ramStr = ramCol{i};
        else
            ramStr = string(ramCol(i));
        end
        ramNum = regexp(ramStr, '(\d+)', 'match', 'once');
        if ~isempty(ramNum)
            ram(i) = str2double(ramNum);
        end
    end
    fprintf('      ✓ RAM parsed: %d valid values\n', sum(~isnan(ram) & ram > 0));
else
    warning('RAM column not found');
end

% Parse Battery Capacity
fprintf('   Parsing Battery Capacity...\n');
batColName = 'BatteryCapacity';
if ~ismember(batColName, colNames)
    % Try alternative names
    altNames = {'Battery_Capacity', 'Battery', 'BatteryCapacity'};
    for alt = altNames
        if ismember(alt{1}, colNames)
            batColName = alt{1};
            break;
        end
    end
end

if ismember(batColName, colNames)
    batCol = data.(batColName);
    for i = 1:nRows
        if iscell(batCol(i))
            batStr = batCol{i};
        else
            batStr = string(batCol(i));
        end
        batNum = regexp(batStr, '([\d,]+)', 'match', 'once');
        if ~isempty(batNum)
            battery(i) = str2double(strrep(batNum, ',', ''));
        end
    end
    fprintf('      ✓ Battery parsed: %d valid values\n', sum(~isnan(battery) & battery > 0));
else
    warning('Battery Capacity column not found');
end

% Parse Screen Size
fprintf('   Parsing Screen Size...\n');
screenColName = 'ScreenSize';
if ~ismember(screenColName, colNames)
    altNames = {'Screen_Size', 'Screen', 'Display_Size'};
    for alt = altNames
        if ismember(alt{1}, colNames)
            screenColName = alt{1};
            break;
        end
    end
end

if ismember(screenColName, colNames)
    screenCol = data.(screenColName);
    for i = 1:nRows
        if iscell(screenCol(i))
            screenStr = screenCol{i};
        else
            screenStr = string(screenCol(i));
        end
        screenNum = regexp(screenStr, '(\d+\.?\d*)', 'match', 'once');
        if ~isempty(screenNum)
            screenSize(i) = str2double(screenNum);
        end
    end
    fprintf('      ✓ Screen Size parsed: %d valid values\n', sum(~isnan(screenSize) & screenSize > 0));
else
    warning('Screen Size column not found');
end

% Parse Weight
fprintf('   Parsing Mobile Weight...\n');
weightColName = 'Mobile_Weight';
if ~ismember(weightColName, colNames)
    altNames = {'MobileWeight', 'Weight', 'Phone_Weight'};
    for alt = altNames
        if ismember(alt{1}, colNames)
            weightColName = alt{1};
            break;
        end
    end
end

if ismember(weightColName, colNames)
    weightCol = data.(weightColName);
    for i = 1:nRows
        if iscell(weightCol(i))
            weightStr = weightCol{i};
        else
            weightStr = string(weightCol(i));
        end
        weightNum = regexp(weightStr, '(\d+)', 'match', 'once');
        if ~isempty(weightNum)
            weight(i) = str2double(weightNum);
        end
    end
    fprintf('      ✓ Weight parsed: %d valid values\n', sum(~isnan(weight) & weight > 0));
else
    warning('Weight column not found');
end

% Parse Price (USD)
fprintf('   Parsing Price (USD)...\n');
priceColName = 'LaunchedPrice_USA_';
if ~ismember(priceColName, colNames)
    altNames = {'Launched_Price_USA', 'LaunchedPriceUSA', 'Price_USA', 'Price_USD', 'Price', 'LaunchedPrice_USA_'};
    for alt = altNames
        if ismember(alt{1}, colNames)
            priceColName = alt{1};
            break;
        end
    end
end

if ismember(priceColName, colNames)
    priceCol = data.(priceColName);
    for i = 1:nRows
        if iscell(priceCol(i))
            priceStr = priceCol{i};
        else
            priceStr = string(priceCol(i));
        end
        % Remove currency symbols and extract number
        priceStr = strrep(priceStr, 'USD', '');
        priceStr = strrep(priceStr, '$', '');
        priceStr = strrep(priceStr, ' ', '');
        % Try to extract number - handle formats like "USD 799" or "799"
        priceNum = regexp(priceStr, '([\d,]+)', 'match', 'once');
        if ~isempty(priceNum)
            priceUSD(i) = str2double(strrep(priceNum, ',', ''));
        else
            % Try alternative pattern
            priceNum = regexp(priceStr, '(\d+)', 'match', 'once');
            if ~isempty(priceNum)
                priceUSD(i) = str2double(priceNum);
            end
        end
    end
    fprintf('      ✓ Price parsed: %d valid values\n', sum(~isnan(priceUSD) & priceUSD > 0));
    fprintf('      Price range: $%.0f - $%.0f\n', min(priceUSD(priceUSD > 0)), max(priceUSD));
else
    warning('Price column not found. Available columns: %s', strjoin(colNames, ', '));
end

% Parse Year
fprintf('   Parsing Launch Year...\n');
yearColName = 'LaunchedYear';
if ~ismember(yearColName, colNames)
    altNames = {'Launched_Year', 'Year', 'Launch_Year'};
    for alt = altNames
        if ismember(alt{1}, colNames)
            yearColName = alt{1};
            break;
        end
    end
end

if ismember(yearColName, colNames)
    yearCol = data.(yearColName);
    if isnumeric(yearCol)
        year = double(yearCol);
    else
        for i = 1:nRows
            if iscell(yearCol(i))
                yearStr = yearCol{i};
            else
                yearStr = string(yearCol(i));
            end
            yearNum = regexp(yearStr, '(\d{4})', 'match', 'once');
            if ~isempty(yearNum)
                year(i) = str2double(yearNum);
            end
        end
    end
    fprintf('      ✓ Year parsed: %d valid values\n', sum(~isnan(year) & year > 2000 & year <= 2025));
else
    warning('Year column not found');
end

% Parse Front Camera
fprintf('   Parsing Front Camera...\n');
frontCamColName = 'Front_Camera';
if ~ismember(frontCamColName, colNames)
    altNames = {'FrontCamera', 'Front_Camera', 'FrontCamera_MP'};
    for alt = altNames
        if ismember(alt{1}, colNames)
            frontCamColName = alt{1};
            break;
        end
    end
end

if ismember(frontCamColName, colNames)
    frontCamCol = data.(frontCamColName);
    for i = 1:nRows
        if iscell(frontCamCol(i))
            camStr = frontCamCol{i};
        else
            camStr = string(frontCamCol(i));
        end
        % Extract MP value (e.g., "12 MP" or "12MP" or "12")
        camNum = regexp(camStr, '(\d+)', 'match', 'once');
        if ~isempty(camNum)
            frontCamera(i) = str2double(camNum);
        end
    end
    fprintf('      ✓ Front Camera parsed: %d valid values\n', sum(~isnan(frontCamera) & frontCamera > 0));
else
    warning('Front Camera column not found');
end

% Parse Back Camera
fprintf('   Parsing Back Camera...\n');
backCamColName = 'Back_Camera';
if ~ismember(backCamColName, colNames)
    altNames = {'BackCamera', 'Back_Camera', 'BackCamera_MP', 'Rear_Camera', 'RearCamera'};
    for alt = altNames
        if ismember(alt{1}, colNames)
            backCamColName = alt{1};
            break;
        end
    end
end

if ismember(backCamColName, colNames)
    backCamCol = data.(backCamColName);
    for i = 1:nRows
        if iscell(backCamCol(i))
            camStr = backCamCol{i};
        else
            camStr = string(backCamCol(i));
        end
        % Extract MP value - handle formats like "48 MP", "48+12 MP", "48MP"
        % Take the first/largest number (main camera)
        camNums = regexp(camStr, '(\d+)', 'match');
        if ~isempty(camNums)
            % Convert all matches to numbers and take max (main camera)
            camValues = cellfun(@str2double, camNums);
            backCamera(i) = max(camValues);
        end
    end
    fprintf('      ✓ Back Camera parsed: %d valid values\n', sum(~isnan(backCamera) & backCamera > 0));
else
    warning('Back Camera column not found');
end

%% Parse Company Names
fprintf('\nStep 4: Parsing company names...\n');
companyColName = 'CompanyName';
if ~ismember(companyColName, colNames)
    altNames = {'Company_Name', 'Company', 'Brand', 'Manufacturer'};
    for alt = altNames
        if ismember(alt{1}, colNames)
            companyColName = alt{1};
            break;
        end
    end
end

if ismember(companyColName, colNames)
    companyCol = data.(companyColName);
    if iscell(companyCol)
        companies = categorical(companyCol);
    else
        companies = categorical(companyCol);
    end
    fprintf('      ✓ Companies parsed: %d unique companies\n', length(categories(companies)));
    fprintf('      Companies: %s\n', strjoin(categories(companies), ', '));
else
    warning('Company column not found');
    companies = categorical(repmat({'Unknown'}, nRows, 1));
end

%% Data Cleaning
fprintf('\nStep 5: Cleaning data...\n');

% Identify valid rows (must have critical features)
validIdx = ~isnan(ram) & ram > 0 & ...
           ~isnan(battery) & battery > 0 & ...
           ~isnan(screenSize) & screenSize > 0 & ...
           ~isnan(weight) & weight > 0 & ...
           ~isnan(priceUSD) & priceUSD > 0 & ...
           ~isnan(year) & year >= 2010 & year <= 2025;

fprintf('   Valid rows: %d / %d (%.1f%%)\n', sum(validIdx), nRows, sum(validIdx)/nRows*100);
fprintf('   Removed rows: %d (missing or invalid data)\n', sum(~validIdx));

% Remove outliers (using IQR method)
fprintf('\n   Removing outliers...\n');
features = [ram(validIdx), battery(validIdx), screenSize(validIdx), ...
            weight(validIdx), priceUSD(validIdx), year(validIdx)];

outlierIdx = false(sum(validIdx), 1);
for i = 1:size(features, 2)
    Q1 = prctile(features(:, i), 25);
    Q3 = prctile(features(:, i), 75);
    IQR = Q3 - Q1;
    lowerBound = Q1 - 3 * IQR;  % Using 3*IQR for less aggressive outlier removal
    upperBound = Q3 + 3 * IQR;
    outlierIdx = outlierIdx | (features(:, i) < lowerBound | features(:, i) > upperBound);
end

validIdx_clean = validIdx;
validIdx_clean(validIdx) = ~outlierIdx;
fprintf('   Outliers removed: %d\n', sum(outlierIdx));
fprintf('   Final valid rows: %d\n', sum(validIdx_clean));

%% Create Clean Dataset
fprintf('\nStep 6: Creating cleaned dataset...\n');

% Extract clean data
ram_clean = ram(validIdx_clean);
battery_clean = battery(validIdx_clean);
screenSize_clean = screenSize(validIdx_clean);
weight_clean = weight(validIdx_clean);
priceUSD_clean = priceUSD(validIdx_clean);
year_clean = year(validIdx_clean);
frontCamera_clean = frontCamera(validIdx_clean);
backCamera_clean = backCamera(validIdx_clean);
companies_clean = companies(validIdx_clean);

% Create summary table
summaryTable = table(ram_clean, battery_clean, screenSize_clean, ...
                     weight_clean, priceUSD_clean, year_clean, ...
                     frontCamera_clean, backCamera_clean, companies_clean, ...
                     'VariableNames', {'RAM_GB', 'Battery_mAh', 'ScreenSize_inches', ...
                     'Weight_g', 'Price_USD', 'Year', 'FrontCamera_MP', 'BackCamera_MP', 'Company'});

fprintf('   ✓ Clean dataset created\n');
fprintf('   Final dataset size: %d rows\n', height(summaryTable));

%% Display Statistics
fprintf('\nStep 7: Dataset statistics:\n');
fprintf('   ----------------------------------------\n');
fprintf('   Feature          |  Min    |  Max    |  Mean\n');
fprintf('   ----------------------------------------\n');
fprintf('   RAM (GB)         |  %6.1f  |  %6.1f  |  %6.1f\n', ...
    min(ram_clean), max(ram_clean), mean(ram_clean));
fprintf('   Battery (mAh)    |  %6.0f  |  %6.0f  |  %6.0f\n', ...
    min(battery_clean), max(battery_clean), mean(battery_clean));
fprintf('   Screen Size (")  |  %6.1f  |  %6.1f  |  %6.1f\n', ...
    min(screenSize_clean), max(screenSize_clean), mean(screenSize_clean));
fprintf('   Weight (g)       |  %6.0f  |  %6.0f  |  %6.0f\n', ...
    min(weight_clean), max(weight_clean), mean(weight_clean));
fprintf('   Price (USD)      |  $%5.0f  |  $%5.0f  |  $%5.0f\n', ...
    min(priceUSD_clean), max(priceUSD_clean), mean(priceUSD_clean));
fprintf('   Year             |  %6.0f  |  %6.0f  |  %6.0f\n', ...
    min(year_clean), max(year_clean), mean(year_clean));
if sum(~isnan(frontCamera_clean) & frontCamera_clean > 0) > 0
    fprintf('   Front Camera (MP) |  %6.0f  |  %6.0f  |  %6.1f\n', ...
        min(frontCamera_clean(frontCamera_clean > 0)), ...
        max(frontCamera_clean), mean(frontCamera_clean(frontCamera_clean > 0)));
end
if sum(~isnan(backCamera_clean) & backCamera_clean > 0) > 0
    fprintf('   Back Camera (MP)  |  %6.0f  |  %6.0f  |  %6.1f\n', ...
        min(backCamera_clean(backCamera_clean > 0)), ...
        max(backCamera_clean), mean(backCamera_clean(backCamera_clean > 0)));
end
fprintf('   ----------------------------------------\n');

%% Save Preprocessed Data
fprintf('\nStep 8: Saving preprocessed data...\n');

% Save to workspace
assignin('base', 'preprocessed_data', summaryTable);
assignin('base', 'ram_clean', ram_clean);
assignin('base', 'battery_clean', battery_clean);
assignin('base', 'screenSize_clean', screenSize_clean);
assignin('base', 'weight_clean', weight_clean);
assignin('base', 'priceUSD_clean', priceUSD_clean);
assignin('base', 'year_clean', year_clean);
assignin('base', 'frontCamera_clean', frontCamera_clean);
assignin('base', 'backCamera_clean', backCamera_clean);
assignin('base', 'companies_clean', companies_clean);
assignin('base', 'validIdx_clean', validIdx_clean);

% Save to file
if ~exist('preprocessed', 'dir')
    mkdir('preprocessed');
end

save('preprocessed/preprocessed_data.mat', 'summaryTable', 'ram_clean', ...
     'battery_clean', 'screenSize_clean', 'weight_clean', 'priceUSD_clean', ...
     'year_clean', 'frontCamera_clean', 'backCamera_clean', 'companies_clean', 'validIdx_clean');

writetable(summaryTable, 'preprocessed/preprocessed_data.csv');

fprintf('   ✓ Data saved to workspace variables\n');
fprintf('   ✓ Data saved to: preprocessed/preprocessed_data.mat\n');
fprintf('   ✓ Data saved to: preprocessed/preprocessed_data.csv\n');

fprintf('\n=== Preprocessing Complete ===\n');
fprintf('\nNext steps:\n');
fprintf('  1. Review preprocessed data statistics\n');
fprintf('  2. Run extract_all_insights.m to analyze insights\n');
fprintf('  3. Run train_price_prediction_model.m to train model\n\n');
