#!/usr/bin/env python3
"""
Consolidate all phone datasets into a single comprehensive CSV file.
Combines data from multiple sources, handles duplicates, and prepares for model training.
"""

import os
import warnings
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd

warnings.filterwarnings('ignore')

DATA_DIR = Path('data')
OUTPUT_DIR = Path('data/consolidated')
OUTPUT_DIR.mkdir(exist_ok=True)

def analyze_dataset_structure(file_path: Path) -> Dict:
    """Analyze the structure and content of a dataset"""
    try:
        df = pd.read_csv(file_path, nrows=5)  # Just read first 5 rows for analysis
        return {
            'file': file_path.name,
            'columns': list(df.columns),
            'num_columns': len(df.columns),
            'has_price': any('price' in col.lower() for col in df.columns),
            'has_ram': any('ram' in col.lower() for col in df.columns),
            'has_battery': any('battery' in col.lower() for col in df.columns),
            'has_company': any('company' in col.lower() for col in df.columns),
            'sample_row': df.iloc[0].to_dict() if len(df) > 0 else {}
        }
    except Exception as e:
        return {
            'file': file_path.name,
            'error': str(e),
            'is_valid': False
        }

def identify_phone_datasets() -> Tuple[List[Path], List[Path]]:
    """Identify which CSV files contain phone data vs analysis data"""
    csv_files = list(DATA_DIR.glob('*.csv'))

    phone_datasets = []
    analysis_datasets = []

    for csv_file in csv_files:
        name = csv_file.name.lower()

        # Skip analysis and model output files
        if any(skip in name for skip in [
            'analysis', 'metrics', 'benchmark', 'segment', 'scraping',
            'european', 'explainability', 'oof_predictions', 'ensemble'
        ]):
            analysis_datasets.append(csv_file)
            continue

        # Analyze structure to confirm it's phone data
        analysis = analyze_dataset_structure(csv_file)
        if analysis.get('has_price', False) or analysis.get('has_ram', False) or analysis.get('has_battery', False):
            phone_datasets.append(csv_file)
        else:
            analysis_datasets.append(csv_file)

    return phone_datasets, analysis_datasets

def standardize_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """Standardize column names across datasets"""
    column_mapping = {
        # Price columns
        'Launched Price (USA)': 'price_usd',
        'Price_USD': 'price_usd',
        'Price': 'price_usd',
        'USD_Price': 'price_usd',
        'Price (USD)': 'price_usd',

        # RAM columns
        'RAM': 'ram_gb',

        # Battery columns
        'Battery Capacity': 'battery_mah',
        'BatteryCapacity': 'battery_mah',
        'Battery_Capacity': 'battery_mah',
        'Battery': 'battery_mah',

        # Screen columns
        'Screen Size': 'screen_inches',
        'ScreenSize': 'screen_inches',
        'Screen_Size': 'screen_inches',
        'Screen': 'screen_inches',
        'Display_Size': 'screen_inches',

        # Weight columns
        'Mobile Weight': 'weight_grams',
        'Mobile_Weight': 'weight_grams',
        'Weight': 'weight_grams',
        'Phone_Weight': 'weight_grams',

        # Year columns
        'Launched Year': 'launch_year',
        'Launched_Year': 'launch_year',
        'Year': 'launch_year',
        'Launch_Year': 'launch_year',

        # Company columns
        'Company Name': 'company',
        'Company': 'company',
        'Brand': 'company',

        # Camera columns
        'Front Camera': 'front_camera_mp',
        'Back Camera': 'back_camera_mp',

        # Storage columns
        'Storage': 'storage_gb',
        'Internal Storage': 'storage_gb',

        # Processor columns
        'Processor': 'processor'
    }

    # Rename columns
    df_renamed = df.copy()
    for old_col, new_col in column_mapping.items():
        if old_col in df_renamed.columns:
            df_renamed = df_renamed.rename(columns={old_col: new_col})

    return df_renamed

def extract_numeric_values(df: pd.DataFrame) -> pd.DataFrame:
    """Extract numeric values from string columns"""
    df_clean = df.copy()

    # Extract RAM (e.g., "8 GB" -> 8)
    if 'ram_gb' in df_clean.columns:
        df_clean['ram_gb'] = df_clean['ram_gb'].astype(str).str.extract(r'(\d+)').astype(float)

    # Extract Battery (e.g., "4000 mAh" -> 4000)
    if 'battery_mah' in df_clean.columns:
        df_clean['battery_mah'] = df_clean['battery_mah'].astype(str).str.extract(r'(\d+)').astype(float)

    # Extract Screen (e.g., "6.1 inches" -> 6.1)
    if 'screen_inches' in df_clean.columns:
        df_clean['screen_inches'] = df_clean['screen_inches'].astype(str).str.extract(r'(\d+\.?\d*)').astype(float)

    # Extract Weight (e.g., "174 grams" -> 174)
    if 'weight_grams' in df_clean.columns:
        df_clean['weight_grams'] = df_clean['weight_grams'].astype(str).str.extract(r'(\d+)').astype(float)

    # Extract Price (remove commas and symbols)
    if 'price_usd' in df_clean.columns:
        df_clean['price_usd'] = pd.to_numeric(
            df_clean['price_usd'].astype(str).str.replace(',', '').str.extract(r'(\d+)')[0],
            errors='coerce'
        )

    # Extract Storage
    if 'storage_gb' in df_clean.columns:
        df_clean['storage_gb'] = df_clean['storage_gb'].astype(str).str.extract(r'(\d+)').astype(float)

    # Extract Cameras
    if 'front_camera_mp' in df_clean.columns:
        df_clean['front_camera_mp'] = df_clean['front_camera_mp'].astype(str).str.extract(r'(\d+)').astype(float)

    if 'back_camera_mp' in df_clean.columns:
        df_clean['back_camera_mp'] = df_clean['back_camera_mp'].astype(str).str.extract(r'(\d+)').astype(float)

    return df_clean

def consolidate_datasets(phone_datasets: List[Path]) -> pd.DataFrame:
    """Consolidate all phone datasets into one DataFrame"""
    print("🔄 Consolidating datasets...")

    all_data = []
    dataset_info = []

    for i, dataset_path in enumerate(phone_datasets, 1):
        print(f"  Processing {i}/{len(phone_datasets)}: {dataset_path.name}")

        try:
            # Read dataset
            df = pd.read_csv(dataset_path)

            # Standardize column names
            df = standardize_column_names(df)

            # Extract numeric values
            df = extract_numeric_values(df)

            # Add source tracking
            df['_source_file'] = dataset_path.name
            df['_source_index'] = range(len(df))

            # Store for consolidation
            all_data.append(df)
            dataset_info.append({
                'file': dataset_path.name,
                'original_rows': len(df),
                'columns': list(df.columns)
            })

        except Exception as e:
            print(f"    ⚠️ Error processing {dataset_path.name}: {e}")
            continue

    if not all_data:
        raise ValueError("No valid datasets found to consolidate")

    # Concatenate all datasets
    print("  Combining datasets...")
    consolidated = pd.concat(all_data, ignore_index=True, sort=False)

    # Create a composite key for deduplication
    key_columns = ['company', 'ram_gb', 'battery_mah', 'screen_inches', 'price_usd']
    available_keys = [col for col in key_columns if col in consolidated.columns]

    if available_keys:
        # Create deduplication key
        consolidated['_dedup_key'] = consolidated[available_keys].astype(str).agg('-'.join, axis=1)

        # Remove duplicates (keep first occurrence)
        before_dedup = len(consolidated)
        consolidated = consolidated.drop_duplicates(subset='_dedup_key', keep='first')
        after_dedup = len(consolidated)

        print(f"  ✅ Deduplication: {before_dedup} → {after_dedup} rows ({before_dedup - after_dedup} duplicates removed)")
    else:
        print("  ⚠️ No common columns found for deduplication")

    # Clean up temporary columns
    consolidated = consolidated.drop(columns=['_dedup_key'], errors='ignore')

    return consolidated, dataset_info

def perform_data_quality_checks(df: pd.DataFrame) -> pd.DataFrame:
    """Perform data quality checks and cleaning"""
    print("🔍 Performing data quality checks...")

    original_rows = len(df)

    # Remove rows with too many missing values
    min_required_fields = ['ram_gb', 'battery_mah', 'screen_inches', 'price_usd']
    available_fields = [col for col in min_required_fields if col in df.columns]

    if available_fields:
        # Keep rows that have at least 2 of the key fields
        df_clean = df.dropna(subset=available_fields, thresh=2)
        print(f"  ✅ Missing data filter: {original_rows} → {len(df_clean)} rows")
    else:
        df_clean = df
        print("  ⚠️ Not enough key fields for missing data filtering")

    # Remove unrealistic values
    if 'price_usd' in df_clean.columns:
        # Remove prices that are clearly wrong (negative, zero, or > $5000)
        df_clean = df_clean[(df_clean['price_usd'] > 50) & (df_clean['price_usd'] < 5000)]
        print(f"  ✅ Price range filter: {len(df_clean)} rows remain")

    if 'ram_gb' in df_clean.columns:
        df_clean = df_clean[(df_clean['ram_gb'] >= 1) & (df_clean['ram_gb'] <= 24)]
        print(f"  ✅ RAM range filter: {len(df_clean)} rows remain")

    if 'battery_mah' in df_clean.columns:
        df_clean = df_clean[(df_clean['battery_mah'] >= 1000) & (df_clean['battery_mah'] <= 7000)]
        print(f"  ✅ Battery range filter: {len(df_clean)} rows remain")

    if 'screen_inches' in df_clean.columns:
        df_clean = df_clean[(df_clean['screen_inches'] >= 4) & (df_clean['screen_inches'] <= 8)]
        print(f"  ✅ Screen range filter: {len(df_clean)} rows remain")

    return df_clean

def create_model_ready_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """Create a model-ready dataset with all necessary features"""
    print("🎯 Creating model-ready dataset...")

    # Define the core features we want
    core_features = [
        'company', 'ram_gb', 'battery_mah', 'screen_inches',
        'weight_grams', 'launch_year', 'price_usd',
        'front_camera_mp', 'back_camera_mp', 'storage_gb', 'processor'
    ]

    # Keep only available features
    available_features = [col for col in core_features if col in df.columns]
    df_model = df[available_features + ['_source_file']].copy()

    # Add derived features
    if 'ram_gb' in df_model.columns and 'storage_gb' in df_model.columns:
        # RAM to storage ratio
        df_model['ram_storage_ratio'] = df_model['ram_gb'] / df_model['storage_gb'].replace(0, 1)

    if 'battery_mah' in df_model.columns and 'screen_inches' in df_model.columns:
        # Battery efficiency (capacity per screen size)
        df_model['battery_efficiency'] = df_model['battery_mah'] / (df_model['screen_inches'] ** 2)

    # Fill missing numeric values with medians
    numeric_cols = df_model.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df_model[col].isnull().sum() > 0:
            median_val = df_model[col].median()
            df_model[col] = df_model[col].fillna(median_val)

    # Fill missing categorical values
    categorical_cols = df_model.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        if col != '_source_file' and df_model[col].isnull().sum() > 0:
            df_model[col] = df_model[col].fillna('Unknown')

    return df_model

def main():
    """Main consolidation process"""
    print("=" * 70)
    print("🗂️ DATASET CONSOLIDATION PROCESS")
    print("=" * 70)
    print()

    # Identify datasets
    print("🔍 Identifying phone datasets...")
    phone_datasets, analysis_datasets = identify_phone_datasets()

    print(f"  📱 Phone datasets found: {len(phone_datasets)}")
    for ds in phone_datasets:
        print(f"    • {ds.name}")

    print(f"  📊 Analysis datasets excluded: {len(analysis_datasets)}")
    print()

    if not phone_datasets:
        print("❌ No phone datasets found to consolidate!")
        return

    # Consolidate datasets
    consolidated_df, dataset_info = consolidate_datasets(phone_datasets)

    print(f"  📊 Consolidation result: {len(consolidated_df)} total rows")
    print()

    # Data quality checks
    cleaned_df = perform_data_quality_checks(consolidated_df)
    print()

    # Create model-ready dataset
    model_df = create_model_ready_dataset(cleaned_df)

    print(f"  🎯 Model-ready dataset: {len(model_df)} rows × {len(model_df.columns)} columns")
    print()

    # Save consolidated dataset
    output_file = OUTPUT_DIR / "consolidated_phone_dataset.csv"
    model_df.to_csv(output_file, index=False)
    print(f"💾 Saved consolidated dataset: {output_file}")

    # Save dataset information
    info_file = OUTPUT_DIR / "consolidation_info.json"
    import json
    with open(info_file, 'w') as f:
        json.dump({
            'consolidation_date': pd.Timestamp.now().isoformat(),
            'source_datasets': dataset_info,
            'final_dataset': {
                'rows': len(model_df),
                'columns': len(model_df.columns),
                'column_names': list(model_df.columns),
                'numeric_columns': list(model_df.select_dtypes(include=[np.number]).columns),
                'categorical_columns': list(model_df.select_dtypes(include=['object']).columns)
            }
        }, f, indent=2, default=str)
    print(f"📋 Saved consolidation info: {info_file}")

    # Print summary statistics
    print()
    print("=" * 70)
    print("📈 CONSOLIDATION SUMMARY")
    print("=" * 70)

    print(f"Source datasets: {len(phone_datasets)}")
    print(f"Total rows before cleaning: {len(consolidated_df)}")
    print(f"Final rows after cleaning: {len(model_df)}")
    print(f"Data completeness: {(1 - model_df.isnull().sum().sum() / (len(model_df) * len(model_df.columns))) * 100:.1f}%")

    # Show key statistics
    if 'price_usd' in model_df.columns:
        print(f"Price range: ${model_df['price_usd'].min():.0f} - ${model_df['price_usd'].max():.0f}")
        print(f"Median price: ${model_df['price_usd'].median():.0f}")

    if 'company' in model_df.columns:
        print(f"Unique brands: {model_df['company'].nunique()}")

    print()
    print("✅ CONSOLIDATION COMPLETE!")
    print("🎯 Ready for model training with enhanced dataset")
    print("=" * 70)

if __name__ == "__main__":
    main()
