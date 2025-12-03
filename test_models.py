#!/usr/bin/env python3
"""
Test script to check which trained models can be loaded and work properly
"""

import os
import pickle
import sys
from pathlib import Path

# Add current directory to path
sys.path.append('.')

def test_model_loading():
    """Test loading all available models"""
    models_dir = Path("python_api/trained_models")

    if not models_dir.exists():
        print("❌ Models directory not found")
        return

    # Models to test with their expected types
    models_to_test = {
        # Price prediction models
        'price_predictor_sklearn.pkl': 'sklearn',
        'distilled_price_model.pkl': 'distilled',
        'ensemble_stacking_model.pkl': 'ensemble',
        'clean_ensemble_model.pkl': 'ensemble',
        'price_eur_model.pkl': 'currency_eur',
        'price_inr_model.pkl': 'currency_inr',
        'price_usd_model.pkl': 'currency_usd',

        # XGBoost models
        'xgboost_conservative.pkl': 'xgboost',
        'xgboost_aggressive.pkl': 'xgboost',
        'xgboost_deep.pkl': 'xgboost',

        # Other predictors
        'ram_predictor_sklearn.pkl': 'sklearn',
        'battery_predictor_sklearn.pkl': 'sklearn',
        'brand_classifier_sklearn.pkl': 'sklearn',
    }

    results = {}

    for model_file, model_type in models_to_test.items():
        model_path = models_dir / model_file
        if not model_path.exists():
            results[model_file] = {"status": "not_found", "type": model_type}
            continue

        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)

            # Test basic model interface
            if hasattr(model, 'predict'):
                results[model_file] = {
                    "status": "loaded",
                    "type": model_type,
                    "has_predict": True
                }
            else:
                results[model_file] = {
                    "status": "loaded_no_predict",
                    "type": model_type,
                    "has_predict": False
                }

        except Exception as e:
            results[model_file] = {
                "status": "error",
                "type": model_type,
                "error": str(e)
            }

    return results

def test_scalers():
    """Test loading scalers"""
    models_dir = Path("python_api/trained_models")
    scalers_to_test = [
        'price_predictor_scalers.pkl',
        'xgboost_scaler.pkl',
        'price_eur_scaler.pkl',
        'price_inr_scaler.pkl',
        'price_usd_scaler.pkl',
        'ram_predictor_scalers.pkl',
        'battery_predictor_scalers.pkl',
        'brand_classifier_scalers.pkl',
    ]

    results = {}

    for scaler_file in scalers_to_test:
        scaler_path = models_dir / scaler_file
        if not scaler_path.exists():
            results[scaler_file] = {"status": "not_found"}
            continue

        try:
            with open(scaler_path, 'rb') as f:
                scaler = pickle.load(f)

            # Check if it has transform method
            if hasattr(scaler, 'transform'):
                results[scaler_file] = {"status": "loaded"}
            else:
                results[scaler_file] = {"status": "loaded_no_transform"}

        except Exception as e:
            results[scaler_file] = {"status": "error", "error": str(e)}

    return results

def main():
    print("🔍 Testing Model Loading...")
    print("=" * 50)

    # Test models
    model_results = test_model_loading()

    print("\n📊 MODEL LOADING RESULTS:")
    print("-" * 30)

    working_models = []
    failed_models = []

    for model_file, result in model_results.items():
        status = result["status"]
        model_type = result["type"]

        if status == "loaded":
            print(f"✅ {model_file} ({model_type}) - LOADED")
            working_models.append((model_file, model_type))
        elif status == "not_found":
            print(f"❌ {model_file} ({model_type}) - NOT FOUND")
            failed_models.append((model_file, model_type, "not found"))
        elif status == "error":
            error_msg = result.get("error", "unknown error")
            print(f"❌ {model_file} ({model_type}) - ERROR: {error_msg}")
            failed_models.append((model_file, model_type, error_msg))
        else:
            print(f"⚠️  {model_file} ({model_type}) - {status.upper()}")

    print(f"\n✅ Working models: {len(working_models)}")
    print(f"❌ Failed models: {len(failed_models)}")

    # Test scalers
    print("\n📏 SCALER LOADING RESULTS:")
    print("-" * 30)

    scaler_results = test_scalers()
    working_scalers = 0

    for scaler_file, result in scaler_results.items():
        status = result["status"]

        if status == "loaded":
            print(f"✅ {scaler_file} - LOADED")
            working_scalers += 1
        elif status == "not_found":
            print(f"❌ {scaler_file} - NOT FOUND")
        else:
            error_msg = result.get("error", "unknown error")
            print(f"❌ {scaler_file} - ERROR: {error_msg}")

    print(f"\n✅ Working scalers: {working_scalers}")

    # Summary
    print("\n🎯 SUMMARY:")
    print("-" * 20)
    print(f"Models that can be used: {len(working_models)}")
    print(f"Scalers available: {working_scalers}")

    if working_models:
        print("\n🚀 RECOMMENDED MODELS TO USE:")
        for model_file, model_type in working_models:
            print(f"  • {model_file} ({model_type})")

    if failed_models:
        print("\n❌ MODELS NEEDING FIXES:")
        for model_file, model_type, error in failed_models[:5]:  # Show first 5
            print(f"  • {model_file} ({model_type}) - {error}")
        if len(failed_models) > 5:
            print(f"  ... and {len(failed_models) - 5} more")

if __name__ == "__main__":
    main()
