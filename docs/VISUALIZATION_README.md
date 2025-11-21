# Visualization Generation Guide

This guide explains how to generate all visualizations for your GitHub repository using MATLAB.

## Quick Start

Run this single command in MATLAB:

```matlab
run('generate_visualizations.m')
```

This will automatically:
1. Load your trained models and results
2. Create comprehensive visualizations
3. Save all images to `docs/images/` directory
4. Use your actual data when available, or create sample visualizations

## What Gets Generated

### 1. Model Performance Comparison (`model-comparison.png`)
- Compares all your trained models
- Shows R² scores for regression models
- Shows accuracy for classification models
- Displays architecture complexity
- Compares performance vs complexity

### 2. Price Prediction Visualization (`price-prediction.png`)
- Uses your actual trained price prediction model results
- Shows predicted vs actual prices
- Displays residuals and error distributions
- Includes sample predictions

### 3. Dataset Analysis (`dataset-analysis.png`)
- Analyzes your actual mobile phones dataset
- Shows price distribution by brand
- Displays RAM and battery distributions
- Shows price trends over years

### 4. Network Architectures (`network-visualization.png`)
- Visualizes all your neural network architectures
- Shows Standard, Deep, Wide, and Lightweight networks
- Displays Brand Classifier architecture
- Clear layer-by-layer visualization

### 5. Training Progress (`training-progress.png`)
- Training and validation loss curves
- Accuracy progression
- Model convergence visualization

## Using Your Actual Data

The visualization scripts automatically detect and use your actual data:

### Automatic Detection
- ✅ Loads trained model results from `mobiles-dataset-docs/trained_models/`
- ✅ Uses actual dataset from `mobiles-dataset-docs/Mobiles Dataset (2025).csv`
- ✅ Extracts performance metrics from result files
- ✅ Creates visualizations based on real predictions

### If Data Not Found
If the scripts can't find your data files, they will:
- Create sample visualizations for demonstration
- Use realistic sample data
- Still generate all required images

## Manual Steps After Generation

After running the visualization script:

1. **Review the generated images:**
   ```matlab
   % Images are saved in docs/images/
   % Check them in MATLAB or file explorer
   ```

2. **Capture web interface screenshots:**
   - Start: `npm run dev`
   - Open: `http://localhost:3000`
   - Screenshot 1: Main interface → `docs/images/web-interface-screenshot.png`
   - Screenshot 2: Capabilities results → `docs/images/capabilities-results.png`

3. **Optional: Create demo GIF:**
   - Record screen while using the app
   - Convert to GIF
   - Save as `docs/images/quick-start-demo.gif`

4. **Commit to Git:**
   ```bash
   git add docs/images/*.png
   git commit -m "Add project visualizations"
   git push origin master
   ```

## Advanced Usage

### Generate Specific Visualizations

You can also call individual functions:

```matlab
cd('docs')
run('generate_all_visualizations.m')
```

### Customize Visualizations

Edit `docs/generate_all_visualizations.m` to:
- Change figure sizes
- Modify colors and styles
- Add additional plots
- Customize titles and labels

### Export Settings

The script uses high-resolution exports (300 DPI):
- PNG format for compatibility
- 300 DPI for crisp images
- Optimized for GitHub display

## Troubleshooting

### "Results file not found"
- Make sure you've trained at least one model
- Check that `mobiles-dataset-docs/trained_models/` contains result files
- The script will create sample visualizations if files are missing

### "Dataset file not found"
- Ensure `Mobiles Dataset (2025).csv` is in `mobiles-dataset-docs/`
- The script will use sample data if the file is missing

### Images not displaying on GitHub
- Verify file paths in README.md match actual filenames
- Check that images are committed to git
- Ensure file extensions are correct (.png, not .PNG)

### Poor image quality
- Images are exported at 300 DPI (high quality)
- If needed, increase resolution in the script
- Check that you're viewing at full size

## File Locations

All generated images are saved to:
```
docs/images/
├── model-comparison.png
├── price-prediction.png
├── dataset-analysis.png
├── network-visualization.png
└── training-progress.png
```

## Next Steps

1. ✅ Run `generate_visualizations.m` in MATLAB
2. ✅ Review generated images
3. ✅ Capture web interface screenshots
4. ✅ Commit images to git
5. ✅ Push to GitHub
6. ✅ Verify images display correctly on GitHub

## Support

If you encounter issues:
1. Check that MATLAB Deep Learning Toolbox is installed
2. Verify all required files exist
3. Review error messages in MATLAB command window
4. Check the script comments for details

---

**Note:** The visualization scripts are designed to work with your actual trained models and data. They automatically adapt if some files are missing, creating sample visualizations to ensure you always have images for your GitHub repository.
