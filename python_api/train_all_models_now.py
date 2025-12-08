#!/usr/bin/env python3
"""
Run the full pipeline to train ALL 41 models
This ensures 100% of models are trained from the pipeline
"""

import asyncio
import os
import sys
from pathlib import Path

# Set environment to train all models
os.environ["TRAIN_ALL_41_MODELS"] = "true"

sys.path.append(str(Path(__file__).parent))

async def train_all_models():
    """Train all models via the enhanced pipeline"""
    print("=" * 60)
    print("TRAINING ALL 41 MODELS FROM PIPELINE")
    print("=" * 60)
    print("\nThis will:")
    print("  1. Load CSV data")
    print("  2. Load images (if available)")
    print("  3. Train ALL 41 models automatically")
    print("  4. Show training progress and results")
    print("\n" + "=" * 60 + "\n")

    try:
        from enhanced_data_pipeline import EnhancedDataPipeline

        # Find CSV file
        csv_path = Path(__file__).parent.parent / "data" / "Mobiles Dataset (2025).csv"

        if not csv_path.exists():
            print(f"❌ CSV file not found: {csv_path}")
            return False

        print(f"✅ CSV file: {csv_path}")

        # Initialize pipeline
        print("\n📦 Initializing Enhanced Data Pipeline...")
        pipeline = EnhancedDataPipeline(batch_size=50, max_workers=4)

        # Run full pipeline with training enabled
        print("\n🔄 Running full pipeline with ALL model training...")
        print("   This may take several minutes...\n")

        results = await pipeline.load_data_and_train(
            csv_path=str(csv_path),
            image_base_dir=str(Path(__file__).parent.parent / "public" / "mobile_images"),
            auto_train=True  # Enable training
        )

        print("\n" + "=" * 60)
        print("PIPELINE RESULTS")
        print("=" * 60)

        # Data loading results
        data_loading = results.get("data_loading", {})
        if data_loading.get("success"):
            print("✅ Data loading: SUCCESS")
            print(f"   Dataset ID: {data_loading.get('dataset_id', 'N/A')}")
            print(f"   Images loaded: {data_loading.get('images_loaded', 0)}")
        else:
            print("❌ Data loading: FAILED")

        # Training results
        training = results.get("training", {})
        if training.get("skipped"):
            print(f"⚠️  Model training: SKIPPED")
        else:
            print("\n📊 Training Summary:")

            # Check each category
            categories = ["basic", "ensemble", "xgboost", "multi_currency", "multitask", "segmentation", "distilled"]
            total_success = 0
            total_failed = 0

            for category in categories:
                cat_results = training.get(category, {})
                success = cat_results.get("success", 0)
                failed = cat_results.get("failed", 0)
                total_success += success
                total_failed += failed

                if success > 0 or failed > 0:
                    status = "✅" if failed == 0 else "⚠️"
                    print(f"   {status} {category.title()}: {success} success, {failed} failed")

            print(f"\n   Total: {total_success} models trained successfully")
            if total_failed > 0:
                print(f"   ⚠️  {total_failed} models failed")

        # Overall success
        if results.get("success"):
            print("\n✅ Pipeline execution: SUCCESS")
        else:
            print("\n⚠️  Pipeline execution: Completed with some issues")

        # Notifications
        notifications = results.get("notifications", [])
        if notifications:
            print(f"\n📋 Training Notifications ({len(notifications)}):")
            success_count = sum(1 for n in notifications if n.get("status") == "success")
            warning_count = sum(1 for n in notifications if n.get("status") == "warning")
            error_count = sum(1 for n in notifications if n.get("status") == "error")

            print(f"   ✅ Success: {success_count}")
            print(f"   ⚠️  Warnings: {warning_count}")
            print(f"   ❌ Errors: {error_count}")

            # Show key notifications
            print("\n   Key notifications:")
            for notif in notifications[:10]:
                status = notif.get("status", "info")
                model = notif.get("model_name", "unknown")
                message = notif.get("message", "")
                icon = "✅" if status == "success" else "⚠️" if status == "warning" else "❌"
                print(f"   {icon} [{status.upper()}] {model}: {message[:60]}")
            if len(notifications) > 10:
                print(f"   ... and {len(notifications) - 10} more")

        return results.get("success", False)

    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Make sure all dependencies are installed")
        return False
    except Exception as e:
        print(f"❌ Pipeline execution failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main function"""
    print("\n" + "=" * 60)
    print("FULL MODEL TRAINING PIPELINE")
    print("=" * 60)
    print("\n⚠️  This will train ALL 41 models and may take 10-30 minutes")
    print("   Press Ctrl+C to cancel\n")

    try:
        success = asyncio.run(train_all_models())

        print("\n" + "=" * 60)
        if success:
            print("🎉 ALL MODELS TRAINING COMPLETE!")
            print("   Run 'python check_models_status.py' to verify all models")
        else:
            print("⚠️  Training completed with some issues.")
            print("   Check notifications above for details.")
        print("=" * 60)

        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user")
        return 1

if __name__ == "__main__":
    sys.exit(main())
