"""
Train ALL Available Models
Automatically detects and trains all models that have training functions
"""

import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# Add paths
sys.path.append(str(Path(__file__).parent))
sys.path.append(str(Path(__file__).parent.parent / "scripts" / "ml_pipeline"))

from automated_training_pipeline import AutomatedTrainingPipeline, MODELS_DIR
from model_versioning import ModelVersionManager

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# All model definitions with their training functions
ALL_MODEL_DEFINITIONS = [
    # Basic sklearn models (always work)
    {
        "name": "price_predictor_sklearn",
        "file": "price_predictor_sklearn.pkl",
        "train_fn": "train_price_model",
        "module": "train_models_sklearn",
        "category": "basic",
    },
    {
        "name": "ram_predictor_sklearn",
        "file": "ram_predictor_sklearn.pkl",
        "train_fn": "train_ram_model",
        "module": "train_models_sklearn",
        "category": "basic",
    },
    {
        "name": "battery_predictor_sklearn",
        "file": "battery_predictor_sklearn.pkl",
        "train_fn": "train_battery_model",
        "module": "train_models_sklearn",
        "category": "basic",
    },
    {
        "name": "brand_classifier_sklearn",
        "file": "brand_classifier_sklearn.pkl",
        "train_fn": "train_brand_model",
        "module": "train_models_sklearn",
        "category": "basic",
    },
]


def detect_available_models() -> List[Dict[str, Any]]:
    """Detect which models exist and can be trained"""
    available = []

    # Check for model files
    if MODELS_DIR.exists():
        model_files = [f for f in os.listdir(MODELS_DIR) if f.endswith('.pkl')]

        # Map files to model definitions
        for model_file in model_files:
            model_name = model_file.replace('.pkl', '')

            # Skip scalers and encoders
            if any(skip in model_name for skip in ['_scalers', '_encoder', 'clusterer']):
                continue

            # Check if we have a training function for it
            model_def = find_training_function(model_name, model_file)
            if model_def:
                available.append(model_def)
            else:
                # Model exists but no training function - mark as manual
                available.append({
                    "name": model_name,
                    "file": model_file,
                    "train_fn": None,
                    "module": None,
                    "category": "manual",
                    "note": "Model exists but requires manual training"
                })

    return available


def find_training_function(model_name: str, model_file: str) -> Optional[Dict[str, Any]]:
    """Find training function for a model"""
    # Check basic models
    for model_def in ALL_MODEL_DEFINITIONS:
        if model_def["name"] == model_name:
            return model_def

    # Check for XGBoost models
    if "xgboost" in model_name:
        xgb_type = model_name.replace("xgboost_", "")
        if xgb_type in ["conservative", "aggressive", "deep"]:
            return {
                "name": model_name,
                "file": model_file,
                "train_fn": f"train_xgboost_{xgb_type}",
                "module": "scripts.ml_pipeline.ensemble_methods.xgboost_ensemble",
                "category": "xgboost",
                "note": "Requires running xgboost_ensemble.py main()"
            }

    # Check for ensemble models
    if "ensemble" in model_name:
        return {
            "name": model_name,
            "file": model_file,
            "train_fn": "main",  # Most ensemble scripts use main()
            "module": "scripts.ml_pipeline.ensemble_methods.ensemble_stacking",
            "category": "ensemble",
            "note": "Requires running ensemble_stacking.py main()"
        }

    # Check for multi-currency models
    if "price_" in model_name and any(c in model_name for c in ["usd", "eur", "inr"]):
        currency = model_name.replace("price_", "").replace("_model", "").upper()
        return {
            "name": model_name,
            "file": model_file,
            "train_fn": f"train_price_{currency.lower()}",
            "module": "scripts.ml_pipeline.model_training.price_prediction_models",
            "category": "multi-currency",
            "note": "Requires PricePredictionModels class"
        }

    return None


async def train_all_detected_models(csv_path: Optional[str] = None) -> Dict[str, Any]:
    """Train all models that can be automatically trained"""

    # Detect available models
    available_models = detect_available_models()

    print(f"\n{'='*60}")
    print(f"Detected {len(available_models)} models")
    print(f"{'='*60}")

    # Categorize
    basic = [m for m in available_models if m.get("category") == "basic"]
    auto_trainable = [m for m in available_models if m.get("train_fn") and m.get("category") != "manual"]
    manual = [m for m in available_models if m.get("category") == "manual"]

    print(f"\nBasic models (auto-trained): {len(basic)}")
    print(f"Auto-trainable models: {len(auto_trainable)}")
    print(f"Manual training required: {len(manual)}")

    # Train basic models using existing pipeline
    pipeline = AutomatedTrainingPipeline()
    basic_results = await pipeline.train_all_models(csv_path)

    results = {
        "detected_models": len(available_models),
        "basic_models": len(basic),
        "auto_trainable": len(auto_trainable),
        "manual_required": len(manual),
        "basic_training": basic_results,
        "available_models": available_models,
        "notifications": basic_results.get("notifications", []),
    }

    return results


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train all available models")
    parser.add_argument("--csv", help="Path to CSV file", default=None)
    parser.add_argument("--list-only", action="store_true", help="Only list models, don't train")

    args = parser.parse_args()

    if args.list_only:
        models = detect_available_models()
        print(f"\n{'='*60}")
        print(f"Available Models: {len(models)}")
        print(f"{'='*60}\n")

        for model in models:
            category = model.get("category", "unknown")
            trainable = "[OK]" if model.get("train_fn") else "[MANUAL]"
            print(f"{trainable} {model['name']:40s} [{category:15s}]")
            if model.get("note"):
                print(f"    -> {model['note']}")

        print(f"\n[OK] = Auto-trainable, [MANUAL] = Manual training required")
    else:
        results = asyncio.run(train_all_detected_models(args.csv))

        print(f"\n{'='*60}")
        print("Training Summary")
        print(f"{'='*60}")
        print(f"Total models detected: {results['detected_models']}")
        print(f"Basic models trained: {results['basic_models']}")
        print(f"Auto-trainable: {results['auto_trainable']}")
        print(f"Manual required: {results['manual_required']}")

        if results.get("basic_training"):
            training = results["basic_training"]
            print(f"\nBasic Training Results:")
            print(f"  Success: {training.get('success_count', 0)}")
            print(f"  Failures: {training.get('failure_count', 0)}")
