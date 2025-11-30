"""
Complete Analysis Pipeline
Runs all analyses on the cleaned dataset
"""

import json
import sys
from datetime import datetime

import numpy as np
import pandas as pd

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 80)
print("COMPLETE MOBILE DATASET ANALYSIS PIPELINE")
print("=" * 80)
print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

# Load cleaned dataset
print("Loading cleaned dataset...")
df = pd.read_csv('data/Mobiles_Dataset_Cleaned.csv')
print(f"✓ Loaded {len(df)} phones with {len(df.columns)} features\n")

# Display columns
print("Available columns:")
for i, col in enumerate(df.columns, 1):
    print(f"  {i:2d}. {col}")
print()

# Basic statistics
print("=" * 80)
print("DATASET STATISTICS")
print("=" * 80)

stats = {
    'total_phones': len(df),
    'total_brands': df['Company Name'].nunique() if 'Company Name' in df.columns else 0,
    'year_range': f"{df['Launched Year'].min():.0f} - {df['Launched Year'].max():.0f}" if 'Launched Year' in df.columns else 'N/A',
}

print(f"Total phones: {stats['total_phones']}")
print(f"Total brands: {stats['total_brands']}")
print(f"Year range: {stats['year_range']}\n")

# Numeric columns analysis
numeric_cols = df.select_dtypes(include=[np.number]).columns
print("Numeric Features Summary:")
print("-" * 80)
summary_data = []
for col in numeric_cols:
    if df[col].notna().sum() > 0:
        summary_data.append({
            'Feature': col,
            'Min': f"{df[col].min():.1f}",
            'Max': f"{df[col].max():.1f}",
            'Mean': f"{df[col].mean():.1f}",
            'Median': f"{df[col].median():.1f}"
        })

summary_df = pd.DataFrame(summary_data)
print(summary_df.to_string(index=False))
print()

# Top brands
if 'Company Name' in df.columns:
    print("=" * 80)
    print("TOP 10 BRANDS BY MODEL COUNT")
    print("=" * 80)
    top_brands = df['Company Name'].value_counts().head(10)
    for i, (brand, count) in enumerate(top_brands.items(), 1):
        print(f"  {i:2d}. {brand:20s} - {count:3d} models")
    print()

# Price Analysis (if available)
price_cols = [col for col in df.columns if 'Price' in col and 'EUR' not in col]
if price_cols:
    print("=" * 80)
    print("PRICE ANALYSIS")
    print("=" * 80)

    for price_col in price_cols[:3]:  # Top 3 price columns
        if df[price_col].notna().sum() > 0:
            print(f"\n{price_col}:")
            print(f"  Range: ${df[price_col].min():.0f} - ${df[price_col].max():.0f}")
            print(f"  Average: ${df[price_col].mean():.0f}")
            print(f"  Median: ${df[price_col].median():.0f}")
    print()

# RAM Distribution
if 'RAM' in df.columns:
    print("=" * 80)
    print("RAM DISTRIBUTION")
    print("=" * 80)
    ram_dist = df['RAM'].value_counts().sort_index()
    for ram_val, count in ram_dist.items():
        if pd.notna(ram_val):
            percentage = (count / len(df)) * 100
            print(f"  {ram_val:2.0f}GB - {count:3d} phones ({percentage:5.1f}%)")
    print()

# Save comprehensive report
report = {
    'timestamp': datetime.now().isoformat(),
    'dataset': {
        'total_phones': int(stats['total_phones']),
        'total_brands': int(stats['total_brands']),
        'year_range': stats['year_range'],
        'columns': list(df.columns)
    },
    'top_brands': {brand: int(count) for brand, count in df['Company Name'].value_counts().head(10).items()} if 'Company Name' in df.columns else {},
    'numeric_summaries': {col: {
        'min': float(df[col].min()),
        'max': float(df[col].max()),
        'mean': float(df[col].mean()),
        'median': float(df[col].median())
    } for col in numeric_cols if df[col].notna().sum() > 0}
}

report_path = 'data/dataset_analysis_results.json'
with open(report_path, 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2)

print("=" * 80)
print("✓ ANALYSIS COMPLETE")
print("=" * 80)
print(f"Report saved to: {report_path}\n")
