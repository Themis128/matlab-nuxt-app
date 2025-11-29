"""
Dataset Columns Analyzer
Checks which columns exist in the mobile phones dataset and provides recommendations
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json
import sys
import io

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except:
        pass

def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    # Handle numpy integer types
    if isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8, np.uint64, np.uint32, np.uint16, np.uint8)):
        return int(obj)
    # Handle numpy float types
    elif isinstance(obj, (np.floating, np.float64, np.float32, np.float16)):
        return float(obj)
    # Handle numpy bool
    elif isinstance(obj, np.bool_):
        return bool(obj)
    # Handle numpy arrays
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    # Handle pandas scalars (which are numpy-based)
    elif hasattr(obj, 'item'):
        try:
            return obj.item()
        except (ValueError, AttributeError):
            pass
    # Handle dictionaries
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    # Handle lists and tuples
    elif isinstance(obj, (list, tuple)):
        return [convert_numpy_types(item) for item in obj]
    return obj

def find_dataset_file():
    """Find the dataset CSV file"""
    project_root = Path(__file__).parent.parent.parent
    possible_paths = [
        project_root / 'data' / 'Mobiles Dataset (2025).csv',
        project_root / 'Mobiles Dataset (2025).csv',
        project_root / 'mobiles-dataset-docs' / 'Mobiles Dataset (2025).csv',
        project_root / 'mobiles-dataset-docs' / 'preprocessed' / 'preprocessed_data.csv',
    ]

    for path in possible_paths:
        if path.exists():
            return str(path)
    return None

def analyze_dataset():
    """Analyze the dataset and return column information"""
    dataset_path = find_dataset_file()

    if not dataset_path:
        print("[X] Dataset file not found!")
        print("   Looking for:")
        project_root = Path(__file__).parent.parent.parent
        for path in [
            project_root / 'data' / 'Mobiles Dataset (2025).csv',
            project_root / 'Mobiles Dataset (2025).csv',
            project_root / 'mobiles-dataset-docs' / 'Mobiles Dataset (2025).csv'
        ]:
            print(f"     - {path}")
        return None

    print(f"[OK] Found dataset: {dataset_path}\n")

    try:
        # Try different encodings
        encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
        df = None

        for encoding in encodings:
            try:
                df = pd.read_csv(dataset_path, encoding=encoding, low_memory=False)
                print(f"[OK] Successfully loaded with {encoding} encoding\n")
                break
            except UnicodeDecodeError:
                continue

        if df is None:
            print("[X] Failed to load dataset with any encoding")
            return None

        print("=" * 80)
        print("DATASET OVERVIEW")
        print("=" * 80)
        print(f"Total Rows: {len(df):,}")
        print(f"Total Columns: {len(df.columns)}")
        print(f"Memory Usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB\n")

        print("=" * 80)
        print("ALL COLUMNS IN DATASET")
        print("=" * 80)

        column_info = []

        for i, col in enumerate(df.columns, 1):
            # Get basic info
            non_null_count = df[col].notna().sum()
            null_count = df[col].isna().sum()
            null_percentage = (null_count / len(df)) * 100

            # Get data type
            dtype = str(df[col].dtype)

            # Get sample values
            sample_values = df[col].dropna().head(3).tolist()
            sample_str = ", ".join([str(v)[:50] for v in sample_values[:3]])
            if len(sample_str) > 100:
                sample_str = sample_str[:100] + "..."

            # Get unique count
            unique_count = df[col].nunique()

            # Convert to native Python types
            non_null_py = int(non_null_count.item() if hasattr(non_null_count, 'item') else non_null_count)
            null_py = int(null_count.item() if hasattr(null_count, 'item') else null_count)
            null_pct_py = float(null_percentage.item() if hasattr(null_percentage, 'item') else null_percentage)
            unique_py = int(unique_count.item() if hasattr(unique_count, 'item') else unique_count)

            column_info.append({
                'index': i,
                'name': col,
                'dtype': dtype,
                'non_null': non_null_py,
                'null': null_py,
                'null_pct': null_pct_py,
                'unique': unique_py,
                'sample': sample_str
            })

            print(f"{i:2d}. {col:40s} | Type: {dtype:10s} | Non-null: {non_null_count:5d} ({100-null_percentage:5.1f}%) | Unique: {unique_count:5d}")
            if sample_str:
                print(f"    Sample: {sample_str}")

        print("\n" + "=" * 80)
        print("FEATURE AVAILABILITY CHECK")
        print("=" * 80)

        # Check for specific features
        feature_checks = {
            'Currently Used Features': {
                'RAM': ['RAM', 'ram', 'Ram'],
                'Battery': ['Battery Capacity', 'BatteryCapacity', 'Battery_Capacity', 'battery'],
                'Screen Size': ['Screen Size', 'ScreenSize', 'Screen_Size', 'screen'],
                'Weight': ['Mobile Weight', 'MobileWeight', 'Mobile_Weight', 'Weight', 'weight'],
                'Year': ['Launched Year', 'LaunchedYear', 'Launched_Year', 'Year', 'year'],
                'Company': ['Company Name', 'CompanyName', 'Company_Name', 'Company', 'company'],
                'Price': ['Launched Price (USA)', 'LaunchedPrice_USA', 'Price_USA', 'Price_USD', 'Price', 'price']
            },
            'Available Features (Not Currently Used)': {
                'Front Camera': ['Front Camera', 'FrontCamera', 'Front_Camera', 'FrontCamera_MP'],
                'Back Camera': ['Back Camera', 'BackCamera', 'Back_Camera', 'BackCamera_MP'],
                'Processor': ['Processor', 'processor', 'Processor_Name', 'ProcessorName'],
                'Storage': ['Storage', 'storage', 'Internal Storage', 'InternalStorage'],
                'Model Name': ['Model Name', 'ModelName', 'Model_Name', 'model'],
                'Price (Pakistan)': ['Price (Pakistan)', 'Price_Pakistan', 'Pakistan_Price'],
                'Price (India)': ['Price (India)', 'Price_India', 'India_Price'],
                'Price (China)': ['Price (China)', 'Price_China', 'China_Price'],
                'Price (Dubai)': ['Price (Dubai)', 'Price_Dubai', 'Dubai_Price'],
                'Display Type': ['Display Type', 'DisplayType', 'Display_Type', 'Screen Type'],
                'Refresh Rate': ['Refresh Rate', 'RefreshRate', 'Refresh_Rate', 'Hz'],
                'Resolution': ['Resolution', 'resolution', 'Screen Resolution']
            }
        }

        found_features = {}
        missing_features = {}

        for category, features in feature_checks.items():
            print(f"\n{category}:")
            print("-" * 80)

            for feature_name, possible_names in features.items():
                found = False
                matching_col = None

                for col in df.columns:
                    col_lower = col.lower()
                    for possible in possible_names:
                        if possible.lower() in col_lower or col_lower in possible.lower():
                            found = True
                            matching_col = col
                            break
                    if found:
                        break

                if found:
                    non_null = df[matching_col].notna().sum()
                    print(f"  [OK] {feature_name:25s} -> Found as: '{matching_col}' ({non_null:,} values)")
                    # Convert to native Python types
                    non_null_py = int(non_null.item() if hasattr(non_null, 'item') else non_null)
                    percentage_py = float((non_null_py / len(df)) * 100)
                    found_features[feature_name] = {
                        'column': matching_col,
                        'count': non_null_py,
                        'percentage': percentage_py
                    }
                else:
                    print(f"  [X] {feature_name:25s} -> NOT FOUND")
                    missing_features[feature_name] = possible_names

        print("\n" + "=" * 80)
        print("RECOMMENDATIONS")
        print("=" * 80)

        # Check camera availability
        if 'Front Camera' in found_features and 'Back Camera' in found_features:
            front_pct = found_features['Front Camera']['percentage']
            back_pct = found_features['Back Camera']['percentage']
            if front_pct > 50 and back_pct > 50:
                print("\n[***] HIGH PRIORITY: Camera features are available!")
                print("   -> Add Front Camera and Back Camera to your models")
                print("   -> Expected improvement: +10-15% accuracy")
                print(f"   -> Front Camera: {found_features['Front Camera']['count']:,} values ({front_pct:.1f}%)")
                print(f"   -> Back Camera: {found_features['Back Camera']['count']:,} values ({back_pct:.1f}%)")

        # Check storage
        if 'Storage' in found_features:
            storage_pct = found_features['Storage']['percentage']
            if storage_pct > 50:
                print("\n[***] HIGH PRIORITY: Storage information is available!")
                print("   -> Add Storage capacity to your models")
                print("   -> Expected improvement: +5-10% accuracy")
        elif 'Model Name' in found_features:
            print("\n[!] MEDIUM PRIORITY: Storage can be extracted from Model Name")
            print("   -> Parse storage from model names (e.g., 'iPhone 15 Pro 512GB')")
            print("   -> Expected improvement: +5-10% accuracy")

        # Check processor
        if 'Processor' in found_features:
            proc_pct = found_features['Processor']['percentage']
            if proc_pct > 50:
                print("\n[***] HIGH PRIORITY: Processor information is available!")
                print("   -> Add Processor brand/tier to your models")
                print("   -> Expected improvement: +8-12% accuracy")

        # Check regional prices
        regional_prices = ['Price (Pakistan)', 'Price (India)', 'Price (China)', 'Price (Dubai)']
        available_regional = [p for p in regional_prices if p in found_features]
        if available_regional:
            print(f"\n[!] MEDIUM PRIORITY: {len(available_regional)} regional prices available")
            print("   -> Create price ratio features (USA/India, USA/China, etc.)")
            print("   -> Expected improvement: +3-7% accuracy")

        # Summary
        print("\n" + "=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"[OK] Currently Used Features: {len([f for f in feature_checks['Currently Used Features'].keys() if f in found_features])}/{len(feature_checks['Currently Used Features'])}")
        print(f"[OK] Available Additional Features: {len([f for f in feature_checks['Available Features (Not Currently Used)'].keys() if f in found_features])}/{len(feature_checks['Available Features (Not Currently Used)'])}")
        print(f"[X] Missing Features: {len(missing_features)}")

        # Save results to JSON
        results = {
            'dataset_path': dataset_path,
            'total_rows': int(len(df)),
            'total_columns': int(len(df.columns)),
            'columns': column_info,
            'found_features': found_features,
            'missing_features': missing_features,
            'recommendations': {
                'camera_available': 'Front Camera' in found_features and 'Back Camera' in found_features,
                'storage_available': 'Storage' in found_features or 'Model Name' in found_features,
                'processor_available': 'Processor' in found_features,
                'regional_prices_available': len(available_regional) > 0
            }
        }

        # Convert numpy types to native Python types
        results = convert_numpy_types(results)

        project_root = Path(__file__).parent.parent.parent
        results_file = project_root / 'data' / 'dataset_analysis_results.json'
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"\n[SAVED] Results saved to: {results_file}")

        return results

    except Exception as e:
        print(f"[X] Error analyzing dataset: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("=" * 80)
    print("MOBILE PHONES DATASET - COLUMN ANALYZER")
    print("=" * 80)
    print()

    results = analyze_dataset()

    if results:
        print("\n[SUCCESS] Analysis complete!")
        print("\nNext steps:")
        print("1. Review the recommendations above")
        print(f"2. Check data/dataset_analysis_results.json for detailed information")
        print("3. Add available features to your model training pipeline")
    else:
        print("\n[X] Analysis failed. Please check the error messages above.")
