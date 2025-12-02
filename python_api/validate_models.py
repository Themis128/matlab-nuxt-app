"""
Model Validation Script
Tests trained models on unseen data to check for overfitting
"""

import sys
import io
from pathlib import Path
import warnings
import numpy as np
import pickle
import json
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    r2_score,
    mean_squared_error,
    mean_absolute_error,
    accuracy_score,
)

# Import training functions to reuse data loading (imports must be at top)
sys.path.insert(0, str(Path(__file__).parent))
from train_models_sklearn import (
    load_and_preprocess_data,
    encode_companies,
    encode_processors,
    create_engineered_features,
)

warnings.filterwarnings('ignore')

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except (AttributeError, OSError):
        pass

MODELS_DIR = Path(__file__).parent / "trained_models"


def load_model(model_name):
    """Load a trained model and its scalers/metadata"""
    model_path = MODELS_DIR / f"{model_name}_sklearn.pkl"
    scaler_path = MODELS_DIR / f"{model_name}_scalers.pkl"
    metadata_path = MODELS_DIR / f"{model_name}_metadata.json"

    if not all([model_path.exists(), scaler_path.exists(), metadata_path.exists()]):
        return None, None, None

    # Security: Comprehensive validation before loading
    max_file_size = 500 * 1024 * 1024  # 500MB limit
    for path in [model_path, scaler_path]:
        if path.stat().st_size > max_file_size:
            raise ValueError(f"Model file too large: {path} (>500MB)")
        # Ensure files are in expected directory
        if not str(path).startswith(str(MODELS_DIR)):
            raise ValueError(f"Model file not in trusted directory: {path}")

    # Load model with validation
    with open(model_path, 'rb') as f:
        header = f.read(2)
        # first byte 0x80 indicates a pickle; second byte is protocol version
        if len(header) < 1 or header[0] != 0x80:
            raise ValueError(f"Invalid pickle header for model: {header!r}")
        f.seek(0)
        try:
            model = pickle.load(f)
        except Exception as e:
            raise ValueError(f"Failed to unpickle model file {model_path}: {e}") from e

    # Load scalers with validation
    with open(scaler_path, 'rb') as f:
        header = f.read(2)
        if len(header) < 1 or header[0] != 0x80:
            raise ValueError(f"Invalid pickle header for scalers: {header!r}")
        f.seek(0)
        try:
            scalers = pickle.load(f)
        except Exception as e:
            raise ValueError(f"Failed to unpickle scalers file {scaler_path}: {e}") from e
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)

    return model, scalers, metadata


def validate_price_model():
    """Validate price prediction model"""
    print("\n" + "="*80)
    print("VALIDATING PRICE PREDICTION MODEL")
    print("="*80)

    # Load data
    data = load_and_preprocess_data()

    # Prepare features
    company_encoded, unique_companies = encode_companies(data['companies'])
    processor_encoded = encode_processors(data.get('processors', ['Unknown'] * len(data['companies'])))
    X = create_engineered_features(data, company_encoded, processor_encoded)
    y = data['price']

    # Use same split as training (70/15/15)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.3, random_state=42
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42
    )

    # Load model
    model, scalers, metadata = load_model('price_predictor')
    if model is None:
        print("[ERROR] Model not found!")
        return

    # Normalize test data
    X_scaler = scalers['X_scaler']
    y_scaler = scalers['y_scaler']
    X_test_norm = X_scaler.transform(X_test)

    # Predict
    y_pred_norm = model.predict(X_test_norm)

    # Handle log transformation
    use_log = scalers.get('use_log', False)
    if use_log:
        y_pred_log = y_scaler.inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()
        y_pred = np.expm1(y_pred_log)
        y_test_orig = y_test
    else:
        y_pred = y_scaler.inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()
        y_test_orig = y_test

    # Calculate metrics
    r2 = r2_score(y_test_orig, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test_orig, y_pred))
    mae = mean_absolute_error(y_test_orig, y_pred)

    # Calculate percentage errors
    pct_errors = np.abs((y_test_orig - y_pred) / y_test_orig) * 100
    mean_pct_error = np.mean(pct_errors)
    median_pct_error = np.median(pct_errors)

    print("\n[STATS] Test Set Performance:")
    print(f"   R² Score: {r2:.4f}")
    print(f"   RMSE: ${rmse:.2f}")
    print(f"   MAE: ${mae:.2f}")
    print(f"   Mean % Error: {mean_pct_error:.2f}%")
    print(f"   Median % Error: {median_pct_error:.2f}%")

    # Check for overfitting (compare train vs test)
    X_train_norm = X_scaler.transform(X_train)
    y_train_pred_norm = model.predict(X_train_norm)

    if use_log:
        y_train_pred_log = y_scaler.inverse_transform(y_train_pred_norm.reshape(-1, 1)).flatten()
        y_train_pred = np.expm1(y_train_pred_log)
        y_train_orig = y_train
    else:
        y_train_pred = y_scaler.inverse_transform(y_train_pred_norm.reshape(-1, 1)).flatten()
        y_train_orig = y_train

    r2_train = r2_score(y_train_orig, y_train_pred)
    r2_diff = r2_train - r2

    print("\n[CHECK] Overfitting Check:")
    print(f"   Train R²: {r2_train:.4f}")
    print(f"   Test R²: {r2:.4f}")
    print(f"   Difference: {r2_diff:.4f}")

    if r2_diff > 0.05:
        print("   [WARN] Possible overfitting (train R² much higher than test R²)")
    elif r2_diff < 0.01:
        print("   [OK] Good generalization (train and test R² are similar)")
    else:
        print("   [OK] Acceptable generalization")

    # Sample predictions
    print("\n[SAMPLES] Sample Predictions (first 10 test samples):")
    print(f"{'Actual':>12} {'Predicted':>12} {'Error %':>10} {'Status':>10}")
    print("-" * 50)
    for i in range(min(10, len(y_test_orig))):
        actual = y_test_orig[i]
        predicted = y_pred[i]
        error_pct = abs((actual - predicted) / actual) * 100
        status = "[OK]" if error_pct < 5 else "[WARN]" if error_pct < 10 else "[BAD]"
        print(f"${actual:>10.0f} ${predicted:>10.0f} {error_pct:>9.2f}% {status:>10}")


def validate_ram_model():
    """Validate RAM prediction model"""
    print("\n" + "="*80)
    print("VALIDATING RAM PREDICTION MODEL")
    print("="*80)

    data = load_and_preprocess_data()
    company_encoded, unique_companies = encode_companies(data['companies'])
    processor_encoded = encode_processors(data.get('processors', ['Unknown'] * len(data['companies'])))
    X = create_engineered_features(data, company_encoded, processor_encoded)
    y = data['ram']

    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.3, random_state=42
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42
    )

    model, scalers, metadata = load_model('ram_predictor')
    if model is None:
        print("[ERROR] Model not found!")
        return

    X_scaler = scalers['X_scaler']
    y_scaler = scalers['y_scaler']
    X_test_norm = X_scaler.transform(X_test)

    y_pred_norm = model.predict(X_test_norm)
    y_pred = y_scaler.inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()

    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)

    print("\n[STATS] Test Set Performance:")
    print(f"   R² Score: {r2:.4f}")
    print(f"   RMSE: {rmse:.2f} GB")
    print(f"   MAE: {mae:.2f} GB")

    # Overfitting check
    X_train_norm = X_scaler.transform(X_train)
    y_train_pred_norm = model.predict(X_train_norm)
    y_train_pred = y_scaler.inverse_transform(y_train_pred_norm.reshape(-1, 1)).flatten()
    r2_train = r2_score(y_train, y_train_pred)
    r2_diff = r2_train - r2

    print("\n[CHECK] Overfitting Check:")
    print(f"   Train R²: {r2_train:.4f}")
    print(f"   Test R²: {r2:.4f}")
    print(f"   Difference: {r2_diff:.4f}")

    if r2_diff > 0.01:
        print("   [WARN] Possible overfitting detected!")
    else:
        print("   [OK] Good generalization")

    # Check if perfect score is legitimate
    if r2 >= 0.999:
        print(f"\n[NOTE] Perfect/near-perfect score (R²={r2:.4f})")
        print("   This could indicate:")
        print("   - Very predictable feature relationships")
        print("   - Possible data leakage (check features)")
        print("   - Overfitting (monitor real-world performance)")


def validate_battery_model():
    """Validate battery prediction model"""
    print("\n" + "="*80)
    print("VALIDATING BATTERY PREDICTION MODEL")
    print("="*80)

    data = load_and_preprocess_data()
    company_encoded, unique_companies = encode_companies(data['companies'])
    processor_encoded = encode_processors(data.get('processors', ['Unknown'] * len(data['companies'])))
    X = create_engineered_features(data, company_encoded, processor_encoded)
    y = data['battery']

    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.3, random_state=42
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42
    )

    model, scalers, metadata = load_model('battery_predictor')
    if model is None:
        print("[ERROR] Model not found!")
        return

    X_scaler = scalers['X_scaler']
    y_scaler = scalers['y_scaler']
    X_test_norm = X_scaler.transform(X_test)

    y_pred_norm = model.predict(X_test_norm)
    y_pred = y_scaler.inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()

    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)

    import logging
    log = logging.getLogger("python_api")
    log.info("\n[STATS] Test Set Performance:")
    log.info("   R² Score: %.4f", r2)
    log.info("   RMSE: %.2f mAh", rmse)
    log.info("   MAE: %.2f mAh", mae)

    # Overfitting check
    X_train_norm = X_scaler.transform(X_train)
    y_train_pred_norm = model.predict(X_train_norm)
    y_train_pred = y_scaler.inverse_transform(y_train_pred_norm.reshape(-1, 1)).flatten()
    r2_train = r2_score(y_train, y_train_pred)
    r2_diff = r2_train - r2

    log.info("\n[CHECK] Overfitting Check:")
    log.info("   Train R²: %.4f", r2_train)
    log.info("   Test R²: %.4f", r2)
    log.info("   Difference: %.4f", r2_diff)

    if r2_diff > 0.01:
        log.warning("   [WARN] Possible overfitting detected!")
    else:
        log.info("   [OK] Good generalization")


def validate_brand_model():
    """Validate brand classification model"""
    print("\n" + "="*80)
    print("VALIDATING BRAND CLASSIFICATION MODEL")
    print("="*80)

    data = load_and_preprocess_data()
    company_encoded, unique_companies = encode_companies(data['companies'])
    processor_encoded = encode_processors(data.get('processors', ['Unknown'] * len(data['companies'])))
    X = create_engineered_features(data, company_encoded, processor_encoded)
    y = np.array(data['companies'])

    # Filter brands with < 4 samples (same as training)
    from collections import Counter
    brand_counts = Counter(y)
    min_samples = 4
    valid_brands = [brand for brand, count in brand_counts.items() if count >= min_samples]
    valid_mask = np.array([brand in valid_brands for brand in y])
    X = X[valid_mask]
    y = y[valid_mask]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )

    model, scalers, metadata = load_model('brand_classifier')
    if model is None:
        print("[ERROR] Model not found!")
        return

    X_scaler = scalers['X_scaler']
    X_test_norm = X_scaler.transform(X_test)

    y_pred_idx = model.predict(X_test_norm)

    # Map predictions back to brand names
    unique_brands = metadata.get('unique_brands', valid_brands)
    y_pred = np.array([unique_brands[int(idx)] for idx in y_pred_idx])

    accuracy = accuracy_score(y_test, y_pred)

    print("\n[STATS] Test Set Performance:")
    print(f"   Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")

    # Overfitting check
    X_train_norm = X_scaler.transform(X_train)
    y_train_pred_idx = model.predict(X_train_norm)
    y_train_pred = np.array([unique_brands[int(idx)] for idx in y_train_pred_idx])
    train_accuracy = accuracy_score(y_train, y_train_pred)
    acc_diff = train_accuracy - accuracy

    print("\n[CHECK] Overfitting Check:")
    print(f"   Train Accuracy: {train_accuracy:.4f} ({train_accuracy*100:.2f}%)")
    print(f"   Test Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"   Difference: {acc_diff:.4f}")

    if acc_diff > 0.05:
        print("   [WARN] Possible overfitting detected!")
    elif accuracy >= 0.99:
        print("   [NOTE] Perfect/near-perfect accuracy")
        print("   Monitor real-world performance for generalization")
    else:
        print("   [OK] Good generalization")

    # Confusion matrix for misclassifications
    from sklearn.metrics import confusion_matrix
    cm = confusion_matrix(y_test, y_pred, labels=unique_brands)
    misclassified = np.sum(cm) - np.trace(cm)
    print(f"\n[MISC] Misclassifications: {misclassified} out of {len(y_test)} ({misclassified/len(y_test)*100:.2f}%)")


def main():
    """Run all validations"""
    print("="*80)
    print("MODEL VALIDATION - Testing for Overfitting")
    print("="*80)
    print("\nThis script validates trained models on test data")
    print("and checks for potential overfitting issues.\n")

    validate_price_model()
    validate_ram_model()
    validate_battery_model()
    validate_brand_model()

    print("\n" + "="*80)
    print("VALIDATION COMPLETE")
    print("="*80)
    print("\n[RECOMMENDATIONS]")
    print("   1. Monitor real-world prediction errors")
    print("   2. Retrain periodically with new data")
    print("   3. Track prediction accuracy over time")
    print("   4. If overfitting detected, consider regularization")


if __name__ == "__main__":
    main()
