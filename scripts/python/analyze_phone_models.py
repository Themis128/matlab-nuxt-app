"""
Analyze Phone Models - Extract Insights
"""
import pandas as pd
import numpy as np
import re
from collections import Counter
import json
from pathlib import Path

# Get project root and load dataset
project_root = Path(__file__).parent.parent.parent
dataset_path = project_root / 'data' / 'Mobiles Dataset (2025).csv'
if not dataset_path.exists():
    dataset_path = project_root / 'Mobiles Dataset (2025).csv'
df = pd.read_csv(dataset_path, encoding='latin-1')

print("=" * 80)
print("PHONE MODELS INSIGHTS ANALYSIS")
print("=" * 80)

# Helper function to extract storage from model name
def extract_storage(model_name):
    """Extract storage size from model name"""
    if pd.isna(model_name):
        return None
    model_str = str(model_name).upper()
    # Look for storage patterns: 32GB, 64GB, 128GB, 256GB, 512GB, 1TB
    storage_patterns = {
        '1TB': 1024, '512GB': 512, '256GB': 256,
        '128GB': 128, '64GB': 64, '32GB': 32, '16GB': 16
    }
    for pattern, size in storage_patterns.items():
        if pattern in model_str:
            return size
    return None

# Helper function to extract series/variant
def extract_series(model_name):
    """Extract phone series from model name"""
    if pd.isna(model_name):
        return None
    model_str = str(model_name)

    # Common patterns
    patterns = [
        r'(iPhone \d+)', r'(Galaxy [A-Z]\d+)', r'(Pixel \d+)',
        r'(OnePlus \d+)', r'(Redmi Note \d+)', r'(Redmi \d+)',
        r'(Edge \d+)', r'(Mate \d+)', r'(P\d+)', r'(A\d+)',
        r'(\d+ Pro)', r'(\d+ Plus)', r'(\d+ Lite)', r'(\d+ Max)'
    ]

    for pattern in patterns:
        match = re.search(pattern, model_str, re.IGNORECASE)
        if match:
            return match.group(1)
    return None

# Parse numerical features
def extract_number(value, pattern=r'(\d+\.?\d*)'):
    if pd.isna(value):
        return np.nan
    value_str = str(value)
    match = re.search(pattern, value_str.replace(',', ''))
    return float(match.group(1)) if match else np.nan

# Add parsed features
df['ram_parsed'] = df['RAM'].apply(lambda x: extract_number(str(x), r'(\d+)'))
df['battery_parsed'] = df['Battery Capacity'].apply(lambda x: extract_number(str(x), r'([\d,]+)'))
df['screen_parsed'] = df['Screen Size'].apply(lambda x: extract_number(str(x), r'(\d+\.?\d*)'))
df['weight_parsed'] = df['Mobile Weight'].apply(lambda x: extract_number(str(x), r'(\d+)'))
df['price_parsed'] = df['Launched Price (USA)'].apply(lambda x: extract_number(str(x), r'([\d,]+)'))
df['year_parsed'] = df['Launched Year'].apply(lambda x: extract_number(str(x), r'(\d{4})'))

# Extract storage and series
df['storage_gb'] = df['Model Name'].apply(extract_storage)
df['series'] = df['Model Name'].apply(extract_series)

# Clean data
df_clean = df[['Company Name', 'Model Name', 'ram_parsed', 'battery_parsed',
               'screen_parsed', 'weight_parsed', 'price_parsed', 'year_parsed',
               'storage_gb', 'series']].dropna(subset=['ram_parsed', 'battery_parsed',
                                                       'screen_parsed', 'weight_parsed',
                                                       'price_parsed', 'year_parsed'])

print(f"\nDataset: {len(df_clean)} phones, {df_clean['Model Name'].nunique()} unique models")
print(f"Companies: {df_clean['Company Name'].nunique()}")
print(f"Years: {df_clean['year_parsed'].min():.0f} - {df_clean['year_parsed'].max():.0f}")

# ============================================================================
# INSIGHT 1: Storage Variants Analysis
# ============================================================================
print("\n" + "=" * 80)
print("INSIGHT 1: STORAGE VARIANTS ANALYSIS")
print("=" * 80)

storage_stats = df_clean.groupby('storage_gb').agg({
    'price_parsed': ['count', 'mean', 'min', 'max'],
    'ram_parsed': 'mean',
    'Model Name': 'nunique'
}).round(2)

storage_stats.columns = ['Count', 'Avg Price', 'Min Price', 'Max Price', 'Avg RAM', 'Unique Models']
print("\nStorage Variants:")
print(storage_stats.sort_index())

# Storage distribution by brand
print("\nTop Brands by Storage Variants:")
storage_by_brand = df_clean.groupby(['Company Name', 'storage_gb']).size().unstack(fill_value=0)
print(storage_by_brand.sum(axis=1).sort_values(ascending=False).head(10))

# ============================================================================
# INSIGHT 2: Model Series Analysis
# ============================================================================
print("\n" + "=" * 80)
print("INSIGHT 2: MODEL SERIES ANALYSIS")
print("=" * 80)

series_data = df_clean[df_clean['series'].notna()].copy()
if len(series_data) > 0:
    print(f"\nModels with identifiable series: {len(series_data)} ({len(series_data)/len(df_clean)*100:.1f}%)")

    # Top series by count
    top_series = series_data['series'].value_counts().head(15)
    print("\nTop 15 Phone Series (by model count):")
    for series, count in top_series.items():
        avg_price = series_data[series_data['series'] == series]['price_parsed'].mean()
        print(f"  {series:30s} - {count:3d} models, Avg Price: ${avg_price:,.0f}")

    # Series price ranges
    print("\nPrice Ranges by Series (Top 10):")
    series_price = series_data.groupby('series')['price_parsed'].agg(['count', 'mean', 'min', 'max']).sort_values('count', ascending=False).head(10)
    series_price.columns = ['Count', 'Avg Price', 'Min Price', 'Max Price']
    print(series_price.round(0))

# ============================================================================
# INSIGHT 3: Model Naming Patterns
# ============================================================================
print("\n" + "=" * 80)
print("INSIGHT 3: MODEL NAMING PATTERNS")
print("=" * 80)

# Common suffixes/prefixes
suffixes = []
prefixes = []
for model in df_clean['Model Name'].dropna():
    parts = str(model).split()
    if len(parts) > 0:
        prefixes.append(parts[0])
    if len(parts) > 1:
        suffixes.append(parts[-1])

print("\nMost Common Model Name Prefixes:")
print(Counter(prefixes).most_common(10))

print("\nMost Common Model Name Suffixes:")
print(Counter(suffixes).most_common(10))

# ============================================================================
# INSIGHT 4: Price Segments by Model
# ============================================================================
print("\n" + "=" * 80)
print("INSIGHT 4: PRICE SEGMENTS BY MODEL")
print("=" * 80)

def categorize_price(price):
    if price < 200:
        return "Budget (<$200)"
    elif price < 500:
        return "Mid-Range ($200-$500)"
    elif price < 1000:
        return "Premium ($500-$1000)"
    else:
        return "Flagship (>$1000)"

df_clean['price_segment'] = df_clean['price_parsed'].apply(categorize_price)

print("\nPrice Segments Distribution:")
print(df_clean['price_segment'].value_counts())

print("\nPrice Segments by Brand:")
price_by_brand = pd.crosstab(df_clean['Company Name'], df_clean['price_segment'])
print(price_by_brand)

# ============================================================================
# INSIGHT 5: Model Feature Patterns
# ============================================================================
print("\n" + "=" * 80)
print("INSIGHT 5: MODEL FEATURE PATTERNS")
print("=" * 80)

# Models with highest specs
print("\nTop 10 Models by RAM:")
top_ram = df_clean.nlargest(10, 'ram_parsed')[['Company Name', 'Model Name', 'ram_parsed', 'price_parsed']]
print(top_ram.to_string(index=False))

print("\nTop 10 Models by Battery:")
top_battery = df_clean.nlargest(10, 'battery_parsed')[['Company Name', 'Model Name', 'battery_parsed', 'price_parsed']]
print(top_battery.to_string(index=False))

print("\nTop 10 Models by Screen Size:")
top_screen = df_clean.nlargest(10, 'screen_parsed')[['Company Name', 'Model Name', 'screen_parsed', 'price_parsed']]
print(top_screen.to_string(index=False))

# ============================================================================
# INSIGHT 6: Value Analysis (Price per Feature)
# ============================================================================
print("\n" + "=" * 80)
print("INSIGHT 6: VALUE ANALYSIS (Price per Feature)")
print("=" * 80)

df_clean['price_per_ram'] = df_clean['price_parsed'] / (df_clean['ram_parsed'] + 1)
df_clean['price_per_battery'] = df_clean['price_parsed'] / (df_clean['battery_parsed'] + 1)
df_clean['price_per_screen'] = df_clean['price_parsed'] / (df_clean['screen_parsed'] + 0.1)

print("\nBest Value Models (Lowest Price per GB RAM):")
best_value_ram = df_clean.nsmallest(10, 'price_per_ram')[['Company Name', 'Model Name', 'ram_parsed', 'price_parsed', 'price_per_ram']]
print(best_value_ram.to_string(index=False))

print("\nBest Value Models (Lowest Price per mAh Battery):")
best_value_battery = df_clean.nsmallest(10, 'price_per_battery')[['Company Name', 'Model Name', 'battery_parsed', 'price_parsed', 'price_per_battery']]
print(best_value_battery.to_string(index=False))

# ============================================================================
# INSIGHT 7: Model Release Trends
# ============================================================================
print("\n" + "=" * 80)
print("INSIGHT 7: MODEL RELEASE TRENDS")
print("=" * 80)

yearly_releases = df_clean.groupby('year_parsed').agg({
    'Model Name': 'nunique',
    'price_parsed': 'mean',
    'ram_parsed': 'mean',
    'battery_parsed': 'mean'
}).round(2)

yearly_releases.columns = ['New Models', 'Avg Price', 'Avg RAM (GB)', 'Avg Battery (mAh)']
print("\nYearly Release Trends:")
print(yearly_releases)

# ============================================================================
# INSIGHT 8: Brand Model Diversity
# ============================================================================
print("\n" + "=" * 80)
print("INSIGHT 8: BRAND MODEL DIVERSITY")
print("=" * 80)

brand_diversity = df_clean.groupby('Company Name').agg({
    'Model Name': 'nunique',
    'price_parsed': ['mean', 'min', 'max'],
    'ram_parsed': 'mean',
    'battery_parsed': 'mean'
}).round(2)

brand_diversity.columns = ['Unique Models', 'Avg Price', 'Min Price', 'Max Price', 'Avg RAM', 'Avg Battery']
brand_diversity = brand_diversity.sort_values('Unique Models', ascending=False)
print("\nBrand Model Diversity:")
print(brand_diversity)

# ============================================================================
# INSIGHT 9: Model Specifications Correlation
# ============================================================================
print("\n" + "=" * 80)
print("INSIGHT 9: MODEL SPECIFICATIONS CORRELATION")
print("=" * 80)

correlations = df_clean[['ram_parsed', 'battery_parsed', 'screen_parsed',
                         'weight_parsed', 'price_parsed', 'year_parsed']].corr()
print("\nFeature Correlations:")
print(correlations['price_parsed'].sort_values(ascending=False))

# ============================================================================
# INSIGHT 10: Model Uniqueness Score
# ============================================================================
print("\n" + "=" * 80)
print("INSIGHT 10: MODEL UNIQUENESS ANALYSIS")
print("=" * 80)

# Models that appear only once (unique variants)
unique_models = df_clean['Model Name'].value_counts()
single_occurrence = unique_models[unique_models == 1]
print(f"\nModels with single occurrence: {len(single_occurrence)} ({len(single_occurrence)/len(unique_models)*100:.1f}%)")

# Most common model names (storage variants)
print("\nMost Common Base Models (across storage variants):")
base_models = df_clean['Model Name'].str.replace(r'\s+\d+GB.*', '', regex=True).str.replace(r'\s+\d+TB.*', '', regex=True)
base_model_counts = base_models.value_counts().head(10)
print(base_model_counts)

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
