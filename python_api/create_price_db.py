"""
Script to create and populate a local price database from the mobiles dataset
"""

import sqlite3
import csv
import os
from pathlib import Path

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
