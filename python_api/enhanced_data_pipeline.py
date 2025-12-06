"""
Enhanced Data Pipeline with Automatic Model Training
Loads CSV and images, then automatically trains all models
"""

import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from automated_training_pipeline import AutomatedTrainingPipeline
from data_pipeline import DataPipeline

logger = logging.getLogger(__name__)


class EnhancedDataPipeline:
    """Enhanced pipeline that loads data and automatically trains models"""

    def __init__(self, batch_size: int = 50, max_workers: int = 4, enable_preprocessing: bool = True):
        self.data_pipeline = DataPipeline(
            batch_size=batch_size, max_workers=max_workers, enable_preprocessing=enable_preprocessing
        )
        self.training_pipeline = AutomatedTrainingPipeline()
        self.notifications: List[Dict[str, Any]] = []

    async def load_data_and_train(
        self,
        csv_path: str,
        image_base_dir: str = "../public/mobile_images",
        auto_train: bool = True,
    ) -> Dict[str, Any]:
        """
        Load CSV data and images, then automatically train all models

        Args:
            csv_path: Path to CSV file
            image_base_dir: Base directory for images
            auto_train: Whether to automatically train models after loading

        Returns:
            Complete pipeline results including data loading and training
        """
        results = {
            "data_loading": {},
            "training": {},
            "notifications": [],
            "success": False,
        }

        try:
            # Step 1: Load CSV and images
            logger.info("Step 1: Loading CSV data and images...")
            data_results = self.data_pipeline.load_dataset_with_images(
                csv_path=csv_path, image_base_dir=image_base_dir
            )

            # Handle both dict and string returns from load_dataset_with_images
            if isinstance(data_results, dict):
                results["data_loading"] = {
                    "success": True,
                    "dataset_id": data_results.get("dataset_id"),
                    "images_loaded": len(data_results.get("images_loaded", [])),
                    "errors": data_results.get("errors", []),
                }
                images_count = len(data_results.get("images_loaded", []))
            else:
                # If it returns just a dataset_id string
                results["data_loading"] = {
                    "success": True,
                    "dataset_id": data_results if isinstance(data_results, str) else None,
                    "images_loaded": 0,
                    "errors": [],
                }
                images_count = 0

            self.notifications.append(
                {
                    "model_name": "data_pipeline",
                    "message": f"Data loaded successfully: {images_count} images",
                    "status": "success",
                    "timestamp": datetime.now().isoformat(),
                }
            )

            # Step 2: Automatically train all models
            if auto_train:
                logger.info("Step 2: Starting automatic model training...")

                # Check if we should train ALL 41 models or just basic 4
                import os
                train_all_41 = os.getenv("TRAIN_ALL_41_MODELS", "true").lower() == "true"

                if train_all_41:
                    # Train ALL 41 models using unified trainer
                    logger.info("Training ALL 41 models (unified trainer)...")
                    try:
                        from train_all_models_unified import UnifiedModelTrainer
                        unified_trainer = UnifiedModelTrainer()
                        training_results = await unified_trainer.train_all_models(csv_path=csv_path)
                    except Exception as e:
                        logger.warning(f"Unified trainer failed, falling back to basic: {e}")
                        # Fallback to basic training
                        training_results = await self.training_pipeline.train_all_models(csv_path=csv_path)
                else:
                    # Train only basic 4 models
                    logger.info("Training basic 4 models only...")
                    training_results = await self.training_pipeline.train_all_models(csv_path=csv_path)

                results["training"] = training_results
                results["notifications"].extend(training_results.get("notifications", []))

                if training_results.get("success"):
                    results["success"] = True
                    self.notifications.append(
                        {
                            "model_name": "pipeline",
                            "message": "Pipeline completed successfully: All models trained",
                            "status": "success",
                            "timestamp": datetime.now().isoformat(),
                        }
                    )
                else:
                    self.notifications.append(
                        {
                            "model_name": "pipeline",
                            "message": f"Pipeline completed with errors: {training_results.get('failure_count', 0)} models failed",
                            "status": "warning",
                            "timestamp": datetime.now().isoformat(),
                        }
                    )
            else:
                results["training"] = {"skipped": True, "message": "Auto-training disabled"}
                results["success"] = True

            results["notifications"] = self.notifications.copy()

        except Exception as e:
            error_msg = f"Pipeline failed: {str(e)}"
            logger.error(error_msg)
            results["success"] = False
            results["error"] = error_msg
            self.notifications.append(
                {
                    "model_name": "pipeline",
                    "message": error_msg,
                    "status": "error",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat(),
                }
            )
            results["notifications"] = self.notifications.copy()

        return results

    def get_notifications(self) -> List[Dict[str, Any]]:
        """Get all notifications from the pipeline"""
        return self.notifications.copy()

    def clear_notifications(self):
        """Clear all notifications"""
        self.notifications.clear()
        self.training_pipeline.clear_notifications()


async def main():
    """Main function for testing"""
    import sys

    csv_path = sys.argv[1] if len(sys.argv) > 1 else "../data/Mobiles Dataset (2025).csv"

    pipeline = EnhancedDataPipeline()
    results = await pipeline.load_data_and_train(csv_path=csv_path)

    print("\n=== Pipeline Results ===")
    print(f"Success: {results['success']}")
    print(f"\nData Loading: {results['data_loading']}")
    print(f"\nTraining: {results['training']}")
    print(f"\nNotifications ({len(results['notifications'])}):")
    for notification in results["notifications"]:
        print(f"  [{notification['status']}] {notification['model_name']}: {notification['message']}")


if __name__ == "__main__":
    asyncio.run(main())
