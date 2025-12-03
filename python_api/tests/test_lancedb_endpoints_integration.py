import io
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image

# Ensure top-level imports work
sys.path.insert(0, str(Path(__file__).parent.parent))

from api import app  # import the FastAPI app defined in api.py


@pytest.mark.integration
def test_lancedb_health_and_uploads(tmp_path):
    client = TestClient(app)

    # Health endpoint
    r = client.get("/api/lancedb/health")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "healthy"

    # CSV upload
    csv_content = "a,b,c\n1,2,3\n4,5,6\n"
    csv_file = io.BytesIO(csv_content.encode("utf-8"))
    files = {"file": ("test.csv", csv_file, "text/csv")}
    data = {"description": "Test CSV", "tags": "a,b", "metadata": "{}"}
    r2 = client.post("/api/lancedb/upload/csv", files=files, data=data)
    assert r2.status_code == 200
    json2 = r2.json()
    assert "dataset_id" in json2

    # Image upload (PIL image in-memory)
    img = Image.new("RGB", (8, 8), color=(64, 128, 200))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="JPEG")
    img_bytes.seek(0)

    files2 = {"file": ("test.jpg", img_bytes, "image/jpeg")}
    data2 = {"description": "Test Image", "tags": "img,test", "metadata": "{}"}
    r3 = client.post("/api/lancedb/upload/image", files=files2, data=data2)
    assert r3.status_code == 200
    json3 = r3.json()
    assert "image_id" in json3
