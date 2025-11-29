% View MATLAB .mat File Contents
% This script displays the contents of a .mat file in a readable format
%
% Usage:
%   view_mat_file('path/to/file.mat')
%   view_mat_file('path/to/file.mat', 'output.txt')  % Save to file

function view_mat_file(mat_file, output_file)

    if nargin < 1
        error('Please provide a .mat file path');
    end

    if ~exist(mat_file, 'file')
        error('File not found: %s', mat_file);
    end

    fprintf('=== Loading .mat file: %s ===\n\n', mat_file);

    % Load file info first
    file_info = whos('-file', mat_file);

    fprintf('Variables in file:\n');
    fprintf('  %-20s %-15s %-20s %s\n', 'Name', 'Size', 'Bytes', 'Class');
    fprintf('  %s\n', repmat('-', 1, 70));

    total_bytes = 0;
    for i = 1:length(file_info)
        var = file_info(i);
        fprintf('  %-20s %-15s %-20d %s\n', ...
            var.name, ...
            mat2str(var.size), ...
            var.bytes, ...
            var.class);
        total_bytes = total_bytes + var.bytes;
    end
    fprintf('  %s\n', repmat('-', 1, 70));
    fprintf('  Total: %d bytes\n\n', total_bytes);

    % Load and display contents
    fprintf('=== Variable Contents ===\n\n');

    data = load(mat_file);
    var_names = fieldnames(data);

    for i = 1:length(var_names)
        var_name = var_names{i};
        var_data = data.(var_name);

        fprintf('Variable: %s\n', var_name);
        fprintf('  Type: %s\n', class(var_data));

        if isnumeric(var_data) || islogical(var_data)
            fprintf('  Size: %s\n', mat2str(size(var_data)));
            if numel(var_data) <= 100
                fprintf('  Value:\n');
                if isvector(var_data) && length(var_data) <= 20
                    fprintf('    %s\n', mat2str(var_data));
                else
                    disp(var_data);
                end
            else
                fprintf('  Value: [Large array - %d elements]\n', numel(var_data));
                fprintf('  Min: %g\n', min(var_data(:)));
                fprintf('  Max: %g\n', max(var_data(:)));
                if isnumeric(var_data)
                    fprintf('  Mean: %g\n', mean(var_data(:)));
                end
                fprintf('  Sample (first 10): %s\n', mat2str(var_data(1:min(10, numel(var_data)))));
            end
        elseif ischar(var_data) || isstring(var_data)
            fprintf('  Value: %s\n', string(var_data));
        elseif isstruct(var_data)
            fprintf('  Fields: %s\n', strjoin(fieldnames(var_data), ', '));
            fprintf('  Structure contents:\n');
            disp(var_data);
        elseif iscell(var_data)
            fprintf('  Size: %s\n', mat2str(size(var_data)));
            fprintf('  Cell contents:\n');
            if numel(var_data) <= 20
                for j = 1:min(10, numel(var_data))
                    fprintf('    {%d}: ', j);
                    if isnumeric(var_data{j}) && numel(var_data{j}) <= 5
                        fprintf('%s\n', mat2str(var_data{j}));
                    else
                        fprintf('[%s %s]\n', mat2str(size(var_data{j})), class(var_data{j}));
                    end
                end
                if numel(var_data) > 10
                    fprintf('    ... (%d more cells)\n', numel(var_data) - 10);
                end
            else
                fprintf('    [Large cell array - %d elements]\n', numel(var_data));
            end
        else
            fprintf('  Value:\n');
            disp(var_data);
        end

        fprintf('\n');
    end

    % Save to file if requested
    if nargin >= 2 && ~isempty(output_file)
        fid = fopen(output_file, 'w');
        if fid == -1
            warning('Could not open output file: %s', output_file);
            return;
        end

        % Write summary to file
        fprintf(fid, '=== MATLAB .mat File Contents ===\n');
        fprintf(fid, 'File: %s\n\n', mat_file);
        fprintf(fid, 'Variables:\n');
        for i = 1:length(file_info)
            var = file_info(i);
            fprintf(fid, '  %s: %s (%s, %d bytes)\n', ...
                var.name, mat2str(var.size), var.class, var.bytes);
        end

        fprintf(fid, '\n=== Detailed Contents ===\n\n');
        for i = 1:length(var_names)
            var_name = var_names{i};
            var_data = data.(var_name);

            fprintf(fid, 'Variable: %s\n', var_name);
            fprintf(fid, '  Type: %s\n', class(var_data));
            if isnumeric(var_data) || islogical(var_data)
                fprintf(fid, '  Size: %s\n', mat2str(size(var_data)));
                if numel(var_data) <= 1000
                    fprintf(fid, '  Value:\n');
                    fprintf(fid, '    %s\n', mat2str(var_data));
                else
                    fprintf(fid, '  Value: [Large array - %d elements]\n', numel(var_data));
                end
            elseif ischar(var_data) || isstring(var_data)
                fprintf(fid, '  Value: %s\n', string(var_data));
            else
                fprintf(fid, '  Value: [Complex type]\n');
            end
            fprintf(fid, '\n');
        end

        fclose(fid);
        fprintf('✓ Contents saved to: %s\n', output_file);
    end

    fprintf('=== Done ===\n');

end
