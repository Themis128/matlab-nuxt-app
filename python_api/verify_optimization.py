#!/usr/bin/env python3
"""Quick verification of database optimization"""

import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "price_database.db"

if not db_path.exists():
    print("❌ Database not found")
    exit(1)

conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

# Check indexes
cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='mobile_prices'")
indexes = [row[0] for row in cursor.fetchall()]

# Check journal mode
cursor.execute("PRAGMA journal_mode")
journal_mode = cursor.fetchone()[0]

# Check record count
cursor.execute("SELECT COUNT(*) FROM mobile_prices")
record_count = cursor.fetchone()[0]

conn.close()

print("=" * 60)
print("DATABASE OPTIMIZATION VERIFICATION")
print("=" * 60)
print(f"✅ Indexes: {len(indexes)}")
for idx in indexes:
    print(f"   - {idx}")
print(f"✅ Journal mode: {journal_mode}")
print(f"✅ Records: {record_count:,}")
print("=" * 60)

if len(indexes) >= 4 and journal_mode.upper() == "WAL":
    print("✅ All optimizations verified!")
    exit(0)
else:
    print("⚠️  Some optimizations may be missing")
    exit(1)
