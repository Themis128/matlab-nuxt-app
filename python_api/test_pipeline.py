#!/usr/bin/env python3
"""
Test script for the data pipeline
Tests database creation, data loading, and pipeline execution
"""

import sys
import sqlite3
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))

def test_database_connection():
    """Test database connection and basic operations"""
    print("=" * 60)
    print("TEST 1: Database Connection")
    print("=" * 60)

    db_path = Path(__file__).parent / "price_database.db"

    try:
        conn = sqlite3.connect(str(db_path), timeout=10.0)
        cursor = conn.cursor()

        # Test query
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='mobile_prices'")
        table_exists = cursor.fetchone() is not None

        if table_exists:
            cursor.execute("SELECT COUNT(*) FROM mobile_prices")
            count = cursor.fetchone()[0]
            print(f"✅ Database connection successful")
            print(f"✅ Table 'mobile_prices' exists")
            print(f"✅ Records in database: {count}")
        else:
            print(f"⚠️  Table 'mobile_prices' does not exist")
            print(f"   Run 'python create_price_db.py' to create it")

        conn.close()
        return True
    except sqlite3.Error as e:
        print(f"❌ Database connection failed: {e}")
        return False
    except FileNotFoundError:
        print(f"⚠️  Database file not found: {db_path}")
        print(f"   Run 'python create_price_db.py' to create it")
        return False

def test_csv_file_exists():
    """Test if CSV file exists"""
    print("\n" + "=" * 60)
    print("TEST 2: CSV File Check")
    print("=" * 60)

    possible_paths = [
        Path(__file__).parent.parent / "data" / "Mobiles Dataset (2025).csv",
        Path(__file__).parent / "data" / "Mobiles Dataset (2025).csv",
        Path(__file__).parent.parent / "Mobiles Dataset (2025).csv",
    ]

    for path in possible_paths:
        if path.exists():
            print(f"✅ CSV file found: {path}")
            print(f"   Size: {path.stat().st_size / 1024:.2f} KB")
            return str(path)

    print("❌ CSV file not found in any expected location")
    print("   Expected locations:")
    for path in possible_paths:
        print(f"   - {path}")
    return None

def test_pipeline_imports():
    """Test if pipeline modules can be imported"""
    print("\n" + "=" * 60)
    print("TEST 3: Pipeline Module Imports")
    print("=" * 60)

    modules = [
        ("data_pipeline", "DataPipeline"),
        ("enhanced_data_pipeline", "EnhancedDataPipeline"),
        ("lancedb_utils", "get_db_manager"),
    ]

    all_ok = True
    for module_name, class_name in modules:
        try:
            module = __import__(module_name)
            if hasattr(module, class_name):
                print(f"✅ {module_name}.{class_name} imported successfully")
            else:
                print(f"⚠️  {module_name} imported but {class_name} not found")
                all_ok = False
        except ImportError as e:
            print(f"❌ Failed to import {module_name}: {e}")
            all_ok = False
        except Exception as e:
            print(f"⚠️  Error importing {module_name}: {e}")
            all_ok = False

    return all_ok

def test_data_pipeline_initialization():
    """Test data pipeline initialization"""
    print("\n" + "=" * 60)
    print("TEST 4: Data Pipeline Initialization")
    print("=" * 60)

    try:
        from data_pipeline import DataPipeline

        pipeline = DataPipeline(batch_size=10, max_workers=2)
        print("✅ DataPipeline initialized successfully")
        print(f"   Batch size: {pipeline.batch_size}")
        print(f"   Max workers: {pipeline.max_workers}")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize DataPipeline: {e}")
        return False

def test_enhanced_pipeline_initialization():
    """Test enhanced data pipeline initialization"""
    print("\n" + "=" * 60)
    print("TEST 5: Enhanced Data Pipeline Initialization")
    print("=" * 60)

    try:
        from enhanced_data_pipeline import EnhancedDataPipeline

        pipeline = EnhancedDataPipeline()
        print("✅ EnhancedDataPipeline initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize EnhancedDataPipeline: {e}")
        return False

def test_database_schema():
    """Test database schema"""
    print("\n" + "=" * 60)
    print("TEST 6: Database Schema Check")
    print("=" * 60)

    db_path = Path(__file__).parent / "price_database.db"

    if not db_path.exists():
        print("⚠️  Database file not found, skipping schema check")
        return False

    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Get table schema
        cursor.execute("PRAGMA table_info(mobile_prices)")
        columns = cursor.fetchall()

        if columns:
            print("✅ Table schema:")
            required_columns = ['id', 'company', 'model', 'price_pakistan', 'price_india']
            found_columns = [col[1] for col in columns]

            for col in columns:
                col_name = col[1]
                col_type = col[2]
                is_required = col[3]
                marker = "✅" if col_name in required_columns else "  "
                required_marker = "NOT NULL" if is_required else ""
                print(f"   {marker} {col_name}: {col_type} {required_marker}")

            # Check indexes
            cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='mobile_prices'")
            indexes = cursor.fetchall()
            if indexes:
                print(f"\n✅ Indexes found: {len(indexes)}")
                for idx in indexes:
                    print(f"   - {idx[0]}")
            else:
                print("\n⚠️  No indexes found")
        else:
            print("❌ Table does not exist or has no columns")
            return False

        conn.close()
        return True
    except Exception as e:
        print(f"❌ Schema check failed: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("DATA PIPELINE TEST SUITE")
    print("=" * 60)

    results = {
        "database_connection": test_database_connection(),
        "csv_file": test_csv_file_exists() is not None,
        "pipeline_imports": test_pipeline_imports(),
        "data_pipeline_init": test_data_pipeline_initialization(),
        "enhanced_pipeline_init": test_enhanced_pipeline_initialization(),
        "database_schema": test_database_schema(),
    }

    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    total = len(results)
    passed = sum(1 for v in results.values() if v)

    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name.replace('_', ' ').title()}")

    print(f"\nResults: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! Pipeline is ready to use.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
