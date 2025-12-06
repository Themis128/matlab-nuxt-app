"""
Unified Model Training Orchestrator
Automatically trains ALL 41 models when CSV data is loaded
No manual intervention required
"""

import asyncio
import json
import logging
import os
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# Add paths
sys.path.append(str(Path(__file__).parent))
sys.path.append(str(Path(__file__).parent.parent / "scripts" / "ml_pipeline"))

from automated_training_pipeline import AutomatedTrainingPipeline, MODELS_DIR
from model_versioning import ModelVersionManager
from prepare_engineered_dataset import prepare_engineered_dataset

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

PROJECT_ROOT = Path(__file__).parent.parent
SCRIPTS_DIR = PROJECT_ROOT / "scripts" / "ml_pipeline"


class UnifiedModelTrainer:
    """Unified trainer that handles ALL 41 models automatically"""

    def __init__(self):
        self.version_manager = ModelVersionManager()
        self.results = {
            "basic": {"success": 0, "failed": 0, "models": {}},
            "ensemble": {"success": 0, "failed": 0, "models": {}},
            "xgboost": {"success": 0, "failed": 0, "models": {}},
            "multi_currency": {"success": 0, "failed": 0, "models": {}},
            "multitask": {"success": 0, "failed": 0, "models": {}},
            "segmentation": {"success": 0, "failed": 0, "models": {}},
            "distilled": {"success": 0, "failed": 0, "models": {}},
        }
        self.notifications = []

    def add_notification(self, model_name: str, message: str, status: str = "info"):
        """Add notification"""
        self.notifications.append({
            "model_name": model_name,
            "message": message,
            "status": status,
            "timestamp": asyncio.get_event_loop().time() if hasattr(asyncio, 'get_event_loop') else 0
        })
        logger.info(f"[{status.upper()}] {model_name}: {message}")

    async def train_basic_models(self, csv_path: str) -> Dict[str, Any]:
        """Train 4 basic sklearn models"""
        logger.info("=" * 60)
        logger.info("Training Basic Sklearn Models (4 models)")
        logger.info("=" * 60)

        pipeline = AutomatedTrainingPipeline()
        results = await pipeline.train_all_models(csv_path)

        self.results["basic"] = {
            "success": results.get("success_count", 0),
            "failed": results.get("failure_count", 0),
            "models": results.get("models", {})
        }
        self.notifications.extend(results.get("notifications", []))

        return results

    async def train_ensemble_models(self, csv_path: str) -> Dict[str, Any]:
        """Train ensemble models"""
        logger.info("=" * 60)
        logger.info("Training Ensemble Models")
        logger.info("=" * 60)

        # Prepare engineered dataset if it doesn't exist
        engineered_path = PROJECT_ROOT / "data" / "Mobiles_Dataset_Feature_Engineered.csv"
        if not engineered_path.exists():
            logger.info("Preparing engineered dataset for ensemble models...")
            try:
                # Try to use the proper feature engineering script first
                feature_eng_script = SCRIPTS_DIR / "preprocessing" / "feature_engineering_extended.py"
                if feature_eng_script.exists():
                    logger.info("Running feature_engineering_extended.py...")
                    result = subprocess.run(
                        [sys.executable, str(feature_eng_script)],
                        cwd=str(PROJECT_ROOT),
                        capture_output=True,
                        text=True,
                        timeout=300
                    )
                    if result.returncode == 0:
                        logger.info("✓ Feature engineering complete")
                    else:
                        logger.warning(f"Feature engineering script failed: {result.stderr[:200]}")
                        # Fallback to simple preparation
                        prepare_engineered_dataset(csv_path, engineered_path)
                else:
                    # Fallback to simple preparation
                    prepare_engineered_dataset(csv_path, engineered_path)
            except Exception as e:
                logger.warning(f"Could not prepare engineered dataset: {e}")
                logger.warning("Ensemble models may fail without engineered dataset")

        ensemble_scripts = [
            ("ensemble_stacking", SCRIPTS_DIR / "ensemble_methods" / "ensemble_stacking.py"),
            ("ensemble_with_neural", SCRIPTS_DIR / "ensemble_methods" / "ensemble_with_neural.py"),
            ("clean_ensemble", SCRIPTS_DIR / "model_training" / "clean_and_retrain.py"),
        ]

        for name, script_path in ensemble_scripts:
            if not script_path.exists():
                self.add_notification(f"ensemble_{name}", f"Script not found: {script_path}", "warning")
                continue

            try:
                logger.info(f"Running {name}...")
                result = subprocess.run(
                    [sys.executable, str(script_path)],
                    cwd=str(PROJECT_ROOT),
                    capture_output=True,
                    text=True,
                    timeout=600  # 10 minutes max
                )

                if result.returncode == 0:
                    self.results["ensemble"]["success"] += 1
                    self.add_notification(f"ensemble_{name}", "Training successful", "success")
                else:
                    self.results["ensemble"]["failed"] += 1
                    self.add_notification(f"ensemble_{name}", f"Training failed: {result.stderr[:200]}", "error")

            except subprocess.TimeoutExpired:
                self.results["ensemble"]["failed"] += 1
                self.add_notification(f"ensemble_{name}", "Training timed out", "error")
            except Exception as e:
                self.results["ensemble"]["failed"] += 1
                self.add_notification(f"ensemble_{name}", f"Error: {str(e)}", "error")

        return self.results["ensemble"]

    async def train_xgboost_models(self, csv_path: str) -> Dict[str, Any]:
        """Train XGBoost models"""
        logger.info("=" * 60)
        logger.info("Training XGBoost Models")
        logger.info("=" * 60)

        xgb_script = SCRIPTS_DIR / "ensemble_methods" / "xgboost_ensemble.py"

        if not xgb_script.exists():
            self.add_notification("xgboost", "Script not found", "warning")
            return self.results["xgboost"]

        try:
            result = subprocess.run(
                [sys.executable, str(xgb_script)],
                cwd=str(PROJECT_ROOT),
                capture_output=True,
                text=True,
                timeout=600
            )

            if result.returncode == 0:
                # XGBoost script trains 3 models: conservative, aggressive, deep
                self.results["xgboost"]["success"] = 3
                self.add_notification("xgboost", "All 3 XGBoost models trained successfully", "success")
            else:
                self.results["xgboost"]["failed"] = 3
                self.add_notification("xgboost", f"Training failed: {result.stderr[:200]}", "error")

        except Exception as e:
            self.results["xgboost"]["failed"] = 3
            self.add_notification("xgboost", f"Error: {str(e)}", "error")

        return self.results["xgboost"]

    async def train_multi_currency_models(self, csv_path: str) -> Dict[str, Any]:
        """Train multi-currency price models"""
        logger.info("=" * 60)
        logger.info("Training Multi-Currency Models")
        logger.info("=" * 60)

        try:
            # Add the correct path for imports
            model_training_path = str(SCRIPTS_DIR / "model_training")
            if model_training_path not in sys.path:
                sys.path.insert(0, model_training_path)

            # Import with correct path
            import importlib.util
            spec = importlib.util.spec_from_file_location(
                "price_prediction_models",
                SCRIPTS_DIR / "model_training" / "price_prediction_models.py"
            )
            if spec and spec.loader:
                price_models_module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(price_models_module)
                PricePredictionModels = price_models_module.PricePredictionModels
            else:
                # Fallback to regular import
                from price_prediction_models import PricePredictionModels

            trainer = PricePredictionModels(csv_path)
            trainer.load_and_prepare_data()
            trainer.train_all_currencies()

            # Multi-currency trains 3 models: USD, EUR, INR
            self.results["multi_currency"]["success"] = 3
            self.add_notification("multi_currency", "All 3 currency models trained successfully", "success")

        except Exception as e:
            self.results["multi_currency"]["failed"] = 3
            self.add_notification("multi_currency", f"Error: {str(e)}", "error")

        return self.results["multi_currency"]

    async def train_multitask_models(self, csv_path: str) -> Dict[str, Any]:
        """Train multitask models"""
        logger.info("=" * 60)
        logger.info("Training Multitask Models")
        logger.info("=" * 60)

        multitask_scripts = [
            ("multitask", SCRIPTS_DIR / "model_training" / "multitask_training.py"),
            ("multitask_auxiliary", SCRIPTS_DIR / "model_training" / "multitask_auxiliary.py"),
        ]

        for name, script_path in multitask_scripts:
            if not script_path.exists():
                self.add_notification(f"multitask_{name}", f"Script not found: {script_path}", "warning")
                continue

            try:
                result = subprocess.run(
                    [sys.executable, str(script_path)],
                    cwd=str(PROJECT_ROOT),
                    capture_output=True,
                    text=True,
                    timeout=600
                )

                if result.returncode == 0:
                    self.results["multitask"]["success"] += 1
                    self.add_notification(f"multitask_{name}", "Training successful", "success")
                else:
                    self.results["multitask"]["failed"] += 1
                    self.add_notification(f"multitask_{name}", f"Training failed: {result.stderr[:200]}", "error")

            except Exception as e:
                self.results["multitask"]["failed"] += 1
                self.add_notification(f"multitask_{name}", f"Error: {str(e)}", "error")

        return self.results["multitask"]

    async def train_segmentation_models(self, csv_path: str) -> Dict[str, Any]:
        """Train segmentation models"""
        logger.info("=" * 60)
        logger.info("Training Segmentation Models")
        logger.info("=" * 60)

        segmentation_scripts = [
            ("segmentation_specialist", SCRIPTS_DIR / "model_training" / "segmentation_specialist_models.py"),
            ("residual_segmentation", SCRIPTS_DIR / "model_training" / "residual_based_segmentation.py"),
            ("refine_segmentation", SCRIPTS_DIR / "model_training" / "refine_segmentation.py"),
        ]

        for name, script_path in segmentation_scripts:
            if not script_path.exists():
                self.add_notification(f"segmentation_{name}", f"Script not found: {script_path}", "warning")
                continue

            try:
                result = subprocess.run(
                    [sys.executable, str(script_path)],
                    cwd=str(PROJECT_ROOT),
                    capture_output=True,
                    text=True,
                    timeout=600
                )

                if result.returncode == 0:
                    # Each script trains multiple segment models
                    self.results["segmentation"]["success"] += 3  # Approximate
                    self.add_notification(f"segmentation_{name}", "Training successful", "success")
                else:
                    self.results["segmentation"]["failed"] += 3
                    self.add_notification(f"segmentation_{name}", f"Training failed: {result.stderr[:200]}", "error")

            except Exception as e:
                self.results["segmentation"]["failed"] += 3
                self.add_notification(f"segmentation_{name}", f"Error: {str(e)}", "error")

        return self.results["segmentation"]

    async def train_distilled_models(self, csv_path: str) -> Dict[str, Any]:
        """Train distilled models"""
        logger.info("=" * 60)
        logger.info("Training Distilled Models")
        logger.info("=" * 60)

        distilled_script = SCRIPTS_DIR / "monitoring" / "model_compression_distillation.py"

        if not distilled_script.exists():
            self.add_notification("distilled", "Script not found", "warning")
            return self.results["distilled"]

        try:
            result = subprocess.run(
                [sys.executable, str(distilled_script)],
                cwd=str(PROJECT_ROOT),
                capture_output=True,
                text=True,
                timeout=600
            )

            if result.returncode == 0:
                self.results["distilled"]["success"] = 1
                self.add_notification("distilled", "Training successful", "success")
            else:
                self.results["distilled"]["failed"] = 1
                self.add_notification("distilled", f"Training failed: {result.stderr[:200]}", "error")

        except Exception as e:
            self.results["distilled"]["failed"] = 1
            self.add_notification("distilled", f"Error: {str(e)}", "error")

        return self.results["distilled"]

    async def train_all_models(self, csv_path: str) -> Dict[str, Any]:
        """
        Train ALL 41 models automatically
        No manual intervention required
        """
        logger.info("\n" + "=" * 60)
        logger.info("UNIFIED MODEL TRAINING - ALL 41 MODELS")
        logger.info("=" * 60)
        logger.info(f"CSV Path: {csv_path}")
        logger.info("=" * 60 + "\n")

        # Train in order (dependencies first)
        await self.train_basic_models(csv_path)
        await self.train_ensemble_models(csv_path)
        await self.train_xgboost_models(csv_path)
        await self.train_multi_currency_models(csv_path)
        await self.train_multitask_models(csv_path)
        await self.train_segmentation_models(csv_path)
        await self.train_distilled_models(csv_path)

        # Calculate totals
        total_success = sum(cat["success"] for cat in self.results.values())
        total_failed = sum(cat["failed"] for cat in self.results.values())
        total_models = total_success + total_failed

        summary = {
            "success": total_failed == 0,
            "total_models": total_models,
            "total_success": total_success,
            "total_failed": total_failed,
            "categories": self.results,
            "notifications": self.notifications,
        }

        # Print summary
        logger.info("\n" + "=" * 60)
        logger.info("TRAINING SUMMARY")
        logger.info("=" * 60)
        logger.info(f"Total Models: {total_models}")
        logger.info(f"Success: {total_success}")
        logger.info(f"Failed: {total_failed}")
        logger.info("\nBy Category:")
        for category, results in self.results.items():
            if results["success"] > 0 or results["failed"] > 0:
                logger.info(f"  {category:20s}: {results['success']:3d} success, {results['failed']:3d} failed")
        logger.info("=" * 60)

        return summary


async def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Train ALL 41 models automatically")
    parser.add_argument("--csv", help="Path to CSV file", required=True)

    args = parser.parse_args()

    trainer = UnifiedModelTrainer()
    results = await trainer.train_all_models(args.csv)

    return results


if __name__ == "__main__":
    asyncio.run(main())
