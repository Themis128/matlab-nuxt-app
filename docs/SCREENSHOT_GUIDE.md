# Screenshot Guide for GitHub Repository

This guide helps you capture all the screenshots needed for the GitHub repository README.

## Quick Checklist

- [ ] Web interface screenshot
- [ ] MATLAB capabilities results
- [ ] Network visualization (auto-generated)
- [ ] Training progress (auto-generated)
- [ ] Dataset analysis (auto-generated)
- [ ] Price prediction (auto-generated)
- [ ] Quick start demo GIF (optional)

## Automated Generation

Run the MATLAB script to generate most visualizations automatically:

```matlab
run('docs/generate_visualizations.m')
```

This will create:
- `network-visualization.png`
- `training-progress.png`
- `dataset-analysis.png`
- `price-prediction.png`

## Manual Screenshots

### 1. Web Interface Screenshot

**Steps:**
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000` in your browser
3. Take a full-page screenshot
4. Save as `docs/images/web-interface-screenshot.png`

**Tools:**
- **Windows:** Snipping Tool, ShareX, or browser DevTools
- **Mac:** Cmd+Shift+4, or browser DevTools
- **Linux:** Screenshot tool, or browser DevTools

**Browser DevTools Method:**
1. Press F12 to open DevTools
2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
3. Type "Capture full size screenshot"
4. Save the image

### 2. MATLAB Capabilities Results

**Steps:**
1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Click "Check MATLAB Capabilities"
4. Wait for results to load
5. Scroll to show all sections
6. Take a screenshot
7. Save as `docs/images/capabilities-results.png`

**Tips:**
- Capture the entire results page
- Ensure all toolboxes and system info are visible
- Use a clean browser window (no extensions visible)

### 3. Quick Start Demo GIF (Optional)

**Steps:**
1. Record your screen while:
   - Starting the dev server
   - Opening the web interface
   - Clicking "Check MATLAB Capabilities"
   - Showing the results
2. Convert to GIF
3. Save as `docs/images/quick-start-demo.gif`

**Tools:**
- **Windows:** ScreenToGif, ShareX, or OBS Studio
- **Mac:** Gifox, Kap, or QuickTime + converter
- **Linux:** Peek, SimpleScreenRecorder, or OBS Studio

**Recommended Settings:**
- Duration: 10-15 seconds
- Frame rate: 10-15 fps
- Resolution: 1280x720
- File size: Keep under 5MB

## Image Optimization

### Before Uploading

1. **Compress images** (if needed):
   - Use tools like TinyPNG, ImageOptim, or Squoosh
   - Aim for < 500KB per image
   - Maintain good quality

2. **Check dimensions:**
   - Web screenshots: 1280x720 or 1920x1080
   - MATLAB figures: 1200x800 or larger
   - GIFs: 1280x720, 10-15 fps

3. **Verify quality:**
   - Text should be readable
   - Colors should be accurate
   - No unnecessary UI elements

## MATLAB Figure Export Tips

### High-Quality Export

```matlab
% Method 1: Using exportgraphics (R2020a+)
fig = figure('Position', [100, 100, 1200, 800]);
% ... your plotting code ...
exportgraphics(fig, 'output.png', 'Resolution', 300);

% Method 2: Using print
print(fig, 'output.png', '-dpng', '-r300');

% Method 3: Using saveas
saveas(fig, 'output.png');
```

### Remove Toolbars

```matlab
% Hide figure toolbar
set(fig, 'ToolBar', 'none');
set(fig, 'MenuBar', 'none');
```

### Set Figure Size

```matlab
% Set figure size before plotting
fig = figure('Position', [100, 100, 1200, 800]);
```

## File Naming Convention

Use lowercase with hyphens:
- ✅ `web-interface-screenshot.png`
- ✅ `capabilities-results.png`
- ✅ `network-visualization.png`
- ❌ `WebInterface.png`
- ❌ `screenshot_1.png`

## Verification

After adding all screenshots:

1. **Check file names** match README references
2. **Verify images display** in README preview
3. **Test on GitHub** by pushing and viewing
4. **Check file sizes** are reasonable
5. **Ensure images are clear** and readable

## Troubleshooting

### Images Not Displaying

- Check file paths are correct (relative to repo root)
- Verify images are committed to git
- Check file extensions (.png, .jpg, .gif)
- Ensure no special characters in filenames

### Poor Image Quality

- Increase resolution (300 DPI for MATLAB figures)
- Use PNG format for screenshots
- Avoid excessive compression
- Check browser zoom level when capturing

### Large File Sizes

- Compress images with TinyPNG or similar
- Reduce GIF frame rate or duration
- Use appropriate image dimensions
- Consider WebP format (if supported)

## Next Steps

1. Run `docs/generate_visualizations.m` in MATLAB
2. Capture web interface screenshots manually
3. Create quick start demo GIF (optional)
4. Commit all images to git
5. Push to GitHub and verify display

For more details, see `docs/images/README.md`.


