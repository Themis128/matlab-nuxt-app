"""
CatBoost Ensemble for Categorical Features

CatBoost is designed for datasets with categorical features (brand, company, etc.)
and handles them natively without one-hot encoding, often outperforming trees.

This script:
  1. Removes leakage features (price_percentile_global, etc.)
  2. Adds categorical features (Company, brand tier, market segment)
  3. Trains CatBoost with proper categorical handling
  4. Compares to baseline GBM on clean features

Outputs:
  python_api/trained_models/catboost_price_model.pkl
  data/catboost_comparison_metrics.json
"""
from __future__ import annotations

import json
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from joblib import dump
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings('ignore')

try:
    from catboost import CatBoostRegressor
    HAS_CATBOOST = True
except ImportError:
    HAS_CATBOOST = False

DATA_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
METRICS_PATH = Path("data/catboost_comparison_metrics.json")
MODEL_PATH = Path("python_api/trained_models/catboost_price_model.pkl")

# CLEAN features (remove price leakage)
NUMERIC_FEATURES = [
    "RAM", "Battery Capacity", "Screen Size", "Mobile Weight", "Launched Year",
    "spec_density", "temporal_decay", "battery_weight_ratio", "screen_weight_ratio",
    "ram_weight_ratio", "ram_battery_interaction_v2",
    # REMOVED: price_percentile_global (leakage!)
    "ram_percentile_global", "battery_percentile_global"
]

CATEGORICAL_FEATURES = [
    "Company", "market_segment"
]

PRICE_COL = 'Launched Price (USA)'
RANDOM_STATE = 42


def prepare_data(df: pd.DataFrame):
    """Prepare features with categorical support"""
    # Numeric features
    available_numeric = [c for c in NUMERIC_FEATURES if c in df.columns]
    X_numeric = df[available_numeric].copy()

    for c in available_numeric:
        X_numeric[c] = pd.to_numeric(X_numeric[c], errors='coerce')
    X_numeric = X_numeric.fillna(X_numeric.median())

    # Categorical features
    available_categorical = [c for c in CATEGORICAL_FEATURES if c in df.columns]
    X_categorical = df[available_categorical].copy()

    for c in available_categorical:
        X_categorical[c] = X_categorical[c].fillna('Unknown').astype(str)

    # Combine
    X = pd.concat([X_numeric, X_categorical], axis=1)

    # Target
    y = pd.to_numeric(df[PRICE_COL], errors='coerce')

    # Filter valid rows
    mask = X_numeric.notna().all(axis=1) & y.notna()
    X = X[mask]
    y = y[mask]

    return X, y, available_numeric, available_categorical


def train_catboost(X_train, y_train, categorical_features):
    """Train CatBoost with native categorical handling"""
    if not HAS_CATBOOST:
        raise ImportError("Install catboost: pip install catboost")

    # Get categorical indices
    cat_indices = [X_train.columns.get_loc(c) for c in categorical_features if c in X_train.columns]

    model = CatBoostRegressor(
        iterations=500,
        learning_rate=0.05,
        depth=6,
        loss_function='RMSE',
        cat_features=cat_indices,
        random_seed=RANDOM_STATE,
        verbose=False,
        early_stopping_rounds=50
    )

    model.fit(X_train, y_train, eval_set=(X_train, y_train), verbose=False)

    return model


def train_baseline_gbm(X_train, y_train):
    """Train baseline GBM (no categorical handling)"""
    # One-hot encode categoricals for GBM
    X_train_encoded = pd.get_dummies(X_train, drop_first=True)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_encoded)

    model = GradientBoostingRegressor(
        n_estimators=500,
        learning_rate=0.05,
        max_depth=6,
        random_state=RANDOM_STATE
    )

    model.fit(X_train_scaled, y_train)

    return model, scaler, X_train_encoded.columns.tolist()


def evaluate_model(model, X, y, scaler=None, encoded_columns=None):
    """Evaluate model with proper preprocessing"""
    if scaler is not None:
        # GBM path: one-hot encode + scale
        X_encoded = pd.get_dummies(X, drop_first=True)
        # Align columns with training
        X_encoded = X_encoded.reindex(columns=encoded_columns, fill_value=0)
        X_processed = scaler.transform(X_encoded)
        y_pred = model.predict(X_processed)
    else:
        # CatBoost path: direct prediction
        y_pred = model.predict(X)

    rmse = np.sqrt(mean_squared_error(y, y_pred))
    mae = mean_absolute_error(y, y_pred)
    r2 = r2_score(y, y_pred)

    return {
        'rmse': float(rmse),
        'mae': float(mae),
        'r2': float(r2)
    }


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError("Run feature_engineering_extended.py first")

    df = pd.read_csv(DATA_PATH)
    X, y, numeric_features, categorical_features = prepare_data(df)

    print("=" * 80)
    print("CATBOOST FOR CATEGORICAL FEATURES")
    print("=" * 80)
    print(f"\nDataset: {len(X)} samples")
    print(f"Numeric features ({len(numeric_features)}): {numeric_features}")
    print(f"Categorical features ({len(categorical_features)}): {categorical_features}")
    print(f"Target: {PRICE_COL}")
    print("\n⚠️  Removed price_percentile_global (data leakage)")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE
    )

    print(f"\nTrain size: {len(X_train)}, Test size: {len(X_test)}")

    # Train CatBoost
    if HAS_CATBOOST:
        print("\n[1/2] Training CatBoost with native categorical handling...")
        catboost_model = train_catboost(X_train, y_train, categorical_features)
        catboost_metrics = evaluate_model(catboost_model, X_test, y_test)

        print(f"CatBoost: RMSE=${catboost_metrics['rmse']:,.2f}  MAE=${catboost_metrics['mae']:,.2f}  R²={catboost_metrics['r2']:.4f}")

        # Feature importance
        feature_importance = catboost_model.get_feature_importance()
        feature_names = X_train.columns.tolist()
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': feature_importance
        }).sort_values('importance', ascending=False)

        print("\nTop 5 features:")
        for idx, row in importance_df.head(5).iterrows():
            print(f"  {row['feature']:30s} {row['importance']:8.2f}")
    else:
        print("\n⚠️  CatBoost not installed. Install with: pip install catboost")
        catboost_metrics = None
        importance_df = None

    # Train baseline GBM
    print("\n[2/2] Training baseline GBM (one-hot encoding)...")
    gbm_model, gbm_scaler, gbm_columns = train_baseline_gbm(X_train, y_train)
    gbm_metrics = evaluate_model(gbm_model, X_test, y_test, gbm_scaler, gbm_columns)

    print(f"Baseline GBM: RMSE=${gbm_metrics['rmse']:,.2f}  MAE=${gbm_metrics['mae']:,.2f}  R²={gbm_metrics['r2']:.4f}")

    # Compare
    if catboost_metrics:
        improvement = ((gbm_metrics['rmse'] - catboost_metrics['rmse']) / gbm_metrics['rmse']) * 100

        print("\n" + "=" * 80)
        print("COMPARISON")
        print("=" * 80)
        print(f"Baseline GBM RMSE: ${gbm_metrics['rmse']:8,.2f}")
        print(f"CatBoost RMSE:     ${catboost_metrics['rmse']:8,.2f}")
        print(f"Improvement:       {improvement:+.2f}%")

        if improvement > 5:
            print(f"\n✓ SUCCESS: CatBoost improves by {improvement:.2f}%!")
        elif improvement > 0:
            print(f"\n✓ MODEST GAIN: CatBoost helps by {improvement:.2f}%")
        else:
            print(f"\n✗ NO GAIN: CatBoost underperforms by {abs(improvement):.2f}%")

        # Save CatBoost model
        dump(catboost_model, MODEL_PATH)
        print(f"\n✓ CatBoost model saved: {MODEL_PATH}")

        # Save metrics
        metrics_output = {
            'dataset_size': int(len(X)),
            'train_size': int(len(X_train)),
            'test_size': int(len(X_test)),
            'numeric_features': numeric_features,
            'categorical_features': categorical_features,
            'removed_leakage_features': ['price_percentile_global', 'price_elasticity_proxy'],
            'catboost_metrics': catboost_metrics,
            'baseline_gbm_metrics': gbm_metrics,
            'improvement_percent': float(improvement),
            'feature_importance_top10': importance_df.head(10).to_dict('records') if importance_df is not None else [],
            'catboost_params': {
                'iterations': 500,
                'learning_rate': 0.05,
                'depth': 6,
                'loss_function': 'RMSE'
            }
        }

        METRICS_PATH.write_text(json.dumps(metrics_output, indent=2), encoding='utf-8')
        print(f"✓ Metrics saved: {METRICS_PATH}")

    print("\n" + "=" * 80)
    print("CATBOOST TRAINING COMPLETE")
    print("=" * 80)

    if not HAS_CATBOOST:
        print("\nTo install CatBoost: pip install catboost")


if __name__ == '__main__':
    main()
