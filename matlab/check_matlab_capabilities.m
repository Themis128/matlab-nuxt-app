% MATLAB Script to Check Capabilities
% This script queries MATLAB's installed toolboxes, version, and features

fprintf('=== MATLAB Capabilities Report ===\n\n');

% Version Information
fprintf('1. VERSION INFORMATION:\n');
fprintf('   MATLAB Version: %s\n', version);
fprintf('   Release: %s\n', version('-release'));
fprintf('   Java Version: %s\n', version('-java'));
fprintf('\n');

% Installed Toolboxes
fprintf('2. INSTALLED TOOLBOXES:\n');
toolboxes = ver;

% Load toolbox descriptions if available
descriptionsFile = 'toolbox-descriptions.json';
descriptions = struct();
if exist(descriptionsFile, 'file')
    try
        jsonText = fileread(descriptionsFile);
        descriptions = jsondecode(jsonText);
    catch ME
        % If JSON parsing fails, continue without descriptions
        fprintf('   Warning: Could not load descriptions: %s\n', ME.message);
    end
end

for i = 1:length(toolboxes)
    toolboxName = toolboxes(i).Name;
    fprintf('   - %s (Version: %s)\n', toolboxName, toolboxes(i).Version);

    % Add description if available
    % Try direct field access first (field name matches JSON key)
    if isfield(descriptions, toolboxName)
        description = descriptions.(toolboxName);
        if ischar(description) && ~isempty(description)
            fprintf('     Description: %s\n', description);
        end
    else
        % Try with valid MATLAB field name
        validFieldName = matlab.lang.makeValidName(toolboxName);
        if isfield(descriptions, validFieldName)
            description = descriptions.(validFieldName);
            if ischar(description) && ~isempty(description)
                fprintf('     Description: %s\n', description);
            end
        end
    end
end
fprintf('\n');

% System Information
fprintf('3. SYSTEM INFORMATION:\n');
fprintf('   Computer: %s\n', computer);
fprintf('   Architecture: %s\n', computer('arch'));
fprintf('\n');

% Available Functions (sample)
fprintf('4. KEY CAPABILITIES CHECK:\n');

% Check for specific toolboxes by looking for key functions
capabilities = struct();

% Image Processing Toolbox
capabilities.ImageProcessing = exist('imread', 'file') > 0;
fprintf('   Image Processing: %s\n', mat2str(capabilities.ImageProcessing));

% Statistics and Machine Learning Toolbox
capabilities.Statistics = exist('fitlm', 'file') > 0;
fprintf('   Statistics & ML: %s\n', mat2str(capabilities.Statistics));

% Signal Processing Toolbox
% Check if Signal Processing Toolbox is in the installed toolboxes list
toolboxNames = {toolboxes.Name};
signalProcIdx = contains(toolboxNames, 'Signal Processing Toolbox', 'IgnoreCase', true);
capabilities.SignalProcessing = any(signalProcIdx);
fprintf('   Signal Processing: %s\n', mat2str(capabilities.SignalProcessing));

% Control System Toolbox
capabilities.ControlSystems = exist('tf', 'file') > 0;
fprintf('   Control Systems: %s\n', mat2str(capabilities.ControlSystems));

% Optimization Toolbox
capabilities.Optimization = exist('fmincon', 'file') > 0;
fprintf('   Optimization: %s\n', mat2str(capabilities.Optimization));

% Parallel Computing Toolbox
capabilities.Parallel = exist('parpool', 'file') > 0;
fprintf('   Parallel Computing: %s\n', mat2str(capabilities.Parallel));

% Deep Learning Toolbox
capabilities.DeepLearning = exist('trainNetwork', 'file') > 0;
fprintf('   Deep Learning: %s\n', mat2str(capabilities.DeepLearning));

% Symbolic Math Toolbox
capabilities.Symbolic = exist('syms', 'file') > 0;
fprintf('   Symbolic Math: %s\n', mat2str(capabilities.Symbolic));

fprintf('\n');

% Memory Information
fprintf('5. MEMORY INFORMATION:\n');
if ispc
    [~, sysMem] = memory;
    fprintf('   Available Memory: %.2f GB\n', sysMem.PhysicalMemory.Available / 1e9);
    fprintf('   Total Memory: %.2f GB\n', sysMem.PhysicalMemory.Total / 1e9);
end
fprintf('\n');

% GPU Information
fprintf('6. GPU INFORMATION:\n');
try
    gpuInfo = gpuDevice;
    fprintf('   GPU Available: Yes\n');
    fprintf('   GPU Name: %s\n', gpuInfo.Name);
    fprintf('   GPU Memory: %.2f GB\n', gpuInfo.AvailableMemory / 1e9);
catch
    fprintf('   GPU Available: No\n');
end
fprintf('\n');

% License Information
fprintf('7. LICENSE INFORMATION:\n');
try
    licenseInfo = license('inuse');
    fprintf('   Active Licenses: %d\n', length(licenseInfo));
    for i = 1:length(licenseInfo)
        fprintf('   - %s\n', licenseInfo(i).feature);
    end
catch
    fprintf('   License information not available\n');
end
fprintf('\n');

fprintf('=== End of Report ===\n');
