"""
Mobile Phone Image Scraper
Fetches mobile phone images from multiple sources and saves them locally
"""

# Standard library imports
import json
import re
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple
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


class MobileImageScraper:
    """Scraper for mobile phone images from various sources"""

    def __init__(self, output_dir: str = "public/mobile_images", delay: float = 1.0):
        """
        Initialize the scraper

        Args:
            output_dir: Directory to save images
            delay: Delay between requests (seconds)
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.scraped_urls = {}  # Store image URLs for each model

    def find_dataset_file(self) -> Optional[str]:
        """Find the dataset CSV file"""
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
            # Try different encodings
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
        """Extract model name from dataset row"""
        # Try different column names
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

        # Combine company and model
        if company and model:
            return f"{company} {model}"
        elif model:
            return model
        elif company:
            return company
        else:
            return "Unknown"

    def sanitize_filename(self, name: str) -> str:
        """Sanitize filename for filesystem"""
        # Remove invalid characters
        name = re.sub(r'[<>:"/\\|?*]', '_', name)
        # Remove extra spaces
        name = re.sub(r'\s+', '_', name)
        # Limit length
        if len(name) > 100:
            name = name[:100]
        return name

    def search_duckduckgo_images(self, query: str, num_images: int = 5) -> List[str]:
        """
        Search DuckDuckGo Images (more reliable than Google for scraping)
        """
        try:
            search_query = f"{query} mobile phone official product"
            search_url = f"https://duckduckgo.com/?q={quote(search_query)}&iax=images&ia=images"

            response = self.session.get(search_url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')
            image_urls = []

            # DuckDuckGo uses data-src or src attributes
            for img in soup.find_all('img'):
                src = img.get('data-src') or img.get('src')
                if src and src.startswith('http'):
                    # Filter out small images, icons, and thumbnails
                    if any(ext in src.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                        # Skip thumbnails and small images
                        if 'thumb' not in src.lower() and 'icon' not in src.lower():
                            image_urls.append(src)

            # Also look for image links
            for link in soup.find_all('a', href=True):
                href = link.get('href', '')
                if any(ext in href.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    if href.startswith('http'):
                        image_urls.append(href)

            # Remove duplicates and limit
            seen = set()
            unique_urls = []
            for url in image_urls:
                if url not in seen and len(unique_urls) < num_images:
                    seen.add(url)
                    unique_urls.append(url)

            time.sleep(self.delay)
            return unique_urls[:num_images]

        except Exception as e:
            print(f"  [!] DuckDuckGo search error: {e}")
            return []

    def search_google_images(self, query: str, num_images: int = 5) -> List[str]:
        """
        Search Google Images for mobile phone images
        Note: Google uses JavaScript, so this may not work reliably
        For production, use Google Custom Search API
        """
        try:
            search_query = f"{query} mobile phone official product image"
            search_url = f"https://www.google.com/search?q={quote(search_query)}&tbm=isch&safe=active"

            response = self.session.get(search_url, timeout=10)
            response.raise_for_status()

            # Try to extract from response text using regex
            image_urls = []

            # Look for image URLs in the HTML
            url_pattern = r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"\'<>]*)?'
            found_urls = re.findall(url_pattern, response.text)

            for url in found_urls:
                # Filter out thumbnails, icons, and small images
                if any(skip in url.lower() for skip in ['thumb', 'icon', 'logo', 'avatar', 'gstatic']):
                    continue
                # Must be a full URL
                if url.startswith('http') and len(url) > 50:  # Reasonable minimum size
                    image_urls.append(url)

            # Also try parsing with BeautifulSoup
            soup = BeautifulSoup(response.text, 'html.parser')
            for img in soup.find_all('img'):
                src = img.get('src') or img.get('data-src') or img.get('data-original')
                if src and src.startswith('http'):
                    if any(ext in src.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                        if 'thumb' not in src.lower() and 'icon' not in src.lower():
                            image_urls.append(src)

            # Remove duplicates and limit
            seen = set()
            unique_urls = []
            for url in image_urls:
                # Clean URL
                url = url.split('?')[0]  # Remove query parameters
                if url not in seen and len(unique_urls) < num_images:
                    seen.add(url)
                    unique_urls.append(url)

            time.sleep(self.delay)
            return unique_urls[:num_images]

        except Exception as e:
            print(f"  [!] Google Images search error: {e}")
            return []

    def search_unsplash(self, query: str, num_images: int = 3) -> List[str]:
        """Search Unsplash for mobile phone images (requires API key for production)"""
        # This is a placeholder - Unsplash requires API key
        # For now, return empty list
        return []

    def search_pixabay(self, query: str, num_images: int = 3) -> List[str]:
        """Search Pixabay for mobile phone images (requires API key for production)"""
        # This is a placeholder - Pixabay requires API key
        return []

    def fetch_image(self, url: str, save_path: Path) -> bool:
        """Download and save an image from URL"""
        try:
            response = self.session.get(url, timeout=10, stream=True)
            response.raise_for_status()

            # Check if it's actually an image
            content_type = response.headers.get('content-type', '')
            if not content_type.startswith('image/'):
                return False

            # Save image
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            # Verify file was created and has content
            if save_path.exists() and save_path.stat().st_size > 0:
                return True
            return False

        except Exception as e:
            print(f"    [!] Failed to download {url}: {e}")
            return False

    def load_existing_progress(self) -> Dict:
        """Load existing scraping progress from JSON file"""
        progress_file = self.output_dir / "scraping_progress.json"

        if not progress_file.exists():
            return {}

        try:
            with open(progress_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('models', {})
        except Exception as e:
            print(f"[!] Error loading existing progress: {e}")
            return {}

    def check_model_needs_images(self, model_name: str, existing_data: Dict, max_images: int = 3) -> Tuple[bool, int]:
        """
        Check if a model needs more images

        Returns:
            (needs_images: bool, current_count: int)
        """
        if model_name not in existing_data:
            return True, 0

        model_data = existing_data[model_name]
        current_count = model_data.get('success_count', 0)

        # Check if local files actually exist
        local_paths = model_data.get('local_paths', [])
        existing_files = 0
        for path_str in local_paths:
            # Convert path to handle both Windows and Unix paths
            path_str = path_str.replace('\\', '/')
            file_path = Path('public') / path_str
            if file_path.exists() and file_path.stat().st_size > 0:
                existing_files += 1

        # Need images if we have fewer than max_images OR if files are missing
        needs_images = existing_files < max_images
        return needs_images, existing_files

    def scrape_model_images(self, model_name: str, max_images: int = 3, existing_data: Optional[Dict] = None) -> Dict:
        """
        Scrape images for a specific mobile phone model

        Args:
            model_name: Name of the phone model
            max_images: Maximum number of images to scrape
            existing_data: Existing progress data for this model (optional)

        Returns:
            Dict with image URLs and local paths
        """
        print(f"\n[→] Scraping images for: {model_name}")

        # Start with existing data if available
        if existing_data and model_name in existing_data:
            results = {
                'model': model_name,
                'image_urls': list(existing_data[model_name].get('image_urls', [])),
                'local_paths': list(existing_data[model_name].get('local_paths', [])),
                'success_count': 0  # Will recalculate
            }
        else:
            results = {
                'model': model_name,
                'image_urls': [],
                'local_paths': [],
                'success_count': 0
            }

        # Check existing files and determine how many we need
        sanitized_name = self.sanitize_filename(model_name)
        model_dir = self.output_dir / sanitized_name
        model_dir.mkdir(exist_ok=True)

        # Verify existing files and count valid ones
        valid_files = []
        for i, path_str in enumerate(results['local_paths'], 1):
            path_str_clean = path_str.replace('\\', '/')
            file_path = Path('public') / path_str_clean
            if file_path.exists() and file_path.stat().st_size > 0:
                valid_files.append((path_str, results['image_urls'][i-1] if i-1 < len(results['image_urls']) else None))

        # Update results with only valid files
        results['local_paths'] = [f[0] for f in valid_files]
        results['image_urls'] = [f[1] for f in valid_files if f[1]]
        current_count = len(valid_files)

        # Calculate how many more images we need
        needed = max_images - current_count

        if needed <= 0:
            print(f"  [OK] Already have {current_count} images (target: {max_images})")
            results['success_count'] = current_count
            return results

        print(f"  [→] Need {needed} more images (have {current_count}/{max_images})")

        # Try multiple search methods
        image_urls = []

        # Try DuckDuckGo first (more reliable)
        print(f"  [→] Searching DuckDuckGo...")
        image_urls = self.search_duckduckgo_images(model_name, num_images=needed + 2)  # Get a few extra

        # Fallback to Google if DuckDuckGo didn't work
        if not image_urls:
            print(f"  [→] Trying Google Images...")
            image_urls = self.search_google_images(model_name, num_images=needed + 2)

        if not image_urls:
            print(f"  [!] No images found for {model_name}")
            results['success_count'] = current_count
            return results

        print(f"  [OK] Found {len(image_urls)} image URLs")

        # Download missing images
        downloaded = 0
        image_index = current_count + 1  # Start numbering from where we left off

        for url in image_urls:
            if downloaded >= needed:
                break

            # Generate filename
            file_ext = url.split('.')[-1].split('?')[0] if '.' in url else 'jpg'
            if file_ext not in ['jpg', 'jpeg', 'png', 'webp']:
                file_ext = 'jpg'

            filename = f"{sanitized_name}_{image_index}.{file_ext}"
            save_path = model_dir / filename

            # Skip if already exists
            if save_path.exists():
                print(f"    [SKIP] {filename} already exists")
                if url not in results['image_urls']:
                    results['image_urls'].append(url)
                if str(save_path.relative_to('public')) not in results['local_paths']:
                    results['local_paths'].append(str(save_path.relative_to('public')))
                downloaded += 1
                image_index += 1
                continue

            print(f"    [↓] Downloading image {downloaded + 1}/{needed}...")

            if self.fetch_image(url, save_path):
                print(f"    [OK] Saved: {filename}")
                results['image_urls'].append(url)
                results['local_paths'].append(str(save_path.relative_to('public')))
                downloaded += 1
                image_index += 1
            else:
                print(f"    [X] Failed to download")

            time.sleep(self.delay)  # Be respectful

        results['success_count'] = current_count + downloaded
        print(f"  [OK] Total images: {results['success_count']}/{max_images}")
        return results

    def update_dataset_with_images(self, df: pd.DataFrame, image_data: Dict) -> pd.DataFrame:
        """Add image URLs/paths to the dataset"""
        # Create a mapping from model name to image paths
        model_to_images = {}
        for data in image_data.values():
            model = data['model']
            if data['local_paths']:
                model_to_images[model] = data['local_paths'][0]  # Use first image

        # Add image column to dataset
        if 'Image Path' not in df.columns:
            df['Image Path'] = None

        # Try to match models
        for idx, row in df.iterrows():
            model_name = self.get_model_name(row)
            if model_name in model_to_images:
                df.at[idx, 'Image Path'] = model_to_images[model_name]

        return df

    def run(self, limit: Optional[int] = None, start_from: int = 0, missing_only: bool = False, max_images: int = 3):
        """
        Main scraping function

        Args:
            limit: Maximum number of models to scrape (None for all)
            start_from: Index to start from (for resuming)
            missing_only: If True, only scrape models with missing images
            max_images: Maximum number of images per model
        """
        print("=" * 80)
        print("MOBILE PHONE IMAGE SCRAPER")
        print("=" * 80)

        # Load existing progress if available
        existing_progress = {}
        if missing_only:
            print("\n[→] Loading existing progress...")
            existing_progress = self.load_existing_progress()
            if existing_progress:
                print(f"[OK] Found progress for {len(existing_progress)} models")
            else:
                print("[!] No existing progress found, will scrape all models")

        # Load dataset
        df = self.load_dataset()
        if df is None:
            return

        # Get unique models
        print("\n[→] Extracting model names from dataset...")
        models = []
        for idx, row in df.iterrows():
            model_name = self.get_model_name(row)
            if model_name and model_name != "Unknown":
                models.append((idx, model_name))

        # Remove duplicates (keep first occurrence)
        seen_models = set()
        unique_models = []
        for idx, model in models:
            if model not in seen_models:
                seen_models.add(model)
                unique_models.append((idx, model))

        print(f"[OK] Found {len(unique_models)} unique models")

        # Filter to only missing models if requested
        if missing_only:
            models_to_scrape = []
            for idx, model_name in unique_models:
                needs_images, current_count = self.check_model_needs_images(model_name, existing_progress, max_images)
                if needs_images:
                    models_to_scrape.append((idx, model_name))

            print(f"[→] Found {len(models_to_scrape)} models that need images (out of {len(unique_models)} total)")
            unique_models = models_to_scrape

            if not unique_models:
                print("[OK] All models already have sufficient images!")
                return existing_progress

        # Apply limit
        if limit:
            unique_models = unique_models[:limit]

        # Start from specified index
        unique_models = unique_models[start_from:]

        print(f"[→] Scraping images for {len(unique_models)} models...")
        print(f"[!] This may take a while. Be patient and respectful of rate limits.\n")

        # Start with existing progress
        image_data = existing_progress.copy() if existing_progress else {}
        total_scraped = sum(data.get('success_count', 0) for data in image_data.values())

        # Scrape images
        new_images_count = 0
        for i, (idx, model_name) in enumerate(unique_models, 1):
            print(f"\n[{i}/{len(unique_models)}] Processing: {model_name}")

            results = self.scrape_model_images(model_name, max_images=max_images, existing_data=existing_progress)
            image_data[model_name] = results

            # Count only newly downloaded images
            old_count = existing_progress.get(model_name, {}).get('success_count', 0) if existing_progress else 0
            new_images_count += max(0, results['success_count'] - old_count)
            total_scraped = sum(data.get('success_count', 0) for data in image_data.values())

            # Save progress periodically
            if i % 10 == 0:
                self.save_progress(image_data, total_scraped)

        # Save final progress
        self.save_progress(image_data, total_scraped)

        # Update dataset with image paths
        print("\n[→] Updating dataset with image paths...")
        df_updated = self.update_dataset_with_images(df, image_data)

        # Save updated dataset
        output_csv = self.output_dir.parent / "dataset_with_images.csv"
        df_updated.to_csv(output_csv, index=False, encoding='utf-8')
        print(f"[OK] Updated dataset saved to: {output_csv}")

        # Summary
        print("\n" + "=" * 80)
        print("SCRAPING SUMMARY")
        print("=" * 80)
        print(f"Total models processed: {len(unique_models)}")
        print(f"New images downloaded: {new_images_count}")
        print(f"Total images (all models): {total_scraped}")
        print(f"Images saved to: {self.output_dir}")
        print(f"Updated dataset: {output_csv}")

        return image_data

    def save_progress(self, image_data: Dict, total_scraped: int):
        """Save scraping progress to JSON file (merges with existing if present)"""
        progress_file = self.output_dir / "scraping_progress.json"

        # Load existing progress to merge
        existing_data = {}
        if progress_file.exists():
            try:
                with open(progress_file, 'r', encoding='utf-8') as f:
                    existing = json.load(f)
                    existing_data = existing.get('models', {})
            except (FileNotFoundError, json.JSONDecodeError, IOError):
                pass

        # Merge existing with new data (new data takes precedence)
        merged_data = existing_data.copy()
        for model, data in image_data.items():
            merged_data[model] = {
                'model': data['model'],
                'image_urls': data.get('image_urls', []),
                'local_paths': [str(p) for p in data.get('local_paths', [])],
                'success_count': data.get('success_count', 0)
            }

        # Convert Path objects to strings for JSON
        json_data = {}
        for model, data in merged_data.items():
            json_data[model] = {
                'model': data['model'],
                'image_urls': data.get('image_urls', []),
                'local_paths': data.get('local_paths', []),
                'success_count': data.get('success_count', 0)
            }

        with open(progress_file, 'w', encoding='utf-8') as f:
            json.dump({
                'total_scraped': total_scraped,
                'models': json_data
            }, f, indent=2, ensure_ascii=False)

        print(f"\n[SAVED] Progress saved to: {progress_file}")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='Scrape mobile phone images')
    parser.add_argument('--limit', type=int, help='Limit number of models to scrape')
    parser.add_argument('--start-from', type=int, default=0, help='Start from index (for resuming)')
    parser.add_argument('--output-dir', type=str, default='public/mobile_images', help='Output directory')
    parser.add_argument('--delay', type=float, default=1.0, help='Delay between requests (seconds)')
    parser.add_argument('--missing-only', action='store_true', help='Only scrape models with missing images')
    parser.add_argument('--max-images', type=int, default=3, help='Maximum number of images per model (default: 3)')

    args = parser.parse_args()

    scraper = MobileImageScraper(
        output_dir=args.output_dir,
        delay=args.delay
    )

    scraper.run(limit=args.limit, start_from=args.start_from, missing_only=args.missing_only, max_images=args.max_images)


if __name__ == "__main__":
    main()
