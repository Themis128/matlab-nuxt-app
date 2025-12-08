#!/usr/bin/env python3
"""
Test the actual pipeline execution (without training models)
"""

import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

async def test_pipeline_execution():
    """Test the enhanced data pipeline execution"""
    print("=" * 60)
    print("TESTING PIPELINE EXECUTION")
    print("=" * 60)

    try:
        from enhanced_data_pipeline import EnhancedDataPipeline

        # Find CSV file
        csv_path = Path(__file__).parent.parent / "data" / "Mobiles Dataset (2025).csv"

        if not csv_path.exists():
            print(f"❌ CSV file not found: {csv_path}")
            return False

        print(f"✅ CSV file found: {csv_path}")
        print(f"   Size: {csv_path.stat().st_size / 1024:.2f} KB")

        # Initialize pipeline
        print("\n📦 Initializing Enhanced Data Pipeline...")
        pipeline = EnhancedDataPipeline(batch_size=50, max_workers=4)

        # Test with auto_train=False to skip model training (faster test)
        print("\n🔄 Running pipeline (without model training)...")
        print("   This will load CSV data and images into LanceDB")

        results = await pipeline.load_data_and_train(
            csv_path=str(csv_path),
            image_base_dir=str(Path(__file__).parent.parent / "public" / "mobile_images"),
            auto_train=False  # Skip training for faster test
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
            if data_loading.get("errors"):
                print(f"   ⚠️  Errors: {len(data_loading.get('errors', []))}")
        else:
            print("❌ Data loading: FAILED")

        # Training results
        training = results.get("training", {})
        if training.get("skipped"):
            print(f"ℹ️  Model training: SKIPPED ({training.get('message', '')})")
        elif training.get("success"):
            print("✅ Model training: SUCCESS")
        else:
            print("⚠️  Model training: See details below")

        # Overall success
        if results.get("success"):
            print("\n✅ Pipeline execution: SUCCESS")
        else:
            print("\n❌ Pipeline execution: FAILED")
            if results.get("error"):
                print(f"   Error: {results.get('error')}")

        # Notifications
        notifications = results.get("notifications", [])
        if notifications:
            print(f"\n📋 Notifications ({len(notifications)}):")
            for notif in notifications[:5]:  # Show first 5
                status = notif.get("status", "info")
                model = notif.get("model_name", "unknown")
                message = notif.get("message", "")
                icon = "✅" if status == "success" else "⚠️" if status == "warning" else "❌"
                print(f"   {icon} [{status.upper()}] {model}: {message}")
            if len(notifications) > 5:
                print(f"   ... and {len(notifications) - 5} more")

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
    """Run pipeline execution test"""
    success = asyncio.run(test_pipeline_execution())

    print("\n" + "=" * 60)
    if success:
        print("🎉 Pipeline test completed successfully!")
        print("   The data pipeline is working correctly.")
    else:
        print("⚠️  Pipeline test completed with issues.")
        print("   Please review the errors above.")
    print("=" * 60)

    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
