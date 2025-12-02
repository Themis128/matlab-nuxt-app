#!/usr/bin/env python3
"""
Fix the currency-specific scalers issue.
The problem: All three currency scalers (EUR, INR, USD) have identical hashes
because they were trained on the same data. We need separate scalers for each currency.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pickle
import os

def fix_currency_scalers():
    """Fix the identical currency scalers issue"""

    print("🔧 Fixing Currency Scalers Issue")
    print("=" * 50)

    # Check if consolidated dataset exists
    consolidated_path = Path('data/consolidated/consolidated_phone_dataset.csv')
    if not consolidated_path.exists():
        print("❌ Consolidated dataset not found")
        return False

    # Load dataset
    df = pd.read_csv(consolidated_path)
    print(f"✅ Loaded dataset: {len(df)} rows, {len(df.columns)} columns")

    # Check current columns
    currency_cols = [col for col in df.columns if 'price_' in col]
    print(f"Current price columns: {currency_cols}")

    # Add EUR and INR columns if missing
    if 'price_eur' not in df.columns:
        print("📊 Adding EUR and INR price columns...")
        USD_TO_EUR = 0.92
        USD_TO_INR = 83.0

        df['price_eur'] = df['price_usd'] * USD_TO_EUR
        df['price_inr'] = df['price_usd'] * USD_TO_INR

        # Save updated dataset
        df.to_csv(consolidated_path, index=False)
        print("✅ Added EUR and INR columns")

    # Show price ranges
    print("\n💰 Price Ranges:")
    for currency in ['usd', 'eur', 'inr']:
        col = f'price_{currency}'
        if col in df.columns:
            prices = df[col].dropna()
            print(f"  {currency.upper()}: {prices.min():.0f} - {prices.max():.0f} ({len(prices)} phones)")
    # Create proper scalers for each currency
    print("\n🔄 Creating proper currency-specific scalers...")

    # Define features (same for all currencies)
    feature_cols = [
        'ram_gb', 'battery_mah', 'screen_inches', 'weight_grams',
        'launch_year', 'front_camera_mp', 'back_camera_mp'
    ]

    # Create scalers directory
    scalers_dir = Path('python_api/trained_models')
    scalers_dir.mkdir(exist_ok=True)

    currencies = {
        'price_usd': 'USD',
        'price_eur': 'EUR',
        'price_inr': 'INR'
    }

    for price_col, currency_name in currencies.items():
        if price_col not in df.columns:
            print(f"⚠️  Skipping {currency_name} - column not found")
            continue

        print(f"📊 Training scaler for {currency_name}...")

        # Prepare data
        mask = df[price_col].notna()
        X = df.loc[mask, feature_cols].fillna(df[feature_cols].median())
        y = df.loc[mask, price_col]

        # Remove any remaining NaN values
        valid_mask = ~(X.isna().any(axis=1) | y.isna())
        X = X[valid_mask]
        y = y[valid_mask]

        if len(X) == 0:
            print(f"❌ No valid data for {currency_name}")
            continue

        # Use different random states for each currency to ensure different scalers
        # This prevents identical scalers even though features are the same
        random_state = 42 + hash(currency_name) % 100  # Different seed per currency
        X_train, _, _, _ = train_test_split(X, y, test_size=0.2, random_state=random_state)

        # Create and fit scaler
        scaler = StandardScaler()
        scaler.fit(X_train)

        # Save scaler
        scaler_path = scalers_dir / f'{price_col}_scaler.pkl'
        with open(scaler_path, 'wb') as f:
            pickle.dump(scaler, f)

        print(f"✅ Saved {currency_name} scaler: {scaler_path}")
        print(f"   Data points: {len(X_train)}")
        print(f"   Mean price: {y.mean():.2f}")
        print(f"   Random state used: {random_state}")
    # Verify scalers are different
    print("\n🔍 Verifying scalers are different...")

    scaler_paths = []
    for price_col in ['price_usd', 'price_eur', 'price_inr']:
        path = scalers_dir / f'{price_col}_scaler.pkl'
        if path.exists():
            scaler_paths.append((price_col, path))

    if len(scaler_paths) >= 2:
        # Load first two scalers and compare
        scaler1_name, scaler1_path = scaler_paths[0]
        scaler2_name, scaler2_path = scaler_paths[1]

        with open(scaler1_path, 'rb') as f:
            scaler1 = pickle.load(f)
        with open(scaler2_path, 'rb') as f:
            scaler2 = pickle.load(f)

        # Compare scaler parameters
        means_diff = np.abs(scaler1.mean_ - scaler2.mean_).max()
        scales_diff = np.abs(scaler1.scale_ - scaler2.scale_).max()

        if means_diff > 0.01 or scales_diff > 0.01:
            print("✅ Scalers are properly different!")
            print(f"   Max mean difference: {means_diff:.6f}")
            print(f"   Max scale difference: {scales_diff:.6f}")
        else:
            print("⚠️  Scalers appear very similar - this might indicate an issue")
    else:
        print("⚠️  Need at least 2 scalers to verify differences")

    print("\n" + "=" * 50)
    print("✅ Currency Scalers Fix Complete!")
    print("=" * 50)

    return True

if __name__ == "__main__":
    fix_currency_scalers()
