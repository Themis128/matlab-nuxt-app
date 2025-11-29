#!/usr/bin/env python3
"""
MATLAB .mat File Viewer
Converts .mat files to readable JSON/text format for viewing in editors
"""

import sys
import json
import argparse
from pathlib import Path

try:
    import scipy.io
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False
    print("Warning: scipy not installed. Install with: pip install scipy")

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False
    print("Warning: numpy not installed. Install with: pip install numpy")


def convert_numpy(obj):
    """Convert numpy arrays to lists for JSON serialization"""
    if isinstance(obj, np.ndarray):
        if obj.size == 1:
            return obj.item()
        elif obj.size < 100:  # Small arrays - show full
            return obj.tolist()
        else:  # Large arrays - show summary
            return {
                "shape": list(obj.shape),
                "dtype": str(obj.dtype),
                "min": float(obj.min()) if HAS_NUMPY else None,
                "max": float(obj.max()) if HAS_NUMPY else None,
                "mean": float(obj.mean()) if HAS_NUMPY else None,
                "sample": obj.flatten()[:10].tolist() if obj.size > 10 else obj.tolist()
            }
    elif isinstance(obj, (np.integer, np.floating)):
        return obj.item()
    elif isinstance(obj, dict):
        return {k: convert_numpy(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_numpy(item) for item in obj]
    else:
        return obj


def view_mat_file(mat_path, output_format='json', output_path=None):
    """View contents of a .mat file"""
    mat_path = Path(mat_path)

    if not mat_path.exists():
        print(f"Error: File not found: {mat_path}")
        return False

    if not HAS_SCIPY:
        print("Error: scipy is required to read .mat files")
        print("Install with: pip install scipy")
        return False

    try:
        # Load .mat file
        print(f"Loading {mat_path}...")
        data = scipy.io.loadmat(str(mat_path), simplify_cells=True)

        # Remove MATLAB metadata
        data_clean = {k: v for k, v in data.items() if not k.startswith('__')}

        # Convert numpy arrays
        if HAS_NUMPY:
            data_clean = convert_numpy(data_clean)

        # Generate output
        if output_format == 'json':
            output = json.dumps(data_clean, indent=2, default=str)
        elif output_format == 'text':
            output = format_text_output(data_clean)
        else:
            output = json.dumps(data_clean, indent=2, default=str)

        # Write output
        if output_path:
            output_file = Path(output_path)
            output_file.write_text(output, encoding='utf-8')
            print(f"✓ Output saved to: {output_file}")
        else:
            print("\n" + "="*60)
            print("MAT File Contents:")
            print("="*60 + "\n")
            print(output)

        return True

    except Exception as e:
        print(f"Error reading .mat file: {e}")
        return False


def format_text_output(data, indent=0):
    """Format data as readable text"""
    output = []
    prefix = "  " * indent

    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                output.append(f"{prefix}{key}:")
                output.append(format_text_output(value, indent + 1))
            else:
                output.append(f"{prefix}{key}: {value}")
    elif isinstance(data, list):
        for i, item in enumerate(data[:20]):  # Limit to first 20 items
            if isinstance(item, (dict, list)):
                output.append(f"{prefix}[{i}]:")
                output.append(format_text_output(item, indent + 1))
            else:
                output.append(f"{prefix}[{i}]: {item}")
        if len(data) > 20:
            output.append(f"{prefix}... ({len(data) - 20} more items)")
    else:
        output.append(f"{prefix}{data}")

    return "\n".join(output)


def main():
    parser = argparse.ArgumentParser(description='View MATLAB .mat files')
    parser.add_argument('mat_file', help='Path to .mat file')
    parser.add_argument('-f', '--format', choices=['json', 'text'], default='json',
                       help='Output format (default: json)')
    parser.add_argument('-o', '--output', help='Output file path (optional)')

    args = parser.parse_args()

    view_mat_file(args.mat_file, args.format, args.output)


if __name__ == '__main__':
    main()
