% List Available Companies
% This function lists all companies that were used in training the model
%
% Usage:
%   companies = list_available_companies()
%   list_available_companies()  % Prints to console
%
% Output:
%   companies - Cell array or categorical array of available company names

function companies = list_available_companies()

    % Try to load from model file
    modelPath = 'trained_models/price_predictor.mat';
    if exist(modelPath, 'file')
        load(modelPath, 'uniqueCompanies');
        companies = uniqueCompanies;
    else
        % Try to load from preprocessed data
        preprocessedPath = 'preprocessed/preprocessed_data.mat';
        if exist(preprocessedPath, 'file')
            load(preprocessedPath, 'companies_clean');
            companies = categories(companies_clean);
        else
            error('Cannot find model or preprocessed data. Please train the model first.');
        end
    end

    % If no output argument, print to console
    if nargout == 0
        fprintf('\n=== Available Companies ===\n\n');
        for i = 1:length(companies)
            fprintf('  %d. %s\n', i, string(companies(i)));
        end
        fprintf('\nTotal: %d companies\n\n', length(companies));
    end

end
