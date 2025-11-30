"""
Test script to verify enhanced features are working
"""
import requests

API_URL = "http://localhost:8000"

print("=" * 60)
print("Testing Enhanced Features")
print("=" * 60)

# Test 1: Without enhanced features
print("\n1. Testing WITHOUT enhanced features:")
response1 = requests.post(
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
if response1.status_code == 200:
    result1 = response1.json()
    print(f"   Price: ${result1['price']:,.2f}")
else:
    print(f"   Error: {response1.status_code} - {response1.text}")

# Test 2: With enhanced features
print("\n2. Testing WITH enhanced features:")
response2 = requests.post(
    f"{API_URL}/api/predict/price",
    json={
        "ram": 8,
        "battery": 4000,
        "screen": 6.1,
        "weight": 174,
        "year": 2024,
        "company": "Apple",
        "front_camera": 12,
        "back_camera": 48,
        "processor": "A17 Bionic",
        "storage": 512
    }
)
if response2.status_code == 200:
    result2 = response2.json()
    print(f"   Price: ${result2['price']:,.2f}")
    if result1 and result2:
        diff = abs(result2['price'] - result1['price'])
        print(f"   Difference: ${diff:,.2f}")
        if diff < 1:
            print("   [WARNING] Enhanced features don't seem to affect prediction!")
            print("   -> The API might need to be restarted to load new models")
        else:
            print("   ✓ Enhanced features are working!")
else:
    print(f"   Error: {response2.status_code} - {response2.text}")

print("\n" + "=" * 60)
print("If both predictions are identical, restart the Python API:")
print("  1. Stop the API (Ctrl+C)")
print("  2. Restart: cd python_api && ..\\venv\\Scripts\\activate && python api.py")
print("=" * 60)
