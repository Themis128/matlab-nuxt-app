"""
GSMArena scraper for detailed phone specifications and user ratings.

Scrapes:
- Display details (refresh rate, brightness, type)
- Camera specs (aperture, sensor size, video capabilities)
- User ratings and review count
- Build quality (glass type, water resistance)
- Charging speeds
- Detailed battery info
"""

import re
from typing import Dict, Any, Optional, List

try:
    from .common import (
        fetch_url, parse_html, clean_text, extract_number,
        normalize_phone_name, retry_on_failure, logger,
        save_json_cache, load_json_cache
    )
except ImportError:
    from common import (
        fetch_url, parse_html, clean_text, extract_number,
        normalize_phone_name, retry_on_failure, logger,
        save_json_cache, load_json_cache
    )


class GSMArenaScraper:
    """Scraper for GSMArena.com."""

    BASE_URL = "https://www.gsmarena.com"
    SEARCH_URL = f"{BASE_URL}/results.php3"

    def __init__(self, use_cache: bool = True):
        self.use_cache = use_cache
        self.cache = load_json_cache('gsmarena_cache.json') or {}

    @retry_on_failure(max_retries=3)
    def search_phone(self, model_name: str) -> Optional[str]:
        """
        Search for phone and return detail page URL.

        Args:
            model_name: Phone model name

        Returns:
            Detail page URL or None
        """
        # Check cache
        normalized = normalize_phone_name(model_name)
        if self.use_cache and normalized in self.cache:
            return self.cache[normalized].get('url')

        # Search
        params = {'sSearch': model_name}
        response = fetch_url(self.SEARCH_URL, headers={'User-Agent': 'Mozilla/5.0'})

        if not response:
            return None

        soup = parse_html(response.text)
        if not soup:
            return None

        # Find first result
        result = soup.select_one('.makers a')
        if result and result.get('href'):
            href = str(result['href'])
            # Ensure proper URL construction
            if not href.startswith('/'):
                href = '/' + href
            url = self.BASE_URL + href
            logger.info(f"Found: {model_name} -> {url}")
            return url

        logger.warning(f"No results for: {model_name}")
        return None

    @retry_on_failure(max_retries=3)
    def scrape_phone_details(self, url: str) -> Dict[str, Any]:
        """
        Scrape detailed specifications from phone page.

        Args:
            url: GSMArena detail page URL

        Returns:
            Dictionary of specifications
        """
        response = fetch_url(url)
        if not response:
            return {}

        soup = parse_html(response.text)
        if not soup:
            return {}

        specs = {
            'url': url,
            'display': self._extract_display_specs(soup),
            'camera': self._extract_camera_specs(soup),
            'battery': self._extract_battery_specs(soup),
            'build': self._extract_build_specs(soup),
            'performance': self._extract_performance_specs(soup),
            'user_rating': self._extract_user_rating(soup),
        }

        return specs

    def _extract_display_specs(self, soup) -> Dict[str, Any]:
        """Extract display specifications."""
        display = {}

        # Refresh rate
        refresh_elem = soup.find(text=re.compile(r'\d+Hz', re.I))
        if refresh_elem:
            refresh = extract_number(refresh_elem)
            display['refresh_rate'] = refresh

        # Type (AMOLED, IPS, etc.)
        type_elem = soup.find('td', {'data-spec': 'displaytype'})
        if type_elem:
            display['type'] = clean_text(type_elem.text)

        # Peak brightness
        brightness_elem = soup.find(text=re.compile(r'\d+\s*nits?', re.I))
        if brightness_elem:
            brightness = extract_number(brightness_elem)
            display['peak_brightness_nits'] = brightness

        # Resolution
        res_elem = soup.find('td', {'data-spec': 'displayresolution'})
        if res_elem:
            display['resolution'] = clean_text(res_elem.text)

        return display

    def _extract_camera_specs(self, soup) -> Dict[str, Any]:
        """Extract camera specifications."""
        camera = {}

        # Main camera
        main_cam = soup.find('td', {'data-spec': 'cam1modules'})
        if main_cam:
            text = main_cam.text

            # Megapixels
            mp_match = re.search(r'(\d+)\s*MP', text)
            if mp_match:
                camera['main_mp'] = int(mp_match.group(1))

            # Aperture
            aperture_match = re.search(r'f/(\d+\.?\d*)', text)
            if aperture_match:
                camera['main_aperture'] = float(aperture_match.group(1))

            # Sensor size
            sensor_match = re.search(r'1/(\d+\.?\d*)"', text)
            if sensor_match:
                camera['sensor_size'] = f"1/{sensor_match.group(1)}\""

            # OIS
            if 'OIS' in text or 'optical' in text.lower():
                camera['has_ois'] = True

        # Video
        video_elem = soup.find('td', {'data-spec': 'cam1video'})
        if video_elem:
            video_text = video_elem.text
            if '8K' in video_text:
                camera['max_video'] = '8K'
            elif '4K' in video_text:
                camera['max_video'] = '4K'

            # Frame rate
            fps_match = re.search(r'@(\d+)fps', video_text)
            if fps_match:
                camera['max_video_fps'] = int(fps_match.group(1))

        return camera

    def _extract_battery_specs(self, soup) -> Dict[str, Any]:
        """Extract battery specifications."""
        battery = {}

        # Charging speed
        charging_elem = soup.find('td', {'data-spec': 'batdescription1'})
        if charging_elem:
            text = charging_elem.text

            # Wired charging
            wired_match = re.search(r'(\d+)W', text)
            if wired_match:
                battery['charging_speed_w'] = int(wired_match.group(1))

            # Wireless
            if 'wireless' in text.lower():
                wireless_match = re.search(r'(\d+)W.*wireless', text, re.I)
                if wireless_match:
                    battery['wireless_charging_w'] = int(wireless_match.group(1))
                else:
                    battery['wireless_charging_w'] = 0  # Unknown wattage

            # Reverse charging
            if 'reverse' in text.lower():
                battery['has_reverse_charging'] = True

        # Endurance rating
        endurance_elem = soup.find(text=re.compile(r'Endurance rating', re.I))
        if endurance_elem:
            parent = endurance_elem.find_parent('td')
            if parent:
                rating = extract_number(parent.text)
                battery['endurance_rating_hours'] = rating

        return battery

    def _extract_build_specs(self, soup) -> Dict[str, Any]:
        """Extract build quality specifications."""
        build = {}

        # Glass type
        glass_elem = soup.find(text=re.compile(r'Gorilla Glass|Ceramic Shield|Victus', re.I))
        if glass_elem:
            build['glass_type'] = clean_text(str(glass_elem))

        # Water resistance
        ip_elem = soup.find(text=re.compile(r'IP\d+', re.I))
        if ip_elem:
            ip_match = re.search(r'IP(\d+)', str(ip_elem), re.I)
            if ip_match:
                build['ip_rating'] = f"IP{ip_match.group(1)}"

        # Build materials
        body_elem = soup.find('td', {'data-spec': 'build'})
        if body_elem:
            build['materials'] = clean_text(body_elem.text)

        return build

    def _extract_performance_specs(self, soup) -> Dict[str, Any]:
        """Extract performance-related specifications."""
        perf = {}

        # Chipset
        chipset_elem = soup.find('td', {'data-spec': 'chipset'})
        if chipset_elem:
            perf['chipset'] = clean_text(chipset_elem.text)

        # GPU
        gpu_elem = soup.find('td', {'data-spec': 'gpu'})
        if gpu_elem:
            perf['gpu'] = clean_text(gpu_elem.text)

        return perf

    def _extract_user_rating(self, soup) -> Dict[str, Any]:
        """Extract user ratings and reviews."""
        rating = {}

        # Rating score
        rating_elem = soup.select_one('.rating-score')
        if rating_elem:
            score = extract_number(rating_elem.text)
            rating['score'] = score

        # Review count
        count_elem = soup.select_one('.rating-votes')
        if count_elem:
            count = extract_number(count_elem.text)
            rating['review_count'] = int(count) if count else 0

        return rating

    def scrape_phone(self, model_name: str) -> Dict[str, Any]:
        """
        Main method to scrape all data for a phone.

        Args:
            model_name: Phone model name

        Returns:
            Complete specifications dictionary
        """
        normalized = normalize_phone_name(model_name)

        # Check cache
        if self.use_cache and normalized in self.cache:
            logger.info(f"Using cached data for: {model_name}")
            return self.cache[normalized]

        # Search for phone
        url = self.search_phone(model_name)
        if not url:
            return {'error': f'Phone not found: {model_name}'}

        # Scrape details
        specs = self.scrape_phone_details(url)
        specs['model_name'] = model_name

        # Update cache
        self.cache[normalized] = specs
        if self.use_cache:
            save_json_cache(self.cache, 'gsmarena_cache.json')

        return specs

    def scrape_multiple(self, model_names: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Scrape multiple phones.

        Args:
            model_names: List of phone model names

        Returns:
            Dictionary mapping model names to specifications
        """
        results = {}

        for i, model in enumerate(model_names, 1):
            logger.info(f"Scraping {i}/{len(model_names)}: {model}")
            results[model] = self.scrape_phone(model)

        return results


def main():
    """Test scraper with sample phones."""
    scraper = GSMArenaScraper()

    test_phones = [
        "Samsung Galaxy S24 Ultra",
        "iPhone 15 Pro Max",
        "Google Pixel 8 Pro",
        "OnePlus 12",
        "Xiaomi 14 Pro"
    ]

    results = scraper.scrape_multiple(test_phones)

    # Print summary
    print("\n" + "="*60)
    print("GSMArena Scraping Results")
    print("="*60)

    for model, data in results.items():
        print(f"\n{model}:")
        if 'error' in data:
            print(f"  Error: {data['error']}")
        else:
            print(f"  Display: {data.get('display', {})}")
            print(f"  Camera: {data.get('camera', {})}")
            print(f"  Battery: {data.get('battery', {})}")
            print(f"  User Rating: {data.get('user_rating', {})}")


if __name__ == "__main__":
    main()
