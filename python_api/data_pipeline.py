#!/usr/bin/env python3
"""
Enhanced Data Pipeline for Loading CSV Data and Images into LanceDB
Supports relational data loading with image associations and batch processing
"""

import argparse
import glob
import hashlib
import json
import logging
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed  # type: ignore
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd

from data_preprocessing import DataPreprocessor
from lancedb_utils import get_db_manager

# Add the current directory to Python path for imports
sys.path.append(str(Path(__file__).parent))


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("data_pipeline.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)


class DataPipeline:
    """Enhanced data pipeline for CSV and image loading"""

    def __init__(self, batch_size: int = 50, max_workers: int = 4, enable_preprocessing: bool = True):
        """
        Initialize the data pipeline

        Args:
            batch_size: Number of records to process in each batch
            max_workers: Maximum number of worker threads for parallel processing
            enable_preprocessing: Whether to enable data preprocessing
        """
        self.db_manager = get_db_manager()
        self.batch_size = batch_size
        self.max_workers = max_workers
        self.enable_preprocessing = enable_preprocessing
        self.preprocessor = DataPreprocessor() if enable_preprocessing else None
        self.stats = {
            "csv_processed": 0,
            "images_processed": 0,
            "errors": 0,
            "start_time": None,
            "end_time": None,
            "preprocessing_stats": {},
        }

    def load_dataset_with_images(
        self, csv_path: str, image_base_dir: str = "../public/mobile_images", create_relationships: bool = True
    ) -> Dict[str, Any]:
        """
        Load a CSV dataset that contains image references

        Args:
            csv_path: Path to CSV file with image paths
            image_base_dir: Base directory for images
            create_relationships: Whether to create relationships between data and images

        Returns:
            Processing results
        """
        try:
            logger.info(f"Loading dataset with images from: {csv_path}")

            # Read CSV file - try multiple encodings
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'utf-8-sig']
            df = None
            for encoding in encodings:
                try:
                    df = pd.read_csv(csv_path, encoding=encoding)
                    logger.info(f"Successfully loaded CSV with {encoding} encoding")
                    break
                except (UnicodeDecodeError, UnicodeError):
                    continue

            if df is None:
                raise ValueError(f"Could not read CSV file with any encoding. Tried: {encodings}")

            filename = Path(csv_path).name

            # Check if CSV has image path column
            image_columns = [col for col in df.columns if "image" in col.lower() or "path" in col.lower()]
            if not image_columns:
                logger.warning(f"No image path column found in {filename}, loading as regular CSV")
                return self._load_csv_dataset(csv_path)

            image_column = image_columns[0]  # Use first image column found
            logger.info(f"Found image column: {image_column}")

            # Process in batches
            results = {"dataset_id": None, "images_loaded": [], "errors": [], "total_records": len(df)}

            # First, load the CSV dataset
            dataset_id = self._load_csv_dataset(csv_path)
            results["dataset_id"] = dataset_id

            # Then process images in parallel
            image_tasks = []
            for idx, row in df.iterrows():
                image_path = row.get(image_column)
                if pd.notna(image_path) and image_path:
                    # Convert relative path to absolute
                    if not Path(image_path).is_absolute():
                        # Remove 'mobile_images/' prefix if it exists to avoid double path
                        clean_image_path = image_path.replace("mobile_images/", "").replace("mobile_images\\", "")
                        full_image_path = Path(image_base_dir) / clean_image_path
                    else:
                        full_image_path = Path(image_path)

                    if full_image_path.exists():
                        image_tasks.append(
                            {
                                "path": str(full_image_path),
                                "metadata": {
                                    "dataset_id": dataset_id,
                                    "row_index": idx,
                                    "model_name": row.get("Model Name", ""),
                                    "company_name": row.get("Company Name", ""),
                                    "record_data": row.to_dict(),
                                },
                            }
                        )
                    else:
                        logger.warning(f"Image not found: {full_image_path}")
                        results["errors"].append(f"Image not found: {full_image_path}")

            # Process images in parallel batches
            if image_tasks:
                logger.info(f"Processing {len(image_tasks)} images in parallel")
                # Apply image preprocessing if enabled
                if self.enable_preprocessing and self.preprocessor:
                    image_tasks = self._preprocess_image_tasks(image_tasks)
                image_results = self._process_images_parallel(image_tasks)
                results["images_loaded"] = image_results["loaded"]
                results["errors"].extend(image_results["errors"])

            logger.info(f"Dataset loading completed: {len(results['images_loaded'])} images loaded")
            return results

        except Exception as e:
            logger.error(f"Failed to load dataset with images: {e}")
            raise

    def _load_csv_dataset(self, csv_path: str) -> str:
        """Load a CSV dataset into LanceDB"""
        try:
            # Try multiple encodings to handle different CSV formats
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252', 'utf-8-sig']
            df = None
            for encoding in encodings:
                try:
                    df = pd.read_csv(csv_path, encoding=encoding)
                    logger.info(f"Successfully loaded CSV with {encoding} encoding")
                    break
                except UnicodeDecodeError:
                    continue

            if df is None:
                raise ValueError(f"Could not read CSV file with any encoding. Tried: {encodings}")
            filename = Path(csv_path).name

            # Apply preprocessing if enabled
            if self.enable_preprocessing and self.preprocessor:
                logger.info("Applying data preprocessing...")
                df = self.preprocessor.preprocess_csv_data(df)
                preprocessing_stats = self.preprocessor.get_preprocessing_stats()
                self.stats["preprocessing_stats"] = preprocessing_stats
                logger.info(f"Preprocessing completed: {preprocessing_stats}")

            # Generate unique ID
            dataset_id = f"dataset_{hashlib.sha256(filename.encode()).hexdigest()[:8]}_{int(time.time())}"

            # Analyze data types and sample
            data_types = df.dtypes.astype(str).to_dict()
            sample_data = df.head(5).to_dict("records")
            columns = df.columns.tolist()

            # Prepare dataset record
            dataset_record = {
                "id": dataset_id,
                "filename": filename,
                "description": f"Dataset loaded via pipeline: {filename}",
                "columns_json": json.dumps(columns),
                "row_count": len(df),
                "data_types_json": json.dumps(data_types),
                "sample_data_json": json.dumps(sample_data),
                "upload_date": datetime.now().isoformat(),
                "tags_json": json.dumps(["mobile_data", "pipeline_import", "with_images"]),
                "metadata_json": json.dumps(
                    {
                        "source": "data_pipeline",
                        "batch_size": self.batch_size,
                        "processing_date": datetime.now().isoformat(),
                    }
                ),
            }

            # Store in LanceDB (create table if it doesn't exist)
            try:
                table = self.db_manager.db.open_table("csv_datasets")
            except Exception:
                # Table doesn't exist, create it with the first record
                table = self.db_manager.db.create_table("csv_datasets", [dataset_record])
                return dataset_id

            table.add([dataset_record])

            logger.info(f"Stored CSV dataset: {dataset_id}")
            self.stats["csv_processed"] += 1
            return dataset_id

        except Exception as e:
            logger.error(f"Failed to store CSV dataset: {e}")
            raise

    def _process_images_parallel(self, image_tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process images in parallel using thread pool"""
        results = {"loaded": [], "errors": []}

        # Process in batches
        for i in range(0, len(image_tasks), self.batch_size):
            batch = image_tasks[slice(i, i + self.batch_size)]
            logger.info(f"Processing batch {i//self.batch_size + 1} with {len(batch)} images")

            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                future_to_task = {executor.submit(self._load_single_image, task): task for task in batch}

                for future in as_completed(future_to_task):
                    task = future_to_task[future]
                    try:
                        result = future.result()
                        if result:
                            results["loaded"].append(result)
                        else:
                            results["errors"].append(f"Failed to load image: {task['path']}")
                    except Exception as e:
                        logger.error(f"Image processing failed for {task['path']}: {e}")
                        results["errors"].append(f"Failed to load {task['path']}: {e}")

        return results

    def _load_single_image(self, image_task: Dict[str, Any]) -> Optional[str]:
        """Load a single image with metadata"""
        try:
            image_path = image_task["path"]
            metadata = image_task["metadata"]

            # Extract model name from path for better organization
            path_parts = Path(image_path).parts
            if len(path_parts) >= 2:
                model_name = path_parts[-2]  # Parent directory name
            else:
                model_name = Path(image_path).stem

            # Create comprehensive metadata
            image_metadata = {
                "dataset_id": metadata.get("dataset_id"),
                "row_index": metadata.get("row_index"),
                "model_name": metadata.get("model_name", model_name),
                "company_name": metadata.get("company_name"),
                "record_data": metadata.get("record_data", {}),
                "pipeline_processed": True,
                "processing_timestamp": datetime.now().isoformat(),
            }

            # Load image
            image_id = self.db_manager.store_image(
                file_path=image_path,
                description=f"Mobile phone image: {model_name}",
                tags=["mobile_image", "pipeline_import", metadata.get("company_name", "unknown")],
                metadata=image_metadata,
            )

            self.stats["images_processed"] += 1
            return image_id

        except Exception as e:
            logger.error(f"Failed to load image {image_task['path']}: {e}")
            self.stats["errors"] += 1
            return None

    def load_bulk_datasets(
        self, data_dir: str, pattern: str = "*.csv", image_dir: str = "../public/mobile_images"
    ) -> Dict[str, Any]:
        """
        Load multiple datasets from a directory

        Args:
            data_dir: Directory containing CSV files
            pattern: File pattern to match
            image_dir: Directory containing images

        Returns:
            Bulk loading results
        """
        self.stats["start_time"] = datetime.now()

        try:
            # Find all CSV files
            csv_pattern = os.path.join(data_dir, "**", pattern)
            csv_files = glob.glob(csv_pattern, recursive=True)

            logger.info(f"Found {len(csv_files)} CSV files to process")

            results = {"total_files": len(csv_files), "processed_files": [], "errors": [], "summary": {}}

            for csv_file in csv_files:
                try:
                    logger.info(f"Processing: {csv_file}")
                    file_results = self.load_dataset_with_images(csv_path=csv_file, image_base_dir=image_dir)
                    results["processed_files"].append({"file": csv_file, "results": file_results})
                except Exception as e:
                    logger.error(f"Failed to process {csv_file}: {e}")
                    results["errors"].append(f"{csv_file}: {e}")
                    self.stats["errors"] += 1

            # Generate summary
            results["summary"] = self._generate_summary(results)

            self.stats["end_time"] = datetime.now()
            logger.info("Bulk loading completed")
            logger.info(f"Processed {len(results['processed_files'])} files successfully")
            return results

        except Exception as e:
            logger.error(f"Bulk loading failed: {e}")
            raise

    def _preprocess_image_tasks(self, image_tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Preprocess images before loading"""
        if not self.preprocessor:
            return image_tasks

        logger.info(f"Preprocessing {len(image_tasks)} images...")
        processed_tasks = []

        for task in image_tasks:
            try:
                original_path = task["path"]
                path_obj = Path(original_path)

                # Create processed image path
                processed_dir = path_obj.parent / "processed"
                processed_dir.mkdir(exist_ok=True)
                processed_path = processed_dir / f"processed_{path_obj.name}"

                # Preprocess the image
                result_path = self.preprocessor.preprocess_image(original_path, str(processed_path))

                if result_path:
                    # Update task with processed image path
                    processed_task = task.copy()
                    processed_task["path"] = result_path
                    processed_task["original_path"] = original_path
                    processed_tasks.append(processed_task)
                    logger.debug(f"Preprocessed image: {path_obj.name}")
                else:
                    logger.warning(f"Failed to preprocess image: {original_path}, using original")
                    processed_tasks.append(task)

            except Exception as e:
                logger.error(f"Image preprocessing failed for {task['path']}: {e}")
                # Use original image if preprocessing fails
                processed_tasks.append(task)

        logger.info(f"Image preprocessing completed: {len(processed_tasks)} images ready")
        return processed_tasks

    def _generate_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate processing summary"""
        total_images = sum(
            len(file_result["results"].get("images_loaded", [])) for file_result in results["processed_files"]
        )

        total_errors = len(results["errors"])
        for file_result in results["processed_files"]:
            total_errors += len(file_result["results"].get("errors", []))

        return {
            "total_files_processed": len(results["processed_files"]),
            "total_images_loaded": total_images,
            "total_errors": total_errors,
            "processing_time": (
                str(self.stats["end_time"] - self.stats["start_time"]) if self.stats["end_time"] else None
            ),
            "success_rate": (
                f"{(len(results['processed_files']) / results['total_files'] * 100):.1f}%"
                if results["total_files"] > 0
                else "0%"
            ),
        }

    def get_pipeline_stats(self) -> Dict[str, Any]:
        """Get pipeline statistics"""
        return self.stats.copy()


def main():
    """Main function to run the data pipeline"""
    parser = argparse.ArgumentParser(description="Enhanced Data Pipeline for LanceDB")
    parser.add_argument("--csv-file", help="Single CSV file to process")
    parser.add_argument("--data-dir", default="../data", help="Directory containing CSV files")
    parser.add_argument("--image-dir", default="../public/mobile_images", help="Directory containing images")
    parser.add_argument("--batch-size", type=int, default=50, help="Batch size for processing")
    parser.add_argument("--max-workers", type=int, default=4, help="Maximum worker threads")
    parser.add_argument("--pattern", default="*.csv", help="File pattern to match")
    parser.add_argument("--no-preprocessing", action="store_true", help="Disable data preprocessing")

    args = parser.parse_args()

    # Initialize pipeline
    enable_preprocessing = not args.no_preprocessing
    pipeline = DataPipeline(
        batch_size=args.batch_size, max_workers=args.max_workers, enable_preprocessing=enable_preprocessing
    )

    try:
        if args.csv_file:
            # Process single file
            logger.info(f"Processing single file: {args.csv_file}")
            results = pipeline.load_dataset_with_images(csv_path=args.csv_file, image_base_dir=args.image_dir)
            print(json.dumps(results, indent=2))
        else:
            # Process directory
            logger.info(f"Processing directory: {args.data_dir}")
            results = pipeline.load_bulk_datasets(
                data_dir=args.data_dir, pattern=args.pattern, image_dir=args.image_dir
            )
            print(json.dumps(results, indent=2))

        # Print final stats
        stats = pipeline.get_pipeline_stats()
        logger.info("=== Pipeline Statistics ===")
        logger.info(f"CSV files processed: {stats['csv_processed']}")
        logger.info(f"Images processed: {stats['images_processed']}")
        logger.info(f"Errors: {stats['errors']}")

    except Exception as e:
        logger.error(f"Pipeline execution failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
