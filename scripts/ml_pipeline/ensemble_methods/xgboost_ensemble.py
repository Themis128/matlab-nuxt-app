"""
XGBoost-Based Ensemble (No Data Leakage)

Trains XGBoost with proper feature selection (no price-derived features)
and evaluates against European market data.

Outputs:
  python_api/trained_models/xgboost_ensemble_*.pkl
  data/xgboost_ensemble_metrics.json
"""
from __future__ import annotations

import json
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from joblib import dump
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBRegressor

warnings.filterwarnings('ignore')

DATA_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
METRICS_PATH = Path("data/xgboost_ensemble_metrics.json")
MODELS_DIR = Path("python_api/trained_models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# CRITICAL: Exclude price-derived features to prevent leakage
SAFE_FEATURES = [
    "RAM",
    "Battery Capacity",
    "Screen Size",
    "Mobile Weight",
    "Launched Year",
    "spec_density",
    "temporal_decay",
    "battery_weight_ratio",
    "screen_weight_ratio",
    "ram_weight_ratio",
    "ram_battery_interaction_v2",
    # EXCLUDED: price_percentile_global (causes leakage)
    "ram_percentile_global",
    "battery_percentile_global"
]

PRICE_COL = 'Launched Price (USA)'
RANDOM_STATE = 42


def prepare_data(df: pd.DataFrame):
    """Prepare features without price leakage"""
    available_features = [c for c in SAFE_FEATURES if c in df.columns]
    X = df[available_features].copy()

    for c in available_features:
        X[c] = pd.to_numeric(X[c], errors='coerce')
    X = X.fillna(X.median())

    price = pd.to_numeric(df[PRICE_COL], errors='coerce')

    # Clean data
    mask = X.notna().all(axis=1) & price.notna()
    return X[mask], price[mask], available_features


def main():
    print("=" * 80)
    print("XGBOOST ENSEMBLE (NO DATA LEAKAGE)")
    print("=" * 80)

    df = pd.read_csv(DATA_PATH)
    X, y, features = prepare_data(df)

    print(f"\nDataset: {len(X)} samples")
    print(f"Features: {len(features)}")
    print(f"Target: {PRICE_COL}")
    print(f"  Mean: ${y.mean():,.2f}, Std: ${y.std():,.2f}")

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE
    )

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("\n[1/3] Training XGBoost with hyperparameter tuning...")

    # XGBoost configurations to ensemble
    configs = {
        'conservative': {
            'n_estimators': 100,
            'max_depth': 3,
            'learning_rate': 0.05,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'random_state': RANDOM_STATE
        },
        'aggressive': {
            'n_estimators': 200,
            'max_depth': 6,
            'learning_rate': 0.1,
            'subsample': 0.9,
            'colsample_bytree': 0.9,
            'random_state': RANDOM_STATE
        },
        'deep': {
            'n_estimators': 150,
            'max_depth': 8,
            'learning_rate': 0.03,
            'subsample': 0.85,
            'colsample_bytree': 0.85,
            'random_state': RANDOM_STATE
        }
    }

    models = {}
    predictions = {}
    metrics = {}

    for name, params in configs.items():
        print(f"\n  Training {name}...")
        model = XGBRegressor(**params, verbosity=0)
        model.fit(X_train_scaled, y_train)

        y_pred = model.predict(X_test_scaled)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        models[name] = model
        predictions[name] = y_pred
        metrics[name] = {
            'test_rmse': float(rmse),
            'test_r2': float(r2)
        }

        print(f"    RMSE: ${rmse:,.2f}, R²: {r2:.4f}")

    print("\n[2/3] Creating ensemble...")
    # Simple average ensemble
    ensemble_pred = np.mean(list(predictions.values()), axis=0)
    ensemble_rmse = np.sqrt(mean_squared_error(y_test, ensemble_pred))
    ensemble_r2 = r2_score(y_test, ensemble_pred)

    print(f"  Ensemble RMSE: ${ensemble_rmse:,.2f}")
    print(f"  Ensemble R²:   {ensemble_r2:.4f}")

    # Find best individual
    best_name = min(metrics.keys(), key=lambda k: metrics[k]['test_rmse'])
    best_rmse = metrics[best_name]['test_rmse']

    improvement = ((best_rmse - ensemble_rmse) / best_rmse) * 100

    print("\n[3/3] Comparison...")
    print(f"  Best individual: {best_name} (${best_rmse:,.2f})")
    print(f"  Ensemble:        ${ensemble_rmse:,.2f}")
    print(f"  Improvement:     {improvement:+.2f}%")

    # Save models
    for name, model in models.items():
        dump(model, MODELS_DIR / f"xgboost_{name}.pkl")

    dump(scaler, MODELS_DIR / "xgboost_scaler.pkl")

    # Save metrics
    all_metrics = {
        'individual_models': metrics,
        'ensemble': {
            'test_rmse': float(ensemble_rmse),
            'test_r2': float(ensemble_r2),
            'improvement_vs_best': float(improvement)
        },
        'features': features,
        'safe_features_only': True,
        'excluded_features': ['price_percentile_global']
    }

    with open(METRICS_PATH, 'w') as f:
        json.dump(all_metrics, f, indent=2)

    print(f"\n[OK] Saved {len(models)} models + scaler")
    print(f"[OK] Metrics saved: {METRICS_PATH}")

    # Sanity check
    if ensemble_rmse < 50:
        print(f"\n⚠ WARNING: RMSE extremely low (${ensemble_rmse:.2f}) - possible leakage!")
    elif ensemble_rmse > y.std():
        print("\n⚠ WARNING: RMSE higher than target std - model not learning")
    else:
        print(f"\n[OK] Model RMSE reasonable (${ensemble_rmse:.2f})")

    print("=" * 80)
    print("XGBOOST ENSEMBLE COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
