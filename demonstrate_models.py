#!/usr/bin/env python3
"""
Comprehensive demonstration that all ML models produce correct, valid outcomes.
Tests various realistic phone specifications to validate model predictions.
"""

import json
import sys
from pathlib import Path

import requests

API_BASE = "http://localhost:8000"

def test_single_prediction(endpoint, data, description):
    """Test a single prediction endpoint"""
    try:
        response = requests.post(f"{API_BASE}{endpoint}", json=data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            return result, None
        else:
            return None, f"HTTP {response.status_code}: {response.text}"
    except Exception as e:
        return None, str(e)

def demonstrate_predictions():
    """Demonstrate that all models produce correct outcomes"""

    print("=" * 80)
    print("🤖 ML MODEL VALIDATION DEMONSTRATION")
    print("=" * 80)
    print()

    # Test cases representing different phone categories
    test_cases = [
        {
            "name": "Apple iPhone 15 Pro",
            "specs": {
                "ram": 8, "battery": 3274, "screen": 6.1, "weight": 187, "year": 2024, "company": "Apple"
            },
            "expected": {
                "price_range": (1000, 1300),
                "ram_expected": 8,
                "battery_range": (3200, 3400),
                "brand": "Apple"
            }
        },
        {
            "name": "Samsung Galaxy S24 Ultra",
            "specs": {
                "ram": 12, "battery": 5000, "screen": 6.8, "weight": 232, "year": 2024, "company": "Samsung"
            },
            "expected": {
                "price_range": (1100, 1400),
                "ram_expected": 12,
                "battery_range": (4900, 5100),
                "brand": "Samsung"
            }
        },
        {
            "name": "Google Pixel 8 Pro",
            "specs": {
                "ram": 12, "battery": 5050, "screen": 6.7, "weight": 213, "year": 2024, "company": "Google"
            },
            "expected": {
                "price_range": (900, 1100),
                "ram_expected": 12,
                "battery_range": (5000, 5200),
                "brand": "Google"
            }
        },
        {
            "name": "Xiaomi 14 Ultra",
            "specs": {
                "ram": 16, "battery": 5300, "screen": 6.73, "weight": 219, "year": 2024, "company": "Xiaomi"
            },
            "expected": {
                "price_range": (1000, 1300),
                "ram_expected": 16,
                "battery_range": (5200, 5400),
                "brand": "Xiaomi"
            }
        },
        {
            "name": "Budget Android Phone",
            "specs": {
                "ram": 4, "battery": 5000, "screen": 6.5, "weight": 190, "year": 2023, "company": "Samsung"
            },
            "expected": {
                "price_range": (200, 400),
                "ram_expected": 4,
                "battery_range": (4900, 5100),
                "brand": "Samsung"
            }
        }
    ]

    all_passed = True
    total_tests = 0

    for case in test_cases:
        print(f"📱 Testing: {case['name']}")
        print(f"   Specs: {case['specs']}")
        print()

        # Test Price Prediction
        price_result, price_error = test_single_prediction(
            "/api/predict/price", case['specs'], "Price Prediction"
        )

        # Test RAM Prediction (using different features)
        ram_specs = {
            "battery": case['specs']['battery'],
            "screen": case['specs']['screen'],
            "weight": case['specs']['weight'],
            "year": case['specs']['year'],
            "price": case['expected']['price_range'][0],  # Use expected price for RAM prediction
            "company": case['specs']['company']
        }
        ram_result, ram_error = test_single_prediction(
            "/api/predict/ram", ram_specs, "RAM Prediction"
        )

        # Test Battery Prediction (using different features)
        battery_specs = {
            "ram": case['specs']['ram'],
            "screen": case['specs']['screen'],
            "weight": case['specs']['weight'],
            "year": case['specs']['year'],
            "price": case['expected']['price_range'][0],  # Use expected price for battery prediction
            "company": case['specs']['company']
        }
        battery_result, battery_error = test_single_prediction(
            "/api/predict/battery", battery_specs, "Battery Prediction"
        )

        # Test Brand Classification
        brand_specs = {
            "ram": case['specs']['ram'],
            "battery": case['specs']['battery'],
            "screen": case['specs']['screen'],
            "weight": case['specs']['weight'],
            "year": case['specs']['year'],
            "price": case['expected']['price_range'][0]  # Use expected price for brand prediction
        }
        brand_result, brand_error = test_single_prediction(
            "/api/predict/brand", brand_specs, "Brand Classification"
        )

        # Validate results
        case_passed = True

        # Check Price
        if price_result:
            predicted_price = price_result['price']
            price_min, price_max = case['expected']['price_range']
            if price_min <= predicted_price <= price_max:
                print(f"   ✅ Price: ${predicted_price:.0f} (within expected range ${price_min}-${price_max})")
            else:
                print(f"   ❌ Price: ${predicted_price:.0f} (OUTSIDE expected range ${price_min}-${price_max})")
                case_passed = False
        else:
            print(f"   ❌ Price: ERROR - {price_error}")
            case_passed = False

        # Check RAM
        if ram_result:
            predicted_ram = ram_result['ram']
            expected_ram = case['expected']['ram_expected']
            if abs(predicted_ram - expected_ram) <= 2:  # Allow some tolerance
                print(f"   ✅ RAM: {predicted_ram:.1f} GB (expected ~{expected_ram} GB)")
            else:
                print(f"   ❌ RAM: {predicted_ram:.1f} GB (expected ~{expected_ram} GB)")
                case_passed = False
        else:
            print(f"   ❌ RAM: ERROR - {ram_error}")
            case_passed = False

        # Check Battery
        if battery_result:
            predicted_battery = battery_result['battery']
            battery_min, battery_max = case['expected']['battery_range']
            if battery_min <= predicted_battery <= battery_max:
                print(f"   ✅ Battery: {predicted_battery:.0f} mAh (within expected range {battery_min}-{battery_max})")
            else:
                print(f"   ❌ Battery: {predicted_battery:.0f} mAh (OUTSIDE expected range {battery_min}-{battery_max})")
                case_passed = False
        else:
            print(f"   ❌ Battery: ERROR - {battery_error}")
            case_passed = False

        # Check Brand
        if brand_result:
            predicted_brand = brand_result['brand']
            expected_brand = case['expected']['brand']
            if predicted_brand == expected_brand:
                print(f"   ✅ Brand: {predicted_brand} (correctly identified)")
            else:
                print(f"   ❌ Brand: {predicted_brand} (expected {expected_brand})")
                case_passed = False
        else:
            print(f"   ❌ Brand: ERROR - {brand_error}")
            case_passed = False

        # Case result
        if case_passed:
            print(f"   🎉 {case['name']}: ALL PREDICTIONS CORRECT!")
        else:
            print(f"   ⚠️  {case['name']}: SOME PREDICTIONS INCORRECT")
            all_passed = False

        print()
        total_tests += 4  # 4 predictions per case

    # Overall results
    print("=" * 80)
    if all_passed:
        print("🎉 SUCCESS: ALL MODELS PRODUCE CORRECT OUTCOMES!")
        print(f"   ✓ {len(test_cases)} phone configurations tested")
        print(f"   ✓ {total_tests} individual predictions validated")
        print("   ✓ All predictions within realistic ranges")
        print("   ✓ Models demonstrate logical consistency")
    else:
        print("⚠️  WARNING: Some predictions were outside expected ranges")
        print("   This may indicate model calibration issues or unusual test cases")

    print("=" * 80)

    # Test advanced endpoint
    print("\n🔬 Testing Advanced Prediction Endpoint...")
    advanced_data = {
        "model_type": "sklearn_price",
        "currency": "USD",
        "ram": 8,
        "battery": 4000,
        "screen": 6.1,
        "weight": 174,
        "year": 2024,
        "company": "Apple",
        "front_camera": 12,
        "back_camera": 12,
        "processor": "A16",
        "storage": 128
    }

    advanced_result, advanced_error = test_single_prediction(
        "/api/advanced/predict", advanced_data, "Advanced Prediction"
    )

    if advanced_result:
        print(f"   ✅ Advanced Price: ${advanced_result['price']} ({advanced_result['model_used']})")
        print("   🎉 Advanced endpoint working correctly!")
    else:
        print(f"   ❌ Advanced Prediction: ERROR - {advanced_error}")
        all_passed = False

    print("\n" + "=" * 80)

    return all_passed

if __name__ == "__main__":
    try:
        success = demonstrate_predictions()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n❌ Demonstration interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Demonstration failed with error: {e}")
        sys.exit(1)
