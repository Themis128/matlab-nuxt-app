# Environment Setup Guide

This guide helps you set up both Python and MATLAB environments for this project.

## Python Environment

### Quick Setup (Windows)
```batch
setup_python_env.bat
```

### Quick Setup (Linux/Mac)
```bash
chmod +x setup_python_env.sh
./setup_python_env.sh
```

### Manual Setup

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate.bat`
   - Linux/Mac: `source venv/bin/activate`

3. **Install requirements:**
   ```bash
   pip install -r requirements.txt
   ```

### Activate Environment

**Windows:**
```batch
activate_python_env.bat
# or
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source activate_python_env.sh
# or
source venv/bin/activate
```

### Verify Installation
```bash
python -c "import scipy, numpy, pandas; print('All packages installed!')"
```

## MATLAB Environment

### Quick Setup
```matlab
run('setup_matlab_env.m')
```

This will:
- Add project paths to MATLAB
- Check for required toolboxes
- Detect GPU availability
- Create environment configuration

### Required Toolboxes

- **Deep Learning Toolbox** (required for neural networks)
- **Statistics and Machine Learning Toolbox** (recommended)

### Verify Setup
```matlab
% Check if paths are added
which('view_mat_file')

% Check GPU
gpuDevice

% Load environment config
load('matlab_env_config.mat');
disp(envConfig);
```

## Using the Environments

### Python: View .mat Files
```bash
# Activate venv first
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate.bat  # Windows

# View .mat file
python view_mat_file.py mobiles-dataset-docs/trained_models/price_predictor.mat

# Save to file
python view_mat_file.py file.mat -o output.json
```

### MATLAB: View .mat Files
```matlab
view_mat_file('mobiles-dataset-docs/trained_models/price_predictor.mat')
view_mat_file('file.mat', 'output.txt')  % Save to text file
```

### MATLAB: Run Project Scripts
```matlab
% Make sure environment is set up
run('setup_matlab_env.m')

% Run preprocessing
run('mobiles-dataset-docs/preprocess_dataset.m')

% Extract insights
run('mobiles-dataset-docs/extract_all_insights.m')

% Train model
run('mobiles-dataset-docs/train_price_prediction_model.m')
```

## Requirements Files

### Python (`requirements.txt`)
- `numpy` - Numerical computing
- `scipy` - Scientific computing (includes .mat file reading)
- `pandas` - Data manipulation
- `h5py` - HDF5 support (for MATLAB v7.3+ .mat files)
- `matplotlib` - Visualization (optional)
- `scikit-learn` - Machine learning (optional)

### MATLAB
No separate requirements file needed. Toolboxes are checked by `setup_matlab_env.m`.

## Troubleshooting

### Python Issues

**"scipy not found"**
```bash
pip install scipy numpy
```

**"Virtual environment not activating"**
- Windows: Use `venv\Scripts\activate.bat` (not `activate`)
- Linux/Mac: Use `source venv/bin/activate`

**"Permission denied" (Linux/Mac)**
```bash
chmod +x setup_python_env.sh
chmod +x activate_python_env.sh
```

### MATLAB Issues

**"Toolbox not found"**
- Install required toolboxes via MATLAB Add-Ons
- Or use MATLAB Online which includes most toolboxes

**"GPU not detected"**
- Check NVIDIA drivers are installed
- Verify GPU is CUDA-compatible
- Training will fall back to CPU automatically

**"Path not found"**
```matlab
run('setup_matlab_env.m')  % Re-run setup
```

## Project Structure

```
.
├── venv/                    # Python virtual environment (created)
├── requirements.txt         # Python dependencies
├── setup_python_env.bat    # Windows Python setup
├── setup_python_env.sh      # Linux/Mac Python setup
├── setup_matlab_env.m       # MATLAB environment setup
├── activate_python_env.bat  # Windows venv activation
├── activate_python_env.sh   # Linux/Mac venv activation
├── view_mat_file.py         # Python .mat viewer
├── view_mat_file.m          # MATLAB .mat viewer
├── view_mat_file.js         # Node.js .mat viewer
└── matlab_env_config.mat    # MATLAB config (created)
```

## Next Steps

1. **Set up Python environment:**
   ```bash
   ./setup_python_env.sh  # or .bat on Windows
   ```

2. **Set up MATLAB environment:**
   ```matlab
   run('setup_matlab_env.m')
   ```

3. **Test .mat file viewing:**
   ```bash
   python view_mat_file.py mobiles-dataset-docs/trained_models/price_predictor.mat
   ```

4. **Start working:**
   - View trained models
   - Run analysis scripts
   - Train new models
