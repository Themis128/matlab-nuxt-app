% Quick Start: Generate All Visualizations for GitHub
% This is a wrapper script that calls the comprehensive visualization generator
% Usage: run('generate_visualizations.m')
%
% This will create all visualizations needed for your GitHub repository:
% - Model performance comparisons
% - Price prediction visualizations
% - Dataset analysis charts
% - Network architecture diagrams
% - Training progress plots

fprintf('========================================\n');
fprintf('Generating Visualizations for GitHub\n');
fprintf('========================================\n\n');

% Run the comprehensive visualization generator
run('docs/generate_all_visualizations.m');

fprintf('\n✓ All visualizations generated!\n');
fprintf('  Check the docs/images/ directory for the output files.\n\n');
