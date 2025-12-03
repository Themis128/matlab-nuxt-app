#!/usr/bin/env python3
"""
Script to load CSV datasets and images into LanceDB
"""

import glob
import logging
import os
import sys
from pathlib import Path
from typing import List


# Add the current directory to Python path for imports
sys.path.append(str(Path(__file__).parent))

from lancedb_utils import get_db_manager

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def load_csv_datasets(data_dir: str = "../data", limit: int = None) -> List[str]:
    """Load CSV datasets from data directory into LanceDB"""
    db_manager = get_db_manager()
    loaded_datasets = []

    # Find all CSV files
    csv_pattern = os.path.join(data_dir, "**", "*.csv")
    csv_files = glob.glob(csv_pattern, recursive=True)

    logger.info(f"Found {len(csv_files)} CSV files")

    for i, csv_file in enumerate(csv_files):
        if limit and i >= limit:
            break

        try:
            logger.info(f"Loading CSV: {csv_file}")
            dataset_id = db_manager.store_csv_dataset(
                file_path=csv_file,
                description=f"Dataset loaded from {Path(csv_file).name}",
                tags=["mobile_data", "automated_import"],
            )
            loaded_datasets.append(dataset_id)
            logger.info(f"Successfully loaded dataset: {dataset_id}")

        except Exception as e:
            logger.error(f"Failed to load {csv_file}: {e}")
            continue

    return loaded_datasets


def load_images(image_dir: str = "../public/mobile_images", limit: int = None) -> List[str]:
    """Load images from mobile_images directory into LanceDB"""
    db_manager = get_db_manager()
    loaded_images = []

    # Find all image files
    image_extensions = ["*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp", "*.bmp"]
    image_files = []

    for ext in image_extensions:
        pattern = os.path.join(image_dir, "**", ext)
        image_files.extend(glob.glob(pattern, recursive=True))

    logger.info(f"Found {len(image_files)} image files")

    for i, image_file in enumerate(image_files):
        if limit and i >= limit:
            break

        try:
            # Extract model name from path
            path_parts = Path(image_file).parts
            if len(path_parts) >= 2:
                model_name = path_parts[-2]  # Parent directory name
            else:
                model_name = Path(image_file).stem

            logger.info(f"Loading image: {image_file}")
            image_id = db_manager.store_image(
                file_path=image_file,
                description=f"Mobile phone image: {model_name}",
                tags=["mobile_image", "automated_import", model_name.split("_")[0]],  # Brand as tag
            )
            loaded_images.append(image_id)
            logger.info(f"Successfully loaded image: {image_id}")

        except Exception as e:
            logger.error(f"Failed to load {image_file}: {e}")
            continue

    return loaded_images


def main():
    """Main function to load data into LanceDB"""
    import argparse

    parser = argparse.ArgumentParser(description="Load data into LanceDB")
    parser.add_argument("--data-dir", default="../data", help="Directory containing CSV files")
    parser.add_argument("--image-dir", default="../public/mobile_images", help="Directory containing images")
    parser.add_argument("--csv-limit", type=int, help="Limit number of CSV files to load")
    parser.add_argument("--image-limit", type=int, help="Limit number of images to load")
    parser.add_argument("--skip-csv", action="store_true", help="Skip CSV loading")
    parser.add_argument("--skip-images", action="store_true", help="Skip image loading")

    args = parser.parse_args()

    # Load CSV datasets
    if not args.skip_csv:
        logger.info("Starting CSV dataset loading...")
        csv_datasets = load_csv_datasets(args.data_dir, args.csv_limit)
        logger.info(f"Loaded {len(csv_datasets)} CSV datasets")
    else:
        logger.info("Skipping CSV loading")
        csv_datasets = []

    # Load images
    if not args.skip_images:
        logger.info("Starting image loading...")
        images = load_images(args.image_dir, args.image_limit)
        logger.info(f"Loaded {len(images)} images")
    else:
        logger.info("Skipping image loading")
        images = []

    # Print summary
    logger.info("=== Loading Summary ===")
    logger.info(f"CSV Datasets: {len(csv_datasets)}")
    logger.info(f"Images: {len(images)}")
    logger.info("Data loading completed successfully!")


if __name__ == "__main__":
    main()
