"""
Cross-Validation Script
Performs k-fold cross-validation to check model stability
"""

import sys
from pathlib import Path
import warnings
import numpy as np
from sklearn.model_selection import KFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import (
    GradientBoostingRegressor,
    RandomForestRegressor,
    GradientBoostingClassifier,
    RandomForestClassifier,
)

sys.path.insert(0, str(Path(__file__).parent))
from train_models_sklearn import (
    load_and_preprocess_data,
    encode_companies,
    encode_processors,
    create_engineered_features,
)

warnings.filterwarnings('ignore')

# Try XGBoost
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False


def cross_validate_price_model(k_folds=5):
    """Cross-validate price prediction model"""
    print("\n" + "="*80)
    print(f"CROSS-VALIDATING PRICE MODEL (k={k_folds})")
    print("="*80)

    data = load_and_preprocess_data()
    company_encoded, unique_companies = encode_companies(data['companies'])
    processor_encoded = encode_processors(data.get('processors', ['Unknown'] * len(data['companies'])))
    X = create_engineered_features(data, company_encoded, processor_encoded)
    y = data['price']

    # Use log transformation
    y_log = np.log1p(y)

    # Normalize
    X_scaler = StandardScaler()
    y_scaler = StandardScaler()
    X_norm = X_scaler.fit_transform(X)
    y_norm = y_scaler.fit_transform(y_log.reshape(-1, 1)).flatten()

    # Try multiple models
    models = {
        'GradientBoosting': GradientBoostingRegressor(
            n_estimators=300, learning_rate=0.03, max_depth=7,
            min_samples_split=5, min_samples_leaf=2, subsample=0.8,
            random_state=42, verbose=0
        ),
        'RandomForest': RandomForestRegressor(
            n_estimators=300, max_depth=15, min_samples_split=5,
            min_samples_leaf=2, max_features='sqrt', random_state=42, n_jobs=-1
        )
    }

    if XGBOOST_AVAILABLE:
        models['XGBoost'] = xgb.XGBRegressor(
            n_estimators=300, learning_rate=0.03, max_depth=7,
            min_child_weight=3, subsample=0.8, colsample_bytree=0.8,
            random_state=42, n_jobs=-1, verbosity=0
        )

    kf = KFold(n_splits=k_folds, shuffle=True, random_state=42)

    print("\n📊 Cross-Validation Results (R² Score):")
    print(f"{'Model':<20} {'Mean R²':<12} {'Std Dev':<12} {'Min':<12} {'Max':<12}")
    print("-" * 70)

    best_model = None
    best_score = -np.inf

    for name, model in models.items():
        scores = cross_val_score(model, X_norm, y_norm, cv=kf, scoring='r2', n_jobs=-1)
        mean_score = np.mean(scores)
        std_score = np.std(scores)
        min_score = np.min(scores)
        max_score = np.max(scores)

        print(f"{name:<20} {mean_score:>11.4f} {std_score:>11.4f} {min_score:>11.4f} {max_score:>11.4f}")

        if mean_score > best_score:
            best_score = mean_score
            best_model = name

    print(f"\n✅ Best Model: {best_model} (Mean R²: {best_score:.4f})")

    if np.std(scores) < 0.01:
        print("   ✅ Low variance - model is stable across folds")
    elif np.std(scores) < 0.05:
        print("   ✓ Acceptable variance")
    else:
        print("   ⚠️  High variance - model may be unstable")


def cross_validate_ram_model(k_folds=5):
    """Cross-validate RAM prediction model"""
    print("\n" + "="*80)
    print(f"CROSS-VALIDATING RAM MODEL (k={k_folds})")
    print("="*80)

    data = load_and_preprocess_data()
    company_encoded, unique_companies = encode_companies(data['companies'])
    processor_encoded = encode_processors(data.get('processors', ['Unknown'] * len(data['companies'])))
    X = create_engineered_features(data, company_encoded, processor_encoded)
    y = data['ram']

    X_scaler = StandardScaler()
    y_scaler = StandardScaler()
    X_norm = X_scaler.fit_transform(X)
    y_norm = y_scaler.fit_transform(y.reshape(-1, 1)).flatten()

    models = {
        'GradientBoosting': GradientBoostingRegressor(
            n_estimators=300, learning_rate=0.02, max_depth=7,
            min_samples_split=5, min_samples_leaf=2, subsample=0.8,
            random_state=42, verbose=0
        ),
        'RandomForest': RandomForestRegressor(
            n_estimators=300, max_depth=15, min_samples_split=5,
            min_samples_leaf=2, max_features='sqrt', random_state=42, n_jobs=-1
        )
    }

    if XGBOOST_AVAILABLE:
        models['XGBoost'] = xgb.XGBRegressor(
            n_estimators=300, learning_rate=0.02, max_depth=7,
            min_child_weight=3, subsample=0.8, colsample_bytree=0.8,
            random_state=42, n_jobs=-1, verbosity=0
        )

    kf = KFold(n_splits=k_folds, shuffle=True, random_state=42)

    print("\n📊 Cross-Validation Results (R² Score):")
    print(f"{'Model':<20} {'Mean R²':<12} {'Std Dev':<12} {'Min':<12} {'Max':<12}")
    print("-" * 70)

    for name, model in models.items():
        scores = cross_val_score(model, X_norm, y_norm, cv=kf, scoring='r2', n_jobs=-1)
        mean_score = np.mean(scores)
        std_score = np.std(scores)
        min_score = np.min(scores)
        max_score = np.max(scores)

        print(f"{name:<20} {mean_score:>11.4f} {std_score:>11.4f} {min_score:>11.4f} {max_score:>11.4f}")

        if std_score < 0.01:
            print(f"   ✅ {name} is very stable")
        elif std_score > 0.05:
            print(f"   ⚠️  {name} has high variance")


def cross_validate_brand_model(k_folds=5):
    """Cross-validate brand classification model"""
    print("\n" + "="*80)
    print(f"CROSS-VALIDATING BRAND MODEL (k={k_folds})")
    print("="*80)

    data = load_and_preprocess_data()
    company_encoded, unique_companies = encode_companies(data['companies'])
    processor_encoded = encode_processors(data.get('processors', ['Unknown'] * len(data['companies'])))
    X = create_engineered_features(data, company_encoded, processor_encoded)
    y = np.array(data['companies'])

    # Filter brands with < 4 samples
    from collections import Counter
    brand_counts = Counter(y)
    min_samples = 4
    valid_brands = [brand for brand, count in brand_counts.items() if count >= min_samples]
    valid_mask = np.array([brand in valid_brands for brand in y])
    X = X[valid_mask]
    y = y[valid_mask]

    X_scaler = StandardScaler()
    X_norm = X_scaler.fit_transform(X)

    models = {
        'RandomForest': RandomForestClassifier(
            n_estimators=300, max_depth=15, min_samples_split=5,
            min_samples_leaf=2, max_features='sqrt', random_state=42, n_jobs=-1
        ),
        'GradientBoosting': GradientBoostingClassifier(
            n_estimators=300, learning_rate=0.03, max_depth=7,
            min_samples_split=5, min_samples_leaf=2, subsample=0.8,
            random_state=42, verbose=0
        )
    }

    kf = KFold(n_splits=k_folds, shuffle=True, random_state=42)

    print("\n📊 Cross-Validation Results (Accuracy):")
    print(f"{'Model':<20} {'Mean Acc':<12} {'Std Dev':<12} {'Min':<12} {'Max':<12}")
    print("-" * 70)

    for name, model in models.items():
        scores = cross_val_score(model, X_norm, y, cv=kf, scoring='accuracy', n_jobs=-1)
        mean_score = np.mean(scores)
        std_score = np.std(scores)
        min_score = np.min(scores)
        max_score = np.max(scores)

        print(f"{name:<20} {mean_score:>11.4f} {std_score:>11.4f} {min_score:>11.4f} {max_score:>11.4f}")


def main():
    """Run cross-validation for all models"""
    print("="*80)
    print("CROSS-VALIDATION - Checking Model Stability")
    print("="*80)
    print("\nThis script performs k-fold cross-validation to check")
    print("if models are stable across different data splits.\n")

    k_folds = 5
    print(f"Using {k_folds}-fold cross-validation\n")

    cross_validate_price_model(k_folds)
    cross_validate_ram_model(k_folds)
    cross_validate_brand_model(k_folds)

    print("\n" + "="*80)
    print("CROSS-VALIDATION COMPLETE")
    print("="*80)
    print("\n💡 Interpretation:")
    print("   - Low std dev (< 0.01): Model is stable")
    print("   - High std dev (> 0.05): Model may be unstable")
    print("   - Consistent scores across folds: Good generalization")


if __name__ == "__main__":
    main()
