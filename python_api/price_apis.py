"""
API-based Price Fetching Module
Replaces web scraping with official APIs for production use

Supported APIs:
- Google Shopping API (Custom Search)
- Amazon Product Advertising API (PA-API 5.0)
- Price comparison APIs (Idealo, Geizhals via their APIs if available)
"""

import os
import requests
import time
from typing import Optional, Dict, List
from datetime import datetime
import json
from pathlib import Path


class GoogleShoppingAPI:
    """Google Custom Search API for Shopping results"""

    def __init__(self):
        """
        Initialize Google Shopping API

        API credentials are loaded from environment variables only.
        """
        self.api_key = os.getenv('GOOGLE_API_KEY')
        self.search_engine_id = os.getenv('GOOGLE_SEARCH_ENGINE_ID')
        self.base_url = "https://www.googleapis.com/customsearch/v1"

    def is_configured(self) -> bool:
        """Check if API is properly configured"""
        return bool(self.api_key and self.search_engine_id)

    def search_product(self, query: str, country: str = "de", language: str = "de") -> Optional[Dict]:
        """
        Search for product using Google Custom Search API

        Args:
            query: Product search query
            country: Country code (de, fr, uk, etc.)
            language: Language code

        Returns:
            Dict with price and product info, or None
        """
        if not self.is_configured():
            return None

        try:
            params = {
                'key': self.api_key,
                'cx': self.search_engine_id,
                'q': f"{query} kaufen preis",
                'gl': country,
                'hl': language,
                'num': 10,
                'safe': 'off'
            }

            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Extract price information from search results
            items = data.get('items', [])
            for item in items:
                snippet = item.get('snippet', '')
                title = item.get('title', '')

                # Look for price patterns in snippet/title
                import re
                price_patterns = [
                    r'€\s*(\d{1,3}(?:[.,]\d{2})?)',
                    r'(\d{1,3}(?:[.,]\d{2})?)\s*€',
                    r'EUR\s*(\d{1,3}(?:[.,]\d{2})?)',
                ]

                for pattern in price_patterns:
                    match = re.search(pattern, snippet + ' ' + title, re.IGNORECASE)
                    if match:
                        try:
                            price = float(match.group(1).replace(',', '.'))
                            if 50 <= price <= 5000:  # Reasonable price range
                                return {
                                    'price': price,
                                    'currency': 'EUR',
                                    'source': 'Google Shopping',
                                    'url': item.get('link'),
                                    'title': title
                                }
                        except ValueError:
                            continue

            return None

        except requests.exceptions.RequestException as e:
            print(f"    [!] Google Shopping API error: {e}")
            return None
        except Exception as e:
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
        self.access_key = os.getenv('AMAZON_ACCESS_KEY')
        self.secret_key = os.getenv('AMAZON_SECRET_KEY')
        self.partner_tag = os.getenv('AMAZON_PARTNER_TAG')
        self.region = region

        # API endpoints by region
        self.endpoints = {
            'de': 'https://webservices.amazon.de/paapi5/searchitems',
            'com': 'https://webservices.amazon.com/paapi5/searchitems',
            'co.uk': 'https://webservices.amazon.co.uk/paapi5/searchitems',
            'fr': 'https://webservices.amazon.fr/paapi5/searchitems',
        }

        self.endpoint = self.endpoints.get(region, self.endpoints['de'])

    def is_configured(self) -> bool:
        """Check if API is properly configured"""
        return bool(self.access_key and self.secret_key and self.partner_tag)

    def search_product(self, query: str) -> Optional[Dict]:
        """
        Search for product using Amazon PA-API 5.0

        Args:
            query: Product search query

        Returns:
            Dict with price and product info, or None
        """
        if not self.is_configured():
            return None

        try:
            import hmac
            import hashlib
            import json as json_lib
            from datetime import datetime as dt

            # PA-API 5.0 requires signed requests
            # This is a simplified version - full implementation requires proper AWS signing
            payload = {
                "PartnerTag": self.partner_tag,
                "PartnerType": "Associates",
                "Keywords": query,
                "SearchIndex": "Electronics",
                "ItemCount": 5,
                "Resources": [
                    "ItemInfo.Title",
                    "Offers.Listings.Price",
                    "Offers.Listings.Availability",
                    "Images.Primary.Large"
                ]
            }

            # Note: Full implementation requires AWS Signature Version 4
            # This is a placeholder - you'll need to use a library like paapi5-python-sdk
            # or implement proper AWS signing

            print("    [!] Amazon PA-API requires AWS Signature V4 - use paapi5-python-sdk")
            return None

        except Exception as e:
            print(f"    [!] Amazon PA-API error: {e}")
            return None


class PriceComparisonAPI:
    """Price comparison APIs (Idealo, Geizhals, etc.)"""

    def __init__(self):
        """
        Initialize Price Comparison API

        API credentials are loaded from environment variables only.
        """
        self.api_key = os.getenv('PRICE_COMPARISON_API_KEY')

    def search_idealo(self, query: str) -> Optional[Dict]:
        """
        Search Idealo.de (if API available)
        Note: Idealo may not have a public API - this is a placeholder
        """
        # Idealo doesn't have a public API, but you could use their RSS feeds
        # or contact them for API access
        try:
            # Placeholder for Idealo API integration
            # You would need to check if Idealo offers an API
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
            'google_shopping': {'success': 0, 'failed': 0},
            'amazon_paapi': {'success': 0, 'failed': 0},
            'price_comparison': {'success': 0, 'failed': 0}
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
        if not preferred_source or preferred_source == 'google':
            if self.google_shopping.is_configured():
                print("    [→] Trying Google Shopping API...")
                result = self.google_shopping.search_product(product_name)
                if result:
                    print(f"    [OK] Found on Google Shopping: €{result['price']:.2f}")
                    self.stats['google_shopping']['success'] += 1
                    return result
                self.stats['google_shopping']['failed'] += 1
            else:
                print("    [!] Google Shopping API not configured")

        # Try Amazon PA-API
        if not preferred_source or preferred_source == 'amazon':
            if self.amazon_paapi.is_configured():
                print("    [→] Trying Amazon PA-API...")
                result = self.amazon_paapi.search_product(product_name)
                if result:
                    print(f"    [OK] Found on Amazon: €{result['price']:.2f}")
                    self.stats['amazon_paapi']['success'] += 1
                    return result
                self.stats['amazon_paapi']['failed'] += 1
            else:
                print("    [!] Amazon PA-API not configured")

        # Try price comparison APIs
        if not preferred_source or preferred_source == 'comparison':
            if self.price_comparison.api_key:
                print("    [→] Trying Price Comparison API...")
                result = self.price_comparison.search_idealo(product_name)
                if result:
                    print(f"    [OK] Found on Price Comparison: €{result['price']:.2f}")
                    self.stats['price_comparison']['success'] += 1
                    return result
                self.stats['price_comparison']['failed'] += 1

        print(f"  [!] No price found via APIs for {product_name}")
        return None

    def get_stats(self) -> Dict:
        """Get API usage statistics"""
        return self.stats.copy()

    def is_any_configured(self) -> bool:
        """Check if at least one API is configured"""
        return (
            self.google_shopping.is_configured() or
            self.amazon_paapi.is_configured() or
            bool(self.price_comparison.api_key)
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
    return result['price'] if result else None
