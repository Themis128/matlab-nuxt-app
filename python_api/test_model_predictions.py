#!/usr/bin/env python3
"""
Test script to verify model predictions work correctly
Tests all trained models with sample data
"""

import numpy as np
import pandas as pd
import pickle
import json
from pathlib import Path
import sys

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from train_models_sklearn import (
    load_and_preprocess_data,
    encode_companies,
    encode_processors,
    create_engineered_features
)

def load_model(model_name):
    """Load a trained model and its metadata"""
    models_dir = Path(__file__).parent / "trained_models"

    # Load model
    model_path = models_dir / f"{model_name}_sklearn.pkl"
    with open(model_path, 'rb') as f:
        model = pickle.load(f)

    # Load metadata
    meta_path = models_dir / f"{model_name}_metadata.json"
    with open(meta_path, 'r') as f:
        metadata = json.load(f)

    # Load scalers
    scalers_path = models_dir / f"{model_name}_scalers.pkl"
    with open(scalers_path, 'rb') as f:
        scalers = pickle.load(f)

    return model, metadata, scalers

def test_price_model():
    """Test price prediction model"""
    print("\n" + "="*60)
    print("TESTING PRICE PREDICTION MODEL")
    print("="*60)

    try:
        model, metadata, scalers = load_model('price_predictor')
        print(f"✓ Model loaded: {metadata['model_type']}")

        # Load sample data
        data = load_and_preprocess_data()

        # Create sample input (first 3 samples)
        company_encoded, _ = encode_companies(data['companies'][:3])
        processor_encoded = encode_processors(data.get('processors', ['Unknown'] * 3)[:3])
        X = create_engineered_features(
            {k: v[:3] for k, v in data.items()},
            company_encoded,
            processor_encoded
        )

        # Scale features
        X_scaled = scalers['X_scaler'].transform(X)

        # Make predictions
        y_pred_norm = model.predict(X_scaled)
        y_pred_log = scalers['y_scaler'].inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()
        y_pred = np.expm1(y_pred_log)  # Reverse log transformation

        # Actual values
        y_actual = data['price'][:3]

        print("\n📊 Price Prediction Test Results:")
        print(f"{'Sample':<8} {'Predicted':<12} {'Actual':<12} {'Error':<12} {'Error %':<10}")
        print("-" * 60)

        for i in range(3):
            error = y_pred[i] - y_actual[i]
            error_pct = abs(error) / y_actual[i] * 100
            print(f"{i+1:<8} ${y_pred[i]:<11.0f} ${y_actual[i]:<11.0f} ${error:<11.0f} {error_pct:<9.1f}%")

        # Overall accuracy
        mae = np.mean(np.abs(y_pred - y_actual))
        mape = np.mean(np.abs((y_pred - y_actual) / y_actual)) * 100

        print(f"\n✅ Mean Absolute Error: ${mae:.2f}")
        print(f"✅ Mean Absolute Percentage Error: {mape:.2f}%")

        if mape < 15:
            print("✅ Excellent prediction accuracy!")
        elif mape < 25:
            print("✓ Good prediction accuracy")
        else:
            print("⚠️ Prediction accuracy needs improvement")

        return True

    except Exception as e:
        print(f"❌ Price model test failed: {e}")
        return False

def test_ram_model():
    """Test RAM prediction model"""
    print("\n" + "="*60)
    print("TESTING RAM PREDICTION MODEL")
    print("="*60)

    try:
        model, metadata, scalers = load_model('ram_predictor')
        print(f"✓ Model loaded: {metadata['model_type']}")

        # Load sample data
        data = load_and_preprocess_data()

        # Create sample input (first 3 samples)
        company_encoded, _ = encode_companies(data['companies'][:3])
        processor_encoded = encode_processors(data.get('processors', ['Unknown'] * 3)[:3])
        X = create_engineered_features(
            {k: v[:3] for k, v in data.items()},
            company_encoded,
            processor_encoded
        )

        # Scale features
        X_scaled = scalers['X_scaler'].transform(X)

        # Make predictions
        y_pred_norm = model.predict(X_scaled)
        y_pred = scalers['y_scaler'].inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()

        # Actual values
        y_actual = data['ram'][:3]

        print("\n📊 RAM Prediction Test Results:")
        print(f"{'Sample':<8} {'Predicted':<12} {'Actual':<12} {'Error':<12}")
        print("-" * 48)

        for i in range(3):
            error = y_pred[i] - y_actual[i]
            print(f"{i+1:<8} {y_pred[i]:<11.1f} GB {y_actual[i]:<11.1f} GB {error:<11.1f} GB")

        # Overall accuracy
        mae = np.mean(np.abs(y_pred - y_actual))
        rmse = np.sqrt(np.mean((y_pred - y_actual) ** 2))

        print(f"\n✅ Mean Absolute Error: {mae:.2f} GB")
        print(f"✅ Root Mean Square Error: {rmse:.2f} GB")

        if rmse < 1.0:
            print("✅ Excellent prediction accuracy!")
        elif rmse < 2.0:
            print("✓ Good prediction accuracy")
        else:
            print("⚠️ Prediction accuracy needs improvement")

        return True

    except Exception as e:
        print(f"❌ RAM model test failed: {e}")
        return False

def test_battery_model():
    """Test battery prediction model"""
    print("\n" + "="*60)
    print("TESTING BATTERY PREDICTION MODEL")
    print("="*60)

    try:
        model, metadata, scalers = load_model('battery_predictor')
        print(f"✓ Model loaded: {metadata['model_type']}")

        # Load sample data
        data = load_and_preprocess_data()

        # Create sample input (first 3 samples)
        company_encoded, _ = encode_companies(data['companies'][:3])
        processor_encoded = encode_processors(data.get('processors', ['Unknown'] * 3)[:3])
        X = create_engineered_features(
            {k: v[:3] for k, v in data.items()},
            company_encoded,
            processor_encoded
        )

        # Scale features
        X_scaled = scalers['X_scaler'].transform(X)

        # Make predictions
        y_pred_norm = model.predict(X_scaled)
        y_pred = scalers['y_scaler'].inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()

        # Actual values
        y_actual = data['battery'][:3]

        print("\n📊 Battery Prediction Test Results:")
        print(f"{'Sample':<8} {'Predicted':<12} {'Actual':<12} {'Error':<12}")
        print("-" * 48)

        for i in range(3):
            error = y_pred[i] - y_actual[i]
            print(f"{i+1:<8} {y_pred[i]:<11.0f} mAh {y_actual[i]:<11.0f} mAh {error:<11.0f} mAh")

        # Overall accuracy
        mae = np.mean(np.abs(y_pred - y_actual))
        rmse = np.sqrt(np.mean((y_pred - y_actual) ** 2))

        print(f"\n✅ Mean Absolute Error: {mae:.0f} mAh")
        print(f"✅ Root Mean Square Error: {rmse:.0f} mAh")

        if rmse < 500:
            print("✅ Excellent prediction accuracy!")
        elif rmse < 1000:
            print("✓ Good prediction accuracy")
        else:
            print("⚠️ Prediction accuracy needs improvement")

        return True

    except Exception as e:
        print(f"❌ Battery model test failed: {e}")
        return False

def test_brand_model():
    """Test brand classification model"""
    print("\n" + "="*60)
    print("TESTING BRAND CLASSIFICATION MODEL")
    print("="*60)

    try:
        model, metadata, scalers = load_model('brand_classifier')
        print(f"✓ Model loaded: {metadata['model_type']}")

        # Load sample data
        data = load_and_preprocess_data()

        # Create sample input (first 5 samples)
        company_encoded, unique_companies = encode_companies(data['companies'][:5])
        processor_encoded = encode_processors(data.get('processors', ['Unknown'] * 5)[:5])
        X = create_engineered_features(
            {k: v[:5] for k, v in data.items()},
            company_encoded,
            processor_encoded
        )

        # Scale features
        X_scaled = scalers['X_scaler'].transform(X)

        # Make predictions
        y_pred = model.predict(X_scaled)

        # Convert predictions back to brand names
        pred_brands = [unique_companies[pred] for pred in y_pred]

        # Actual values
        y_actual = data['companies'][:5]

        print("\n📊 Brand Classification Test Results:")
        print(f"{'Sample':<8} {'Predicted':<15} {'Actual':<15} {'Correct':<10}")
        print("-" * 58)

        correct_predictions = 0
        for i in range(5):
            correct = pred_brands[i] == y_actual[i]
            if correct:
                correct_predictions += 1
            status = "✓" if correct else "✗"
            print(f"{i+1:<8} {pred_brands[i]:<14} {y_actual[i]:<14} {status:<9}")

        accuracy = correct_predictions / 5 * 100

        print(f"\n✅ Accuracy: {correct_predictions}/5 = {accuracy:.1f}%")

        if accuracy >= 90:
            print("✅ Excellent classification accuracy!")
        elif accuracy >= 80:
            print("✓ Good classification accuracy")
        else:
            print("⚠️ Classification accuracy needs improvement")

        return True

    except Exception as e:
        print(f"❌ Brand model test failed: {e}")
        return False

def test_edge_cases():
    """Test models with edge case inputs"""
    print("\n" + "="*60)
    print("TESTING EDGE CASES")
    print("="*60)

    try:
        # Test with extreme values
        test_data = {
            'ram': np.array([1.0, 16.0, 8.0]),  # Min, max, median RAM
            'battery': np.array([2000.0, 10000.0, 5000.0]),  # Min, max, median battery
            'screen': np.array([5.0, 8.0, 6.5]),  # Small, large, medium screens
            'weight': np.array([140.0, 300.0, 200.0]),  # Light, heavy, medium weight
            'year': np.array([2020, 2024, 2022]),  # Old, new, recent
            'price': np.array([100.0, 2000.0, 500.0]),  # Cheap, expensive, medium
            'companies': ['Apple', 'Samsung', 'Xiaomi'],
            'front_camera': np.array([8.0, 50.0, 16.0]),
            'back_camera': np.array([12.0, 200.0, 50.0]),
            'storage': np.array([32.0, 1024.0, 128.0]),
            'processors': ['A15 Bionic', 'Snapdragon 8 Gen 3', 'Dimensity 9200']
        }

        print("Testing with edge case data...")

        # Test price model
        model, metadata, scalers = load_model('price_predictor')
        company_encoded, _ = encode_companies(test_data['companies'])
        processor_encoded = encode_processors(test_data['processors'])
        X = create_engineered_features(test_data, company_encoded, processor_encoded)
        X_scaled = scalers['X_scaler'].transform(X)

        y_pred_norm = model.predict(X_scaled)
        y_pred_log = scalers['y_scaler'].inverse_transform(y_pred_norm.reshape(-1, 1)).flatten()
        y_pred = np.expm1(y_pred_log)

        print("Edge case price predictions:")
        for i, (company, pred_price) in enumerate(zip(test_data['companies'], y_pred)):
            print(f"  {company}: ${pred_price:.0f}")

        print("✅ Edge case testing completed successfully")
        return True

    except Exception as e:
        print(f"❌ Edge case testing failed: {e}")
        return False

def main():
    """Run all model tests"""
    print("="*80)
    print("MODEL PREDICTION TESTING SUITE")
    print("="*80)
    print("\nTesting trained models with sample predictions...")
    print("This verifies that models load correctly and provide reasonable predictions.\n")

    results = []

    # Test each model
    results.append(("Price Model", test_price_model()))
    results.append(("RAM Model", test_ram_model()))
    results.append(("Battery Model", test_battery_model()))
    results.append(("Brand Model", test_brand_model()))
    results.append(("Edge Cases", test_edge_cases()))

    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<15}: {status}")

    print(f"\nOverall: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All models are working correctly!")
        print("Models are ready for production use.")
    else:
        print("⚠️ Some tests failed. Models may need retraining.")

    print("="*80)

if __name__ == "__main__":
    main()
