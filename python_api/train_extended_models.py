"""
Train Extended Models (Ensemble, XGBoost, Multi-Currency, etc.)
Runs after basic sklearn models are trained
"""

import asyncio
import logging
import subprocess
import sys
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
SCRIPTS_DIR = PROJECT_ROOT / "scripts" / "ml_pipeline"
PYTHON_API_DIR = Path(__file__).parent


def run_ensemble_training():
    """Train ensemble models"""
    logger.info("Training ensemble models...")
    try:
        ensemble_script = SCRIPTS_DIR / "ensemble_methods" / "ensemble_stacking.py"
        if ensemble_script.exists():
            result = subprocess.run(
                [sys.executable, str(ensemble_script)],
                cwd=str(PROJECT_ROOT),
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                logger.info("✓ Ensemble models trained successfully")
                return True
            else:
                logger.error(f"Ensemble training failed: {result.stderr}")
                return False
        else:
            logger.warning("Ensemble training script not found")
            return False
    except Exception as e:
        logger.error(f"Error training ensemble models: {e}")
        return False


def run_xgboost_training():
    """Train XGBoost models"""
    logger.info("Training XGBoost models...")
    try:
        xgb_script = SCRIPTS_DIR / "ensemble_methods" / "xgboost_ensemble.py"
        if xgb_script.exists():
            result = subprocess.run(
                [sys.executable, str(xgb_script)],
                cwd=str(PROJECT_ROOT),
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                logger.info("✓ XGBoost models trained successfully")
                return True
            else:
                logger.error(f"XGBoost training failed: {result.stderr}")
                return False
        else:
            logger.warning("XGBoost training script not found")
            return False
    except Exception as e:
        logger.error(f"Error training XGBoost models: {e}")
        return False


def run_multi_currency_training(csv_path: str):
    """Train multi-currency price models"""
    logger.info("Training multi-currency models...")
    try:
        # Import and use PricePredictionModels
        sys.path.append(str(SCRIPTS_DIR / "model_training"))
        from price_prediction_models import PricePredictionModels

        trainer = PricePredictionModels(csv_path)
        trainer.train_all_currencies()
        logger.info("✓ Multi-currency models trained successfully")
        return True
    except Exception as e:
        logger.error(f"Error training multi-currency models: {e}")
        return False


async def train_all_extended_models(csv_path: str = None):
    """Train all extended models"""
    if csv_path is None:
        possible_paths = [
            PROJECT_ROOT / "data" / "Mobiles Dataset (2025).csv",
            PROJECT_ROOT / "Mobiles Dataset (2025).csv",
        ]
        for path in possible_paths:
            if path.exists():
                csv_path = str(path)
                break

    if not csv_path or not Path(csv_path).exists():
        logger.error(f"CSV file not found: {csv_path}")
        return {"success": False, "error": "CSV file not found"}

    results = {
        "ensemble": False,
        "xgboost": False,
        "multi_currency": False,
    }

    # Train ensemble models
    results["ensemble"] = run_ensemble_training()

    # Train XGBoost models
    results["xgboost"] = run_xgboost_training()

    # Train multi-currency models
    results["multi_currency"] = run_multi_currency_training(csv_path)

    success_count = sum(1 for v in results.values() if v)
    total_count = len(results)

    logger.info(f"\n{'='*60}")
    logger.info(f"Extended Models Training Summary")
    logger.info(f"{'='*60}")
    logger.info(f"Ensemble: {'✓' if results['ensemble'] else '✗'}")
    logger.info(f"XGBoost: {'✓' if results['xgboost'] else '✗'}")
    logger.info(f"Multi-Currency: {'✓' if results['multi_currency'] else '✗'}")
    logger.info(f"\nSuccess: {success_count}/{total_count}")

    return {
        "success": success_count == total_count,
        "results": results,
        "success_count": success_count,
        "total_count": total_count,
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train extended models")
    parser.add_argument("--csv", help="Path to CSV file", default=None)

    args = parser.parse_args()

    asyncio.run(train_all_extended_models(args.csv))
