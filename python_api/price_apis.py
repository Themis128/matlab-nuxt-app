"""
API-based Price Fetching Module
Replaces web scraping with local database queries for production use

Uses local SQLite database with real price data from mobiles dataset
"""

import os
import sqlite3
from typing import Dict, Optional
from pathlib import Path


class LocalPriceDatabase:
    """Local SQLite database for price lookups"""

    def __init__(self):
        """Initialize database connection"""
        db_path = Path(__file__).parent / "price_database.db"
        self.conn = sqlite3.connect(str(db_path))
        self.conn.row_factory = sqlite3.Row

    def search_product(self, query: str, country: str = "usa") -> Optional[Dict]:
        """
        Search for product in local database

        Args:
            query: Product search query
            country: Country code (usa, india, pakistan, china, dubai)

        Returns:
            Dict with price and product info, or None
        """
        try:
            cursor = self.conn.cursor()

            # Map country codes to database columns
            country_map = {
                "usa": "price_usa",
                "india": "price_india",
                "pakistan": "price_pakistan",
                "china": "price_china",
                "dubai": "price_dubai",
                "de": "price_dubai",  # Default to Dubai for Germany
                "fr": "price_dubai",  # Default to Dubai for France
                "uk": "price_dubai",  # Default to Dubai for UK
            }

            price_column = country_map.get(country.lower(), "price_usa")

            # Search for products matching the query
            cursor.execute(f'''
                SELECT company, model, {price_column}, launched_year
                FROM mobile_prices
                WHERE (company || ' ' || model) LIKE ?
                ORDER BY {price_column} DESC
                LIMIT 1
            ''', (f'%{query}%',))

            row = cursor.fetchone()

            if row:
                price = row[price_column]
                if price:
                    return {
                        "price": float(price),
                        "currency": "USD" if country.lower() == "usa" else "EUR",
                        "source": f"Local Database ({country.title()})",
                        "url": None,
                        "title": f"{row['company']} {row['model']}",
                    }

            # If no exact match, try broader search
            cursor.execute(f'''
                SELECT company, model, {price_column}, launched_year
                FROM mobile_prices
                WHERE company LIKE ? OR model LIKE ?
                ORDER BY {price_column} DESC
                LIMIT 1
            ''', (f'%{query}%', f'%{query}%'))

            row = cursor.fetchone()

            if row:
                price = row[price_column]
                if price:
                    return {
                        "price": float(price),
                        "currency": "USD" if country.lower() == "usa" else "EUR",
                        "source": f"Local Database ({country.title()})",
                        "url": None,
                        "title": f"{row['company']} {row['model']}",
                    }

            return None

        except Exception as e:
            print(f"    [!] Local database error: {e}")
            return None

    def get_product_details(self, company: str, model: str) -> Optional[Dict]:
        """
        Get detailed product information including image

        Args:
            company: Company name
            model: Model name

        Returns:
            Dict with full product details, or None
        """
        try:
            cursor = self.conn.cursor()

            cursor.execute('''
                SELECT * FROM mobile_prices
                WHERE company = ? AND model = ?
                LIMIT 1
            ''', (company, model))

            row = cursor.fetchone()

            if row:
                return dict(row)

            return None

        except Exception as e:
            print(f"    [!] Local database error: {e}")
            return None

    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()


class GoogleShoppingAPI:
    """Google Custom Search API for Shopping results"""

    def __init__(self):
        """
        Initialize Google Shopping API

        API credentials are loaded from environment variables only.
        """
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.search_engine_id = os.getenv("GOOGLE_SEARCH_ENGINE_ID")
        self.base_url = "https://www.googleapis.com/customsearch/v1"

    def is_configured(self) -> bool:
        """Check if API is properly configured"""
        return bool(self.api_key and self.search_engine_id)

    def search_product(self, query: str, country: str = "de", language: str = "de") -> Optional[Dict]:
        """
        Search for product using local database (fallback to Google if configured)

        Args:
            query: Product search query
            country: Country code (de, fr, uk, etc.)
            language: Language code

        Returns:
            Dict with price and product info, or None
        """
        # Try local database first
        local_db = LocalPriceDatabase()
        try:
            result = local_db.search_product(query, country)
            if result:
                return result
        finally:
            local_db.close()

        # Fallback to Google API if configured
        if not self.is_configured():
            return None

        try:
            params = {
                "key": self.api_key,
                "cx": self.search_engine_id,
                "q": f"{query} kaufen preis",
                "gl": country,
                "hl": language,
                "num": 10,
                "safe": "off",
            }

            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Extract price information from search results
            items = data.get("items", [])
            for item in items:
                snippet = item.get("snippet", "")
                title = item.get("title", "")

                # Look for price patterns in snippet/title
                import re

                price_patterns = [
                    r"€\s*(\d{1,3}(?:[.,]\d{2})?)",
                    r"(\d{1,3}(?:[.,]\d{2})?)\s*€",
                    r"EUR\s*(\d{1,3}(?:[.,]\d{2})?)",
                ]

                for pattern in price_patterns:
                    match = re.search(pattern, snippet + " " + title, re.IGNORECASE)
                    if match:
                        try:
                            price = float(match.group(1).replace(",", "."))
                            if 50 <= price <= 5000:  # Reasonable price range
                                return {
                                    "price": price,
                                    "currency": "EUR",
                                    "source": "Google Shopping",
                                    "url": item.get("link"),
                                    "title": title,
                                }
                        except ValueError:
                            continue

            return None

        except requests.exceptions.RequestException as e:
            print(f"    [!] Google Shopping API error: {e}")
            return None


class AmazonPAAPI:
    """Amazon Product Advertising API 5.0"""

    def __init__(self, region: str = "de"):
        """
        Initialize Amazon PA-API

        API credentials are loaded from environment variables only.

        Args:
            region: Region (de, com, co.uk, fr, etc.)
        """
        self.access_key = os.getenv("AMAZON_ACCESS_KEY")
        self.secret_key = os.getenv("AMAZON_SECRET_KEY")
        self.partner_tag = os.getenv("AMAZON_PARTNER_TAG")
        self.region = region

        # API endpoints by region
        self.endpoints = {
            "de": "https://webservices.amazon.de/paapi5/searchitems",
            "com": "https://webservices.amazon.com/paapi5/searchitems",
            "co.uk": "https://webservices.amazon.co.uk/paapi5/searchitems",
            "fr": "https://webservices.amazon.fr/paapi5/searchitems",
        }

        self.endpoint = self.endpoints.get(region, self.endpoints["de"])

    def is_configured(self) -> bool:
        """Check if API is properly configured"""
        return bool(self.access_key and self.secret_key and self.partner_tag)

    def search_product(self, query: str) -> Optional[Dict]:
        """
        Search for product using local database (fallback to Amazon if configured)

        Args:
            query: Product search query

        Returns:
            Dict with price and product info, or None
        """
        # Try local database first
        local_db = LocalPriceDatabase()
        try:
            # Map region to country
            region_map = {
                "de": "dubai",  # Germany -> Dubai prices
                "com": "usa",   # US
                "co.uk": "dubai",  # UK -> Dubai
                "fr": "dubai",  # France -> Dubai
            }
            country = region_map.get(self.region, "usa")

            result = local_db.search_product(query, country)
            if result:
                result["source"] = f"Local Database (Amazon {self.region})"
                return result
        finally:
            local_db.close()

        # Fallback to Amazon API if configured
        if not self.is_configured():
            return None

        try:
            # PA-API 5.0 requires signed requests
            # This is a simplified version - full implementation requires proper AWS signing
            # Request signing omitted here; use official SDK or AWS Signature V4

            # Note: Full implementation requires AWS Signature Version 4
            # This is a placeholder - you'll need to use a library like paapi5-python-sdk
            # or implement proper AWS signing

            import logging

            logging.getLogger("python_api").warning(
                "Amazon PA-API requires AWS Signature V4 - use paapi5-python-sdk (request keywords: %s)",
                query,
            )
            return None

        except Exception as e:
            print(f"    [!] Amazon PA-API error: {e}")
            return None


class PriceComparisonAPI:
    """Price comparison APIs (Idealo, Geizhals, etc.)"""

    def search_idealo(self, query: str) -> Optional[Dict]:
        """Search Idealo (placeholder; public API may not be available)"""
        try:
            # No public API; consider RSS feeds or partnerships
            return None
        except Exception as e:
            print(f"    [!] Idealo API error: {e}")
            return None

    def search_geizhals(self, query: str) -> Optional[Dict]:
        """
        Search Geizhals.at (if API available)
        Note: Geizhals may not have a public API
        """
        # Geizhals doesn't have a public API
        # You could scrape their RSS feeds or contact them for API access
        try:
            return None
        except Exception as e:
            print(f"    [!] Geizhals API error: {e}")
            return None


class PriceAPIManager:
    """Manager for all price APIs"""

    def __init__(self):
        """Initialize all available APIs"""
        self.google_shopping = GoogleShoppingAPI()
        self.amazon_paapi = AmazonPAAPI()
        self.price_comparison = PriceComparisonAPI()

        self.stats = {
            "google_shopping": {"success": 0, "failed": 0},
            "amazon_paapi": {"success": 0, "failed": 0},
            "price_comparison": {"success": 0, "failed": 0},
        }

    def get_price(self, product_name: str, preferred_source: Optional[str] = None) -> Optional[Dict]:
        """
        Get product price from available APIs

        Args:
            product_name: Product name to search for
            preferred_source: Preferred API ('google', 'amazon', or None for all)

        Returns:
            Dict with price info, or None
        """
        print(f"  [→] Searching APIs for: {product_name}")

        # Try Google Shopping first (most reliable)
        if not preferred_source or preferred_source == "google":
            if self.google_shopping.is_configured():
                print("    [→] Trying Google Shopping API...")
                result = self.google_shopping.search_product(product_name)
                if result:
                    print(f"    [OK] Found on Google Shopping: €{result['price']:.2f}")
                    self.stats["google_shopping"]["success"] += 1
                    return result
                self.stats["google_shopping"]["failed"] += 1
            else:
                print("    [!] Google Shopping API not configured")

        # Try Amazon PA-API
        if not preferred_source or preferred_source == "amazon":
            if self.amazon_paapi.is_configured():
                print("    [→] Trying Amazon PA-API...")
                result = self.amazon_paapi.search_product(product_name)
                if result:
                    print(f"    [OK] Found on Amazon: €{result['price']:.2f}")
                    self.stats["amazon_paapi"]["success"] += 1
                    return result
                self.stats["amazon_paapi"]["failed"] += 1
            else:
                print("    [!] Amazon PA-API not configured")

        # Try price comparison APIs
        if not preferred_source or preferred_source == "comparison":
            if self.price_comparison.api_key:
                print("    [→] Trying Price Comparison API...")
                result = self.price_comparison.search_idealo(product_name)
                if result:
                    print(f"    [OK] Found on Price Comparison: €{result['price']:.2f}")
                    self.stats["price_comparison"]["success"] += 1
                    return result
                self.stats["price_comparison"]["failed"] += 1

        print(f"  [!] No price found via APIs for {product_name}")
        return None

    def get_stats(self) -> Dict:
        """Get API usage statistics"""
        return self.stats.copy()

    def is_any_configured(self) -> bool:
        """Check if at least one API is configured"""
        return (
            self.google_shopping.is_configured()
            or self.amazon_paapi.is_configured()
            or bool(self.price_comparison.api_key)
        )


# Convenience function for backward compatibility
def get_product_price(product_name: str, api_key: Optional[str] = None) -> Optional[float]:
    """
    Simple function to get product price

    Args:
        product_name: Product name
        api_key: Optional API key override

    Returns:
        Price as float, or None
    """
    manager = PriceAPIManager()
    result = manager.get_price(product_name)
    return result["price"] if result else None
