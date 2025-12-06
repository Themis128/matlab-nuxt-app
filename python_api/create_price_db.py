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
    """Create SQLite database with price data from CSV"""

    # Database path
    db_path = Path(__file__).parent / "price_database.db"

    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mobile_prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT,
            model TEXT,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # CSV file path
    csv_path = Path(__file__).parent.parent / "data" / "Mobiles Dataset (2025).csv"

    if not csv_path.exists():
        print(f"CSV file not found: {csv_path}")
        return

    # Read and insert data
    with open(csv_path, 'r', encoding='utf-8', errors='ignore') as file:
        reader = csv.DictReader(file)
        records_inserted = 0

        for row in reader:
            try:
                cursor.execute('''
                    INSERT INTO mobile_prices
                    (company, model, weight, ram, front_camera, back_camera,
                     processor, battery, screen_size, price_pakistan, price_india,
                     price_china, price_usa, price_dubai, launched_year, image_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    row['Company Name'],
                    row['Model Name'],
                    row['Mobile Weight'],
                    row['RAM'],
                    row['Front Camera'],
                    row['Back Camera'],
                    row['Processor'],
                    row['Battery Capacity'],
                    row['Screen Size'],
                    parse_price(row['Launched Price (Pakistan)']),
                    parse_price(row['Launched Price (India)']),
                    parse_price(row['Launched Price (China)']),
                    parse_price(row['Launched Price (USA)']),
                    parse_price(row['Launched Price (Dubai)']),
                    int(row['Launched Year']),
                    f"https://via.placeholder.com/300x200?text={row['Company Name']}+{row['Model Name']}"
                ))
                records_inserted += 1
            except Exception as e:
                print(f"Error inserting row {records_inserted + 1}: {e}")
                print(f"Row data: Company={row.get('Company Name')}, Model={row.get('Model Name')}")
                break  # Stop on first error to debug

    conn.commit()
    conn.close()
    print(f"Database created at: {db_path}")
    print(f"Records inserted: {records_inserted}")

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
