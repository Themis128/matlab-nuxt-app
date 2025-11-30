"""
Ensemble Stacking & Blending

Trains diverse base learners and combines predictions via meta-learner stacking.

Base Learners (Level 0):
- Random Forest
- LightGBM
- ElasticNet
- Gradient Boosting (scikit-learn)

Meta-Learner (Level 1):
- Ridge regression with non-negative weights constraint

Outputs:
- python_api/trained_models/ensemble_*.pkl (base models + meta-learner)
- data/ensemble_stacking_metrics.json (performance comparison)
- data/ensemble_oof_predictions.csv (out-of-fold predictions for analysis)
"""
from __future__ import annotations

import importlib
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import ElasticNet, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold


def _get_lgbm_regressor():
    try:
        mod = importlib.import_module("lightgbm")
        return getattr(mod, "LGBMRegressor")
    except Exception:
        return None

LGBMRegressor = _get_lgbm_regressor()
HAS_LIGHTGBM = LGBMRegressor is not None

import warnings

from joblib import dump

warnings.filterwarnings('ignore')

ENGINEERED_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
METRICS_PATH = Path("data/ensemble_stacking_metrics.json")
OOF_PATH = Path("data/ensemble_oof_predictions.csv")
MODELS_DIR = Path("python_api/trained_models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

PRICE_CANDIDATES = ["Price_USD", "Price (USD)", "Price_USA", "Price_US", "Price USD"]

PREDICTION_FEATURES = [
    "RAM", "Battery Capacity", "Screen Size", "Mobile Weight", "Launched Year",
    "spec_density", "temporal_decay", "battery_weight_ratio", "screen_weight_ratio",
    "ram_weight_ratio", "ram_battery_interaction_v2",
    "ram_percentile_global", "battery_percentile_global"
]

N_FOLDS = 5
RANDOM_STATE = 42


def pick_price_column(df: pd.DataFrame) -> str | None:
    for c in PRICE_CANDIDATES:
        if c in df.columns:
            return c
    for c in df.columns:
        if "Price" in c and not any(x in c for x in ["Pakistan", "India", "China", "Dubai"]):
            return c
    return None


def prepare_data(df: pd.DataFrame, price_col: str):
    """Prepare features and target"""
    available = [c for c in PREDICTION_FEATURES if c in df.columns]
    X = df[available].copy()

    for c in available:
        X[c] = pd.to_numeric(X[c], errors='coerce')

    X = X.fillna(X.median())
    y = pd.to_numeric(df[price_col], errors='coerce')

    mask = y.notna() & X.notna().all(axis=1)
    X = X[mask]
    y = y[mask]

    return X, y, available


def get_base_models():
    """Initialize diverse base learners"""
    models = {
        'random_forest': RandomForestRegressor(
            n_estimators=300,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=RANDOM_STATE,
            n_jobs=-1
        ),
        'elasticnet': ElasticNet(
            alpha=10.0,
            l1_ratio=0.5,
            random_state=RANDOM_STATE,
            max_iter=3000
        ),
        'gradient_boosting': GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=5,
            min_samples_split=5,
            random_state=RANDOM_STATE
        )
    }

    if HAS_LIGHTGBM and LGBMRegressor is not None:
        models['lightgbm'] = LGBMRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=8,
            num_leaves=31,
            min_child_samples=20,
            random_state=RANDOM_STATE,
            verbose=-1,
            n_jobs=-1
        )
    else:
        # Fallback to a sklearn gradient boosting model when LightGBM is not available
        models['lightgbm'] = GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=8,
            min_samples_split=5,
            random_state=RANDOM_STATE
        )

    return models


def train_base_models_cv(X, y, models):
    """Train base models with K-fold CV and collect OOF predictions"""
    kf = KFold(n_splits=N_FOLDS, shuffle=True, random_state=RANDOM_STATE)
    oof_predictions = {name: np.zeros(len(y)) for name in models.keys()}
    trained_models = {name: [] for name in models.keys()}

    print(f"\nTraining {len(models)} base models with {N_FOLDS}-fold CV...")

    for fold, (train_idx, val_idx) in enumerate(kf.split(X), 1):
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

        print(f"\nFold {fold}/{N_FOLDS}")

        for name, model_template in models.items():
            # Clone a fresh model instance for this fold to avoid state leakage
            model = clone(model_template)
            model.fit(X_train, y_train)
            oof_predictions[name][val_idx] = model.predict(X_val)
            trained_models[name].append(model)

            val_rmse = np.sqrt(mean_squared_error(y_val, oof_predictions[name][val_idx]))
            print(f"  {name:20s} - Val RMSE: ${val_rmse:.2f}")

    return oof_predictions, trained_models


def evaluate_oof_predictions(y_true, oof_preds):
    """Evaluate each base model's OOF performance"""
    results = {}

    for name, preds in oof_preds.items():
        rmse = np.sqrt(mean_squared_error(y_true, preds))
        mae = mean_absolute_error(y_true, preds)
        r2 = r2_score(y_true, preds)

        results[name] = {
            'rmse': float(rmse),
            'mae': float(mae),
            'r2': float(r2)
        }
        print(f"{name:20s} - RMSE: ${rmse:8.2f}, MAE: ${mae:8.2f}, R²: {r2:.4f}")

    return results


def train_meta_learner(oof_preds, y_true):
    """Train meta-learner (Ridge) on OOF predictions"""
    # Stack OOF predictions as features
    X_meta = np.column_stack([oof_preds[name] for name in sorted(oof_preds.keys())])

    # Ridge with positive=True to enforce non-negative weights
    meta_model = Ridge(alpha=1.0, positive=True, random_state=RANDOM_STATE)
    meta_model.fit(X_meta, y_true)

    # Get blended predictions
    blended_preds = meta_model.predict(X_meta)

    # Metrics
    rmse = np.sqrt(mean_squared_error(y_true, blended_preds))
    mae = mean_absolute_error(y_true, blended_preds)
    r2 = r2_score(y_true, blended_preds)

    # Extract weights (coefficients)
    weights = {name: float(coef) for name, coef in zip(sorted(oof_preds.keys()), meta_model.coef_)}

    return meta_model, blended_preds, {
        'rmse': float(rmse),
        'mae': float(mae),
        'r2': float(r2),
        'weights': weights
    }


def train_final_models(X, y, models):
    """Train final models on full dataset for deployment"""
    final_models = {}

    print("\nTraining final models on full dataset...")
    for name, model_template in models.items():
        # Clone a fresh model instance and train on the full dataset
        model = clone(model_template)
        model.fit(X, y)
        final_models[name] = model
        print(f"  ✓ {name}")

    return final_models


def save_models(final_models, meta_model):
    """Save all models"""
    for name, model in final_models.items():
        path = MODELS_DIR / f"ensemble_base_{name}.pkl"
        dump(model, path)
        print(f"✓ Saved: {path.name}")

    meta_path = MODELS_DIR / "ensemble_meta_learner.pkl"
    dump(meta_model, meta_path)
    print(f"✓ Saved: {meta_path.name}")


def main():
    if not ENGINEERED_PATH.exists():
        raise FileNotFoundError("Run feature_engineering_extended.py first")

    df = pd.read_csv(ENGINEERED_PATH)
    price_col = pick_price_column(df)
    if not price_col:
        raise ValueError("Price column not found")

    print("=" * 80)
    print("ENSEMBLE STACKING & BLENDING")
    print("=" * 80)

    # Prepare data
    X, y, feature_cols = prepare_data(df, price_col)
    print(f"\nDataset: {len(X)} samples, {len(feature_cols)} features")
    print(f"Target: {price_col}")

    # Initialize base models
    models = get_base_models()

    # Train with CV and collect OOF predictions
    oof_preds, trained_models_folds = train_base_models_cv(X, y, models)

    # Evaluate base models
    print("\n" + "=" * 80)
    print("BASE MODEL PERFORMANCE (Out-of-Fold)")
    print("=" * 80)
    base_results = evaluate_oof_predictions(y, oof_preds)

    # Train meta-learner
    print("\n" + "=" * 80)
    print("META-LEARNER TRAINING (Ridge Regression)")
    print("=" * 80)
    meta_model, blended_preds, meta_results = train_meta_learner(oof_preds, y)

    print(f"\nBlended Ensemble - RMSE: ${meta_results['rmse']:8.2f}, MAE: ${meta_results['mae']:8.2f}, R²: {meta_results['r2']:.4f}")
    print("\nMeta-Learner Weights:")
    for name, weight in meta_results['weights'].items():
        print(f"  {name:20s}: {weight:.4f}")

    # Calculate improvement vs best base model
    best_base_rmse = min(r['rmse'] for r in base_results.values())
    improvement = best_base_rmse - meta_results['rmse']
    improvement_pct = (improvement / best_base_rmse) * 100

    print("\nImprovement vs Best Base Model:")
    print(f"  Best Base RMSE: ${best_base_rmse:.2f}")
    print(f"  Ensemble RMSE:  ${meta_results['rmse']:.2f}")
    print(f"  Δ RMSE: ${improvement:.2f} ({improvement_pct:+.2f}%)")

    # Train final models on full dataset
    final_models = train_final_models(X, y, models)

    # Save models
    print("\n" + "=" * 80)
    print("SAVING MODELS")
    print("=" * 80)
    save_models(final_models, meta_model)

    # Save OOF predictions for analysis
    oof_df = pd.DataFrame(oof_preds)
    oof_df['actual'] = y.values
    oof_df['blended'] = blended_preds
    oof_df.to_csv(OOF_PATH, index=False)
    print(f"✓ Saved OOF predictions: {OOF_PATH}")

    # Save metrics
    metrics = {
        'dataset': {
            'n_samples': int(len(X)),
            'n_features': len(feature_cols),
            'feature_columns': feature_cols,
            'target_column': price_col
        },
        'base_models': base_results,
        'meta_learner': meta_results,
        'improvement': {
            'best_base_rmse': float(best_base_rmse),
            'ensemble_rmse': float(meta_results['rmse']),
            'delta_rmse': float(improvement),
            'improvement_percent': float(improvement_pct)
        }
    }

    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding='utf-8')
    print(f"✓ Saved metrics: {METRICS_PATH}")

    print("\n" + "=" * 80)
    print("ENSEMBLE STACKING COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    main()
