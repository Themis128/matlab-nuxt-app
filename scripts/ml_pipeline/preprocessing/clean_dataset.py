"""
Dataset Cleaning and Preprocessing Script
Cleans the Mobiles Dataset by converting all columns to appropriate data types
and handling missing values marked as strings like 'N/A', '-', etc.
"""

import re

import numpy as np
import pandas as pd


def clean_numeric_column(series, unit_pattern=None):
    """
    Clean a numeric column by removing units and converting to float

    Args:
        series: pandas Series to clean
        unit_pattern: regex pattern for units to remove (optional)

    Returns:
        Cleaned pandas Series as float
    """
    # Convert to string first
    cleaned = series.astype(str)

    # Replace common missing value markers
    missing_markers = ['N/A', 'NA', 'n/a', 'na', 'null', 'NULL', 'None', '-', '—', '–', 'TBA', 'tba']
    for marker in missing_markers:
        cleaned = cleaned.str.replace(marker, '', regex=False)

    # Remove currency symbols and units
    cleaned = cleaned.str.replace(r'[^\d.,]', '', regex=True)

    # Remove commas (thousands separator)
    cleaned = cleaned.str.replace(',', '')

    # Convert to numeric (empty strings become NaN)
    cleaned = pd.to_numeric(cleaned, errors='coerce')

    return cleaned

def preprocess_dataset(input_path, output_path):
    """
    Complete preprocessing pipeline for the mobiles dataset

    Args:
        input_path: Path to input CSV file
        output_path: Path to save cleaned CSV file
    """

    print("=" * 80)
    print("LOADING DATASET")
    print("=" * 80)

    # Load dataset
    df = pd.read_csv(input_path, encoding='latin-1')
    print(f"✓ Loaded {len(df)} rows and {len(df.columns)} columns\n")

    # Store original row count
    original_rows = len(df)

    print("=" * 80)
    print("CLEANING NUMERIC COLUMNS")
    print("=" * 80)

    # Clean Mobile Weight (g)
    print("Cleaning 'Mobile Weight'...")
    df['weight'] = clean_numeric_column(df['Mobile Weight'])
    print(f"  - Converted: {df['weight'].notna().sum()} values")
    print(f"  - Missing: {df['weight'].isna().sum()} values")
    print(f"  - Range: {df['weight'].min():.1f}g to {df['weight'].max():.1f}g")

    # Clean RAM (GB)
    print("\nCleaning 'RAM'...")
    df['ram'] = clean_numeric_column(df['RAM'])
    print(f"  - Converted: {df['ram'].notna().sum()} values")
    print(f"  - Missing: {df['ram'].isna().sum()} values")
    print(f"  - Range: {df['ram'].min():.1f}GB to {df['ram'].max():.1f}GB")

    # Clean Front Camera (MP)
    print("\nCleaning 'Front Camera'...")
    df['front_camera'] = clean_numeric_column(df['Front Camera'])
    print(f"  - Converted: {df['front_camera'].notna().sum()} values")
    print(f"  - Missing: {df['front_camera'].isna().sum()} values")
    print(f"  - Range: {df['front_camera'].min():.1f}MP to {df['front_camera'].max():.1f}MP")

    # Clean Back Camera (MP)
    print("\nCleaning 'Back Camera'...")
    df['back_camera'] = clean_numeric_column(df['Back Camera'])
    print(f"  - Converted: {df['back_camera'].notna().sum()} values")
    print(f"  - Missing: {df['back_camera'].isna().sum()} values")
    print(f"  - Range: {df['back_camera'].min():.1f}MP to {df['back_camera'].max():.1f}MP")

    # Clean Battery Capacity (mAh)
    print("\nCleaning 'Battery Capacity'...")
    df['battery'] = clean_numeric_column(df['Battery Capacity'])
    print(f"  - Converted: {df['battery'].notna().sum()} values")
    print(f"  - Missing: {df['battery'].isna().sum()} values")
    print(f"  - Range: {df['battery'].min():.0f}mAh to {df['battery'].max():.0f}mAh")

    # Clean Screen Size (inches)
    print("\nCleaning 'Screen Size'...")
    df['screen'] = clean_numeric_column(df['Screen Size'])
    print(f"  - Converted: {df['screen'].notna().sum()} values")
    print(f"  - Missing: {df['screen'].isna().sum()} values")
    print(f"  - Range: {df['screen'].min():.2f}\" to {df['screen'].max():.2f}\"")

    # Clean Year
    print("\nProcessing 'Launched Year'...")
    df['year'] = df['Launched Year'].astype(int)
    print(f"  - Range: {df['year'].min()} to {df['year'].max()}")

    print("\n" + "=" * 80)
    print("CLEANING PRICE COLUMNS")
    print("=" * 80)

    # Clean all price columns
    price_columns = {
        'Launched Price (Pakistan)': 'price_pkr',
        'Launched Price (India)': 'price_inr',
        'Launched Price (China)': 'price_cny',
        'Launched Price (USA)': 'price_usd',
        'Launched Price (Dubai)': 'price_aed'
    }

    for old_col, new_col in price_columns.items():
        print(f"\nCleaning '{old_col}'...")
        df[new_col] = clean_numeric_column(df[old_col])
        print(f"  - Converted: {df[new_col].notna().sum()} values")
        print(f"  - Missing: {df[new_col].isna().sum()} values")
        if df[new_col].notna().sum() > 0:
            print(f"  - Range: {df[new_col].min():.0f} to {df[new_col].max():.0f}")

    print("\n" + "=" * 80)
    print("PROCESSING CATEGORICAL COLUMNS")
    print("=" * 80)

    # Clean Company Name
    print("\nProcessing 'Company Name'...")
    df['company'] = df['Company Name'].str.strip()
    print(f"  - Unique companies: {df['company'].nunique()}")
    print(f"  - Top 5: {df['company'].value_counts().head().to_dict()}")

    # Clean Model Name
    print("\nProcessing 'Model Name'...")
    df['model'] = df['Model Name'].str.strip()
    print(f"  - Unique models: {df['model'].nunique()}")

    # Clean Processor
    print("\nProcessing 'Processor'...")
    df['processor'] = df['Processor'].str.strip()
    print(f"  - Unique processors: {df['processor'].nunique()}")

    # Extract storage from model name (many models include storage in name)
    print("\nExtracting 'Storage' from model names...")
    def extract_storage(model_name):
        """Extract storage capacity from model name (e.g., '128GB' -> 128)"""
        match = re.search(r'(\d+)\s*GB', str(model_name), re.IGNORECASE)
        if match:
            return int(match.group(1))
        match = re.search(r'(\d+)\s*TB', str(model_name), re.IGNORECASE)
        if match:
            return int(match.group(1)) * 1024
        return np.nan

    df['storage'] = df['model'].apply(extract_storage)
    print(f"  - Extracted storage for {df['storage'].notna().sum()} phones")
    print(f"  - Missing: {df['storage'].isna().sum()} values")
    if df['storage'].notna().sum() > 0:
        print(f"  - Range: {df['storage'].min():.0f}GB to {df['storage'].max():.0f}GB")

    print("\n" + "=" * 80)
    print("CREATING FINAL CLEANED DATASET")
    print("=" * 80)

    # Select and reorder columns
    cleaned_df = df[[
        'company', 'model', 'processor', 'storage',
        'ram', 'battery', 'screen', 'weight', 'year',
        'front_camera', 'back_camera',
        'price_pkr', 'price_inr', 'price_cny', 'price_usd', 'price_aed'
    ]].copy()

    # Show summary
    print(f"\nFinal dataset shape: {cleaned_df.shape}")
    print(f"Columns: {list(cleaned_df.columns)}")

    # Missing value summary
    print("\nMissing Values Summary:")
    missing_summary = cleaned_df.isnull().sum()
    missing_summary = missing_summary[missing_summary > 0]
    if len(missing_summary) > 0:
        for col, count in missing_summary.items():
            percent = (count / len(cleaned_df)) * 100
            print(f"  - {col}: {count} ({percent:.1f}%)")
    else:
        print("  ✓ No missing values!")

    # Save cleaned dataset
    print("\n" + "=" * 80)
    print("SAVING CLEANED DATASET")
    print("=" * 80)

    cleaned_df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"✓ Saved to: {output_path}")

    # Also save a backup with current timestamp
    import datetime
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = output_path.replace('.csv', f'_backup_{timestamp}.csv')
    cleaned_df.to_csv(backup_path, index=False, encoding='utf-8')
    print(f"✓ Backup saved to: {backup_path}")

    # Display statistics
    print("\n" + "=" * 80)
    print("CLEANED DATASET STATISTICS")
    print("=" * 80)
    print(cleaned_df.describe())

    # Display first few rows
    print("\n" + "=" * 80)
    print("SAMPLE DATA (First 5 Rows)")
    print("=" * 80)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', None)
    print(cleaned_df.head())

    # Save summary report
    summary = {
        'original_rows': original_rows,
        'final_rows': len(cleaned_df),
        'columns': list(cleaned_df.columns),
        'missing_values': {col: int(count) for col, count in cleaned_df.isnull().sum().items()},
        'data_types': {col: str(dtype) for col, dtype in cleaned_df.dtypes.items()},
        'numeric_ranges': {}
    }

    for col in cleaned_df.select_dtypes(include=[np.number]).columns:
        if cleaned_df[col].notna().sum() > 0:
            summary['numeric_ranges'][col] = {
                'min': float(cleaned_df[col].min()),
                'max': float(cleaned_df[col].max()),
                'mean': float(cleaned_df[col].mean()),
                'median': float(cleaned_df[col].median())
            }

    import json
    summary_path = output_path.replace('.csv', '_summary.json')
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)

    print(f"\n✓ Summary report saved to: {summary_path}")

    return cleaned_df

if __name__ == "__main__":
    input_path = "data/Mobiles Dataset (2025).csv"
    output_path = "data/Mobiles_Dataset_Cleaned.csv"

    cleaned_df = preprocess_dataset(input_path, output_path)

    print("\n" + "=" * 80)
    print("PREPROCESSING COMPLETE!")
    print("=" * 80)
    print("\n✓ Cleaned dataset ready for model training")
    print(f"✓ Use '{output_path}' for all ML models")
