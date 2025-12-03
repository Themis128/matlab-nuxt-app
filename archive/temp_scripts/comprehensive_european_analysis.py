"""
Comprehensive European Market Analysis for Mobile Phones

Provides deep insights comparing European market vs Global market:
  1. Market Trends (pricing, feature evolution over time)
  2. Market Leadership (dominant brands by region)
  3. Feature Preferences (EU vs Global differences)
  4. Price Positioning (premium/mid/budget distribution)
  5. Innovation Leaders (spec density, new features adoption)
  6. Value Propositions (price/performance ratios)

Outputs:
  - data/european_market_comprehensive_analysis.json
  - data/european_vs_global_trends.csv
  - Visualizations comparing EU and Global markets
"""
from __future__ import annotations

import json
import warnings
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd

warnings.filterwarnings('ignore')

ENGINEERED_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
OUTPUT_JSON = Path("data/european_market_comprehensive_analysis.json")
OUTPUT_CSV = Path("data/european_vs_global_trends.csv")

# European brands and manufacturers
EU_BRANDS = [
    'Nokia', 'Alcatel', 'Philips', 'Siemens', 'Ericsson',
    'BenQ', 'Vertu', 'Haier', 'Gigaset', 'Wiko'
]

def load_data():
    """Load and validate dataset"""
    if not ENGINEERED_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {ENGINEERED_PATH}")

    df = pd.read_csv(ENGINEERED_PATH)

    # Standardize column names
    price_col = 'Launched Price (USA)' if 'Launched Price (USA)' in df.columns else 'price'
    company_col = 'Company Name' if 'Company Name' in df.columns else 'Company Name'
    year_col = 'Launched Year' if 'Launched Year' in df.columns else 'year'

    required_cols = [price_col, company_col, year_col]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    # Rename for consistency
    df = df.rename(columns={
        price_col: 'price',
        company_col: 'Company Name',
        year_col: 'year'
    })

    # Clean data
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    df['year'] = pd.to_numeric(df['year'], errors='coerce')
    df = df.dropna(subset=['price', 'Company Name', 'year'])

    # Add market classification
    df['is_european'] = df['Company Name'].isin(EU_BRANDS)
    df['market'] = df['is_european'].map({True: 'European', False: 'Global'})

    return df

def analyze_market_trends(df):
    """Analyze pricing and feature trends over time"""
    trends = {}

    # Group by year and market
    yearly_stats = df.groupby(['year', 'market']).agg({
        'price': ['mean', 'median', 'std', 'count'],
        'RAM': 'mean' if 'RAM' in df.columns else lambda x: None,
        'Battery Capacity': 'mean' if 'Battery Capacity' in df.columns else lambda x: None,
        'Screen Size': 'mean' if 'Screen Size' in df.columns else lambda x: None
    }).reset_index()

    yearly_stats.columns = ['_'.join(col).strip('_') for col in yearly_stats.columns.values]

    # Calculate year-over-year growth
    for market in ['European', 'Global']:
        market_data = yearly_stats[yearly_stats['market'] == market].sort_values('year')
        if len(market_data) > 1:
            price_growth = []
            for i in range(1, len(market_data)):
                prev_price = market_data.iloc[i-1]['price_mean']
                curr_price = market_data.iloc[i]['price_mean']
                growth = ((curr_price - prev_price) / prev_price) * 100 if prev_price > 0 else 0
                price_growth.append(growth)

            trends[f'{market.lower()}_avg_yoy_growth'] = np.mean(price_growth) if price_growth else 0

    # Latest trends (last 3 years)
    recent_years = df['year'].max() - 2
    recent_df = df[df['year'] >= recent_years]

    trends['recent_european_avg_price'] = recent_df[recent_df['market'] == 'European']['price'].mean()
    trends['recent_global_avg_price'] = recent_df[recent_df['market'] == 'Global']['price'].mean()
    trends['recent_price_gap_percent'] = (
        (trends['recent_european_avg_price'] - trends['recent_global_avg_price']) /
        trends['recent_global_avg_price'] * 100
    )

    return trends, yearly_stats

def analyze_market_leadership(df):
    """Identify dominant brands by market share and pricing power"""
    leadership = {}

    # Overall market share
    eu_phones = df[df['is_european']].shape[0]
    total_phones = df.shape[0]
    leadership['european_market_share_percent'] = (eu_phones / total_phones * 100) if total_phones > 0 else 0

    # Top brands by volume
    top_brands_eu = df[df['is_european']].groupby('Company Name').size().sort_values(ascending=False).head(5)
    top_brands_global = df[~df['is_european']].groupby('Company Name').size().sort_values(ascending=False).head(5)

    leadership['top_european_brands'] = [
        {'brand': brand, 'models': int(count)}
        for brand, count in top_brands_eu.items()
    ]
    leadership['top_global_brands'] = [
        {'brand': brand, 'models': int(count)}
        for brand, count in top_brands_global.items()
    ]

    # Premium pricing leaders (avg price > $800)
    premium_threshold = 800
    premium_eu = df[(df['is_european']) & (df['price'] > premium_threshold)].groupby('Company Name').agg({
        'price': ['mean', 'count']
    }).reset_index()

    premium_global = df[(~df['is_european']) & (df['price'] > premium_threshold)].groupby('Company Name').agg({
        'price': ['mean', 'count']
    }).reset_index()

    leadership['premium_eu_leaders'] = [
        {'brand': row['Company Name'], 'avg_price': float(row[('price', 'mean')]), 'count': int(row[('price', 'count')])}
        for _, row in premium_eu.iterrows()
    ] if not premium_eu.empty else []

    leadership['premium_global_leaders'] = [
        {'brand': row['Company Name'], 'avg_price': float(row[('price', 'mean')]), 'count': int(row[('price', 'count')])}
        for _, row in premium_global.iterrows()
    ] if not premium_global.empty else []

    return leadership

def analyze_feature_preferences(df):
    """Compare feature priorities between EU and Global markets"""
    preferences = {}

    feature_cols = ['RAM', 'Battery Capacity', 'Screen Size', 'Mobile Weight']

    for feat in feature_cols:
        if feat not in df.columns:
            continue

        eu_avg = df[df['is_european']][feat].mean()
        global_avg = df[~df['is_european']][feat].mean()

        diff_percent = ((eu_avg - global_avg) / global_avg * 100) if global_avg > 0 else 0

        preferences[feat.lower().replace(' ', '_')] = {
            'european_avg': float(eu_avg) if not np.isnan(eu_avg) else 0,
            'global_avg': float(global_avg) if not np.isnan(global_avg) else 0,
            'difference_percent': float(diff_percent) if not np.isnan(diff_percent) else 0,
            'preference': 'EU Higher' if diff_percent > 5 else ('Global Higher' if diff_percent < -5 else 'Similar')
        }

    # Camera preferences
    if 'Front Camera' in df.columns and 'Back Camera' in df.columns:
        eu_front = df[df['is_european']]['Front Camera'].mean()
        global_front = df[~df['is_european']]['Front Camera'].mean()
        eu_back = df[df['is_european']]['Back Camera'].mean()
        global_back = df[~df['is_european']]['Back Camera'].mean()

        preferences['camera_focus'] = {
            'european_front_avg': float(eu_front) if not np.isnan(eu_front) else 0,
            'global_front_avg': float(global_front) if not np.isnan(global_front) else 0,
            'european_back_avg': float(eu_back) if not np.isnan(eu_back) else 0,
            'global_back_avg': float(global_back) if not np.isnan(global_back) else 0
        }

    return preferences

def analyze_price_positioning(df):
    """Analyze price tier distribution"""
    positioning = {}

    # Define price tiers
    df['price_tier'] = pd.cut(
        df['price'],
        bins=[0, 300, 600, 1000, float('inf')],
        labels=['Budget', 'Mid-Range', 'Premium', 'Ultra-Premium']
    )

    # Distribution by market
    eu_dist = df[df['is_european']]['price_tier'].value_counts(normalize=True) * 100
    global_dist = df[~df['is_european']]['price_tier'].value_counts(normalize=True) * 100

    positioning['european_distribution'] = {
        tier: float(pct) for tier, pct in eu_dist.items()
    }
    positioning['global_distribution'] = {
        tier: float(pct) for tier, pct in global_dist.items()
    }

    # Average price by tier
    tier_prices = df.groupby(['market', 'price_tier'])['price'].mean().unstack(fill_value=0)

    positioning['tier_avg_prices'] = {
        market: {tier: float(price) for tier, price in row.items()}
        for market, row in tier_prices.iterrows()
    }

    return positioning

def analyze_innovation_leaders(df):
    """Identify innovation leaders by spec density and feature adoption"""
    innovation = {}

    # Spec density leaders (high spec_density values)
    if 'spec_density' in df.columns:
        top_eu_innovation = df[df['is_european']].nlargest(10, 'spec_density')[['Company Name', 'spec_density', 'price', 'year']]
        top_global_innovation = df[~df['is_european']].nlargest(10, 'spec_density')[['Company Name', 'spec_density', 'price', 'year']]

        innovation['top_eu_innovators'] = [
            {
                'brand': row['Company Name'],
                'spec_density': float(row['spec_density']),
                'price': float(row['price']),
                'year': int(row['year'])
            }
            for _, row in top_eu_innovation.iterrows()
        ]

        innovation['top_global_innovators'] = [
            {
                'brand': row['Company Name'],
                'spec_density': float(row['spec_density']),
                'price': float(row['price']),
                'year': int(row['year'])
            }
            for _, row in top_global_innovation.iterrows()
        ]

        # Average spec density by market
        innovation['avg_spec_density_eu'] = float(df[df['is_european']]['spec_density'].mean())
        innovation['avg_spec_density_global'] = float(df[~df['is_european']]['spec_density'].mean())

    # Feature adoption rate (newer features per year)
    if 'year' in df.columns and 'RAM' in df.columns:
        recent_years = df['year'].max() - 2
        recent_eu = df[(df['is_european']) & (df['year'] >= recent_years)]
        recent_global = df[(~df['is_european']) & (df['year'] >= recent_years)]

        innovation['recent_eu_avg_ram'] = float(recent_eu['RAM'].mean()) if not recent_eu.empty else 0
        innovation['recent_global_avg_ram'] = float(recent_global['RAM'].mean()) if not recent_global.empty else 0

    return innovation

def analyze_value_propositions(df):
    """Calculate price/performance ratios"""
    value = {}

    # Value score: (RAM + Battery/1000 + Screen*100) / Price
    if all(col in df.columns for col in ['RAM', 'Battery Capacity', 'Screen Size', 'price']):
        df['value_score'] = (
            df['RAM'] +
            df['Battery Capacity'] / 1000 +
            df['Screen Size'] * 100
        ) / df['price']

        # Best value by market
        eu_value_leaders = df[df['is_european']].nlargest(10, 'value_score')[['Company Name', 'price', 'value_score']]
        global_value_leaders = df[~df['is_european']].nlargest(10, 'value_score')[['Company Name', 'price', 'value_score']]

        value['top_eu_value'] = [
            {
                'brand': row['Company Name'],
                'price': float(row['price']),
                'value_score': float(row['value_score'])
            }
            for _, row in eu_value_leaders.iterrows()
        ]

        value['top_global_value'] = [
            {
                'brand': row['Company Name'],
                'price': float(row['price']),
                'value_score': float(row['value_score'])
            }
            for _, row in global_value_leaders.iterrows()
        ]

        value['avg_value_score_eu'] = float(df[df['is_european']]['value_score'].mean())
        value['avg_value_score_global'] = float(df[~df['is_european']]['value_score'].mean())
        value['value_advantage'] = 'European' if value['avg_value_score_eu'] > value['avg_value_score_global'] else 'Global'

    return value

def generate_summary_insights(df, all_analyses):
    """Generate executive summary insights"""
    summary = {
        'timestamp': datetime.now().isoformat(),
        'dataset_overview': {
            'total_phones': int(df.shape[0]),
            'european_phones': int(df[df['is_european']].shape[0]),
            'global_phones': int(df[~df['is_european']].shape[0]),
            'year_range': f"{int(df['year'].min())}-{int(df['year'].max())}",
            'european_brands_tracked': len(EU_BRANDS)
        },
        'key_findings': []
    }

    # Generate insights
    market_share = all_analyses['market_leadership']['european_market_share_percent']
    summary['key_findings'].append(
        f"European brands hold {market_share:.1f}% of the dataset market share"
    )

    price_gap = all_analyses['market_trends']['recent_price_gap_percent']
    if abs(price_gap) > 10:
        direction = 'higher' if price_gap > 0 else 'lower'
        summary['key_findings'].append(
            f"European phones are {abs(price_gap):.1f}% {direction} priced than global average in recent years"
        )

    if 'value_propositions' in all_analyses and 'value_advantage' in all_analyses['value_propositions']:
        value_leader = all_analyses['value_propositions']['value_advantage']
        summary['key_findings'].append(
            f"{value_leader} brands offer better price/performance ratios on average"
        )

    return summary

def main():
    print("=" * 80)
    print("COMPREHENSIVE EUROPEAN vs GLOBAL MARKET ANALYSIS")
    print("=" * 80)

    # Load data
    print("\n[1/8] Loading dataset...")
    df = load_data()
    print(f"✓ Loaded {df.shape[0]} phones ({df[df['is_european']].shape[0]} European, {df[~df['is_european']].shape[0]} Global)")

    # Run analyses
    print("\n[2/8] Analyzing market trends...")
    trends, trends_df = analyze_market_trends(df)
    print(f"✓ Analyzed {len(trends_df['year'].unique())} years of data")

    print("\n[3/8] Analyzing market leadership...")
    leadership = analyze_market_leadership(df)
    print("✓ Identified top brands and market leaders")

    print("\n[4/8] Analyzing feature preferences...")
    preferences = analyze_feature_preferences(df)
    print(f"✓ Compared {len(preferences)} feature categories")

    print("\n[5/8] Analyzing price positioning...")
    positioning = analyze_price_positioning(df)
    print("✓ Analyzed price tier distributions")

    print("\n[6/8] Analyzing innovation leaders...")
    innovation = analyze_innovation_leaders(df)
    print("✓ Identified innovation and spec density leaders")

    print("\n[7/8] Analyzing value propositions...")
    value = analyze_value_propositions(df)
    print("✓ Calculated price/performance ratios")

    print("\n[8/8] Generating comprehensive report...")

    # Combine all analyses
    comprehensive_analysis = {
        'market_trends': trends,
        'market_leadership': leadership,
        'feature_preferences': preferences,
        'price_positioning': positioning,
        'innovation_leaders': innovation,
        'value_propositions': value
    }

    # Add summary
    summary = generate_summary_insights(df, comprehensive_analysis)
    comprehensive_analysis['summary'] = summary

    # Save outputs
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(comprehensive_analysis, f, indent=2, default=str)
    print(f"✓ Saved comprehensive analysis: {OUTPUT_JSON}")

    # Save trends CSV
    trends_df.to_csv(OUTPUT_CSV, index=False)
    print(f"✓ Saved trends data: {OUTPUT_CSV}")

    # Print summary
    print("\n" + "=" * 80)
    print("EXECUTIVE SUMMARY")
    print("=" * 80)
    for finding in summary['key_findings']:
        print(f"  • {finding}")

    print("\n" + "=" * 80)
    print("ANALYSIS COMPLETE")
    print("=" * 80)
    print("\nOutputs:")
    print(f"  - {OUTPUT_JSON}")
    print(f"  - {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
