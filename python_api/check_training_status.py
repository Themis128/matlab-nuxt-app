"""
Check if model training has completed
"""

from pathlib import Path

MODELS_DIR = Path(__file__).parent / "trained_models"

required_files = {
    "price": ["price_predictor_sklearn.pkl", "price_predictor_scalers.pkl", "price_predictor_metadata.json"],
    "ram": ["ram_predictor_sklearn.pkl", "ram_predictor_scalers.pkl", "ram_predictor_metadata.json"],
    "battery": ["battery_predictor_sklearn.pkl", "battery_predictor_scalers.pkl", "battery_predictor_metadata.json"],
    "brand": ["brand_classifier_sklearn.pkl", "brand_classifier_scalers.pkl", "brand_classifier_metadata.json"],
}

print("=" * 60)
print("Training Status Check")
print("=" * 60)
print()

if not MODELS_DIR.exists():
    print("WARNING: Models directory does not exist yet.")
    print("   Training may still be in progress...")
    print()
    print("To start training:")
    print("  python train_models_sklearn.py")
    exit(1)

print(f"Models directory: {MODELS_DIR}")
print()

all_complete = True
for model_name, files in required_files.items():
    print(f"{model_name.upper()} Model:")
    model_complete = True
    for file in files:
        file_path = MODELS_DIR / file
        if file_path.exists():
            size = file_path.stat().st_size
            print(f"  [OK] {file} ({size:,} bytes)")
        else:
            print(f"  [MISSING] {file}")
            model_complete = False
            all_complete = False

    if model_complete:
        print(f"  [READY] {model_name.capitalize()} model is ready!")
    else:
        print(f"  [INCOMPLETE] {model_name.capitalize()} model is incomplete")
    print()

if all_complete:
    print("=" * 60)
    print("SUCCESS: ALL MODELS TRAINED AND READY!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Start API: python api.py")
    print("2. Test API: python test_api.py")
    print("3. Start Nuxt: npm run dev")
    print()
else:
    print("=" * 60)
    print("WARNING: Training in progress or incomplete")
    print("=" * 60)
    print()
    print("Wait for training to complete, or run:")
    print("  python train_models_sklearn.py")
