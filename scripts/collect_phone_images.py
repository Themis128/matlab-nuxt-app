#!/usr/bin/env python3
"""
Phone Image Collection Script
Collects missing phone images for Samsung, Vivo, and Realme devices
"""

import requests
import os
import pandas as pd
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import time
import json
from pathlib import Path

class PhoneImageCollector:
    def __init__(self, dataset_path="data/Mobiles Dataset (2025).csv"):
        self.dataset_path = dataset_path
        self.base_dir = "public/mobile_images"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        # Add retry configuration
        from requests.adapters import HTTPAdapter
        from urllib3.util.retry import Retry
        retry_strategy = Retry(
            total=3,
            status_forcelist=[429, 500, 502, 503, 504],
            backoff_factor=1
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

    def load_missing_phones(self):
        """Load phones missing images from dataset"""
        # Use manual CSV parsing to avoid encoding issues
        missing_phones = []
        try:
            with open(self.dataset_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()

            # Skip header
            for line in lines[1:]:
                # Simple CSV parsing (basic approach)
                parts = line.strip().split(',')
                if len(parts) >= 2:
                    company = parts[0].strip('"')
                    model = parts[1].strip('"')

                    if company in ['Samsung', 'Vivo', 'Realme']:
                        dir_name = f"{company}_{model.replace(' ', '_')}"
                        dir_path = os.path.join(self.base_dir, dir_name)

                        # Check if directory exists and has images
                        has_images = os.path.exists(dir_path) and len(os.listdir(dir_path)) > 0

                        if not has_images:
                            missing_phones.append({
                                'company': company,
                                'model': model,
                                'dir_name': dir_name,
                                'search_term': f"{company} {model} official product image"
                            })
        except Exception as e:
            print(f"Error reading CSV: {e}")
            return []

        return missing_phones

    def search_brand_websites(self, phone):
        """Search official brand websites for phone images"""
        brand_strategies = {
            'Samsung': self._search_samsung,
            'Vivo': self._search_vivo,
            'Realme': self._search_realme
        }

        if phone['company'] in brand_strategies:
            return brand_strategies[phone['company']](phone)
        else:
            # Fallback for unknown brands
            return self._search_generic_brand(phone)

    def _search_samsung(self, phone):
        """Search Samsung website for phone images"""
        # Try specific product URLs for Galaxy S series
        model_clean = phone['model'].lower().replace('galaxy ', '').replace(' ', '-').replace('+', 'plus')
        urls_to_try = [
            f"https://www.samsung.com/us/smartphones/galaxy-{model_clean}/",
            f"https://www.samsung.com/us/smartphones/galaxy-s/{model_clean}/",
            "https://www.samsung.com/us/smartphones/galaxy-s24-ultra/",
            "https://www.samsung.com/us/smartphones/galaxy-s24/",
            "https://www.samsung.com/us/smartphones/galaxy-s23/"
        ]

        all_images = []
        print(f"  Trying URLs for {phone['model']}:")
        for url in urls_to_try:
            print(f"    Checking: {url}")
            try:
                response = self.session.get(url, timeout=10)
                print(f"      Status: {response.status_code}")
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')

                    # Look for product images with common classes/attributes
                    images = soup.find_all('img', {'src': True})
                    print(f"      Found {len(images)} total images")
                    found_product_images = 0
                    for img in images:
                        src = img.get('src')
                        if src and ('product' in src.lower() or 'hero' in src.lower() or 'phone' in src.lower() or 'galaxy' in src.lower()):
                            if src.startswith('http'):
                                all_images.append(src)
                                found_product_images += 1
                            elif src.startswith('/'):
                                all_images.append(urljoin(url, src))
                                found_product_images += 1
                    print(f"      Found {found_product_images} potential product images")
            except Exception as e:
                print(f"      Error: {e}")
                continue

        print(f"  Total unique images found: {len(set(all_images))}")
        return list(set(all_images))[:3]  # Remove duplicates and limit

    def _search_vivo(self, phone):
        """Search Vivo website for phone images"""
        # Vivo uses different URL patterns
        model_clean = phone['model'].lower().replace('vivo ', '').replace(' ', '-')
        urls_to_try = [
            f"https://www.vivo.com/us/products/{model_clean}",
            f"https://www.vivo.com/us/products/{model_clean}-series",
            "https://www.vivo.com/us/products",
            "https://www.vivo.com/us/"
        ]

        all_images = []
        print(f"  Trying Vivo URLs for {phone['model']}:")
        for url in urls_to_try:
            print(f"    Checking: {url}")
            try:
                response = self.session.get(url, timeout=10)
                print(f"      Status: {response.status_code}")
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')

                    # Look for product images with Vivo-specific selectors
                    images = soup.find_all('img', {'src': True})
                    print(f"      Found {len(images)} total images")
                    found_product_images = 0
                    for img in images:
                        src = img.get('src')
                        alt = img.get('alt', '').lower()
                        if src and ('product' in src.lower() or 'phone' in src.lower() or 'vivo' in src.lower() or
                                  any(keyword in alt for keyword in phone['model'].lower().split())):
                            if src.startswith('http'):
                                all_images.append(src)
                                found_product_images += 1
                            elif src.startswith('/'):
                                all_images.append(urljoin(url, src))
                                found_product_images += 1
                    print(f"      Found {found_product_images} potential product images")
            except Exception as e:
                print(f"      Error: {e}")
                continue

        print(f"  Total unique images found: {len(set(all_images))}")
        return list(set(all_images))[:3]

    def _search_realme(self, phone):
        """Search Realme website for phone images - try multiple regions"""
        # Realme uses different URL patterns and regional sites
        model_clean = phone['model'].lower().replace('realme ', '').replace(' ', '-').replace('+', 'plus')

        # Try multiple Realme regional websites
        regional_sites = [
            ("us", "https://www.realme.com/us/"),
            ("global", "https://www.realme.com/global/"),
            ("in", "https://www.realme.com/in/"),
            ("eu", "https://www.realme.com/eu/"),
            ("latin", "https://www.realme.com/latin/")
        ]

        all_images = []
        print(f"  Trying Realme URLs for {phone['model']} across regions:")

        for region, base_url in regional_sites:
            urls_to_try = [
                f"{base_url}realme-{model_clean}",
                f"{base_url}realme-{model_clean}-series",
                f"{base_url}phones",
                base_url
            ]

            for url in urls_to_try:
                print(f"    Checking {region}: {url}")
                try:
                    response = self.session.get(url, timeout=10)
                    print(f"      Status: {response.status_code}")
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')

                        # Look for product images with Realme-specific selectors
                        images = soup.find_all('img', {'src': True})
                        print(f"      Found {len(images)} total images")
                        found_product_images = 0
                        for img in images:
                            src = img.get('src')
                            alt = img.get('alt', '').lower()
                            if src and ('product' in src.lower() or 'phone' in src.lower() or 'realme' in src.lower() or
                                      any(keyword in alt for keyword in phone['model'].lower().split())):
                                if src.startswith('http'):
                                    all_images.append(src)
                                    found_product_images += 1
                                elif src.startswith('/'):
                                    all_images.append(urljoin(url, src))
                                    found_product_images += 1
                        print(f"      Found {found_product_images} potential product images")
                        if found_product_images > 0:
                            break  # Found images in this region, no need to try more URLs
                    else:
                        print(f"      Skipping {region} - site not accessible")
                        break  # Skip this region entirely
                except Exception as e:
                    print(f"      Error: {e}")
                    continue

            if all_images:  # If we found images in this region, stop trying other regions
                break

        print(f"  Total unique images found across all regions: {len(set(all_images))}")

        # If no images found from websites, try backup sources
        if not all_images:
            print(f"  No images found from Realme websites, trying backup sources...")
            all_images = self._search_realme_backup(phone)

        return list(set(all_images))[:3]

    def _search_realme_backup(self, phone):
        """Backup search using stock photo APIs for Realme phones"""
        try:
            # Try Unsplash API for Realme phone images
            unsplash_url = f"https://api.unsplash.com/search/photos?query=realme+{phone['model']}&per_page=3"
            headers = {'Authorization': 'Client-ID YOUR_UNSPLASH_API_KEY'}  # Would need API key

            # For now, try a simple fallback approach
            print(f"  Backup: Would search stock photos for '{phone['company']} {phone['model']}'")

            # Placeholder - in real implementation, would call APIs
            return []

        except Exception as e:
            print(f"  Backup search failed: {e}")
            return []

    def _search_generic_brand(self, phone):
        """Fallback generic search for other brands"""
        brand_urls = {
            'Vivo': 'https://www.vivo.com',
            'Realme': 'https://www.realme.com/us/'
        }

        if phone['company'] in brand_urls:
            try:
                response = self.session.get(brand_urls[phone['company']], timeout=10)
                soup = BeautifulSoup(response.content, 'html.parser')

                # Look for any product images
                images = soup.find_all('img', {'src': True})
                product_images = []

                for img in images:
                    src = img.get('src')
                    if src and len(src) > 10:  # Filter out tiny icons
                        if src.startswith('http'):
                            product_images.append(src)
                        elif src.startswith('/'):
                            product_images.append(urljoin(brand_urls[phone['company']], src))

                return product_images[:3]

            except Exception as e:
                print(f"Error searching {phone['company']} website: {e}")

        return []

    def download_image(self, url, save_path):
        """Download image from URL"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            # Check if it's actually an image
            content_type = response.headers.get('content-type', '').lower()
            if 'image' in content_type:
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                return True

        except Exception as e:
            print(f"Error downloading {url}: {e}")

        return False

    def collect_images_for_phone(self, phone, max_images=3):
        """Collect images for a specific phone"""
        dir_path = os.path.join(self.base_dir, phone['dir_name'])
        os.makedirs(dir_path, exist_ok=True)

        print(f"Collecting images for {phone['company']} {phone['model']}")

        # Search brand website
        image_urls = self.search_brand_websites(phone)

        downloaded = 0
        for i, url in enumerate(image_urls):
            if downloaded >= max_images:
                break

            ext = '.jpg'  # Default extension
            if '.png' in url.lower():
                ext = '.png'
            elif '.webp' in url.lower():
                ext = '.webp'

            filename = f"{phone['dir_name']}_{i+1}{ext}"
            save_path = os.path.join(dir_path, filename)

            if self.download_image(url, save_path):
                print(f"  ✓ Downloaded {filename}")
                downloaded += 1
            else:
                print(f"  ✗ Failed to download from {url}")

        return downloaded > 0

    def run_collection(self, limit=None, brands=None):
        """Run image collection for missing phones"""
        missing_phones = self.load_missing_phones()

        if brands:
            missing_phones = [p for p in missing_phones if p['company'] in brands]

        if limit:
            missing_phones = missing_phones[:limit]

        print(f"Starting image collection for {len(missing_phones)} phones")

        results = []
        for phone in missing_phones:
            success = self.collect_images_for_phone(phone)
            results.append({
                'phone': f"{phone['company']} {phone['model']}",
                'success': success,
                'images_collected': len(os.listdir(os.path.join(self.base_dir, phone['dir_name']))) if success else 0
            })

            # Be nice to websites
            time.sleep(1)

        return results

def main():
    collector = PhoneImageCollector()

    # Get missing phones count by brand
    missing_phones = collector.load_missing_phones()
    brand_counts = {}
    for phone in missing_phones:
        brand = phone['company']
        brand_counts[brand] = brand_counts.get(brand, 0) + 1

    print("=== COMPLETE PHONE IMAGE COLLECTION ===")
    print(f"Total phones missing images across all brands: {len(missing_phones)}")
    for brand, count in brand_counts.items():
        print(f"  {brand}: {count} phones")
    print("\nStarting collection for all brands (Samsung, Vivo, Realme)...")

    # Collect all phones for all brands
    results = collector.run_collection(brands=['Samsung', 'Vivo', 'Realme'])

    print("\n=== FINAL RESULTS ===")
    successful = sum(1 for r in results if r['success'])
    total_images = sum(r['images_collected'] for r in results)
    print(f"Successfully collected images for {successful}/{len(results)} phones across all brands")
    print(f"Total images downloaded: {total_images}")

    # Break down by brand
    brand_results = {}
    for result in results:
        brand = result['phone'].split()[0]
        if brand not in brand_results:
            brand_results[brand] = []
        brand_results[brand].append(result)

    print("\n=== RESULTS BY BRAND ===")
    for brand, brand_res in brand_results.items():
        brand_success = sum(1 for r in brand_res if r['success'])
        brand_images = sum(r['images_collected'] for r in brand_res)
        print(f"{brand}: {brand_success}/{len(brand_res)} phones ({brand_images} images)")

    # Save results
    with open('data/complete_image_collection_results.json', 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\nResults saved to: data/complete_image_collection_results.json")

    # Show next steps
    if successful < len(results):
        print(f"\n⚠️  {len(results) - successful} phones still need manual collection")
        print("Consider: alternative image sources, manual download, or API integration")
    else:
        print("\n🎉 ALL PHONES NOW HAVE IMAGES! 100% coverage achieved!")

if __name__ == "__main__":
    main()
