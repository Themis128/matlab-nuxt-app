"""
Refined Segmentation Script with Rapid Improvement Actions

Implements:
1. Sanitized feature set (exclude price-influenced ratios)
2. Log/rank transforms for heavy-tailed distributions
3. K-value grid search (3-6) with silhouette score and Davies-Bouldin index
4. Minimum segment size enforcement (≥40 samples)
5. Lighter models (ElasticNet + LightGBM) per segment

Outputs:
  - data/refined_segment_assignments.csv
  - data/refined_segment_metrics.json
  - python_api/trained_models/price_refined_segment_<k>_<seg>_model.pkl
"""
from __future__ import annotations

import json
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from joblib import dump
from sklearn.cluster import KMeans
from sklearn.linear_model import ElasticNet
from sklearn.metrics import (
    davies_bouldin_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    silhouette_score,
)
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings('ignore')

import importlib


def _get_lgbm_regressor():
    try:
        mod = importlib.import_module("lightgbm")
        return getattr(mod, "LGBMRegressor")
    except Exception:
        return None

LGBMRegressor = _get_lgbm_regressor()
HAS_LIGHTGBM = LGBMRegressor is not None
if not HAS_LIGHTGBM:
    print("⚠ LightGBM not available; using ElasticNet only")

ENGINEERED_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
ASSIGNMENTS_PATH = Path("data/refined_segment_assignments.csv")
METRICS_PATH = Path("data/refined_segment_metrics.json")
MODELS_DIR = Path("python_api/trained_models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

PRICE_CANDIDATES = ["Price_USD", "Price (USD)", "Price_USA", "Price_US", "Price USD"]

# SANITIZED features for clustering (exclude price-influenced)
CLUSTERING_FEATURES = [
    "spec_density",
    "temporal_decay",
    "battery_weight_ratio",
    "screen_weight_ratio",
    "ram_weight_ratio",
    "ram_battery_interaction_v2",
]

# Features to apply log transform
LOG_TRANSFORM_COLS = ["RAM", "Battery Capacity", "spec_density"]

# Prediction features (can include more)
PREDICTION_FEATURES_BASE = [
    "RAM", "Battery Capacity", "Screen Size", "Mobile Weight",
    "spec_density", "temporal_decay", "battery_weight_ratio",
    "screen_weight_ratio", "ram_weight_ratio", "ram_battery_interaction_v2"
]

K_RANGE = [3, 4, 5, 6]
MIN_SEGMENT_SIZE = 40
RANDOM_STATE = 42


def pick_price_column(df: pd.DataFrame) -> str | None:
    for c in PRICE_CANDIDATES:
        if c in df.columns:
            return c
    for c in df.columns:
        if "Price" in c and not any(x in c for x in ["Pakistan", "India", "China", "Dubai"]):
            return c
    return None


def prepare_clustering_features(df: pd.DataFrame):
    """Prepare sanitized and transformed features for clustering"""
    available = [c for c in CLUSTERING_FEATURES if c in df.columns]
    if len(available) < 4:
        raise ValueError(f"Insufficient clustering features. Available: {available}")

    X = df[available].copy()

    # Convert to numeric
    for c in available:
        X[c] = pd.to_numeric(X[c], errors='coerce')

    # Apply log transform to heavy-tailed features
    for c in LOG_TRANSFORM_COLS:
        if c in X.columns:
            X[c] = np.log1p(X[c].fillna(0))

    # Fill remaining NaN with median
    X = X.fillna(X.median())

    # Standardize
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, available, scaler


def prepare_prediction_features(df: pd.DataFrame):
    """Prepare features for model training"""
    available = [c for c in PREDICTION_FEATURES_BASE if c in df.columns]
    X = df[available].copy()

    for c in available:
        X[c] = pd.to_numeric(X[c], errors='coerce')

    X = X.fillna(X.median())
    return X, available


def find_optimal_k(X_scaled, k_range=K_RANGE):
    """Test k values and return best k based on silhouette score"""
    results = {}

    for k in k_range:
        km = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10)
        labels = km.fit_predict(X_scaled)

        sil = silhouette_score(X_scaled, labels)
        db = davies_bouldin_score(X_scaled, labels)

        results[k] = {
            'silhouette_score': float(sil),
            'davies_bouldin_score': float(db),
            'n_clusters': k,
            'labels': labels,
            'model': km
        }
        print(f"K={k}: Silhouette={sil:.4f}, Davies-Bouldin={db:.4f}")

    # Pick k with highest silhouette score (or lowest DB if tied)
    best_k = max(results.keys(), key=lambda k: results[k]['silhouette_score'])
    print(f"\n✓ Best K={best_k} (Silhouette={results[best_k]['silhouette_score']:.4f})")

    return best_k, results[best_k], results


def enforce_min_segment_size(labels, X_scaled, min_size=MIN_SEGMENT_SIZE):
    """Merge small segments into nearest large segment"""
    unique, counts = np.unique(labels, return_counts=True)
    small_segments = unique[counts < min_size]

    if len(small_segments) == 0:
        return labels

    print(f"\n⚠ Merging {len(small_segments)} small segments (< {min_size} samples)")

    labels_new = labels.copy()
    large_segments = unique[counts >= min_size]

    if len(large_segments) == 0:
        print("⚠ All segments too small; keeping original")
        return labels

    # Compute centroids
    centroids = {}
    for seg in large_segments:
        mask = labels == seg
        centroids[seg] = X_scaled[mask].mean(axis=0)

    # Reassign small segment points to nearest large segment
    for small_seg in small_segments:
        mask = labels == small_seg
        points = X_scaled[mask]

        # get integer indices of points belonging to this small segment
        indices = np.nonzero(mask)[0]
        for i, point in enumerate(points):
            distances = {seg: np.linalg.norm(point - cent) for seg, cent in centroids.items()}
            # choose the segment with minimum distance (use items to satisfy type checkers)
            nearest_seg = min(distances.items(), key=lambda kv: kv[1])[0]
            labels_new[indices[i]] = nearest_seg

    return labels_new


def train_segment_models(df: pd.DataFrame, price_col: str, pred_features: list[str], labels, k_val):
    """Train ElasticNet or LightGBM models per segment"""
    results = {}
    segment_models = {}
    df_seg = df.copy()
    df_seg['__segment'] = labels

    for seg in sorted(df_seg['__segment'].unique()):
        subset = df_seg[df_seg['__segment'] == seg]
        X = subset[pred_features].apply(lambda s: pd.to_numeric(s, errors='coerce'))
        X = X.fillna(X.median())

        y = pd.to_numeric(subset[price_col], errors='coerce')
        mask = y.notna()
        X = X[mask]
        y = y[mask]

        if len(y) < 20:
            print(f"⚠ Segment {seg}: only {len(y)} samples, skipping")
            continue

        # Use LightGBM if available, else ElasticNet (guard against LGBMRegressor being None)
        if HAS_LIGHTGBM and LGBMRegressor is not None:
            try:
                model = LGBMRegressor(
                    n_estimators=200,
                    learning_rate=0.05,
                    max_depth=6,
                    random_state=RANDOM_STATE,
                    verbose=-1
                )
            except Exception:
                # If instantiation fails for any reason, fall back to ElasticNet
                model = ElasticNet(alpha=1.0, l1_ratio=0.5, random_state=RANDOM_STATE, max_iter=2000)
        else:
            model = ElasticNet(alpha=1.0, l1_ratio=0.5, random_state=RANDOM_STATE, max_iter=2000)

        cv_scores = cross_val_score(model, X, y, cv=3, scoring='neg_root_mean_squared_error')
        model.fit(X, y)
        preds = model.predict(X)

        results[str(seg)] = {
            'rmse_cv_mean': float(-cv_scores.mean()),
            'rmse_train': float(np.sqrt(mean_squared_error(y, preds))),
            'mae_train': float(mean_absolute_error(y, preds)),
            'r2_train': float(r2_score(y, preds)),
            'n_samples': int(len(y)),
            'model_type': 'LightGBM' if HAS_LIGHTGBM else 'ElasticNet'
        }
        segment_models[str(seg)] = model
        print(f"Segment {seg}: N={len(y)}, CV RMSE={results[str(seg)]['rmse_cv_mean']:.2f}, R²={results[str(seg)]['r2_train']:.4f}")

    return results, segment_models


def save_segment_models(segment_models, k_val):
    """Save trained models"""
    for seg, model in segment_models.items():
        path = MODELS_DIR / f"price_refined_segment_k{k_val}_s{seg}_model.pkl"
        dump(model, path)
        print(f"✓ Saved: {path.name}")


def train_global_baseline(df: pd.DataFrame, price_col: str, pred_features: list[str]):
    """Train global baseline for comparison"""
    X = df[pred_features].apply(lambda s: pd.to_numeric(s, errors='coerce'))
    X = X.fillna(X.median())
    y = pd.to_numeric(df[price_col], errors='coerce')
    mask = y.notna()
    X = X[mask]
    y = y[mask]

    if HAS_LIGHTGBM and LGBMRegressor is not None:
        try:
            model = LGBMRegressor(n_estimators=300, learning_rate=0.05, max_depth=7, random_state=RANDOM_STATE, verbose=-1)
        except Exception:
            # If LightGBM class exists but instantiation fails for any reason, fall back to ElasticNet
            model = ElasticNet(alpha=0.5, l1_ratio=0.5, random_state=RANDOM_STATE, max_iter=2000)
    else:
        model = ElasticNet(alpha=0.5, l1_ratio=0.5, random_state=RANDOM_STATE, max_iter=2000)

    cv_scores = cross_val_score(model, X, y, cv=5, scoring='neg_root_mean_squared_error')
    model.fit(X, y)
    preds = model.predict(X)

    return {
        'rmse_cv_mean': float(-cv_scores.mean()),
        'rmse_train': float(np.sqrt(mean_squared_error(y, preds))),
        'mae_train': float(mean_absolute_error(y, preds)),
        'r2_train': float(r2_score(y, preds)),
        'n_samples': int(len(y)),
        'model_type': 'LightGBM' if HAS_LIGHTGBM else 'ElasticNet'
    }


def main():
    if not ENGINEERED_PATH.exists():
        raise FileNotFoundError("Run feature_engineering_extended.py first")

    df = pd.read_csv(ENGINEERED_PATH)
    price_col = pick_price_column(df)
    if not price_col:
        raise ValueError("Price column not found")

    print("=" * 80)
    print("REFINED SEGMENTATION WITH RAPID IMPROVEMENTS")
    print("=" * 80)

    # 1. Prepare sanitized clustering features
    print("\n[1/5] Preparing sanitized clustering features...")
    X_scaled, cluster_features, scaler = prepare_clustering_features(df)
    print(f"✓ Using {len(cluster_features)} features: {cluster_features}")

    # 2. Find optimal K
    print("\n[2/5] Testing K values with silhouette & Davies-Bouldin scores...")
    best_k, best_result, all_k_results = find_optimal_k(X_scaled, K_RANGE)

    # 3. Enforce minimum segment size
    print("\n[3/5] Enforcing minimum segment size...")
    labels = enforce_min_segment_size(best_result['labels'], X_scaled, MIN_SEGMENT_SIZE)
    unique, counts = np.unique(labels, return_counts=True)
    print(f"✓ Final segments: {dict(zip(unique, counts))}")

    # 4. Train global baseline
    print("\n[4/5] Training global baseline...")
    X_pred, pred_features = prepare_prediction_features(df)
    baseline_metrics = train_global_baseline(df, price_col, pred_features)
    print(f"Baseline: CV RMSE={baseline_metrics['rmse_cv_mean']:.2f}, R²={baseline_metrics['r2_train']:.4f}")

    # 5. Train segment models
    print("\n[5/5] Training per-segment models...")
    segment_metrics, segment_models = train_segment_models(df, price_col, pred_features, labels, best_k)
    save_segment_models(segment_models, best_k)

    # Save assignments
    df_assign = df.copy()
    df_assign['refined_segment'] = labels
    df_assign.to_csv(ASSIGNMENTS_PATH, index=False)

    # Calculate improvement
    seg_rmse_values = [m['rmse_cv_mean'] for m in segment_metrics.values()]
    avg_segment_rmse = float(np.mean(seg_rmse_values)) if seg_rmse_values else None
    improvement = (baseline_metrics['rmse_cv_mean'] - avg_segment_rmse) if avg_segment_rmse else None
    improvement_pct = (improvement / baseline_metrics['rmse_cv_mean'] * 100) if improvement else None

    # Save metrics
    metrics = {
        'price_column': price_col,
        'best_k': int(best_k),
        'clustering_features': cluster_features,
        'prediction_features': pred_features,
        'k_search_results': {k: {
            'silhouette_score': v['silhouette_score'],
            'davies_bouldin_score': v['davies_bouldin_score']
        } for k, v in all_k_results.items()},
        'baseline': baseline_metrics,
        'segments': segment_metrics,
        'avg_segment_rmse_cv': avg_segment_rmse,
        'improvement_vs_baseline': improvement,
        'improvement_percent': improvement_pct
    }

    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding='utf-8')

    print("\n" + "=" * 80)
    print("RESULTS")
    print("=" * 80)
    print(f"✓ Assignments saved: {ASSIGNMENTS_PATH}")
    print(f"✓ Metrics saved: {METRICS_PATH}")
    print(f"\nBaseline CV RMSE: ${baseline_metrics['rmse_cv_mean']:.2f}")
    print(f"Avg Segment CV RMSE: ${avg_segment_rmse:.2f}" if avg_segment_rmse else "N/A")
    if improvement:
        status = "✓ IMPROVEMENT" if improvement > 0 else "✗ WORSE"
        print(f"{status}: Δ RMSE = ${improvement:.2f} ({improvement_pct:+.2f}%)")

if __name__ == '__main__':
    main()
