"""
Automated Training Pipeline
Automatically trains all models after data loading, with versioning and rollback
"""

import asyncio
import logging
import traceback
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from model_versioning import ModelVersionManager

logger = logging.getLogger(__name__)

# Import training functions
try:
    from train_models_sklearn import (
        load_and_preprocess_data,
        train_battery_model,
        train_brand_model,
        train_price_model,
        train_ram_model,
    )

    SKLEARN_AVAILABLE = True
except ImportError as e:
    logger.warning(f"sklearn training not available: {e}")
    SKLEARN_AVAILABLE = False

try:
    from train_models import (
        load_and_preprocess_data as load_tf_data,
        train_battery_model as train_tf_battery,
        train_brand_model as train_tf_brand,
        train_price_model as train_tf_price,
        train_ram_model as train_tf_ram,
    )

    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False

# Models directory
MODELS_DIR = Path(__file__).parent / "trained_models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Model definitions - Basic sklearn models (always trained)
MODEL_DEFINITIONS = [
    {"name": "price_predictor_sklearn", "file": "price_predictor_sklearn.pkl", "train_fn": "train_price_model"},
    {"name": "ram_predictor_sklearn", "file": "ram_predictor_sklearn.pkl", "train_fn": "train_ram_model"},
    {"name": "battery_predictor_sklearn", "file": "battery_predictor_sklearn.pkl", "train_fn": "train_battery_model"},
    {"name": "brand_classifier_sklearn", "file": "brand_classifier_sklearn.pkl", "train_fn": "train_brand_model"},
]

# Extended model definitions - Additional models (optional, can be enabled)
EXTENDED_MODEL_DEFINITIONS = [
    # Note: These models may require different data formats or have different training interfaces
    # They are kept separate so basic training always works
    # To enable extended models, use train_all_models.py script
]


class AutomatedTrainingPipeline:
    """Automated training pipeline with versioning and rollback"""

    def __init__(self, csv_path: Optional[str] = None):
        self.csv_path = csv_path
        self.version_manager = ModelVersionManager()
        self.notifications: List[Dict[str, Any]] = []
        self.training_results: Dict[str, Any] = {}

    def add_notification(self, model_name: str, message: str, status: str = "info", error: Optional[str] = None):
        """Add a notification message"""
        notification = {
            "model_name": model_name,
            "message": message,
            "status": status,  # info, success, warning, error
            "error": error,
            "timestamp": datetime.now().isoformat(),
        }
        self.notifications.append(notification)
        logger.info(f"[{status.upper()}] {model_name}: {message}")

    def get_notifications(self) -> List[Dict[str, Any]]:
        """Get all notifications"""
        return self.notifications.copy()

    def clear_notifications(self):
        """Clear all notifications"""
        self.notifications.clear()

    async def train_all_models(self, csv_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Train all models automatically after data loading

        Args:
            csv_path: Path to CSV file (uses default if None)

        Returns:
            Training results dictionary
        """
        csv_path = csv_path or self.csv_path
        if not csv_path:
            # Try to find default CSV
            possible_paths = [
                "../data/Mobiles Dataset (2025).csv",
                "data/Mobiles Dataset (2025).csv",
                "../Mobiles Dataset (2025).csv",
            ]
            for path in possible_paths:
                if Path(path).exists():
                    csv_path = path
                    break

        if not csv_path or not Path(csv_path).exists():
            error_msg = f"CSV file not found: {csv_path}"
            self.add_notification("pipeline", error_msg, "error", error_msg)
            return {"success": False, "error": error_msg, "notifications": self.get_notifications()}

        logger.info(f"Starting automated training pipeline with CSV: {csv_path}")

        # Load and preprocess data
        try:
            logger.info("Loading and preprocessing data...")
            if SKLEARN_AVAILABLE:
                data = load_and_preprocess_data(csv_path)
            elif TENSORFLOW_AVAILABLE:
                data = load_tf_data(csv_path)
            else:
                error_msg = "No training modules available (sklearn or tensorflow)"
                self.add_notification("pipeline", error_msg, "error", error_msg)
                return {"success": False, "error": error_msg, "notifications": self.get_notifications()}

            logger.info("Data loaded and preprocessed successfully")
        except Exception as e:
            error_msg = f"Failed to load data: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            self.add_notification("pipeline", error_msg, "error", str(e))
            return {"success": False, "error": error_msg, "notifications": self.get_notifications()}

        # Train each model
        results = {"models": {}, "success_count": 0, "failure_count": 0, "notifications": []}

        for model_def in MODEL_DEFINITIONS:
            model_name = model_def["name"]
            model_file = model_def["file"]
            train_fn_name = model_def["train_fn"]

            try:
                logger.info(f"Training {model_name}...")
                result = await self._train_single_model(model_name, model_file, train_fn_name, data)
                results["models"][model_name] = result

                if result["success"]:
                    results["success_count"] += 1
                else:
                    results["failure_count"] += 1

            except Exception as e:
                error_msg = f"Exception during training {model_name}: {str(e)}"
                logger.error(error_msg)
                logger.error(traceback.format_exc())
                self.add_notification(model_name, error_msg, "error", str(e))
                results["models"][model_name] = {"success": False, "error": str(e)}

        results["notifications"] = self.get_notifications()
        results["success"] = results["failure_count"] == 0

        logger.info(f"Training pipeline completed: {results['success_count']} success, {results['failure_count']} failures")
        return results

    async def _train_single_model(
        self, model_name: str, model_file: str, train_fn_name: str, data: Any
    ) -> Dict[str, Any]:
        """Train a single model with versioning and rollback"""
        model_path = MODELS_DIR / model_file

        # Backup current model if it exists
        version_id = None
        if model_path.exists():
            version_id = self.version_manager.backup_model(model_name, model_path)
            if version_id:
                self.add_notification(model_name, f"Backed up previous version: {version_id}", "info")
            else:
                self.add_notification(model_name, "Warning: Could not backup previous version", "warning")

        try:
            # Get training function
            train_fn = None
            if SKLEARN_AVAILABLE:
                # Import and get function from train_models_sklearn module
                import train_models_sklearn

                train_fn = getattr(train_models_sklearn, train_fn_name, None)
            elif TENSORFLOW_AVAILABLE:
                # Import and get function from train_models module
                import train_models

                train_fn = getattr(train_models, train_fn_name, None)
            else:
                raise ImportError("No training modules available")

            if not train_fn:
                raise ValueError(f"Training function not found: {train_fn_name}")

            # Train model
            logger.info(f"Calling training function: {train_fn_name}")
            model_result = train_fn(data)

            # Extract model and metadata
            if isinstance(model_result, tuple):
                model, metadata = model_result
            else:
                model = model_result
                metadata = {}

            # Get score from metadata
            score = None
            if metadata:
                # Try different score keys (check nested structures too)
                score = (
                    metadata.get("r2_score")
                    or metadata.get("r2")  # Some models use 'r2' instead of 'r2_score'
                    or metadata.get("test_r2_score")
                    or metadata.get("test_r2")
                    or metadata.get("accuracy")
                    or metadata.get("test_accuracy")
                    or metadata.get("test_score")
                    or metadata.get("score")
                    or metadata.get("metrics", {}).get("r2_score")
                    or metadata.get("metrics", {}).get("r2")
                    or metadata.get("metrics", {}).get("accuracy")
                    or metadata.get("performance", {}).get("r2_score")
                    or metadata.get("performance", {}).get("r2")
                    or metadata.get("performance", {}).get("accuracy")
                )

                # If still None, try to find any numeric value that looks like a score
                if score is None:
                    for key, value in metadata.items():
                        if isinstance(value, (int, float)) and 0 <= value <= 1:
                            score = value
                            logger.info(f"Found score in metadata['{key}']: {score}")
                            break

            if score is None:
                logger.warning(f"Could not extract score from metadata for {model_name}. Metadata keys: {list(metadata.keys()) if metadata else 'None'}")
                # Try to read from saved metadata file
                try:
                    import json
                    metadata_file = MODELS_DIR / f"{model_name.replace('_sklearn', '')}_metadata.json"
                    if metadata_file.exists():
                        with open(metadata_file, 'r') as f:
                            file_metadata = json.load(f)
                            score = (
                                file_metadata.get("r2_score")
                                or file_metadata.get("r2")  # Check for 'r2' key
                                or file_metadata.get("test_r2_score")
                                or file_metadata.get("test_r2")
                                or file_metadata.get("accuracy")
                                or file_metadata.get("test_accuracy")
                                or 0.0
                            )
                            if score:
                                logger.info(f"Loaded score from metadata file: {score}")
                except Exception as e:
                    logger.warning(f"Could not load score from metadata file: {e}")

                if score is None:
                    score = 0.0  # Default score if not available

            # Register new version
            should_keep, error_message = self.version_manager.register_new_version(
                model_name, model_path, score, version_id
            )

            if should_keep:
                self.add_notification(
                    model_name,
                    f"Training successful! Score: {score:.4f} (kept new model)",
                    "success",
                )
                return {
                    "success": True,
                    "score": score,
                    "version_id": version_id,
                    "message": "Model trained and kept",
                }
            else:
                # Rollback to previous version
                rollback_success, rollback_error = self.version_manager.rollback_model(model_name)

                if rollback_success:
                    self.add_notification(
                        model_name,
                        f"Training completed but score worse ({score:.4f}). Rolled back to previous version.",
                        "warning",
                        error_message,
                    )
                    return {
                        "success": False,
                        "score": score,
                        "rolled_back": True,
                        "error": error_message,
                        "message": "Model trained but rolled back due to worse score",
                    }
                else:
                    self.add_notification(
                        model_name,
                        f"Training failed and rollback failed: {rollback_error}",
                        "error",
                        f"{error_message}. Rollback error: {rollback_error}",
                    )
                    return {
                        "success": False,
                        "score": score,
                        "rolled_back": False,
                        "error": f"{error_message}. Rollback error: {rollback_error}",
                    }

        except Exception as e:
            error_msg = f"Training failed: {str(e)}"
            logger.error(f"Error training {model_name}: {error_msg}")
            logger.error(traceback.format_exc())

            # Try to rollback
            rollback_success, rollback_error = self.version_manager.rollback_model(model_name)

            if rollback_success:
                self.add_notification(
                    model_name,
                    f"Training broke. Rolled back to previous version.",
                    "error",
                    str(e),
                )
                return {
                    "success": False,
                    "rolled_back": True,
                    "error": str(e),
                    "message": "Training failed, rolled back to previous version",
                }
            else:
                self.add_notification(
                    model_name,
                    f"Training broke and rollback failed: {rollback_error}",
                    "error",
                    f"{str(e)}. Rollback error: {rollback_error}",
                )
                return {
                    "success": False,
                    "rolled_back": False,
                    "error": f"{str(e)}. Rollback error: {rollback_error}",
                }
