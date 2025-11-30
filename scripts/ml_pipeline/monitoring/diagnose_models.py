"""
Diagnostic Script for Model Issues

Checks for:
1. Data quality and leakage
2. Target distribution and scaling
3. Train/test split integrity
4. Feature-target correlation
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

print("=" * 80)
print("MODEL DIAGNOSTICS")
print("=" * 80)

# Load data
df = pd.read_csv("data/Mobiles_Dataset_Feature_Engineered.csv")
print(f"\nDataset: {len(df)} samples")

# Check price column
price_col = "Launched Price (USA)"
if price_col not in df.columns:
    print(f"ERROR: {price_col} not found!")
    print(f"Available columns: {df.columns.tolist()}")
    exit(1)

# Price statistics
prices = pd.to_numeric(df[price_col], errors='coerce')
valid_prices = prices.dropna()

print(f"\n{price_col} Statistics:")
print(f"  Count:   {len(valid_prices)}")
print(f"  Mean:    ${valid_prices.mean():,.2f}")
print(f"  Median:  ${valid_prices.median():,.2f}")
print(f"  Std:     ${valid_prices.std():,.2f}")
print(f"  Min:     ${valid_prices.min():,.2f}")
print(f"  Max:     ${valid_prices.max():,.2f}")
print(f"  Missing: {prices.isna().sum()}")

# Sample prices
print("\nSample prices (first 10):")
print(f"  {valid_prices.head(10).tolist()}")

# Check for price_residual if exists
if 'price_residual' in df.columns:
    residuals = pd.to_numeric(df['price_residual'], errors='coerce')
    print("\nprice_residual Statistics:")
    print(f"  Mean:    ${residuals.mean():,.2f}")
    print(f"  Std:     ${residuals.std():,.2f}")
    print(f"  Min:     ${residuals.min():,.2f}")
    print(f"  Max:     ${residuals.max():,.2f}")

# Prepare features
features = [
    "RAM", "Battery Capacity", "Screen Size", "Mobile Weight", "Launched Year",
    "spec_density", "temporal_decay", "battery_weight_ratio", "screen_weight_ratio",
    "ram_weight_ratio", "ram_battery_interaction_v2", "price_percentile_global",
    "ram_percentile_global", "battery_percentile_global"
]

available_features = [c for c in features if c in df.columns]
print(f"\nAvailable features: {len(available_features)}/{len(features)}")

X = df[available_features].copy()
for c in available_features:
    X[c] = pd.to_numeric(X[c], errors='coerce')

# Remove rows with missing values
mask = X.notna().all(axis=1) & prices.notna()
X_clean = X[mask]
y_clean = prices[mask]

print(f"\nClean samples: {len(X_clean)} (removed {len(df) - len(X_clean)})")

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X_clean, y_clean, test_size=0.2, random_state=42
)

print("\nTrain/Test Split:")
print(f"  Train: {len(X_train)} samples")
print(f"  Test:  {len(X_test)} samples")
print("\nTrain prices:")
print(f"  Mean: ${y_train.mean():,.2f}, Std: ${y_train.std():,.2f}")
print("Test prices:")
print(f"  Mean: ${y_test.mean():,.2f}, Std: ${y_test.std():,.2f}")

# Check for data leakage: price in features
print("\nChecking for data leakage...")
for feat in available_features:
    if 'price' in feat.lower():
        corr = X_train[feat].corr(y_train)
        print(f"  WARNING: '{feat}' correlates {corr:.3f} with price (potential leak)")

# Train simple model
print("\nTraining GradientBoostingRegressor...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = GradientBoostingRegressor(
    n_estimators=100,
    learning_rate=0.05,
    max_depth=4,
    random_state=42
)

model.fit(X_train_scaled, y_train)

# Predictions
y_train_pred = model.predict(X_train_scaled)
y_test_pred = model.predict(X_test_scaled)

train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))

print("\nModel Performance:")
print(f"  Train RMSE: ${train_rmse:,.2f}")
print(f"  Test RMSE:  ${test_rmse:,.2f}")
print(f"  Ratio:      {test_rmse/train_rmse:.2f}x (should be ~1.1-1.5)")

# Check predictions
print("\nTest predictions sample:")
print(f"  Actual:    {y_test.head(5).tolist()}")
print(f"  Predicted: {y_test_pred[:5].tolist()}")

# Flag issues
print("\n" + "=" * 80)
print("DIAGNOSTICS SUMMARY")
print("=" * 80)

issues = []

if test_rmse < 50:
    issues.append(f"⚠ Test RMSE unusually low (${test_rmse:.2f}) - possible data leakage")

if test_rmse / train_rmse < 0.5:
    issues.append("⚠ Test error much lower than train - suggests overfitting or leakage")

if test_rmse / train_rmse > 2.0:
    issues.append("⚠ Test error much higher than train - severe overfitting")

if any('price' in feat.lower() for feat in available_features if feat != 'price_residual'):
    issues.append("⚠ Price-related features detected - may cause leakage")

if len(issues) == 0:
    print("✓ No major issues detected")
else:
    print(f"Found {len(issues)} issues:")
    for issue in issues:
        print(f"  {issue}")

print("=" * 80)
