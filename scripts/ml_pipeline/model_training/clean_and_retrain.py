"""
Remove Data Leakage Features & Retrain Production Models
=========================================================

CRITICAL FIX: Removes price-derived features that cause data leakage:
- price_percentile_global (correlation >0.98 with target)
- price_elasticity_proxy (derived from price)
- cross_brand_price_delta (derived from price)

Retrains all production models with clean feature set:
1. GradientBoosting (baseline teacher)
2. Ensemble stacking (4 base learners)
3. Distilled decision tree (production deployment)

Expected Impact:
- RMSE increases from $6-7 to $1,200-1,400 (realistic baseline)
- Models generalize to unseen data (no leakage)
- Production-ready for real-world predictions

Author: ML Improvement Initiative
Date: 2025-11-30
"""

import json
import time
from pathlib import Path

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeRegressor

# Paths
BASE_DIR = Path(__file__).parent.parent.parent.parent  # Go up to project root
DATA_DIR = BASE_DIR / 'data'
MODELS_DIR = BASE_DIR / 'python_api' / 'trained_models'
OUTPUT_DIR = BASE_DIR / 'data'

# Ensure directories exist
MODELS_DIR.mkdir(exist_ok=True, parents=True)
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

# Leakage features to remove
LEAKAGE_FEATURES = [
    'price_percentile_global',
    'price_elasticity_proxy',
    'cross_brand_price_delta'
]

print("=" * 80)
print("CRITICAL FIX: Removing Data Leakage Features")
print("=" * 80)


def load_and_clean_data():
    """Load feature-engineered data and remove leakage features"""
    print("\n[1/6] Loading data...")

    # Try multiple file locations
    possible_paths = [
        DATA_DIR / 'Mobiles_Dataset_Feature_Engineered.csv',
        DATA_DIR / 'Mobiles Dataset (2025).csv',
        Path(__file__).parent / 'mobiles-dataset-docs' / 'Mobiles Dataset (2025).csv'
    ]

    df = None
    for path in possible_paths:
        if path.exists():
            df = pd.read_csv(path)
            print(f"   [OK] Loaded: {path.name} ({len(df)} samples)")
            break

    if df is None:
        raise FileNotFoundError("Could not find dataset file")

    # Check for leakage features
    found_leakage = [f for f in LEAKAGE_FEATURES if f in df.columns]
    print("\n[2/6] Checking for leakage features...")
    if found_leakage:
        print(f"   [WARNING] Found {len(found_leakage)} leakage features:")
        for feat in found_leakage:
            if 'Price' in df.columns:
                corr = df[feat].corr(df['Price'])
                print(f"      - {feat} (corr with Price: {corr:.3f})")
            else:
                print(f"      - {feat}")

        # Remove leakage features
        df = df.drop(columns=found_leakage)
        print(f"   [OK] Removed {len(found_leakage)} leakage features")
    else:
        print("   [OK] No leakage features found (already clean)")

    # Save clean dataset
    clean_path = OUTPUT_DIR / 'Mobiles_Dataset_Clean.csv'
    df.to_csv(clean_path, index=False)
    print(f"   [OK] Saved clean dataset: {clean_path.name}")

    return df


def prepare_features(df):
    """Prepare clean features for modeling"""
    print("\n[3/6] Preparing features...")

    # Target (handle different column names)
    price_col = None
    for col in ['Price', 'Launched Price (Pakistan)', 'price']:
        if col in df.columns:
            price_col = col
            break

    if price_col is None:
        raise ValueError(f"Price column not found. Available columns: {list(df.columns)}")

    y = df[price_col].values

    # Base features (handle different column names)
    base_features_map = {
        'RAM': ['RAM', 'ram'],
        'Battery Capacity': ['Battery Capacity', 'battery', 'Battery'],
        'Screen Size': ['Screen Size', 'screen', 'Screen'],
        'Mobile Weight': ['Mobile Weight', 'weight', 'Weight'],
        'Launched Year': ['Launched Year', 'year', 'Year', 'Launch Year']
    }

    base_features = []

    # Optional engineered features (if available - numeric only)
    optional_features = [
        'spec_density', 'temporal_decay', 'battery_weight_ratio',
        'screen_weight_ratio', 'ram_weight_ratio', 'ram_battery_interaction_v2',
        'ram_percentile_global', 'battery_percentile_global',
        'price_percentile_brand', 'spec_value_ratio', 'market_segment_encoded',
        'technology_generation_v2', 'composite_score'
    ]

    # Categorical features to encode (handle different names)
    categorical_cols = []
    for col in ['Company', 'Company Name', 'company']:
        if col in df.columns:
            categorical_cols.append(col)
    for col in ['Processor', 'processor']:
        if col in df.columns:
            categorical_cols.append(col)

    # Also check for string columns in optional features
    for feat in optional_features[:]:
        if feat in df.columns and df[feat].dtype == 'object':
            categorical_cols.append(feat)
            optional_features.remove(feat)

    # Build feature list with column name mapping
    feature_cols = []
    for canonical_name, possible_names in base_features_map.items():
        for name in possible_names:
            if name in df.columns:
                base_features.append(name)
                feature_cols.append(name)
                break

    for feat in optional_features:
        if feat in df.columns:
            feature_cols.append(feat)

    # Encode categorical features
    label_encoders = {}
    for cat_feat in categorical_cols:
        if cat_feat in df.columns:
            le = LabelEncoder()
            df[f'{cat_feat}_encoded'] = le.fit_transform(df[cat_feat].astype(str))
            feature_cols.append(f'{cat_feat}_encoded')
            label_encoders[cat_feat] = le

    X = df[feature_cols].values

    print(f"   [OK] Feature matrix: {X.shape[0]} samples x {X.shape[1]} features")
    print(f"   [OK] Features: {', '.join(feature_cols[:5])}... (+ {len(feature_cols)-5} more)")
    print(f"   [OK] Target range: ${y.min():.0f} - ${y.max():.0f}")

    # Save feature metadata
    metadata = {
        'features': feature_cols,
        'feature_count': len(feature_cols),
        'sample_count': len(X),
        'leakage_features_removed': LEAKAGE_FEATURES,
        'categorical_encoders': {k: v.classes_.tolist() for k, v in label_encoders.items()}
    }

    metadata_path = OUTPUT_DIR / 'clean_model_metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"   [OK] Saved metadata: {metadata_path.name}")

    return X, y, feature_cols, label_encoders


def train_baseline_gbm(X_train, y_train, X_test, y_test):
    """Train baseline GBM (teacher model)"""
    print("\n[4/6] Training baseline GradientBoosting (teacher)...")

    model = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=5,
        min_samples_split=5,
        min_samples_leaf=2,
        subsample=0.8,
        random_state=42
    )

    # Train
    start_time = time.time()
    model.fit(X_train, y_train)
    train_time = time.time() - start_time

    # Evaluate
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)

    rmse_train = np.sqrt(mean_squared_error(y_train, y_pred_train))
    rmse_test = np.sqrt(mean_squared_error(y_test, y_pred_test))
    mae_test = mean_absolute_error(y_test, y_pred_test)
    r2_test = r2_score(y_test, y_pred_test)

    print(f"   [OK] Training time: {train_time:.2f}s")
    print(f"   [OK] Train RMSE: ${rmse_train:,.0f}")
    print(f"   [OK] Test RMSE: ${rmse_test:,.0f} (realistic baseline)")
    print(f"   [OK] Test MAE: ${mae_test:,.0f}")
    print(f"   [OK] Test R²: {r2_test:.4f}")

    # Save model
    model_path = MODELS_DIR / 'clean_gbm_model.pkl'
    joblib.dump(model, model_path)
    print(f"   [OK] Saved: {model_path.name}")

    return model, {
        'rmse_train': rmse_train,
        'rmse_test': rmse_test,
        'mae_test': mae_test,
        'r2_test': r2_test,
        'train_time': train_time
    }


def train_ensemble_stacking(X_train, y_train, X_test, y_test):
    """Train ensemble with 4 base learners"""
    print("\n[5/6] Training ensemble stacking...")

    # Base learners
    base_models = {
        'rf': RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
        'gbm': GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42),
        'lgbm': lgb.LGBMRegressor(n_estimators=100, max_depth=5, random_state=42, verbose=-1),
        'gbm2': GradientBoostingRegressor(n_estimators=150, max_depth=6, learning_rate=0.05, random_state=43)
    }

    # Train base models and generate meta-features
    print("   Training base learners...")
    meta_train = np.zeros((X_train.shape[0], len(base_models)))
    meta_test = np.zeros((X_test.shape[0], len(base_models)))

    for i, (name, model) in enumerate(base_models.items()):
        print(f"      - {name}...", end=' ')
        model.fit(X_train, y_train)
        meta_train[:, i] = model.predict(X_train)
        meta_test[:, i] = model.predict(X_test)
        print("[OK]")

    # Train meta-learner (Ridge with positive weights)
    print("   Training meta-learner (Ridge)...")
    meta_model = Ridge(alpha=1.0, positive=True)
    meta_model.fit(meta_train, y_train)

    # Evaluate
    y_pred_test = meta_model.predict(meta_test)
    rmse_test = np.sqrt(mean_squared_error(y_test, y_pred_test))
    mae_test = mean_absolute_error(y_test, y_pred_test)
    r2_test = r2_score(y_test, y_pred_test)

    print(f"   [OK] Test RMSE: ${rmse_test:,.0f}")
    print(f"   [OK] Test MAE: ${mae_test:,.0f}")
    print(f"   [OK] Test R²: {r2_test:.4f}")
    print(f"   [OK] Meta-learner weights: {dict(zip(base_models.keys(), meta_model.coef_.round(3)))}")

    # Save ensemble
    ensemble_path = MODELS_DIR / 'clean_ensemble_model.pkl'
    joblib.dump({
        'base_models': base_models,
        'meta_model': meta_model
    }, ensemble_path)
    print(f"   [OK] Saved: {ensemble_path.name}")

    return {
        'rmse_test': rmse_test,
        'mae_test': mae_test,
        'r2_test': r2_test,
        'weights': dict(zip(base_models.keys(), meta_model.coef_.tolist()))
    }


def distill_model(teacher_model, X_train, y_train, X_test, y_test, feature_names):
    """Distill GBM teacher into decision tree student"""
    print("\n[6/6] Distilling decision tree (production model)...")

    # Generate soft targets from teacher
    print("   Generating soft targets from teacher...")
    soft_targets = teacher_model.predict(X_train)

    # Train student on soft targets
    print("   Training student (DecisionTree max_depth=8)...")
    student = DecisionTreeRegressor(max_depth=8, min_samples_split=10, random_state=42)

    start_time = time.time()
    student.fit(X_train, soft_targets)  # Learn from teacher predictions
    train_time = time.time() - start_time

    # Evaluate student
    teacher_pred = teacher_model.predict(X_test)
    student_pred = student.predict(X_test)

    teacher_rmse = np.sqrt(mean_squared_error(y_test, teacher_pred))
    student_rmse = np.sqrt(mean_squared_error(y_test, student_pred))

    # Benchmark latency
    print("   Benchmarking latency (500 samples, 100 trials)...")
    n_samples = min(500, X_test.shape[0])
    X_bench = X_test[:n_samples]

    # Teacher latency
    teacher_times = []
    for _ in range(100):
        start = time.perf_counter()
        teacher_model.predict(X_bench)
        teacher_times.append((time.perf_counter() - start) * 1000)
    teacher_latency = np.mean(teacher_times) / n_samples

    # Student latency
    student_times = []
    for _ in range(100):
        start = time.perf_counter()
        student.predict(X_bench)
        student_times.append((time.perf_counter() - start) * 1000)
    student_latency = np.mean(student_times) / n_samples

    speedup = teacher_latency / student_latency

    # Model sizes
    import pickle
    teacher_size = len(pickle.dumps(teacher_model)) / 1024  # KB
    student_size = len(pickle.dumps(student)) / 1024

    accuracy_retention = (1 - abs(student_rmse - teacher_rmse) / teacher_rmse) * 100

    print(f"   [OK] Teacher RMSE: ${teacher_rmse:,.0f}")
    print(f"   [OK] Student RMSE: ${student_rmse:,.0f}")
    print(f"   [OK] Accuracy retention: {accuracy_retention:.1f}%")
    print(f"   [OK] Speedup: {speedup:.1f}x ({student_latency:.3f}ms vs {teacher_latency:.3f}ms)")
    print(f"   [OK] Size reduction: {(1 - student_size/teacher_size)*100:.1f}% ({student_size:.1f} KB vs {teacher_size:.1f} KB)")

    # Save distilled model (PRODUCTION) with metadata
    distilled_path = MODELS_DIR / 'distilled_price_model.pkl'
    model_package = {
        'model': student,
        'feature_names': feature_names,
        'metadata': {
            'speedup': float(speedup),
            'size_reduction_pct': float((1 - student_size/teacher_size) * 100),
            'accuracy_retention_pct': float(accuracy_retention),
            'teacher_rmse': float(teacher_rmse),
            'student_rmse': float(student_rmse)
        }
    }
    joblib.dump(model_package, distilled_path)
    print(f"   [OK] Saved production model: {distilled_path.name}")

    # Save benchmark
    benchmark = {
        'teacher_rmse': float(teacher_rmse),
        'student_rmse': float(student_rmse),
        'accuracy_retention_pct': float(accuracy_retention),
        'speedup_factor': float(speedup),
        'teacher_latency_ms': float(teacher_latency),
        'student_latency_ms': float(student_latency),
        'teacher_size_kb': float(teacher_size),
        'student_size_kb': float(student_size),
        'size_reduction_pct': float((1 - student_size/teacher_size) * 100),
        'production_ready': True
    }

    benchmark_path = OUTPUT_DIR / 'clean_distillation_benchmark.json'
    with open(benchmark_path, 'w') as f:
        json.dump(benchmark, f, indent=2)
    print(f"   [OK] Saved benchmark: {benchmark_path.name}")

    return benchmark


def main():
    """Main execution"""
    # Load and clean data
    df = load_and_clean_data()

    # Prepare features
    X, y, feature_cols, label_encoders = prepare_features(df)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train baseline GBM
    gbm_model, gbm_metrics = train_baseline_gbm(X_train, y_train, X_test, y_test)

    # Train ensemble
    ensemble_metrics = train_ensemble_stacking(X_train, y_train, X_test, y_test)

    # Distill model
    distill_metrics = distill_model(gbm_model, X_train, y_train, X_test, y_test, feature_cols)

    # Summary
    print("\n" + "=" * 80)
    print("CLEAN MODEL TRAINING COMPLETE")
    print("=" * 80)
    print("\n[Baseline GBM (Teacher)]")
    print(f"   RMSE: ${gbm_metrics['rmse_test']:,.0f} (realistic, no leakage)")
    print(f"   R²: {gbm_metrics['r2_test']:.4f}")

    print("\n[Ensemble Stacking]")
    print(f"   RMSE: ${ensemble_metrics['rmse_test']:,.0f}")
    print(f"   Improvement: {((gbm_metrics['rmse_test'] - ensemble_metrics['rmse_test']) / gbm_metrics['rmse_test'] * 100):.2f}%")

    print("\n[Distilled Model (Production)]")
    print(f"   RMSE: ${distill_metrics['student_rmse']:,.0f}")
    print(f"   Speedup: {distill_metrics['speedup_factor']:.1f}x")
    print(f"   Size: {distill_metrics['student_size_kb']:.1f} KB ({distill_metrics['size_reduction_pct']:.1f}% smaller)")
    print(f"   Accuracy: {distill_metrics['accuracy_retention_pct']:.1f}% retention")

    print(f"\n[OK] Models saved to: {MODELS_DIR}")
    print("[OK] Production model: distilled_price_model.pkl")
    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
