#!/usr/bin/env python3
"""
Quick GSM Arena Test
Test GSM Arena image extraction for one Realme phone
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def test_gsmarena():
    """Test GSM Arena image extraction for one phone"""
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })

    base_url = "https://www.gsmarena.com"

    # Test with one specific Realme phone
    test_phone = "realme_gt_neo_5-12028.php"  # Realme GT Neo 5
    phone_url = f"{base_url}/{test_phone}"

    print(f"Testing GSM Arena: {phone_url}")

    try:
        response = session.get(phone_url, timeout=10)
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')

            # Check for main image
            main_img = soup.find('img', id='bigpic')
            if main_img:
                src = main_img.get('src')
                if src:
                    if src.startswith('//'):
                        src = 'https:' + src
                    elif src.startswith('/'):
                        src = urljoin(base_url, src)
                    print(f"✅ Found main image: {src}")

            # Check for any images
            all_imgs = soup.find_all('img')
            print(f"Total images on page: {len(all_imgs)}")

            # Look for gallery links
            gallery_links = soup.find_all('a', href=True)
            galleries = [link for link in gallery_links if 'pic.php?id=' in link.get('href', '')]
            print(f"Gallery links found: {len(galleries)}")

            if galleries:
                # Try first gallery
                gallery_url = urljoin(base_url, galleries[0].get('href'))
                print(f"Testing gallery: {gallery_url}")

                try:
                    gallery_response = session.get(gallery_url, timeout=5)
                    if gallery_response.status_code == 200:
                        gallery_soup = BeautifulSoup(gallery_response.content, 'html.parser')
                        gallery_img = gallery_soup.find('img', id='bigpic')
                        if gallery_img:
                            src = gallery_img.get('src')
                            if src:
                                if src.startswith('//'):
                                    src = 'https:' + src
                                elif src.startswith('/'):
                                    src = urljoin(base_url, src)
                                print(f"✅ Found gallery image: {src}")
                except Exception as e:
                    print(f"Gallery test failed: {e}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_gsmarena()
