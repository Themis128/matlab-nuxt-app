"""
Optimize CSV data files by removing duplicates, compressing, and cleaning data.
"""
import pandas as pd
import gzip
import os
from pathlib import Path
from typing import Dict, List, Optional
from pandas.errors import EmptyDataError

def optimize_csv(
    csv_path: str,
    output_path: Optional[str] = None,
    remove_duplicates: bool = True,
    compress: bool = True,
    drop_empty_cols: bool = True,
    encodings: Optional[List[str]] = None
) -> Dict:
    """
    Optimize CSV file by:
    1. Removing duplicate rows
    2. Dropping columns with all NaN values
    3. Optimizing dtypes (int64 -> int32, etc.)
    4. Compressing with gzip
    """
    if output_path is None:
        base = csv_path.replace('.csv', '_optimized')
        output_path = f"{base}.csv.gz" if compress else f"{base}.csv"

    original_size = os.path.getsize(csv_path)

    # Try different encodings
    if encodings is None:
        encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'iso-8859-1', 'cp1252']
    df = None
    used_encoding = None

    for encoding in encodings:
        try:
            df = pd.read_csv(csv_path, encoding=encoding, low_memory=False)
            used_encoding = encoding
            break
        except (UnicodeDecodeError, EmptyDataError):
            continue
        except Exception as e:
            # If unexpected error (e.g. parser), keep trying other encodings
            continue

    if df is None:
        raise ValueError("Could not decode CSV with provided encodings")

    original_rows = len(df)
    original_cols = len(df.columns)    # Remove duplicates
    if remove_duplicates:
        df = df.drop_duplicates()

    # Drop empty columns
    if drop_empty_cols:
        df = df.dropna(axis=1, how='all')

    # Optimize dtypes
    for col in df.columns:
        col_type = df[col].dtype

        # Optimize integers
        if col_type == 'int64':
            c_min = df[col].min()
            c_max = df[col].max()
            if c_min > -32768 and c_max < 32767:
                df[col] = df[col].astype('int16')
            elif c_min > -2147483648 and c_max < 2147483647:
                df[col] = df[col].astype('int32')

        # Optimize floats
        elif col_type == 'float64':
            df[col] = df[col].astype('float32')

        # Optimize objects/strings
        elif col_type == 'object':
            num_unique = df[col].nunique()
            num_total = len(df[col])
            # Convert to category if < 50% unique values
            if num_unique / num_total < 0.5:
                df[col] = df[col].astype('category')

    # Save
    if compress:
        df.to_csv(output_path, index=False, compression='gzip')
    else:
        df.to_csv(output_path, index=False)

    optimized_size = os.path.getsize(output_path)
    reduction = ((original_size - optimized_size) / original_size) * 100 if original_size > 0 else 0

    return {
        'original_size': original_size,
        'optimized_size': optimized_size,
        'reduction_percent': reduction,
        'original_kb': round(original_size / 1024, 2),
        'optimized_kb': round(optimized_size / 1024, 2),
        'original_rows': original_rows,
        'optimized_rows': len(df),
        'rows_removed': original_rows - len(df),
        'original_cols': original_cols,
        'optimized_cols': len(df.columns),
        'cols_removed': original_cols - len(df.columns),
        'encoding_used': used_encoding
    }

def optimize_csv_files(
    directory: str = 'data',
    compress: bool = True,
    remove_duplicates: bool = True
) -> None:
    """Optimize all CSV files in directory"""
    dir_path = Path(directory)

    if not dir_path.exists():
        print(f"❌ Directory not found: {directory}")
        return

    csv_files = list(dir_path.glob('*.csv'))

    if not csv_files:
        print(f"ℹ️  No CSV files found in {directory}")
        return

    print(f"📊 Found {len(csv_files)} CSV files to optimize\n")

    results = []
    for csv_file in csv_files:
        print(f"Processing: {csv_file.name}...")

        try:
            result = optimize_csv(
                str(csv_file),
                remove_duplicates=remove_duplicates,
                compress=compress
            )
            result['filename'] = csv_file.name
            results.append(result)

            print(f"  📦 Size: {result['original_kb']:.1f} KB → {result['optimized_kb']:.1f} KB "
                f"({result['reduction_percent']:.1f}% reduction) | Encoding: {result['encoding_used']}")
            print(f"  📊 Rows: {result['original_rows']:,} → {result['optimized_rows']:,} "
                  f"({result['rows_removed']} duplicates removed)")
            if result['cols_removed'] > 0:
                print(f"  📋 Cols: {result['original_cols']} → {result['optimized_cols']} "
                      f"({result['cols_removed']} empty columns removed)")

        except Exception as e:
            print(f"  ❌ Error: {e}")

    # Summary
    print("\n" + "="*60)
    print("OPTIMIZATION SUMMARY")
    print("="*60)

    if not results:
        print("⚠️  No files were successfully optimized")
        return

    total_original = sum(r['original_size'] for r in results)
    total_optimized = sum(r['optimized_size'] for r in results)
    total_reduction = ((total_original - total_optimized) / total_original) * 100 if total_original > 0 else 0
    total_rows_removed = sum(r['rows_removed'] for r in results)

    print(f"Total original size:   {total_original / 1024:.1f} KB")
    print(f"Total optimized size:  {total_optimized / 1024:.1f} KB")
    print(f"Total space saved:     {(total_original - total_optimized) / 1024:.1f} KB")
    print(f"Overall reduction:     {total_reduction:.1f}%")
    print(f"Total rows removed:    {total_rows_removed:,}")

    if compress:
        print("\n💡 Optimized files saved as *.csv.gz")
        print("   To use: pd.read_csv('file.csv.gz', compression='gzip')")

if __name__ == '__main__':
    import sys

    # Default settings
    directory = 'data'
    compress = True
    remove_duplicates = True

    # Parse command line args
    if '--dir' in sys.argv:
        idx = sys.argv.index('--dir')
        directory = sys.argv[idx + 1]

    if '--no-compress' in sys.argv:
        compress = False

    if '--keep-duplicates' in sys.argv:
        remove_duplicates = False

    print("🔧 CSV OPTIMIZATION TOOL\n")
    print(f"Directory: {directory}")
    print(f"Compress: {compress}")
    print(f"Remove duplicates: {remove_duplicates}\n")

    optimize_csv_files(directory, compress=compress, remove_duplicates=remove_duplicates)
