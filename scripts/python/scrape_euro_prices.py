"""
Euro Price Scraper for Mobile Phones
Scrapes current Euro prices from European e-commerce sites and updates the dataset
"""

# Standard library imports
import json
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import quote, urljoin

# Third-party imports
import pandas as pd
import requests
from bs4 import BeautifulSoup

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except (OSError, AttributeError):
        pass


class EuroPriceScraper:
    """Scraper for current Euro prices from European e-commerce sites"""

    def __init__(self, delay: float = 2.0):
        """
        Initialize the scraper

        Args:
            delay: Delay between requests (seconds)
        """
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,de;q=0.8,fr;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        })
        self.session.timeout = 15
        self.price_data = {}  # Store scraped prices
        self.stats = {
            'total': 0,
            'found': 0,
            'not_found': 0,
            'errors': 0
        }

    def find_dataset_file(self) -> Optional[str]:
        """Find the dataset CSV file"""
        # Get project root (3 levels up from scripts/python/)
        project_root = Path(__file__).parent.parent.parent
        possible_paths = [
            project_root / 'data' / 'Mobiles Dataset (2025).csv',
            project_root / 'Mobiles Dataset (2025).csv',
            project_root / 'mobiles-dataset-docs' / 'Mobiles Dataset (2025).csv',
            project_root / 'mobiles-dataset-docs' / 'preprocessed' / 'preprocessed_data.csv',
        ]

        for path in possible_paths:
            if path.exists():
                return str(path)
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
                    break
                except UnicodeDecodeError:
                    continue

            if df is None:
                print("[X] Failed to load dataset")
                return None

            print(f"[OK] Loaded {len(df):,} rows, {len(df.columns)} columns")
            return df

        except Exception as e:
            print(f"[X] Error loading dataset: {e}")
            return None

    def get_model_name(self, row: pd.Series) -> str:
        """Extract full model name from dataset row"""
        model_cols = ['Model Name', 'ModelName', 'Model_Name', 'model', 'Model']
        company_cols = ['Company Name', 'CompanyName', 'Company_Name', 'Company', 'company']

        model = None
        company = None

        for col in model_cols:
            if col in row.index and pd.notna(row[col]):
                model = str(row[col]).strip()
                break

        for col in company_cols:
            if col in row.index and pd.notna(row[col]):
                company = str(row[col]).strip()
                break

        if company and model:
            return f"{company} {model}"
        elif model:
            return model
        elif company:
            return company
        else:
            return "Unknown"

    def search_amazon_de(self, query: str) -> Optional[float]:
        """Search Amazon.de for product price"""
        try:
            # Try without "smartphone" keyword first
            search_queries = [
                query,
                f"{query} smartphone"
            ]

            for search_query in search_queries:
                try:
                    search_url = f"https://www.amazon.de/s?k={quote(search_query)}&ref=sr_pg_1"

                    response = self.session.get(search_url, timeout=15)

                    # Check if we got blocked
                    if response.status_code == 503:
                        print(f"    [!] Amazon.de temporarily unavailable (503)")
                        continue

                    response.raise_for_status()
                    soup = BeautifulSoup(response.text, 'html.parser')

                    # Look for price elements (Amazon.de format)
                    price_selectors = [
                        'span.a-price-whole',
                        'span.a-price .a-offscreen',
                        '.a-price[data-a-color="base"]',
                        'span[data-a-color="price"]',
                        '.a-price-symbol + .a-price-whole'
                    ]

                    for selector in price_selectors:
                        price_elements = soup.select(selector)
                        for elem in price_elements[:5]:  # Check first 5 results
                            price_text = elem.get_text(strip=True)
                            # Extract Euro price (format: "799,99" or "799")
                            # Amazon.de uses comma as decimal separator
                            price_match = re.search(r'(\d{1,3}(?:[.,]\d{2})?)', price_text.replace('.', '').replace(',', '.'))
                            if price_match:
                                price = float(price_match.group(1))
                                if 50 <= price <= 5000:  # Reasonable price range
                                    time.sleep(self.delay)
                                    return price

                    time.sleep(self.delay)
                except requests.exceptions.RequestException:
                    continue

            return None

        except Exception as e:
            print(f"    [!] Amazon.de search error: {e}")
            return None

    def search_idealo(self, query: str) -> Optional[float]:
        """Search Idealo.de (German price comparison site)"""
        try:
            search_query = f"{query}"
            search_url = f"https://www.idealo.de/preisvergleich/MainSearchProduct.html?q={quote(search_query)}"

            response = self.session.get(search_url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Look for price elements
            price_elements = soup.select('.price, .offerPrice, [data-price]')

            for elem in price_elements[:3]:
                price_text = elem.get_text(strip=True)
                # Extract Euro price
                price_match = re.search(r'(\d{1,3}(?:[.,]\d{2})?)', price_text.replace('.', '').replace(',', '.'))
                if price_match:
                    price = float(price_match.group(1))
                    if 50 <= price <= 5000:
                        time.sleep(self.delay)
                        return price

            time.sleep(self.delay)
            return None

        except Exception as e:
            print(f"    [!] Idealo search error: {e}")
            return None

    def search_geizhals(self, query: str) -> Optional[float]:
        """Search Geizhals.at (Austrian price comparison)"""
        try:
            search_query = f"{query}"
            search_url = f"https://geizhals.at/?fs={quote(search_query)}"

            response = self.session.get(search_url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Look for price elements
            price_elements = soup.select('.price, .gh_price, [data-price]')

            for elem in price_elements[:3]:
                price_text = elem.get_text(strip=True)
                price_match = re.search(r'(\d{1,3}(?:[.,]\d{2})?)', price_text.replace('.', '').replace(',', '.'))
                if price_match:
                    price = float(price_match.group(1))
                    if 50 <= price <= 5000:
                        time.sleep(self.delay)
                        return price

            time.sleep(self.delay)
            return None

        except Exception as e:
            print(f"    [!] Geizhals search error: {e}")
            return None

    def search_google_shopping(self, query: str) -> Optional[float]:
        """Search Google Shopping for Euro prices"""
        try:
            # Try different search strategies
            search_queries = [
                f"{query} kaufen preis",
                f"{query} price euro",
                f"{query} €"
            ]

            for search_query in search_queries:
                try:
                    search_url = f"https://www.google.com/search?q={quote(search_query)}&tbm=shop&gl=de&hl=de"

                    response = self.session.get(search_url, timeout=15)
                    response.raise_for_status()

                    # Extract prices from Google Shopping results
                    # Look for patterns like "€799", "799 €", "EUR 799"
                    price_patterns = [
                        r'€\s*(\d{1,3}(?:[.,]\d{2})?)',
                        r'(\d{1,3}(?:[.,]\d{2})?)\s*€',
                        r'EUR\s*(\d{1,3}(?:[.,]\d{2})?)',
                        r'(\d{1,3}(?:[.,]\d{2})?)\s*EUR'
                    ]

                    prices = []
                    for pattern in price_patterns:
                        matches = re.findall(pattern, response.text, re.IGNORECASE)
                        prices.extend(matches)

                    if prices:
                        # Get average of first few prices
                        valid_prices = []
                        for price_str in prices[:10]:
                            try:
                                price = float(price_str.replace(',', '.'))
                                if 50 <= price <= 5000:
                                    valid_prices.append(price)
                            except (ValueError, AttributeError):
                                continue

                        if valid_prices:
                            # Use median to avoid outliers
                            valid_prices.sort()
                            median_price = valid_prices[len(valid_prices)//2]
                            time.sleep(self.delay)
                            return round(median_price, 2)

                    time.sleep(self.delay)
                except Exception as e:
                    continue

            return None

        except Exception as e:
            print(f"    [!] Google Shopping search error: {e}")
            return None

    def scrape_price(self, model_name: str) -> Optional[float]:
        """
        Scrape Euro price for a model using multiple sources

        Returns:
            Euro price as float, or None if not found
        """
        print(f"  [→] Searching for: {model_name}")

        # Try multiple sources
        sources = [
            ("Google Shopping", self.search_google_shopping),
            ("Idealo", self.search_idealo),
            ("Geizhals", self.search_geizhals),
            ("Amazon.de", self.search_amazon_de),
        ]

        for source_name, search_func in sources:
            try:
                print(f"    [→] Trying {source_name}...")
                price = search_func(model_name)
                if price:
                    print(f"    [OK] Found price on {source_name}: €{price:.2f}")
                    return price
            except Exception as e:
                print(f"    [!] {source_name} error: {e}")
                continue

        print(f"  [!] No price found for {model_name}")
        return None

    def update_dataset(self, df: pd.DataFrame, limit: Optional[int] = None) -> pd.DataFrame:
        """
        Update dataset with Euro prices

        Args:
            df: Dataset DataFrame
            limit: Maximum number of models to process (None for all)

        Returns:
            Updated DataFrame
        """
        print("\n[→] Starting Euro price scraping...")
        print(f"[!] This will take a while. Processing {limit or len(df)} models...")
        print(f"[!] Delay between requests: {self.delay} seconds\n")

        # Get unique models
        models_to_process = []
        seen_models = set()

        for idx, row in df.iterrows():
            model_name = self.get_model_name(row)
            if model_name and model_name != "Unknown" and model_name not in seen_models:
                seen_models.add(model_name)
                models_to_process.append((idx, model_name))

        if limit:
            models_to_process = models_to_process[:limit]

        print(f"[OK] Found {len(models_to_process)} unique models to process\n")

        # Add Euro price column if it doesn't exist
        if 'Launched Price (Europe)' not in df.columns:
            df['Launched Price (Europe)'] = None

        # Process each model
        for i, (idx, model_name) in enumerate(models_to_process, 1):
            print(f"\n[{i}/{len(models_to_process)}] Processing: {model_name}")
            self.stats['total'] = int(self.stats['total']) + 1  # Ensure native Python int

            # Check if we already have a price for this model
            if model_name in self.price_data:
                price = self.price_data[model_name]
            else:
                price = self.scrape_price(model_name)
                if price:
                    self.price_data[model_name] = price

            # Update dataset
            if price:
                # Update all rows with this model name
                mask = df.apply(lambda r: self.get_model_name(r) == model_name, axis=1)
                df.loc[mask, 'Launched Price (Europe)'] = f"EUR {price:.2f}"
                rows_updated = int(mask.sum())  # Convert numpy int64 to Python int
                self.stats['found'] = int(self.stats['found']) + rows_updated  # Ensure native Python int
                print(f"  [OK] Updated {rows_updated} row(s) with price: €{price:.2f}")
            else:
                self.stats['not_found'] = int(self.stats['not_found']) + 1  # Ensure native Python int

            # Save progress periodically
            if i % 10 == 0:
                self.save_progress()
                print(f"\n[SAVED] Progress saved ({i}/{len(models_to_process)} processed)")

        return df

    def replace_usd_with_eur(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Replace USD prices with Euro prices where available

        Args:
            df: Dataset DataFrame

        Returns:
            Updated DataFrame
        """
        print("\n[→] Replacing USD prices with Euro prices...")

        if 'Launched Price (Europe)' not in df.columns:
            print("[X] No Euro prices found. Run scraping first.")
            return df

        replaced_count = 0

        for idx, row in df.iterrows():
            eur_price = row.get('Launched Price (Europe)')
            usd_price_col = 'Launched Price (USA)'

            if pd.notna(eur_price) and eur_price and str(eur_price) != 'nan':
                # Update USD column with Euro price
                df.at[idx, usd_price_col] = eur_price
                replaced_count += 1

        print(f"[OK] Replaced {replaced_count} USD prices with Euro prices")
        return df

    def save_progress(self):
        """Save scraping progress to JSON file"""
        project_root = Path(__file__).parent.parent.parent
        progress_file = project_root / 'data' / 'euro_price_scraping_progress.json'

        # Convert numpy types to native Python types for JSON serialization
        def convert_types(obj):
            # Handle numpy types and pandas types first
            try:
                import numpy as np

                # Check for numpy integer types
                if isinstance(obj, np.integer):
                    return int(obj)
                # Check for numpy floating types
                elif isinstance(obj, np.floating):
                    return float(obj)
                # Check for numpy bool
                elif isinstance(obj, np.bool_):
                    return bool(obj)
            except (ImportError, TypeError):
                pass

            # Try to convert to int or float if possible (handles pandas Int64, Float64, etc.)
            if hasattr(obj, 'item'):  # numpy scalars have .item() method
                try:
                    return obj.item()
                except (ValueError, TypeError, AttributeError):
                    pass

            # Try direct conversion for numeric types
            if hasattr(obj, '__int__') and not isinstance(obj, (bool, str)):
                try:
                    # Check if it's actually a numeric type
                    if not isinstance(obj, (list, dict, tuple, set)):
                        return int(obj)
                except (ValueError, TypeError):
                    pass

            if hasattr(obj, '__float__') and not isinstance(obj, (bool, str)):
                try:
                    if not isinstance(obj, (list, dict, tuple, set)):
                        return float(obj)
                except (ValueError, TypeError):
                    pass

            # Handle standard Python types
            if isinstance(obj, (int, float, bool, str, type(None))):
                return obj
            elif isinstance(obj, dict):
                return {k: convert_types(v) for k, v in obj.items()}
            elif isinstance(obj, (list, tuple)):
                return [convert_types(item) for item in obj]
            return obj

        # Ensure stats are native Python types
        stats_converted = {
            'total': int(self.stats['total']),
            'found': int(self.stats['found']),
            'not_found': int(self.stats['not_found']),
            'errors': int(self.stats['errors'])
        }

        data = {
            'timestamp': datetime.now().isoformat(),
            'stats': convert_types(stats_converted),
            'prices': convert_types(self.price_data)
        }

        with open(progress_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def run(self, limit: Optional[int] = None, replace_usd: bool = True):
        """
        Main function to scrape prices and update dataset

        Args:
            limit: Maximum number of models to process (None for all)
            replace_usd: Whether to replace USD prices with Euro prices
        """
        print("=" * 80)
        print("EURO PRICE SCRAPER FOR MOBILE PHONES")
        print("=" * 80)

        # Load dataset
        df = self.load_dataset()
        if df is None:
            return

        # Load previous progress if exists
        project_root = Path(__file__).parent.parent.parent
        progress_file = project_root / 'data' / 'euro_price_scraping_progress.json'
        if progress_file.exists():
            try:
                with open(progress_file, 'r', encoding='utf-8') as f:
                    prev_data = json.load(f)
                    self.price_data = prev_data.get('prices', {})
                    print(f"[OK] Loaded {len(self.price_data)} previous prices")
            except (FileNotFoundError, json.JSONDecodeError, IOError):
                pass

        # Update dataset with Euro prices
        df = self.update_dataset(df, limit=limit)

        # Replace USD with EUR if requested
        if replace_usd:
            df = self.replace_usd_with_eur(df)

        # Save updated dataset
        project_root = Path(__file__).parent.parent.parent
        output_file = project_root / 'mobiles-dataset-docs' / 'Mobiles Dataset (2025)_EUR.csv'
        df.to_csv(output_file, index=False, encoding='utf-8')
        print(f"\n[OK] Updated dataset saved to: {output_file}")

        # Save progress
        self.save_progress()

        # Summary
        print("\n" + "=" * 80)
        print("SCRAPING SUMMARY")
        print("=" * 80)
        print(f"Total models processed: {self.stats['total']}")
        print(f"Prices found: {self.stats['found']}")
        print(f"Prices not found: {self.stats['not_found']}")
        print(f"Errors: {self.stats['errors']}")
        print(f"Success rate: {(self.stats['found']/self.stats['total']*100):.1f}%" if self.stats['total'] > 0 else "N/A")
        print(f"\nUpdated dataset: {output_file}")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Scrape Euro prices for mobile phones')
    parser.add_argument('--limit', type=int, help='Limit number of models to scrape')
    parser.add_argument('--delay', type=float, default=2.0, help='Delay between requests (seconds)')
    parser.add_argument('--keep-usd', action='store_true', help='Keep USD prices, add EUR as new column')

    args = parser.parse_args()

    scraper = EuroPriceScraper(delay=args.delay)
    scraper.run(limit=args.limit, replace_usd=not args.keep_usd)


if __name__ == "__main__":
    main()
