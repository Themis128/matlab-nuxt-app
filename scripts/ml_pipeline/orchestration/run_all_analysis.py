"""
Comprehensive Mobile Dataset Analysis Suite
Runs all analysis: European market, price predictions, dataset exploration
Uses the production-ready Mobiles_Dataset_Final.csv
"""

import json
import warnings
from datetime import datetime

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

warnings.filterwarnings('ignore')

# Set style
sns.set_style('whitegrid')
plt.rcParams['figure.figsize'] = (12, 6)

print("=" * 80)
print("COMPREHENSIVE MOBILE DATASET ANALYSIS")
print("=" * 80)
print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

# Load the production-ready dataset
df = pd.read_csv('data/Mobiles_Dataset_Final.csv')
print(f"✓ Loaded dataset: {len(df)} phones with {len(df.columns)} features")
print(f"  Columns: {list(df.columns)}\n")

# ============================================================================
# 1. EUROPEAN MARKET ANALYSIS
# ============================================================================
print("=" * 80)
print("1. EUROPEAN MARKET ANALYSIS")
print("=" * 80)

# Analyze EUR prices
eur_analysis = {
    'price_statistics': {
        'min': float(df['price_eur'].min()),
        'max': float(df['price_eur'].max()),
        'mean': float(df['price_eur'].mean()),
        'median': float(df['price_eur'].median()),
        'std': float(df['price_eur'].std())
    },
    'price_segments': {}
}

# Define price segments for European market
segments = {
    'Budget': (0, 300),
    'Mid-range': (300, 700),
    'Premium': (700, 1200),
    'Flagship': (1200, float('inf'))
}

for segment_name, (min_price, max_price) in segments.items():
    segment_df = df[(df['price_eur'] >= min_price) & (df['price_eur'] < max_price)]
    eur_analysis['price_segments'][segment_name] = {
        'count': len(segment_df),
        'percentage': round(len(segment_df) / len(df) * 100, 2),
        'avg_price_eur': round(segment_df['price_eur'].mean(), 2),
        'avg_ram': round(segment_df['ram'].mean(), 1),
        'avg_battery': round(segment_df['battery'].mean(), 0),
        'top_brands': segment_df['company'].value_counts().head(5).to_dict()
    }

print("\nPrice Segments in European Market:")
for segment, data in eur_analysis['price_segments'].items():
    print(f"\n{segment} (€{segments[segment][0]}-{segments[segment][1]}):")
    print(f"  Count: {data['count']} phones ({data['percentage']}%)")
    print(f"  Avg Price: €{data['avg_price_eur']}")
    print(f"  Avg RAM: {data['avg_ram']}GB")
    print(f"  Avg Battery: {data['avg_battery']}mAh")
    print(f"  Top Brands: {', '.join(list(data['top_brands'].keys())[:3])}")

# Brand market share
brand_analysis = df.groupby('company').agg({
    'price_eur': ['count', 'mean', 'min', 'max'],
    'ram': 'mean',
    'battery': 'mean'
}).round(2)

print("\n" + "=" * 80)
print("Top 10 Brands by Model Count:")
print("=" * 80)
top_brands = df['company'].value_counts().head(10)
for brand, count in top_brands.items():
    avg_price = df[df['company'] == brand]['price_eur'].mean()
    print(f"{brand:20} {count:3} models | Avg: €{avg_price:.2f}")

# Save EUR analysis
with open('data/european_market_analysis.json', 'w') as f:
    json.dump(eur_analysis, f, indent=2)
print("\n✓ European market analysis saved to: data/european_market_analysis.json")

# ============================================================================
# 2. PRICE PREDICTION MODELS
# ============================================================================
print("\n" + "=" * 80)
print("2. PRICE PREDICTION MODELS")
print("=" * 80)

# Prepare features for price prediction
feature_cols = ['ram', 'battery', 'screen', 'weight', 'year', 'front_camera', 'back_camera', 'storage']
target_col = 'price_usd'

# Remove rows with missing values in features or target
df_ml = df[feature_cols + [target_col]].dropna()
print(f"\n✓ ML dataset: {len(df_ml)} phones (after removing missing values)")

X = df_ml[feature_cols]
y = df_ml[target_col]

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"  Training: {len(X_train)} | Testing: {len(X_test)}")

# Train multiple models
models = {
    'Linear Regression': LinearRegression(),
    'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42, max_depth=15),
    'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42, max_depth=5)
}

print("\nTraining and evaluating models...")
results = {}

for name, model in models.items():
    print(f"\n{name}:")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    results[name] = {
        'r2_score': round(float(r2), 4),
        'mae': round(float(mae), 2),
        'rmse': round(float(rmse), 2),
        'accuracy_percent': round(float(r2 * 100), 2)
    }

    print(f"  R² Score: {r2:.4f} ({r2*100:.2f}% accuracy)")
    print(f"  MAE: ${mae:.2f}")
    print(f"  RMSE: ${rmse:.2f}")

# Feature importance (from Random Forest)
print("\n" + "=" * 80)
print("Feature Importance (Random Forest):")
print("=" * 80)
rf_model = models['Random Forest']
feature_importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': rf_model.feature_importances_
}).sort_values('importance', ascending=False)

for _, row in feature_importance.iterrows():
    print(f"{row['feature']:20} {row['importance']:.4f} {'█' * int(row['importance'] * 50)}")

# Save price prediction results
price_results = {
    'timestamp': datetime.now().isoformat(),
    'dataset_size': len(df_ml),
    'features_used': feature_cols,
    'models': results,
    'feature_importance': feature_importance.to_dict('records')
}

with open('data/price_prediction_results.json', 'w') as f:
    json.dump(price_results, f, indent=2)
print("\n✓ Price prediction results saved to: data/price_prediction_results.json")

# ============================================================================
# 3. DATASET EXPLORATION & INSIGHTS
# ============================================================================
print("\n" + "=" * 80)
print("3. DATASET EXPLORATION & INSIGHTS")
print("=" * 80)

insights = {
    'overview': {
        'total_phones': len(df),
        'total_brands': df['company'].nunique(),
        'year_range': f"{int(df['year'].min())}-{int(df['year'].max())}",
        'price_range_usd': f"${df['price_usd'].min():.0f}-${df['price_usd'].max():.0f}",
        'price_range_eur': f"€{df['price_eur'].min():.2f}-€{df['price_eur'].max():.2f}"
    },
    'specifications': {
        'ram': {
            'min': float(df['ram'].min()),
            'max': float(df['ram'].max()),
            'mean': round(float(df['ram'].mean()), 1),
            'median': float(df['ram'].median())
        },
        'battery': {
            'min': float(df['battery'].min()),
            'max': float(df['battery'].max()),
            'mean': round(float(df['battery'].mean()), 0),
            'median': float(df['battery'].median())
        },
        'screen': {
            'min': float(df['screen'].min()),
            'max': float(df['screen'].max()),
            'mean': round(float(df['screen'].mean()), 2),
            'median': float(df['screen'].median())
        },
        'storage': {
            'min': float(df['storage'].min()),
            'max': float(df['storage'].max()),
            'mean': round(float(df['storage'].mean()), 0),
            'median': float(df['storage'].median())
        }
    },
    'camera_analysis': {
        'front_camera': {
            'min': float(df['front_camera'].min()),
            'max': float(df['front_camera'].max()),
            'mean': round(float(df['front_camera'].mean()), 1)
        },
        'back_camera': {
            'min': float(df['back_camera'].min()),
            'max': float(df['back_camera'].max()),
            'mean': round(float(df['back_camera'].mean()), 1)
        }
    },
    'trends': {}
}

# Yearly trends
yearly_stats = df.groupby('year').agg({
    'price_usd': 'mean',
    'ram': 'mean',
    'battery': 'mean',
    'screen': 'mean'
}).round(2)

print("\nYearly Trends:")
print(yearly_stats)

insights['trends']['yearly'] = yearly_stats.to_dict('index')

# Price vs Specs correlations
print("\n" + "=" * 80)
print("Price Correlations:")
print("=" * 80)
correlations = df[['price_usd', 'ram', 'battery', 'screen', 'storage', 'front_camera', 'back_camera']].corr()['price_usd'].sort_values(ascending=False)
print(correlations)

insights['correlations'] = correlations.to_dict()

# Top value phones (best specs for price)
print("\n" + "=" * 80)
print("Best Value Phones (High specs, lower price):")
print("=" * 80)

# Calculate value score (weighted specs / price)
df['value_score'] = (
    df['ram'] * 50 +
    df['battery'] / 100 +
    df['screen'] * 100 +
    df['storage'] * 2
) / df['price_usd']

top_value = df.nlargest(10, 'value_score')[['company', 'model', 'price_usd', 'ram', 'battery', 'value_score']]
print(top_value.to_string())

insights['top_value_phones'] = top_value.to_dict('records')

# Save exploration insights
with open('data/dataset_exploration_insights.json', 'w') as f:
    json.dump(insights, f, indent=2)
print("\n✓ Dataset exploration insights saved to: data/dataset_exploration_insights.json")

# ============================================================================
# 4. VISUALIZATIONS
# ============================================================================
print("\n" + "=" * 80)
print("4. CREATING VISUALIZATIONS")
print("=" * 80)

# Create price distribution visualization
fig, axes = plt.subplots(2, 2, figsize=(15, 10))

# Price distribution (EUR)
axes[0, 0].hist(df['price_eur'], bins=50, color='steelblue', edgecolor='black', alpha=0.7)
axes[0, 0].axvline(df['price_eur'].median(), color='red', linestyle='--', label=f'Median: €{df["price_eur"].median():.2f}')
axes[0, 0].set_xlabel('Price (EUR)')
axes[0, 0].set_ylabel('Frequency')
axes[0, 0].set_title('Price Distribution (European Market)')
axes[0, 0].legend()
axes[0, 0].grid(True, alpha=0.3)

# Price by Brand (top 10)
top_10_brands = df['company'].value_counts().head(10).index
brand_prices = df[df['company'].isin(top_10_brands)].groupby('company')['price_eur'].mean().sort_values()
axes[0, 1].barh(range(len(brand_prices)), brand_prices.values, color='coral')
axes[0, 1].set_yticks(range(len(brand_prices)))
axes[0, 1].set_yticklabels(brand_prices.index)
axes[0, 1].set_xlabel('Average Price (EUR)')
axes[0, 1].set_title('Average Price by Brand (Top 10)')
axes[0, 1].grid(True, alpha=0.3, axis='x')

# RAM vs Price
axes[1, 0].scatter(df['ram'], df['price_eur'], alpha=0.5, c='green', s=20)
axes[1, 0].set_xlabel('RAM (GB)')
axes[1, 0].set_ylabel('Price (EUR)')
axes[1, 0].set_title(f'RAM vs Price (Correlation: {df["ram"].corr(df["price_eur"]):.3f})')
axes[1, 0].grid(True, alpha=0.3)

# Battery vs Price
axes[1, 1].scatter(df['battery'], df['price_eur'], alpha=0.5, c='orange', s=20)
axes[1, 1].set_xlabel('Battery (mAh)')
axes[1, 1].set_ylabel('Price (EUR)')
axes[1, 1].set_title(f'Battery vs Price (Correlation: {df["battery"].corr(df["price_eur"]):.3f})')
axes[1, 1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('data/dataset_exploration_dashboard.png', dpi=300, bbox_inches='tight')
print("✓ Visualization saved to: data/dataset_exploration_dashboard.png")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("ANALYSIS COMPLETE!")
print("=" * 80)
print(f"""
Summary:
--------
✓ Dataset: {len(df)} phones from {df['company'].nunique()} brands
✓ Years: {int(df['year'].min())}-{int(df['year'].max())}
✓ Price Range: ${df['price_usd'].min():.0f}-${df['price_usd'].max():.0f} (€{df['price_eur'].min():.2f}-€{df['price_eur'].max():.2f})

European Market:
- Budget (€0-300): {eur_analysis['price_segments']['Budget']['count']} phones
- Mid-range (€300-700): {eur_analysis['price_segments']['Mid-range']['count']} phones
- Premium (€700-1200): {eur_analysis['price_segments']['Premium']['count']} phones
- Flagship (€1200+): {eur_analysis['price_segments']['Flagship']['count']} phones

Best ML Model: {max(results.items(), key=lambda x: x[1]['r2_score'])[0]}
- Accuracy: {max(results.items(), key=lambda x: x[1]['r2_score'])[1]['accuracy_percent']}%
- MAE: ${max(results.items(), key=lambda x: x[1]['r2_score'])[1]['mae']}

Output Files:
- data/european_market_analysis.json
- data/price_prediction_results.json
- data/dataset_exploration_insights.json
- data/dataset_exploration_dashboard.png
""")

print("=" * 80)
print("🎉 All analysis complete! Dataset is production-ready.")
print("=" * 80)
