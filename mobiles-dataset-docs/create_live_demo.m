% Create Live Interactive Demo
% This script creates an interactive demo that allows audience to input values
% and see real-time predictions from all models
%
% Usage: run('create_live_demo.m')

fprintf('=== Live Interactive Model Demo ===\n\n');

%% Load All Models
fprintf('Loading all trained models...\n');

modelsLoaded = struct();
modelsLoaded.price_standard = false;
modelsLoaded.price_deep = false;
modelsLoaded.price_wide = false;
modelsLoaded.price_lightweight = false;
modelsLoaded.brand = false;
modelsLoaded.ram = false;
modelsLoaded.battery = false;

% Load price models
if exist('trained_models/price_predictor.mat', 'file')
    load('trained_models/price_predictor.mat');
    modelsLoaded.price_standard = true;
    fprintf('   ✓ Standard price model\n');
end

if exist('trained_models/price_predictor_deep.mat', 'file')
    load('trained_models/price_predictor_deep.mat', 'net', 'normalizationParams', 'uniqueCompanies');
    modelsLoaded.price_deep = true;
    fprintf('   ✓ Deep price model\n');
end

if exist('trained_models/price_predictor_wide.mat', 'file')
    load('trained_models/price_predictor_wide.mat', 'net', 'normalizationParams', 'uniqueCompanies');
    modelsLoaded.price_wide = true;
    fprintf('   ✓ Wide price model\n');
end

if exist('trained_models/price_predictor_lightweight.mat', 'file')
    load('trained_models/price_predictor_lightweight.mat', 'net', 'normalizationParams', 'uniqueCompanies');
    modelsLoaded.price_lightweight = true;
    fprintf('   ✓ Lightweight price model\n');
end

% Load brand model
if exist('trained_models/brand_classifier.mat', 'file')
    load('trained_models/brand_classifier.mat');
    modelsLoaded.brand = true;
    fprintf('   ✓ Brand classification model\n');
end

% Load RAM model
if exist('trained_models/ram_predictor.mat', 'file')
    load('trained_models/ram_predictor.mat');
    modelsLoaded.ram = true;
    fprintf('   ✓ RAM prediction model\n');
end

% Load battery model
if exist('trained_models/battery_predictor.mat', 'file')
    load('trained_models/battery_predictor.mat');
    modelsLoaded.battery = true;
    fprintf('   ✓ Battery prediction model\n');
end

fprintf('\n✓ Models loaded\n\n');

%% Demo Scenarios
fprintf('========================================\n');
fprintf('LIVE DEMO SCENARIOS\n');
fprintf('========================================\n\n');

scenarios = {
    struct('name', 'Premium Flagship', 'ram', 12, 'battery', 5000, 'screen', 6.7, 'weight', 200, 'year', 2024, 'company', 'Samsung');
    struct('name', 'Mid-Range Phone', 'ram', 8, 'battery', 4500, 'screen', 6.5, 'weight', 180, 'year', 2024, 'company', 'Xiaomi');
    struct('name', 'Budget Phone', 'ram', 6, 'battery', 4000, 'screen', 6.1, 'weight', 170, 'year', 2023, 'company', 'Realme');
    struct('name', 'Apple iPhone', 'ram', 8, 'battery', 3274, 'screen', 6.1, 'weight', 187, 'year', 2024, 'company', 'Apple');
};

fprintf('Demo Scenarios:\n\n');

for s = 1:length(scenarios)
    phone = scenarios{s};
    fprintf('Scenario %d: %s\n', s, phone.name);
    fprintf('  Specs: %dGB RAM, %dmAh battery, %.1f" screen, %dg, %d, %s\n', ...
        phone.ram, phone.battery, phone.screen, phone.weight, phone.year, phone.company);

    % Price predictions
    if modelsLoaded.price_standard
        try
            price = predict_price(phone.ram, phone.battery, phone.screen, ...
                                 phone.weight, phone.year, phone.company);
            fprintf('  → Predicted Price: $%.0f\n', price);
        catch
            fprintf('  → Price prediction: Error\n');
        end
    end

    % Brand prediction
    if modelsLoaded.brand && modelsLoaded.price_standard
        try
            price = predict_price(phone.ram, phone.battery, phone.screen, ...
                                 phone.weight, phone.year, phone.company);
            brand = predict_brand(phone.ram, phone.battery, phone.screen, ...
                                  phone.weight, phone.year, price);
            match = strcmpi(brand, phone.company);
            fprintf('  → Predicted Brand: %s %s\n', brand, iif(match, '(✓)', '(✗)'));
        catch
            fprintf('  → Brand prediction: Error\n');
        end
    end

    fprintf('\n');
end

%% Interactive Section
fprintf('========================================\n');
fprintf('INTERACTIVE PREDICTIONS\n');
fprintf('========================================\n\n');

fprintf('You can now make custom predictions:\n\n');
fprintf('Example commands:\n');
fprintf('  price = predict_price(8, 4500, 6.5, 180, 2024, ''Samsung'');\n');
fprintf('  brand = predict_brand(8, 4500, 6.5, 180, 2024, 800);\n');
fprintf('  ram = predict_ram(4500, 6.5, 180, 2024, 800, ''Samsung'');\n');
fprintf('  battery = predict_battery(8, 6.5, 180, 2024, 800, ''Samsung'');\n\n');

fprintf('========================================\n');
fprintf('Demo Ready for Audience!\n');
fprintf('========================================\n\n');

% Helper function
function result = iif(condition, trueValue, falseValue)
    if condition
        result = trueValue;
    else
        result = falseValue;
    end
end
