% Quick test to check column names in the CSV file
% This helps ensure the extraction script uses correct column names

fprintf('Testing CSV column names...\n\n');

try
    data = readtable('Mobiles Dataset (2025).csv');
    fprintf('✓ CSV loaded successfully\n');
    fprintf('Number of rows: %d\n', height(data));
    fprintf('Number of columns: %d\n\n', width(data));

    fprintf('Column names:\n');
    for i = 1:width(data)
        fprintf('  %d. %s\n', i, data.Properties.VariableNames{i});
    end

    fprintf('\nFirst row sample:\n');
    for i = 1:min(5, width(data))
        colName = data.Properties.VariableNames{i};
        if iscell(data.(colName)(1))
            fprintf('  %s: %s\n', colName, data.(colName){1});
        else
            fprintf('  %s: %s\n', colName, string(data.(colName)(1)));
        end
    end

catch ME
    fprintf('✗ Error: %s\n', ME.message);
end
