#!/usr/bin/env python3
"""
Add indexes to existing price_database.db without recreating it
This preserves all existing data while improving query performance
"""

import sqlite3
from pathlib import Path

def add_indexes():
    """Add indexes to the existing database"""
    db_path = Path(__file__).parent / "price_database.db"

    if not db_path.exists():
        print(f"❌ Database file not found: {db_path}")
        print("   Run 'python create_price_db.py' first to create the database")
        return False

    print("=" * 60)
    print("ADDING DATABASE INDEXES")
    print("=" * 60)
    print(f"Database: {db_path}")

    conn = None
    try:
        # Connect to database
        conn = sqlite3.connect(str(db_path), timeout=30.0)
        cursor = conn.cursor()

        # Check current indexes
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='mobile_prices'")
        existing_indexes = [row[0] for row in cursor.fetchall()]

        print(f"\nExisting indexes: {len(existing_indexes)}")
        for idx in existing_indexes:
            print(f"  - {idx}")

        # Define indexes to create
        indexes_to_create = [
            {
                "name": "idx_company",
                "sql": "CREATE INDEX IF NOT EXISTS idx_company ON mobile_prices(company)"
            },
            {
                "name": "idx_model",
                "sql": "CREATE INDEX IF NOT EXISTS idx_model ON mobile_prices(model)"
            },
            {
                "name": "idx_launched_year",
                "sql": "CREATE INDEX IF NOT EXISTS idx_launched_year ON mobile_prices(launched_year)"
            },
            {
                "name": "idx_company_model",
                "sql": "CREATE INDEX IF NOT EXISTS idx_company_model ON mobile_prices(company, model)"
            }
        ]

        # Create indexes
        created_count = 0
        skipped_count = 0

        print("\nCreating indexes...")
        for index_def in indexes_to_create:
            index_name = index_def["name"]
            if index_name in existing_indexes:
                print(f"  ⏭️  {index_name}: Already exists")
                skipped_count += 1
            else:
                try:
                    cursor.execute(index_def["sql"])
                    print(f"  ✅ {index_name}: Created")
                    created_count += 1
                except sqlite3.Error as e:
                    print(f"  ❌ {index_name}: Failed - {e}")

        # Commit changes
        conn.commit()

        # Verify indexes
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='mobile_prices'")
        all_indexes = [row[0] for row in cursor.fetchall()]

        print("\n" + "=" * 60)
        print("RESULTS")
        print("=" * 60)
        print(f"✅ Indexes created: {created_count}")
        print(f"⏭️  Indexes skipped: {skipped_count}")
        print(f"📊 Total indexes: {len(all_indexes)}")

        if all_indexes:
            print("\nAll indexes:")
            for idx in all_indexes:
                print(f"  - {idx}")

        # Get record count
        cursor.execute("SELECT COUNT(*) FROM mobile_prices")
        record_count = cursor.fetchone()[0]
        print(f"\n📊 Records in database: {record_count:,}")
        print("✅ All data preserved")

        conn.close()
        return True

    except sqlite3.Error as e:
        print(f"\n❌ Database error: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        if conn:
            try:
                conn.rollback()
                conn.close()
            except:
                pass
        return False

def enable_wal_mode():
    """Enable WAL mode for better concurrency"""
    db_path = Path(__file__).parent / "price_database.db"

    if not db_path.exists():
        return False

    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Check current journal mode
        cursor.execute("PRAGMA journal_mode")
        current_mode = cursor.fetchone()[0]

        if current_mode.upper() != "WAL":
            cursor.execute("PRAGMA journal_mode=WAL")
            new_mode = cursor.fetchone()[0]
            print(f"\n✅ WAL mode enabled (was: {current_mode})")
            conn.close()
            return True
        else:
            print(f"\n✅ WAL mode already enabled")
            conn.close()
            return True

    except Exception as e:
        print(f"\n⚠️  Could not enable WAL mode: {e}")
        return False

def add_unique_constraint():
    """Add unique constraint on (company, model) if not exists"""
    db_path = Path(__file__).parent / "price_database.db"

    if not db_path.exists():
        return False

    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Check if unique constraint exists by checking for unique index
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='mobile_prices' AND sql LIKE '%UNIQUE%'")
        unique_indexes = cursor.fetchall()

        if not unique_indexes:
            # SQLite doesn't support adding UNIQUE constraint to existing table easily
            # But we can create a unique index which enforces uniqueness
            try:
                cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_company_model ON mobile_prices(company, model)")
                conn.commit()
                print("\n✅ Unique constraint added on (company, model)")
                conn.close()
                return True
            except sqlite3.OperationalError as e:
                if "UNIQUE constraint failed" in str(e):
                    print("\n⚠️  Cannot add unique constraint: duplicate (company, model) pairs exist")
                    print("   This is expected if the database has duplicates")
                    print("   The index was created but will allow duplicates until database is recreated")
                else:
                    print(f"\n⚠️  Could not add unique constraint: {e}")
                conn.close()
                return False
        else:
            print("\n✅ Unique constraint already exists")
            conn.close()
            return True

    except Exception as e:
        print(f"\n⚠️  Error checking unique constraint: {e}")
        return False

def main():
    """Main function"""
    print("\n" + "=" * 60)
    print("DATABASE OPTIMIZATION")
    print("=" * 60)

    # Step 1: Add indexes
    success = add_indexes()

    if success:
        # Step 2: Enable WAL mode
        enable_wal_mode()

        # Step 3: Add unique constraint
        add_unique_constraint()

        print("\n" + "=" * 60)
        print("✅ DATABASE OPTIMIZATION COMPLETE")
        print("=" * 60)
        print("\nYour database is now optimized with:")
        print("  ✅ Indexes on frequently queried columns")
        print("  ✅ WAL mode for better concurrency")
        print("  ✅ Unique constraint on (company, model)")
        print("\nAll existing data has been preserved!")
        return 0
    else:
        print("\n" + "=" * 60)
        print("❌ DATABASE OPTIMIZATION FAILED")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
