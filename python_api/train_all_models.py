"""
Comprehensive Model Training Script
Trains ALL available models: sklearn, ensemble, xgboost, multi-currency, distilled, etc.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))
sys.path.append(str(Path(__file__).parent.parent / "scripts" / "ml_pipeline"))

from automated_training_pipeline import AutomatedTrainingPipeline
from model_versioning import ModelVersionManager

logger = logging.getLogger(__name__)

# Extended model definitions - ALL models
EXTENDED_MODEL_DEFINITIONS = [
    # Basic sklearn models
    {"name": "price_predictor_sklearn", "file": "price_predictor_sklearn.pkl", "train_fn": "train_price_model", "module": "train_models_sklearn"},
    {"name": "ram_predictor_sklearn", "file": "ram_predictor_sklearn.pkl", "train_fn": "train_ram_model", "module": "train_models_sklearn"},
    {"name": "battery_predictor_sklearn", "file": "battery_predictor_sklearn.pkl", "train_fn": "train_battery_model", "module": "train_models_sklearn"},
    {"name": "brand_classifier_sklearn", "file": "brand_classifier_sklearn.pkl", "train_fn": "train_brand_model", "module": "train_models_sklearn"},

    # XGBoost models
    {"name": "xgboost_conservative", "file": "xgboost_conservative.pkl", "train_fn": "train_xgboost_conservative", "module": "scripts.ml_pipeline.ensemble_methods.xgboost_ensemble"},
    {"name": "xgboost_aggressive", "file": "xgboost_aggressive.pkl", "train_fn": "train_xgboost_aggressive", "module": "scripts.ml_pipeline.ensemble_methods.xgboost_ensemble"},
    {"name": "xgboost_deep", "file": "xgboost_deep.pkl", "train_fn": "train_xgboost_deep", "module": "scripts.ml_pipeline.ensemble_methods.xgboost_ensemble"},

    # Ensemble models
    {"name": "ensemble_stacking_model", "file": "ensemble_stacking_model.pkl", "train_fn": "train_ensemble_stacking", "module": "scripts.ml_pipeline.ensemble_methods.ensemble_stacking"},
    {"name": "clean_ensemble_model", "file": "clean_ensemble_model.pkl", "train_fn": "train_ensemble_stacking", "module": "scripts.ml_pipeline.model_training.clean_and_retrain"},

    # Multi-currency models
    {"name": "price_usd_model", "file": "price_usd_model.pkl", "train_fn": "train_price_usd", "module": "scripts.ml_pipeline.model_training.price_prediction_models"},
    {"name": "price_eur_model", "file": "price_eur_model.pkl", "train_fn": "train_price_eur", "module": "scripts.ml_pipeline.model_training.price_prediction_models"},
    {"name": "price_inr_model", "file": "price_inr_model.pkl", "train_fn": "train_price_inr", "module": "scripts.ml_pipeline.model_training.price_prediction_models"},

    # Multitask models
    {"name": "multitask_model", "file": "multitask_model.pkl", "train_fn": "train_multitask_model", "module": "scripts.ml_pipeline.model_training.multitask_training"},
]


class ExtendedTrainingPipeline(AutomatedTrainingPipeline):
    """Extended pipeline that trains ALL models"""

    async def train_all_extended_models(self, csv_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Train ALL models including ensemble, xgboost, multi-currency, etc.

        Args:
            csv_path: Path to CSV file

        Returns:
            Training results for all models
        """
        # First train basic sklearn models
        basic_results = await self.train_all_models(csv_path)

        # Then train extended models
        extended_results = {"models": {}, "success_count": 0, "failure_count": 0, "notifications": []}

        # Load data once
        if csv_path is None:
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
            return {"success": False, "error": error_msg, **basic_results}

        # Load data
        try:
            from train_models_sklearn import load_and_preprocess_data
            data = load_and_preprocess_data(csv_path)
        except Exception as e:
            error_msg = f"Failed to load data: {str(e)}"
            logger.error(error_msg)
            self.add_notification("pipeline", error_msg, "error", str(e))
            return {"success": False, "error": error_msg, **basic_results}

        # Train extended models
        for model_def in EXTENDED_MODEL_DEFINITIONS[4:]:  # Skip basic models already trained
            model_name = model_def["name"]
            model_file = model_def["file"]
            train_fn_name = model_def["train_fn"]
            module_path = model_def.get("module", "")

            try:
                logger.info(f"Training {model_name}...")
                result = await self._train_extended_model(model_name, model_file, train_fn_name, module_path, data, csv_path)
                extended_results["models"][model_name] = result

                if result.get("success"):
                    extended_results["success_count"] += 1
                else:
                    extended_results["failure_count"] += 1

            except Exception as e:
                error_msg = f"Exception during training {model_name}: {str(e)}"
                logger.error(error_msg)
                self.add_notification(model_name, error_msg, "error", str(e))
                extended_results["models"][model_name] = {"success": False, "error": str(e)}
                extended_results["failure_count"] += 1

        # Combine results
        combined_results = {
            "basic_models": basic_results,
            "extended_models": extended_results,
            "total_success": basic_results.get("success_count", 0) + extended_results["success_count"],
            "total_failures": basic_results.get("failure_count", 0) + extended_results["failure_count"],
            "notifications": basic_results.get("notifications", []) + extended_results["notifications"],
            "success": extended_results["failure_count"] == 0
        }

        return combined_results

    async def _train_extended_model(
        self, model_name: str, model_file: str, train_fn_name: str, module_path: str, data: Any, csv_path: str
    ) -> Dict[str, Any]:
        """Train an extended model (ensemble, xgboost, etc.)"""
        from pathlib import Path
        from automated_training_pipeline import MODELS_DIR

        model_path = MODELS_DIR / model_file

        # Backup current model if it exists
        version_id = None
        if model_path.exists():
            version_id = self.version_manager.backup_model(model_name, model_path)
            if version_id:
                self.add_notification(model_name, f"Backed up previous version: {version_id}", "info")

        try:
            # Import the module and get training function
            if module_path:
                module_parts = module_path.split(".")
                module = __import__(module_path, fromlist=[train_fn_name])
                train_fn = getattr(module, train_fn_name, None)
            else:
                # Try to find in common locations
                train_fn = None
                for module_name in ["train_models_sklearn", "train_models"]:
                    try:
                        module = __import__(module_name)
                        train_fn = getattr(module, train_fn_name, None)
                        if train_fn:
                            break
                    except ImportError:
                        continue

            if not train_fn:
                raise ValueError(f"Training function {train_fn_name} not found in {module_path}")

            # Train model - some functions need different parameters
            if "xgboost" in model_name:
                # XGBoost models might need different data format
                model_result = train_fn()  # Some xgboost scripts are main() functions
            elif "ensemble" in model_name or "multitask" in model_name:
                # Ensemble/multitask might need raw data
                if hasattr(train_fn, "__code__") and "df" in train_fn.__code__.co_varnames:
                    import pandas as pd
                    df = pd.read_csv(csv_path)
                    model_result = train_fn(df)
                else:
                    model_result = train_fn(data)
            elif "price_" in model_name and ("usd" in model_name or "eur" in model_name or "inr" in model_name):
                # Multi-currency models
                from scripts.ml_pipeline.model_training.price_prediction_models import PricePredictionModels
                trainer = PricePredictionModels(csv_path)
                currency = model_name.replace("price_", "").replace("_model", "").upper()
                model_result = trainer.train_price_models(target=f"price_{currency.lower()}")
            else:
                model_result = train_fn(data)

            # Extract score and register version
            score = 0.0
            metadata = {}
            if isinstance(model_result, tuple):
                model, metadata = model_result
            elif isinstance(model_result, dict):
                metadata = model_result
                score = metadata.get("r2", metadata.get("r2_score", metadata.get("accuracy", 0.0)))
            else:
                # Try to extract from saved metadata file
                try:
                    import json
                    metadata_file = MODELS_DIR / f"{model_name.replace('_model', '')}_metadata.json"
                    if metadata_file.exists():
                        with open(metadata_file, 'r') as f:
                            metadata = json.load(f)
                            score = metadata.get("r2", metadata.get("r2_score", metadata.get("accuracy", 0.0)))
                except:
                    pass

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
                # Rollback
                rollback_success, rollback_error = self.version_manager.rollback_model(model_name)
                if rollback_success:
                    self.add_notification(
                        model_name,
                        f"Training completed but score worse ({score:.4f}). Rolled back.",
                        "warning",
                        error_message,
                    )
                    return {
                        "success": False,
                        "score": score,
                        "rolled_back": True,
                        "error": error_message,
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


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train ALL models")
    parser.add_argument("--csv", help="Path to CSV file", default=None)
    parser.add_argument("--basic-only", action="store_true", help="Only train basic sklearn models")

    args = parser.parse_args()

    pipeline = ExtendedTrainingPipeline()

    if args.basic_only:
        results = asyncio.run(pipeline.train_all_models(args.csv))
    else:
        results = asyncio.run(pipeline.train_all_extended_models(args.csv))

    print("\n=== Training Summary ===")
    print(f"Total Success: {results.get('total_success', results.get('success_count', 0))}")
    print(f"Total Failures: {results.get('total_failures', results.get('failure_count', 0))}")
    print(f"\nNotifications ({len(results.get('notifications', []))}):")
    for notification in results.get("notifications", []):
        status = notification.get("status", "info").upper()
        model = notification.get("model_name", "unknown")
        message = notification.get("message", "")
        print(f"  [{status}] {model}: {message}")
