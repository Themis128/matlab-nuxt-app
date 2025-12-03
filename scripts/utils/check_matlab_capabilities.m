% MATLAB Capabilities Check Script
% This script checks MATLAB version, toolboxes, and GPU availability

fprintf('🔍 MATLAB Capabilities Check\n');
fprintf('================================\n\n');

% MATLAB Version
fprintf('MATLAB Version: %s\n', version('-release'));
fprintf('MATLAB Release: %s\n\n', version);

% Available Toolboxes
fprintf('Installed Toolboxes:\n');
v = ver;
for i = 1:length(v)
    fprintf('- %s (%s)\n', v(i).Name, v(i).Version);
end
fprintf('\n');

% GPU Check
try
    gpu = gpuDevice;
    fprintf('GPU Available: Yes\n');
    fprintf('GPU Name: %s\n', gpu.Name);
    fprintf('GPU Memory: %.2f GB\n', gpu.TotalMemory / (1024^3));
    fprintf('Compute Capability: %s\n', gpu.ComputeCapability);
catch
    fprintf('GPU Available: No\n');
end

fprintf('\n✅ MATLAB Capabilities Check Complete\n');
