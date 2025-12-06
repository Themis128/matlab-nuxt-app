"""
Multi-Task with Auxiliary Targets

Instead of predicting raw specs (RAM/battery - trivial memorization),
this script predicts auxiliary tasks that share pricing signal:
  1. Brand tier (premium/mid/budget) - classification
  2. Price residual (actual - expected) - regression
  3. Market segment (premium/mid/budget) - classification

Hypothesis: Brand tier and price residual share latent features with price
prediction, enabling knowledge transfer between tasks.

Outputs:
  python_api/trained_models/multitask_auxiliary_model.pkl
  data/multitask_auxiliary_metrics.json
"""
from __future__ import annotations

import json
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from joblib import dump
from sklearn.metrics import (
    accuracy_score,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputClassifier, MultiOutputRegressor
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler

warnings.filterwarnings('ignore')

DATA_PATH = Path("data/Mobiles_Dataset_Normalized_Targets.csv")
METRICS_PATH = Path("data/multitask_auxiliary_metrics.json")
MODEL_PATH = Path("python_api/trained_models/multitask_auxiliary_model.pkl")

FEATURE_COLUMNS = [
    "RAM", "Battery Capacity", "Screen Size", "Mobile Weight", "Launched Year",
    "spec_density", "temporal_decay", "battery_weight_ratio", "screen_weight_ratio",
    "ram_weight_ratio", "ram_battery_interaction_v2", "price_percentile_global",
    "ram_percentile_global", "battery_percentile_global"
]

PRICE_COL = 'Launched Price (USA)'
COMPANY_COL = 'Company'
RANDOM_STATE = 42


def prepare_data(df: pd.DataFrame):
    """Prepare features and multiple auxiliary targets"""
    available_features = [c for c in FEATURE_COLUMNS if c in df.columns]
    X = df[available_features].copy()

    for c in available_features:
        X[c] = pd.to_numeric(X[c], errors='coerce')
    X = X.fillna(X.median())

    # Primary target: price
    price_col = PRICE_COL if PRICE_COL in df.columns else 'Launched Price (USA)'
    if price_col not in df.columns:
        raise ValueError(f"Price column '{price_col}' not found in dataset")

    y_price = pd.to_numeric(df[price_col], errors='coerce')

    # Auxiliary targets
    # 1. Brand tier (from company median price)
    if COMPANY_COL in df.columns:
        company_median_price = df.groupby(COMPANY_COL)[price_col].transform('median')
        y_brand_tier = pd.cut(
            company_median_price,
            bins=[0, 300, 600, float('inf')],
            labels=['budget', 'mid', 'premium']
        ).astype(str)
    else:
        y_brand_tier = pd.Series(['mid'] * len(df))

    # 2. Price residual (actual - expected)
    if 'price_residual' in df.columns:
        y_price_residual = pd.to_numeric(df['price_residual'], errors='coerce')
    else:
        # Compute simple residual: actual - median per RAM tier
        ram = pd.to_numeric(df['RAM'], errors='coerce').fillna(4)
        ram_bins = pd.cut(ram, bins=[0, 4, 8, 12, float('inf')], labels=['low', 'mid', 'high', 'premium'])
        expected_price = df.groupby(ram_bins)[price_col].transform('median')
        y_price_residual = y_price - expected_price

    # 3. Market segment
    if 'market_segment' in df.columns:
        y_market_segment = df['market_segment'].astype(str)
    else:
        # Fallback to price percentile
        price_percentile = y_price.rank(pct=True)
        y_market_segment = pd.cut(
            price_percentile,
            bins=[0, 0.33, 0.67, 1.0],
            labels=['budget', 'mid', 'premium']
        ).astype(str)

    # Combine targets
    targets = pd.DataFrame({
        'price': y_price,
        'price_residual': y_price_residual,
        'brand_tier': y_brand_tier,
        'market_segment': y_market_segment
    })

    # Filter valid rows
    mask = (
        X.notna().all(axis=1) &
        targets['price'].notna() &
        targets['price_residual'].notna() &
        targets['brand_tier'].notna() &
        targets['market_segment'].notna()
    )

    X = X[mask]
    targets = targets[mask]

    # Encode categorical targets
    brand_tier_encoder = LabelEncoder()
    market_segment_encoder = LabelEncoder()

    targets['brand_tier_encoded'] = brand_tier_encoder.fit_transform(targets['brand_tier'])
    targets['market_segment_encoded'] = market_segment_encoder.fit_transform(targets['market_segment'])

    return X, targets, available_features, brand_tier_encoder, market_segment_encoder


def train_multitask_model(X_train, y_train_reg, y_train_class):
    """
    Train multi-task model with shared trunk:
      - Regression head: price + price_residual
      - Classification head: brand_tier + market_segment
    """
    # Regression tasks (price + residual)
    reg_model = MLPRegressor(
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

    multitask_reg = MultiOutputRegressor(reg_model)
    multitask_reg.fit(X_train, y_train_reg)

    # Classification tasks (brand_tier + market_segment)
    class_model = MLPClassifier(
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

    multitask_class = MultiOutputClassifier(class_model)
    multitask_class.fit(X_train, y_train_class)

    return multitask_reg, multitask_class


def train_single_task_models(X_train, y_train_price):
    """Train single-task price predictor for comparison"""
    model = MLPRegressor(
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

    model.fit(X_train, y_train_price)
    return model


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError("Run target_normalization.py first")

    df = pd.read_csv(DATA_PATH)
    X, targets, feature_names, brand_tier_encoder, market_segment_encoder = prepare_data(df)

    print("=" * 80)
    print("MULTI-TASK WITH AUXILIARY TARGETS")
    print("=" * 80)
    print(f"\nDataset: {len(X)} samples")
    print(f"Features: {len(feature_names)}")
    print("Targets:")
    print("  - price (regression)")
    print("  - price_residual (regression)")
    print("  - brand_tier (classification)")
    print("  - market_segment (classification)")

    # Split data
    X_train, X_test, targets_train, targets_test = train_test_split(
        X, targets, test_size=0.2, random_state=RANDOM_STATE
    )

    # Standardize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Prepare regression and classification targets
    y_train_reg = targets_train[['price', 'price_residual']].values
    y_test_reg = targets_test[['price', 'price_residual']].values

    y_train_class = targets_train[['brand_tier_encoded', 'market_segment_encoded']].values
    y_test_class = targets_test[['brand_tier_encoded', 'market_segment_encoded']].values

    # Train multi-task models
    print("\n[1/2] Training multi-task models (regression + classification)...")
    multitask_reg, multitask_class = train_multitask_model(
        X_train_scaled, y_train_reg, y_train_class
    )

    # Predict
    y_pred_reg = multitask_reg.predict(X_test_scaled)
    y_pred_class = multitask_class.predict(X_test_scaled)

    # Evaluate regression tasks
    price_rmse = np.sqrt(mean_squared_error(y_test_reg[:, 0], y_pred_reg[:, 0]))
    price_r2 = r2_score(y_test_reg[:, 0], y_pred_reg[:, 0])

    residual_rmse = np.sqrt(mean_squared_error(y_test_reg[:, 1], y_pred_reg[:, 1]))
    residual_r2 = r2_score(y_test_reg[:, 1], y_pred_reg[:, 1])

    # Evaluate classification tasks
    brand_tier_acc = accuracy_score(y_test_class[:, 0], y_pred_class[:, 0])
    market_segment_acc = accuracy_score(y_test_class[:, 1], y_pred_class[:, 1])

    print("\nMulti-task performance:")
    print(f"  Price:           RMSE=${price_rmse:8.2f}  R²={price_r2:.4f}")
    print(f"  Price residual:  RMSE=${residual_rmse:8.2f}  R²={residual_r2:.4f}")
    print(f"  Brand tier:      Accuracy={brand_tier_acc:.4f}")
    print(f"  Market segment:  Accuracy={market_segment_acc:.4f}")

    # Train single-task price model
    print("\n[2/2] Training single-task price model for comparison...")
    single_task_model = train_single_task_models(X_train_scaled, y_train_reg[:, 0])

    y_pred_single = single_task_model.predict(X_test_scaled)
    single_price_rmse = np.sqrt(mean_squared_error(y_test_reg[:, 0], y_pred_single))
    single_price_r2 = r2_score(y_test_reg[:, 0], y_pred_single)

    print("\nSingle-task performance:")
    print(f"  Price:           RMSE=${single_price_rmse:8.2f}  R²={single_price_r2:.4f}")

    # Compare
    improvement = ((single_price_rmse - price_rmse) / single_price_rmse) * 100

    print("\n" + "=" * 80)
    print("COMPARISON (Multi-task vs Single-task)")
    print("=" * 80)
    print(f"Single-task price RMSE: ${single_price_rmse:8.2f}")
    print(f"Multi-task price RMSE:  ${price_rmse:8.2f}")
    print(f"Improvement:            {improvement:+.2f}%")

    if improvement > 3:
        print(f"\n[SUCCESS] Auxiliary tasks improve price prediction by {improvement:.2f}%!")
    elif improvement > 0:
        print(f"\n[MODEST GAIN] Auxiliary tasks help by {improvement:.2f}%")
    else:
        print(f"\n[NO GAIN] Multi-task underperforms single-task by {abs(improvement):.2f}%")

    # Save models
    dump({
        'regression_model': multitask_reg,
        'classification_model': multitask_class,
        'scaler': scaler,
        'brand_tier_encoder': brand_tier_encoder,
        'market_segment_encoder': market_segment_encoder,
        'feature_names': feature_names
    }, MODEL_PATH)

    print(f"\n[OK] Multi-task model saved: {MODEL_PATH}")

    # Save metrics
    metrics_output = {
        'dataset_size': int(len(X)),
        'train_size': int(len(X_train)),
        'test_size': int(len(X_test)),
        'feature_count': len(feature_names),
        'multitask_metrics': {
            'price_rmse': float(price_rmse),
            'price_r2': float(price_r2),
            'price_residual_rmse': float(residual_rmse),
            'price_residual_r2': float(residual_r2),
            'brand_tier_accuracy': float(brand_tier_acc),
            'market_segment_accuracy': float(market_segment_acc)
        },
        'singletask_metrics': {
            'price_rmse': float(single_price_rmse),
            'price_r2': float(single_price_r2)
        },
        'improvement_percent': float(improvement),
        'architecture': {
            'shared_layers': [256, 128, 64],
            'activation': 'relu',
            'solver': 'adam',
            'max_iter': 500
        },
        'auxiliary_tasks': ['price_residual', 'brand_tier', 'market_segment'],
        'note': 'Multi-task learning with auxiliary classification tasks (brand tier, market segment) + residual regression'
    }

    METRICS_PATH.write_text(json.dumps(metrics_output, indent=2), encoding='utf-8')
    print(f"[OK] Metrics saved: {METRICS_PATH}")

    print("\n" + "=" * 80)
    print("MULTI-TASK AUXILIARY TRAINING COMPLETE")
    print("=" * 80)


if __name__ == '__main__':
    main()
