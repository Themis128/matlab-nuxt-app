#!/usr/bin/env python3
"""
Test script for data preprocessing functionality
"""

import sys
from pathlib import Path

import pandas as pd

# Add the current directory to Python path for imports
sys.path.append(str(Path(__file__).parent))

from data_preprocessing import DataPreprocessor


def create_sample_data():
    """Create sample mobile phone data for testing"""
    data = {
        "Company Name": ["apple", "Samsung", "Google", "OnePlus", "xiaomi", "Unknown"],
        "Model Name": ["iPhone 15", "Galaxy S24", "Pixel 8", "OnePlus 12", "Mi 14", "Unknown Phone"],
        "Price": [999, 899, 699, 599, 799, -100],  # Invalid negative price
        "Storage": [128, 256, 128, 256, 512, 10000],  # Invalid storage
        "RAM": [8, 8, 8, 12, 8, None],  # Missing RAM
        "Rating": [4.5, 4.2, 4.8, 4.1, 4.3, 6.0],  # Invalid rating > 5
        "Operating System": ["ios", "android", "Android", "Android", "HarmonyOS", None],
    }
    return pd.DataFrame(data)


def test_preprocessing():
    """Test the preprocessing functionality"""
    print("Testing Data Preprocessing...")

    # Create sample data
    df_original = create_sample_data()
    print(f"\nOriginal data ({len(df_original)} rows):")
    print(df_original)

    # Initialize preprocessor
    preprocessor = DataPreprocessor()

    # Apply preprocessing
    df_processed = preprocessor.preprocess_csv_data(df_original)

    print(f"\nProcessed data ({len(df_processed)} rows):")
    print(df_processed)

    # Show preprocessing stats
    stats = preprocessor.get_preprocessing_stats()
    print("\nPreprocessing Statistics:")
    for key, value in stats.items():
        if value > 0:  # Only show non-zero stats
            print(f"  {key}: {value}")

    # Show data quality report
    quality_report = preprocessor.validate_dataset_quality(df_processed)
    print("\nData Quality Report:")
    print(f"  Total rows: {quality_report['total_rows']}")
    print(f"  Total columns: {quality_report['total_columns']}")
    print(f"  Missing values: {quality_report['missing_values']}")
    print(f"  Duplicate rows: {quality_report['duplicate_rows']}")

    print("\nColumn completeness:")
    for col, completeness in quality_report["column_completeness"].items():
        print(f"  {col}: {completeness}")

    print("\nPreprocessing test completed successfully!")


if __name__ == "__main__":
    test_preprocessing()
