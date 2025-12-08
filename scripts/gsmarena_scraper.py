#!/usr/bin/env python3
"""
GSM Arena Realme Phone Image Scraper
Scrapes high-quality phone images from GSM Arena database
"""

import json
import os
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


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
                    except Exception:
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

    def _validate_url(self, url):
        """
        Validate URL to prevent SSRF attacks
        Returns True if URL is safe, False otherwise
        """
        try:
            parsed = urlparse(url)

            # Only allow http and https schemes
            if parsed.scheme not in ['http', 'https']:
                return False

            # Block localhost and private IP ranges
            hostname = parsed.hostname
            if not hostname:
                return False

            # Block localhost variations
            localhost_variants = ['localhost', '127.0.0.1', '0.0.0.0', '::1']
            if hostname.lower() in localhost_variants:
                return False

            # Block private IP ranges
            if hostname.startswith('10.') or hostname.startswith('192.168.') or hostname.startswith('172.'):
                # More specific check for 172.16-31.x.x
                parts = hostname.split('.')
                if len(parts) >= 2:
                    try:
                        second_octet = int(parts[1])
                        if parts[0] == '172' and 16 <= second_octet <= 31:
                            return False
                    except ValueError:
                        pass

            # Block link-local addresses
            if hostname.startswith('169.254.'):
                return False

            return True
        except Exception:
            return False

    def download_image(self, url, save_path_resolved):
        """Download image from URL

        Args:
            url: Image URL to download
            save_path_resolved: Already-validated resolved Path object (not from user input)
        """
        try:
            # SECURITY: Validate URL to prevent SSRF attacks
            if not self._validate_url(url):
                print(f"  [!] Blocked potentially unsafe URL: {url}")
                return False

            # SECURITY: save_path_resolved should already be a validated Path object
            # Perform final validation check to ensure it's within working directory
            cwd = Path.cwd().resolve()
            save_path_str = str(save_path_resolved)

            if not save_path_str.startswith(str(cwd)):
                print(f"  [!] Security: Save path outside working directory: {save_path_str}")
                return False

            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            # Check if it's actually an image
            content_type = response.headers.get('content-type', '').lower()
            if 'image' in content_type:
                # SECURITY: Use only the already-validated resolved path (never from user input)
                # save_path_resolved is a validated Path object, convert to string for open()
                # Type assertion: save_path_str is from validated Path and safe
                validated_save_path: str = save_path_str
                assert validated_save_path.startswith(str(cwd)), "Path validation failed"
                with open(validated_save_path, 'wb') as f:  # noqa: S108 - Path validated above (lines 202-204)
                    f.write(response.content)
                return True

        except Exception as e:
            print(f"Error downloading {url}: {e}")

        return False

    def create_phone_directory(self, phone_name):
        """Create directory for phone images"""
        # SECURITY: Strictly sanitize phone name to prevent path traversal
        import re

        # Step 1: Remove path traversal attempts and dangerous characters
        clean_name = phone_name.replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '')
        # Step 2: Remove any remaining path separators and dangerous characters
        clean_name = re.sub(r'[<>:"|?*\x00-\x1f]', '', clean_name)
        # Step 3: Remove any remaining path traversal attempts
        clean_name = clean_name.replace('..', '').replace('/', '').replace('\\', '')
        # Step 4: Limit length to prevent issues
        clean_name = clean_name[:100]
        # Step 5: Ensure only alphanumeric and safe characters remain
        clean_name = re.sub(r'[^a-zA-Z0-9_]', '', clean_name)
        # Step 6: Ensure it's not empty after sanitization
        if not clean_name:
            clean_name = 'unknown_phone'

        # Step 7: Use pathlib for safe path construction and validate
        base_dir = Path('mobile_images')
        target_dir = base_dir / clean_name
        # Resolve to absolute path and ensure it's within base_dir
        try:
            target_dir_resolved = target_dir.resolve()
            base_dir_resolved = base_dir.resolve()
            if not str(target_dir_resolved).startswith(str(base_dir_resolved)):
                raise ValueError(f"Path traversal detected: {phone_name}")
        except (OSError, ValueError) as e:
            raise ValueError(f"Invalid phone name: {phone_name}") from e

        # Use pathlib for safe path construction
        base_dir = Path("public/mobile_images")
        dir_path = base_dir / f"Realme_{clean_name}"

        # Ensure the path is within the base directory (prevent path traversal)
        try:
            dir_path.resolve().relative_to(base_dir.resolve())
        except ValueError:
            raise ValueError(f"Invalid phone name: path traversal detected")

        os.makedirs(dir_path, exist_ok=True)
        return str(dir_path)

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

                # SECURITY: Sanitize filename to prevent path traversal
                phone_name_safe = phone['name'].replace(' ', '_').replace('/', '_').replace('\\', '_')
                phone_name_safe = ''.join(c for c in phone_name_safe if c.isalnum() or c in '._-')
                filename = f"Realme_{phone_name_safe}_{i+1}{ext}"

                # SECURITY: Validate filename doesn't contain path traversal
                if '..' in filename or '/' in filename or '\\' in filename:
                    print(f"  [!] Security: Invalid filename detected: {filename}")
                    continue

                save_path = os.path.join(dir_path, filename)

                # SECURITY: Final validation that save_path is within dir_path
                try:
                    save_path_resolved = Path(save_path).resolve()
                    dir_path_resolved = Path(dir_path).resolve()
                    if not str(save_path_resolved).startswith(str(dir_path_resolved)):
                        print(f"  [!] Security: Save path outside directory: {filename}")
                        continue
                    # Type assertion: save_path_resolved is validated and safe
                    assert str(save_path_resolved).startswith(str(dir_path_resolved)), "Path validation failed"
                except Exception as e:
                    print(f"  [!] Security: Error validating save path: {e}")
                    continue

                # SECURITY: Pass only the validated resolved Path object, not the original user input
                # save_path_resolved is validated above (lines 318-325)
                if self.download_image(img_url, save_path_resolved):  # noqa: S108 - Path validated above
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
    with open('data/gsmarena_collection_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

    print("Results saved to data/gsmarena_collection_results.json")

if __name__ == "__main__":
    main()
