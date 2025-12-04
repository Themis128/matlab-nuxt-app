# Screenshots and Visualizations

This directory contains screenshots and visualizations for the project README.

## Required Screenshots

Add the following screenshots to showcase your project:

### 1. Web Interface Screenshot

- **File:** `web-interface-screenshot.png`
- **What to capture:** The Nuxt.js web interface at `http://localhost:3000`
- **Recommended size:** 1280x720 or 1920x1080
- **How to capture:**
  1. Start the dev server: `npm run dev`
  2. Open `http://localhost:3000` in your browser
  3. Take a screenshot of the main interface
  4. Save as `web-interface-screenshot.png`

### 2. MATLAB Capabilities Results

- **File:** `capabilities-results.png`
- **What to capture:** The results page showing MATLAB capabilities, toolboxes, GPU info
- **Recommended size:** 1280x720
- **How to capture:**
  1. Run the capabilities check in the web interface
  2. Scroll to show all results
  3. Take a screenshot
  4. Save as `capabilities-results.png`

### 3. Network Visualization

- **File:** `network-visualization.png`
- **What to capture:** MATLAB network architecture visualization
- **Recommended size:** 1024x768 or larger
- **How to capture:**
  1. Run `examples/visualize_networks.m` in MATLAB
  2. Capture the network diagram
  3. Save as `network-visualization.png`

### 4. Training Progress

- **File:** `training-progress.png`
- **What to capture:** Training progress plot from MATLAB
- **Recommended size:** 1200x800
- **How to capture:**
  1. Run a training example (e.g., `examples/simple_training_example.m`)
  2. Capture the training progress figure
  3. Save as `training-progress.png`

### 5. Dataset Analysis

- **File:** `dataset-analysis.png`
- **What to capture:** Dataset analysis results or visualizations
- **Recommended size:** 1280x720
- **How to capture:**
  1. Run `mobiles-dataset-docs/extract_all_insights.m`
  2. Capture any generated plots or analysis results
  3. Save as `dataset-analysis.png`

### 6. Price Prediction Results

- **File:** `price-prediction.png`
- **What to capture:** Price prediction model results or predictions
- **Recommended size:** 1200x800
- **How to capture:**
  1. Run price prediction examples
  2. Capture prediction results or plots
  3. Save as `price-prediction.png`

### 7. Quick Start Demo (Optional)

- **File:** `quick-start-demo.gif`
- **What to capture:** Animated GIF showing the quick start process
- **Recommended:** Use a screen recording tool to create GIF
- **Tools:**
  - Windows: ScreenToGif, ShareX
  - Mac: Gifox, Kap
  - Linux: Peek, SimpleScreenRecorder

## Screenshot Tips

1. **Use consistent styling:**

   - Same browser/theme for web screenshots
   - Clean MATLAB figures (remove unnecessary toolbars)
   - Consistent color scheme

2. **Optimize file sizes:**

   - Use PNG for screenshots (better quality)
   - Compress if needed (aim for < 500KB per image)
   - Use GIF only for animations

3. **Naming convention:**

   - Use lowercase with hyphens: `feature-name.png`
   - Be descriptive: `web-interface-screenshot.png` not `img1.png`

4. **Accessibility:**
   - Ensure text is readable
   - Use high contrast
   - Consider adding alt text in README (already included)

## MATLAB Figure Export

To export high-quality figures from MATLAB:

```matlab
% Set figure properties
fig = figure('Position', [100, 100, 1200, 800]);
% ... your plotting code ...

% Export as PNG
print(fig, 'network-visualization.png', '-dpng', '-r300');

% Or export as high-quality PNG
exportgraphics(fig, 'network-visualization.png', 'Resolution', 300);
```

## Current Status

- [ ] `web-interface-screenshot.png` - Web interface (❌ Missing - needs manual capture)
- [ ] `capabilities-results.png` - MATLAB capabilities results (❌ Missing - needs manual capture)
- [x] `network-visualization.png` - Network architecture (✅ Generated)
- [x] `training-progress.png` - Training progress (✅ Generated)
- [x] `dataset-analysis.png` - Dataset analysis (✅ Generated)
- [x] `price-prediction.png` - Price prediction results (✅ Generated)
- [x] `model-comparison.png` - Model comparison (✅ Generated)
- [ ] `quick-start-demo.gif` - Quick start demo (❌ Missing - optional)

## Notes

- All screenshots will automatically appear in the main README.md
- Keep screenshots up to date as the project evolves
- Replace placeholder images when you have actual screenshots
