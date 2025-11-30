"""
Extended Feature Engineering Script
Generates next-generation engineered features to further improve model performance.
Outputs a new CSV with added columns and a JSON feature schema descriptor.

Base input: data/Mobiles_Dataset_Cleaned.csv (must exist)
Output: data/Mobiles_Dataset_Feature_Engineered.csv
Schema: data/feature_engineering_schema.json
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd

INPUT_PATH = Path("data/Mobiles_Dataset_Cleaned.csv")
OUTPUT_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
SCHEMA_PATH = Path("data/feature_engineering_schema.json")

# Columns expected (best effort; script is defensive):
# Company Name, Model Name, Mobile Weight, RAM, Battery Capacity, Screen Size, Launched Year, Price (USD) or similar

PRICE_COLUMNS_CANDIDATES = [
    "Price_USD", "Price (USD)", "Price_USA", "Price_US", "Price USD", "Price_USD_Adjusted"
]

BRAND_COLUMN = "Company Name"
YEAR_COLUMN = "Launched Year"
RAM_COLUMN = "RAM"
BATTERY_COLUMN = "Battery Capacity"
SCREEN_COLUMN = "Screen Size"
WEIGHT_COLUMN = "Mobile Weight"

# Utility helpers

def safe_numeric(series: pd.Series) -> pd.Series:
    if series.dtype == object:
        cleaned = series.astype(str).str.replace(r"[^0-9.]+", "", regex=True)
        return pd.to_numeric(cleaned, errors="coerce")
    return pd.to_numeric(series, errors="coerce")


def pick_price_column(df: pd.DataFrame) -> str | None:
    for c in PRICE_COLUMNS_CANDIDATES:
        if c in df.columns:
            return c
    # Fallback heuristic: first column containing 'Price' and not 'Pakistan/India/etc'
    for c in df.columns:
        if "Price" in c and "Pakistan" not in c and "India" not in c and "China" not in c:
            return c
    return None


def compute_features(df: pd.DataFrame) -> pd.DataFrame:
    price_col = pick_price_column(df)
    if price_col is None:
        print("⚠ No price column detected; some features will be skipped.")

    # Convert key numeric columns
    ram = safe_numeric(df.get(RAM_COLUMN, pd.Series([np.nan]*len(df))))
    battery = safe_numeric(df.get(BATTERY_COLUMN, pd.Series([np.nan]*len(df))))
    screen = safe_numeric(df.get(SCREEN_COLUMN, pd.Series([np.nan]*len(df))))
    weight = safe_numeric(df.get(WEIGHT_COLUMN, pd.Series([np.nan]*len(df))))
    year = safe_numeric(df.get(YEAR_COLUMN, pd.Series([np.nan]*len(df))))
    price = safe_numeric(df.get(price_col, pd.Series([np.nan]*len(df)))) if price_col else pd.Series([np.nan]*len(df))

    current_year = int(np.nanmax(year)) if np.nanmax(year) > 1970 else 2025
    months_since_launch = (current_year - year) * 12

    # 1. spec_density: Composite spec score per gram
    composite_spec = ram.fillna(0) + (battery.fillna(0)/1000.0) + screen.fillna(0)
    df['spec_density'] = composite_spec / (weight.replace(0, np.nan))

    # 2. temporal_decay: Exponential decay factor (devices lose relevance over time)
    df['temporal_decay'] = np.exp(-months_since_launch.fillna(0) / 24.0)

    # 3. price_elasticity_proxy: Relative price vs composite spec
    df['price_elasticity_proxy'] = price / (composite_spec.replace(0, np.nan))

    # 4. efficiency ratios
    df['battery_weight_ratio'] = battery / weight.replace(0, np.nan)
    df['screen_weight_ratio'] = screen / weight.replace(0, np.nan)
    df['ram_weight_ratio'] = ram / weight.replace(0, np.nan)

    # 5. percentile ranks (overall and per brand)
    if price_col:
        df['price_percentile_global'] = price.rank(pct=True)
        df['ram_percentile_global'] = ram.rank(pct=True)
        df['battery_percentile_global'] = battery.rank(pct=True)
    else:
        df['price_percentile_global'] = np.nan
        df['ram_percentile_global'] = ram.rank(pct=True)
        df['battery_percentile_global'] = battery.rank(pct=True)

    if BRAND_COLUMN in df.columns and price_col:
        df['price_percentile_brand'] = df.groupby(BRAND_COLUMN)[price_col].rank(pct=True)
    else:
        df['price_percentile_brand'] = np.nan

    # 6. cross_brand_price_delta: Price - brand average price (same year if possible)
    if BRAND_COLUMN in df.columns and price_col:
        if YEAR_COLUMN in df.columns:
            brand_year_avg = df.groupby([BRAND_COLUMN, YEAR_COLUMN])[price_col].transform('mean')
        else:
            brand_year_avg = df.groupby(BRAND_COLUMN)[price_col].transform('mean')
        df['cross_brand_price_delta'] = price - brand_year_avg
    else:
        df['cross_brand_price_delta'] = np.nan

    # 7. composite performance ratios
    df['spec_value_ratio'] = composite_spec / price.replace(0, np.nan) if price_col else np.nan

    # 8. market_segment (budget/mid/premium) via global price percentiles
    if price_col:
        pct = df['price_percentile_global']
        conditions = [pct < 0.33, pct < 0.66, pct >= 0.66]
        segments = ['budget', 'mid', 'premium']
        df['market_segment'] = np.select(conditions, segments, default='unknown')
    else:
        df['market_segment'] = 'unknown'

    # 9. interaction term: ram_battery_interaction (already may exist; recompute robustly)
    df['ram_battery_interaction_v2'] = (ram * battery) / 1000.0

    # 10. technology_generation (approx): derive from year buckets
    if year.notna().any():
        df['technology_generation_v2'] = pd.cut(year,
            bins=[0,2014,2016,2018,2020,2022,2024,2030],
            labels=['legacy','early_modern','modern','late_modern','current','recent','future'],
            include_lowest=True)
    else:
        df['technology_generation_v2'] = 'unknown'

    return df


def build_schema(df: pd.DataFrame) -> dict:
    engineered_cols = [
        'spec_density', 'temporal_decay', 'price_elasticity_proxy', 'battery_weight_ratio',
        'screen_weight_ratio', 'ram_weight_ratio', 'price_percentile_global', 'ram_percentile_global',
        'battery_percentile_global', 'price_percentile_brand', 'cross_brand_price_delta', 'spec_value_ratio',
        'market_segment', 'ram_battery_interaction_v2', 'technology_generation_v2'
    ]
    schema = {}
    for col in engineered_cols:
        if col in df.columns:
            schema[col] = {
                'dtype': str(df[col].dtype),
                'example': df[col].dropna().iloc[0] if df[col].dropna().size else None,
                'description': feature_descriptions().get(col, 'N/A')
            }
    return {
        'total_rows': int(df.shape[0]),
        'engineered_features': schema,
        'source': str(INPUT_PATH),
        'price_column_used': pick_price_column(df),
    }


def feature_descriptions() -> dict:
    return {
        'spec_density': 'Composite (RAM + battery/1000 + screen) per gram weight',
        'temporal_decay': 'Exponential relevance decay since launch (months)',
        'price_elasticity_proxy': 'Price divided by composite spec (higher = less value)',
        'battery_weight_ratio': 'Battery capacity per gram',
        'screen_weight_ratio': 'Screen size per gram weight',
        'ram_weight_ratio': 'RAM per gram weight',
        'price_percentile_global': 'Global price percentile rank',
        'ram_percentile_global': 'Global RAM percentile rank',
        'battery_percentile_global': 'Global battery percentile rank',
        'price_percentile_brand': 'Price percentile within brand',
        'cross_brand_price_delta': 'Difference from brand-year average price',
        'spec_value_ratio': 'Composite spec divided by price',
        'market_segment': 'Segment classification from price percentile',
        'ram_battery_interaction_v2': 'Interaction product RAM × Battery (scaled)',
        'technology_generation_v2': 'Launch era bucket',
    }


def main():
    if not INPUT_PATH.exists():
        raise FileNotFoundError(f"Input cleaned dataset not found: {INPUT_PATH}")

    df = pd.read_csv(INPUT_PATH)
    original_columns = set(df.columns)
    df_feat = compute_features(df)
    new_columns = [c for c in df_feat.columns if c not in original_columns]

    df_feat.to_csv(OUTPUT_PATH, index=False)
    schema = build_schema(df_feat)
    schema['new_feature_columns'] = new_columns

    with SCHEMA_PATH.open('w', encoding='utf-8') as f:
        json.dump(schema, f, indent=2)

    print(f"✓ Extended feature engineering complete. Saved CSV: {OUTPUT_PATH}")
    print(f"✓ Schema saved: {SCHEMA_PATH}")
    print("New feature columns:")
    for c in new_columns:
        print(f"  - {c}")

if __name__ == '__main__':
    main()
