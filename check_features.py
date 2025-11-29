import joblib
from pathlib import Path
import os

def load_scaler_safely(file_path):
    """
    Safely load a scaler file with validation.

    This uses joblib instead of pickle for safer deserialization.
    Only loads files from the trusted trained_models directory.
    """
    # Validate path is within expected directory
    expected_dir = Path('python_api/trained_models')
    resolved_path = Path(file_path).resolve()
    expected_path = (Path.cwd() / expected_dir).resolve()

    if not str(resolved_path).startswith(str(expected_path)):
        raise ValueError(f"Unsafe path: {file_path}")

    # Validate file extension
    if not file_path.endswith('_scalers.pkl'):
        raise ValueError(f"Invalid file type: {file_path}")

    # Validate file exists and is reasonable size (< 10MB)
    if not resolved_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    file_size = os.path.getsize(resolved_path)
    if file_size > 10 * 1024 * 1024:  # 10MB limit
        raise ValueError(f"File too large: {file_size} bytes")

    # Load with joblib (safer than pickle)
    loaded_obj = joblib.load(resolved_path)

    # Validate loaded object structure
    if not isinstance(loaded_obj, dict):
        raise ValueError(f"Invalid object type: expected dict, got {type(loaded_obj)}")

    # Validate expected keys for scaler objects
    # Brand classifier might only have X_scaler
    if 'X_scaler' not in loaded_obj:
        raise ValueError(f"Invalid scaler object: missing X_scaler key")

    # Check for y_scaler (not required for brand classifier)
    has_y_scaler = 'y_scaler' in loaded_obj

    # Validate scaler has expected attributes
    if not hasattr(loaded_obj['X_scaler'], 'n_features_in_'):
        raise ValueError("Invalid scaler: missing n_features_in_ attribute")

    return loaded_obj

# Check all scalers
models = ['price', 'ram', 'battery']
for model in models:
    try:
        scaler_path = f'python_api/trained_models/{model}_predictor_scalers.pkl'
        scalers = load_scaler_safely(scaler_path)
        print(f'{model}: {scalers["X_scaler"].n_features_in_} features')
    except Exception as e:
        print(f'{model}: Error - {e}')

# Check brand classifier separately
try:
    scaler_path = 'python_api/trained_models/brand_classifier_scalers.pkl'
    scalers = load_scaler_safely(scaler_path)
    print(f'brand: {scalers["X_scaler"].n_features_in_} features')
except Exception as e:
    print(f'brand: Error - {e}')
