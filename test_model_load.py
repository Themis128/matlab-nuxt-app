import pickle
from pathlib import Path

model_path = Path("python_api/trained_models/distilled_price_model.pkl")

print(f"Loading model from: {model_path}")
print(f"File exists: {model_path.exists()}")
print(f"File size: {model_path.stat().st_size / 1024:.2f} KB")

try:
    # Security: Comprehensive file validation before loading
    if model_path.stat().st_size > 100 * 1024 * 1024:  # 100MB limit
        raise ValueError("Model file too large (>100MB)")

    # Only load from trusted paths in development/test environment
    import os
    expected_path = os.path.abspath(os.path.join('python_api', 'trained_models'))
    actual_path = os.path.abspath(model_path)

    if not actual_path.startswith(expected_path):
        raise ValueError("Model file not in expected trusted directory")

    # Additional security: Check file extension and basic integrity
    if model_path.suffix != '.pkl':
        raise ValueError("Invalid file extension - must be .pkl")

    # Verify file is not empty and contains expected pickle header
    with open(model_path, 'rb') as f:
        header = f.read(2)
        if header != b'\x80\x03':  # Python 3 pickle protocol 3 header
            raise ValueError("Invalid pickle file format")

        # Reset file pointer and load
        f.seek(0)
        # SECURITY: Only load in controlled test environment
        # In production, consider safer alternatives like joblib with validation
        model = pickle.load(f)

    print(f"✓ Model loaded: {type(model).__name__}")
    print(f"✓ Features: {model.n_features_in_}")
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
