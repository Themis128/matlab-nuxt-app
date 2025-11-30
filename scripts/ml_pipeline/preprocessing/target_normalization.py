"""
Target Normalization Enhancements

Adds normalized price targets for cross-market/temporal comparisons:
  1. PPP-adjusted price (USD purchasing power parity)
  2. Inflation-adjusted price (CPI to 2025 baseline)
  3. Price residual (actual - expected_from_specs baseline)

Uses rough approximations for PPP/CPI (production would use actual indices).

Outputs:
  data/Mobiles_Dataset_Normalized_Targets.csv (adds 3 new columns)
  data/target_normalization_factors.json
"""
from __future__ import annotations

import json
import warnings
from pathlib import Path

import pandas as pd

warnings.filterwarnings('ignore')

ENGINEERED_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
OUTPUT_PATH = Path("data/Mobiles_Dataset_Normalized_Targets.csv")
FACTORS_PATH = Path("data/target_normalization_factors.json")

# Rough PPP adjustment factors (USD base = 1.0)
# Real values would come from World Bank PPP data
PPP_FACTORS = {
    'USA': 1.0,
    'Pakistan': 0.25,  # ~4x cheaper purchasing power
    'India': 0.28,
    'China': 0.55,
    'Dubai': 0.85,
    'UAE': 0.85
}

# Rough CPI inflation multipliers (2025 baseline = 1.0)
# Real values would use actual CPI indices
CPI_MULTIPLIERS = {
    2025: 1.000,
    2024: 1.032,  # ~3.2% inflation
    2023: 1.067,
    2022: 1.150,  # High inflation year
    2021: 1.198,
    2020: 1.213,
    2019: 1.231,
    2018: 1.250,
    2017: 1.270,
    2016: 1.284
}

PRICE_CANDIDATES = ['Launched Price (USA)', 'Price_USD', 'Price (USD)']


def pick_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for c in candidates:
        if c in df.columns:
            return c
    return None


def infer_market_region(df: pd.DataFrame) -> pd.Series:
    """
    Infer market region from available price columns.
    If multiple regional prices exist, pick the first non-null.
    """
    regional_cols = [
        'Launched Price (Pakistan)', 'Launched Price (India)',
        'Launched Price (China)', 'Launched Price (Dubai)'
    ]

    available_regional = [c for c in regional_cols if c in df.columns]

    if not available_regional:
        return pd.Series(['USA'] * len(df), index=df.index)

    # Pick first non-null regional price
    market = pd.Series(['USA'] * len(df), index=df.index)
    for col in available_regional:
        region_name = col.split('(')[1].split(')')[0]  # Extract 'Pakistan', etc.
        has_price = df[col].notna() & (df[col] > 0)
        market.loc[has_price] = region_name

    return market


def compute_ppp_adjusted_price(df: pd.DataFrame, price_col: str) -> pd.Series:
    """Adjust price to USD PPP baseline"""
    market = infer_market_region(df)
    ppp_factor = market.map(PPP_FACTORS).fillna(1.0)

    price = pd.to_numeric(df[price_col], errors='coerce').fillna(0)
    ppp_price = price / ppp_factor  # Normalize to USD purchasing power

    return ppp_price


def compute_inflation_adjusted_price(df: pd.DataFrame, price_col: str) -> pd.Series:
    """Adjust price to 2025 CPI baseline"""
    year = pd.to_numeric(df['Launched Year'], errors='coerce').fillna(2025).astype(int)
    cpi_multiplier = year.map(CPI_MULTIPLIERS).fillna(1.0)

    price = pd.to_numeric(df[price_col], errors='coerce').fillna(0)
    inflation_price = price * cpi_multiplier  # Inflate to 2025 dollars

    return inflation_price


def compute_price_residual(df: pd.DataFrame, price_col: str) -> pd.Series:
    """
    Compute residual: actual_price - expected_price_from_specs.
    Use simple heuristic baseline: median price per RAM tier.
    Real implementation would use trained model predictions.
    """
    price = pd.to_numeric(df[price_col], errors='coerce').fillna(0)
    ram = pd.to_numeric(df['RAM'], errors='coerce').fillna(df['RAM'].median())

    # Group by RAM tier and compute median price
    expected_price = ram.map(
        df.groupby(pd.cut(ram, bins=[0, 4, 8, 12, float('inf')], labels=['Low', 'Mid', 'High', 'Premium']))
        .apply(lambda g: pd.to_numeric(df.loc[g.index, price_col], errors='coerce').median())
        .to_dict()
    ).fillna(price.median())

    residual = price - expected_price
    return residual


def main():
    if not ENGINEERED_PATH.exists():
        raise FileNotFoundError("Run feature_engineering_extended.py first")

    df = pd.read_csv(ENGINEERED_PATH)

    print("=" * 80)
    print("TARGET NORMALIZATION ENHANCEMENTS")
    print("=" * 80)

    price_col = pick_column(df, PRICE_CANDIDATES)
    if not price_col:
        raise ValueError(f"No price column found. Available: {list(df.columns)}")

    print(f"\nDataset: {len(df)} samples")
    print(f"Base price column: {price_col}")

    # Compute normalized targets
    print("\n[1/3] Computing PPP-adjusted price...")
    df['price_ppp_adjusted'] = compute_ppp_adjusted_price(df, price_col)
    ppp_stats = {
        'mean': float(df['price_ppp_adjusted'].mean()),
        'median': float(df['price_ppp_adjusted'].median()),
        'std': float(df['price_ppp_adjusted'].std()),
        'min': float(df['price_ppp_adjusted'].min()),
        'max': float(df['price_ppp_adjusted'].max())
    }
    print(f"PPP-adjusted: mean=${ppp_stats['mean']:.2f}, median=${ppp_stats['median']:.2f}")

    print("\n[2/3] Computing inflation-adjusted price (2025 baseline)...")
    df['price_inflation_adjusted'] = compute_inflation_adjusted_price(df, price_col)
    inflation_stats = {
        'mean': float(df['price_inflation_adjusted'].mean()),
        'median': float(df['price_inflation_adjusted'].median()),
        'std': float(df['price_inflation_adjusted'].std()),
        'min': float(df['price_inflation_adjusted'].min()),
        'max': float(df['price_inflation_adjusted'].max())
    }
    print(f"Inflation-adjusted: mean=${inflation_stats['mean']:.2f}, median=${inflation_stats['median']:.2f}")

    print("\n[3/3] Computing price residual (actual - expected)...")
    df['price_residual'] = compute_price_residual(df, price_col)
    residual_stats = {
        'mean': float(df['price_residual'].mean()),
        'median': float(df['price_residual'].median()),
        'std': float(df['price_residual'].std()),
        'min': float(df['price_residual'].min()),
        'max': float(df['price_residual'].max())
    }
    print(f"Residual: mean=${residual_stats['mean']:.2f}, std=${residual_stats['std']:.2f}")

    # Save enhanced dataset
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"\n✓ Enhanced dataset saved: {OUTPUT_PATH}")
    print("  Added columns: price_ppp_adjusted, price_inflation_adjusted, price_residual")

    # Save normalization factors
    factors_output = {
        'ppp_factors': PPP_FACTORS,
        'cpi_multipliers': {str(k): v for k, v in CPI_MULTIPLIERS.items()},
        'base_price_column': price_col,
        'statistics': {
            'original_price': {
                'mean': float(df[price_col].mean()),
                'median': float(df[price_col].median()),
                'std': float(df[price_col].std())
            },
            'ppp_adjusted': ppp_stats,
            'inflation_adjusted': inflation_stats,
            'residual': residual_stats
        },
        'new_target_columns': [
            'price_ppp_adjusted',
            'price_inflation_adjusted',
            'price_residual'
        ],
        'note': 'PPP and CPI factors are rough approximations. Use official World Bank PPP and national CPI indices for production.'
    }

    FACTORS_PATH.write_text(json.dumps(factors_output, indent=2), encoding='utf-8')
    print(f"✓ Normalization factors saved: {FACTORS_PATH}")

    # Comparison summary
    print("\n" + "=" * 80)
    print("COMPARISON SUMMARY")
    print("=" * 80)

    original_mean = df[price_col].mean()
    ppp_mean = df['price_ppp_adjusted'].mean()
    inflation_mean = df['price_inflation_adjusted'].mean()

    print(f"Original price:           ${original_mean:8.2f}")
    print(f"PPP-adjusted:             ${ppp_mean:8.2f}  ({(ppp_mean/original_mean - 1)*100:+.1f}%)")
    print(f"Inflation-adjusted (2025): ${inflation_mean:8.2f}  ({(inflation_mean/original_mean - 1)*100:+.1f}%)")
    print("\nResidual distribution:")
    print(f"  Underpriced (<-$100): {(df['price_residual'] < -100).sum()} samples ({(df['price_residual'] < -100).mean()*100:.1f}%)")
    print(f"  Fair priced (±$100):  {((df['price_residual'] >= -100) & (df['price_residual'] <= 100)).sum()} samples ({((df['price_residual'] >= -100) & (df['price_residual'] <= 100)).mean()*100:.1f}%)")
    print(f"  Overpriced (>+$100):  {(df['price_residual'] > 100).sum()} samples ({(df['price_residual'] > 100).mean()*100:.1f}%)")

    print("\n" + "=" * 80)
    print("NORMALIZATION COMPLETE")
    print("=" * 80)
    print("\nNext steps:")
    print("  1. Train models on price_ppp_adjusted for cross-market comparisons")
    print("  2. Train models on price_inflation_adjusted for temporal trends")
    print("  3. Train models on price_residual for value/premium detection")
    print("\nUse these normalized targets to improve model generalization across markets and time periods.")


if __name__ == '__main__':
    main()
