#!/usr/bin/env python3
"""
Pre-start Model Validation Script
Validates model files before starting the API server in CI/CD environments
"""

import sys
import os
from pathlib import Path

# Add python_api to path
sys.path.insert(0, str(Path(__file__).parent.parent / "python_api"))

from model_utils import safe_load_model, get_model_info

# Model files to validate
MODELS_TO_CHECK = [
    "python_api/trained_models/price_predictor_sklearn.pkl",
    "python_api/trained_models/ram_predictor_sklearn.pkl",
    "python_api/trained_models/battery_predictor_sklearn.pkl",
    "python_api/trained_models/brand_classifier_sklearn.pkl",
    "python_api/trained_models/distilled_price_model.pkl"
]

# Optional models (don't fail if missing)
OPTIONAL_MODELS = [
    "python_api/trained_models/ensemble_stacking_model.pkl",
    "python_api/trained_models/xgboost_conservative.pkl"
]


def check_model_file(model_path):
    """Check a single model file and return status"""
    print(f"Checking model: {model_path}")

    try:
        # Get basic file info
        info = get_model_info(model_path)

        if "error" in info:
            if "File not found" in info["error"]:
                print(f"  ❌ MISSING: {model_path}")
                return False
            else:
                print(f"  ❌ ERROR: {info['error']}")
                return False

        # File exists, show info
        print(f"  📁 Size: {info['size_mb']} MB")
        print(f"  🔍 Valid pickle: {info['appears_valid_pickle']}")

        if info['appears_valid_pickle']:
            protocol = info.get('pickle_protocol', 'unknown')
            print(f"  📋 Protocol: {protocol}")
        else:
            print(f"  ❌ WARNING: Does not appear to be a valid pickle file")
            return False

        # Try to load the model
        safe_load_model(model_path)
        print("  ✅ SUCCESS: Model loaded successfully")
        return True

    except Exception as e:
        print(f"  ❌ FAILED: {e}")
        return False


def main():
    """Main validation function"""
    print("=" * 80)
    print("MODEL VALIDATION - Pre-Start Check")
    print("=" * 80)
    print(f"Validating {len(MODELS_TO_CHECK)} required model files...")
    print()

    all_passed = True
    checked_count = 0

    # Check required models
    for model_path in MODELS_TO_CHECK:
        checked_count += 1
        if not check_model_file(model_path):
            all_passed = False
        print()

    # Check optional models (don't fail deployment)
    if OPTIONAL_MODELS:
        print(f"Checking {len(OPTIONAL_MODELS)} optional model files...")
        print("(These won't fail the deployment if missing)")
        print()

        for model_path in OPTIONAL_MODELS:
            check_model_file(model_path)
            print()

    print("=" * 80)
    print("VALIDATION SUMMARY")
    print("=" * 80)
    print(f"Models checked: {checked_count}")
    print(f"All required models valid: {'✅ YES' if all_passed else '❌ NO'}")

    if all_passed:
        print()
        print("🎉 All required models are valid!")
        print("API server can start safely.")
        return 0
    else:
        print()
        print("❌ Some required models are invalid or missing!")
        print("Check the output above for details.")
        print("API server may not work correctly.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
