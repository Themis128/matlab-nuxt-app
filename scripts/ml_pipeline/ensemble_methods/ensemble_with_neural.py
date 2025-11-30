"""
Ensemble with Neural Diversity

Adds neural network (MLP) and XGBoost to the existing ensemble stack
to achieve true architectural diversity beyond just tree-based models.

Previous ensemble: RF + LGBM + ElasticNet + GBM (mostly trees)
New ensemble: RF + LGBM + GBM + XGBoost + MLP + TabNet-style (6 diverse learners)

Expected: +5-15% improvement over previous +1.43% ensemble gain.

Outputs:
  python_api/trained_models/ensemble_neural_*.pkl
  data/ensemble_neural_metrics.json
"""
from __future__ import annotations

import json
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from joblib import dump
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import cross_val_predict, train_test_split
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings('ignore')

try:
    from lightgbm import LGBMRegressor
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False

try:
    from xgboost import XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

DATA_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
METRICS_PATH = Path("data/ensemble_neural_metrics.json")
MODELS_DIR = Path("python_api/trained_models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_COLUMNS = [
    "RAM", "Battery Capacity", "Screen Size", "Mobile Weight", "Launched Year",
    "spec_density", "temporal_decay", "battery_weight_ratio", "screen_weight_ratio",
    "ram_weight_ratio", "ram_battery_interaction_v2", "price_percentile_global",
    "ram_percentile_global", "battery_percentile_global"
]

PRICE_CANDIDATES = ['Launched Price (USA)', 'Price_USD', 'Price (USD)']
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
        raise ValueError(f"No price column found among {PRICE_CANDIDATES}")

    y = pd.to_numeric(df[price_col], errors='coerce')

    # Filter valid rows
    mask = X.notna().all(axis=1) & y.notna() & (y > 0)
    X = X[mask].reset_index(drop=True)
    y = y[mask].reset_index(drop=True)

    print(f"Price column: {price_col}")
    print(f"Price stats: mean=${y.mean():.2f}, std=${y.std():.2f}, min=${y.min():.2f}, max=${y.max():.2f}")

    return X, y, available_features, price_col


def get_base_learners():
    """Define diverse base learners"""
    learners = {}

    # Tree-based models
    learners['random_forest'] = RandomForestRegressor(
        n_estimators=300,
        max_depth=15,
        min_samples_split=5,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )

    if HAS_LIGHTGBM:
        learners['lightgbm'] = LGBMRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=8,
            num_leaves=31,
            random_state=RANDOM_STATE,
            verbose=-1,
            n_jobs=-1
        )

    learners['gradient_boosting'] = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=6,
        random_state=RANDOM_STATE
    )

    if HAS_XGBOOST:
        learners['xgboost'] = XGBRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            verbosity=0
        )

    # Neural network (architectural diversity)
    learners['mlp'] = MLPRegressor(
        hidden_layer_sizes=(256, 128, 64),
        activation='relu',
        solver='adam',
        alpha=0.001,
        batch_size=64,
        learning_rate='adaptive',
        max_iter=500,
        random_state=RANDOM_STATE,
        early_stopping=True,
        validation_fraction=0.15,
        verbose=False
    )

    # Deep MLP variant (different architecture)
    learners['mlp_deep'] = MLPRegressor(
        hidden_layer_sizes=(128, 64, 32, 16),
        activation='relu',
        solver='adam',
        alpha=0.01,
        batch_size=32,
        learning_rate='adaptive',
        max_iter=500,
        random_state=RANDOM_STATE + 1,
        early_stopping=True,
        validation_fraction=0.15,
        verbose=False
    )

    return learners


def train_base_learners(X_train, y_train, learners):
    """Train base learners and generate OOF predictions via CV"""
    oof_predictions = np.zeros((len(X_train), len(learners)))
    trained_models = {}
    base_metrics = {}

    for i, (name, model) in enumerate(learners.items()):
        print(f"  [{i+1}/{len(learners)}] Training {name}...")

        # 5-fold CV for OOF predictions
        oof_pred = cross_val_predict(
            model, X_train, y_train, cv=5, n_jobs=-1 if name != 'mlp' and name != 'mlp_deep' else 1
        )
        oof_predictions[:, i] = oof_pred

        # Train on full data
        model.fit(X_train, y_train)
        trained_models[name] = model

        # CV score
        cv_rmse = np.sqrt(mean_squared_error(y_train, oof_pred))
        base_metrics[name] = {'cv_rmse': float(cv_rmse)}
        print(f"     CV RMSE: ${cv_rmse:,.2f}")

    return trained_models, oof_predictions, base_metrics


def train_meta_learner(oof_predictions, y_train):
    """Train meta-learner on OOF predictions"""
    meta_model = Ridge(alpha=1.0, positive=True)  # Non-negative weights
    meta_model.fit(oof_predictions, y_train)
    return meta_model


def evaluate_ensemble(trained_models, meta_model, X_test, y_test):
    """Evaluate ensemble on test set"""
    # Generate base predictions
    base_preds = np.zeros((len(X_test), len(trained_models)))
    for i, model in enumerate(trained_models.values()):
        base_preds[:, i] = model.predict(X_test)

    # Meta prediction
    y_pred = meta_model.predict(base_preds)

    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    return rmse, r2, base_preds


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError("Run feature_engineering_extended.py first")

    df = pd.read_csv(DATA_PATH)
    X, y, feature_names, price_col = prepare_data(df)

    print("=" * 80)
    print("ENSEMBLE WITH NEURAL DIVERSITY")
    print("=" * 80)
    print(f"\nDataset: {len(X)} samples")
    print(f"Features: {len(feature_names)}")
    print(f"Target: {price_col}")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE
    )

    # Standardize for neural networks
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Get base learners
    learners = get_base_learners()
    print(f"\nBase learners ({len(learners)}):")
    for name in learners.keys():
        print(f"  - {name}")

    # Train base learners (use scaled data)
    print("\n[1/3] Training base learners with 5-fold CV...")
    trained_models, oof_predictions, base_metrics = train_base_learners(
        X_train_scaled, y_train.values, learners
    )

    # Train meta-learner
    print("\n[2/3] Training meta-learner (Ridge with non-negative weights)...")
    meta_model = train_meta_learner(oof_predictions, y_train.values)

    # Meta-learner weights
    print("\nMeta-learner weights:")
    for i, name in enumerate(trained_models.keys()):
        weight = meta_model.coef_[i]
        print(f"  {name:20s} {weight:8.4f}")

    # Evaluate ensemble
    print("\n[3/3] Evaluating ensemble on test set...")
    ensemble_rmse, ensemble_r2, base_preds_test = evaluate_ensemble(
        trained_models, meta_model, X_test_scaled, y_test.values
    )

    print("\nEnsemble performance:")
    print(f"  RMSE: ${ensemble_rmse:,.2f}")
    print(f"  R²:   {ensemble_r2:.4f}")

    # Compare to best base learner
    best_base_name = min(base_metrics.keys(), key=lambda k: base_metrics[k]['cv_rmse'])
    best_base_rmse = base_metrics[best_base_name]['cv_rmse']

    # Test performance of best base learner
    best_base_test_rmse = np.sqrt(mean_squared_error(
        y_test, trained_models[best_base_name].predict(X_test_scaled)
    ))

    improvement = ((best_base_test_rmse - ensemble_rmse) / best_base_test_rmse) * 100

    print("\n" + "=" * 80)
    print("COMPARISON")
    print("=" * 80)
    print(f"Best base learner: {best_base_name}")
    print(f"  CV RMSE:   ${best_base_rmse:,.2f}")
    print(f"  Test RMSE: ${best_base_test_rmse:,.2f}")
    print("\nEnsemble:")
    print(f"  Test RMSE: ${ensemble_rmse:,.2f}")
    print(f"  Improvement: {improvement:+.2f}%")

    if improvement > 5:
        print(f"\n✓ SUCCESS: Neural ensemble delivers {improvement:.2f}% improvement!")
    elif improvement > 0:
        print(f"\n✓ MODEST GAIN: Neural ensemble improves by {improvement:.2f}%")
    else:
        print(f"\n✗ NO IMPROVEMENT: Ensemble underperforms best base by {abs(improvement):.2f}%")

    # Save models
    for name, model in trained_models.items():
        model_path = MODELS_DIR / f"ensemble_neural_{name}.pkl"
        dump(model, model_path)

    dump(meta_model, MODELS_DIR / "ensemble_neural_meta_learner.pkl")
    dump(scaler, MODELS_DIR / "ensemble_neural_scaler.pkl")

    print(f"\n✓ Saved {len(trained_models)} base models + meta-learner + scaler")

    # Save metrics
    metrics_output = {
        'dataset_size': int(len(X)),
        'train_size': int(len(X_train)),
        'test_size': int(len(X_test)),
        'feature_count': len(feature_names),
        'base_learners': list(trained_models.keys()),
        'base_learner_count': len(trained_models),
        'base_metrics': base_metrics,
        'best_base_learner': best_base_name,
        'best_base_cv_rmse': float(best_base_rmse),
        'best_base_test_rmse': float(best_base_test_rmse),
        'ensemble_rmse': float(ensemble_rmse),
        'ensemble_r2': float(ensemble_r2),
        'improvement_percent': float(improvement),
        'meta_learner_weights': {
            name: float(meta_model.coef_[i])
            for i, name in enumerate(trained_models.keys())
        },
        'meta_learner_intercept': float(meta_model.intercept_),
        'has_xgboost': HAS_XGBOOST,
        'has_lightgbm': HAS_LIGHTGBM,
        'note': 'Diverse ensemble with trees (RF, GBM, LGBM, XGB) + neural (MLP variants)'
    }

    METRICS_PATH.write_text(json.dumps(metrics_output, indent=2), encoding='utf-8')
    print(f"✓ Metrics saved: {METRICS_PATH}")

    print("\n" + "=" * 80)
    print("NEURAL ENSEMBLE COMPLETE")
    print("=" * 80)


if __name__ == '__main__':
    main()
