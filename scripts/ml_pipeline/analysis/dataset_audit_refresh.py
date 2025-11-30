"""
Dataset Audit Refresh Script
Profiles the (feature-engineered) dataset for completeness, outliers, potential leakage, and segment balance.
Inputs: prefers data/Mobiles_Dataset_Feature_Engineered.csv else falls back to data/Mobiles_Dataset_Cleaned.csv
Output: data/dataset_audit_refresh.json
"""
from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

ENGINEERED_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
CLEANED_PATH = Path("data/Mobiles_Dataset_Cleaned.csv")
AUDIT_PATH = Path("data/dataset_audit_refresh.json")

NUMERIC_HINTS = ["RAM", "Battery", "Battery Capacity", "Screen", "Weight", "Price", "Capacity"]
TARGET_HINT = "Price"


def load_dataset() -> pd.DataFrame:
    if ENGINEERED_PATH.exists():
        print(f"Using engineered dataset: {ENGINEERED_PATH}")
        return pd.read_csv(ENGINEERED_PATH)
    if CLEANED_PATH.exists():
        print(f"Using cleaned dataset: {CLEANED_PATH}")
        return pd.read_csv(CLEANED_PATH)
    raise FileNotFoundError("No dataset found. Run feature_engineering_extended.py or cleaning script first.")


def detect_numeric(df: pd.DataFrame) -> list[str]:
    numeric_cols = []
    for c in df.columns:
        if df[c].dtype != object:
            numeric_cols.append(c)
        else:
            # heuristic using hints
            if any(h in c for h in NUMERIC_HINTS):
                try:
                    converted = pd.to_numeric(df[c].astype(str).str.replace(r"[^0-9.]", "", regex=True), errors='coerce')
                    if converted.notna().mean() > 0.6:
                        numeric_cols.append(c)
                except (ValueError, TypeError, AttributeError):
                    pass
    return sorted(set(numeric_cols))


def completeness_metrics(df: pd.DataFrame) -> dict:
    total = len(df)
    metrics = {}
    for c in df.columns:
        missing = df[c].isna().sum()
        metrics[c] = {
            'missing_count': int(missing),
            'missing_percent': round(missing * 100 / total, 2)
        }
    return metrics


def outlier_summary(df: pd.DataFrame, numeric_cols: list[str]) -> dict:
    summary = {}
    for c in numeric_cols:
        series = pd.to_numeric(df[c], errors='coerce')
        series = series.dropna()
        if series.empty:
            continue
        q1, q3 = series.quantile([0.25, 0.75])
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        outliers = series[(series < lower) | (series > upper)]
        summary[c] = {
            'lower_bound': float(lower),
            'upper_bound': float(upper),
            'outlier_count': int(outliers.size),
            'outlier_percent': round(outliers.size * 100 / series.size, 2)
        }
    return summary


def potential_leakage(df: pd.DataFrame, numeric_cols: list[str]) -> dict:
    price_cols = [c for c in numeric_cols if TARGET_HINT in c]
    if not price_cols:
        return {'note': 'No price target column detected'}
    target = pd.to_numeric(df[price_cols[0]], errors='coerce')
    corr_info = {}
    for c in numeric_cols:
        if c == price_cols[0]:
            continue
        series = pd.to_numeric(df[c], errors='coerce')
        if series.notna().sum() < 10:
            continue
        corr = target.corr(series)
        if pd.notna(corr) and abs(corr) > 0.98:
            corr_info[c] = round(float(corr), 5)
    return {
        'target_column': price_cols[0],
        'high_correlation_features': corr_info,
        'leakage_risk': bool(corr_info)
    }


def segment_balance(df: pd.DataFrame) -> dict:
    segment_col = None
    for c in df.columns:
        if c.lower() == 'market_segment':
            segment_col = c
            break
    if segment_col is None:
        return {'note': 'market_segment column not present'}
    counts = df[segment_col].value_counts(dropna=False)
    total = counts.sum()
    return {
        'segment_column': segment_col,
        'distribution': {str(k): {'count': int(v), 'percent': round(v * 100 / total, 2)} for k, v in counts.items()}
    }


def run_audit():
    df = load_dataset()
    numeric_cols = detect_numeric(df)
    audit = {
        'row_count': int(len(df)),
        'column_count': int(df.shape[1]),
        'numeric_columns_detected': numeric_cols,
        'completeness': completeness_metrics(df),
        'outliers': outlier_summary(df, numeric_cols),
        'potential_leakage': potential_leakage(df, numeric_cols),
        'segment_balance': segment_balance(df),
    }
    AUDIT_PATH.write_text(json.dumps(audit, indent=2), encoding='utf-8')
    print(f"✓ Dataset audit complete. Saved: {AUDIT_PATH}")
    if audit['potential_leakage'].get('leakage_risk'):
        print("⚠ Potential leakage risk detected in features:", audit['potential_leakage']['high_correlation_features'])

if __name__ == '__main__':
    run_audit()
