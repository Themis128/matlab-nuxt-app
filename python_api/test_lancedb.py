#!/usr/bin/env python3
"""
Test script for LanceDB integration
"""

import os
import sys
import tempfile
from pathlib import Path

import pandas as pd

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from lancedb_utils import LanceDBManager


def test_lancedb_basic():
    """Test basic LanceDB functionality"""
    print("🧪 Testing LanceDB Integration...")

    # Create a separate test database manager
    db_manager = LanceDBManager(db_path="./test_lancedb_data")
    print("✅ Database manager initialized")

    # Test database health
    try:
        tables = db_manager.db.table_names()
        print(f"✅ Database tables: {tables}")
    except Exception as e:
        print(f"❌ Database health check failed: {e}")
        return False

    # Create test CSV data
    test_data = {
        "name": ["iPhone 15", "Samsung Galaxy S24", "Google Pixel 8"],
        "price": [999, 899, 699],
        "ram": [8, 12, 8],
        "battery": [4000, 5000, 4500],
    }
    df = pd.DataFrame(test_data)

    # Save to temporary CSV file
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        df.to_csv(f.name, index=False)
        csv_path = f.name

    try:
        # Test CSV upload
        print("📊 Testing CSV upload...")
        dataset_id = db_manager.store_csv_dataset(
            file_path=csv_path, description="Test mobile phone dataset", tags=["test", "mobile", "phones"]
        )
        print(f"✅ CSV uploaded successfully: {dataset_id}")

        # Test dataset retrieval
        dataset = db_manager.get_dataset_by_id(dataset_id)
        if dataset:
            print(f"✅ Dataset retrieved: {dataset['filename']} with {dataset['row_count']} rows")
        else:
            print("❌ Dataset retrieval failed")
            return False

        # Test search
        results = db_manager.search_datasets("mobile", limit=10)
        print(f"✅ Search returned {len(results)} datasets")

        # Test stats
        stats = {"datasets": len(db_manager.get_all_datasets()), "images": len(db_manager.get_all_images())}
        print(f"✅ Database stats: {stats['datasets']} datasets, {stats['images']} images")

        # Clean up test data
        db_manager.delete_dataset(dataset_id)
        print("🧹 Test data cleaned up")

        print("🎉 All LanceDB tests passed!")
        return True

    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        # Clean up temp file
        Path(csv_path).unlink(missing_ok=True)


if __name__ == "__main__":
    success = test_lancedb_basic()
    sys.exit(0 if success else 1)
