#!/usr/bin/env python3
"""
GSM Arena Realme Phone Image Scraper
Scrapes high-quality phone images from GSM Arena database
"""

import requests
import os
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json

class GSMArenaScraper:
    def __init__(self):
        self.base_url = "https://www.gsmarena.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def search_realme_phones(self):
        """Search GSM Arena for Realme phones"""
        phones = []

        # Search for Realme brand
        search_url = f"{self.base_url}/results.php3?sQuickSearch=yes&sName=realme"
        print(f"Searching GSM Arena: {search_url}")

        try:
            response = self.session.get(search_url)
            soup = BeautifulSoup(response.content, 'html.parser')

            # Find phone links
            phone_links = soup.find_all('a', href=True)
            for link in phone_links:
                href = link.get('href')
                if href and 'realme' in href.lower() and href.endswith('.php'):
                    phone_name = link.get_text().strip()
                    phone_url = urljoin(self.base_url, href)
                    phones.append({
                        'name': phone_name,
                        'url': phone_url,
                        'model': href.replace('.php', '').replace('-', ' ').title()
                    })

            print(f"Found {len(phones)} Realme phones on GSM Arena")
            return phones[:20]  # Limit to first 20 for testing

        except Exception as e:
            print(f"Error searching GSM Arena: {e}")
            return []

    def get_phone_images(self, phone_url, phone_name):
        """Extract image gallery from phone page"""
        try:
            response = self.session.get(phone_url)
            soup = BeautifulSoup(response.content, 'html.parser')

            images = []

            # GSM Arena specific image selectors
            # Look for main product image
            main_img = soup.find('img', id='bigpic')
            if main_img:
                src = main_img.get('src')
                if src:
                    if src.startswith('//'):
                        src = 'https:' + src
                    elif src.startswith('/'):
                        src = urljoin(self.base_url, src)
                    images.append(src)
                    print(f"  Found main image: {src}")

            # Look for thumbnail images in the spec table
            thumbs = soup.find_all('img', class_='img-thumbnail')
            for thumb in thumbs:
                src = thumb.get('src')
                if src and ('gsmarena' in src or 'cdn' in src):
                    if src.startswith('//'):
                        src = 'https:' + src
                    elif src.startswith('/'):
                        src = urljoin(self.base_url, src)

                    # Convert thumbnail to full size by removing size parameters
                    if 'width' in src or 'height' in src:
                        src = src.split('?')[0]  # Remove query parameters

                    images.append(src)
                    print(f"  Found thumbnail: {src}")

            # Look for gallery links and extract actual image URLs
            gallery_links = soup.find_all('a', href=True)
            for link in gallery_links:
                href = link.get('href')
                if href and ('pic.php?id=' in href or 'img/g/' in href):
                    # This is likely a gallery link, try to get the actual image
                    try:
                        gallery_response = self.session.get(urljoin(self.base_url, href))
                        gallery_soup = BeautifulSoup(gallery_response.content, 'html.parser')

                        # Look for the main image in gallery
                        gallery_img = gallery_soup.find('img', id='bigpic')
                        if gallery_img:
                            src = gallery_img.get('src')
                            if src and src not in images:
                                if src.startswith('//'):
                                    src = 'https:' + src
                                elif src.startswith('/'):
                                    src = urljoin(self.base_url, src)
                                images.append(src)
                                print(f"  Found gallery image: {src}")
                                break  # Just get one gallery image for now
                    except:
                        continue

            # Fallback: look for any image with phone-related classes
            all_imgs = soup.find_all('img')
            for img in all_imgs:
                src = img.get('src')
                alt = img.get('alt', '').lower()
                if src and ('phone' in alt or 'realme' in alt or len(src) > 50):
                    if src.startswith('//'):
                        src = 'https:' + src
                    elif src.startswith('/'):
                        src = urljoin(self.base_url, src)

                    if src not in images:
                        images.append(src)
                        print(f"  Found fallback image: {src}")

            print(f"Found {len(images)} images for {phone_name}")
            return images[:5]  # Return up to 5 images

        except Exception as e:
            print(f"Error getting images for {phone_name}: {e}")
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

    def create_phone_directory(self, phone_name):
        """Create directory for phone images"""
        # Clean phone name for directory
        clean_name = phone_name.replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '')
        dir_path = f"public/mobile_images/Realme_{clean_name}"

        os.makedirs(dir_path, exist_ok=True)
        return dir_path

    def collect_realme_images(self, limit=None):
        """Main collection function"""
        print("=== GSM ARENA REALME IMAGE COLLECTION ===")

        # Get list of Realme phones
        phones = self.search_realme_phones()
        if not phones:
            print("No Realme phones found on GSM Arena")
            return []

        if limit:
            phones = phones[:limit]

        results = []

        for phone in phones:
            print(f"\\n📱 Processing: {phone['name']}")

            # Create directory
            dir_path = self.create_phone_directory(phone['name'])

            # Get images
            images = self.get_phone_images(phone['url'], phone['name'])

            # Download images
            downloaded = 0
            for i, img_url in enumerate(images):
                ext = '.jpg'
                if '.png' in img_url.lower():
                    ext = '.png'
                elif '.gif' in img_url.lower():
                    ext = '.jpg'  # Convert gif to jpg

                filename = f"Realme_{phone['name'].replace(' ', '_')}_{i+1}{ext}"
                save_path = os.path.join(dir_path, filename)

                if self.download_image(img_url, save_path):
                    print(f"  ✓ Downloaded {filename}")
                    downloaded += 1
                else:
                    print(f"  ✗ Failed to download image {i+1}")

            results.append({
                'phone': phone['name'],
                'images_found': len(images),
                'images_downloaded': downloaded,
                'directory': dir_path
            })

            # Be nice to GSM Arena
            time.sleep(2)

        return results

def main():
    scraper = GSMArenaScraper()

    print("Starting GSM Arena Realme image collection...")
    results = scraper.collect_realme_images(limit=10)  # Test with first 10 phones

    print("\\n=== RESULTS ===")
    total_downloaded = sum(r['images_downloaded'] for r in results)
    print(f"Processed {len(results)} phones")
    print(f"Total images downloaded: {total_downloaded}")

    # Save results
    with open('data/gsmarena_collection_results.json', 'w') as f:
        json.dump(results, f, indent=2)

    print("Results saved to data/gsmarena_collection_results.json")

if __name__ == "__main__":
    main()
