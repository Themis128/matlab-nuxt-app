import pickle
from pathlib import Path

model_path = Path("python_api/trained_models/distilled_price_model.pkl")

print(f"Loading model from: {model_path}")
print(f"File exists: {model_path.exists()}")
print(f"File size: {model_path.stat().st_size / 1024:.2f} KB")

try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    print(f"✓ Model loaded: {type(model).__name__}")
    print(f"✓ Features: {model.n_features_in_}")
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
