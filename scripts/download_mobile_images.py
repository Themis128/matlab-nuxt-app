"""Automated mobile device image acquisition using existing scraper.

Purpose:
    Replace manual placeholder URL dictionary with integration to the
    `scripts/python/scrape_mobile_images.py` scraper.

Capabilities:
    1. Read `public/dataset_with_images.csv` and identify folder names + expected files.
    2. For specified models (or all referenced in dataset) invoke the scraper's
       `scrape_model_images` logic to attempt image collection.
    3. Provide a dry-run summary of missing image folders and planned actions.

Usage Examples:
    # Dry run for models referenced in ImageOptimizationDemo.vue
    python scripts/download_mobile_images.py --models Apple_iPhone_15_Pro_256GB Huawei_P50_Pocket --dry-run

    # Scrape up to 2 images per listed model
    python scripts/download_mobile_images.py --models Apple_iPhone_15_Pro_256GB Huawei_P50_Pocket --max-images 2

    # Scrape all models found in dataset_with_images.csv that are missing files
    python scripts/download_mobile_images.py --all-missing

Notes:
    - Actual scraping logic lives in `scripts/python/scrape_mobile_images.py`.
    - This wrapper limits scope to selected models for faster iteration.
    - Ensure you have rights to store and distribute scraped images.
    - Use `--dry-run` first to verify targets.
"""
from __future__ import annotations

import argparse
import csv
import importlib
import os
import sys
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List

DATASET_PATHS = [
    os.path.join("public", "dataset_with_images.csv"),
    os.path.join("data", "dataset_with_images.csv"),
]

PUBLIC_ROOT = os.path.join(os.getcwd(), "public", "mobile_images")

@dataclass
class DownloadResult:
    path: str
    status: str  # skipped|downloaded|error|missing|scraped
    detail: str | None = None


def ensure_dir(path: str) -> None:
    if not os.path.isdir(path):
        os.makedirs(path, exist_ok=True)


def read_dataset() -> Dict[str, List[str]]:
    """Parse dataset_with_images.csv and build mapping of folder -> expected files.

    Returns:
        Dict where key is folder name (e.g., Apple_iPhone_15_Pro_256GB) and value is list of filenames.
    """
    mapping: Dict[str, List[str]] = {}
    dataset_path = None
    for p in DATASET_PATHS:
        if os.path.exists(p):
            dataset_path = p
            break
    if not dataset_path:
        return mapping
    with open(dataset_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            image_path = row.get('Image Path')
            if not image_path:
                continue
            # Normalize path separators
            image_path = image_path.replace("\\", "/")
            parts = image_path.split('/')
            if len(parts) < 3:
                continue
            folder = parts[1]
            filename = parts[2]
            mapping.setdefault(folder, []).append(filename)
    return mapping


def ensure_expected_structure(mapping: Dict[str, List[str]]) -> List[DownloadResult]:
    results: List[DownloadResult] = []
    for folder, files in mapping.items():
        folder_path = os.path.join(PUBLIC_ROOT, folder)
        ensure_dir(folder_path)
        for fn in files:
            dest = os.path.join(folder_path, fn)
            if os.path.exists(dest):
                results.append(DownloadResult(dest, "skipped", None))
            else:
                results.append(DownloadResult(dest, "missing", "Needs scrape"))
    return results


def _generate_variants(model_folder: str) -> Iterable[str]:
    """Yield search name variants for a folder.

    Examples:
        Apple_iPhone_15_Pro_256GB ->
            'Apple iPhone 15 Pro 256GB'
            'Apple iPhone 15 Pro'
            'iPhone 15 Pro 256GB'
            'iPhone 15 Pro'
            'Apple iPhone 15 Pro 256 GB'
    """
    base = model_folder.replace('_', ' ').strip()
    yield base
    # Remove storage suffix pattern (e.g. 128GB, 256GB, 512GB, 1TB)
    parts = base.split()
    if parts and parts[-1].upper().endswith(('GB', 'TB')):
        yield ' '.join(parts[:-1])
    # Remove brand (first token) if more than 2 tokens
    if len(parts) > 2:
        yield ' '.join(parts[1:])
        if parts and parts[-1].upper().endswith(('GB', 'TB')):
            yield ' '.join(parts[1:-1])
    # Insert space before storage capacity digits (256GB -> 256 GB)
    if parts and parts[-1].upper().endswith(('GB', 'TB')):
        cap = parts[-1]
        spaced = cap[:-2] + ' ' + cap[-2:]
        yield ' '.join(parts[:-1] + [spaced])


def invoke_scraper_for_models(models: List[str], max_images: int, verbose: bool, show_variants: bool) -> List[DownloadResult]:
    """Call the existing scraper for the given model folder names using variant search names."""
    results: List[DownloadResult] = []
    root_dir = os.getcwd()
    if root_dir not in sys.path:
        sys.path.append(root_dir)
    try:
        scraper_module = importlib.import_module('scripts.python.scrape_mobile_images')
    except ModuleNotFoundError as e:  # noqa: BLE001
        return [DownloadResult('scraper', 'error', f'Could not import scraper: {e}')]
    MobileImageScraper = getattr(scraper_module, 'MobileImageScraper', None)
    if MobileImageScraper is None:
        return [DownloadResult('scraper', 'error', 'MobileImageScraper class not found')]
    # Use relative path so scraper's Path.relative_to('public') calls succeed
    scraper = MobileImageScraper(output_dir=Path('public') / 'mobile_images')

    total = len(models)
    for idx, model_folder in enumerate(models, 1):
        variants = list(dict.fromkeys(_generate_variants(model_folder)))  # preserve order, dedupe
        if show_variants:
            print(f"[VARIANTS] {model_folder}: {variants}")
        success = 0
        last_error = None
        for variant in variants:
            try:
                if verbose:
                    print(f"[SCRAPE] ({idx}/{total}) Trying variant: {variant}")
                data = scraper.scrape_model_images(variant, max_images=max_images)
                success = data.get('success_count', 0) if isinstance(data, dict) else 0
                if success > 0:
                    # Unify folder name if scraper used a different sanitized variant
                    sanitize_fn = getattr(scraper, 'sanitize_filename', None)
                    if callable(sanitize_fn):
                        scraped_folder = sanitize_fn(variant)
                        if scraped_folder != model_folder:
                            # Move files into canonical folder
                            src_dir = Path('public') / 'mobile_images' / scraped_folder
                            dest_dir = Path('public') / 'mobile_images' / model_folder
                            dest_dir.mkdir(parents=True, exist_ok=True)
                            for child in src_dir.glob(f"{scraped_folder}_*.*"):
                                target_name = child.name.replace(scraped_folder, model_folder, 1)
                                child.rename(dest_dir / target_name)
                            # Remove old folder if empty
                            try:
                                if not any(src_dir.iterdir()):
                                    src_dir.rmdir()
                            except Exception:  # noqa: BLE001
                                pass
                    results.append(DownloadResult(model_folder, 'scraped', f'Images: {success} via "{variant}"'))
                    break
            except Exception as e:  # noqa: BLE001
                last_error = str(e)
        if success == 0:
            detail = last_error or 'No images found with any variant'
            results.append(DownloadResult(model_folder, 'error', detail))
    return results


def run(models: List[str], all_missing: bool, max_images: int, dry_run: bool, verbose: bool, show_variants: bool) -> List[DownloadResult]:
    ensure_dir(PUBLIC_ROOT)
    dataset_mapping = read_dataset()
    if all_missing:
        # Determine missing from dataset
        prelim = ensure_expected_structure(dataset_mapping)
        target_models = sorted({os.path.basename(os.path.dirname(r.path)) for r in prelim if r.status == 'missing'})
    else:
        target_models = models
    # If models not specified and not all-missing, default to ones with missing files
    if not target_models and not all_missing:
        prelim = ensure_expected_structure(dataset_mapping)
        target_models = sorted({os.path.basename(os.path.dirname(r.path)) for r in prelim if r.status == 'missing'})
    results: List[DownloadResult] = []
    # Always include structure check summary
    results.extend(ensure_expected_structure({m: dataset_mapping.get(m, []) for m in target_models}))
    if dry_run:
        return results
    # Invoke scraper per model
    results.extend(invoke_scraper_for_models(target_models, max_images=max_images, verbose=verbose, show_variants=show_variants))
    return results


def print_summary(results: List[DownloadResult]) -> None:
    col_widths = {"status": 12, "file": 55}
    print("Status".ljust(col_widths["status"]), "Target".ljust(col_widths["file"]), "Detail")
    print("-" * (sum(col_widths.values()) + 20))
    for r in results:
        path_display = r.path if os.path.isdir(r.path) else os.path.relpath(r.path)
        print(r.status.ljust(col_widths["status"]), path_display.ljust(col_widths["file"]), (r.detail or ""))
    errors = [r for r in results if r.status == 'error']
    if errors:
        print("\nErrors:")
        for e in errors:
            print(f" - {e.path}: {e.detail}")
    missing = [r for r in results if r.status == 'missing']
    if missing:
        print(f"\nMissing before scrape: {len(missing)}")
    scraped = [r for r in results if r.status == 'scraped']
    if scraped:
        print(f"\nScraped models: {len(scraped)}")


def main(argv: List[str]) -> int:
    parser = argparse.ArgumentParser(description="Wrapper around mobile image scraper with variants & progress")
    parser.add_argument("--models", nargs='*', help="Specific model folder names (e.g. Apple_iPhone_15_Pro_256GB)")
    parser.add_argument("--all-missing", action='store_true', help="Operate on all models with missing images per dataset")
    parser.add_argument("--max-images", type=int, default=1, help="Max images to scrape per model")
    parser.add_argument("--dry-run", action='store_true', help="Do not scrape; just show status")
    parser.add_argument("--verbose", action='store_true', help="Detailed progress output for each variant")
    parser.add_argument("--show-variants", action='store_true', help="Print generated variant list for each model")
    args = parser.parse_args(argv)
    results = run(models=args.models or [], all_missing=args.all_missing, max_images=args.max_images, dry_run=args.dry_run, verbose=args.verbose, show_variants=args.show_variants)
    print_summary(results)
    if any(r.status == 'error' for r in results):
        return 1
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main(sys.argv[1:]))
