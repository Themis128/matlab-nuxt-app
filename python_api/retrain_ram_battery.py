#!/usr/bin/env python3
"""Retrain RAM/battery predictors without target leakage.

The original train_models_sklearn.py built X via create_engineered_features
which included the prediction target itself (ram*battery, ram**2,
price/(ram+1), ...). Inference could never reproduce that vector without
knowing the answer, so predict_ram/predict_battery always fell back.

This script retrains both models on the target-free spec defined by
predictions_sklearn.build_spec_features — the exact function used at
inference — and writes the same artifact names/metadata format.

Run inside the API image (has pandas/sklearn/xgboost):
    python retrain_ram_battery.py [csv_path]
"""

import json
import pickle
import sys
from pathlib import Path

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

sys.path.insert(0, str(Path(__file__).parent))

import train_models_sklearn as tms
from predictions_sklearn import MODELS_DIR, build_spec_features

try:
    import xgboost as xgb

    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False


def build_matrix(data, target):
    """Return (X, y, unique_companies) using the inference feature contract."""
    unique_companies = sorted({str(c) for c in data["companies"]})
    n = len(data["ram"])
    specs = [
        {
            "ram": float(data["ram"][i]),
            "battery": float(data["battery"][i]),
            "screen": float(data["screen"][i]),
            "weight": float(data["weight"][i]),
            "year": float(data["year"][i]),
            "price": float(data["price"][i]),
            "front_camera": float(data["front_camera"][i]),
            "back_camera": float(data["back_camera"][i]),
            "storage": float(data["storage"][i]),
            "company": str(data["companies"][i]),
            "processor": str(data["processors"][i]),
        }
        for i in range(n)
    ]
    X = np.array([build_spec_features(s, unique_companies, target) for s in specs])
    y = np.asarray(data[target], dtype=float)
    return X, y, unique_companies


def train_one(data, target, artifact):
    print(f"\n=== Retraining {target} predictor (target-free features) ===")
    X, y, unique_companies = build_matrix(data, target)
    print(f"Features: {X.shape[0]} samples x {X.shape[1]} features")
    print(f"Target range: {y.min():.0f} - {y.max():.0f}")

    X_scaler = StandardScaler()
    y_scaler = StandardScaler()
    Xn = X_scaler.fit_transform(X)
    yn = y_scaler.fit_transform(y.reshape(-1, 1)).flatten()

    X_train, X_temp, y_train, y_temp = train_test_split(Xn, yn, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

    candidates = {
        "GradientBoosting": GradientBoostingRegressor(
            n_estimators=300, learning_rate=0.02, max_depth=7,
            min_samples_split=5, min_samples_leaf=2, subsample=0.8,
            random_state=42,
        ),
        "RandomForest": RandomForestRegressor(
            n_estimators=300, max_depth=15, min_samples_split=5,
            min_samples_leaf=2, max_features="sqrt", random_state=42, n_jobs=-1,
        ),
    }
    if XGBOOST_AVAILABLE:
        candidates["XGBoost"] = xgb.XGBRegressor(
            n_estimators=300, learning_rate=0.02, max_depth=7,
            min_child_weight=3, subsample=0.8, colsample_bytree=0.8,
            random_state=42, n_jobs=-1, verbosity=0,
        )

    best_model, best_name, best_r2 = None, None, -np.inf
    for name, model in candidates.items():
        print(f"  Training {name}...", end=" ", flush=True)
        model.fit(X_train, y_train)
        r2_val = r2_score(y_val, model.predict(X_val))
        print(f"R²: {r2_val:.4f}")
        if r2_val > best_r2:
            best_r2, best_model, best_name = r2_val, model, name

    y_pred = y_scaler.inverse_transform(
        best_model.predict(X_test).reshape(-1, 1)
    ).flatten()
    y_true = y_scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()
    r2 = r2_score(y_true, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    print(f"[Best] {best_name} — test R² = {r2:.4f}, RMSE = {rmse:.2f}")

    with open(MODELS_DIR / f"{artifact}_sklearn.pkl", "wb") as f:
        pickle.dump(best_model, f)
    with open(MODELS_DIR / f"{artifact}_scalers.pkl", "wb") as f:
        pickle.dump({"X_scaler": X_scaler, "y_scaler": y_scaler}, f)
    with open(MODELS_DIR / f"{artifact}_metadata.json", "w") as f:
        json.dump(
            {
                "unique_companies": unique_companies,
                "r2": float(r2),
                "rmse": rmse,
                "model_type": f"sklearn_{best_name.lower()}",
                "feature_contract": "build_spec_features_v1",
            },
            f, indent=2,
        )
    return r2


def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else None
    data = tms.load_and_preprocess_data(csv_path)
    train_one(data, "ram", "ram_predictor")
    train_one(data, "battery", "battery_predictor")
    print("\nDone — artifacts written to", MODELS_DIR)


if __name__ == "__main__":
    main()
