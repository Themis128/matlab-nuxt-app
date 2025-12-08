"""
Script to create and populate a local price database from the mobiles dataset
Automatically triggers model training after data loading
"""

import asyncio
import sqlite3
import csv
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))

def create_price_database():
    """Create SQLite database with price data from CSV with proper transaction management"""

    # Database path
    db_path = Path(__file__).parent / "price_database.db"
    conn = None
    cursor = None

    try:
        # Connect to database with proper configuration
        conn = sqlite3.connect(
            str(db_path),
            timeout=30.0,  # 30 second timeout for database operations
            isolation_level=None  # Use autocommit mode for better control
        )
        # Enable WAL mode for better concurrency
        conn.execute('PRAGMA journal_mode=WAL')
        # Enable foreign keys
        conn.execute('PRAGMA foreign_keys=ON')
        # Set busy timeout
        conn.execute('PRAGMA busy_timeout=5000')

        cursor = conn.cursor()

        # Create table with indexes for better performance
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS mobile_prices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company TEXT NOT NULL,
                model TEXT NOT NULL,
                weight TEXT,
                ram TEXT,
                front_camera TEXT,
                back_camera TEXT,
                processor TEXT,
                battery TEXT,
                screen_size TEXT,
                price_pakistan REAL,
                price_india REAL,
                price_china REAL,
                price_usa REAL,
                price_dubai REAL,
                launched_year INTEGER,
                image_url TEXT,
                image_data BLOB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(company, model)
            )
        ''')

        # Create indexes for better query performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_company ON mobile_prices(company)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_model ON mobile_prices(model)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_launched_year ON mobile_prices(launched_year)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_company_model ON mobile_prices(company, model)')

        # CSV file path
        csv_path = Path(__file__).parent.parent / "data" / "Mobiles Dataset (2025).csv"

        if not csv_path.exists():
            print(f"CSV file not found: {csv_path}")
            return

        # Start transaction
        conn.execute('BEGIN TRANSACTION')

        # Read and insert data with proper error handling
        records_inserted = 0
        records_skipped = 0
        errors = []

        try:
            with open(csv_path, 'r', encoding='utf-8', errors='ignore') as file:
                reader = csv.DictReader(file)
                total_rows = 0

                for row_num, row in enumerate(reader, start=1):
                    total_rows += 1
                    try:
                        # Validate required fields
                        if not row.get('Company Name') or not row.get('Model Name'):
                            records_skipped += 1
                            errors.append(f"Row {row_num}: Missing required fields (Company Name or Model Name)")
                            continue

                        # Parse launched year safely
                        try:
                            launched_year = int(row['Launched Year']) if row.get('Launched Year') else None
                        except (ValueError, TypeError):
                            launched_year = None

                        cursor.execute('''
                            INSERT OR REPLACE INTO mobile_prices
                            (company, model, weight, ram, front_camera, back_camera,
                             processor, battery, screen_size, price_pakistan, price_india,
                             price_china, price_usa, price_dubai, launched_year, image_url)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            row['Company Name'],
                            row['Model Name'],
                            row.get('Mobile Weight', ''),
                            row.get('RAM', ''),
                            row.get('Front Camera', ''),
                            row.get('Back Camera', ''),
                            row.get('Processor', ''),
                            row.get('Battery Capacity', ''),
                            row.get('Screen Size', ''),
                            parse_price(row.get('Launched Price (Pakistan)', '')),
                            parse_price(row.get('Launched Price (India)', '')),
                            parse_price(row.get('Launched Price (China)', '')),
                            parse_price(row.get('Launched Price (USA)', '')),
                            parse_price(row.get('Launched Price (Dubai)', '')),
                            launched_year,
                            f"https://via.placeholder.com/300x200?text={row['Company Name']}+{row['Model Name']}"
                        ))
                        records_inserted += 1

                        # Commit in batches for better performance
                        if records_inserted % 100 == 0:
                            conn.execute('COMMIT')
                            conn.execute('BEGIN TRANSACTION')
                            print(f"Processed {records_inserted} records...")

                    except Exception as e:
                        records_skipped += 1
                        error_msg = f"Row {row_num}: {str(e)}"
                        errors.append(error_msg)
                        print(f"Warning: {error_msg}")
                        # Continue processing other rows instead of breaking
                        continue

            # Final commit
            conn.execute('COMMIT')

            print(f"\n{'='*60}")
            print(f"Database created at: {db_path}")
            print(f"Total rows processed: {total_rows}")
            print(f"Records inserted: {records_inserted}")
            print(f"Records skipped: {records_skipped}")
            if errors:
                print(f"Errors encountered: {len(errors)}")
                if len(errors) <= 10:
                    for error in errors:
                        print(f"  - {error}")
                else:
                    print(f"  (Showing first 10 of {len(errors)} errors)")
                    for error in errors[:10]:
                        print(f"  - {error}")
            print(f"{'='*60}")

        except Exception as e:
            # Rollback on error
            conn.execute('ROLLBACK')
            raise

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        if conn:
            try:
                conn.execute('ROLLBACK')
            except:
                pass
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        if conn:
            try:
                conn.execute('ROLLBACK')
            except:
                pass
        raise
    finally:
        # Ensure connection is properly closed
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    # Automatically trigger model training after data loading
    print("\n" + "=" * 60)
    print("Starting automatic model training...")
    print("=" * 60)

    try:
        from enhanced_data_pipeline import EnhancedDataPipeline

        async def train_models():
            # Train ALL 41 models automatically (no manual intervention)
            # Set TRAIN_ALL_41_MODELS=false to train only basic 4 models
            pipeline = EnhancedDataPipeline()
            results = await pipeline.load_data_and_train(
                csv_path=str(csv_path),
                image_base_dir=str(Path(__file__).parent.parent / "public" / "mobile_images"),
                auto_train=True  # This will train ALL 41 models by default
            )

            # Print notifications
            print("\n=== Training Notifications ===")
            for notification in results.get("notifications", []):
                status = notification.get("status", "info").upper()
                model = notification.get("model_name", "unknown")
                message = notification.get("message", "")
                print(f"[{status}] {model}: {message}")

            if results.get("success"):
                print("\n✓ All models trained successfully!")
            else:
                print(f"\n⚠ Training completed with {results.get('training', {}).get('failure_count', 0)} failures")

            return results

        # Run training
        training_results = asyncio.run(train_models())

    except ImportError as e:
        print(f"\n⚠ Could not import training pipeline: {e}")
        print("Models will not be automatically trained.")
    except Exception as e:
        print(f"\n⚠ Error during automatic training: {e}")
        print("Database was created successfully, but model training failed.")

def parse_price(price_str):
    """Parse price string to float, handling different currencies"""
    if not price_str or price_str.strip() == '':
        return None

    # Remove currency symbols and clean
    price_str = price_str.replace('PKR', '').replace('INR', '').replace('CNY', '').replace('USD', '').replace('AED', '').strip()

    # Remove commas and convert
    try:
        return float(price_str.replace(',', ''))
    except ValueError:
        return None

if __name__ == "__main__":
    create_price_database()
