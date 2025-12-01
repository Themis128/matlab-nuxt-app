#!/bin/bash

# Enhanced cleanup script for Replit deployment to prevent disk quota issues
# This script goes beyond the basic cleanup to ensure packaging succeeds

echo '🧹 Starting enhanced cleanup for deployment...'

# Check current disk usage before cleanup
echo '📊 Disk usage before cleanup:'
df -h /home/runner 2>/dev/null || echo 'df command not available'

# Remove build artifacts and caches first (most space-consuming)
echo 'Removing build artifacts and caches...'
rm -rf .nuxt
rm -rf .output
rm -rf dist
rm -rf instantsearch-app/dist
rm -rf node_modules/.cache
rm -rf .npm
rm -rf .ruff_cache
rm -rf __pycache__
rm -rf */__pycache__
rm -rf venv
rm -rf .venv

# Remove development-specific large files
echo 'Removing development-specific files...'
rm -rf data/scraper_cache
rm -rf data/market_analysis/plots
rm -rf data/dataset_exploration_dashboard.png
rm -rf data/european_market_analysis.png
rm -rf test-results
rm -rf playwright-report
rm -rf screenshots
rm -rf .coverage
rm -rf test-results
rm -rf typecheck_mem_output.txt

# Clean up Python cache aggressively
echo 'Cleaning Python cache files...'
find . -name '*.pyc' -delete
find . -name '*.pyo' -delete
find . -name '__pycache__' -type d -exec rm -rf {} +
find . -name '*.egg-info' -type d -exec rm -rf {} +

# Remove logs and temporary files
echo 'Removing logs and temporary files...'
find . -name '*.log' -delete
find . -name '*.tmp' -delete
find . -name '.DS_Store' -delete
find . -name 'Thumbs.db' -delete

# Remove documentation and non-essential content
echo 'Removing non-essential documentation...'
rm -rf docs/images
rm -rf examples
rm -rf wiki
rm -rf mobiles-dataset-docs
rm -rf ALGOLIA_SETUP.md
rm -rf MATLAB_SETUP.md
rm -rf IMPLEMENTATION_COMPLETE.md
rm -rf IMPLEMENTATION_SUMMARY.md
rm -rf PLANNED_UPGRADES.md

# Clean package manager caches
echo 'Cleaning package manager caches...'
npm cache clean --force 2>/dev/null || true
pip cache purge 2>/dev/null || true

# Remove UPM and Unity-related files (aggressive cleanup)
echo 'Removing UPM and Unity-related files...'
rm -rf .upm
rm -rf Library
rm -rf Temp
rm -rf obj
rm -rf *.unitypackage
find . -name '*.meta' -delete

# Create .upm cache directory in /tmp if it doesn't exist (preventive measure)
mkdir -p /tmp/upm-cache 2>/dev/null || true

# Final disk usage check
echo '📊 Disk usage after cleanup:'
df -h /home/runner 2>/dev/null || echo 'df command not available'

echo '✅ Enhanced cleanup completed!'
echo '💾 Disk space optimized for deployment'
echo '🚀 Ready for packaging without quota issues'