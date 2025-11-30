"""
Residual-Based Segmentation

Instead of clustering on raw specs (failed approach), this script:
  1. Trains baseline model to get prediction errors (residuals)
  2. Clusters on residuals + brand tier + market features
  3. Trains specialist models per cluster

Hypothesis: Devices with similar prediction errors share pricing patterns
(brand premium, regional arbitrage) that spec-based clustering missed.

Outputs:
  python_api/trained_models/price_residual_segment_*.pkl
  data/residual_segmentation_results.json
"""
from __future__ import annotations

import json
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from joblib import dump
from sklearn.cluster import KMeans
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import davies_bouldin_score, mean_squared_error, silhouette_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings('ignore')

try:
    from lightgbm import LGBMRegressor
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False

DATA_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
RESULTS_PATH = Path("data/residual_segmentation_results.json")
MODELS_DIR = Path("python_api/trained_models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_COLUMNS = [
    "RAM", "Battery Capacity", "Screen Size", "Mobile Weight", "Launched Year",
    "spec_density", "temporal_decay", "battery_weight_ratio", "screen_weight_ratio",
    "ram_weight_ratio", "ram_battery_interaction_v2", "price_percentile_global",
    "ram_percentile_global", "battery_percentile_global"
]

PRICE_CANDIDATES = ['Launched Price (USA)', 'Price_USD', 'Price (USD)']
COMPANY_COL = 'Company'
RANDOM_STATE = 42


def pick_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for c in candidates:
        if c in df.columns:
            return c
    return None


def prepare_data(df: pd.DataFrame):
    """Prepare features and price target"""
    available_features = [c for c in FEATURE_COLUMNS if c in df.columns]
    X = df[available_features].copy()

    for c in available_features:
        X[c] = pd.to_numeric(X[c], errors='coerce')
    X = X.fillna(X.median())

    price_col = pick_column(df, PRICE_CANDIDATES)
    if not price_col:
        raise ValueError("No price column found")

    y = pd.to_numeric(df[price_col], errors='coerce')

    # Filter valid rows
    mask = X.notna().all(axis=1) & y.notna()
    X = X[mask]
    y = y[mask]
    df_clean = df[mask].reset_index(drop=True)

    return X, y, available_features, price_col, df_clean


def compute_brand_tier(df: pd.DataFrame, price_col: str) -> pd.Series:
    """Compute brand tier based on avg company price"""
    if COMPANY_COL not in df.columns:
        return pd.Series(['mid'] * len(df), index=df.index)

    company_avg_price = df.groupby(COMPANY_COL)[price_col].median()

    # Tier thresholds
    premium_threshold = company_avg_price.quantile(0.75)
    budget_threshold = company_avg_price.quantile(0.25)

    brand_tier = df[COMPANY_COL].map(
        lambda c: 'premium' if company_avg_price.get(c, 0) >= premium_threshold
        else 'budget' if company_avg_price.get(c, 0) <= budget_threshold
        else 'mid'
    )

    return brand_tier


def create_clustering_features(
    df: pd.DataFrame,
    residuals: np.ndarray | pd.Series,
    brand_tier: pd.Series
) -> tuple[pd.DataFrame, StandardScaler]:
    """Create features for clustering: residuals + brand + market indicators"""
    cluster_df = pd.DataFrame({
        'residual': residuals,
        'abs_residual': np.abs(residuals),
        'residual_percentile': pd.Series(residuals).rank(pct=True),
        'brand_tier_premium': (brand_tier == 'premium').astype(int),
        'brand_tier_budget': (brand_tier == 'budget').astype(int),
        'market_segment_premium': (df['market_segment'] == 'premium').astype(int) if 'market_segment' in df.columns else 0,
        'price_percentile': df['price_percentile_global'] if 'price_percentile_global' in df.columns else 0,
        'spec_density': df['spec_density'] if 'spec_density' in df.columns else 0
    })

    # Standardize
    scaler = StandardScaler()
    cluster_features_scaled = scaler.fit_transform(cluster_df)

    return pd.DataFrame(cluster_features_scaled, columns=cluster_df.columns), scaler


def find_optimal_k(cluster_features: pd.DataFrame, k_range: tuple[int, int] = (2, 7)) -> tuple[int, dict[int, dict[str, float]]]:
    """Find optimal k using silhouette score"""
    scores: dict[int, dict[str, float]] = {}
    for k in range(k_range[0], k_range[1]):
        kmeans = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10)
        labels = kmeans.fit_predict(cluster_features)

        if len(np.unique(labels)) < k:  # Degenerate clustering
            continue

        sil = silhouette_score(cluster_features, labels)
        db = davies_bouldin_score(cluster_features, labels)
        scores[k] = {'silhouette': float(sil), 'davies_bouldin': float(db)}

    # Pick k with best silhouette score
    best_k = max(scores.keys(), key=lambda k: scores[k]['silhouette'])
    return best_k, scores
def train_segment_models(X_train, y_train, segments_train, X_test, y_test, segments_test):
    """Train specialist model per segment"""
    unique_segments = np.unique(segments_train)
    segment_models = {}
    segment_metrics = {}

    for seg in unique_segments:
        mask_train = segments_train == seg
        mask_test = segments_test == seg

        if mask_train.sum() < 20 or mask_test.sum() < 5:
            continue

        X_seg_train = X_train[mask_train]
        y_seg_train = y_train[mask_train]
        X_seg_test = X_test[mask_test]
        y_seg_test = y_test[mask_test]

        # Use LightGBM if available, else GradientBoosting
        if HAS_LIGHTGBM:
            model = LGBMRegressor(
                n_estimators=200,
                learning_rate=0.05,
                max_depth=6,
                num_leaves=31,
                random_state=RANDOM_STATE,
                verbose=-1
            )
        else:
            model = GradientBoostingRegressor(
                n_estimators=200,
                learning_rate=0.05,
                max_depth=6,
                random_state=RANDOM_STATE
            )

        model.fit(X_seg_train, y_seg_train)

        # Evaluate
        y_pred = model.predict(X_seg_test)
        rmse = np.sqrt(mean_squared_error(y_seg_test, y_pred))

        segment_models[seg] = model
        segment_metrics[seg] = {
            'train_size': int(mask_train.sum()),
            'test_size': int(mask_test.sum()),
            'rmse': float(rmse)
        }

    return segment_models, segment_metrics


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError("Run feature_engineering_extended.py first")

    df = pd.read_csv(DATA_PATH)
    X, y, feature_names, price_col, df_clean = prepare_data(df)

    print("=" * 80)
    print("RESIDUAL-BASED SEGMENTATION")
    print("=" * 80)
    print(f"\nDataset: {len(X)} samples")
    print(f"Features: {len(feature_names)}")
    print(f"Target: {price_col}")

    # Split data
    X_train, X_test, y_train, y_test, df_train, df_test = train_test_split(
        X, y, df_clean, test_size=0.2, random_state=RANDOM_STATE
    )

    # Train baseline model
    print("\n[1/5] Training baseline model to compute residuals...")
    baseline = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=6,
        random_state=RANDOM_STATE
    )
    baseline.fit(X_train, y_train)

    y_pred_train = baseline.predict(X_train)
    y_pred_test = baseline.predict(X_test)

    residuals_train = y_train.values - y_pred_train
    residuals_test = y_test.values - y_pred_test

    baseline_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    print(f"Baseline RMSE: ${baseline_rmse:,.2f}")

    # Compute brand tier
    print("\n[2/5] Computing brand tiers...")
    brand_tier_train = compute_brand_tier(df_train.reset_index(drop=True), price_col)
    brand_tier_test = compute_brand_tier(df_test.reset_index(drop=True), price_col)

    tier_dist = brand_tier_train.value_counts()
    print(f"Brand tier distribution: {dict(tier_dist)}")

    # Create clustering features
    print("\n[3/5] Creating clustering features (residuals + brand + market)...")
    cluster_features_train: pd.DataFrame
    cluster_features_train, cluster_scaler = create_clustering_features(
        df_train.reset_index(drop=True), residuals_train, brand_tier_train
    )
    cluster_features_test: pd.DataFrame
    cluster_features_test, _ = create_clustering_features(
        df_test.reset_index(drop=True), residuals_test, brand_tier_test
    )

    # Find optimal k
    print("\n[4/5] Finding optimal k via silhouette score...")
    best_k, k_scores = find_optimal_k(cluster_features_train, k_range=(2, 7))

    print("K-value scores:")
    for k, scores in k_scores.items():
        print(f"  k={k}: silhouette={scores['silhouette']:.4f}, DB={scores['davies_bouldin']:.4f}")
    print(f"\nOptimal k: {best_k}")

    # Cluster
    kmeans = KMeans(n_clusters=best_k, random_state=RANDOM_STATE, n_init=20)
    segments_train = kmeans.fit_predict(cluster_features_train)
    segments_test = kmeans.predict(cluster_features_test)

    segment_sizes = pd.Series(segments_train).value_counts().sort_index()
    print(f"Segment sizes (train): {dict(segment_sizes)}")

    # Train segment models
    print("\n[5/5] Training specialist models per segment...")
    segment_models, segment_metrics = train_segment_models(
        X_train.values, y_train.values, segments_train,
        X_test.values, y_test.values, segments_test
    )

    print("\nSegment performance:")
    for seg, metrics in segment_metrics.items():
        print(f"  Segment {seg}: RMSE=${metrics['rmse']:8.2f}  (train={metrics['train_size']}, test={metrics['test_size']})")

    # Ensemble prediction (use segment models)
    y_pred_ensemble = np.zeros(len(y_test))
    for seg in segment_models.keys():
        mask = segments_test == seg
        if mask.sum() > 0:
            y_pred_ensemble[mask] = segment_models[seg].predict(X_test.values[mask])

    # Fill any missing with baseline
    no_segment_mask = ~np.isin(segments_test, list(segment_models.keys()))
    if no_segment_mask.sum() > 0:
        y_pred_ensemble[no_segment_mask] = baseline.predict(X_test.values[no_segment_mask])

    ensemble_rmse = np.sqrt(mean_squared_error(y_test, y_pred_ensemble))
    avg_segment_rmse = np.mean([m['rmse'] for m in segment_metrics.values()])

    improvement_vs_baseline = ((baseline_rmse - ensemble_rmse) / baseline_rmse) * 100

    print("\n" + "=" * 80)
    print("RESULTS COMPARISON")
    print("=" * 80)
    print(f"Baseline RMSE:           ${baseline_rmse:8.2f}")
    print(f"Avg Segment RMSE:        ${avg_segment_rmse:8.2f}")
    print(f"Ensemble RMSE:           ${ensemble_rmse:8.2f}")
    print(f"Improvement vs Baseline: {improvement_vs_baseline:+.2f}%")

    if improvement_vs_baseline > 0:
        print("\n✓ SUCCESS: Residual-based segmentation improves over baseline!")
    else:
        print(f"\n✗ CAUTION: Segmentation underperforms baseline by {abs(improvement_vs_baseline):.2f}%")

    # Save models
    for seg, model in segment_models.items():
        model_path = MODELS_DIR / f"price_residual_segment_{seg}_model.pkl"
        dump(model, model_path)
        print(f"✓ Saved: {model_path}")

    # Save baseline
    baseline_path = MODELS_DIR / "price_residual_baseline.pkl"
    dump(baseline, baseline_path)

    # Save kmeans + scaler
    dump({
        'kmeans': kmeans,
        'cluster_scaler': cluster_scaler,
        'feature_names': feature_names
    }, MODELS_DIR / "residual_segmentation_clusterer.pkl")

    # Save results
    results = {
        'optimal_k': int(best_k),
        'k_scores': {str(k): v for k, v in k_scores.items()},
        'segment_sizes_train': {str(k): int(v) for k, v in segment_sizes.items()},  # type: ignore[misc]
        'baseline_rmse': float(baseline_rmse),
        'ensemble_rmse': float(ensemble_rmse),
        'avg_segment_rmse': float(avg_segment_rmse),
        'improvement_percent': float(improvement_vs_baseline),
        'segment_metrics': {str(k): v for k, v in segment_metrics.items()},
        'clustering_features': list(cluster_features_train.columns),  # type: ignore[union-attr]
        'approach': 'residual_based_clustering',
        'note': 'Clusters on prediction errors + brand tier + market features'
    }

    RESULTS_PATH.write_text(json.dumps(results, indent=2), encoding='utf-8')
    print(f"\n✓ Results saved: {RESULTS_PATH}")

    print("\n" + "=" * 80)
    print("RESIDUAL-BASED SEGMENTATION COMPLETE")
    print("=" * 80)


if __name__ == '__main__':
    main()
