"""
Segmentation & Specialist Models

Clusters devices based on engineered features and trains segment-specific price prediction models.
Outputs:
  - data/segment_assignments.csv : Original rows + segment label
  - data/segment_model_metrics.json : Per-segment and global baseline metrics
  - python_api/trained_models/price_segment_<segment>_model.pkl : Trained regressors

Requirements: scikit-learn, pandas, numpy
Assumes engineered dataset created via feature_engineering_extended.py
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from joblib import dump
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler

ENGINEERED_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
ASSIGNMENTS_PATH = Path("data/segment_assignments.csv")
METRICS_PATH = Path("data/segment_model_metrics.json")
MODELS_DIR = Path("python_api/trained_models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

PRICE_CANDIDATES = ["Price_USD", "Price (USD)", "Price_USA", "Price_US", "Price USD"]

FEATURES_FOR_CLUSTERING = [
    "spec_density", "temporal_decay", "price_elasticity_proxy", "battery_weight_ratio",
    "screen_weight_ratio", "ram_weight_ratio", "spec_value_ratio", "ram_battery_interaction_v2"
]

# Fallback additional features if available
EXTRA_FEATURES = ["RAM", "Battery Capacity", "Screen Size", "Mobile Weight"]

DEFAULT_N_CLUSTERS = 3  # can tune later
RANDOM_STATE = 42


def pick_price_column(df: pd.DataFrame) -> str | None:
    for c in PRICE_CANDIDATES:
        if c in df.columns:
            return c
    for c in df.columns:
        if "Price" in c and "Pakistan" not in c and "India" not in c and "China" not in c:
            return c
    return None


def prepare_data(df: pd.DataFrame):
    # Ensure required columns exist
    available = [c for c in FEATURES_FOR_CLUSTERING if c in df.columns]
    if len(available) < 4:
        raise ValueError("Insufficient engineered features for clustering. Run feature_engineering_extended.py first. Available: " + ", ".join(available))

    extra_avail = [c for c in EXTRA_FEATURES if c in df.columns]
    feature_cols = available + extra_avail
    X = df[feature_cols].copy()
    # Convert all to numeric safely
    for c in feature_cols:
        X[c] = pd.to_numeric(X[c], errors='coerce')
    X = X.fillna(X.median())

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled, feature_cols


def cluster_devices(X_scaled, n_clusters=DEFAULT_N_CLUSTERS):
    km = KMeans(n_clusters=n_clusters, random_state=RANDOM_STATE, n_init='auto')
    labels = km.fit_predict(X_scaled)
    return labels, km


def train_global_baseline(df: pd.DataFrame, price_col: str, feature_cols: list[str]):
    X = df[feature_cols].apply(lambda s: pd.to_numeric(s, errors='coerce')).fillna(df[feature_cols].median())
    y = pd.to_numeric(df[price_col], errors='coerce')
    mask = y.notna()
    X = X[mask]
    y = y[mask]
    model = RandomForestRegressor(n_estimators=300, random_state=RANDOM_STATE)
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='neg_root_mean_squared_error')
    model.fit(X, y)
    preds = model.predict(X)
    return {
        'rmse_cv_mean': float(-cv_scores.mean()),
        'rmse_train': float(np.sqrt(mean_squared_error(y, preds))),
        'mae_train': float(mean_absolute_error(y, preds)),
        'r2_train': float(r2_score(y, preds)),
        'n_samples': int(len(y))
    }, model


def train_segment_models(df: pd.DataFrame, price_col: str, feature_cols: list[str], labels):
    results = {}
    segment_models = {}
    df_seg = df.copy()
    df_seg['__segment'] = labels
    for seg in sorted(df_seg['__segment'].unique()):
        subset = df_seg[df_seg['__segment'] == seg]
        X = subset[feature_cols].apply(lambda s: pd.to_numeric(s, errors='coerce')).fillna(subset[feature_cols].median())
        y = pd.to_numeric(subset[price_col], errors='coerce')
        mask = y.notna()
        X = X[mask]
        y = y[mask]
        if len(y) < 20:
            # skip too small segments
            continue
        model = RandomForestRegressor(n_estimators=300, random_state=RANDOM_STATE)
        cv_scores = cross_val_score(model, X, y, cv=3, scoring='neg_root_mean_squared_error')
        model.fit(X, y)
        preds = model.predict(X)
        results[str(seg)] = {
            'rmse_cv_mean': float(-cv_scores.mean()),
            'rmse_train': float(np.sqrt(mean_squared_error(y, preds))),
            'mae_train': float(mean_absolute_error(y, preds)),
            'r2_train': float(r2_score(y, preds)),
            'n_samples': int(len(y))
        }
        segment_models[str(seg)] = model
    return results, segment_models, df_seg


def save_segment_models(segment_models):
    for seg, model in segment_models.items():
        path = MODELS_DIR / f"price_segment_{seg}_model.pkl"
        dump(model, path)
        print(f"[OK] Saved segment model: {path}")


def main():
    if not ENGINEERED_PATH.exists():
        raise FileNotFoundError("Engineered dataset not found. Run feature_engineering_extended.py first.")
    df = pd.read_csv(ENGINEERED_PATH)
    price_col = pick_price_column(df)
    if not price_col:
        raise ValueError("Price column not found; cannot train price models.")

    X_scaled, feature_cols = prepare_data(df)
    labels, km = cluster_devices(X_scaled)
    df_assign = df.copy()
    df_assign['segment'] = labels
    df_assign.to_csv(ASSIGNMENTS_PATH, index=False)

    baseline_metrics, baseline_model = train_global_baseline(df, price_col, feature_cols)
    segment_metrics, segment_models, df_seg = train_segment_models(df, price_col, feature_cols, labels)
    save_segment_models(segment_models)

    # Compare average RMSE across segments vs baseline
    seg_rmse_values = [m['rmse_cv_mean'] for m in segment_metrics.values() if 'rmse_cv_mean' in m]
    avg_segment_rmse = float(np.mean(seg_rmse_values)) if seg_rmse_values else None

    metrics = {
        'price_column': price_col,
        'n_clusters': int(len(set(labels))),
        'feature_columns_used': feature_cols,
        'baseline': baseline_metrics,
        'segments': segment_metrics,
        'avg_segment_rmse_cv_mean': avg_segment_rmse,
        'segment_improvement_vs_baseline': (baseline_metrics['rmse_cv_mean'] - avg_segment_rmse) if avg_segment_rmse else None
    }

    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding='utf-8')
    print(f"[OK] Segment assignments saved: {ASSIGNMENTS_PATH}")
    print(f"[OK] Metrics saved: {METRICS_PATH}")
    if metrics['segment_improvement_vs_baseline'] is not None:
        print(f"Δ RMSE (baseline - avg_segment): {metrics['segment_improvement_vs_baseline']:.4f}")

if __name__ == '__main__':
    main()
