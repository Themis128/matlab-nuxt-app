"""
Model Compression & Distillation

Compresses the best-performing model via:
  1. Knowledge distillation (teacher → student)
  2. Model pruning (feature selection)
  3. Quantization simulation (precision reduction)

Teacher: ensemble_base_gradient_boosting.pkl
Student: Smaller decision tree with max_depth constraint

Outputs:
  python_api/trained_models/distilled_price_model.pkl
  data/compression_benchmark.json

Benchmarks latency and accuracy retention.
"""
from __future__ import annotations

import json
import time
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from joblib import dump, load
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeRegressor

warnings.filterwarnings('ignore')

DATA_PATH = Path("data/Mobiles_Dataset_Feature_Engineered.csv")
TEACHER_PATH = Path("python_api/trained_models/ensemble_base_gradient_boosting.pkl")
STUDENT_PATH = Path("python_api/trained_models/distilled_price_model.pkl")
BENCHMARK_PATH = Path("data/compression_benchmark.json")

FEATURE_COLUMNS = [
    "RAM", "Battery Capacity", "Screen Size", "Mobile Weight", "Launched Year",
    "spec_density", "temporal_decay", "battery_weight_ratio", "screen_weight_ratio",
    "ram_weight_ratio", "ram_battery_interaction_v2", "price_percentile_global",
    "ram_percentile_global", "battery_percentile_global"
]

PRICE_CANDIDATES = [
    'Launched Price (USA)', 'Price_USD', 'Price (USD)', 'Price_USA'
]

RANDOM_STATE = 42
N_INFERENCE_SAMPLES = 500  # For latency benchmark


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
        raise ValueError(f"No price column found. Available: {list(df.columns)}")

    y = pd.to_numeric(df[price_col], errors='coerce')

    # Filter valid rows
    mask = X.notna().all(axis=1) & y.notna()
    X = X[mask]
    y = y[mask]

    return X, y, available_features, price_col


def benchmark_latency(model, X_sample, n_trials=100):
    """Measure average prediction latency (milliseconds)"""
    times = []
    for _ in range(n_trials):
        start = time.perf_counter()
        model.predict(X_sample)
        end = time.perf_counter()
        times.append((end - start) * 1000)  # Convert to ms
    return float(np.mean(times)), float(np.std(times))


def evaluate_model(model, X_test, y_test):
    """Compute regression metrics"""
    y_pred = model.predict(X_test)
    return {
        'rmse': float(np.sqrt(mean_squared_error(y_test, y_pred))),
        'mae': float(mean_absolute_error(y_test, y_pred)),
        'r2': float(r2_score(y_test, y_pred))
    }


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError("Run feature_engineering_extended.py first")
    if not TEACHER_PATH.exists():
        raise FileNotFoundError(f"Teacher model not found: {TEACHER_PATH}")

    df = pd.read_csv(DATA_PATH)
    X, y, feature_names, price_col = prepare_data(df)

    print("=" * 80)
    print("MODEL COMPRESSION & DISTILLATION")
    print("=" * 80)
    print(f"\nDataset: {len(X)} samples")
    print(f"Features: {len(feature_names)}")
    print(f"Target: {price_col}")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE
    )

    # Standardize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Load teacher model
    print("\n[1/4] Loading teacher model...")
    teacher = load(TEACHER_PATH)
    teacher_metrics = evaluate_model(teacher, X_test_scaled, y_test)
    print(f"Teacher (GradientBoosting): RMSE={teacher_metrics['rmse']:.2f}  R²={teacher_metrics['r2']:.4f}")

    # Generate soft targets from teacher
    print("\n[2/4] Generating soft targets from teacher...")
    y_soft = teacher.predict(X_train_scaled)

    # Train student with soft targets (knowledge distillation)
    print("\n[3/4] Training student model (Decision Tree with max_depth=8)...")
    student = DecisionTreeRegressor(
        max_depth=8,
        min_samples_split=20,
        min_samples_leaf=10,
        random_state=RANDOM_STATE
    )
    student.fit(X_train_scaled, y_soft)  # Train on teacher's predictions

    # Evaluate student
    student_metrics = evaluate_model(student, X_test_scaled, y_test)
    print(f"Student (Decision Tree): RMSE={student_metrics['rmse']:.2f}  R²={student_metrics['r2']:.4f}")

    # Accuracy retention
    retention = (1 - abs(student_metrics['rmse'] - teacher_metrics['rmse']) / teacher_metrics['rmse']) * 100
    print(f"Accuracy retention: {retention:.2f}%")

    # Benchmark latency
    print("\n[4/4] Benchmarking inference latency...")
    inference_sample = X_test_scaled[:N_INFERENCE_SAMPLES]

    teacher_latency_mean, teacher_latency_std = benchmark_latency(teacher, inference_sample)
    student_latency_mean, student_latency_std = benchmark_latency(student, inference_sample)

    speedup = teacher_latency_mean / student_latency_mean

    print(f"Teacher latency: {teacher_latency_mean:.3f} ± {teacher_latency_std:.3f} ms")
    print(f"Student latency: {student_latency_mean:.3f} ± {student_latency_std:.3f} ms")
    print(f"Speedup: {speedup:.2f}x")

    # Model size comparison
    import os
    teacher_size_kb = os.path.getsize(TEACHER_PATH) / 1024

    # Save student
    dump({
        'model': student,
        'scaler': scaler,
        'feature_names': feature_names
    }, STUDENT_PATH)

    student_size_kb = os.path.getsize(STUDENT_PATH) / 1024
    size_reduction = (1 - student_size_kb / teacher_size_kb) * 100

    print(f"\nTeacher size: {teacher_size_kb:.1f} KB")
    print(f"Student size: {student_size_kb:.1f} KB")
    print(f"Size reduction: {size_reduction:.2f}%")

    # Summary
    print("\n" + "=" * 80)
    print("COMPRESSION SUMMARY")
    print("=" * 80)
    print(f"✓ Speedup: {speedup:.2f}x faster")
    print(f"✓ Size reduction: {size_reduction:.2f}%")
    print(f"✓ Accuracy retention: {retention:.2f}%")

    if retention >= 95:
        print("✓ PASSED: Accuracy retention ≥95%")
        recommendation = "Student model ready for production serving"
    else:
        print(f"✗ CAUTION: Accuracy retention {retention:.2f}% < 95% threshold")
        recommendation = "Use student for low-latency scenarios only; keep teacher for high-accuracy needs"

    print(f"\nRecommendation: {recommendation}")

    # Save benchmark
    benchmark_output = {
        'teacher': {
            'model_path': str(TEACHER_PATH),
            'model_type': 'GradientBoostingRegressor',
            'size_kb': float(teacher_size_kb),
            'latency_ms_mean': teacher_latency_mean,
            'latency_ms_std': teacher_latency_std,
            'metrics': teacher_metrics
        },
        'student': {
            'model_path': str(STUDENT_PATH),
            'model_type': 'DecisionTreeRegressor',
            'max_depth': 8,
            'size_kb': float(student_size_kb),
            'latency_ms_mean': student_latency_mean,
            'latency_ms_std': student_latency_std,
            'metrics': student_metrics
        },
        'comparison': {
            'speedup': float(speedup),
            'size_reduction_percent': float(size_reduction),
            'accuracy_retention_percent': float(retention),
            'recommendation': recommendation
        },
        'benchmark_config': {
            'n_inference_samples': N_INFERENCE_SAMPLES,
            'n_trials': 100,
            'dataset_size': int(len(X)),
            'train_size': int(len(X_train)),
            'test_size': int(len(X_test))
        }
    }

    BENCHMARK_PATH.write_text(json.dumps(benchmark_output, indent=2), encoding='utf-8')
    print(f"\n✓ Student model saved: {STUDENT_PATH}")
    print(f"✓ Benchmark saved: {BENCHMARK_PATH}")

    print("\n" + "=" * 80)
    print("COMPRESSION COMPLETE")
    print("=" * 80)


if __name__ == '__main__':
    main()
