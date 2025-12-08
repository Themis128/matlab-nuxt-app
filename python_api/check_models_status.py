#!/usr/bin/env python3
"""
Check which models are trained and verify if they were trained from the pipeline
"""

import sys
from pathlib import Path
from datetime import datetime

sys.path.append(str(Path(__file__).parent))

def check_trained_models():
    """Check what models are currently trained"""
    print("=" * 60)
    print("TRAINED MODELS STATUS")
    print("=" * 60)

    trained_models_dir = Path(__file__).parent / "trained_models"

    if not trained_models_dir.exists():
        print("❌ trained_models directory not found")
        return

    # Get all .pkl files
    model_files = list(trained_models_dir.glob("*.pkl"))

    print(f"\n📊 Total model files: {len(model_files)}")

    # Expected models (41 total)
    expected_models = {
        # Basic Sklearn (4)
        "price_predictor_sklearn.pkl",
        "ram_predictor_sklearn.pkl",
        "battery_predictor_sklearn.pkl",
        "brand_classifier_sklearn.pkl",

        # XGBoost (3)
        "xgboost_conservative.pkl",
        "xgboost_aggressive.pkl",
        "xgboost_deep.pkl",

        # Ensemble (14)
        "ensemble_stacking_model.pkl",
        "clean_ensemble_model.pkl",
        "ensemble_base_elasticnet.pkl",
        "ensemble_base_gradient_boosting.pkl",
        "ensemble_base_lightgbm.pkl",
        "ensemble_base_random_forest.pkl",
        "ensemble_meta_learner.pkl",
        "ensemble_neural_gradient_boosting.pkl",
        "ensemble_neural_lightgbm.pkl",
        "ensemble_neural_meta_learner.pkl",
        "ensemble_neural_mlp.pkl",
        "ensemble_neural_mlp_deep.pkl",
        "ensemble_neural_random_forest.pkl",
        "ensemble_neural_scaler.pkl",

        # Multi-Currency (3)
        "price_usd_model.pkl",
        "price_eur_model.pkl",
        "price_inr_model.pkl",

        # Multitask (2)
        "multitask_model.pkl",
        "multitask_auxiliary_model.pkl",

        # Distilled (1) - Pipeline creates distilled_price_model.pkl
        "distilled_price_model.pkl",  # This is the actual file created by pipeline
    }

    # Get actual model names
    actual_models = {f.name for f in model_files}

    # Check which expected models are present
    # Note: distilled_price_model.pkl is the actual file (not distilled_model.pkl)
    found_models = actual_models.intersection(expected_models)
    missing_models = expected_models - actual_models
    # Remove distilled_model.pkl from missing if distilled_price_model.pkl exists
    if "distilled_price_model.pkl" in actual_models:
        missing_models.discard("distilled_model.pkl")
        found_models.add("distilled_price_model.pkl")
    extra_models = actual_models - expected_models

    print(f"\n✅ Expected models found: {len(found_models)}/{len(expected_models)}")
    print(f"📦 Extra models (not in expected list): {len(extra_models)}")

    # Categorize found models
    basic_sklearn = [m for m in found_models if "sklearn" in m]
    xgboost = [m for m in found_models if "xgboost" in m]
    ensemble = [m for m in found_models if "ensemble" in m]
    multi_currency = [m for m in found_models if any(c in m for c in ["usd", "eur", "inr"]) and "price" in m]
    multitask = [m for m in found_models if "multitask" in m]
    distilled = [m for m in found_models if "distilled" in m]
    segmentation = [m for m in found_models if "segment" in m]

    print("\n" + "=" * 60)
    print("MODEL BREAKDOWN")
    print("=" * 60)
    print(f"✅ Basic Sklearn: {len(basic_sklearn)}/4")
    for m in sorted(basic_sklearn):
        print(f"   - {m}")

    print(f"\n✅ XGBoost: {len(xgboost)}/3")
    for m in sorted(xgboost):
        print(f"   - {m}")

    print(f"\n✅ Ensemble: {len(ensemble)}/14")
    for m in sorted(ensemble)[:5]:
        print(f"   - {m}")
    if len(ensemble) > 5:
        print(f"   ... and {len(ensemble) - 5} more")

    print(f"\n✅ Multi-Currency: {len(multi_currency)}/3")
    for m in sorted(multi_currency):
        print(f"   - {m}")

    print(f"\n✅ Multitask: {len(multitask)}/2")
    for m in sorted(multitask):
        print(f"   - {m}")

    print(f"\n✅ Distilled: {len(distilled)}/1")
    for m in sorted(distilled):
        print(f"   - {m}")

    print(f"\n✅ Segmentation: {len(segmentation)}")
    for m in sorted(segmentation)[:5]:
        print(f"   - {m}")
    if len(segmentation) > 5:
        print(f"   ... and {len(segmentation) - 5} more")

    if missing_models:
        # Filter out distilled_model.pkl if distilled_price_model.pkl exists
        filtered_missing = missing_models.copy()
        if "distilled_price_model.pkl" in actual_models:
            filtered_missing.discard("distilled_model.pkl")

        if filtered_missing:
            print(f"\n⚠️  Missing models ({len(filtered_missing)}):")
            for m in sorted(filtered_missing)[:10]:
                print(f"   - {m}")
            if len(filtered_missing) > 10:
                print(f"   ... and {len(filtered_missing) - 10} more")
        else:
            print("\n✅ No missing models (all expected models found)")

    if extra_models:
        print(f"\n📦 Extra models ({len(extra_models)}):")
        for m in sorted(extra_models)[:10]:
            print(f"   - {m}")
        if len(extra_models) > 10:
            print(f"   ... and {len(extra_models) - 10} more")

    # Check model versions
    print("\n" + "=" * 60)
    print("MODEL VERSIONING")
    print("=" * 60)

    try:
        from model_versioning import ModelVersionManager
        version_manager = ModelVersionManager()

        # Get all models with versioning
        all_models = version_manager.list_all_models()

        if all_models:
            print(f"✅ Models with versioning: {len(all_models)}")

            # Get version info for key models
            key_models = [
                "price_predictor_sklearn",
                "ram_predictor_sklearn",
                "battery_predictor_sklearn",
                "brand_classifier_sklearn",
            ]

            print("\nKey Models Version Info:")
            for model_name in key_models:
                if model_name in all_models:
                    versions = version_manager.get_model_versions(model_name)
                    model_info = version_manager.get_model_info(model_name)

                    if versions:
                        latest = versions[0]  # Newest version
                        current_version = model_info.get("current_version") if model_info else None
                        is_current = latest.get("version_id") == current_version if current_version else True

                        status_icon = "✅" if is_current else "📦"
                        print(f"{status_icon} {model_name}:")
                        print(f"   Current Version: {current_version or latest.get('version_id', 'N/A')}")
                        print(f"   Latest Score: {latest.get('score', 'N/A')}")
                        if latest.get('previous_score') is not None:
                            prev_score = latest.get('previous_score')
                            curr_score = latest.get('score', 0)
                            if prev_score and prev_score > 0:
                                improvement = ((curr_score - prev_score) / prev_score * 100)
                                print(f"   Previous Score: {prev_score:.4f} ({improvement:+.2f}% change)")
                        print(f"   Status: {latest.get('status', 'N/A')}")
                        date_str = latest.get('registration_time') or latest.get('backup_time', 'N/A')
                        if date_str != 'N/A' and 'T' in str(date_str):
                            # Format ISO date
                            try:
                                from datetime import datetime
                                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                                date_str = dt.strftime('%Y-%m-%d %H:%M:%S')
                            except:
                                pass
                        print(f"   Date: {date_str}")
                        print(f"   Total Versions: {len(versions)}")
                    else:
                        # Try to get current score if no versions
                        current_score = version_manager.get_current_score(model_name)
                        if current_score is not None:
                            print(f"ℹ️  {model_name}:")
                            print(f"   Score: {current_score:.4f}")
                            print(f"   Status: No version history (may be legacy model)")
                        else:
                            print(f"⚠️  {model_name}: No version info")
                else:
                    print(f"ℹ️  {model_name}: Not in versioning system (may be new)")

            # Summary
            total_versions = sum(
                len(version_manager.get_model_versions(model))
                for model in all_models
            )
            active_models = sum(
                1 for model in all_models
                if version_manager.get_current_version(model) is not None
            )
            print(f"\n📊 Versioning Summary:")
            print(f"   Models tracked: {len(all_models)}")
            print(f"   Active models: {active_models}")
            print(f"   Total versions: {total_versions}")
            if len(all_models) > 0:
                print(f"   Avg versions per model: {total_versions / len(all_models):.1f}")
        else:
            print("ℹ️  No models in versioning system yet")
            print("   Models will be tracked after first training with versioning enabled")

    except ImportError as e:
        print(f"⚠️  Could not import ModelVersionManager: {e}")
    except Exception as e:
        print(f"⚠️  Could not check versioning: {e}")
        import traceback
        traceback.print_exc()

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    # Adjust expected count - distilled_price_model.pkl counts as distilled_model.pkl
    total_expected = len(expected_models)
    if "distilled_price_model.pkl" in found_models:
        total_expected = 27  # Original expected count (distilled_price_model counts as distilled_model)
    total_found = len(found_models)
    coverage = (total_found / total_expected * 100) if total_expected > 0 else 0

    print(f"Expected models: {total_expected}")
    print(f"Found models: {total_found}")
    print(f"Coverage: {coverage:.1f}%")

    if coverage >= 90:
        print("\n✅ Excellent! Most models are trained.")
    elif coverage >= 70:
        print("\n⚠️  Good coverage, but some models are missing.")
    else:
        print("\n❌ Many models are missing. Consider running full training pipeline.")

    # Check if pipeline was used
    print("\n" + "=" * 60)
    print("PIPELINE STATUS")
    print("=" * 60)

    if len(basic_sklearn) == 4 and len(ensemble) > 0 and len(xgboost) > 0:
        print("✅ Models appear to be trained from the pipeline")
        print("   (Basic sklearn + ensemble + xgboost models present)")
    elif len(basic_sklearn) == 4:
        print("⚠️  Only basic 4 models trained (pipeline may have been run with TRAIN_ALL_41_MODELS=false)")
    else:
        print("❌ Models may not have been trained from the pipeline")
        print("   (Missing basic sklearn models)")

if __name__ == "__main__":
    check_trained_models()
