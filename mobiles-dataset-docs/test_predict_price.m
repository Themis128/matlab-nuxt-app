% Test predict_price function
fprintf('Testing predict_price function:\n\n');

examples = {
    {8, 4000, 6.1, 174, 2024, 'Apple'},      % iPhone-like
    {12, 5000, 6.7, 203, 2024, 'Samsung'},    % Galaxy-like
    {6, 4500, 6.0, 180, 2023, 'Xiaomi'},     % Budget phone
    {16, 6000, 7.0, 220, 2024, 'OnePlus'},   % Flagship
    {4, 3000, 5.5, 150, 2022, 'Samsung'}      % Older model
};

fprintf('   Sample Predictions:\n');
fprintf('   ----------------------------------------\n');
fprintf('   RAM  | Battery | Screen | Weight | Year | Company | Predicted Price\n');
fprintf('   ----------------------------------------\n');

for i = 1:length(examples)
    ex = examples{i};
    try
        price = predict_price(ex{1}, ex{2}, ex{3}, ex{4}, ex{5}, ex{6});
        fprintf('   %2dGB | %5dmAh | %5.1f" | %5dg | %4d | %-7s | $%.0f\n', ...
            ex{1}, ex{2}, ex{3}, ex{4}, ex{5}, ex{6}, price);
    catch ME
        fprintf('   Error predicting for example %d: %s\n', i, ME.message);
    end
end

fprintf('   ----------------------------------------\n');
fprintf('\n✓ All predictions completed!\n');
