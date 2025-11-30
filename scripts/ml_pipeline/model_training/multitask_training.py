"""
Multi-Task Architecture

Trains a shared neural network trunk to predict price, RAM, and battery jointly.
Compares multi-task vs separate single-task models.

Architecture:
  Input → Shared Dense Layers → Task-specific heads (price, RAM, battery)

Uses scikit-learn MLPRegressor with MultiOutputRegressor for simplicity.
For production, consider PyTorch/TensorFlow with custom loss weighting.

Outputs:
  python_api/trained_models/multitask_model.pkl
  data/multitask_comparison_metrics.json
"""
from __future__ import annotations

import json
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from joblib import dump
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings('ignore')

DATA_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
MODEL_PATH = Path("python_api/trained_models/multitask_model.pkl")
METRICS_PATH = Path("data/multitask_comparison_metrics.json")

FEATURE_COLUMNS = [
    "Screen Size", "Mobile Weight", "Launched Year", "spec_density",
    "temporal_decay", "battery_weight_ratio", "screen_weight_ratio",
    "ram_weight_ratio", "ram_battery_interaction_v2"
]

TARGET_COLUMNS = {
    'price': ['Launched Price (USA)', 'Price_USD', 'Price (USD)', 'Price_USA', 'Price_US', 'Price USD'],
    'ram': ['RAM'],
    'battery': ['Battery Capacity', 'Battery']
}

RANDOM_STATE = 42


def pick_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for c in candidates:
        if c in df.columns:
            return c
    return None


def prepare_data(df: pd.DataFrame):
    """Prepare features and multiple targets"""
    available_features = [c for c in FEATURE_COLUMNS if c in df.columns]
    X = df[available_features].copy()

    for c in available_features:
        X[c] = pd.to_numeric(X[c], errors='coerce')
    X = X.fillna(X.median())

    # Pick targets
    price_col = pick_column(df, TARGET_COLUMNS['price'])
    ram_col = pick_column(df, TARGET_COLUMNS['ram'])
    battery_col = pick_column(df, TARGET_COLUMNS['battery'])

    if not all([price_col, ram_col, battery_col]):
        raise ValueError(f"Missing targets: price={price_col}, ram={ram_col}, battery={battery_col}")

    y_price = pd.to_numeric(df[price_col], errors='coerce')
    y_ram = pd.to_numeric(df[ram_col], errors='coerce')
    y_battery = pd.to_numeric(df[battery_col], errors='coerce')

    # Stack targets
    y = pd.DataFrame({
        'price': y_price,
        'ram': y_ram,
        'battery': y_battery
    })

    # Filter valid rows
    mask = X.notna().all(axis=1) & y.notna().all(axis=1)
    X = X[mask]
    y = y[mask]

    return X, y, available_features, [price_col, ram_col, battery_col]


def train_multitask_model(X_train, y_train):
    """Train multi-task MLP"""
    # Shared trunk with task-specific heads via MultiOutputRegressor
    base_model = MLPRegressor(
        hidden_layer_sizes=(128, 64, 32),
        activation='relu',
        solver='adam',
        alpha=0.001,
        batch_size=32,
        learning_rate='adaptive',
        max_iter=500,
        random_state=RANDOM_STATE,
        early_stopping=True,
        validation_fraction=0.15,
        verbose=False
    )

    model = MultiOutputRegressor(base_model)
    model.fit(X_train, y_train)
    return model


def train_single_task_models(X_train, y_train):
    """Train separate models for each target"""
    models = {}
    for target in y_train.columns:
        model = MLPRegressor(
            hidden_layer_sizes=(128, 64, 32),
            activation='relu',
            solver='adam',
            alpha=0.001,
            batch_size=32,
            learning_rate='adaptive',
            max_iter=500,
            random_state=RANDOM_STATE,
            early_stopping=True,
            validation_fraction=0.15,
            verbose=False
        )
        model.fit(X_train, y_train[target])
        models[target] = model
    return models


def evaluate_model(y_true, y_pred, task_names):
    """Compute metrics for all tasks"""
    results = {}
    for i, task in enumerate(task_names):
        true = y_true.iloc[:, i] if isinstance(y_true, pd.DataFrame) else y_true[:, i]
        pred = y_pred[:, i]

        rmse = np.sqrt(mean_squared_error(true, pred))
        mae = mean_absolute_error(true, pred)
        r2 = r2_score(true, pred)

        results[task] = {
            'rmse': float(rmse),
            'mae': float(mae),
            'r2': float(r2)
        }
    return results


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError("Run feature_engineering_extended.py first")

    df = pd.read_csv(DATA_PATH)
    X, y, feature_names, target_names = prepare_data(df)

    print("=" * 80)
    print("MULTI-TASK ARCHITECTURE")
    print("=" * 80)
    print(f"\nDataset: {len(X)} samples")
    print(f"Features: {len(feature_names)}")
    print(f"Targets: {target_names}")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE
    )

    # Standardize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train multi-task model
    print("\n[1/2] Training multi-task model...")
    multitask_model = train_multitask_model(X_train_scaled, y_train.values)
    y_pred_multitask = multitask_model.predict(X_test_scaled)
    multitask_metrics = evaluate_model(y_test, y_pred_multitask, y.columns)

    print("Multi-task performance:")
    for task, metrics in multitask_metrics.items():
        print(f"  {task:12s} RMSE={metrics['rmse']:8.2f}  MAE={metrics['mae']:8.2f}  R²={metrics['r2']:.4f}")

    # Train single-task models
    print("\n[2/2] Training separate single-task models...")
    single_task_models = train_single_task_models(X_train_scaled, y_train)

    single_task_metrics = {}
    for task, model in single_task_models.items():
        y_pred_single = model.predict(X_test_scaled)
        metrics = {
            'rmse': float(np.sqrt(mean_squared_error(y_test[task], y_pred_single))),
            'mae': float(mean_absolute_error(y_test[task], y_pred_single)),
            'r2': float(r2_score(y_test[task], y_pred_single))
        }
        single_task_metrics[task] = metrics

    print("Single-task performance:")
    for task, metrics in single_task_metrics.items():
        print(f"  {task:12s} RMSE={metrics['rmse']:8.2f}  MAE={metrics['mae']:8.2f}  R²={metrics['r2']:.4f}")

    # Compare
    print("\n" + "=" * 80)
    print("COMPARISON (Multi-task vs Single-task)")
    print("=" * 80)

    comparison = {}
    for task in y.columns:
        mt_rmse = multitask_metrics[task]['rmse']
        st_rmse = single_task_metrics[task]['rmse']
        improvement = ((st_rmse - mt_rmse) / st_rmse) * 100

        comparison[task] = {
            'multitask_rmse': mt_rmse,
            'singletask_rmse': st_rmse,
            'improvement_percent': float(improvement),
            'winner': 'multitask' if mt_rmse < st_rmse else 'singletask'
        }

        status = "✓" if improvement > 0 else "✗"
        print(f"{task:12s} {status} Multi-task RMSE: {mt_rmse:8.2f} vs Single-task: {st_rmse:8.2f} ({improvement:+.2f}%)")

    # Save model
    dump({
        'model': multitask_model,
        'scaler': scaler,
        'feature_names': feature_names,
        'target_names': list(y.columns)
    }, MODEL_PATH)
    print(f"\n✓ Multi-task model saved: {MODEL_PATH}")

    # Save metrics
    metrics_output = {
        'dataset_size': int(len(X)),
        'train_size': int(len(X_train)),
        'test_size': int(len(X_test)),
        'feature_count': len(feature_names),
        'features': feature_names,
        'targets': list(y.columns),
        'multitask_metrics': multitask_metrics,
        'singletask_metrics': single_task_metrics,
        'comparison': comparison,
        'architecture': {
            'hidden_layers': [128, 64, 32],
            'activation': 'relu',
            'solver': 'adam',
            'max_iter': 500
        }
    }

    METRICS_PATH.write_text(json.dumps(metrics_output, indent=2), encoding='utf-8')
    print(f"✓ Metrics saved: {METRICS_PATH}")

    print("\n" + "=" * 80)
    print("MULTI-TASK TRAINING COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    main()
