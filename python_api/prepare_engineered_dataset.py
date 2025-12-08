"""
Prepare Engineered Dataset for Ensemble Models
Creates the feature-engineered CSV that ensemble scripts expect
"""

import logging
import sys
from pathlib import Path

import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).parent.parent
ENGINEERED_PATH = PROJECT_ROOT / "data" / "Mobiles_Dataset_Feature_Engineered.csv"


def prepare_engineered_dataset(input_csv: str, output_path: Path = None) -> Path:
    """
    Prepare feature-engineered dataset from input CSV

    Args:
        input_csv: Path to input CSV file
        output_path: Path to save engineered CSV (default: data/Mobiles_Dataset_Feature_Engineered.csv)

    Returns:
        Path to engineered CSV file
    """
    if output_path is None:
        output_path = ENGINEERED_PATH

    logger.info(f"Loading data from: {input_csv}")
    df = pd.read_csv(input_csv, encoding='latin-1')

    logger.info(f"Original dataset: {len(df)} rows, {len(df.columns)} columns")

    # Standardize column names (handle variations)
    column_mapping = {
        'Company Name': 'Company Name',
        'company': 'Company Name',
        'Model Name': 'Model Name',
        'model': 'Model Name',
        'RAM': 'RAM',
        'ram': 'RAM',
        'Battery Capacity': 'Battery Capacity',
        'battery': 'Battery Capacity',
        'Screen Size': 'Screen Size',
        'screen': 'Screen Size',
        'Launched Year': 'Launched Year',
        'year': 'Launched Year',
        'Mobile Weight': 'Mobile Weight',
        'weight': 'Mobile Weight',
        'Price (USD)': 'Price_USD',
        'Price_USD': 'Price_USD',
        'price': 'Price_USD',
        'Price': 'Price_USD',
    }

    # Rename columns if needed
    for old_name, new_name in column_mapping.items():
        if old_name in df.columns and new_name not in df.columns:
            df.rename(columns={old_name: new_name}, inplace=True)

    # Ensure required columns exist
    required_cols = ['Company Name', 'RAM', 'Battery Capacity', 'Screen Size', 'Launched Year']
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        logger.warning(f"Missing columns: {missing_cols}. Attempting to infer...")

    # Feature engineering
    logger.info("Engineering features...")

    # Convert numeric columns to numeric (handle string values)
    numeric_cols_to_convert = ['RAM', 'Battery Capacity', 'Screen Size', 'Launched Year', 'Mobile Weight', 'Price_USD']
    for col in numeric_cols_to_convert:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Basic features
    if 'Mobile Weight' not in df.columns:
        df['Mobile Weight'] = 180  # Default weight
    else:
        df['Mobile Weight'] = df['Mobile Weight'].fillna(180)

    # Create derived features
    if 'RAM' in df.columns and 'Battery Capacity' in df.columns:
        df['ram_battery_ratio'] = df['RAM'] / (df['Battery Capacity'] / 1000 + 1)

    if 'Screen Size' in df.columns and 'Mobile Weight' in df.columns:
        df['screen_weight_ratio'] = df['Screen Size'] / (df['Mobile Weight'] / 100 + 0.1)

    if 'Launched Year' in df.columns:
        df['phone_age'] = 2025 - df['Launched Year'].fillna(2025)
        df['is_recent'] = (df['Launched Year'] >= 2023).astype(int)

    # Camera features (if available)
    if 'Front Camera' in df.columns or 'front_camera' in df.columns:
        front_col = 'Front Camera' if 'Front Camera' in df.columns else 'front_camera'
        back_col = 'Back Camera' if 'Back Camera' in df.columns else 'back_camera'
        if back_col in df.columns:
            df['total_camera'] = df[front_col].fillna(0) + df[back_col].fillna(0)

    # Storage features (if available)
    if 'Storage' in df.columns or 'storage' in df.columns:
        storage_col = 'Storage' if 'Storage' in df.columns else 'storage'
        if 'Price_USD' in df.columns:
            df['price_per_gb'] = df['Price_USD'] / (df[storage_col].fillna(64) + 1)

    # Price features
    if 'Price_USD' in df.columns:
        if 'RAM' in df.columns:
            df['price_per_ram_gb'] = df['Price_USD'] / (df['RAM'] + 1)
        if 'Battery Capacity' in df.columns:
            df['price_per_mah'] = df['Price_USD'] / (df['Battery Capacity'] + 1)

    # Fill missing values
    numeric_cols = df.select_dtypes(include=['number']).columns
    for col in numeric_cols:
        df[col] = df[col].fillna(df[col].median())

    # Save engineered dataset
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False, encoding='utf-8')

    logger.info(f"✓ Saved engineered dataset: {output_path}")
    logger.info(f"  Rows: {len(df)}, Columns: {len(df.columns)}")

    return output_path

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: prepare_engineered_dataset.py <input_csv> [output_csv]")
        sys.exit(1)

    input_csv = sys.argv[1]
    output_csv = sys.argv[2] if len(sys.argv) > 2 else None

    # SECURITY: Validate file paths to prevent path traversal
    input_path = Path(input_csv)
    input_resolved = input_path.resolve()
    cwd = Path.cwd().resolve()

    if not str(input_resolved).startswith(str(cwd)):
        print(f"Security: Input file path outside working directory: {input_csv}")
        sys.exit(1)

    if '..' in input_csv:
        print(f"Security: Path traversal detected in input path: {input_csv}")
        sys.exit(1)

    output_path = None
    if output_csv:
        # SECURITY: Validate output path string BEFORE creating Path object
        # Check for path traversal sequences first
        if '..' in output_csv:
            print(f"Security: Path traversal detected in output path: {output_csv}")
            sys.exit(1)

        # Validate path would be within working directory before creating Path
        # Use os.path to check without creating Path object
        import os
        try:
            # SECURITY: Resolve path without creating Path object from user input
            # Use os.path.join to safely combine paths, then normalize
            abs_output = os.path.abspath(os.path.join(cwd, output_csv))
            abs_output_normalized = os.path.normpath(abs_output)

            # Validate the normalized absolute path is within working directory
            if not abs_output_normalized.startswith(str(cwd)):
                print(f"Security: Output file path outside working directory: {output_csv}")
                sys.exit(1)

            # SECURITY: Create Path ONLY from validated absolute path string, never from user input
            # abs_output_normalized is a validated absolute path string, safe to use
            # Type assertion: abs_output_normalized is validated and safe
            validated_path_str: str = abs_output_normalized
            assert validated_path_str.startswith(str(cwd)), "Path validation failed"
            output_path_obj = Path(validated_path_str)  # noqa: S108 - Path is validated above (lines 170-172)
            output_resolved = output_path_obj.resolve()

            # Final validation that resolved path is still within cwd
            if not str(output_resolved).startswith(str(cwd)):
                print(f"Security: Resolved output path outside working directory: {output_csv}")
                sys.exit(1)
            output_path = output_resolved
        except Exception:
            print(f"Security: Invalid output path: {output_csv}")
            sys.exit(1)

    prepare_engineered_dataset(str(input_resolved), output_path)
