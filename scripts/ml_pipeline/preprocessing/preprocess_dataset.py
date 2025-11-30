"""
Dataset Preprocessing Script
Analyzes the Mobiles Dataset and provides detailed insights about data quality, missing values, and preprocessing needs.
"""

import json

import pandas as pd


def analyze_dataset(csv_path):
    """Comprehensive dataset analysis"""

    # Try different encodings
    encodings = ['latin-1', 'utf-8', 'cp1252', 'iso-8859-1']
    df = None

    for encoding in encodings:
        try:
            df = pd.read_csv(csv_path, encoding=encoding)
            print(f"✓ Successfully loaded dataset with {encoding} encoding\n")
            break
        except (UnicodeDecodeError, pd.errors.ParserError):
            continue

    if df is None:
        print("❌ Failed to load dataset with any encoding")
        return

    # Basic Info
    print("=" * 80)
    print("DATASET OVERVIEW")
    print("=" * 80)
    print(f"Total Rows: {df.shape[0]}")
    print(f"Total Columns: {df.shape[1]}")
    print(f"\nColumns: {list(df.columns)}\n")

    # Data Types
    print("=" * 80)
    print("DATA TYPES")
    print("=" * 80)
    print(df.dtypes)
    print()

    # Missing Values
    print("=" * 80)
    print("MISSING VALUES ANALYSIS")
    print("=" * 80)
    missing = df.isnull().sum()
    missing_percent = (missing / len(df)) * 100
    missing_df = pd.DataFrame({
        'Column': missing.index,
        'Missing Count': missing.values,
        'Missing %': missing_percent.values
    })
    print(missing_df)
    print()

    # Analyze each column in detail
    print("=" * 80)
    print("DETAILED COLUMN ANALYSIS")
    print("=" * 80)

    analysis_results = {}

    for col in df.columns:
        print(f"\n--- {col} ---")

        # Unique values
        unique_count = df[col].nunique()
        print(f"Unique values: {unique_count}")

        # Sample values
        sample_values = df[col].head(10).tolist()
        print(f"Sample values: {sample_values[:5]}")

        # Check for special characters, units, or formatting
        if df[col].dtype == 'object':
            # Check for common patterns
            has_units = df[col].astype(str).str.contains(r'(g|GB|MP|mAh|inches|USD|AED|PKR|CNY|INR)', regex=True).any()
            has_special_chars = df[col].astype(str).str.contains(r'[^\w\s.-]', regex=True).any()
            has_missing_markers = df[col].astype(str).str.contains(r'(N/A|NA|null|none|-|—)', case=False, regex=True).any()

            print(f"Has units/symbols: {has_units}")
            print(f"Has special characters: {has_special_chars}")
            print(f"Has missing markers: {has_missing_markers}")

            # Try to identify numeric columns with units
            try:
                # Remove common units and try conversion
                clean_values = df[col].astype(str).str.replace(r'[^\d.]', '', regex=True)
                numeric_convertible = pd.to_numeric(clean_values, errors='coerce').notna().sum()
                convertible_percent = (numeric_convertible / len(df)) * 100
                print(f"Numeric convertible: {convertible_percent:.1f}%")

                if convertible_percent > 80:
                    print("⚠️  This column should be converted to numeric!")
            except (ValueError, TypeError, AttributeError):
                pass

        analysis_results[col] = {
            'dtype': str(df[col].dtype),
            'unique_count': int(unique_count),
            'missing_count': int(missing[col]),
            'missing_percent': float(missing_percent[col])
        }

    # Identify preprocessing needs
    print("\n" + "=" * 80)
    print("PREPROCESSING RECOMMENDATIONS")
    print("=" * 80)

    recommendations = []

    # Check numeric columns that are stored as objects
    numeric_columns = ['Mobile Weight', 'RAM', 'Front Camera', 'Back Camera',
                      'Battery Capacity', 'Screen Size']
    price_columns = [col for col in df.columns if 'Price' in col]

    for col in numeric_columns:
        if df[col].dtype == 'object':
            recommendations.append(f"• Convert '{col}' to numeric (remove units)")

    for col in price_columns:
        if df[col].dtype == 'object':
            recommendations.append(f"• Convert '{col}' to numeric (remove currency symbols)")

    # Check for categorical encoding needs
    categorical_cols = ['Company Name', 'Processor']
    for col in categorical_cols:
        if col in df.columns:
            recommendations.append(f"• Encode '{col}' (categorical) - {df[col].nunique()} unique values")

    # Check year column
    if 'Launched Year' in df.columns:
        year_range = f"{df['Launched Year'].min()} - {df['Launched Year'].max()}"
        recommendations.append(f"• Verify 'Launched Year' range: {year_range}")

    for rec in recommendations:
        print(rec)

    # Save detailed report
    print("\n" + "=" * 80)
    print("SAVING DETAILED REPORT")
    print("=" * 80)

    report = {
        'overview': {
            'total_rows': int(df.shape[0]),
            'total_columns': int(df.shape[1]),
            'columns': list(df.columns)
        },
        'column_analysis': analysis_results,
        'recommendations': recommendations
    }

    report_path = 'data/preprocessing_report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    print(f"✓ Report saved to: {report_path}")

    # Show sample data
    print("\n" + "=" * 80)
    print("SAMPLE DATA (First 5 Rows)")
    print("=" * 80)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', None)
    print(df.head())

    # Show statistics for numeric columns
    print("\n" + "=" * 80)
    print("NUMERIC STATISTICS (Year only - others need conversion)")
    print("=" * 80)
    print(df.describe())

if __name__ == "__main__":
    csv_path = "data/Mobiles Dataset (2025).csv"
    analyze_dataset(csv_path)
