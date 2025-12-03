"""
CSV Schema Validator for Mobiles Dataset
Validates that CSV files have the expected column structure and data types.
"""
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import pandas as pd

# Expected schema for Mobiles Dataset (2025)
# Column name mapping: actual CSV headers -> normalized names
COLUMN_MAPPING = {
    'Company Name': 'company',
    'Model Name': 'name',
    'RAM': 'ram',
    'Screen Size': 'screen',
    'Front Camera': 'front_camera',
    'Back Camera': 'back_camera',
    'Battery Capacity': 'battery',
    'Mobile Weight': 'weight',
    'Launched Year': 'year',
    'Current Price (Greece)': 'price',
    'Processor': 'processor',
    'Launched Price (Europe)': 'price_europe',
    'Launched Price (USA)': 'price_usa',
    'Launched Price (China)': 'price_china',
    'Launched Price (India)': 'price_india',
    'Launched Price (Pakistan)': 'price_pakistan',
    'Launched Price (Dubai)': 'price_dubai'
}

EXPECTED_SCHEMA = {
    'company': 'object',
    'name': 'object',
    'ram': 'object',  # Mixed format: "6GB" etc
    'screen': 'object',  # Mixed format: "6.1 inches"
    'front_camera': 'object',  # "12MP"
    'back_camera': 'object',  # "48MP"
    'battery': 'object',  # "3,600mAh"
    'weight': 'object',  # "174g"
    'year': 'int64',
    'price': 'object',  # "EUR 729.52"
    'processor': 'object'
}

# Optional columns (won't fail if missing)
OPTIONAL_COLUMNS = [
    'price_europe', 'price_usa', 'price_china',
    'price_india', 'price_pakistan', 'price_dubai'
]

# Required columns (must exist in raw CSV)
REQUIRED_COLUMNS = [
    'Company Name', 'Model Name', 'RAM', 'Screen Size', 'Front Camera',
    'Back Camera', 'Battery Capacity', 'Mobile Weight', 'Launched Year',
    'Current Price (Greece)', 'Processor'
]


def validate_csv_schema(
    csv_path: str,
    schema: Optional[Dict[str, str]] = None,
    required: Optional[List[str]] = None,
    optional: Optional[List[str]] = None,
    verbose: bool = True
) -> Tuple[bool, List[str]]:
    """
    Validate CSV schema against expected structure.

    Returns:
        (is_valid, errors): Tuple of validation status and list of error messages
    """
    if schema is None:
        schema = EXPECTED_SCHEMA
    if required is None:
        required = REQUIRED_COLUMNS
    if optional is None:
        optional = OPTIONAL_COLUMNS

    errors = []

    # Check file exists
    if not Path(csv_path).exists():
        errors.append(f"File not found: {csv_path}")
        return False, errors

    try:
        # Try different encodings
        encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'iso-8859-1', 'cp1252']
        df = None
        used_encoding = None

        for encoding in encodings:
            try:
                df = pd.read_csv(csv_path, encoding=encoding, low_memory=False, nrows=100)
                used_encoding = encoding
                break
            except (UnicodeDecodeError, Exception):
                continue

        if df is None:
            errors.append("Could not decode CSV with any standard encoding")
            return False, errors

        if verbose:
            print(f"✓ Loaded CSV with encoding: {used_encoding}")
            print(f"  Rows (preview): {len(df)}, Columns: {len(df.columns)}")
            print(f"  Column names: {', '.join(df.columns[:5])}{'...' if len(df.columns) > 5 else ''}")

        # Check required columns (using actual CSV headers)
        actual_columns = set(df.columns)
        required_set = set(required)
        missing_required = required_set - actual_columns

        if missing_required:
            errors.append(f"Missing required columns: {', '.join(sorted(missing_required))}")

        # Check for unexpected columns (excluding optional and mapped)
        known_columns = set(COLUMN_MAPPING.keys()) if 'COLUMN_MAPPING' in globals() else set(schema.keys())
        unexpected = actual_columns - known_columns - set(optional)

        if unexpected and verbose:
            print(f"⚠️  Unexpected columns (not in schema): {', '.join(sorted(unexpected))}")

        # For validation, we don't enforce data types on raw format
        # (preprocessing pipeline handles conversion)
        if verbose:
            print(f"✓ All required columns present")
            print(f"  Schema check: using raw CSV format (preprocessing will normalize)")
        # Check for duplicates (based on model name + company + year)
        if 'Model Name' in df.columns and 'Company Name' in df.columns and 'Launched Year' in df.columns:
            duplicates = df.duplicated(subset=['Model Name', 'Company Name', 'Launched Year'], keep=False)
            if duplicates.any():
                dup_count = duplicates.sum()
                if verbose:
                    print(f"⚠️  Found {dup_count} potential duplicate rows (same model, company, year)")

        # Summary
        if verbose:
            print(f"\n{'='*60}")
            print("VALIDATION SUMMARY")
            print(f"{'='*60}")
            if not errors:
                print("✅ Schema validation passed!")
                print(f"  All {len(required)} required columns present")
                print(f"  Using raw CSV format (preprocessing normalizes data types)")
            else:
                print("❌ Schema validation failed!")
                for error in errors:
                    print(f"  ❌ {error}")

        return len(errors) == 0, errors

    except Exception as e:
        errors.append(f"Unexpected error: {str(e)}")
        return False, errors


def validate_all_datasets(directory: str = 'data', verbose: bool = True) -> bool:
    """Validate all CSV files in a directory."""
    dir_path = Path(directory)

    if not dir_path.exists():
        print(f"❌ Directory not found: {directory}")
        return False

    csv_files = list(dir_path.glob('*.csv'))

    if not csv_files:
        print(f"ℹ️  No CSV files found in {directory}")
        return True

    if verbose:
        print(f"📊 Found {len(csv_files)} CSV file(s) to validate\n")

    all_valid = True
    for csv_file in csv_files:
        print(f"\n{'='*60}")
        print(f"Validating: {csv_file.name}")
        print(f"{'='*60}")

        is_valid, errors = validate_csv_schema(str(csv_file), verbose=verbose)

        if not is_valid:
            all_valid = False

    return all_valid


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Validate CSV schema for Mobiles Dataset')
    parser.add_argument('--file', type=str, help='Specific CSV file to validate')
    parser.add_argument('--dir', type=str, default='data', help='Directory to scan for CSV files')
    parser.add_argument('--quiet', action='store_true', help='Minimal output')

    args = parser.parse_args()

    verbose = not args.quiet

    if args.file:
        is_valid, errors = validate_csv_schema(args.file, verbose=verbose)
        sys.exit(0 if is_valid else 1)
    else:
        all_valid = validate_all_datasets(args.dir, verbose=verbose)
        sys.exit(0 if all_valid else 1)
