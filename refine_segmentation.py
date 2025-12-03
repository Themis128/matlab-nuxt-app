"""
Residual-Based Market Segmentation
Segments devices based on prediction residuals to identify value/premium tiers
"""

import json
import os

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

print("=" * 80)
print("RESIDUAL-BASED MARKET SEGMENTATION")
print("=" * 80)

# Load dataset
df = pd.read_csv('data/Mobiles_Dataset_Feature_Engineered.csv')
print(f"\nDataset: {len(df)} samples")

# Features for prediction
feature_cols = [
    'RAM', 'Battery Capacity', 'Screen Size', 'Mobile Weight', 'Launched Year',
    'spec_density', 'temporal_decay', 'battery_weight_ratio', 
    'screen_weight_ratio', 'ram_weight_ratio', 'ram_battery_interaction_v2',
    'price_percentile_global', 'ram_percentile_global', 'battery_percentile_global'
]

# Filter available features
available_features = [f for f in feature_cols if f in df.columns]
print(f"Features: {len(available_features)}")

# Prepare data
X = df[available_features].apply(pd.to_numeric, errors='coerce').fillna(0)
y = pd.to_numeric(df['Launched Price (USA)'], errors='coerce')

# Remove invalid rows
mask = X.notna().all(axis=1) & y.notna() & (y > 0)
X = X[mask]
y = y[mask]
df_clean = df[mask].copy()

print(f"Valid samples: {len(X)}")

# Split data
X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
    X, y, df_clean.index, test_size=0.2, random_state=42
)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("\n[1/3] Training base price model...")
model = GradientBoostingRegressor(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=4,
    min_samples_split=20,
    min_samples_leaf=10,
    subsample=0.8,
    random_state=42
)
model.fit(X_train_scaled, y_train)

# Calculate residuals
y_train_pred = model.predict(X_train_scaled)
y_test_pred = model.predict(X_test_scaled)

train_residuals = y_train - y_train_pred
test_residuals = y_test - y_test_pred

# Add residuals to dataframe
df_clean.loc[idx_train, 'price_residual'] = train_residuals.values
df_clean.loc[idx_test, 'price_residual'] = test_residuals.values

print(f"\nResidual statistics:")
print(f"  Mean: ${df_clean['price_residual'].mean():.2f}")
print(f"  Std:  ${df_clean['price_residual'].std():.2f}")
print(f"  Min:  ${df_clean['price_residual'].min():.2f}")
print(f"  Max:  ${df_clean['price_residual'].max():.2f}")

print("\n[2/3] Clustering based on residuals...")
# Cluster into value/fair/premium tiers
n_clusters = 3
kmeans = KMeans(n_clusters=n_clusters, random_state=42)
residual_clusters = kmeans.fit_predict(df_clean[['price_residual']])

df_clean['residual_segment'] = residual_clusters

# Map clusters to tiers (negative=value, ~0=fair, positive=premium)
cluster_means = df_clean.groupby('residual_segment')['price_residual'].mean().sort_values()
tier_mapping = {
    cluster_means.index[0]: 'value',
    cluster_means.index[1]: 'fair', 
    cluster_means.index[2]: 'premium'
}

df_clean['value_tier'] = df_clean['residual_segment'].map(tier_mapping)

print(f"\nSegment distribution:")
for tier in ['value', 'fair', 'premium']:
    count = (df_clean['value_tier'] == tier).sum()
    pct = count / len(df_clean) * 100
    avg_residual = df_clean[df_clean['value_tier'] == tier]['price_residual'].mean()
    print(f"  {tier.capitalize():8s}: {count:4d} ({pct:5.1f}%)  Avg residual: ${avg_residual:7.2f}")

print("\n[3/3] Analyzing segment characteristics...")
segments_info = {}
for tier in ['value', 'fair', 'premium']:
    tier_df = df_clean[df_clean['value_tier'] == tier]
    segments_info[tier] = {
        'count': int(len(tier_df)),
        'avg_price': float(tier_df['Launched Price (USA)'].mean()),
        'avg_residual': float(tier_df['price_residual'].mean()),
        'avg_specs': {
            'RAM': float(tier_df['RAM'].mean()),
            'Battery': float(tier_df['Battery Capacity'].mean()),
            'Screen': float(tier_df['Screen Size'].mean())
        }
    }

# Save segmented data
output_path = 'data/Mobiles_Dataset_Segmented.csv'
df_clean.to_csv(output_path, index=False)
print(f"\n✓ Segmented dataset saved: {output_path}")

# Save metrics
metrics = {
    'total_samples': int(len(df_clean)),
    'segments': segments_info,
    'cluster_centers': [float(x) for x in kmeans.cluster_centers_.flatten()],
    'feature_importance': dict(zip(available_features, model.feature_importances_.tolist()))
}

metrics_path = 'data/segmentation_metrics.json'
with open(metrics_path, 'w') as f:
    json.dump(metrics, f, indent=2)
print(f"✓ Metrics saved: {metrics_path}")

print("\n" + "=" * 80)
print("SEGMENTATION COMPLETE")
print("=" * 80)
