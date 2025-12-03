#!/usr/bin/env python3
"""
Test script to check database contents
"""

import lancedb


def main():
    # Connect to database
    db = lancedb.connect("./lancedb_data")

    # Check CSV datasets
    try:
        table = db.open_table("csv_datasets")
        df = table.to_pandas()
        print(f"CSV datasets: {len(df)}")
        if len(df) > 0:
            print("All datasets:")
            for idx, row in df.iterrows():
                print(f"  {idx}: {row['filename']} - {row['row_count']} rows")
    except Exception as e:
        print(f"Error accessing csv_datasets: {e}")

    # Check images
    try:
        table = db.open_table("images")
        df = table.to_pandas()
        print(f"Images: {len(df)}")
        if len(df) > 0:
            print("All images (first 10):")
            for idx, row in df.head(10).iterrows():
                print(f"  {idx}: {row['filename']} - {row['width']}x{row['height']}")
    except Exception as e:
        print(f"Error accessing images: {e}")


if __name__ == "__main__":
    main()
