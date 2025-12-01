#!/bin/bash

# Cleanup script for Replit deployment to save disk space

echo "🧹 Starting cleanup for deployment..."

# Remove unnecessary cache directories
echo "Removing cache directories..."
rm -rf .nuxt
rm -rf .output
rm -rf node_modules/.cache
rm -rf .npm
rm -rf .ruff_cache
rm -rf __pycache__
rm -rf */__pycache__
rm -rf venv
rm -rf .venv

# Remove large data files that aren't needed for runtime
echo "Removing large development data files..."
rm -rf data/scraper_cache
rm -rf data/market_analysis/plots
rm -rf data/dataset_exploration_dashboard.png

# Clean up Python cache
find . -name "*.pyc" -delete
find . -name "*.pyo" -delete
find . -name "__pycache__" -type d -exec rm -rf {} +

# Remove test results and coverage
rm -rf test-results
rm -rf playwright-report
rm -rf .coverage

# Remove documentation and examples (keep essential docs)
rm -rf docs/images
rm -rf examples
rm -rf wiki

# Remove MATLAB docs (not needed for web app)
rm -rf mobiles-dataset-docs

# Clean npm cache
npm cache clean --force 2>/dev/null || true

echo "✅ Cleanup completed!"
echo "💾 Disk space saved for deployment"
