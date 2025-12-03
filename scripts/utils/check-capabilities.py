#!/usr/bin/env python3
"""
Python script to check MATLAB capabilities using MATLAB Engine API
Alternative approach if MATLAB Engine for Python is installed
"""

import json
import os
import subprocess
import sys
from pathlib import Path


def check_matlab_via_cli():
    """Check MATLAB capabilities via command line interface"""
    # Read MATLAB configuration
    config_path = Path(__file__).parent / 'matlab.config.json'
    with open(config_path, 'r') as f:
        config = json.load(f)

    matlab_path = Path(config['matlab']['installPath'])
    matlab_exe = matlab_path / 'matlab.exe'
    script_path = Path(__file__).parent / 'check_matlab_capabilities.m'

    print('🔍 Checking MATLAB Capabilities...\n')
    print(f'MATLAB Path: {matlab_exe}\n')

    # Run MATLAB in batch mode
    cmd = [
        str(matlab_exe),
        '-batch',
        f"run('{script_path.as_posix()}')"
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60,
            cwd=Path(__file__).parent
        )

        print(result.stdout)

        if result.stderr:
            print('Warnings:', result.stderr, file=sys.stderr)

        # Save report
        report_path = Path(__file__).parent / 'matlab-capabilities-report.txt'
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(result.stdout)

        print(f'\n✅ Report saved to: {report_path}')

    except subprocess.TimeoutExpired:
        print('❌ MATLAB command timed out')
    except FileNotFoundError:
        print(f'❌ MATLAB executable not found at: {matlab_exe}')
    except Exception as e:
        print(f'❌ Error: {e}')

def check_matlab_via_engine():
    """Check MATLAB capabilities using MATLAB Engine API (if installed)"""
    try:
        import matlab.engine
        print('🔍 Checking MATLAB Capabilities via Engine API...\n')

        # Start MATLAB engine
        eng = matlab.engine.start_matlab()

        # Run the capabilities script
        script_path = Path(__file__).parent / 'check_matlab_capabilities.m'
        eng.run(str(script_path), nargout=0)

        # Get version info
        version = eng.version()
        print(f'MATLAB Version: {version}\n')

        # Get installed toolboxes
        toolboxes = eng.ver()
        print('Installed Toolboxes:')
        for i in range(len(toolboxes)):
            print(f'  - {toolboxes[i]["Name"]} (Version: {toolboxes[i]["Version"]})')

        eng.quit()

    except ImportError:
        print('⚠️  MATLAB Engine for Python not installed.')
        print('   Falling back to command-line interface...\n')
        check_matlab_via_cli()
    except Exception as e:
        print(f'❌ Error using MATLAB Engine: {e}')
        print('   Falling back to command-line interface...\n')
        check_matlab_via_cli()

if __name__ == '__main__':
    # Try Engine API first, fallback to CLI
    check_matlab_via_engine()
