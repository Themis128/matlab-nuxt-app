#!/usr/bin/env python3
"""
Test script to check the advanced models used in the Vue page
"""

import os
import pickle
import sys
from pathlib import Path

# Add current directory to path
sys.path.append('.')

def test_advanced_models():
    """Test the models used in advanced.vue"""
    models_dir = Path("python_api/trained_models")

    if not models_dir.exists():
        print("❌ Models directory not found")
        return

    # Models used in advanced.vue page
    advanced_models = {
        'sklearn_price': 'price_predictor_sklearn.pkl',
        'price_eur': 'price_eur_model.pkl',
        'price_inr': 'price_inr_model.pkl',
    }

    print("🔍 Testing Advanced Models...")
    print("=" * 50)

    results = {}

    for model_name, model_file in advanced_models.items():
        model_path = models_dir / model_file

        print(f"\n🧪 Testing {model_name} ({model_file})")
        print("-" * 40)

        if not model_path.exists():
            print(f"❌ File not found: {model_file}")
            results[model_name] = {"status": "not_found"}
            continue

        try:
            print(f"📂 Loading model from {model_path}")
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            print("✅ Model loaded successfully")

            # Check if it has predict method
            if hasattr(model, 'predict'):
                print("✅ Has predict method")
                results[model_name] = {"status": "working"}
            else:
                print("❌ Missing predict method")
                results[model_name] = {"status": "no_predict"}

            # Try to get model info
            print(f"📊 Model type: {type(model)}")

            # Test with sample data
            print("🧪 Testing prediction with sample data...")
            sample_features = [
                8.0,    # ram
                4500.0, # battery
                6.5,    # screen
                180.0,  # weight
                2023,   # year
                1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,  # company encoding
                0.0, 0.0, 0.0, 0.0, 1.0  # processor encoding (apple)
            ]

            # Load scaler if available
            scaler_file = f"{model_name}_scaler.pkl"
            scaler_path = models_dir / scaler_file
            if scaler_path.exists():
                print(f"📏 Loading scaler: {scaler_file}")
                with open(scaler_path, 'rb') as f:
                    scaler = pickle.load(f)
                print("✅ Scaler loaded")
            else:
                print(f"⚠️  No scaler found: {scaler_file}")
                scaler = None

            # Prepare features
            import numpy as np
            X = np.array(sample_features).reshape(1, -1)

            if scaler:
                X_scaled = scaler.transform(X)
                print("✅ Features scaled")
            else:
                X_scaled = X
                print("⚠️  Using unscaled features")

            # Make prediction
            prediction = model.predict(X_scaled)
            if isinstance(prediction, np.ndarray):
                predicted_price = float(prediction[0])
            else:
                predicted_price = float(prediction)

            print(f"💰 Sample prediction: ${predicted_price:.2f}")
            print("✅ Prediction successful!")

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            results[model_name] = {"status": "error", "error": str(e)}

    # Summary
    print("\n🎯 SUMMARY:")
    print("=" * 50)

    working = 0
    failed = 0

    for model_name, result in results.items():
        status = result["status"]
        if status == "working":
            print(f"✅ {model_name} - WORKING")
            working += 1
        else:
            print(f"❌ {model_name} - FAILED ({status})")
            if "error" in result:
                print(f"   Error: {result['error']}")
            failed += 1

    print(f"\n📊 Results: {working} working, {failed} failed")

    if working == 3:
        print("🎉 All advanced models are working correctly!")
    else:
        print("⚠️  Some models need attention")

    return results

if __name__ == "__main__":
    test_advanced_models()
