# MATLAB Capabilities Checker - Nuxt 4 App

## MATLAB Installation

MATLAB is installed at: `C:\Program Files\MATLAB\R2026a\bin`

### Version
- MATLAB R2026a

### Configuration
The MATLAB installation path is stored in `matlab.config.json`.

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

Start the Nuxt development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Checking MATLAB Capabilities

This project provides multiple ways to check MATLAB's capabilities, installed toolboxes, and features.

### Method 1: Web Interface (Recommended)

1. Start the Nuxt dev server: `npm run dev`
2. Open `http://localhost:3000` in your browser
3. Click "Check MATLAB Capabilities" button
4. View the results in a beautiful, interactive UI

### Method 2: Node.js Script

```bash
npm run check
```

Or directly:
```bash
node check-capabilities.js
```

### Method 3: Python Script

```bash
python check-capabilities.py
```

### Method 4: Run MATLAB Script Directly

You can also run the MATLAB script directly in MATLAB:
```matlab
run('check_matlab_capabilities.m')
```

## What Gets Checked

The capability checker reports:
1. **Version Information** - MATLAB version, release, Java version
2. **Installed Toolboxes** - All installed MATLAB toolboxes and their versions
3. **System Information** - Computer architecture and system details
4. **Key Capabilities** - Checks for:
   - Image Processing
   - Statistics & Machine Learning
   - Signal Processing
   - Control Systems
   - Optimization
   - Parallel Computing
   - Deep Learning
   - Symbolic Math
5. **Memory Information** - Available and total system memory
6. **GPU Information** - GPU availability and specifications
7. **License Information** - Active MATLAB licenses

## Project Structure

```
.
├── app.vue                 # Root app component
├── pages/                  # Nuxt pages
│   └── index.vue          # Main capabilities checker page
├── server/                 # Server-side code
│   └── api/
│       └── matlab/
│           └── capabilities.get.ts  # API endpoint
├── check_matlab_capabilities.m  # MATLAB script
├── check-capabilities.js   # Node.js CLI script
├── check-capabilities.py   # Python CLI script
├── matlab.config.json      # MATLAB configuration
└── nuxt.config.ts          # Nuxt configuration
```

## API Endpoint

The web app uses a server API endpoint at `/api/matlab/capabilities` that:
- Reads the MATLAB configuration
- Executes the MATLAB capabilities script
- Parses the output
- Returns structured JSON data

## Output

- **Web Interface**: Interactive UI with real-time results
- **CLI Scripts**: Console output and saved to `matlab-capabilities-report.txt`
