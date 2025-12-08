"""
Common utilities for web scraping.
"""

import logging
import random
import time
from functools import wraps
from typing import Any, Dict, Optional

import requests
from bs4 import BeautifulSoup

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class RateLimiter:
    """Rate limiter for API/scraping requests."""

    def __init__(self, min_delay: float = 1.0, max_delay: float = 3.0):
        self.min_delay = min_delay
        self.max_delay = max_delay
        self.last_request_time = 0

    def wait(self):
        """Wait before next request."""
        elapsed = time.time() - self.last_request_time
        delay = random.uniform(self.min_delay, self.max_delay)

        if elapsed < delay:
            time.sleep(delay - elapsed)

        self.last_request_time = time.time()


def rate_limited(min_delay: float = 1.0, max_delay: float = 3.0):
    """Decorator to rate limit function calls."""
    limiter = RateLimiter(min_delay, max_delay)

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            limiter.wait()
            return func(*args, **kwargs)
        return wrapper
    return decorator


def get_user_agent() -> str:
    """Get random user agent string."""
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ]
    return random.choice(user_agents)


@rate_limited(min_delay=1.5, max_delay=3.0)
def fetch_url(url: str, headers: Optional[Dict[str, str]] = None, timeout: int = 30) -> Optional[requests.Response]:
    """
    Fetch URL with rate limiting and error handling.

    Args:
        url: URL to fetch
        headers: Optional custom headers
        timeout: Request timeout in seconds

    Returns:
        Response object or None on failure
    """
    if headers is None:
        headers = {'User-Agent': get_user_agent()}

    try:
        logger.info(f"Fetching: {url}")
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching {url}: {e}")
        return None


def parse_html(html: str) -> Optional[BeautifulSoup]:
    """
    Parse HTML content.

    Args:
        html: HTML string

    Returns:
        BeautifulSoup object or None
    """
    try:
        return BeautifulSoup(html, 'html.parser')
    except Exception as e:
        logger.error(f"Error parsing HTML: {e}")
        return None


def clean_text(text: str) -> str:
    """Clean and normalize text."""
    if not text:
        return ""
    return ' '.join(text.strip().split())


def extract_number(text: str) -> Optional[float]:
    """
    Extract first number from text.

    Args:
        text: Text containing number

    Returns:
        Extracted number or None
    """
    import re
    if not text:
        return None

    # Remove commas and spaces
    text = text.replace(',', '').replace(' ', '')

    # Find first number (int or float)
    match = re.search(r'-?\d+\.?\d*', text)
    if match:
        try:
            return float(match.group())
        except ValueError:
            return None
    return None


def normalize_phone_name(name: str) -> str:
    """
    Normalize phone model name for matching.

    Args:
        name: Phone model name

    Returns:
        Normalized name
    """
    # Convert to lowercase
    name = name.lower()

    # Remove common suffixes
    suffixes = ['5g', '4g', 'lte', 'dual sim', 'global', 'cn', 'us', 'eu']
    for suffix in suffixes:
        name = name.replace(suffix, '')

    # Remove extra spaces
    name = ' '.join(name.split())

    return name.strip()


def retry_on_failure(max_retries: int = 3, delay: float = 2.0):
    """Decorator to retry function on failure."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt < max_retries - 1:
                        logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay}s...")
                        time.sleep(delay)
                    else:
                        logger.error(f"All {max_retries} attempts failed for {func.__name__}")
                        raise
        return wrapper
    return decorator


def save_json_cache(data: Dict[str, Any], filename: str):
    """Save data to JSON cache file."""
    import json
    import os
    from pathlib import Path

    # SECURITY: Validate filename to prevent path traversal and arbitrary file write
    # Only allow alphanumeric, dash, underscore, and dot characters in filename
    if not all(c.isalnum() or c in ('-', '_', '.') for c in filename):
        raise ValueError(f"Invalid filename: {filename} - contains unsafe characters")

    # Prevent path traversal attacks
    if '..' in filename or '/' in filename or '\\' in filename:
        raise ValueError(f"Invalid filename: {filename} - path traversal detected")

    cache_dir = Path('data') / 'scraper_cache'
    cache_dir.mkdir(parents=True, exist_ok=True)

    # Resolve to absolute path and ensure it's within cache_dir
    filepath = (cache_dir / filename).resolve()
    cache_dir_resolved = cache_dir.resolve()

    # SECURITY: Ensure the resolved path is within the cache directory
    if not str(filepath).startswith(str(cache_dir_resolved)):
        raise ValueError(f"Invalid filepath: {filepath} - outside cache directory")

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    logger.info(f"Saved cache to {filepath}")


def load_json_cache(filename: str) -> Optional[Dict[str, Any]]:
    """Load data from JSON cache file."""
    import json
    import os
    from pathlib import Path

    # SECURITY: Validate filename to prevent path traversal
    # Only allow alphanumeric, dash, underscore, and dot characters
    if not filename or not all(c.isalnum() or c in '-_.' for c in filename):
        raise ValueError(f"Invalid filename: {filename}")

    # Use pathlib for safe path construction
    cache_dir = Path('data') / 'scraper_cache'
    filepath = cache_dir / filename

    # SECURITY: Ensure resolved path is within cache directory (prevent path traversal)
    try:
        filepath.resolve().relative_to(cache_dir.resolve())
    except ValueError:
        raise ValueError(f"Path traversal detected: {filename}")

    if not filepath.exists():
        return None

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.info(f"Loaded cache from {filepath}")
        return data
    except Exception as e:
        logger.error(f"Error loading cache {filepath}: {e}")
        return None
