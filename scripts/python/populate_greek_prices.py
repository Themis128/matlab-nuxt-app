"""
Populate Greek Market Prices
Uses EUR prices with Greek market adjustment factor to populate Current Price (Greece) column
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import pandas as pd

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except (OSError, AttributeError):
        pass


class GreekPricePopulator:
    """Populate Greek market prices using EUR conversion with adjustment factor"""

    def __init__(self, greek_adjustment_factor: float = 1.05):
        """
        Initialize the populator

        Args:
            greek_adjustment_factor: Multiplier for EUR prices to estimate Greek market prices
                                    (default 1.05 = 5% markup typical in Greek market)
        """
        self.greek_adjustment_factor = greek_adjustment_factor
        self.stats = {
            'total': 0,
            'converted': 0,
            'skipped': 0
        }

    def extract_price_value(self, price_str: str) -> Optional[float]:
        """Extract numeric value from price string"""
        if pd.isna(price_str) or not price_str or str(price_str).strip() == '':
            return None

        price_str = str(price_str).strip()
        price_str = re.sub(r'(USD|PKR|INR|CNY|AED|EUR|€|\$)', '', price_str, flags=re.IGNORECASE)
        price_str = price_str.replace(',', '').replace(' ', '')

        match = re.search(r'(\d+\.?\d*)', price_str)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return None

        return None

    def find_dataset_file(self) -> Optional[Path]:
        """Find the dataset CSV file"""
        project_root = Path(__file__).parent.parent.parent
        possible_paths = [
            project_root / 'data' / 'Mobiles Dataset (2025).csv',
            project_root / 'mobiles-dataset-docs' / 'Mobiles Dataset (2025).csv',
            project_root / 'mobiles-dataset-docs' / 'Mobiles Dataset (2025)_EUR.csv',
        ]

        for path in possible_paths:
            if path.exists():
                return path
        return None

    def load_dataset(self) -> Optional[pd.DataFrame]:
        """Load the mobile phones dataset"""
        dataset_path = self.find_dataset_file()

        if not dataset_path:
            print("[X] Dataset file not found!")
            return None

        print(f"[OK] Loading dataset: {dataset_path}")

        try:
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
            df = None

            for encoding in encodings:
                try:
                    df = pd.read_csv(dataset_path, encoding=encoding, low_memory=False)
                    print(f"[OK] Successfully loaded with {encoding} encoding")
                    print(f"[OK] Dataset shape: {df.shape[0]} rows × {df.shape[1]} columns")
                    break
                except UnicodeDecodeError:
                    continue

            if df is None:
                print("[X] Could not load dataset with any encoding")
                return None

            return df

        except Exception as e:
            print(f"[X] Error loading dataset: {e}")
            return None

    def populate_greek_prices(self, df: pd.DataFrame, limit: Optional[int] = None) -> pd.DataFrame:
        """
        Populate Greek market prices for all models

        Args:
            df: Dataset DataFrame
            limit: Maximum number of models to process (None for all)

        Returns:
            Updated DataFrame with Greek prices
        """
        print("\n" + "=" * 80)
        print("POPULATING GREEK MARKET PRICES")
        print("=" * 80)
        print(f"Using adjustment factor: {self.greek_adjustment_factor:.1%} (Greek market markup)")

        # Ensure column exists
        if 'Current Price (Greece)' not in df.columns:
            df['Current Price (Greece)'] = None

        # Get models to process
        models_to_process = []
        for idx, row in df.iterrows():
            # Check if already has Greek price
            existing_greek = row.get('Current Price (Greece)')
            if pd.notna(existing_greek) and existing_greek and str(existing_greek).strip() != '':
                continue  # Skip if already has price

            # Get EUR price for conversion
            eur_price = row.get('Launched Price (Europe)')
            eur_value = self.extract_price_value(str(eur_price)) if pd.notna(eur_price) else None

            if eur_value:
                models_to_process.append((idx, eur_value))

        if limit:
            models_to_process = models_to_process[:limit]

        self.stats['total'] = len(models_to_process)
        print(f"\n[OK] Found {len(models_to_process)} models to process")

        # Process each model
        for i, (idx, eur_value) in enumerate(models_to_process, 1):
            # Convert EUR to Greek market price
            greek_price = eur_value * self.greek_adjustment_factor
            greek_price = round(greek_price, 2)

            # Update dataset
            df.at[idx, 'Current Price (Greece)'] = f"EUR {greek_price:.2f}"
            self.stats['converted'] += 1

            if i % 100 == 0 or i <= 10:
                print(f"[{i}/{len(models_to_process)}] Converted: €{greek_price:.2f} (from EUR {eur_value:.2f})")

        print(f"\n[OK] Population complete:")
        print(f"     Total models: {self.stats['total']}")
        print(f"     Converted from EUR: {self.stats['converted']}")
        print(f"     Skipped: {self.stats['skipped']}")

        return df

    def run(self, limit: Optional[int] = None):
        """Main function to populate Greek prices"""
        print("=" * 80)
        print("GREEK MARKET PRICE POPULATOR")
        print("=" * 80)
        print("This script converts EUR prices to Greek market prices")
        print("using a market adjustment factor.")
        print()

        # Load dataset
        df = self.load_dataset()
        if df is None:
            return

        # Populate Greek prices
        df = self.populate_greek_prices(df, limit=limit)

        # Save updated dataset
        project_root = Path(__file__).parent.parent.parent
        output_file = project_root / 'data' / 'Mobiles Dataset (2025).csv'

        try:
            df.to_csv(output_file, index=False, encoding='latin-1')
            print(f"\n[OK] Updated dataset saved to: {output_file}")
        except Exception as e:
            print(f"[!] Error saving with latin-1, trying utf-8: {e}")
            df.to_csv(output_file, index=False, encoding='utf-8')
            print(f"[OK] Updated dataset saved to: {output_file} (utf-8)")

        # Also save to EUR version
        eur_output_file = project_root / 'mobiles-dataset-docs' / 'Mobiles Dataset (2025)_EUR.csv'
        try:
            df.to_csv(eur_output_file, index=False, encoding='latin-1')
            print(f"[OK] EUR version saved to: {eur_output_file}")
        except Exception as e:
            df.to_csv(eur_output_file, index=False, encoding='utf-8')
            print(f"[OK] EUR version saved to: {eur_output_file} (utf-8)")

        # Summary
        print("\n" + "=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"Total models: {self.stats['total']}")
        print(f"Converted from EUR: {self.stats['converted']}")
        print(f"Skipped: {self.stats['skipped']}")
        if self.stats['total'] > 0:
            coverage = (self.stats['converted'] / self.stats['total'] * 100)
            print(f"Coverage: {coverage:.1f}%")
        print("\n✅ All models now have Greek market prices!")


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Populate Greek market prices for mobile phones')
    parser.add_argument('--limit', type=int, help='Limit number of models to process')
    parser.add_argument('--adjustment', type=float, default=1.05, help='Greek market adjustment factor, default 1.05 means 5 percent markup')

    args = parser.parse_args()

    populator = GreekPricePopulator(greek_adjustment_factor=args.adjustment)
    populator.run(limit=args.limit)
