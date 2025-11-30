"""
Advanced Dataset Cleaning Script
Fixes outliers, adds EUR prices, and creates production-ready dataset
"""

import json
from datetime import datetime

import numpy as np
import pandas as pd

# EUR exchange rates (approximate as of Nov 2025)
EXCHANGE_RATES = {
    'USD': 0.92,  # 1 USD = 0.92 EUR
    'PKR': 0.0033,  # 1 PKR = 0.0033 EUR
    'INR': 0.011,  # 1 INR = 0.011 EUR
    'CNY': 0.13,  # 1 CNY = 0.13 EUR
    'AED': 0.25,  # 1 AED = 0.25 EUR
}

def clean_numeric_column(series, unit_pattern=None):
    """Clean a numeric column by removing units and converting to float"""
    cleaned = series.astype(str)

    # Replace common missing value markers
    missing_markers = ['N/A', 'NA', 'n/a', 'na', 'null', 'NULL', 'None', '-', '—', '–', 'TBA', 'tba']
    for marker in missing_markers:
        cleaned = cleaned.str.replace(marker, '', regex=False)

    # Remove currency symbols and units
    cleaned = cleaned.str.replace(r'[^\d.]', '', regex=True)

    # Remove commas (thousands separator)
    cleaned = cleaned.str.replace(',', '')

    # Convert to numeric (empty strings become NaN)
    cleaned = pd.to_numeric(cleaned, errors='coerce')

    return cleaned

def fix_ram_outliers(df):
    """Fix RAM outliers - cap at realistic maximum of 24GB"""
    print("\n" + "=" * 80)
    print("FIXING RAM OUTLIERS")
    print("=" * 80)

    # Identify outliers
    outliers = df[df['ram'] > 24]
    print(f"Found {len(outliers)} phones with RAM > 24GB")

    if len(outliers) > 0:
        print("\nOutliers before fixing:")
        print(outliers[['company', 'model', 'ram', 'storage']].head(10))

        # Strategy: Check if RAM was confused with storage
        for idx in outliers.index:
            ram_val = df.loc[idx, 'ram']
            storage_val = df.loc[idx, 'storage']

            # If storage is missing and RAM is huge, likely they were swapped
            if pd.isna(storage_val) and ram_val > 24:
                # Common storage values: 64, 128, 256, 512, 1024, 2048
                if ram_val in [64, 128, 256, 512, 1024, 2048]:
                    print(f"  - {df.loc[idx, 'model']}: Swapping RAM ({ram_val}GB) with missing storage")
                    df.loc[idx, 'storage'] = ram_val
                    df.loc[idx, 'ram'] = np.nan  # Will be imputed later
                else:
                    # Cap at 24GB
                    print(f"  - {df.loc[idx, 'model']}: Capping RAM from {ram_val}GB to 24GB")
                    df.loc[idx, 'ram'] = 24
            else:
                # Just cap at maximum
                print(f"  - {df.loc[idx, 'model']}: Capping RAM from {ram_val}GB to 24GB")
                df.loc[idx, 'ram'] = 24

    print("\n✓ RAM values capped at 24GB")
    print(f"  New range: {df['ram'].min():.1f}GB - {df['ram'].max():.1f}GB")

    return df

def fix_camera_outliers(df):
    """Fix camera outliers - handle multi-camera concatenation issues"""
    print("\n" + "=" * 80)
    print("FIXING CAMERA OUTLIERS")
    print("=" * 80)

    # Fix back camera
    back_outliers = df[df['back_camera'] > 200]
    print(f"\nFound {len(back_outliers)} phones with back camera > 200MP")

    if len(back_outliers) > 0:
        print("\nBack camera outliers:")
        for idx in back_outliers.index:
            original = df.loc[idx, 'back_camera']
            model = df.loc[idx, 'model']

            # Try to extract the main camera MP from the concatenated value
            # E.g., 5016132 might be "50+16+13+2" → take 50MP
            str_val = str(int(original))
            if len(str_val) >= 4:
                # Take first 2-3 digits as main camera
                main_mp = int(str_val[:2])
                if main_mp > 200:
                    main_mp = int(str_val[:1]) * 10  # e.g., 5 → 50

                print(f"  - {model}: {original}MP → {main_mp}MP (extracted main camera)")
                df.loc[idx, 'back_camera'] = main_mp
            else:
                # Just cap at 200MP
                print(f"  - {model}: {original}MP → 200MP (capped)")
                df.loc[idx, 'back_camera'] = 200

    # Fix front camera
    front_outliers = df[df['front_camera'] > 60]
    print(f"\nFound {len(front_outliers)} phones with front camera > 60MP")

    if len(front_outliers) > 0:
        print("\nFront camera outliers:")
        for idx in front_outliers.index:
            original = df.loc[idx, 'front_camera']
            model = df.loc[idx, 'model']

            # Similar logic for front camera
            str_val = str(int(original))
            if len(str_val) >= 3:
                main_mp = int(str_val[:2])
                if main_mp > 60:
                    main_mp = int(str_val[:1]) * 10

                print(f"  - {model}: {original}MP → {main_mp}MP (extracted main camera)")
                df.loc[idx, 'front_camera'] = main_mp
            else:
                print(f"  - {model}: {original}MP → 60MP (capped)")
                df.loc[idx, 'front_camera'] = 60

    print("\n✓ Camera values normalized")
    print(f"  Back camera range: {df['back_camera'].min():.0f}MP - {df['back_camera'].max():.0f}MP")
    print(f"  Front camera range: {df['front_camera'].min():.0f}MP - {df['front_camera'].max():.0f}MP")

    return df

def fix_price_outliers(df):
    """Handle extreme price outliers"""
    print("\n" + "=" * 80)
    print("FIXING PRICE OUTLIERS")
    print("=" * 80)

    # Identify extreme outliers in USD
    extreme_outliers = df[df['price_usd'] > 5000]
    print(f"\nFound {len(extreme_outliers)} phones with price > $5000")

    if len(extreme_outliers) > 0:
        print("\nExtreme price outliers:")
        print(extreme_outliers[['company', 'model', 'price_usd', 'year']].to_string())

        # Strategy: Check if it's a data entry error (extra zeros, decimal point issues)
        for idx in extreme_outliers.index:
            price = df.loc[idx, 'price_usd']
            model = df.loc[idx, 'model']

            # If price > $10,000, likely has extra zero(s)
            if price > 10000:
                # Try dividing by 10 to see if it makes sense
                adjusted_price = price / 10
                if 100 <= adjusted_price <= 5000:
                    print(f"  - {model}: ${price:.0f} → ${adjusted_price:.0f} (removed extra zero)")
                    df.loc[idx, 'price_usd'] = adjusted_price
                    # Update other currencies proportionally
                    for curr in ['price_pkr', 'price_inr', 'price_cny', 'price_aed']:
                        if pd.notna(df.loc[idx, curr]):
                            df.loc[idx, curr] = df.loc[idx, curr] / 10
                else:
                    # Mark as specialty device but don't change
                    print(f"  - {model}: ${price:.0f} - Kept (likely specialty/enterprise device)")
            else:
                print(f"  - {model}: ${price:.0f} - Kept (premium flagship)")

    print("\n✓ Price outliers reviewed")
    print(f"  USD range: ${df['price_usd'].min():.0f} - ${df['price_usd'].max():.0f}")
    print(f"  Median: ${df['price_usd'].median():.0f}")

    return df

def add_euro_prices(df):
    """Add EUR price column by converting from all available currencies"""
    print("\n" + "=" * 80)
    print("ADDING EURO PRICES")
    print("=" * 80)

    # Initialize EUR column
    df['price_eur'] = np.nan

    # Convert from each currency (use first available)
    for idx in df.index:
        if pd.notna(df.loc[idx, 'price_usd']):
            df.loc[idx, 'price_eur'] = df.loc[idx, 'price_usd'] * EXCHANGE_RATES['USD']
        elif pd.notna(df.loc[idx, 'price_inr']):
            df.loc[idx, 'price_eur'] = df.loc[idx, 'price_inr'] * EXCHANGE_RATES['INR']
        elif pd.notna(df.loc[idx, 'price_cny']):
            df.loc[idx, 'price_eur'] = df.loc[idx, 'price_cny'] * EXCHANGE_RATES['CNY']
        elif pd.notna(df.loc[idx, 'price_aed']):
            df.loc[idx, 'price_eur'] = df.loc[idx, 'price_aed'] * EXCHANGE_RATES['AED']
        elif pd.notna(df.loc[idx, 'price_pkr']):
            df.loc[idx, 'price_eur'] = df.loc[idx, 'price_pkr'] * EXCHANGE_RATES['PKR']

    # Round to 2 decimal places
    df['price_eur'] = df['price_eur'].round(2)

    eur_count = df['price_eur'].notna().sum()
    print(f"✓ EUR prices calculated for {eur_count} phones")
    print(f"  EUR range: €{df['price_eur'].min():.2f} - €{df['price_eur'].max():.2f}")
    print(f"  Median: €{df['price_eur'].median():.2f}")
    print("\nExchange rates used:")
    for curr, rate in EXCHANGE_RATES.items():
        print(f"  1 {curr} = {rate} EUR")

    return df

def fix_all_issues(input_path, output_path):
    """Complete data cleaning with all fixes"""

    print("=" * 80)
    print("ADVANCED DATASET CLEANING")
    print("=" * 80)
    print(f"Input: {input_path}")
    print(f"Output: {output_path}")

    # Load the already cleaned dataset
    df = pd.read_csv(input_path)
    print(f"\n✓ Loaded {len(df)} rows")

    original_stats = {
        'ram_max': df['ram'].max(),
        'back_camera_max': df['back_camera'].max(),
        'front_camera_max': df['front_camera'].max(),
        'price_usd_max': df['price_usd'].max(),
    }

    # Fix outliers
    df = fix_ram_outliers(df)
    df = fix_camera_outliers(df)
    df = fix_price_outliers(df)

    # Add EUR prices
    df = add_euro_prices(df)

    # Reorder columns to include EUR
    column_order = [
        'company', 'model', 'processor', 'storage',
        'ram', 'battery', 'screen', 'weight', 'year',
        'front_camera', 'back_camera',
        'price_eur', 'price_usd', 'price_pkr', 'price_inr', 'price_cny', 'price_aed'
    ]
    df = df[column_order]

    # Save cleaned dataset
    print("\n" + "=" * 80)
    print("SAVING FIXED DATASET")
    print("=" * 80)

    df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"✓ Saved to: {output_path}")

    # Create comparison report
    print("\n" + "=" * 80)
    print("BEFORE vs AFTER COMPARISON")
    print("=" * 80)

    comparison = {
        'RAM': {
            'before': f"{df['ram'].min():.1f} - {original_stats['ram_max']:.1f} GB",
            'after': f"{df['ram'].min():.1f} - {df['ram'].max():.1f} GB",
            'outliers_fixed': int((original_stats['ram_max'] > 24))
        },
        'Back Camera': {
            'before': f"{df['back_camera'].min():.0f} - {original_stats['back_camera_max']:.0f} MP",
            'after': f"{df['back_camera'].min():.0f} - {df['back_camera'].max():.0f} MP",
            'outliers_fixed': int((original_stats['back_camera_max'] > 200))
        },
        'Front Camera': {
            'before': f"{df['front_camera'].min():.0f} - {original_stats['front_camera_max']:.0f} MP",
            'after': f"{df['front_camera'].min():.0f} - {df['front_camera'].max():.0f} MP",
            'outliers_fixed': int((original_stats['front_camera_max'] > 60))
        },
        'Price USD': {
            'before': f"${df['price_usd'].min():.0f} - ${original_stats['price_usd_max']:.0f}",
            'after': f"${df['price_usd'].min():.0f} - ${df['price_usd'].max():.0f}",
            'median': f"${df['price_usd'].median():.0f}"
        },
        'Price EUR': {
            'added': True,
            'range': f"€{df['price_eur'].min():.2f} - €{df['price_eur'].max():.2f}",
            'median': f"€{df['price_eur'].median():.2f}",
            'count': int(df['price_eur'].notna().sum())
        }
    }

    print("\nRAM:")
    print(f"  Before: {comparison['RAM']['before']}")
    print(f"  After:  {comparison['RAM']['after']}")

    print("\nBack Camera:")
    print(f"  Before: {comparison['Back Camera']['before']}")
    print(f"  After:  {comparison['Back Camera']['after']}")

    print("\nFront Camera:")
    print(f"  Before: {comparison['Front Camera']['before']}")
    print(f"  After:  {comparison['Front Camera']['after']}")

    print("\nPrice USD:")
    print(f"  Before: {comparison['Price USD']['before']}")
    print(f"  After:  {comparison['Price USD']['after']}")
    print(f"  Median: {comparison['Price USD']['median']}")

    print("\nPrice EUR (NEW):")
    print(f"  Range:  {comparison['Price EUR']['range']}")
    print(f"  Median: {comparison['Price EUR']['median']}")
    print(f"  Count:  {comparison['Price EUR']['count']} phones")

    # Save comparison report
    report_path = output_path.replace('.csv', '_fixes_report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'original_stats': original_stats,
            'comparison': comparison,
            'final_stats': {
                'total_rows': len(df),
                'columns': list(df.columns),
                'missing_values': df.isnull().sum().to_dict(),
                'numeric_ranges': {
                    'ram': {'min': float(df['ram'].min()), 'max': float(df['ram'].max()), 'median': float(df['ram'].median())},
                    'back_camera': {'min': float(df['back_camera'].min()), 'max': float(df['back_camera'].max()), 'median': float(df['back_camera'].median())},
                    'front_camera': {'min': float(df['front_camera'].min()), 'max': float(df['front_camera'].max()), 'median': float(df['front_camera'].median())},
                    'price_usd': {'min': float(df['price_usd'].min()), 'max': float(df['price_usd'].max()), 'median': float(df['price_usd'].median())},
                    'price_eur': {'min': float(df['price_eur'].min()), 'max': float(df['price_eur'].max()), 'median': float(df['price_eur'].median())},
                }
            }
        }, f, indent=2)

    print(f"\n✓ Comparison report saved to: {report_path}")

    # Display sample
    print("\n" + "=" * 80)
    print("SAMPLE DATA (First 5 rows)")
    print("=" * 80)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', None)
    print(df.head())

    print("\n" + "=" * 80)
    print("✅ DATASET CLEANING COMPLETE!")
    print("=" * 80)
    print("\n✓ All outliers fixed")
    print(f"✓ EUR prices added ({df['price_eur'].notna().sum()} phones)")
    print("✓ Dataset ready for ML training")

    return df

if __name__ == "__main__":
    input_path = "data/Mobiles_Dataset_Cleaned.csv"
    output_path = "data/Mobiles_Dataset_Final.csv"

    df_final = fix_all_issues(input_path, output_path)

    print(f"\n📊 Use '{output_path}' for all ML models and analysis")
