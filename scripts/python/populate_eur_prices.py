"""
Populate EUR prices for all models in the dataset
Converts existing regional prices to EUR using current exchange rates
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import pandas as pd
import requests

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except (OSError, AttributeError):
        pass


class EURPricePopulator:
    """Populate EUR prices by converting existing regional prices"""

    def __init__(self):
        """Initialize the EUR price populator"""
        self.exchange_rates = {}
        self.stats = {
            'total': 0,
            'converted': 0,
            'skipped': 0,
            'errors': 0
        }

    def get_exchange_rates(self) -> dict:
        """
        Get current exchange rates from API or use fallback rates
        
        Returns:
            Dictionary of exchange rates to EUR
        """
        # Try to fetch current rates from exchangerate-api.com (free, no API key needed)
        try:
            response = requests.get(
                'https://api.exchangerate-api.com/v4/latest/EUR',
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                rates = data.get('rates', {})
                
                # Convert to EUR rates (invert)
                eur_rates = {
                    'USD': 1 / rates.get('USD', 0.92),
                    'PKR': 1 / rates.get('PKR', 0.0033),
                    'INR': 1 / rates.get('INR', 0.011),
                    'CNY': 1 / rates.get('CNY', 0.13),
                    'AED': 1 / rates.get('AED', 0.25),
                }
                
                print(f"[OK] Fetched current exchange rates from API")
                print(f"     USD to EUR: {eur_rates['USD']:.4f}")
                print(f"     PKR to EUR: {eur_rates['PKR']:.4f}")
                print(f"     INR to EUR: {eur_rates['INR']:.4f}")
                print(f"     CNY to EUR: {eur_rates['CNY']:.4f}")
                print(f"     AED to EUR: {eur_rates['AED']:.4f}")
                
                return eur_rates
        except Exception as e:
            print(f"[!] Could not fetch exchange rates from API: {e}")
            print(f"[→] Using fallback exchange rates (approximate)")
        
        # Fallback rates (approximate, as of early 2025)
        # These are conservative estimates - user can update if needed
        fallback_rates = {
            'USD': 0.92,   # 1 USD = 0.92 EUR
            'PKR': 0.0033, # 1 PKR = 0.0033 EUR
            'INR': 0.011,  # 1 INR = 0.011 EUR
            'CNY': 0.13,   # 1 CNY = 0.13 EUR
            'AED': 0.25,   # 1 AED = 0.25 EUR
        }
        
        print(f"[→] Using fallback exchange rates:")
        for currency, rate in fallback_rates.items():
            print(f"     {currency} to EUR: {rate:.4f}")
        
        return fallback_rates

    def extract_price_value(self, price_str: str) -> Optional[float]:
        """
        Extract numeric value from price string
        
        Args:
            price_str: Price string (e.g., "USD 799", "PKR 224,999", "€530.00")
            
        Returns:
            Numeric price value or None
        """
        if pd.isna(price_str) or not price_str or str(price_str).strip() == '':
            return None
        
        # Convert to string
        price_str = str(price_str).strip()
        
        # Remove currency codes and symbols
        price_str = re.sub(r'(USD|PKR|INR|CNY|AED|EUR|€|\$)', '', price_str, flags=re.IGNORECASE)
        
        # Remove commas and spaces
        price_str = price_str.replace(',', '').replace(' ', '')
        
        # Extract number
        match = re.search(r'(\d+\.?\d*)', price_str)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return None
        
        return None

    def convert_to_eur(self, price_value: float, currency: str) -> Optional[float]:
        """
        Convert price value to EUR
        
        Args:
            price_value: Price value in original currency
            currency: Currency code (USD, PKR, INR, CNY, AED)
            
        Returns:
            Price in EUR or None
        """
        if price_value is None or price_value <= 0:
            return None
        
        if currency not in self.exchange_rates:
            return None
        
        eur_price = price_value * self.exchange_rates[currency]
        return round(eur_price, 2)

    def find_dataset_file(self) -> Optional[Path]:
        """Find the main dataset CSV file"""
        project_root = Path(__file__).parent.parent.parent
        possible_paths = [
            project_root / 'data' / 'Mobiles Dataset (2025).csv',
            project_root / 'mobiles-dataset-docs' / 'Mobiles Dataset (2025).csv',
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

    def populate_eur_prices(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Populate EUR prices for all models
        
        Args:
            df: Dataset DataFrame
            
        Returns:
            Updated DataFrame with EUR prices
        """
        print("\n" + "=" * 80)
        print("POPULATING EUR PRICES")
        print("=" * 80)
        
        # Get exchange rates
        self.exchange_rates = self.get_exchange_rates()
        
        # Ensure EUR column exists
        if 'Launched Price (Europe)' not in df.columns:
            df['Launched Price (Europe)'] = None
        
        # Define price columns and their currencies
        price_columns = {
            'Launched Price (USA)': 'USD',
            'Launched Price (Pakistan)': 'PKR',
            'Launched Price (India)': 'INR',
            'Launched Price (China)': 'CNY',
            'Launched Price (Dubai)': 'AED',
        }
        
        # Priority order: prefer USD, then others
        priority_order = [
            'Launched Price (USA)',
            'Launched Price (Dubai)',
            'Launched Price (India)',
            'Launched Price (China)',
            'Launched Price (Pakistan)',
        ]
        
        self.stats['total'] = len(df)
        converted_count = 0
        
        for idx, row in df.iterrows():
            eur_price = None
            
            # Check if EUR price already exists
            existing_eur = row.get('Launched Price (Europe)')
            if pd.notna(existing_eur) and existing_eur and str(existing_eur).strip() != '':
                # Try to extract existing EUR value
                existing_value = self.extract_price_value(str(existing_eur))
                if existing_value and existing_value > 0:
                    # Keep existing EUR price
                    continue
            
            # Try to convert from available prices (in priority order)
            for price_col in priority_order:
                if price_col not in df.columns:
                    continue
                
                price_str = row.get(price_col)
                if pd.isna(price_str) or not price_str:
                    continue
                
                # Extract price value
                price_value = self.extract_price_value(str(price_str))
                if price_value and price_value > 0:
                    # Convert to EUR
                    currency = price_columns[price_col]
                    eur_price = self.convert_to_eur(price_value, currency)
                    
                    if eur_price and eur_price > 0:
                        # Format as "EUR XXX.XX"
                        df.at[idx, 'Launched Price (Europe)'] = f"EUR {eur_price:.2f}"
                        converted_count += 1
                        break
            
            if eur_price is None:
                self.stats['skipped'] += 1
        
        self.stats['converted'] = converted_count
        
        print(f"\n[OK] Conversion complete:")
        print(f"     Total models: {self.stats['total']}")
        print(f"     EUR prices populated: {converted_count}")
        print(f"     Skipped (no source price): {self.stats['skipped']}")
        
        return df

    def run(self):
        """Main function to populate EUR prices"""
        print("=" * 80)
        print("EUR PRICE POPULATOR FOR MOBILE PHONES")
        print("=" * 80)
        
        # Load dataset
        df = self.load_dataset()
        if df is None:
            return
        
        # Populate EUR prices
        df = self.populate_eur_prices(df)
        
        # Save updated dataset
        project_root = Path(__file__).parent.parent.parent
        output_file = project_root / 'data' / 'Mobiles Dataset (2025).csv'
        
        # Backup original if it doesn't have EUR column
        if 'Launched Price (Europe)' not in pd.read_csv(output_file, nrows=1, encoding='latin-1').columns:
            backup_file = project_root / 'data' / 'Mobiles Dataset (2025)_backup.csv'
            if not backup_file.exists():
                import shutil
                shutil.copy2(output_file, backup_file)
                print(f"\n[OK] Backup created: {backup_file}")
        
        # Save with same encoding as original
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
        print(f"EUR prices populated: {self.stats['converted']}")
        print(f"Skipped: {self.stats['skipped']}")
        print(f"Coverage: {(self.stats['converted'] / self.stats['total'] * 100):.1f}%")
        print("\n✅ All models now have EUR prices (where source prices available)!")


if __name__ == '__main__':
    populator = EURPricePopulator()
    populator.run()

