"""
Explainability Pipeline

Generates:
- SHAP global summary (mean |SHAP| per feature)
- SHAP per-row sample explanations
- PDP (Partial Dependence) for top N features
- ICE curves for selected features
- Simple counterfactual suggestions (delta feature values to reach target price)

Outputs:
  data/explainability_shap_summary.json
  data/explainability_shap_samples.json
  data/explainability_pdp.json
  data/explainability_ice_<feature>.csv
  data/counterfactual_examples.json

Depends on engineered dataset and ensemble_base_gradient_boosting.pkl.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
import shap  # pyright: ignore[reportMissingImports]
from joblib import load

DATA_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
MODEL_PATH = Path("python_api/trained_models/ensemble_base_gradient_boosting.pkl")
OUT_SHAP_SUMMARY = Path("data/explainability_shap_summary.json")
OUT_SHAP_SAMPLES = Path("data/explainability_shap_samples.json")
OUT_PDP = Path("data/explainability_pdp.json")
OUT_COUNTERFACTUAL = Path("data/counterfactual_examples.json")

ICE_LIMIT = 50  # number of rows for ICE sampling
TOP_N_FEATURES = 8
PDP_GRID_SIZE = 15
COUNTERFACTUAL_SAMPLES = 25
MAX_STEPS_CF = 50

PRICE_CANDIDATES = ["Price_USD", "Price (USD)", "Price_USA", "Price_US", "Price USD"]

FEATURE_COLUMNS = [
    "RAM", "Battery Capacity", "Screen Size", "Mobile Weight", "Launched Year",
    "spec_density", "temporal_decay", "battery_weight_ratio", "screen_weight_ratio",
    "ram_weight_ratio", "ram_battery_interaction_v2", "price_percentile_global",
    "ram_percentile_global", "battery_percentile_global"
]


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


def compute_shap(model, X: pd.DataFrame):
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)
    base_value = explainer.expected_value
    # shap_values shape: (n_samples, n_features)
    abs_means = np.abs(shap_values).mean(axis=0)
    ranking = sorted([(feat, float(val)) for feat, val in zip(X.columns, abs_means)], key=lambda x: x[1], reverse=True)
    summary = {
        'base_value': float(base_value),
        'feature_importance': ranking,
        'top_features': [f for f, _ in ranking[:TOP_N_FEATURES]]
    }
    return shap_values, summary


def sample_shap_rows(X: pd.DataFrame, y: pd.Series, shap_values: np.ndarray, summary: dict):
    # Take first 30 rows (or all if smaller) for lightweight explanation
    n = min(30, len(X))
    samples = []
    top_feats = summary['top_features']
    for i in range(n):
        row = {
            'index': int(i),
            'actual': float(y.iloc[i]),
            'prediction_estimate': float(summary['base_value'] + shap_values[i].sum()),
            'shap_contributions': {feat: float(shap_values[i, X.columns.get_loc(feat)]) for feat in top_feats}
        }
        samples.append(row)
    return {'samples': samples, 'top_features': top_feats}


def partial_dependence(model, X: pd.DataFrame, features: list[str]):
    pdp_results = {}
    for feat in features[:TOP_N_FEATURES]:
        if feat not in X.columns:
            continue
        values = X[feat]
        grid = np.linspace(values.min(), values.max(), PDP_GRID_SIZE)
        preds = []
        X_clone = X.copy()
        for val in grid:
            X_clone[feat] = val
            preds.append(float(model.predict(X_clone).mean()))
        pdp_results[feat] = {
            'grid': [float(g) for g in grid],
            'average_prediction': preds
        }
    return pdp_results


def ice_curves(model, X: pd.DataFrame, feature: str):
    # Return ICE for a single feature across sampled rows
    if feature not in X.columns:
        return None
    sample = X.sample(min(ICE_LIMIT, len(X)), random_state=42)
    values = sample[feature]
    grid = np.linspace(values.min(), values.max(), PDP_GRID_SIZE)
    curves = []
    for _, row in sample.iterrows():
        row_rep = pd.DataFrame([row] * PDP_GRID_SIZE)
        row_rep[feature] = grid
        preds = model.predict(row_rep)
        curves.append([float(p) for p in preds])
    return {
        'feature': feature,
        'grid': [float(g) for g in grid],
        'curves': curves
    }


def counterfactuals(model, X: pd.DataFrame, y: pd.Series, top_features: list[str]):
    # Simple greedy counterfactual: adjust features toward percentile extremes to reach target = median price
    target_price = float(np.median(y))
    examples = []
    X_sample = X.sample(min(COUNTERFACTUAL_SAMPLES, len(X)), random_state=7)
    for idx, row in X_sample.iterrows():
        original_pred = float(model.predict(pd.DataFrame([row]))[0])
        current = row.copy()
        steps = []
        for _ in range(MAX_STEPS_CF):
            if abs(original_pred - target_price) < 1e-6:
                break
            deltas = {}
            for feat in top_features:
                if feat not in row.index:
                    continue
                # Try shifting feature toward mean +/- std depending on direction needed
                direction = -1 if original_pred > target_price else 1
                shift = direction * (X[feat].std() * 0.1)
                trial = current.copy()
                trial[feat] = trial[feat] + shift
                pred_trial = float(model.predict(pd.DataFrame([trial]))[0])
                improvement = abs(original_pred - target_price) - abs(pred_trial - target_price)
                deltas[feat] = (improvement, shift, pred_trial, trial[feat])
            # Pick best improvement
            best = max(deltas.items(), key=lambda x: x[1][0], default=None)
            if not best or best[1][0] <= 0:
                break
            feat, (impr, shift, new_pred, new_val) = best
            steps.append({'feature': feat, 'shift': shift, 'new_value': float(new_val), 'pred_after': new_pred})
            current[feat] = new_val
            original_pred = new_pred
        examples.append({
            'row_index': int(idx),
            'initial_prediction': float(model.predict(pd.DataFrame([row]))[0]),
            'target_price': target_price,
            'final_prediction': original_pred,
            'steps': steps
        })
    return {'target_price': target_price, 'examples': examples}


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError("Engineered dataset missing. Run feature_engineering_extended.py first.")
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Gradient boosting model missing. Run ensemble_stacking.py first.")

    df = pd.read_csv(DATA_PATH)
    price_col = pick_price_column(df)
    if not price_col:
        raise ValueError("Price column not found.")

    X, y = prepare(df, price_col)
    model = load(MODEL_PATH)

    print("Computing SHAP values...")
    shap_values, summary = compute_shap(model, X)
    OUT_SHAP_SUMMARY.write_text(json.dumps(summary, indent=2), encoding='utf-8')
    print(f"✓ SHAP summary saved: {OUT_SHAP_SUMMARY}")

    samples = sample_shap_rows(X, y, shap_values, summary)
    OUT_SHAP_SAMPLES.write_text(json.dumps(samples, indent=2), encoding='utf-8')
    print(f"✓ SHAP sample explanations saved: {OUT_SHAP_SAMPLES}")

    print("Computing PDP...")
    pdp_results = partial_dependence(model, X, summary['top_features'])
    OUT_PDP.write_text(json.dumps(pdp_results, indent=2), encoding='utf-8')
    print(f"✓ PDP saved: {OUT_PDP}")

    # ICE curves for first top feature
    if summary['top_features']:
        ice_feature = summary['top_features'][0]
        ice = ice_curves(model, X, ice_feature)
        if ice:
            ice_path = Path(f"data/explainability_ice_{ice_feature}.csv")
            # Convert curves to wide format: each curve becomes a row
            ice_df = pd.DataFrame(ice['curves'], columns=[f"val_{i}" for i in range(len(ice['grid']))])
            ice_df.to_csv(ice_path, index=False)
            print(f"✓ ICE curves saved: {ice_path}")

    print("Generating counterfactual examples...")
    cf = counterfactuals(model, X, y, summary['top_features'])
    OUT_COUNTERFACTUAL.write_text(json.dumps(cf, indent=2), encoding='utf-8')
    print(f"✓ Counterfactual examples saved: {OUT_COUNTERFACTUAL}")

    print("\nExplainability pipeline complete.")

if __name__ == '__main__':
    main()
