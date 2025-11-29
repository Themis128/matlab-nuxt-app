"""
Greek Market Price Scraper for Mobile Phones
Scrapes current Euro prices from Greek e-commerce sites and updates the dataset
"""

# Standard library imports
import json
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional
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


class GreekPriceScraper:
    """Scraper for current Euro prices from Greek e-commerce sites"""

    def __init__(self, delay: float = 2.5):
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
            'Accept-Language': 'el-GR,el;q=0.9,en-US;q=0.8,en;q=0.7',
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

    def search_skroutz(self, query: str) -> Optional[float]:
        """Search Skroutz.gr (Greek price comparison site)"""
        try:
            # Skroutz search URL - try with "smartphone" keyword for better results
            search_queries = [
                f"{query} smartphone",
                query
            ]

            for search_query in search_queries:
                try:
                    search_url = f"https://www.skroutz.gr/s?q={quote(search_query)}"

                    response = self.session.get(search_url, timeout=15)

                    if response.status_code == 403:
                        print(f"    [!] Skroutz.gr blocked request (403)")
                        time.sleep(self.delay * 2)  # Wait longer if blocked
                        continue

                    if response.status_code == 404:
                        continue  # Try next query

                    response.raise_for_status()
                    soup = BeautifulSoup(response.text, 'html.parser')

                    # Look for price elements (Skroutz format - updated selectors)
                    price_selectors = [
                        '.price',
                        '.product-price',
                        '[data-price]',
                        '.price-tag',
                        '.final-price',
                        '.js-product-price',
                        '.product-card-price',
                        'span[itemprop="price"]'
                    ]

                    for selector in price_selectors:
                        price_elements = soup.select(selector)
                        for elem in price_elements[:5]:  # Check first 5 results
                            price_text = elem.get_text(strip=True)
                            # Extract Euro price (format: "799,99€" or "799€" or "799.99€")
                            # Remove € symbol and handle comma/dot as decimal separator
                            price_clean = price_text.replace('€', '').replace('EUR', '').strip()
                            # Handle Greek number format (comma as decimal separator)
                            if ',' in price_clean and '.' in price_clean:
                                # Both present - assume comma is decimal
                                price_clean = price_clean.replace('.', '').replace(',', '.')
                            elif ',' in price_clean:
                                # Only comma - could be decimal or thousands separator
                                # Try as decimal first
                                price_clean = price_clean.replace(',', '.')
                            else:
                                # No comma, just dots
                                price_clean = price_clean.replace('.', '')

                            price_match = re.search(r'(\d+\.?\d*)', price_clean)
                            if price_match:
                                try:
                                    price = float(price_match.group(1))
                                    if 50 <= price <= 5000:  # Reasonable price range
                                        time.sleep(self.delay)
                                        return price
                                except ValueError:
                                    continue

                    time.sleep(self.delay)
                except requests.exceptions.RequestException:
                    continue

            return None

        except Exception as e:
            print(f"    [!] Skroutz.gr search error: {e}")
            return None

    def search_bestprice(self, query: str) -> Optional[float]:
        """Search BestPrice.gr (Greek price comparison site)"""
        try:
            search_url = f"https://www.bestprice.gr/search?q={quote(query)}"

            response = self.session.get(search_url, timeout=15)

            if response.status_code == 403:
                print(f"    [!] BestPrice.gr blocked request (403)")
                return None

            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # Look for price elements
            price_selectors = [
                '.price',
                '.product-price',
                '[data-price]',
                '.price-value'
            ]

            for selector in price_selectors:
                price_elements = soup.select(selector)
                for elem in price_elements[:5]:
                    price_text = elem.get_text(strip=True)
                    price_clean = price_text.replace('€', '').replace('.', '').replace(',', '.').strip()
                    price_match = re.search(r'(\d+\.?\d*)', price_clean)
                    if price_match:
                        price = float(price_match.group(1))
                        if 50 <= price <= 5000:
                            time.sleep(self.delay)
                            return price

            time.sleep(self.delay)
            return None

        except requests.exceptions.RequestException as e:
            print(f"    [!] BestPrice.gr request error: {e}")
            return None
        except Exception as e:
            print(f"    [!] BestPrice.gr search error: {e}")
            return None

    def search_google_shopping_gr(self, query: str) -> Optional[float]:
        """Search Google Shopping (Greece)"""
        try:
            # Google Shopping search for Greece
            search_url = f"https://www.google.com/search?tbm=shop&q={quote(query + ' site:gr')}&gl=gr&hl=el"

            response = self.session.get(search_url, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # Look for price elements in Google Shopping results
            price_elements = soup.select('.a8Pemb, .Nr22bf, .a-price-whole, .price')

            for elem in price_elements[:5]:
                price_text = elem.get_text(strip=True)
                # Extract Euro price
                price_clean = price_text.replace('€', '').replace('.', '').replace(',', '.').strip()
                price_match = re.search(r'(\d+\.?\d*)', price_clean)
                if price_match:
                    price = float(price_match.group(1))
                    if 50 <= price <= 5000:
                        time.sleep(self.delay)
                        return price

            time.sleep(self.delay)
            return None

        except Exception as e:
            print(f"    [!] Google Shopping GR search error: {e}")
            return None

    def scrape_price(self, model_name: str) -> Optional[float]:
        """
        Scrape Greek market price for a model using multiple sources

        Returns:
            Euro price as float, or None if not found
        """
        print(f"  [→] Searching Greek market for: {model_name}")

        # Try multiple sources
        sources = [
            ("Skroutz.gr", self.search_skroutz),
            ("BestPrice.gr", self.search_bestprice),
            ("Google Shopping GR", self.search_google_shopping_gr),
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

        print(f"  [!] No price found for {model_name} in Greek market")
        return None

    def update_dataset(self, df: pd.DataFrame, limit: Optional[int] = None) -> pd.DataFrame:
        """
        Update dataset with Greek market prices

        Args:
            df: Dataset DataFrame
            limit: Maximum number of models to process (None for all)

        Returns:
            Updated DataFrame
        """
        print("\n" + "=" * 80)
        print("UPDATING DATASET WITH GREEK MARKET PRICES")
        print("=" * 80)

        # Ensure column exists
        if 'Current Price (Greece)' not in df.columns:
            df['Current Price (Greece)'] = None

        # Get unique models
        models_to_process = []
        for idx, row in df.iterrows():
            model_name = self.get_model_name(row)
            if model_name and model_name != "Unknown":
                # Check if we already have a price for this model
                model_key = model_name.lower().strip()
                if model_key not in self.price_data:
                    models_to_process.append((idx, model_name, model_key))

        if limit:
            models_to_process = models_to_process[:limit]

        print(f"\n[OK] Found {len(models_to_process)} unique models to process")

        # Process each model
        for i, (idx, model_name, model_key) in enumerate(models_to_process, 1):
            self.stats['total'] += 1
            print(f"\n[{i}/{len(models_to_process)}] Processing: {model_name}")

            try:
                # Check if we already scraped this model
                if model_key in self.price_data:
                    price = self.price_data[model_key]
                    print(f"  [OK] Using cached price: €{price:.2f}")
                else:
                    # Scrape price
                    price = self.scrape_price(model_name)
                    if price:
                        self.price_data[model_key] = price

                # Update dataset
                if price:
                    df.at[idx, 'Current Price (Greece)'] = f"EUR {price:.2f}"
                    self.stats['found'] += 1
                    print(f"  [OK] Updated with price: €{price:.2f}")
                else:
                    self.stats['not_found'] += 1

                # Save progress periodically
                if i % 10 == 0:
                    self.save_progress()
                    print(f"\n[SAVED] Progress saved ({i}/{len(models_to_process)} processed)")

            except Exception as e:
                print(f"  [X] Error processing {model_name}: {e}")
                self.stats['errors'] += 1
                continue

        return df

    def save_progress(self):
        """Save scraping progress to JSON file"""
        project_root = Path(__file__).parent.parent.parent
        progress_file = project_root / 'data' / 'greek_price_scraping_progress.json'

        def convert_types(obj):
            try:
                import numpy as np
                if isinstance(obj, np.integer):
                    return int(obj)
                elif isinstance(obj, np.floating):
                    return float(obj)
                elif isinstance(obj, np.bool_):
                    return bool(obj)
            except (ImportError, TypeError):
                pass

            if hasattr(obj, 'item'):
                try:
                    return obj.item()
                except (ValueError, TypeError, AttributeError):
                    pass

            if isinstance(obj, (int, float, bool, str, type(None))):
                return obj
            elif isinstance(obj, dict):
                return {k: convert_types(v) for k, v in obj.items()}
            elif isinstance(obj, (list, tuple)):
                return [convert_types(item) for item in obj]
            return obj

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

    def run(self, limit: Optional[int] = None):
        """
        Main function to scrape prices and update dataset

        Args:
            limit: Maximum number of models to process (None for all)
        """
        print("=" * 80)
        print("GREEK MARKET PRICE SCRAPER FOR MOBILE PHONES")
        print("=" * 80)

        # Load dataset
        df = self.load_dataset()
        if df is None:
            return

        # Load previous progress if exists
        project_root = Path(__file__).parent.parent.parent
        progress_file = project_root / 'data' / 'greek_price_scraping_progress.json'
        if progress_file.exists():
            try:
                with open(progress_file, 'r', encoding='utf-8') as f:
                    prev_data = json.load(f)
                    self.price_data = prev_data.get('prices', {})
                    print(f"[OK] Loaded {len(self.price_data)} previous prices")
            except (FileNotFoundError, json.JSONDecodeError, IOError):
                pass

        # Update dataset with Greek prices
        df = self.update_dataset(df, limit=limit)

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
        if self.stats['total'] > 0:
            print(f"Success rate: {(self.stats['found'] / self.stats['total'] * 100):.1f}%")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Scrape Greek market prices for mobile phones')
    parser.add_argument('--limit', type=int, help='Limit number of models to scrape')
    parser.add_argument('--delay', type=float, default=2.5, help='Delay between requests (seconds)')

    args = parser.parse_args()

    scraper = GreekPriceScraper(delay=args.delay)
    scraper.run(limit=args.limit)


if __name__ == "__main__":
    main()
