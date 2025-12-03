#!/usr/bin/env python3
"""
Simple script to run the data pipeline
"""

import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

from data_pipeline import DataPipeline


def main():
    """Run the data pipeline on the dataset with images"""
    print("Starting Data Pipeline...")

    # Initialize pipeline
    pipeline = DataPipeline(batch_size=10, max_workers=2)

    try:
        # Process the dataset with images
        csv_file = "../public/dataset_with_images.csv"
        image_dir = "../public/mobile_images"

        print(f"Processing CSV file: {csv_file}")
        print(f"Image directory: {image_dir}")

        results = pipeline.load_dataset_with_images(csv_path=csv_file, image_base_dir=image_dir)

        print("\n=== Results ===")
        print(f"Dataset ID: {results['dataset_id']}")
        print(f"Images loaded: {len(results['images_loaded'])}")
        print(f"Errors: {len(results['errors'])}")

        if results["errors"]:
            print("\nErrors encountered:")
            for error in results["errors"][:5]:  # Show first 5 errors
                print(f"  - {error}")

        # Print final stats
        stats = pipeline.get_pipeline_stats()
        print("\n=== Pipeline Statistics ===")
        print(f"CSV files processed: {stats['csv_processed']}")
        print(f"Images processed: {stats['images_processed']}")
        print(f"Errors: {stats['errors']}")

        print("\nPipeline completed successfully!")

    except Exception as e:
        print(f"Pipeline failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
