"""
Run preprocessing with proper Unicode handling for Windows
"""
import io
import sys

# Force UTF-8 encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

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

def fix_ram_outliers(df):
    """Fix RAM outliers - cap at realistic maximum of 24GB"""
    print("\n" + "=" * 80)
    print("FIXING RAM OUTLIERS")
    print("=" * 80)

    outliers = df[df['ram'] > 24]
    print(f"Found {len(outliers)} phones with RAM > 24GB")

    if len(outliers) > 0:
        for idx in outliers.index:
            ram_val = df.loc[idx, 'ram']
            storage_val = df.loc[idx, 'storage']

            if pd.isna(storage_val) and ram_val > 24:
                if ram_val in [64, 128, 256, 512, 1024, 2048]:
                    print(f"  - {df.loc[idx, 'model']}: Swapping RAM ({ram_val}GB) with missing storage")
                    df.loc[idx, 'storage'] = ram_val
                    df.loc[idx, 'ram'] = np.nan
                else:
                    print(f"  - {df.loc[idx, 'model']}: Capping RAM from {ram_val}GB to 24GB")
                    df.loc[idx, 'ram'] = 24
            else:
                print(f"  - {df.loc[idx, 'model']}: Capping RAM from {ram_val}GB to 24GB")
                df.loc[idx, 'ram'] = 24

    print("\n[OK] RAM values capped at 24GB")
    print(f"  New range: {df['ram'].min():.1f}GB - {df['ram'].max():.1f}GB")

    return df

def fix_camera_outliers(df):
    """Fix camera outliers"""
    print("\n" + "=" * 80)
    print("FIXING CAMERA OUTLIERS")
    print("=" * 80)

    back_outliers = df[df['back_camera'] > 200]
    print(f"\nFound {len(back_outliers)} phones with back camera > 200MP")

    if len(back_outliers) > 0:
        for idx in back_outliers.index:
            original = df.loc[idx, 'back_camera']
            str_val = str(int(original))
            if len(str_val) >= 4:
                main_mp = int(str_val[:2])
                if main_mp > 200:
                    main_mp = int(str_val[:1]) * 10
                print(f"  - {df.loc[idx, 'model']}: {original}MP -> {main_mp}MP")
                df.loc[idx, 'back_camera'] = main_mp
            else:
                print(f"  - {df.loc[idx, 'model']}: {original}MP -> 200MP (capped)")
                df.loc[idx, 'back_camera'] = 200

    front_outliers = df[df['front_camera'] > 60]
    print(f"\nFound {len(front_outliers)} phones with front camera > 60MP")

    if len(front_outliers) > 0:
        for idx in front_outliers.index:
            original = df.loc[idx, 'front_camera']
            str_val = str(int(original))
            if len(str_val) >= 3:
                main_mp = int(str_val[:2])
                if main_mp > 60:
                    main_mp = int(str_val[:1]) * 10
                print(f"  - {df.loc[idx, 'model']}: {original}MP -> {main_mp}MP")
                df.loc[idx, 'front_camera'] = main_mp
            else:
                print(f"  - {df.loc[idx, 'model']}: {original}MP -> 60MP (capped)")
                df.loc[idx, 'front_camera'] = 60

    print("\n[OK] Camera values normalized")

    return df

def fix_price_outliers(df):
    """Handle extreme price outliers"""
    print("\n" + "=" * 80)
    print("FIXING PRICE OUTLIERS")
    print("=" * 80)

    extreme_outliers = df[df['price_usd'] > 5000]
    print(f"\nFound {len(extreme_outliers)} phones with price > $5000")

    if len(extreme_outliers) > 0:
        for idx in extreme_outliers.index:
            price = df.loc[idx, 'price_usd']
            if price > 10000:
                adjusted_price = price / 10
                if 100 <= adjusted_price <= 5000:
                    print(f"  - {df.loc[idx, 'model']}: ${price:.0f} -> ${adjusted_price:.0f}")
                    df.loc[idx, 'price_usd'] = adjusted_price

    print("\n[OK] Price outliers reviewed")

    return df

def add_euro_prices(df):
    """Add EUR price column"""
    print("\n" + "=" * 80)
    print("ADDING EURO PRICES")
    print("=" * 80)

    df['price_eur'] = np.nan

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

    df['price_eur'] = df['price_eur'].round(2)

    eur_count = df['price_eur'].notna().sum()
    print(f"[OK] EUR prices calculated for {eur_count} phones")
    print(f"  EUR range: EUR{df['price_eur'].min():.2f} - EUR{df['price_eur'].max():.2f}")

    return df

def main():
    """Main processing function"""
    print("=" * 80)
    print("DATASET PREPROCESSING WITH EUR PRICES AND OUTLIER FIXES")
    print("=" * 80)

    input_path = "data/Mobiles_Dataset_Cleaned.csv"
    output_path = "data/Mobiles_Dataset_Final.csv"

    print(f"\nInput: {input_path}")
    print(f"Output: {output_path}")

    # Load dataset
    df = pd.read_csv(input_path)
    print(f"\n[OK] Loaded {len(df)} rows")

    # Store original stats
    original_stats = {
        'ram_max': df['ram'].max() if 'ram' in df.columns else 0,
        'back_camera_max': df['back_camera'].max() if 'back_camera' in df.columns else 0,
        'front_camera_max': df['front_camera'].max() if 'front_camera' in df.columns else 0,
        'price_usd_max': df['price_usd'].max() if 'price_usd' in df.columns else 0,
    }

    # Fix outliers
    df = fix_ram_outliers(df)
    df = fix_camera_outliers(df)
    df = fix_price_outliers(df)

    # Add EUR prices
    df = add_euro_prices(df)

    # Reorder columns
    column_order = [
        'company', 'model', 'processor', 'storage',
        'ram', 'battery', 'screen', 'weight', 'year',
        'front_camera', 'back_camera',
        'price_eur', 'price_usd', 'price_pkr', 'price_inr', 'price_cny', 'price_aed'
    ]
    df = df[column_order]

    # Save
    print("\n" + "=" * 80)
    print("SAVING PROCESSED DATASET")
    print("=" * 80)

    df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"[OK] Saved to: {output_path}")

    # Save report
    report = {
        'timestamp': datetime.now().isoformat(),
        'input_file': input_path,
        'output_file': output_path,
        'total_rows': len(df),
        'columns': list(df.columns),
        'eur_prices_added': int(df['price_eur'].notna().sum()),
        'outliers_fixed': {
            'ram': bool(original_stats['ram_max'] > 24),
            'back_camera': bool(original_stats['back_camera_max'] > 200),
            'front_camera': bool(original_stats['front_camera_max'] > 60),
        },
        'price_ranges': {
            'eur': {'min': float(df['price_eur'].min()), 'max': float(df['price_eur'].max()), 'median': float(df['price_eur'].median())},
            'usd': {'min': float(df['price_usd'].min()), 'max': float(df['price_usd'].max()), 'median': float(df['price_usd'].median())},
        }
    }

    report_path = output_path.replace('.csv', '_fixes_report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    print(f"[OK] Report saved to: {report_path}")

    print("\n" + "=" * 80)
    print("PROCESSING COMPLETE!")
    print("=" * 80)
    print(f"\nDataset saved to: {output_path}")
    print(f"Rows: {len(df)}")
    print(f"EUR prices: {df['price_eur'].notna().sum()}/{len(df)} phones")
    print(f"Price range: EUR{df['price_eur'].min():.0f} - EUR{df['price_eur'].max():.0f}")

if __name__ == "__main__":
    main()
