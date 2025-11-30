"""
Comprehensive Dataset Preprocessing
- Cleans and processes the mobile dataset
- Adds EUR prices (uses 1 USD = 0.92 EUR as default rate)
- Fixes outliers in RAM, camera, and price
- Creates production-ready dataset
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Constants
USD_TO_EUR = 0.92  # Default conversion rate
MAX_RAM_GB = 24  # Maximum reasonable RAM
MAX_CAMERA_MP = 200  # Maximum reasonable camera MP
MAX_PRICE_USD = 3000  # Maximum reasonable price (specialty devices removed)

def extract_numeric(value, unit_pattern=None):
    """Extract numeric value from string, handling units"""
    if pd.isna(value):
        return np.nan

    value_str = str(value).strip()

    # Handle common missing value indicators
    if value_str.lower() in ['n/a', 'na', 'none', 'null', '-', '—', '']:
        return np.nan

    # Extract numbers (including decimals)
    numbers = re.findall(r'\d+\.?\d*', value_str)
    if not numbers:
        return np.nan

    # Return first number found
    return float(numbers[0])

def clean_price(value):
    """Clean price values, removing currency symbols"""
    if pd.isna(value):
        return np.nan

    value_str = str(value).strip()

    # Remove currency symbols and common separators
    cleaned = re.sub(r'[^\d.]', '', value_str)

    try:
        return float(cleaned) if cleaned else np.nan
    except (ValueError, TypeError):
        return np.nan

def fix_outliers(df):
    """Fix identified outliers in RAM, Camera, and Price"""
    fixes_applied = {
        'ram_fixes': 0,
        'front_camera_fixes': 0,
        'back_camera_fixes': 0,
        'price_fixes': 0,
        'outliers_removed': []
    }

    # Fix RAM outliers (max 24GB)
    if 'RAM' in df.columns:
        outlier_mask = df['RAM'] > MAX_RAM_GB
        fixes_applied['ram_fixes'] = int(outlier_mask.sum())
        df.loc[outlier_mask, 'RAM'] = np.nan
        print(f"  ✓ Fixed {fixes_applied['ram_fixes']} RAM outliers (>{MAX_RAM_GB}GB)")

    # Fix Front Camera outliers
    if 'Front Camera' in df.columns:
        outlier_mask = df['Front Camera'] > MAX_CAMERA_MP
        fixes_applied['front_camera_fixes'] = int(outlier_mask.sum())
        df.loc[outlier_mask, 'Front Camera'] = np.nan
        print(f"  ✓ Fixed {fixes_applied['front_camera_fixes']} Front Camera outliers (>{MAX_CAMERA_MP}MP)")

    # Fix Back Camera outliers
    if 'Back Camera' in df.columns:
        outlier_mask = df['Back Camera'] > MAX_CAMERA_MP
        fixes_applied['back_camera_fixes'] = int(outlier_mask.sum())
        df.loc[outlier_mask, 'Back Camera'] = np.nan
        print(f"  ✓ Fixed {fixes_applied['back_camera_fixes']} Back Camera outliers (>{MAX_CAMERA_MP}MP)")

    # Remove extreme price outliers
    if 'Price (USD)' in df.columns:
        outlier_mask = df['Price (USD)'] > MAX_PRICE_USD
        fixes_applied['price_fixes'] = int(outlier_mask.sum())
        fixes_applied['outliers_removed'] = df[outlier_mask][['Company Name', 'Price (USD)']].to_dict('records')
        df = df[~outlier_mask].copy()
        print(f"  ✓ Removed {fixes_applied['price_fixes']} extreme price outliers (>${MAX_PRICE_USD})")

    return df, fixes_applied

def preprocess_dataset(input_path, output_path):
    """Main preprocessing function"""

    print("=" * 80)
    print("COMPREHENSIVE DATASET PREPROCESSING")
    print("=" * 80)
    print(f"Input: {input_path}")
    print(f"Output: {output_path}\n")

    # Load dataset with multiple encoding attempts
    encodings = ['latin-1', 'utf-8', 'cp1252', 'iso-8859-1']
    df = None

    for encoding in encodings:
        try:
            df = pd.read_csv(input_path, encoding=encoding)
            print(f"✓ Loaded dataset with {encoding} encoding")
            print(f"  Rows: {df.shape[0]}, Columns: {df.shape[1]}\n")
            break
        except Exception:
            continue

    if df is None:
        raise ValueError("Failed to load dataset with any encoding")

    # Store original row count
    original_rows = len(df)

    # Step 1: Clean numeric columns
    print("Step 1: Cleaning numeric columns...")

    numeric_conversions = {
        'Mobile Weight': lambda x: extract_numeric(x),
        'RAM': lambda x: extract_numeric(x),
        'Front Camera': lambda x: extract_numeric(x),
        'Back Camera': lambda x: extract_numeric(x),
        'Battery Capacity': lambda x: extract_numeric(x),
        'Screen Size': lambda x: extract_numeric(x),
        'Storage Capacity': lambda x: extract_numeric(x)
    }

    for col, converter in numeric_conversions.items():
        if col in df.columns:
            df[col] = df[col].apply(converter)
            print(f"  ✓ Converted {col} to numeric")

    # Step 2: Clean price columns
    print("\nStep 2: Cleaning price columns...")

    price_columns = [col for col in df.columns if 'Price' in col and col != 'Price (EUR)']
    for col in price_columns:
        if col in df.columns:
            df[col] = df[col].apply(clean_price)
            print(f"  ✓ Cleaned {col}")

    # Step 3: Add EUR prices
    print("\nStep 3: Adding EUR prices...")

    if 'Price (USD)' in df.columns:
        df['Price (EUR)'] = df['Price (USD)'] * USD_TO_EUR
        df['Price (EUR)'] = df['Price (EUR)'].round(2)

        # Calculate statistics
        valid_eur_prices = df['Price (EUR)'].notna().sum()
        avg_eur_price = df['Price (EUR)'].mean()

        print(f"  ✓ Created EUR prices using rate: 1 USD = {USD_TO_EUR} EUR")
        print(f"  ✓ Valid EUR prices: {valid_eur_prices}")
        print(f"  ✓ Average EUR price: €{avg_eur_price:.2f}")

    # Step 4: Fix outliers
    print("\nStep 4: Fixing outliers...")
    df, fixes_applied = fix_outliers(df)

    # Step 5: Handle missing values
    print("\nStep 5: Handling missing values...")

    missing_before = df.isnull().sum().sum()

    # Fill numeric columns with median
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df[col].isnull().any():
            median_val = df[col].median()
            filled_count = df[col].isnull().sum()
            df[col] = df[col].fillna(median_val)
            print(f"  ✓ Filled {filled_count} missing values in {col} with median ({median_val:.2f})")

    # Fill categorical columns with mode
    categorical_cols = df.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        if df[col].isnull().any():
            mode_val = df[col].mode()[0] if len(df[col].mode()) > 0 else 'Unknown'
            filled_count = df[col].isnull().sum()
            df[col] = df[col].fillna(mode_val)
            print(f"  ✓ Filled {filled_count} missing values in {col} with mode ({mode_val})")

    missing_after = df.isnull().sum().sum()
    print(f"  ✓ Missing values reduced: {missing_before} → {missing_after}")

    # Step 6: Data quality checks
    print("\nStep 6: Data quality checks...")

    quality_report = {
        'original_rows': original_rows,
        'final_rows': len(df),
        'rows_removed': original_rows - len(df),
        'columns': len(df.columns),
        'missing_values': int(missing_after),
        'fixes_applied': fixes_applied
    }

    # Check for duplicates
    duplicates = df.duplicated().sum()
    if duplicates > 0:
        df = df.drop_duplicates()
        quality_report['duplicates_removed'] = int(duplicates)
        print(f"  ✓ Removed {duplicates} duplicate rows")

    # Verify data ranges
    checks = {
        'RAM': (0, MAX_RAM_GB),
        'Front Camera': (0, MAX_CAMERA_MP),
        'Back Camera': (0, MAX_CAMERA_MP),
        'Price (USD)': (0, MAX_PRICE_USD),
        'Launched Year': (2000, 2025),
        'Screen Size': (0, 10),
        'Battery Capacity': (0, 10000)
    }

    range_issues = 0
    for col, (min_val, max_val) in checks.items():
        if col in df.columns:
            out_of_range = ((df[col] < min_val) | (df[col] > max_val)).sum()
            if out_of_range > 0:
                range_issues += out_of_range
                print(f"  ⚠️  {col}: {out_of_range} values outside expected range [{min_val}, {max_val}]")

    if range_issues == 0:
        print("  ✓ All numeric values within expected ranges")

    quality_report['range_issues'] = int(range_issues)

    # Step 7: Save processed dataset
    print("\nStep 7: Saving processed dataset...")

    # Create backup of original if it doesn't exist
    backup_path = input_path.replace('.csv', '_backup_original.csv')
    if not Path(backup_path).exists():
        import shutil
        shutil.copy(input_path, backup_path)
        print(f"  ✓ Created backup: {backup_path}")

    # Save cleaned dataset
    df.to_csv(output_path, index=False, encoding='utf-8-sig')
    print(f"  ✓ Saved cleaned dataset: {output_path}")

    # Save quality report
    report_path = output_path.replace('.csv', '_report.json')
    quality_report['timestamp'] = datetime.now().isoformat()
    quality_report['conversion_rate_usd_to_eur'] = USD_TO_EUR

    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(quality_report, f, indent=2)
    print(f"  ✓ Saved quality report: {report_path}")

    # Step 8: Generate summary
    print("\n" + "=" * 80)
    print("PREPROCESSING SUMMARY")
    print("=" * 80)
    print(f"Original rows: {original_rows}")
    print(f"Final rows: {len(df)} ({len(df)/original_rows*100:.1f}%)")
    print(f"Rows removed: {original_rows - len(df)}")
    print(f"Columns: {len(df.columns)}")
    print(f"Missing values: {missing_after}")
    print("\nOutlier fixes:")
    print(f"  - RAM: {fixes_applied['ram_fixes']} fixed")
    print(f"  - Front Camera: {fixes_applied['front_camera_fixes']} fixed")
    print(f"  - Back Camera: {fixes_applied['back_camera_fixes']} fixed")
    print(f"  - Extreme prices: {fixes_applied['price_fixes']} removed")
    print("\nDataset is production-ready! ✓")
    print("=" * 80)

    # Display sample
    print("\nSample of cleaned data (first 5 rows):")
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', None)
    print(df.head())

    # Display statistics
    print("\nNumeric statistics:")
    print(df.describe())

    return df, quality_report

if __name__ == "__main__":
    input_file = "data/Mobiles Dataset (2025).csv"
    output_file = "data/Mobiles_Dataset_Cleaned.csv"

    df, report = preprocess_dataset(input_file, output_file)

    print("\n✓ Preprocessing complete! Dataset ready for analysis and model training.")
