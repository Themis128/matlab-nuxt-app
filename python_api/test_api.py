"""
Quick test script for the prediction API
"""

import requests
import json

API_URL = "http://localhost:8000"

def test_price_prediction():
    """Test price prediction endpoint"""
    print("Testing Price Prediction...")
    response = requests.post(
        f"{API_URL}/api/predict/price",
        json={
            "ram": 8,
            "battery": 4000,
            "screen": 6.1,
            "weight": 174,
            "year": 2024,
            "company": "Apple"
        }
    )
    if response.status_code == 200:
        result = response.json()
        print(f"  ✓ Predicted Price: ${result['price']}")
        return True
    else:
        print(f"  [ERROR] Error: {response.status_code} - {response.text}")
        return False

def test_ram_prediction():
    """Test RAM prediction endpoint"""
    print("Testing RAM Prediction...")
    response = requests.post(
        f"{API_URL}/api/predict/ram",
        json={
            "battery": 4000,
            "screen": 6.1,
            "weight": 174,
            "year": 2024,
            "price": 999,
            "company": "Apple"
        }
    )
    if response.status_code == 200:
        result = response.json()
        print(f"  ✓ Predicted RAM: {result['ram']} GB")
        return True
    else:
        print(f"  [ERROR] Error: {response.status_code} - {response.text}")
        return False

def test_battery_prediction():
    """Test battery prediction endpoint"""
    print("Testing Battery Prediction...")
    response = requests.post(
        f"{API_URL}/api/predict/battery",
        json={
            "ram": 8,
            "screen": 6.1,
            "weight": 174,
            "year": 2024,
            "price": 999,
            "company": "Apple"
        }
    )
    if response.status_code == 200:
        result = response.json()
        print(f"  ✓ Predicted Battery: {result['battery']} mAh")
        return True
    else:
        print(f"  [ERROR] Error: {response.status_code} - {response.text}")
        return False

def test_brand_prediction():
    """Test brand prediction endpoint"""
    print("Testing Brand Prediction...")
    response = requests.post(
        f"{API_URL}/api/predict/brand",
        json={
            "ram": 8,
            "battery": 4000,
            "screen": 6.1,
            "weight": 174,
            "year": 2024,
            "price": 999
        }
    )
    if response.status_code == 200:
        result = response.json()
        print(f"  ✓ Predicted Brand: {result['brand']}")
        return True
    else:
        print(f"  [ERROR] Error: {response.status_code} - {response.text}")
        return False

def test_health():
    """Test health endpoint"""
    print("Testing Health Endpoint...")
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200:
            print(f"  ✓ API is healthy: {response.json()}")
            return True
        else:
            print(f"  [ERROR] Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"  [ERROR] Cannot connect to API. Is it running on {API_URL}?")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Python API Test Suite")
    print("=" * 60)
    print()

    # Test health first
    if not test_health():
        print("\n⚠ API is not running. Start it with: python api.py")
        exit(1)

    print()

    # Test all endpoints
    results = []
    results.append(("Health", test_health()))
    results.append(("Price", test_price_prediction()))
    results.append(("RAM", test_ram_prediction()))
    results.append(("Battery", test_battery_prediction()))
    results.append(("Brand", test_brand_prediction()))

    print()
    print("=" * 60)
    print("Test Results:")
    print("=" * 60)
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {name}: {status}")

    all_passed = all(result for _, result in results)
    if all_passed:
        print("\n✓ All tests passed!")
    else:
        print("\n⚠ Some tests failed. Check the output above.")

    print("=" * 60)
