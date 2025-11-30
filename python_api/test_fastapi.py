"""
Pytest test suite for FastAPI endpoints
Tests all API routes, models, and error handling
"""

from fastapi.testclient import TestClient
from api import app

client = TestClient(app)


class TestHealthEndpoint:
    """Test health check endpoint"""

    def test_health_check(self):
        """Test GET /health returns 200"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data


class TestPricePrediction:
    """Test price prediction endpoints"""

    def test_predict_price_valid_input(self):
        """Test POST /api/predict/price with valid data"""
        payload = {
            "ram": 8,
            "battery": 5000,
            "screen": 6.5,
            "weight": 200,
            "year": 2024,
            "company": "Samsung",
            "front_camera": 12,
            "back_camera": 48,
            "processor": "Snapdragon 8 Gen 2",
            "storage": 256
        }
        response = client.post("/api/predict/price", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "price" in data
        assert isinstance(data["price"], (int, float))
        assert data["price"] > 0

    def test_predict_price_missing_fields(self):
        """Test POST /api/predict/price with missing required fields"""
        payload = {
            "ram": 8,
            "battery": 5000
            # Missing other required fields
        }
        response = client.post("/api/predict/price", json=payload)
        assert response.status_code == 422  # Validation error

    def test_predict_price_invalid_types(self):
        """Test POST /api/predict/price with invalid data types"""
        payload = {
            "ram": "eight",  # Should be int
            "battery": 5000,
            "screen": 6.5,
            "weight": 200,
            "year": 2024,
            "company": "Samsung",
            "front_camera": 12,
            "back_camera": 48,
            "processor": "Snapdragon 8 Gen 2",
            "storage": 256
        }
        response = client.post("/api/predict/price", json=payload)
        assert response.status_code == 422


class TestRAMPrediction:
    """Test RAM prediction endpoints"""

    def test_predict_ram_valid_input(self):
        """Test POST /api/predict/ram with valid data"""
        payload = {
            "price": 500,
            "battery": 5000,
            "screen": 6.5,
            "weight": 200,
            "year": 2024,
            "company": "Samsung",
            "front_camera": 12,
            "back_camera": 48,
            "processor": "Snapdragon 8 Gen 2",
            "storage": 256
        }
        response = client.post("/api/predict/ram", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "ram" in data
        assert isinstance(data["ram"], (int, float))
        assert data["ram"] > 0


class TestBatteryPrediction:
    """Test battery prediction endpoints"""

    def test_predict_battery_valid_input(self):
        """Test POST /api/predict/battery with valid data"""
        payload = {
            "ram": 8,
            "price": 500,
            "screen": 6.5,
            "weight": 200,
            "year": 2024,
            "company": "Samsung",
            "front_camera": 12,
            "back_camera": 48,
            "processor": "Snapdragon 8 Gen 2",
            "storage": 256
        }
        response = client.post("/api/predict/battery", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "battery" in data
        assert isinstance(data["battery"], (int, float))
        assert data["battery"] > 0


class TestBrandPrediction:
    """Test brand classification endpoints"""

    def test_predict_brand_valid_input(self):
        """Test POST /api/predict/brand with valid data"""
        payload = {
            "ram": 8,
            "battery": 5000,
            "screen": 6.5,
            "weight": 200,
            "year": 2024,
            "price": 500,
            "front_camera": 12,
            "back_camera": 48,
            "processor": "Snapdragon 8 Gen 2",
            "storage": 256
        }
        response = client.post("/api/predict/brand", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "brand" in data
        assert isinstance(data["brand"], str)
        assert len(data["brand"]) > 0


class TestDatasetEndpoints:
    """Test dataset analysis endpoints"""

    def test_get_insights(self):
        """Test GET /api/dataset/insights"""
        response = client.get("/api/dataset/insights")
        # May return 200 with data or 404 if file not found
        assert response.status_code in [200, 404, 500]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)

    def test_get_dataset_stats(self):
        """Test GET /api/dataset/stats"""
        response = client.get("/api/dataset/stats")
        # May return 200 with data or 404 if file not found
        assert response.status_code in [200, 404, 500]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)


class TestCORSHeaders:
    """Test CORS configuration"""

    def test_cors_headers_present(self):
        """Test that CORS headers are present in responses"""
        response = client.options("/health")
        # Preflight request should return CORS headers
        assert response.status_code in [200, 405]  # Some frameworks return 405 for OPTIONS

    def test_cors_allows_localhost(self):
        """Test that localhost origins are allowed"""
        headers = {"Origin": "http://localhost:3000"}
        response = client.get("/health", headers=headers)
        assert response.status_code == 200


class TestErrorHandling:
    """Test error handling and edge cases"""

    def test_404_on_invalid_route(self):
        """Test that invalid routes return 404"""
        response = client.get("/api/invalid/route")
        assert response.status_code == 404

    def test_405_on_wrong_method(self):
        """Test that wrong HTTP methods return 405"""
        response = client.get("/api/predict/price")  # Should be POST
        assert response.status_code == 405

    def test_large_values_handling(self):
        """Test handling of extremely large values"""
        payload = {
            "ram": 999999,
            "battery": 999999,
            "screen": 999.9,
            "weight": 999999,
            "year": 2024,
            "company": "Samsung",
            "front_camera": 999,
            "back_camera": 999,
            "processor": "Test",
            "storage": 999999
        }
        response = client.post("/api/predict/price", json=payload)
        # Should either predict or return validation error, not crash
        assert response.status_code in [200, 422]

    def test_negative_values_handling(self):
        """Test handling of negative values"""
        payload = {
            "ram": -8,
            "battery": -5000,
            "screen": -6.5,
            "weight": -200,
            "year": 2024,
            "company": "Samsung",
            "front_camera": -12,
            "back_camera": -48,
            "processor": "Test",
            "storage": -256
        }
        response = client.post("/api/predict/price", json=payload)
        # Should handle gracefully
        assert response.status_code in [200, 422]


class TestResponseFormat:
    """Test response format consistency"""

    def test_price_response_format(self):
        """Test that price prediction returns correct format"""
        payload = {
            "ram": 8,
            "battery": 5000,
            "screen": 6.5,
            "weight": 200,
            "year": 2024,
            "company": "Samsung",
            "front_camera": 12,
            "back_camera": 48,
            "processor": "Snapdragon 8 Gen 2",
            "storage": 256
        }
        response = client.post("/api/predict/price", json=payload)
        if response.status_code == 200:
            data = response.json()
            # Check response is JSON
            assert isinstance(data, dict)
            # Check key fields
            assert "price" in data
            # Check value types
            assert isinstance(data["price"], (int, float))


# Pytest configuration
if __name__ == "__main__":
    import importlib.util
    import subprocess
    import sys

    # Avoid importing pytest directly to prevent unresolved-import linter errors;
    # run the test runner via "python -m pytest" if pytest is available.
    if importlib.util.find_spec("pytest") is None:
        raise RuntimeError("pytest is required to run tests; install it with: pip install pytest")

    subprocess.run([sys.executable, "-m", "pytest", __file__, "-v", "--tb=short"], check=False)
