"""
Drift & Anomaly Monitoring

Implements:
- PSI (Population Stability Index) for feature distribution drift
- KS (Kolmogorov-Smirnov) test for continuous feature drift
- Residual anomaly detection (IQR-based outliers in prediction errors)

Compares baseline dataset (training) vs new dataset (production/validation).
For demo purposes, uses train/test split from engineered dataset.

Outputs:
  data/drift_monitoring_report.json

Thresholds:
  PSI > 0.2: significant drift (retrain recommended)
  KS p-value < 0.05: significant distribution change
  Residual > Q3 + 3*IQR: high anomaly score
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from joblib import load
from scipy.stats import ks_2samp
from sklearn.model_selection import train_test_split

DATA_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
MODEL_PATH = Path("python_api/trained_models/ensemble_base_gradient_boosting.pkl")
REPORT_PATH = Path("data/drift_monitoring_report.json")

PRICE_CANDIDATES = ["Price_USD", "Price (USD)", "Price_USA", "Price_US", "Price USD"]

FEATURE_COLUMNS = [
    "RAM", "Battery Capacity", "Screen Size", "Mobile Weight", "Launched Year",
    "spec_density", "temporal_decay", "battery_weight_ratio", "screen_weight_ratio",
    "ram_weight_ratio", "ram_battery_interaction_v2", "price_percentile_global",
    "ram_percentile_global", "battery_percentile_global"
]

PSI_THRESHOLD = 0.2
KS_P_THRESHOLD = 0.05
RESIDUAL_ANOMALY_MULTIPLIER = 3.0


def pick_price_column(df: pd.DataFrame) -> str | None:
    for c in PRICE_CANDIDATES:
        if c in df.columns:
            return c
    for c in df.columns:
        if "Price" in c and not any(x in c for x in ["Pakistan", "India", "China", "Dubai"]):
            return c
    return None


def prepare(df: pd.DataFrame, price_col: str):
    X = df[[c for c in FEATURE_COLUMNS if c in df.columns]].copy()
    for c in X.columns:
        X[c] = pd.to_numeric(X[c], errors='coerce')
    X = X.fillna(X.median())
    y = pd.to_numeric(df[price_col], errors='coerce')
    mask = y.notna() & X.notna().all(axis=1)
    return X[mask], y[mask]


def compute_psi(baseline: pd.Series, current: pd.Series, bins=10):
    """Population Stability Index"""
    # Bin both distributions
    min_val = min(baseline.min(), current.min())
    max_val = max(baseline.max(), current.max())
    bin_edges = np.linspace(min_val, max_val, bins + 1)

    baseline_counts, _ = np.histogram(baseline, bins=bin_edges)
    current_counts, _ = np.histogram(current, bins=bin_edges)

    # Convert to proportions
    baseline_props = (baseline_counts + 1e-6) / baseline_counts.sum()
    current_props = (current_counts + 1e-6) / current_counts.sum()

    # PSI formula: sum((current - baseline) * ln(current / baseline))
    psi = ((current_props - baseline_props) * np.log(current_props / baseline_props)).sum()
    return float(psi)


def ks_test(baseline: pd.Series, current: pd.Series) -> dict[str, float]:
    """Kolmogorov-Smirnov test for distribution similarity"""
    statistic, pvalue = ks_2samp(baseline, current)  # type: ignore[misc]
    return {'statistic': float(statistic), 'p_value': float(pvalue)}


def feature_drift_analysis(X_baseline: pd.DataFrame, X_current: pd.DataFrame):
    """Compute PSI and KS for each feature"""
    drift_results = {}

    for col in X_baseline.columns:
        psi = compute_psi(X_baseline[col], X_current[col])
        ks_result = ks_test(X_baseline[col], X_current[col])

        drift_detected = psi > PSI_THRESHOLD or ks_result['p_value'] < KS_P_THRESHOLD

        drift_results[col] = {
            'psi': psi,
            'ks_statistic': ks_result['statistic'],
            'ks_p_value': ks_result['p_value'],
            'drift_detected': drift_detected,
            'drift_severity': 'high' if psi > 0.5 else ('medium' if psi > PSI_THRESHOLD else 'low')
        }

    return drift_results


def residual_anomaly_detection(y_true, y_pred):
    """Detect anomalies in prediction residuals using IQR method"""
    residuals = np.abs(y_true - y_pred)
    q1, q3 = np.percentile(residuals, [25, 75])
    iqr = q3 - q1
    upper_bound = q3 + RESIDUAL_ANOMALY_MULTIPLIER * iqr

    anomalies = residuals > upper_bound
    anomaly_indices = np.where(anomalies)[0].tolist()
    anomaly_values = residuals[anomalies].tolist()

    return {
        'q1': float(q1),
        'q3': float(q3),
        'iqr': float(iqr),
        'upper_bound': float(upper_bound),
        'n_anomalies': int(anomalies.sum()),
        'anomaly_rate': float(anomalies.mean()),
        'anomaly_indices': anomaly_indices[:50],  # Limit to first 50
        'max_residual': float(residuals.max()),
        'mean_residual': float(residuals.mean())
    }


def prediction_drift(y_baseline_true, y_baseline_pred, y_current_true, y_current_pred):
    """Compare prediction distribution drift"""
    psi_pred = compute_psi(pd.Series(y_baseline_pred), pd.Series(y_current_pred))
    ks_pred = ks_test(pd.Series(y_baseline_pred), pd.Series(y_current_pred))

    # RMSE comparison
    rmse_baseline = float(np.sqrt(np.mean((y_baseline_true - y_baseline_pred) ** 2)))
    rmse_current = float(np.sqrt(np.mean((y_current_true - y_current_pred) ** 2)))
    rmse_degradation = ((rmse_current - rmse_baseline) / rmse_baseline) * 100

    return {
        'psi': psi_pred,
        'ks_statistic': ks_pred['statistic'],
        'ks_p_value': ks_pred['p_value'],
        'rmse_baseline': rmse_baseline,
        'rmse_current': rmse_current,
        'rmse_degradation_percent': float(rmse_degradation),
        'performance_degraded': rmse_degradation > 10.0  # >10% degradation threshold
    }


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError("Run feature_engineering_extended.py first")
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Run ensemble_stacking.py first")

    df = pd.read_csv(DATA_PATH)
    price_col = pick_price_column(df)
    if not price_col:
        raise ValueError("Price column not found")

    X, y = prepare(df, price_col)
    model = load(MODEL_PATH)

    # Simulate baseline vs current: use train/test split
    X_baseline, X_current, y_baseline, y_current = train_test_split(
        X, y, test_size=0.3, random_state=42
    )

    print("=" * 80)
    print("DRIFT & ANOMALY MONITORING")
    print("=" * 80)
    print(f"\nBaseline set: {len(X_baseline)} samples")
    print(f"Current set:  {len(X_current)} samples")

    # Feature drift
    print("\n[1/3] Analyzing feature drift...")
    feature_drift = feature_drift_analysis(X_baseline, X_current)

    drift_count = sum(1 for v in feature_drift.values() if v['drift_detected'])
    print(f"✓ Features with drift detected: {drift_count}/{len(feature_drift)}")

    for feat, metrics in sorted(feature_drift.items(), key=lambda x: x[1]['psi'], reverse=True)[:5]:
        print(f"  {feat:30s} PSI={metrics['psi']:.4f} KS_p={metrics['ks_p_value']:.4f} [{metrics['drift_severity']}]")

    # Prediction drift
    print("\n[2/3] Analyzing prediction drift...")
    y_baseline_pred = model.predict(X_baseline)
    y_current_pred = model.predict(X_current)

    pred_drift = prediction_drift(y_baseline.values, y_baseline_pred, y_current.values, y_current_pred)
    print(f"✓ Prediction PSI: {pred_drift['psi']:.4f}")
    print(f"  Baseline RMSE: ${pred_drift['rmse_baseline']:.2f}")
    print(f"  Current RMSE:  ${pred_drift['rmse_current']:.2f}")
    print(f"  Degradation:   {pred_drift['rmse_degradation_percent']:+.2f}%")

    # Residual anomalies
    print("\n[3/3] Detecting residual anomalies...")
    anomalies_baseline = residual_anomaly_detection(y_baseline.values, y_baseline_pred)
    anomalies_current = residual_anomaly_detection(y_current.values, y_current_pred)

    print(f"✓ Baseline anomalies: {anomalies_baseline['n_anomalies']} ({anomalies_baseline['anomaly_rate']*100:.2f}%)")
    print(f"  Current anomalies:  {anomalies_current['n_anomalies']} ({anomalies_current['anomaly_rate']*100:.2f}%)")

    # Aggregate report
    report = {
        'baseline_size': int(len(X_baseline)),
        'current_size': int(len(X_current)),
        'thresholds': {
            'psi': PSI_THRESHOLD,
            'ks_p_value': KS_P_THRESHOLD,
            'residual_anomaly_multiplier': RESIDUAL_ANOMALY_MULTIPLIER
        },
        'feature_drift': feature_drift,
        'prediction_drift': pred_drift,
        'residual_anomalies': {
            'baseline': anomalies_baseline,
            'current': anomalies_current
        },
        'alerts': []
    }

    # Generate alerts
    if drift_count > len(feature_drift) * 0.3:
        report['alerts'].append({
            'type': 'FEATURE_DRIFT',
            'severity': 'HIGH',
            'message': f'{drift_count} features show significant drift (>{int(len(feature_drift)*0.3)} threshold)'
        })

    if pred_drift['performance_degraded']:
        report['alerts'].append({
            'type': 'PERFORMANCE_DEGRADATION',
            'severity': 'HIGH',
            'message': f"RMSE degraded by {pred_drift['rmse_degradation_percent']:.1f}% (>10% threshold)"
        })

    if anomalies_current['anomaly_rate'] > anomalies_baseline['anomaly_rate'] * 1.5:
        report['alerts'].append({
            'type': 'ANOMALY_SPIKE',
            'severity': 'MEDIUM',
            'message': f"Anomaly rate increased by {(anomalies_current['anomaly_rate']/anomalies_baseline['anomaly_rate']-1)*100:.1f}%"
        })

    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(f"\n✓ Drift report saved: {REPORT_PATH}")

    if report['alerts']:
        print(f"\n⚠ {len(report['alerts'])} ALERT(S):")
        for alert in report['alerts']:
            print(f"  [{alert['severity']}] {alert['type']}: {alert['message']}")
    else:
        print("\n✓ No critical alerts detected")

    print("\n" + "=" * 80)
    print("DRIFT MONITORING COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    main()
