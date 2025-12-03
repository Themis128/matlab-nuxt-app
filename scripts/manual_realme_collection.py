Development environment loaded!
💡 Type 'Check-DevHealth' to monitor system performance
PS D:\Nuxt Projects\MatLab> & "d:/Nuxt Projects/MatLab/venv/Scripts/Activate.ps1"
(venv) PS D:\Nuxt Projects\MatLab> python scripts/manual_realme_collection.py
  File "D:\Nuxt Projects\MatLab\scripts\manual_realme_collection.py", line 237
    '''
    ^
SyntaxError: unterminated triple-quoted string literal (detected at line 245)
(venv) PS D:\Nuxt Projects\MatLab>
#!/usr/bin/env python3
"""
Manual Realme Image Collection Script
Provides practical methods to collect Realme phone images
"""

import os
import json
import requests
from pathlib import Path

def create_realme_collection_guide():
    """Create a comprehensive guide for manual Realme image collection"""

    guide = """
# 🔍 Realme Phone Image Collection Guide
# Since Realme websites return 404, here are practical collection methods:

## 📋 Missing Realme Phones (69 total):
"""

    # Load missing phones
    missing_phones = []
    try:
        with open('data/Mobiles Dataset (2025).csv', 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()

        for line in lines[1:]:
            parts = line.strip().split(',')
            if len(parts) >= 2:
                company = parts[0].strip('"')
                model = parts[1].strip('"')
                if company == 'Realme':
                    missing_phones.append(model)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    # Add phones to guide
    for i, phone in enumerate(missing_phones, 1):
        guide += f"# {i:2d}. {phone}\n"

    guide += """

## 🛠️ Collection Methods (Choose Best for Your Needs):

### Method 1: Official Brand Resources (Recommended)
# 1. Visit Realme official social media:
#    - Instagram: @realme
#    - Facebook: @Realme
#    - Twitter: @Realme
# 2. Search for product photos in their posts
# 3. Download high-quality official images

### Method 2: Stock Photo Websites
# 1. Visit stock photo sites:
#    - Unsplash.com (search "realme phone")
#    - Pexels.com (search "realme smartphone")
#    - Pixabay.com (search "realme mobile")
# 2. Filter by license: Free for commercial use
# 3. Download high-resolution images

### Method 3: E-commerce Sites
# 1. Search on reliable sites:
#    - Amazon.com (product images)
#    - BestBuy.com (product photos)
#    - GSM Arena (device galleries)
# 2. Download official product images

### Method 4: Browser Extensions
# 1. Install "Image Downloader" extensions:
#    - Chrome: Image Downloader
#    - Firefox: Image Download Helper
# 2. Visit Realme product pages on retailer sites
# 3. Bulk download product images

## 📂 File Organization:
# Save images as: Realme_{Model}_{number}.jpg/png
# Example: Realme_GT_7_Pro_128GB_1.jpg
# Directory: public/mobile_images/Realme_{Model}/

## 🎯 Quality Guidelines:
# - Minimum resolution: 800x600px
# - Preferred: 1200x800px or higher
# - Format: JPG or PNG
# - Content: Product photos, not screenshots

## ⚡ Quick Start Commands:

# Create directories for all Realme phones:
"""

    # Add directory creation commands
    for phone in missing_phones:
        dir_name = f"Realme_{phone.replace(' ', '_')}"
        guide += f'# mkdir "public/mobile_images/{dir_name}"\n'

    guide += """
# Check current progress:
# ls public/mobile_images/Realme_* | wc -l

# Validate image counts:
# find public/mobile_images/Realme_* -name "*.jpg" -o -name "*.png" | wc -l

## 📊 Progress Tracking:
# Total Realme phones: 69
# Target images per phone: 3
# Total target images: 207
"""

    # Save guide
    with open('REALME_COLLECTION_GUIDE.md', 'w', encoding='utf-8') as f:
        f.write(guide)

    print("✅ Created comprehensive Realme collection guide: REALME_COLLECTION_GUIDE.md")

def create_bulk_download_script():
    """Create a script for bulk downloading from stock photo sites"""

    script = '''#!/bin/bash
# Bulk Realme Image Download Script
# Usage: ./bulk_realme_download.sh

echo "🔍 Starting bulk Realme image collection..."

# Create base directories
mkdir -p public/mobile_images

# List of Realme phones (first 10 as example)
phones=(
    "GT 7 Pro"
    "GT 6"
    "14 Pro+ 5G"
    "13+ 5G"
    "13 5G"
)

# For each phone, create directory and attempt downloads
for phone in "${phones[@]}"; do
    dir_name="Realme_${phone// /_}"
    mkdir -p "public/mobile_images/$dir_name"

    echo "📱 Processing: $phone"

    # Try to download from various sources
    # Note: Replace with actual working URLs

    echo "  ⚠️  Manual download required for: $phone"
    echo "     Save images to: public/mobile_images/$dir_name/"
    echo ""
done

echo "📋 Next steps:"
echo "1. Visit stock photo websites"
echo "2. Search for each Realme phone model"
echo "3. Download 3 high-quality images per phone"
echo "4. Save to appropriate directories"
echo "5. Run validation script"
'''

    with open('bulk_realme_download.sh', 'w') as f:
        f.write(script)

    # Make executable on Unix systems
    try:
        os.chmod('bulk_realme_download.sh', 0o755)
    except:
        pass

    print("✅ Created bulk download script: bulk_realme_download.sh")

def create_validation_script():
    """Create script to validate collected images"""

    script = '''#!/bin/bash
# Realme Image Validation Script

echo "🔍 Validating Realme image collection..."

total_phones=69
total_dirs=$(ls public/mobile_images/ | grep "^Realme_" | wc -l)
total_images=$(find public/mobile_images/Realme_* -name "*.jpg" -o -name "*.png" 2>/dev/null | wc -l)

echo "📊 Collection Status:"
echo "Total Realme phones: $total_phones"
echo "Directories created: $total_dirs"
echo "Images collected: $total_images"

echo ""
echo "📂 Per-phone status:"
for dir in public/mobile_images/Realme_*; do
    if [ -d "$dir" ]; then
        phone=$(basename "$dir" | sed 's/Realme_//')
        count=$(find "$dir" -name "*.jpg" -o -name "*.png" 2>/dev/null | wc -l)
        status="✅"
        if [ "$count" -eq 0 ]; then status="❌"; fi
        printf "%-30s %s (%d images)\\n" "$phone" "$status" "$count"
    fi
done

echo ""
echo "🎯 Completion target: 207 images (3 per phone)"
echo "📈 Current progress: $((total_images * 100 / 207))%"
'''

    with open('validate_realme_images.sh', 'w') as f:
        f.write(script)

    try:
        os.chmod('validate_realme_images.sh', 0o755)
    except:
        pass

    print("✅ Created validation script: validate_realme_images.sh")

def main():
    print("🛠️ Creating Realme image collection tools...")

    create_realme_collection_guide()
    create_bulk_download_script()
    create_validation_script()

    print("\n📋 Files created:")
    print("• REALME_COLLECTION_GUIDE.md - Comprehensive collection guide")
    print("• bulk_realme_download.sh - Bulk download script template")
    print("• validate_realme_images.sh - Progress validation tool")

    print("\n🚀 Quick start:")
    print("1. Read REALME_COLLECTION_GUIDE.md for methods")
    print("2. Visit stock photo websites (Unsplash, Pexels, Pixabay)")
    print("3. Search for 'realme [phone model]' and download images")
    print("4. Save to public/mobile_images/Realme_{Model}/ directories")
    print("5. Run ./validate_realme_images.sh to check progress")

if __name__ == "__main__":
    main()
'''

    with open('scripts/create_realme_tools.py', 'w') as f:
        f.write(script)

    print("✅ Created Realme collection tools script: scripts/create_realme_tools.py")

if __name__ == "__main__":
    main()
