"""
Optimize image files (PNG, JPG) by compressing without visible quality loss.
Uses Pillow for optimization and conversion to WebP format.
"""
import os
from pathlib import Path
from typing import Dict, List

from PIL import Image


def optimize_png(image_path: str, output_path: str | None = None, quality: int = 85) -> Dict:
    """
    Optimize PNG image by:
    1. Converting to RGB if needed
    2. Saving with optimization
    3. Optionally converting to WebP
    """
    if output_path is None:
        output_path = image_path.replace('.png', '_optimized.png')

    original_size = os.path.getsize(image_path)

    with Image.open(image_path) as img:
        # Convert RGBA to RGB if needed (smaller file)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Create white background for transparency
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # Save as optimized PNG
        img.save(output_path, 'PNG', optimize=True, quality=quality)

    optimized_size = os.path.getsize(output_path)
    reduction = ((original_size - optimized_size) / original_size) * 100

    return {
        'original_size': original_size,
        'optimized_size': optimized_size,
        'reduction_percent': reduction,
        'original_kb': round(original_size / 1024, 2),
        'optimized_kb': round(optimized_size / 1024, 2)
    }

def convert_to_webp(image_path: str, quality: int = 85) -> Dict:
    """Convert image to WebP format (best compression)"""
    output_path = str(image_path).rsplit('.', 1)[0] + '.webp'
    original_size = os.path.getsize(image_path)

    with Image.open(image_path) as img:
        # Convert to RGB if needed
        if img.mode in ('RGBA', 'LA'):
            img = img.convert('RGB')

        img.save(output_path, 'WEBP', quality=quality, method=6)

    webp_size = os.path.getsize(output_path)
    reduction = ((original_size - webp_size) / original_size) * 100

    return {
        'original_size': original_size,
        'webp_size': webp_size,
        'reduction_percent': reduction,
        'original_kb': round(original_size / 1024, 2),
        'webp_kb': round(webp_size / 1024, 2),
        'webp_path': output_path
    }

def optimize_images_in_directory(
    directory: str = 'public/images',
    extensions: List[str] = ['.png', '.jpg', '.jpeg'],
    create_webp: bool = True,
    quality: int = 85
) -> None:
    """Optimize all images in directory"""
    dir_path = Path(directory)

    if not dir_path.exists():
        print(f"❌ Directory not found: {directory}")
        return

    # Find all images
    images = []
    for ext in extensions:
        images.extend(dir_path.glob(f'*{ext}'))

    if not images:
        print(f"ℹ️  No images found in {directory}")
        return

    print(f"🖼️  Found {len(images)} images to optimize\n")

    png_results = []
    webp_results = []

    for img_path in images:
        print(f"Processing: {img_path.name}...")

        try:
            # Optimize PNG/JPG
            if img_path.suffix.lower() == '.png':
                result = optimize_png(str(img_path), quality=quality)
                result['filename'] = img_path.name
                png_results.append(result)
                print(f"  📦 Optimized: {result['original_kb']:.1f} KB → {result['optimized_kb']:.1f} KB "
                      f"({result['reduction_percent']:.1f}% reduction)")

            # Convert to WebP
            if create_webp:
                webp_result = convert_to_webp(str(img_path), quality=quality)
                webp_result['filename'] = img_path.name
                webp_results.append(webp_result)
                print(f"  🌐 WebP: {webp_result['webp_kb']:.1f} KB "
                      f"({webp_result['reduction_percent']:.1f}% smaller)")

        except Exception as e:
            print(f"  ❌ Error: {e}")

    # Summary
    print("\n" + "="*60)
    print("OPTIMIZATION SUMMARY")
    print("="*60)

    if png_results:
        total_original = sum(r['original_size'] for r in png_results)
        total_optimized = sum(r['optimized_size'] for r in png_results)
        total_reduction = ((total_original - total_optimized) / total_original) * 100

        print(f"\nPNG Optimization:")
        print(f"  Original size:   {total_original / 1024:.1f} KB")
        print(f"  Optimized size:  {total_optimized / 1024:.1f} KB")
        print(f"  Space saved:     {(total_original - total_optimized) / 1024:.1f} KB")
        print(f"  Reduction:       {total_reduction:.1f}%")

    if webp_results:
        total_original = sum(r['original_size'] for r in webp_results)
        total_webp = sum(r['webp_size'] for r in webp_results)
        total_reduction = ((total_original - total_webp) / total_original) * 100

        print(f"\nWebP Conversion:")
        print(f"  Original size:   {total_original / 1024:.1f} KB")
        print(f"  WebP size:       {total_webp / 1024:.1f} KB")
        print(f"  Space saved:     {(total_original - total_webp) / 1024:.1f} KB")
        print(f"  Reduction:       {total_reduction:.1f}%")
        print(f"\n💡 {len(webp_results)} WebP files created - update HTML to use them!")

if __name__ == '__main__':
    import sys

    # Default settings
    directory = 'public/images'
    quality = 85
    create_webp = True

    # Parse command line args
    if '--dir' in sys.argv:
        idx = sys.argv.index('--dir')
        directory = sys.argv[idx + 1]

    if '--quality' in sys.argv:
        idx = sys.argv.index('--quality')
        quality = int(sys.argv[idx + 1])

    if '--no-webp' in sys.argv:
        create_webp = False

    print("🔧 IMAGE OPTIMIZATION TOOL\n")
    print(f"Directory: {directory}")
    print(f"Quality: {quality}")
    print(f"Create WebP: {create_webp}\n")

    optimize_images_in_directory(directory, quality=quality, create_webp=create_webp)
