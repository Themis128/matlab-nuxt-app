# Viewing .mat Files in Editor

This project includes configuration and tools to view MATLAB `.mat` files in your editor.

## Quick Start

### Option 1: MATLAB Script (Recommended if you have MATLAB)
```matlab
view_mat_file('mobiles-dataset-docs/trained_models/price_predictor.mat')
```

### Option 2: Python Script
```bash
python view_mat_file.py mobiles-dataset-docs/trained_models/price_predictor.mat
python view_mat_file.py mobiles-dataset-docs/trained_models/price_predictor.mat -f text -o output.txt
```

### Option 3: Node.js Script
```bash
node view_mat_file.js mobiles-dataset-docs/trained_models/price_predictor.mat
node view_mat_file.js mobiles-dataset-docs/trained_models/price_predictor.mat output.json
```

If a local Node .mat reader is not available, the Node script will automatically fallback to the Python viewer (requires Python, NumPy, and SciPy).

## VS Code/Cursor Extensions

The following extensions are recommended (see `.vscode/extensions.json`):

1. **MATLAB Extension** (MathWorks)
   - Provides syntax highlighting for MATLAB files
   - File association for .mat files

2. **Gimly81.matlab**
   - Alternative MATLAB support

3. **apommel.matlab-interactive-terminal**
   - Interactive MATLAB terminal

Install extensions:
- Open Command Palette (Ctrl+Shift+P)
- Type "Extensions: Show Recommended Extensions"
- Install the recommended extensions

## Configuration

### File Associations
`.vscode/settings.json` is configured to:
- Associate `.mat` files with MATLAB language
- Enable file watching for .mat files
- Configure search to include .mat files

### Viewing .mat Files

Since .mat files are binary, you have several options:

1. **Use the MATLAB script** (if you have MATLAB):
   ```matlab
   view_mat_file('path/to/file.mat')
   view_mat_file('path/to/file.mat', 'output.txt')  % Save to text file
   ```

2. **Use the Python script** (requires scipy):
   ```bash
   pip install scipy numpy
   python view_mat_file.py file.mat
   python view_mat_file.py file.mat -o output.json
   ```

3. **Use the Node.js script** (requires mat-file-reader):
   ```bash
   node view_mat_file.js file.mat
   ```
   Note: If `mat-file-reader` is not installed, the script will fallback to Python.

## VS Code Tasks

You can run preconfigured tasks from the Command Palette:

- View .mat File (MATLAB): runs `view_mat_file('<path>'); exit` in MATLAB.
- View .mat File (Python): runs `python view_mat_file.py <path> -f text`.
- View .mat File (Node.js): runs `node view_mat_file.js <path>`.

Provide the full path to the `.mat` file when prompted.

## Example: View Trained Model

```matlab
% In MATLAB
view_mat_file('mobiles-dataset-docs/trained_models/price_predictor.mat')
```

```bash
# In Python
python view_mat_file.py mobiles-dataset-docs/trained_models/price_predictor.mat

# In Node.js
node view_mat_file.js mobiles-dataset-docs/trained_models/price_predictor.mat
```

## What's in a .mat File?

MATLAB .mat files can contain:
- **Variables**: Arrays, matrices, structures, cells
- **Metadata**: Variable names, sizes, types
- **Complex data**: Neural networks, trained models, preprocessed data

## Files Created

- `.vscode/settings.json` - VS Code/Cursor settings for .mat files
- `.vscode/extensions.json` - Recommended extensions
- `view_mat_file.m` - MATLAB script to view .mat files
- `view_mat_file.py` - Python script to view .mat files
- `view_mat_file.js` - Node.js script to view .mat files

## Troubleshooting

### "scipy not found" (Python)
```bash
pip install scipy numpy
```

### "mat-file-reader not found" (Node.js)
```bash
npm install mat-file-reader
```

### Extension not working
1. Reload VS Code/Cursor window
2. Check if extension is installed
3. Verify file association in settings

## Tips

1. **Large files**: Use the `-o` option to save output to a file instead of printing
2. **Quick view**: Use MATLAB script for fastest viewing
3. **JSON format**: Python/Node.js scripts output JSON for easy parsing
4. **Text format**: Use `-f text` with Python script for human-readable output

